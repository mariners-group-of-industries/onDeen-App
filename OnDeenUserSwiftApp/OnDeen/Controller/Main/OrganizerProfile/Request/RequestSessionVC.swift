//
//  RequestSessionVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 10/02/25.
//

import UIKit

class RequestSessionVC: UIViewController {
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var applyView: GlobalGradientView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    var speakerDetail = EventDetailSpeaker.init(fromDictionary: [String : Any]())
    var dateModelLists = [DateModel]()
    var timeModelLists = [TimeModel]()
    var morningSlots = [TimeModel]()
    var eveningSlots = [TimeModel]()
    var sessionParam = [String:Any]()
    var isEditSession = false
    var itemTapped : (() -> Void)?
    var timeZone : String = ""
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        mainThread { [self] in
            if isEditSession{
                lblHeaderTitle.text = "Update a Session"
            }
        }
        tableView.registerNIBs(SelectDateTableViewCell.self,BookingHeaderCell.self,SessionCommentCell.self,EmptySlotCell.self)
        backView.addTap { r in
            self.dismissVC()
        }
        let calendar = Calendar.current
        let today = Date()
        for i in 0..<365 {
            if let futureDate = calendar.date(byAdding: .day, value: i, to: today) {
                let formatter = DateFormatter()
                formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
                formatter.timeZone = TimeZone(identifier: "UTC") // Ensure correct timezone
                formatter.locale = Locale(identifier: "en_US_POSIX") // Use a reliable locale
                let modal = DateModel.init(fromDictionary: ["date" : formatter.string(from: futureDate)])
                modal.status = 1
                dateModelLists.append(modal)
            }
        }
        applyView.addTap { r in
            if self.checkValidation(){
                print(JSON(self.sessionParam))
                if self.isEditSession{
                    ProfileRequest.instance.triggerUpdateBookedSession(param: self.sessionParam) { response, status in
                        if status{
                            Utils.showToast(message: response.message)
                            self.itemTapped?()
                            self.dismissVC()
                        }
                    }
                    return
                }
                EventRequest.instance.triggerRequestSession(param: self.sessionParam) { response, status in
                    if status{
                        self.showTSAlert(response.message, "Ok","",0) { isCancelled, tag in
                            self.dismissVC()
                        }
                    }
                }
            }
        }
        dateModelLists[0].selected = true
        triggerGetSlots()
    }
    func checkValidation() -> Bool{
        let filterDate = dateModelLists.filter { $0.selected}
        if filterDate.count == 0{
            Utils.showToast(message: "Please select the date")
            return false
        }
        let morningSlot = morningSlots.filter { $0.isSelected}
        let eveningSlot = eveningSlots.filter { $0.isSelected}
        if morningSlot.count == 0 && eveningSlot.count == 0{
            Utils.showToast(message: "Please select the slot")
            return false
        }
        sessionParam["date"] = filterDate[0].serverDate
        if morningSlot.count > 0{
            sessionParam["time"] = morningSlot[0].startTime
        }
        if eveningSlot.count > 0{
            sessionParam["time"] = eveningSlot[0].startTime
        }
        if let cell = tableView.cellForRow(at: IndexPath.init(row: 0, section: 3)) as? SessionCommentCell{
            sessionParam["user_comment"] = cell.textVew.text ?? ""
        }
        return true
    }
    func triggerGetSlots(){
        self.handleButton()
        let filter = dateModelLists.filter { $0.selected == true}
        if filter.count > 0{
            EventRequest.instance.triggerGetSpeakersSlots(param: ["id" : speakerDetail.id ?? 0,"date":filter[0].serverDate]) { (morning,evening, status,zone) in
                self.timeZone = zone
                self.morningSlots = morning
                self.eveningSlots = evening
                self.handleButton()
                self.tableView.reloadData()
            }
        }
    }
    func handleButton(){
        self.applyView.isUserInteractionEnabled = true
        self.applyView.alpha = 1.0
        if self.morningSlots.count == 0 && eveningSlots.count == 0{
            self.applyView.isUserInteractionEnabled = false
            self.applyView.alpha = 0.7
        }
    }
}
extension RequestSessionVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        if self.morningSlots.count == 0 && eveningSlots.count == 0{
            return 2
        }
        return isEditSession ? 3 : 4
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if self.morningSlots.count == 0 && eveningSlots.count == 0{
            return 1
        }
        if section == 0{
            return 1
        }else if section == 1 && self.morningSlots.count > 0{
            return 1
        }else if section == 2 && self.eveningSlots.count > 0{
            return 1
        }else if section == 3{
            return 1
        }
        return 0
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if self.morningSlots.count == 0 && eveningSlots.count == 0 && indexPath.section == 1{
            let cell = tableView.configureCell(EmptySlotCell.self, at: indexPath)
            let getDate = sessionParam["next_available_date"] as? String ?? ""
            let getDateFormat = getDate.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "EEE, dd MMM", timeZone: self.timeZone)
            cell.availableFromLabel.text = "Available from \(getDateFormat)"
            cell.nextDateLabel.superview?.isHidden = getDate.isEmpty
            cell.nextDateLabel.superview?.addTap(function: { r in
                let availableDate = self.sessionParam["next_available_date"] as? String ?? ""
                for item in 0..<self.dateModelLists.count{
                    let getDate = self.dateModelLists[item].serverDate
                    if getDate == availableDate{
                        self.dateModelLists.forEach{$0.selected = false}
                        self.dateModelLists[item].selected = true
                        self.tableView.reloadData()
                        self.triggerGetSlots()
                        break
                    }
                }
                

            })
            return cell
        }
        if indexPath.section == 0{
            let cell = tableView.configureCell(SelectDateTableViewCell.self, at: indexPath)
            cell.labelTitle.isHidden = true
            cell.configure(for: dateModelLists)
            cell.itemTapped = { [weak self] index in
//                self?.selectedDateTimeId = ""
                self?.didSelectDate(at: index)
            }
            return cell
        }else if indexPath.section == 3{
            let cell = tableView.configureCell(SessionCommentCell.self, at: indexPath)
            return cell
        }
        let cell = tableView.configureCell(SelectDateTableViewCell.self, at: indexPath)
        cell.labelTitle.isHidden = false
        cell.tag = 100000
        if indexPath.section == 1 && self.morningSlots.count > 0{
            cell.labelTitle.text = "Morning Slots"
            cell.configure(for: morningSlots, selectedQuantity: 1,timeZone:self.timeZone)
            cell.bottomLineView.isHidden = self.eveningSlots.count > 0
        }else if indexPath.section == 2 && self.eveningSlots.count > 0{
           cell.labelTitle.text = "Evening Slots"
           cell.configure(for: eveningSlots, selectedQuantity: 1,timeZone:self.timeZone)
        }
        cell.bottomCons.constant = 12.0
         cell.labelTitle.font = Fonts.SFProRegular(10.0)
         cell.labelTitle.textColor = UIColor.init(hex: "#545454")
        cell.collectionView.tag = indexPath.section
         cell.itemTapped = { index in

         }
        cell.timeTapped = { (section,index) in
            if section == 1{
                for item in self.morningSlots{
                    item.isSelected = false
                }
                for item in self.eveningSlots{
                    item.isSelected = false
                }
                if self.morningSlots.count > index{
                    self.morningSlots[index].isSelected = true
                }
                tableView.reloadData()
            }else if section == 2{
                for item in self.morningSlots{
                    item.isSelected = false
                }
                for item in self.eveningSlots{
                    item.isSelected = false
                }
                if self.eveningSlots.count > index{
                    self.eveningSlots[index].isSelected = true
                }
                tableView.reloadData()
            }
         }
         return cell
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingHeaderCell.self)
        cell.config(title: section == 0 ? "Select a date" : "Select time slot")
        cell.lblTitle.font = Fonts.SFProMedium(14.0)
        cell.lblTitle.textColor = UIColor.init(hex: "#161616")
        cell.backgroundColor = UIColor.init(hex: "#F9F6FD")
        cell.bottomView.constant = section == 0 ? 0.0 : 15.0
        cell.topViewCons.constant = section == 0 ? 0.0 : 0.0
        return cell
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if section == 1{
            if morningSlots.count == 0{
                return 0
            }
        }else if section == 2{
            if eveningSlots.count == 0{
                return 0
            }
        }
        if section == 2 || section  == 3{
            return 0
        }
        return UITableView.automaticDimension
    }
    private func didSelectDate(at index: Int){
        dateModelLists.forEach{$0.selected = false}
        dateModelLists[index].selected = true
        self.tableView.reloadData()
        triggerGetSlots()
    }
}
