//
//  MYProfileVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class MYProfileVC: UIViewController {
    @IBOutlet weak var backStack: UIStackView!
    @IBOutlet weak var imgBack: UIImageView!
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var imgGradient: UIImageView!
    @IBOutlet weak var lblJoinDate: SFProLabel!
    @IBOutlet weak var lblUserAddress: SFProLabel!
    
    @IBOutlet weak var lblUsername: SFProLabel!
    @IBOutlet weak var imgProfile: UIImageView!
    @IBOutlet weak var imgSetting: UIImageView!
    @IBOutlet weak var tableView: UITableView!
    var profileData = ProfileResponse.init(fromDictionary: [String : Any]())
    @IBOutlet weak var bgView: UIView!
    var reviewsData: [EventReview] = []{
        didSet{
            self.tableView.refreshTable()
        }
    }
    var isFromParticipant = false
    var eventDetail = EventDetailResponse.init(fromDictionary: [String : Any]())

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        if isFromParticipant{
            imgBack.isHidden = false
            imgSetting.isHidden = true
            imgGradient.image = UIImage.init(named: "ic_rect") ?? UIImage()
            lblHeaderTitle.text = "User profile"
            lblHeaderTitle.font = Fonts.SFProMedium(16.0)
            backStack.addTap { r in
                self.popVC()
            }
            bgView.backgroundColor = UIColor.init(hex: "#3A3A3A")
        }
        tableView.registerNIBs(MYProfileInfoCell.self,MYProfileInfoCell.self,BookingMaterialHeaderCell.self,OrganizerReviewCell.self)
        imgSetting.addTap { r in
            if let vc: ProfileSettingVC = self.getController(from: .main) {
                vc.profileData = self.profileData
                self.pushVC(vc: vc)
            }
        }
        imgProfile.addTap { r in
            if self.isGuestUser(){
                self.setRootController(board: .authentication, identifier: .loginVC)
            }
        }
    }
    override func viewWillAppear(_ animated: Bool) {
        triggerProfile()
    }
    func triggerProfile(){
        if isFromParticipant{
            self.fetchOtherUserProfile()
            return
        }
        if self.isGuestUser(){
            self.loadUserData()
            return
        }
        ProfileRequest.instance.fetchUserProfile { data, status in
            let userData = data
            userData.showAwards = 1
            userData.showCourses = 1
            userData.showReviews = 1
            userData.showEvents = 1
            userData.showJourneyLevel = 1
            self.profileData = userData
            self.loadUserData()
            self.triggerFetchRating()
            self.tableView.refreshTable()
        }
    }
    func fetchOtherUserProfile(){
        ProfileRequest.instance.fetchOtherUserProfile(userId: self.profileData.userId) { data, status in
            let is_mine = self.profileData.is_mine
            let userId = self.profileData.userId
            self.profileData = data
            self.profileData.is_mine = is_mine
            self.profileData.userId = userId
            self.loadUserData()
            self.triggerFetchRating()
            self.tableView.refreshTable()
        }
    }
    func triggerFetchRating(){
        if self.profileData.showReviews == 0{
            self.reviewsData = []
            return
        }
        ProfileRequest.instance.fetchUserRatingProfile(userId: isFromParticipant ? eventDetail.selectedParticipiantId : 0) { data, status in
            self.reviewsData = data
        }
    }
    func loadUserData(){
        mainThread { [self] in
            if !self.isFromParticipant{
                bgView.backgroundColor = UIColor._3_E_146_F
                if profileData.showEvents == 0 && profileData.showCourses == 0 && profileData.showJourneyLevel == 0{
                    bgView.backgroundColor = UIColor.clear
                }
            }
            imgProfile.loadAsyncImageWithPlaceholder(loadURL: profileData.profileImage, placeHolder: "ic_account")
            let name = self.isGuestUser() ? "Welcome, Guest".localized : profileData.firstName + " " + profileData.lastName
            var mobile = self.isGuestUser() ? "" : profileData.countryCode + " " + profileData.mobileNumber
            lblUsername.text = name
            if self.isFromParticipant && profileData.showMobileNumber == 0{
                mobile = ""
            }
            lblUserAddress.text = mobile
            lblJoinDate.text = self.isGuestUser() ? "" : "Joined on".localized + " " + profileData.createdOn.convertServerDateFormat(toFormat: "dd-MMM-yyyy", timeZone: "")
        }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        imgProfile.config(isRoundCorner: true)
        imgGradient.config(cornerRadius: 32.0)
    }
}
extension MYProfileVC:UITableViewDelegate,UITableViewDataSource{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 1 && reviewsData.count == 0 && isFromParticipant{
            return 0
        }
        return section == 1 ? reviewsData.count : 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 1{
            let cell = tableView.configureCell(OrganizerReviewCell.self, at: indexPath)
            cell.infoView.isHidden = false
            if reviewsData.count == 0 && isFromParticipant{
                cell.lblTotalReviews.text = "\(0) reviews"
                cell.infoView.isHidden = true
                cell.organizerStack.isHidden = true
                cell.rateView.isHidden = true
                cell.rateView.addTap { r in
                    if let vc:UserReviewVC = self.getController(from: .main){
                        vc.eventDetail = self.eventDetail
                        vc.itemTapped = {
                            self.triggerProfile()
                        }
                        self.presentVC(vc: vc)
                    }
                }
                return cell
            }
            cell.reviewView.isHidden = indexPath.row > 0
            cell.config(data: reviewsData[indexPath.row])
            cell.lblOrgTitle.text = profileData.avgRating.toDouble().toString()
            cell.lblTotalReviews.text = "\(profileData.ratingCount ?? 0) reviews"
            cell.rateView.isHidden = true
            cell.imgStar.isHidden = false
            cell.rateView.addTap { r in
                if let vc:UserReviewVC = self.getController(from: .main){
                    vc.eventDetail = self.eventDetail
                    vc.itemTapped = {
                        self.triggerProfile()
                    }
                    self.presentVC(vc: vc)
                }
            }
            cell.organizerStack.isHidden = true
            return cell
        }
        let cell = tableView.configureCell(MYProfileInfoCell.self, at: indexPath)
        cell.config(data: self.profileData)
        if isFromParticipant{
            cell.bgView.backgroundColor = UIColor.init(hex: "#3A3A3A")
        }
        return cell
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let headerView = UIView()
        headerView.backgroundColor = UIColor.init(hex: "#F9F6FD")
        let titleLabel = UILabel()
        titleLabel.text = "Reviews"
        titleLabel.font = Fonts.AllRoundBold(14.0)
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
        return section == 1 ? profileData.showReviews == 1 ? reviewsData.count == 0 ? 0.0 : UITableView.automaticDimension : 0.0 : 0.0
    }

}
extension Double {
    func toString() -> String {
        return String(format: "%.1f", self)
    }
}
