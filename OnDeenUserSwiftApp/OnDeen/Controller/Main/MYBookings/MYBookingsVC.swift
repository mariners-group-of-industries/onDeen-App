//
//  MYBookingsVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class MYBookingsVC: UIViewController {
    @IBOutlet weak var lblActiveBookings: SFProLabel!
    @IBOutlet weak var lblCompletedBookings: SFProLabel!
    @IBOutlet weak var tabView: UIView!
    @IBOutlet weak var tableView: UITableView!
    var weekEvents = [HomePageEvent](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var activeEvents = [HomePageEvent](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var completedEvents = [HomePageEvent](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var bookingType = 2{
        didSet{
            self.configureTab()
        }
    }
    let refreshControl = UIRefreshControl()
    var appearView : Bool = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        tableView.registerNIBs(BookingBannerCell.self,BookingHeaderCell.self,BookingActiveCell.self)
        lblActiveBookings.addTap { r in
            self.triggerActiveBookings(type: 0)
            self.bookingType = 1
        }
        lblCompletedBookings.addTap { r in
            self.triggerActiveBookings(type: 3)
            self.bookingType = 3
        }
        refreshControl.addTarget(self, action: #selector(refreshData), for: .valueChanged)
        tableView.refreshControl = refreshControl
        triggerActiveBookings()
    }
    override func viewWillAppear(_ animated: Bool) {
        if !appearView{
            appearView = true
            return
        }
        self.triggerActiveBookings(type: self.bookingType == 1 ? 0 : self.bookingType)
    }
    @objc func refreshData() {
        self.triggerActiveBookings(type: self.bookingType == 1 ? 0 : self.bookingType)
    }
    func triggerActiveBookings(type:Int = 0){
        self.tableView.backgroundView = UIView()
        BookingRequest.instance.triggerBookedEvents(param: self.generateDatePayload(type:type)) { response, status in
            self.refreshControl.endRefreshing()
            if type == 0{
                self.weekEvents = response
                self.triggerActiveBookings(type: 2)
            }else if type == 2{
                self.activeEvents = response
                self.checkPlaceholders()
            }else if type == 3{
                self.completedEvents = response
                self.checkPlaceholders()
            }
        }
    }
    func checkPlaceholders(){
        if bookingType == 3{
            if self.completedEvents.count == 0 {
                self.tableView.showPlaceHolder(type: .noCompletedBookings)
            }
        }else{
            if self.weekEvents.count == 0 && self.activeEvents.count == 0{
                self.tableView.showPlaceHolder(type: .noActiveBookings)
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        tabView.config(isRoundCorner: true)
        lblActiveBookings.config(isRoundCorner: true)
        lblCompletedBookings.config(isRoundCorner: true)
    }
    func configureTab(){
        lblActiveBookings.textColor = bookingType == 1 ? UIColor.init(hex: "#17101F") : UIColor.init(hex: "#545454")
        lblCompletedBookings.textColor = bookingType == 3 ? UIColor.init(hex: "#17101F") : UIColor.init(hex: "#545454")
        lblActiveBookings.backgroundColor = bookingType == 1 ? UIColor.init(hex: "#F9F6FD") : UIColor.clear
        lblCompletedBookings.backgroundColor = bookingType == 3 ? UIColor.init(hex: "#F9F6FD") : UIColor.clear
    }

    func generateDatePayload(type:Int = 0) -> [String: Any] {
        let calendar = Calendar.current
        let today = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd" // Ensure the format matches the required format
        let fromDate = formatter.string(from: today) // Today's date
        let toDate = formatter.string(from: calendar.date(byAdding: .day, value: 7, to: today)!) // 7 days from today
        // Create the payload
        if type != 0{
            let payload: [String: Any] = ["type": type]
            return payload
        }
        let payload: [String: Any] = [
            "type": 1,
            "from_date": fromDate,
            "to_date": toDate
        ]
        return payload
    }
}
extension MYBookingsVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return bookingType == 3 ? 1 : 2
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return bookingType == 3 ? completedEvents.count : section == 1 ? activeEvents.count :  self.weekEvents.count > 0 ? 1 : 0
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 1 || bookingType == 3{
            let cell = tableView.configureCell(BookingActiveCell.self, at: indexPath)
            let data = bookingType == 3 ? completedEvents[indexPath.row] : activeEvents[indexPath.row]
            cell.config(data: bookingType == 3 ? completedEvents[indexPath.row] : activeEvents[indexPath.row])
//            cell.lblConfirmed.isHidden = bookingType == 3 ? data.status != 2 : false
            cell.lblConfirmed.isHidden = false
            if data.status == 1 && bookingType == 3{
                cell.lblConfirmed.text = "Completed".localized
                cell.lblConfirmed.textColor = UIColor.systemBlue
            }else if data.status == 4 && bookingType == 3 || data.status == 2 && bookingType == 3{
                cell.lblConfirmed.text = "Cancelled".localized
                cell.lblConfirmed.textColor = UIColor.red
            }else if data.status == 1 && bookingType == 1 || data.status == 1 && bookingType == 2{
                cell.lblConfirmed.text = "Confirmed".localized
                cell.lblConfirmed.textColor = UIColor.systemGreen
            }else{
                cell.lblConfirmed.isHidden = true
            }
            return cell
        }
        let cell = tableView.configureCell(BookingBannerCell.self, at: indexPath)
        cell.configEvent(data: self.weekEvents)
        cell.eventTapped = { index in
            if let vc: BookingDetailVC = self.getController(from: .main) {
                vc.eventData = self.weekEvents[index]
                self.pushVC(vc: vc)
            }
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
//        #if DEBUG
//        LocationPermissionManager.shared.checkPermission { allowed in
//            guard allowed else {
//                self.showLocationPermissionPopup()
//                return
//            }
//
//            Utils.showToast(message: "succc")
//        }
//
//        #else
        if indexPath.section == 1 || bookingType == 3{
            if let vc: BookingDetailVC = self.getController(from: .main) {
                vc.eventData = bookingType == 3 ? completedEvents[indexPath.row] : activeEvents[indexPath.row]
                vc.isCompletedBooking = bookingType == 3
                self.pushVC(vc: vc)
            }
        }

        
//        #endif
    }
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        let cellHeight = UIScreen.main.bounds.height / 100 * 30
        return indexPath.section == 1 || bookingType == 3 ? 100 : cellHeight
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingHeaderCell.self)
        cell.config(title: bookingType == 3 ? "COMPLETED BOOKINGS" : section == 1 ? "ON GOING BOOKINGS" : "UPCOMING BOOKINGS")
        cell.backgroundColor = UIColor.init(hex: "#F9F6FD")
        return cell
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if bookingType == 2 || bookingType == 1{
            if section == 0 && weekEvents.count == 0{
                return 0
            }else if section == 1 && activeEvents.count == 0{
                return 0
            }
        }else{
            if completedEvents.count == 0{
                return 0
            }
        }
        return UITableView.automaticDimension
    }
}

