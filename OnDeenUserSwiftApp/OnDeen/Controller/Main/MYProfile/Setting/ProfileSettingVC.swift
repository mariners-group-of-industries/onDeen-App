//
//  ProfileSettingVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class ProfileSettingVC: UIViewController {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    var titles = ["Edit profile","One-to-One Session","Change password","My Active Membership","Privacy setting","Help & Support","Report an issue","Logout"]
    var profileData = ProfileResponse.init(fromDictionary: [String : Any]())
        
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    override func viewWillAppear(_ animated: Bool) {
        triggerProfile()
    }
    func triggerProfile(){
        if !self.isGuestUser(){
            ProfileRequest.instance.fetchUserProfile { data, status in
                self.profileData = data
            }
        }
    }
    func config(){
        tableView.registerNIBs(ProfileCell.self)
        backView.addTap { r in
            self.popVC()
        }
        if self.isGuestUser(){
            titles[titles.count - 1] = "Login".localized
        }
    }
}
extension ProfileSettingVC:UITableViewDelegate,UITableViewDataSource{
    func numberOfSections(in tableView: UITableView) -> Int {
        return titles.count
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section >= 0 && section < 5 && isGuestUser() {
            return 0
        }
        if section == 3{
            return 0
        }
        if section == titles.count - 1 && !self.isGuestUser(){
            return 2
        }
        return 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(ProfileCell.self, at: indexPath)
        cell.lblTitle.textAlignment = .left
        cell.lblTitle.text = titles[indexPath.section].localized
        cell.imgView.isHidden = false
        cell.lblTitle.textColor = .black
        cell.lblLine.isHidden = false
        if indexPath.section == titles.count - 1 && indexPath.row == 1{
            cell.lblLine.isHidden = true
            cell.lblTitle.textAlignment = .center
            cell.imgView.isHidden = true
            cell.lblTitle.text = "Delete Account"
            cell.lblTitle.textColor = .DB_3171
        }else{
            cell.imgView.image = UIImage.init(named: "ic_menu_\(indexPath.section)") ?? UIImage()
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if indexPath.section == 0{
            if self.isGuestUser(){
                self.showGuestLogin()
            }else{
                if self.isGuestUser(){
                    return
                }
                ProfileRequest.instance.fetchUserProfile { data, status in
                    if let vc: RegisterController = self.getController(from: .authentication) {
                        vc.registerInfo = data.toDictionary()
                        self.presentVC(vc: vc)
                    }
                }
            }
            return
        }else if indexPath.section == 1{
            if self.isGuestUser(){
                self.showGuestLogin()
            }else{
                if let vc: OneSessionVC = self.getController(from: .main) {
                    self.pushVC(vc: vc)
                }
            }
            return
        }
        else if indexPath.section == 2{
            if self.isGuestUser(){
                self.showGuestLogin()
            }else{
                if let vc: CreateNewPasswordVC = self.getController(from: .authentication) {
                    vc.isfromProfile = true
                    self.presentVC(vc: vc)
                }
            }
            return
        }
        else if indexPath.section == 3{
            if self.isGuestUser(){
                self.showGuestLogin()
            }else{
                if let vc: ActiveMembershipVC = self.getController(from: .main) {
                    self.pushVC(vc: vc)
                }
            }
            return
        } else if indexPath.section == 4{
            if self.isGuestUser(){
                self.showGuestLogin()
            }else{
                if let vc: PrivacySettingVC = self.getController(from: .main) {
                    vc.profileData = self.profileData
                    self.pushVC(vc: vc)
                }
            }
            return
        }else if indexPath.section == 5{
            if self.isGuestUser(){
                self.showGuestLogin()
            }else{
                if let vc: HelpSupportVC = self.getController(from: .main) {
                    vc.viewType = 1
                    self.presentVC(vc: vc)
                }
            }
            return
        }else if indexPath.section == 6{
            if let vc: HelpSupportVC = self.getController(from: .main) {
                vc.viewType = 2
                self.presentVC(vc: vc)
            }
        }
        if indexPath.section == titles.count - 1{
            if indexPath.row == 1{
                self.showYesnoAlertWithClosure(title: "Are you sure want to delete the account?", type: 0, vc: self) { status in
                    if status{
                        ProfileRequest.instance.triggerDeleteUser { data, status in
                            self.clearSession()
                        }
                    }
                }
                return
            }
            if self.isGuestUser(){
                self.clearSession()
                return
            }
            self.showYesnoAlertWithClosure(title: "Are you sure want to logout?", type: 0, vc: self) { status in
                if status{
                    ProfileRequest.instance.triggerLogout { data, status in
                        self.clearSession()
                    }
                }
            }
        }
    }
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 72.0
    }
}
extension UIViewController{
    func clearSession(){
        UserDefaults.standard.removeObject(forKey: "access_token")
        UserDefaults.standard.removeObject(forKey: "Authorization")
        UserDefaults.standard.removeObject(forKey: "isForgotToken")
        UserDefaults.standard.synchronize()
        LoginRequest.instance.registerInitToken { status in
            self.setRootController(board: .authentication, identifier: .loginVC)
        }
    }
}
