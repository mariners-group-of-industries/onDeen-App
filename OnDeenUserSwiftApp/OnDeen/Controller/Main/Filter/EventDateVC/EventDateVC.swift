//
//  EventDateVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 07/02/25.
//

import UIKit

class EventDateVC: UIViewController {
    @IBOutlet weak var tableTop: NSLayoutConstraint!
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var applyView: GlobalGradientView!
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var imgClose: UIImageView!
    @IBOutlet weak var bgView: UIView!
    var items = ["Any Date","Today","Tomorrow","This week","This Month"]
    var selectedIndex = -1
    var filterParam = [String:Any]()
    var itemTapped : (([String:Any]) -> Void)?
    var pageType = 1
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        if pageType == 2{
            lblHeaderTitle.text = "Sort By".localized
            tableTop.constant = 5.0
            items = ["Nearest Distance", "Ongoing Event", "Upcoming Event", "Price High To Low", "Price Low To High"]
            selectedIndex = self.filterParam["sort_Filter"] as? Int ?? 1
            selectedIndex -= 1
            tableView.reloadData()
        }else{
            self.selectedIndex = filterParam["date_filter"] as? Int ?? -1
        }
        tableView.registerNIBs(EventDateCell.self,FilterItemCell.self)
        imgClose.addTap { r in
            self.dismissVC()
        }
        applyView.addTap { r in
            self.applyFilter()
        }
        tableView.estimatedRowHeight = 60.0
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2, execute: {
            self.tableHeight.constant = self.tableView.contentSize.height
        })
    }
    func applyFilter(){
        if self.selectedIndex == -1{
            self.dismissVC()
            return
        }
        if pageType == 2{
            self.filterParam["sort_Filter"] = self.selectedIndex + 1
            self.itemTapped?(self.filterParam)
            self.dismissVC()
            return
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        if selectedIndex == 0{
            filterParam["start_date"] = ""
            filterParam["end_date"] = ""
        }else if selectedIndex == 1{
            filterParam["start_date"] = formatter.string(from: Date())
            filterParam["end_date"] = formatter.string(from: Date())
        }else if selectedIndex == 2{
            let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
            filterParam["end_date"] = formatter.string(from: tomorrow)
            filterParam["start_date"] = formatter.string(from: tomorrow)
        }else if selectedIndex == 3{
            let today = Date()
            let nextWeek = Calendar.current.date(byAdding: .day, value: 7, to: today)!
            filterParam["start_date"] = formatter.string(from: today)
            filterParam["end_date"] = formatter.string(from: nextWeek)
        }else if selectedIndex == 4{
            let calendar = Calendar.current
            let today = Date()

            // Get the first day of the current month
            if let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: today)),
               let endOfMonth = calendar.date(from: DateComponents(
                    year: calendar.component(.year, from: today),
                    month: calendar.component(.month, from: today),
                    day: calendar.range(of: .day, in: .month, for: today)!.upperBound - 1)) {
                
                filterParam["start_date"] = formatter.string(from: startOfMonth)  // 1st of the month
                filterParam["end_date"] = formatter.string(from: endOfMonth)      // Last day of the month
            } else {
                let fallbackStart = Date()
                let fallbackEnd = calendar.date(byAdding: .day, value: 30, to: fallbackStart)!
                filterParam["start_date"] = formatter.string(from: fallbackStart)
                filterParam["end_date"] = formatter.string(from: fallbackEnd)
            }
        }
        self.filterParam["date_filter"] = self.selectedIndex
        self.itemTapped?(self.filterParam)
        self.dismissVC()
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        self.view.setAlphaBackground()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
    }
}
extension EventDateVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return items.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if pageType == 2{
            let cell = tableView.configureCell(FilterItemCell.self, at: indexPath)
            cell.showAllStack.isHidden = true
            cell.imgRightArrow.isHidden = true
            cell.subView.tag = indexPath.section
            cell.subView.accessibilityHint = "\(indexPath.row)"
            cell.lineCons.constant = 0.0
            cell.lblTitle.isHidden = indexPath.row > 0
            cell.lblTitle.text = ""
            cell.lblSubtitle.text = items[indexPath.row]

            cell.imgCheck.image = UIImage(named: selectedIndex == indexPath.row ? "ic_circle_round_selected" : "ic_circle_round")
            cell.lblLine.isHidden = true //indexPath.row + 1 != data
            return cell
        }
        let cell = tableView.configureCell(EventDateCell.self, at: indexPath)
        cell.lblTitle.text = items[indexPath.row]
        cell.bgView.isHidden = selectedIndex != indexPath.row
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        selectedIndex = indexPath.row
        tableView.reloadData()
    }
}
