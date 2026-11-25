//
//  OneSessionVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 11/02/25.
//

import UIKit

class OneSessionVC: UIViewController {
    @IBOutlet weak var searchHeight: NSLayoutConstraint!
    @IBOutlet weak var fieldSearch: SFProField!
    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    var presentLists = [SessionListResponse]()
    var futureLists = [SessionListResponse]()
    var isViewLoads = false
    var sessionId = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        notificationType = ""
        notificationID = 0

        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        tableView.registerNIBs(OneSessionCell.self,BookingHeaderCell.self,CalanderNoEventCell.self)
        backView.addTap { r in
            self.popVC()
        }
        fieldSearch.onReturns {
            self.fieldSearch.resignFirstResponder()
        }
        fieldSearch.onChange { text in
            self.triggerRequests(text: text)
        }
        self.triggerRequests(text:"")
    }
    func triggerRequests(text:String){
        self.futureLists = []
        self.presentLists = []
        ProfileRequest.instance.triggerGetBookedSession(param: ["type":2]) { data,data1, status in
            if status{
                if text.isEmpty{
                    self.presentLists = data
                    self.futureLists = data1
                }else{
                    self.presentLists = data.filter {
                        $0.speakerFirstname?.localizedCaseInsensitiveContains(text) ?? false ||
                        $0.speakerLastName?.localizedCaseInsensitiveContains(text) ?? false ||
                        $0.date.localizedCaseInsensitiveContains(text) ||
                        $0.time.localizedCaseInsensitiveContains(text)
                    }
                    self.futureLists = data1.filter {
                        $0.speakerFirstname?.localizedCaseInsensitiveContains(text) ?? false ||
                        $0.speakerLastName?.localizedCaseInsensitiveContains(text) ?? false ||
                        $0.date.localizedCaseInsensitiveContains(text) ||
                        $0.time.localizedCaseInsensitiveContains(text)}
                }
                self.isViewLoads = true
                self.tableView.refreshTable()
                if self.sessionId > 0{
                    delay(0.25) {
                        self.presentSessionManually(with: self.sessionId)
                    }
                }
                if self.presentLists.count == 0 && self.futureLists.count == 0 && self.isViewLoads{
                    self.searchHeight.constant = 0.1
                    self.searchView.isHidden = true
                }
            }
        }
    }
    func presentSessionManually(with sessionId: Int) {
        // Search in present lists
        if let session = presentLists.first(where: { $0.id == sessionId }) {
            openSessionDetail(with: session)
            return
        }

        // Search in future lists
        if let session = futureLists.first(where: { $0.id == sessionId }) {
            openSessionDetail(with: session)
            return
        }
    }
    func openSessionDetail(with session: SessionListResponse) {
        guard session.status != 2 else { return }

        if let vc: OneSessionDetailVC = self.getController(from: .main) {
            vc.sessionData = session
            vc.itemTapped = {
                self.triggerRequests(text: "")
            }
            vc.reassingTapped = { data in
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    if let reassignVC: RequestSessionVC = self.getController(from: .main) {
                        reassignVC.speakerDetail = EventDetailSpeaker(fromDictionary: ["id": data.speakerId ?? 0])
                        reassignVC.sessionParam = [
                            "event_id": data.eventId ?? 0,
                            "type": 2,
                            "speaker_id": data.speakerId ?? 0,
                            "id": data.id ?? 0
                        ]
                        reassignVC.itemTapped = {
                            self.triggerRequests(text: "")
                        }
                        reassignVC.isEditSession = true
                        self.presentVC(vc: reassignVC)
                    }
                }
            }
            self.presentVC(vc: vc)
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        searchView.config(isRoundCorner: true)
    }
}
extension OneSessionVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        if self.presentLists.count == 0 && self.futureLists.count == 0 && isViewLoads{
            return 1
        }
        return 2
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if self.presentLists.count == 0 && self.futureLists.count == 0 && isViewLoads{
            return 1
        }
        return section == 0 ? self.presentLists.count : self.futureLists.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if self.presentLists.count == 0 && self.futureLists.count == 0 && isViewLoads{
            let cell = tableView.configureCell(CalanderNoEventCell.self, at: indexPath)
            cell.lblTitle.text = "NO RESULTS FOUND".localized
            cell.lblSubtitle.text = ""
            cell.exploreView.isHidden = true
            return cell
        }
        let cell = tableView.configureCell(OneSessionCell.self, at: indexPath)
        var data = SessionListResponse.init(fromDictionary: [String : Any]())
        if indexPath.section == 0{
            data = self.presentLists[indexPath.row]
        }else{
            data = self.futureLists[indexPath.row]
        }
        cell.imgJoinLogo.isHidden = data.status == 2
        cell.lblJoinMeeting.text = data.status == 2 ? "Cancelled".localized : "Join Meeting".localized
        
        cell.lblTitle.text = "\(data.speakerFirstname ?? "") \(data.speakerLastName ?? "")"
        let startDate = "\(data.date.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "EEE, dd MMM yyyy", timeZone: data.time_zone))"
        let startTime = "\(data.time.convertTimeOnly(startDate: data.date, startTimeString: data.time, timeZone: data.time_zone))"
