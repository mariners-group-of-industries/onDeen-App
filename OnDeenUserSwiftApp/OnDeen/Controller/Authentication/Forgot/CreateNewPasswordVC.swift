//
//  CreateNewPasswordVC.swift
//  OnDeen
//
//  Created by Imcrinox Techniologies Pvt Ltd on 23/01/25.
//

import UIKit
var isFromChangePassword = false

class CreateNewPasswordVC: UIViewController {
    @IBOutlet weak var lblCreatPasswordTitle: SFProLabel!
    @IBOutlet weak var lblBack: SFProLabel!
    @IBOutlet weak var backview: UIStackView!
    @IBOutlet weak var newPasswordView: UIView!
    @IBOutlet weak var fieldNewpassword: SFProField!
    @IBOutlet weak var confirmPasswordview: UIView!
    @IBOutlet weak var fieldConfirmpassword: SFProField!
    @IBOutlet weak var confirmView: GlobalGradientView!
    @IBOutlet weak var lblConfirm: SFProLabel!
    var isfromProfile = false
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        newPasswordView.setCornerRadius(newPasswordView.bounds.height/2)
        confirmPasswordview.setCornerRadius(confirmPasswordview.bounds.height/2)
        confirmView.setCornerRadius(16)
        if self.isfromProfile{
            lblBack.text = "Change Password"
            lblCreatPasswordTitle.text = "Change password"
            lblConfirm.text = "SUBMIT"
        }
        backview.addTap { r in
            if self.isfromProfile{
                self.dismissVC()
            }
            else{
                self.clearSession()
                self.dismissVC()
            }
        }
        confirmView.addTap { r in
            if self.checkValidation(){
                self.triggerNewpassword()
            }
        }
    }
    fileprivate func checkValidation() -> Bool{
        let password = self.fieldNewpassword.text ?? ""
        let confirmpassword = self.fieldConfirmpassword.text ?? ""
        if fieldNewpassword.text == ""{
            Utils.showToast(message: "Please enter the New password")
            return false
        }
        else if !self.isValidPassword(password: password){
            Utils.showToast(message: "Password must contain atleast 8 characters,1 uppercase, 1 lowercase, 1 number, 1 symbol")
            return false
        }
        else if fieldConfirmpassword.text == ""{
            Utils.showToast(message: "Please enter the confirm password")
            return false
        }
        else if password != confirmpassword{
            Utils.showToast(message: "Password not matched")
            return false
        }
        return true
    }
    func triggerNewpassword(){
        let param = ["new_password":fieldNewpassword.text ?? ""]
        LoginRequest.instance.triggerCreatePassword(param: param) { (data,status) in
            let modal = CommonModal.init(fromDictionary: data)
            if modal.status{
                let getResponse = data["response"] as? [String:Any] ?? [String:Any]()
                self.showTSAlert(modal.response.message, "Ok", "", 0) { isCancelled, tag in
                    self.clearSession()
                    isFromChangePassword = true
                    self.setRootController(board: .authentication, identifier: .LoginEmailVC)
                }
            }else{
                Utils.showToast(message: modal.response.message)
            }
        }
    }
  
}
