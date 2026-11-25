//
//  SpeakerVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//


//
//  SpeakerVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class OrganizerProfileVC: UIViewController {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var moreView: UIStackView!
    @IBOutlet weak var backView: UIStackView!
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var profileData = OrganizerDetailResponse.init(fromDictionary: [String : Any]()){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var itemTapped : (() -> Void)?
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
        tableView.registerNIBs(SpeakerInfoCell.self,EventListCell.self,OrganizerReviewCell.self,BookingMaterialHeaderCell.self)
        backView.addTap { r in
            self.popVC()
        }
        triggerGetProfile()
    }
    func triggerGetProfile(){
        EventRequest.instance.triggerGetOrganizer(id: eventDetailData.userId) { response, status in
            self.profileData = response
            self.triggerFetchRating()
        }
    }
    func triggerFetchRating(){
        ProfileRequest.instance.fetchUserRatingProfile(userId: eventDetailData.userId) { data, status in
            self.reviewsData = data
        }
    }
    func triggerToAddWishlist(index:Int){
        var id = 0
        if let eventList = self.profileData.eventList, index < eventList.events.count {
            id = eventList.events[index].id
        }
        let param: [String: Any] = ["event_id": id]
        EventRequest.instance.triggerWishlistEvent(param: param) { response, status in
            self.triggerGetProfile()
            self.itemTapped?()
        }
    }
}
extension OrganizerProfileVC:UITableViewDelegate,UITableViewDataSource{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 1{
            if self.profileData.eventList != nil{
                return self.profileData.eventList.events.count > 0 ? 1 : 0
            }
            return 0
        }
        if section == 2 && reviewsData.count == 0{
            return 1
        }
        return section == 2 ? self.reviewsData.count : 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 1{
            let cell = tableView.configureCell(EventListCell.self, at: indexPath)
            cell.topCons.constant = 0.0
            cell.config(type: 1)
            cell.configureData(data: self.profileData.eventList.events)
            cell.eventTapped = { (tag,index) in
                self.navigateToEvent(index:index)
            }
            cell.eventItemTapped = { (index,tag) in
                self.triggerToAddWishlist(index: tag)
            }
            cell.headerTitle.text = "All Active Events".localized
            cell.headerTitle.font = Fonts.AllRoundDemi(14.0)
            return cell
        }else if indexPath.section == 2{
            let cell = tableView.configureCell(OrganizerReviewCell.self, at: indexPath)
            cell.infoView.isHidden = false
            cell.lblRateUserTitle.text = "RATE ORGANISER"
            if reviewsData.count == 0{
                cell.lblTotalReviews.text = "\(0) reviews"
                cell.infoView.isHidden = true
                cell.organizerStack.isHidden = true
                cell.rateView.addTap { r in
                    if let vc:UserReviewVC = self.getController(from: .main){
                        vc.eventDetail = self.eventDetailData
                        vc.itemTapped = {
                            self.triggerGetProfile()
                        }
                        self.presentVC(vc: vc)
                    }
                }
                return cell
            }
            cell.reviewView.isHidden = indexPath.row > 0
            cell.config(data: reviewsData[indexPath.row])
            cell.lblOrgTitle.text = profileData.organizationName
            cell.lblTotalReviews.text = "\(profileData.ratingCount) reviews"
            cell.rateView.isHidden = true
            cell.imgStar.isHidden = true
            cell.rateView.isHidden = false
            cell.rateView.addTap { r in
                if let vc:UserReviewVC = self.getController(from: .main){
                    vc.eventDetail = self.eventDetailData
                    vc.itemTapped = {
                        self.triggerGetProfile()
                    }
                    self.presentVC(vc: vc)
                }
            }
            cell.organizerStack.isHidden = false
            return cell
        }
        let cell = tableView.configureCell(SpeakerInfoCell.self, at: indexPath)
        cell.sessionView.isHidden = true
        let code = profileData.countryCode + " " + profileData.mobileNumber
        cell.lblTitle.text = self.profileData.organizationName
        var emailId = self.profileData.emailId ?? ""
        emailId += "\n" + code
        cell.lblSubtitle.text = emailId
        cell.imgProfile.loadAsyncImageWithPlaceholder(loadURL: self.profileData.profileImage, placeHolder: "ic_profile_crop")
        cell.lblAboutTitle.text = "About the Organiser".localized
        cell.lblAboutSubtitle.html2String(string: self.profileData.aboutUs,customFont: Fonts.SFProRegular(14.0),color:UIColor.init(hex: "#3A3A3A"))
        cell.lblSubtitle.numberOfLines = 0//profileData.numberOfAbout
        cell.lblReadMore.addTap { r in
            self.profileData.numberOfAbout = self.profileData.numberOfAbout == 0 ? 2 : 0
            self.tableView.refreshTable()
        }
        cell.lblReadMore.isHidden = profileData.aboutUs.isEmpty
        return cell
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let headerView = UIView()
        headerView.backgroundColor = UIColor.init(hex: "#FDFBFF")
        let titleLabel = UILabel()
        titleLabel.text = "REVIEWS"
        titleLabel.font = Fonts.AllRoundDemi(14.0)
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
    func navigateToEvent(index:Int){
        if let vc: EventDetailController = self.getController(from: .main) {
            vc.eventData = self.profileData.eventList.events[index]
            vc.wishlistTapped = {
                self.profileData.eventList.events[index].isWishlisted = self.profileData.eventList.events[index].isWishlisted == 1 ? 0 : 1
                self.tableView.refreshTable()
            }
            self.pushVC(vc: vc)
        }
    }
}