//        let startTime = "\(data.time.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "hh:mm a", timeZone: data.time_zone))"
        cell.lblDate.text = startDate + ", " + startTime
        cell.imgView.loadAsyncImageWithPlaceholder(loadURL: data.speakerImage, placeHolder: "ic_profile_crop")
        cell.joinStack.tag = indexPath.row
        cell.joinStack.accessibilityHint = "\(indexPath.section)"
        cell.joinStack.addTap { r in
            let getSection = Int(r.view?.accessibilityHint ?? "") ?? 0
            let getRow = r.view?.tag ?? 0
            var link = SessionListResponse.init(fromDictionary: [String : Any]())
            if getSection == 0{
                link = self.presentLists[getRow]
            }else{
                link = self.futureLists[getRow]
            }
            if link.meetLink.isEmpty{
                Utils.showToast(message: "Meet link not exist")
            }else{
                self.openBrowser(urlString: link.meetLink)
            }
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let status = indexPath.section == 0 ? self.presentLists[indexPath.row].status : self.futureLists[indexPath.row].status
        if status == 2{
            return
        }
        if let vc: OneSessionDetailVC = self.getController(from: .main) {
            vc.sessionData = indexPath.section == 0 ? self.presentLists[indexPath.row] : self.futureLists[indexPath.row]
            vc.itemTapped = {
                self.triggerRequests(text:"")
            }
            vc.reassingTapped = { data in
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2, execute: {
                    if let vc: RequestSessionVC = self.getController(from: .main) {
                        vc.speakerDetail = EventDetailSpeaker.init(fromDictionary: ["id" : data.speakerId ?? 0])
                        vc.sessionParam = ["event_id":data.eventId ?? 0,"type":2,"speaker_id":data.speakerId ?? 0,"id":data.id ?? 0]
                        vc.itemTapped = {
                            self.triggerRequests(text: "")
                        }
                        vc.isEditSession = true
                        self.presentVC(vc: vc)
                    }
                })
            }
            self.presentVC(vc: vc)
        }
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingHeaderCell.self)
        cell.config(title: section == 0 ? "Upcoming Session" : "Completed Session")
        cell.lblTitle.font = Fonts.SFProMedium(16.0)
        cell.lblTitle.textColor = UIColor.init(hex: "#161616")
        cell.backgroundColor = UIColor.init(hex: "#F9F6FD")
        cell.bottomView.constant = section == 0 ? 0.0 : 0.0
        cell.topViewCons.constant = section == 0 ? 0.0 : 15.0
        return cell
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if section == 0 && presentLists.count == 0{
            return 0
        }
        if section == 1 && futureLists.count == 0{
            return 0
        }
        return UITableView.automaticDimension
    }
}
