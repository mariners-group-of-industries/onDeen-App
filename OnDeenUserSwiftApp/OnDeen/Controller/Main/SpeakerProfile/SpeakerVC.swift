//
//  SpeakerVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class SpeakerVC: UIViewController {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var moreView: UIStackView!
    @IBOutlet weak var backView: UIStackView!
    var speakerData = EventDetailSpeaker.init(fromDictionary: [String : Any]())
    var speakerDetail = SpeakerProfileResponse.init(fromDictionary: [String : Any]()){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var wishlistTapped : ((HomePageEvent) -> Void)?
    var reviewsData: [EventReview] = []{
        didSet{
            self.tableView.refreshTable()
        }
    }


    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        tableView.registerNIBs(SpeakerInfoCell.self,EventListCell.self,OrganizerReviewCell.self)
        backView.addTap { r in
            self.popVC()
        }
        getProfile()
    }
    func getProfile(){
        EventRequest.instance.triggerGetSpeaker(id: speakerData.userId) { response, status in
            self.speakerDetail = response
            self.speakerDetail.speakerId = self.speakerData.userId
            self.speakerDetail.speakerEventId = self.speakerData.eventId
            if self.speakerDetail.eventList != nil{
                for item in self.speakerDetail.eventList.events{
                    if item.id == self.speakerData.eventId{
                        self.wishlistTapped?(item)
                    }
                }
            }
            self.triggerFetchRating()
        }
    }
    func triggerFetchRating(){
        ProfileRequest.instance.fetchUserRatingProfile(userId: speakerData.userId) { data, status in
            self.reviewsData = data
        }
    }
}
extension SpeakerVC:UITableViewDelegate,UITableViewDataSource{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 1{
            if self.speakerDetail.eventList != nil{
                return self.speakerDetail.eventList.events.count > 0 ? 1 : 0
            }
            return 0
        }
        if section == 2 && reviewsData.count == 0{
            return 1
        }
        return section == 2 ? self.reviewsData.count : 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 2{
            let cell = tableView.configureCell(OrganizerReviewCell.self, at: indexPath)
            cell.infoView.isHidden = false
            cell.lblRateUserTitle.text = "RATE SPEAKER"
            if reviewsData.count == 0{
                cell.lblTotalReviews.text = "\(self.reviewsData.count) reviews"
                cell.infoView.isHidden = true
                cell.organizerStack.isHidden = true
                cell.rateView.addTap { r in
                    if let vc:UserReviewVC = self.getController(from: .main){
                        vc.speakerDetail = self.speakerDetail
                        vc.itemTapped = {
                            self.triggerFetchRating()
                        }
                        self.presentVC(vc: vc)
                    }
                }
                return cell
            }
            cell.reviewView.isHidden = indexPath.row > 0
            cell.config(data: reviewsData[indexPath.row])
//            let name = self.speakerDetail.userFirstName + " " + self.speakerDetail.userLastName
            cell.lblOrgTitle.text = ""
            cell.lblTotalReviews.text = "\(self.reviewsData.count) reviews"
            cell.rateView.isHidden = true
            cell.imgStar.isHidden = true
            cell.rateView.isHidden = false
            cell.rateView.addTap { r in
                if let vc:UserReviewVC = self.getController(from: .main){
                    vc.speakerDetail = self.speakerDetail
                    vc.itemTapped = {
                        self.triggerFetchRating()
                    }
                    self.presentVC(vc: vc)
                }
            }
            cell.organizerStack.isHidden = false
            return cell
        }
        if indexPath.section == 1{
            let cell = tableView.configureCell(EventListCell.self, at: indexPath)
            cell.config(type: 1)
            cell.configureData(data: self.speakerDetail.eventList.events)
            cell.eventTapped = { (tag,index) in
                self.navigateToEvent(index:index)
            }
            cell.wishTapped = { index in
                self.triggerToAddWishlist(index: index)
            }
            cell.eventItemTapped = { (tag,index) in
                self.triggerToAddWishlist(index: index)
            }
            let name = self.speakerDetail.userFirstName + " " + self.speakerDetail.userLastName
            let namee = "Events By".localized + " \(name)"
            cell.headerTitle.html2String(string: namee, customFont: Fonts.SFProBold(18.0), color: UIColor.init(hex: "#0E0D0E"))
            cell.topCons.constant = 10.0
            return cell
        }
        let cell = tableView.configureCell(SpeakerInfoCell.self, at: indexPath)
        cell.configExperts(data: self.speakerDetail.expertise)
        let name = self.speakerDetail.userFirstName + " " + self.speakerDetail.userLastName
        cell.lblTitle.text = name
        cell.imgProfile.loadAsyncImageWithPlaceholder(loadURL: self.speakerDetail.userProfileImage, placeHolder: "ic_profile_crop")
        cell.lblAboutTitle.text = "About \(name)".localized
        cell.lblAboutSubtitle.html2String(string: self.speakerDetail.aboutUs,customFont: Fonts.SFProRegular(12.0),color:UIColor.init(hex: "#545454"))
        cell.aboutStack.isHidden = self.speakerDetail.aboutUs.isEmpty
        cell.aboutBottom.constant = 0.0
        cell.lblSubtitle.numberOfLines = 0//speakerDetail.numberOfAbout
        cell.lblReadMore.addTap { r in
            self.speakerDetail.numberOfAbout = self.speakerDetail.numberOfAbout == 0 ? 2 : 0
            self.tableView.refreshTable()
        }
        cell.lblReadMore.isHidden = speakerDetail.aboutUs.isEmpty
        cell.requestSessison.addTap { r in
            if self.isGuestUser(){
                self.showGuestLogin()
                return
            }
            self.triggerRequestSession()
        }
        cell.requestSessison.isHidden = speakerDetail.slotCount == 0
        return cell
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let headerView = UIView()
        headerView.backgroundColor = UIColor.init(hex: "#FDFBFF")
        let titleLabel = UILabel()
        titleLabel.text = " Reviews"
        titleLabel.font = Fonts.SFProBold(18.0)
        titleLabel.textColor = UIColor.init(hex: "#0E0D0E")
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        headerView.addSubview(titleLabel)
        
