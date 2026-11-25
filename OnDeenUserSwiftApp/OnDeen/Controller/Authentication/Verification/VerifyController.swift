//
//  VerifyController.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit
import SVGKit

import SwiftyAttributes
var otpTimer = 60

class VerifyController: UIViewController {
    @IBOutlet weak var lblCounter: UILabel!
    @IBOutlet weak var lblMobile: UILabel!
    @IBOutlet weak var lblChange: UILabel!
    @IBOutlet weak var lblResendOTP: UILabel!
    @IBOutlet weak var otpView1: UIView!
    @IBOutlet weak var otpView2: UIView!
    @IBOutlet weak var otpView3: UIView!
    @IBOutlet weak var otpView4: UIView!
    @IBOutlet weak var otpView5: UIView!
    @IBOutlet weak var otpView6: UIView!
    @IBOutlet weak var verifyView: UIView!
    @IBOutlet weak var backView: UIStackView!
    var userData = [String:Any]()
    @IBOutlet weak var fieldSix: UITextField!
    @IBOutlet weak var fieldFive: UITextField!
    @IBOutlet weak var fieldFour: UITextField!
    @IBOutlet weak var fieldThree: UITextField!
    @IBOutlet weak var fieldTwo: UITextField!
    @IBOutlet weak var fieldOne: UITextField!
    var isFromforgotPassword = false
    var isFromEmailLogin = false
    var verificationCode = ""
    var timer : Timer?
    var counter = otpTimer
    var itemTapped : (() -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        backView.addTap { r in
            self.view.endEditing(true)
            self.dismissVC()
        }
        verifyView.addTap { r in
            if self.checkValidation(){
                self.validateOTP()
            }
        }
        let user = userData["user_data"] as? [String:Any] ?? [String:Any]()
        let code = user["country_code"] as? String ?? ""
        let email = userData["email_id"] as? String ?? ""
        let mobile = user["mobile_number"] as? String ?? ""
        if isFromEmailLogin{
            lblMobile.text = "OTP has been sent to".localized + " \(email)"
        }else{
            lblMobile.text = "OTP has been sent to".localized + " \(code) \(mobile)"
        }
        let attr = NSMutableAttributedString()
        attr.append("Change".localized.withUnderlineStyle(.single))
        lblChange.attributedText = attr
        lblChange.addTap { r in
            self.view.endEditing(true)
            self.dismissVC()
        }
        lblResendOTP.addTapGesture { gesture in
            self.sendOTPToUser()
        }
        setupOTPFields()
        self.startTimer()

//        self.sendOTPToUser()
    }
    func checkValidation() -> Bool{
        if self.verificationCode.count != 6{
            Utils.showToast(message: "Please enter a valid OTP")
            return false
        }
        return self.verificationCode.count == 6
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        for item in [otpView1,otpView2,otpView3,otpView4,otpView5,otpView6]{
            item!.config(cornerRadius: 16.0)
        }
    }
    fileprivate func sendVerificationCode(){
        self.fieldOne.text = ""
        self.fieldTwo.text = ""
        self.fieldThree.text = ""
        self.fieldFour.text = ""
        self.fieldFive.text = ""
        self.fieldSix.text = ""
        LoginRequest.instance.sendOTP(param: userData["user_data"] as? [String:Any] ?? [String:Any]()) { (data,status) in
            if status{
                let modal = CommonModal.init(fromDictionary: data)
                Utils.showToast(message: modal.response.message)
                if modal.status{
                    self.startTimer()
                    self.userData["response_data"] = data
                }
            }
        }
    }
    private func validateOTP(){
        self.timer?.invalidate()
        self.verifyCode()

//        FirebaseExtension.shared.validateOTP(otp: self.verificationCode, controller: self) { (status) in
//            if status{
//                self.timer?.invalidate()
//                self.verifyCode()
//            }else{
//                Utils.showToast(message: "Invalid OTP")
//            }
//        }
    }

