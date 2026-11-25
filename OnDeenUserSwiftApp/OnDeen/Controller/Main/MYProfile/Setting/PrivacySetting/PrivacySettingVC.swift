//
//  PrivacySettingVC.swift
//  OnDeen
//
//  Created by Thabu's Mac on 07/04/25.
//

import UIKit

class PrivacySettingVC: UIViewController {
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    var titles = ["Show Course","Show Event","Show Reviews","Show Journey Level","Show Awards","Show Mobile Number"]
    
    var profileData = ProfileResponse.init(fromDictionary: [String : Any]())
        
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        tableView.registerNIBs(PrivacySettingCell.self)
        backView.addTap { r in
            self.popVC()
        }
        if self.isGuestUser(){
            titles[titles.count - 1] = "Login".localized
        }
    }
}
extension PrivacySettingVC:UITableViewDelegate,UITableViewDataSource{
    func numberOfSections(in tableView: UITableView) -> Int {
        return titles.count
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return section == 4 ? 0 : 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(PrivacySettingCell.self, at: indexPath)
        cell.lblTitle.text = titles[indexPath.section]
        cell.saveView.isHidden = true
        cell.lblLine.isHidden = false
        switch indexPath.section {
        case 0:
            cell.btnSwitch.isOn = self.profileData.showCourses == 1 ? true : false
        case 1:
            cell.btnSwitch.isOn = self.profileData.showEvents == 1 ? true : false
        case 2:
            cell.btnSwitch.isOn = self.profileData.showReviews == 1 ? true : false
        case 3:
            cell.btnSwitch.isOn = self.profileData.showJourneyLevel == 1 ? true : false
        case 4:
            cell.btnSwitch.isOn = self.profileData.showAwards == 1 ? true : false
        case 5:
            cell.lblLine.isHidden = true
            cell.saveView.isHidden = false
            cell.btnSwitch.isOn = self.profileData.showMobileNumber == 1 ? true : false
        default:
            cell.btnSwitch.isOn = false
        }
        cell.saveView.addTap { r in
            self.triggerPrivacyUpdate()
        }
        return cell
    }
    func triggerPrivacyUpdate(){
        ProfileRequest.instance.triggerUpdatePrivacy(param: ["show_course" : self.profileData.showCourses ?? 0,"show_events" : self.profileData.showEvents ?? 0,"show_reviews" : self.profileData.showReviews ?? 0,"show_journeylevel" : self.profileData.showJourneyLevel ?? 0,"show_awards" : self.profileData.showAwards ?? 0,"show_mobile_number":self.profileData.showMobileNumber ?? 0]) { response, status in
            self.popVC()
        }
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        switch indexPath.section {
        case 0:
            self.profileData.showCourses = self.profileData.showCourses == 1 ? 0 : 1
        case 1:
            self.profileData.showEvents = self.profileData.showEvents == 1 ? 0 : 1
        case 2:
            self.profileData.showReviews = self.profileData.showReviews == 1 ? 0 : 1
        case 3:
            self.profileData.showJourneyLevel = self.profileData.showJourneyLevel == 1 ? 0 : 1
        case 4:
            self.profileData.showAwards = self.profileData.showAwards == 1 ? 0 : 1
        default:
            self.profileData.showMobileNumber = self.profileData.showMobileNumber == 1 ? 0 : 1
        }
        tableView.refreshTable()
    }
}