        // Constraints (top-left with some padding)
        NSLayoutConstraint.activate([
            titleLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 16),
            titleLabel.topAnchor.constraint(equalTo: headerView.topAnchor, constant: 8),
            titleLabel.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -16),
            titleLabel.bottomAnchor.constraint(equalTo: headerView.bottomAnchor, constant: -8)
        ])
        
        return headerView
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        return section == 2 ? UITableView.automaticDimension : 0.0
    }

    func triggerRequestSession(){
        if let vc: RequestSessionVC = self.getController(from: .main) {
            vc.speakerDetail = self.speakerData
            vc.sessionParam = ["event_id":self.speakerData.eventId ?? 0,"type":2,"speaker_id":speakerData.id ?? 0,"next_available_date":speakerDetail.nextAvailableDate ?? ""]
            self.presentVC(vc: vc)
        }
    }
    func navigateToEvent(index:Int){
        if let vc: EventDetailController = self.getController(from: .main) {
            vc.eventData = self.speakerDetail.eventList.events[index]
            vc.wishlistTapped = {
                self.speakerDetail.eventList.events[index].isWishlisted = self.speakerDetail.eventList.events[index].isWishlisted == 1 ? 0 : 1
                self.tableView.refreshTable()
            }
            self.pushVC(vc: vc)
        }
    }
    func triggerToAddWishlist(index:Int){
            if self.isGuestUser(){
            self.showGuestLogin()
            return
        }
        var id = 0
        if let eventList = self.speakerDetail.eventList, index < eventList.events.count {
            id = eventList.events[index].id
        }
        let param: [String: Any] = ["event_id": id]
        EventRequest.instance.triggerWishlistEvent(param: param) { response, status in
            self.getProfile()
        }
    }
}