    private func sendOTPToUser(){
        let user = userData["user_data"] as? [String:Any] ?? [String:Any]()
        self.fieldOne.text = ""
        self.fieldTwo.text = ""
        self.fieldThree.text = ""
        self.fieldFour.text = ""
        self.fieldFive.text = ""
        self.fieldSix.text = ""

        self.fieldOne.becomeFirstResponder()
        self.startTimer()
//        let isFromSocial = user["is_from_social"] as? Bool ?? false
//        if isFromSocial{
            self.triggerSendOTP()
//        }

        
//        let code = user["country_code"] as? String ?? ""
//        let mobile = user["mobile_number"] as? String ?? ""
//        FirebaseExtension.shared.sendOTPToUser(code: code, mobile: mobile, controller: self) { (status) in
//            if status{
//                self.fieldOne.becomeFirstResponder()
//                self.startTimer()
//                let isFromSocial = user["is_from_social"] as? Bool ?? false
//                if isFromSocial{
//                    self.triggerSendOTP()
//                }
//            }
//        }
    }
    func triggerSendOTP(){
        if isFromEmailLogin{
            let param = ["email_id":userData["email_id"] as? String ?? ""]
            LoginRequest.instance.triggerEmailSendOTP(param: param) { (data,status) in}
            return
        }
        let user = userData["user_data"] as? [String:Any] ?? [String:Any]()
        let code = user["country_code"] as? String ?? ""
        let mobile = user["mobile_number"] as? String ?? ""

        let param = ["mobile_number":mobile,"country_code":code]
        LoginRequest.instance.sendOTP(param: param) { (data,status) in }
    }
    fileprivate func startTimer(){
        otpTimer = 60
        #if targetEnvironment(simulator)
            otpTimer = 10
        #endif
        self.counter = otpTimer
        self.timer?.invalidate()
        self.timer = Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(self.updateCounter), userInfo: nil, repeats: true)
    }
    @objc func updateCounter() {
        if counter > 0 {
            self.lblResendOTP.isUserInteractionEnabled = false
            self.lblCounter.text = "Resend Code In".localized
            self.lblResendOTP.text = "\(counter) " + "Sec".localized
            counter -= 1
        }else{
            self.lblResendOTP.isUserInteractionEnabled = true
            counter = otpTimer
            self.timer?.invalidate()
            self.lblCounter.text = "Didn’t receive the OTP?".localized
            self.lblResendOTP.text = "Resend OTP".localized
        }
    }
}
extension VerifyController{
    fileprivate func setupOTPFields(){
        fieldOne.delegate = self
        fieldTwo.delegate = self
        fieldThree.delegate = self
        fieldFour.delegate = self
        fieldFive.delegate = self
        fieldSix.delegate = self
        
        if #available(iOS 12.0, *) {
            fieldOne.textContentType = .oneTimeCode
            fieldTwo.textContentType = .oneTimeCode
            fieldThree.textContentType = .oneTimeCode
            fieldFour.textContentType = .oneTimeCode
            fieldFive.textContentType = .oneTimeCode
            fieldSix.textContentType = .oneTimeCode
        }
        fieldOne.addTarget(self, action: #selector(self.textFieldDidChange(textField:)), for: .editingChanged)
        fieldTwo.addTarget(self, action: #selector(self.textFieldDidChange(textField:)), for: .editingChanged)
        fieldThree.addTarget(self, action: #selector(self.textFieldDidChange(textField:)), for: .editingChanged)
        fieldFour.addTarget(self, action: #selector(self.textFieldDidChange(textField:)), for: .editingChanged)
        fieldFive.addTarget(self, action: #selector(self.textFieldDidChange(textField:)), for: .editingChanged)
        fieldSix.addTarget(self, action: #selector(self.textFieldDidChange(textField:)), for: .editingChanged)
        fieldOne.becomeFirstResponder()
    }
    //When changed value in textField
    @objc func textFieldDidChange(textField: UITextField){
        let text = textField.text
        if text?.count == 1 {
            switch textField{
            case fieldOne:
                fieldTwo.becomeFirstResponder()
            case fieldTwo:
                fieldThree.becomeFirstResponder()
            case fieldThree:
                fieldFour.becomeFirstResponder()
            case fieldFour:
                fieldFive.becomeFirstResponder()
            case fieldFive:
                fieldSix.becomeFirstResponder()
            case fieldSix:
                fieldSix.resignFirstResponder()
                self.dismissKeyboard()
            default:
                break
            }
        }
        if text?.count == 0 {
            switch textField{
            case fieldOne:
                fieldOne.becomeFirstResponder()
            case fieldTwo:
                fieldOne.becomeFirstResponder()
            case fieldThree:
                fieldTwo.becomeFirstResponder()
            case fieldFour:
                fieldThree.becomeFirstResponder()
            case fieldFive:
                fieldFour.becomeFirstResponder()
            case fieldSix:
                fieldFive.becomeFirstResponder()
            default:
                break
            }
        }
    }
    func dismissKeyboard(){
        self.verificationCode = "\(self.fieldOne.text ?? "")\(self.fieldTwo.text ?? "")\(self.fieldThree.text ?? "")\(self.fieldFour.text ?? "")\(self.fieldFive.text ?? "")\(self.fieldSix.text ?? "")"
        self.view.endEditing(true)
    }
    fileprivate func verifyCode(){
        var user = userData["user_data"] as? [String:Any] ?? [String:Any]()
        user["otp"] = self.verificationCode
        if isFromEmailLogin{
            user["email_id"] = userData["email_id"] as? String ?? ""
            VerifyRequest.instance.verifyEmailOTP(param: user) { (data,status) in
                let modal = CommonModal.init(fromDictionary: data)
                if modal.status{
                    if !modal.response.isRegister{
                        self.navigateToRegister()
                    }else{
                        let getResponse = data["response"] as? [String:Any] ?? [String:Any]()
                        let getToken = getResponse["access_token"] as? String ?? ""
                        var membershipCount = getResponse["active_membership_count"] as? Int ?? 0
                        if getToken.isEmpty{
                            Utils.showToast(message: modal.response.message)
                        }else{
                            UserDefaults.standard.set(getToken, forKey: "Authorization")
                            UserDefaults.standard.synchronize()
                            if isSkipLogin{
                                isSkipLogin = false
                                self.dismissAllPresentedControllers()
                                return
                            }
                            ProfileRequest.instance.triggerPushRegister()
                            membershipCount = 10
                            if membershipCount == 0{
                                UserDefaults.standard.set(membershipCount, forKey: "membershipCount")
                                UserDefaults.standard.synchronize()
                                self.setRootController(board: .main, identifier: .membershipVC)
                                return
                            }
                            if isEventLogin{
                                isEventLogin = false
                                self.view.window?.rootViewController?.dismiss(animated: true, completion: nil)
                                return
                            }
                            self.setRootController(board: .main, identifier: .homeVC)
                        }
                    }
                }else{
                    Utils.showToast(message: modal.response.message)
                }
            }
            return
        }
        VerifyRequest.instance.verifyOTP(param: user) { (data,status) in
            let isFromSocial = user["is_from_social"] as? Bool ?? false
            if isFromSocial{
                let modal = CommonModal.init(fromDictionary: data)
                if modal.status{
                    self.view.endEditing(true)
                    self.itemTapped?()
                    self.dismissVC()
                }else{
                    Utils.showToast(message: modal.response.message)
                }
                return
            }
            let modal = CommonModal.init(fromDictionary: data)
            if modal.status{
                var responseData = data
                responseData["otp"] = self.verificationCode
                self.userData["response_data"] = responseData
                if self.isFromforgotPassword{
                    let getResponse = data["response"] as? [String:Any] ?? [String:Any]()
                    let getToken = getResponse["access_token"] as? String ?? ""
                    if getToken.isEmpty{
                        Utils.showToast(message: modal.response.message)
                        return
                    }else{
                        UserDefaults.standard.set(getToken, forKey: "Authorization")
                        UserDefaults.standard.set(true, forKey: "isForgotToken")
                        UserDefaults.standard.synchronize()
                    }
                    self.navigateToCreatePassword()
                }else{
                    if !modal.response.isRegister{
                        self.navigateToRegister()
                    }else{
                        let getResponse = data["response"] as? [String:Any] ?? [String:Any]()
                        let getToken = getResponse["access_token"] as? String ?? ""
                        var membershipCount = getResponse["active_membership_count"] as? Int ?? 0
                        if getToken.isEmpty{
                            Utils.showToast(message: modal.response.message)
                        }else{
                            UserDefaults.standard.set(getToken, forKey: "Authorization")
                            UserDefaults.standard.synchronize()
                            if isSkipLogin{
                                isSkipLogin = false
                                self.dismissAllPresentedControllers()
                                return
                            }
                            ProfileRequest.instance.triggerPushRegister()
                            membershipCount = 10
                            if membershipCount == 0{
                                UserDefaults.standard.set(membershipCount, forKey: "membershipCount")
                                UserDefaults.standard.synchronize()
                                self.setRootController(board: .main, identifier: .membershipVC)
                                return
                            }
                            if isEventLogin{
                                isEventLogin = false
                                self.view.window?.rootViewController?.dismiss(animated: true, completion: nil)
                                return
                            }
                            self.setRootController(board: .main, identifier: .homeVC)
                        }
                    }
                }
            }else{
                Utils.showToast(message: modal.response.message)
            }
        }
    }
    func navigateToRegister(){
        if let vc: RegisterController = self.getController(from: .authentication) {
            vc.userData = self.userData
            vc.isFromEmailLogin = self.isFromEmailLogin
            self.presentVC(vc: vc)
        }
    }
    func navigateToCreatePassword(){
        if let vc: CreateNewPasswordVC = self.getController(from: .authentication) {
//            vc.userData = self.userData
            self.presentVC(vc: vc)
        }
    }
}
extension VerifyController:UITextFieldDelegate{
    func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
       let currentText = textField.text ?? ""
       let newLength = currentText.count + string.count - range.length
       return newLength <= 1
    }
}

