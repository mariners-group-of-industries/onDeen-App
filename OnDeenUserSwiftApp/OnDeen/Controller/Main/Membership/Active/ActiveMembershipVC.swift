//
//  ActiveMembershipVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 30/12/24.
//

import UIKit

class ActiveMembershipVC: UIViewController {
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var lblUpgrade: UILabel!
    @IBOutlet weak var tableView: UITableView!
    var membershipData = [MYMembershipMembership](){
        didSet{
            self.tableView.refreshTable()
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        backView.addTap { r in
            self.popVC()
        }
        lblUpgrade.addTap { r in
            if let vc:MembershipVC = self.getController(from: .main){
                vc.isFromProfile = true
                self.pushVC(vc: vc)
            }
        }
        tableView.registerNIBs(ActiveMembershipCell.self,MembershipOtherCell.self,BookingMaterialHeaderCell.self)
        triggerMembership()
    }
    func triggerMembership(){
        MembershipRequest.instance.triggerMyMembership() { data, status in
            self.membershipData = data
        }
    }
}
extension ActiveMembershipVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return self.membershipData.count > 0 ? 1 : 0
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return section == 0 ? self.membershipData.count : 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 1{
            let cell = tableView.configureCell(MembershipOtherCell.self, at: indexPath)
            return cell
        }
        let cell = tableView.configureCell(ActiveMembershipCell.self, at: indexPath)
        let data = self.membershipData[indexPath.row]
        cell.lblTitle.text = data.title
        cell.lblSubtitle.text = data.subTitle
        cell.lblStart.text = "Starts :".localized + " " + data.purchasedOn.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd-MMM-yyyy", timeZone: data.time_zone)
        cell.lblEnd.text = "Renew date:".localized + " " + data.endsOn.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd-MMM-yyyy", timeZone: data.time_zone)
        return cell
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingMaterialHeaderCell.self)
        if section == 0{
            cell.configHeader(title: "Active".localized, subTitle: "")
            cell.lblTitle.textColor = UIColor.black
        }else if section == 1{
            cell.configHeader(title: "You have access to:", subTitle: "")
            cell.lblTitle.applyGradient(colors:[UIColor.init(hex: "#F4F4F4"),UIColor.init(hex: "#FFCC33"),UIColor.init(hex: "#DB3171"),UIColor.init(hex: "#422199")])
        }
        cell.leadingCons.constant = 0
        cell.trailingCons.constant = 0
        cell.backgroundColor = .white
        return cell
    }
}
