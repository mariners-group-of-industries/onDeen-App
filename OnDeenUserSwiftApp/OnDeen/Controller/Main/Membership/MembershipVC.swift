//
//  MembershipVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 27/12/24.
//

import UIKit

class MembershipVC: UIViewController {
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var skipView: UILabel!
    @IBOutlet weak var upgradeView: UIView!
    var membershipData = MembershipListMembership.init(fromDictionary: [String : Any]()){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var numberOfItems = 2
    var isFromProfile = false
    var isFromRegistration = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        if let membershipCount = UserDefaults.standard.object(forKey: "membershipCount") as? Int{
            backView.isHidden = membershipCount == 0
            skipView.isHidden = membershipCount == 0 
        }else{
            backView.isHidden = true
            skipView.isHidden = true
        }
        tableView.registerNIBs(MembershipOtherCell.self,MembershipPlanCell.self,BookingMaterialHeaderCell.self)
        backView.addTap { r in
            if isEventLogin{
                isEventLogin = false
                self.view.window?.rootViewController?.dismiss(animated: true, completion: nil)
                return
            }
            self.setRootController(board: .main, identifier: .homeVC)
        }
        skipView.addTap { r in
            if isEventLogin{
                isEventLogin = false
                self.view.window?.rootViewController?.dismiss(animated: true, completion: nil)
                return
            }
            self.setRootController(board: .main, identifier: .homeVC)
        }        
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        skipView.isHidden = !getAuthorization.isEmpty
        upgradeView.addTap { r in
            let data = self.membershipData.membership.filter { $0.selected}
            if data.count == 0{
                return
            }
            if data[0].originalPrice.toDouble() == 0.0{
                self.purchaseMembership(id:data[0].id)
                return
            }
            if let vc : MakePaymentVC = self.getController(from: .main){
                vc.membershipData = data[0]
                vc.isFromRegistration = self.isFromRegistration
                if self.isFromRegistration{
                    self.presentVC(vc: vc)
                    return
                }
                self.pushVC(vc: vc)
            }
        }
        triggerMemberLists()
    }
    func purchaseMembership(id:Int){
        MembershipRequest.instance.triggerAddMembership(id: id) { data, status in
            if status{
                UserDefaults.standard.removeObject(forKey: "membershipCount")
                UserDefaults.standard.synchronize()
                let modal = CommonModal.init(fromDictionary: data)
                self.showTSAlert(modal.response.message, "Ok", "", 0) { isCancelled, tag in
                    if isEventLogin{
                        isEventLogin = false
                        self.view.window?.rootViewController?.dismiss(animated: true, completion: nil)
                        return
                    }
                    self.setRootController(board: .main, identifier: .homeVC)
                }
            }
        }
    }

    func triggerMemberLists(){
        MembershipRequest.instance.triggerMembershipList { data, status in
            self.membershipData = data
            delay(1.0) {
                self.tableView.refreshTable()
            }
        }
    }
}
extension MembershipVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 1{
            let data = membershipData.membership.filter { $0.selected}
            return data.count > 0 ? 1 : 0
        }
        return membershipData.membership.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 0{
            let cell = tableView.configureCell(MembershipPlanCell.self, at: indexPath)
            let data = membershipData.membership[indexPath.row]
            cell.lblTitle.text = data.title
            cell.lblSubtitle.text = data.subTitle
            cell.lblPrice.text = data.price
            cell.imgSelect.image = UIImage.init(named: data.selected ? "ic_membership_round_select" : "ic_membership_round")
            cell.bgView.config(cornerRadius: 24.0, borderColor: UIColor.init(hex: data.selected ? "#DB3171" : "#C4C4C4"), borderWidth: 1.0)
            cell.bgView1.isHidden = true
            cell.bgView3.isHidden = true
            if indexPath.row == 0{
                cell.bgView1.isHidden = false
            }else if indexPath.row == 1{
                cell.bgView3.isHidden = false
            }
            cell.offerView.isHidden = indexPath.row != 1
            return cell
        }
        let cell = tableView.configureCell(MembershipOtherCell.self, at: indexPath)
        let data = membershipData.membership.filter { $0.selected}
        if data.count > 0{
            cell.config(data: data[0].descriptionField,items: numberOfItems)
        }else{
            cell.config(data: "",items: numberOfItems)
        }
        cell.viewMoreView.addTap { r in
            self.numberOfItems = self.numberOfItems == 2 ? 0 : 2
            self.tableView.refreshTable()
            delay(1.0) { [self] in
                self.tableView.refreshTable()
            }
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if indexPath.section == 0{
            for item in membershipData.membership{
                item.selected = false
            }
            membershipData.membership[indexPath.row].selected = true
            tableView.refreshTable()
            delay(0.5, function: {
                self.tableView.reloadData()
            })
        }
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingMaterialHeaderCell.self)
        if section == 0{
            cell.configHeader(title: "Choose a plan".localized, subTitle: "")
            cell.lblTitle.textColor = UIColor.black
        }else if section == 1{
            cell.configHeader(title: "Premium benefits", subTitle: "")
        }
        cell.leadingCons.constant = 0
        cell.trailingCons.constant = 0
        cell.backgroundColor = .white
        return cell
    }
}
