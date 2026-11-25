//
//  LoginEmailVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//

import UIKit
import GoogleSignIn
import Firebase
import AuthenticationServices

class LoginEmailVC: UIViewController {
    @IBOutlet weak var lblForgotPassword: SFProLabel!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var fieldEmail: UITextField!
    @IBOutlet weak var fieldPassword: UITextField!
    @IBOutlet weak var emailView: UIView!
    @IBOutlet weak var passwordView: UIView!
    @IBOutlet weak var appleView: UIView!
    @IBOutlet weak var googleView: UIView!
    @IBOutlet weak var continueView: UIView!
    @IBOutlet weak var mobileView: UIView!

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        fieldEmail.delegate = self
        fieldPassword.delegate = self

//        fieldPassword.becomeFirstResponder()
        backView.addTap { r in
            if isFromChangePassword{
                isFromChangePassword = false
                self.setRootController(board: .authentication, identifier: .loginVC)
                return
            }
            self.dismissVC()
        }
        mobileView.addTap { r in
            if isFromChangePassword{
                isFromChangePassword = false
                self.setRootController(board: .authentication, identifier: .loginVC)
                return
            }
            self.dismissVC()
        }
        continueView.addTap { r in
            if self.mobileValidation(){
                self.triggerValidAccount()
            }
        }
        lblForgotPassword.addTap { r in
            if let vc: ForgotPasswordVC = self.getController(from: .authentication) {
                self.presentVC(vc: vc)
            }
        }
        googleView.addTap { r in
            self.triggerGoogle()
        }
        appleView.addTap { r in
            self.handleAppleIDRequest()
        }
    }
    fileprivate func mobileValidation() -> Bool{
        let email = fieldEmail.text ?? ""
        if email.isEmpty{
            Utils.showToast(message: "Please enter the email id")
            return false
        }else if !self.isValidEmailAddress(email){
            Utils.showToast(message: "Please enter the valid email id")
            return false
        }
        /*else if fieldPassword.text!.isEmpty{
            Utils.showToast(message: "Please enter the password")
            return false
        }*/
        return true
    }
    func triggerValidAccount(){
        let param = ["email_id":fieldEmail.text ?? ""]
        LoginRequest.instance.triggerEmailSendOTP(param: param) { (data,status) in
            let modal = CommonModal.init(fromDictionary: data)
            if modal.status{
//                let getResponse = data["response"] as? [String:Any] ?? [String:Any]()
//                let status = getResponse["status"] as? Bool ?? false
//                let getToken = getResponse["access_token"] as? String ?? ""
//                var membershipCount = getResponse["active_membership_count"] as? Int ?? 0
//                if status{
                    if let vc: VerifyController = self.getController(from: .authentication) {
                        vc.userData = param
                        vc.isFromEmailLogin = true
                        self.presentVC(vc: vc)
                    }
                    return
//                }
//                if getToken.isEmpty{
//                    Utils.showToast(message: modal.response.message)
//                }else{
//                    UserDefaults.standard.set(getToken, forKey: "Authorization")
//                    UserDefaults.standard.synchronize()
//                    if isSkipLogin{
//                        isSkipLogin = false
//                        self.dismissAllPresentedControllers()
//                        return
//                    }
//                    ProfileRequest.instance.triggerPushRegister()
//                    membershipCount = 10
//                    if membershipCount == 0{
//                        UserDefaults.standard.set(membershipCount, forKey: "membershipCount")
//                        UserDefaults.standard.synchronize()
//                        self.setRootController(board: .main, identifier: .membershipVC)
//                        return
//                    }
//                    if isEventLogin{
//                        isEventLogin = false
//                        self.view.window?.rootViewController?.dismiss(animated: true, completion: nil)
//                        return
//                    }
//                    self.setRootController(board: .main, identifier: .homeVC)
//                }
            }else{
                Utils.showToast(message: modal.response.message)
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        for item in [emailView,mobileView,passwordView,appleView,googleView]{
            item!.config(borderColor:UIColor.init(hex: "#E3E3E5"), borderWidth : 1.0, isRoundCorner:true)
        }
    }
    func triggerGoogle(){
        guard let clientID = FirebaseApp.app()?.options.clientID else { return }

        // Create Google Sign In configuration object.
        let config = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.configuration = config

        // Start the sign in flow!
        GIDSignIn.sharedInstance.signIn(withPresenting: self) { [unowned self] result, error in
            if error == nil{
                if let user = result?.user{
                    var email = ""
                    var name = ""
                    var lastName = ""

                    if let profile = user.profile{
                        email = profile.email
                        name = profile.givenName ?? ""
                        lastName = profile.name
                    }
                    UserDefaults.standard.set(email, forKey: "appleAuthorizedEmail")
                    UserDefaults.standard.set(name, forKey: "appleAuthorizedName")
                    print(user.profile?.name ?? "")
                    print(user.profile?.givenName ?? "")
                    print(user.profile?.familyName ?? "")
                    print(user.profile?.email ?? "")
                    let idToken = user.idToken?.tokenString ?? ""
                    print(idToken)
                    let userInfo = ["email_id":email,
                                    "first_name":name,
                                    "last_name":lastName,
                                    "access_token":idToken,
                                    "provider":"google"] as [String : Any]
                    self.navigateToRegister(data: ["is_from_social":true,"user_data":userInfo])
                }
            }
        }
    }
    func handleAppleIDRequest() {
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email] // Request user’s name and email if needed
        let authorizationController = ASAuthorizationController(authorizationRequests: [request])
        authorizationController.delegate = self
        authorizationController.presentationContextProvider = self
        authorizationController.performRequests()
    }

}
extension LoginEmailVC:UITextFieldDelegate{
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}
extension LoginEmailVC: ASAuthorizationControllerDelegate,ASAuthorizationControllerPresentationContextProviding {
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
            if let email = appleIDCredential.email {
                UserDefaults.standard.set(email, forKey: "appleAuthorizedEmail")
            }
            if let name = appleIDCredential.fullName?.givenName {
                UserDefaults.standard.set(name, forKey: "appleAuthorizedName")
            }
            if let lastName = appleIDCredential.fullName?.familyName {
                UserDefaults.standard.set(lastName, forKey: "appleAuthorizedLastName")
            }
             let userIdentifier = appleIDCredential.user
             let fullName = appleIDCredential.fullName?.givenName ?? ""
             if let identityToken = appleIDCredential.identityToken,
                let token = String(data: identityToken, encoding: .utf8){
                 // Store the userIdentifier for future sign-in
                 print("token ID: \(token)")
                 UserDefaults.standard.set(userIdentifier, forKey: "appleAuthorizedUserIdKey")
                 let savedEmail = UserDefaults.standard.string(forKey: "appleAuthorizedEmail") ?? ""
                 let name = UserDefaults.standard.string(forKey: "appleAuthorizedName") ?? ""
                 let lastName = UserDefaults.standard.string(forKey: "appleAuthorizedLastName") ?? ""
                 print("Full Name: \(String(describing: name))")
                 print("Email: \(String(describing: savedEmail))")
                 let userInfo = ["email_id":savedEmail,
                                 "access_token":token,
                                 "provider":"apple",
                                 "first_name":name.isEmpty ? fullName : name,
                                 "last_name":lastName] as [String : Any]
                 print(JSON(userInfo))
                 self.navigateToRegister(data: ["is_from_social":true,"user_data":userInfo])
             }
         }
    }
    func navigateToRegister(data:[String:Any]){
        var socialData = data
        let user = data["user_data"] as? [String:Any] ?? [String:Any]()
        RegisterRequest.instance.triggerSocial(param: user) { data, status in
            let modal = CommonModal.init(fromDictionary: data)
            if modal.status{
                let getResponse = data["response"] as? [String:Any] ?? [String:Any]()
                let getToken = getResponse["access_token"] as? String ?? ""
                var membershipCount = getResponse["active_membership_count"] as? Int ?? 0
                if !getToken.isEmpty{
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
                    ProfileRequest.instance.triggerPushRegister()
                    self.setRootController(board: .main, identifier: .homeVC)
                    return
                }
                socialData["response_data"] = data
                if let vc: RegisterController = self.getController(from: .authentication) {
                    vc.userData = socialData
                    self.presentVC(vc: vc)
                }
                print(JSON(data))
            }else{
                Utils.showToast(message: modal.response.message)
            }
        }
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
            return self.view.window!
        }
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        print("Authorization failed: \(error.localizedDescription)")
    }
}
