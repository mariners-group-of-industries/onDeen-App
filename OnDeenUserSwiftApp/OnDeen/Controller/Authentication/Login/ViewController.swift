//
//  ViewController.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit
import GoogleSignIn
import CountryPickerView
import Firebase
import AuthenticationServices

class ViewController: UIViewController {
    @IBOutlet weak var imgFlag: UIImageView!
    @IBOutlet weak var fieldMobile: UITextField!
    @IBOutlet weak var gradientView: UIView!
    @IBOutlet weak var countryView: UIView!
    @IBOutlet weak var mobileView: UIView!
    @IBOutlet weak var emailView: UIView!
    @IBOutlet weak var appleView: UIView!
    @IBOutlet weak var googleView: UIView!
    @IBOutlet weak var continueView: UIView!
    @IBOutlet weak var skipView: UIStackView!
    @IBOutlet weak var splashView: UIView!
    let countryPickView = CountryPickerView()
    var pageType : Int = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        checkTokenAvailable()
        // Do any additional setup after loading the view.
    }
    func checkTokenAvailable(){
        let getToken = UserDefaults.standard.object(forKey: "access_token") as? String ?? ""
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getToken.isEmpty{
            LoginRequest.instance.registerInitToken { status in
                self.splashView.isHidden = true
                self.setRootController(board: .main, identifier: .homeVC)
            }
            return
        }
        if !getAuthorization.isEmpty{
            ProfileRequest.instance.triggerPushRegister()
            delay(0.5, function: {
                self.setRootController(board: .main, identifier: .homeVC)
            })
            return
        }
        if !isDirectLogin && !isEventLogin{
            delay(0.5, function: {
                self.setRootController(board: .main, identifier: .homeVC)
            })
            return
        }
        self.splashView.isHidden = true
    }
    func config(){
        continueView.addTap { r in
            if self.mobileValidation(){
                self.triggerSendOTP()
            }
        }
        skipView.addTap { r in
            previousTabIndex = 0
            self.setRootController(board: .main, identifier: .homeVC)
        }
        emailView.addTap { r in
            if let vc: LoginEmailVC = self.getController(from: .authentication) {
                self.presentVC(vc: vc)
            }
        }
        googleView.addTap { r in
            self.triggerGoogle()
        }
        appleView.addTap { r in
            self.handleAppleIDRequest()
        }
        countryPickView.delegate = self
        countryPickView.dataSource = self
        imgFlag.image = countryPickView.selectedCountry.flag
        self.fieldMobile.restrictFieldInputs(charecterLength: self.getPhoneNumberLength(code: countryPickView.selectedCountry.code))
        countryView.addTapGesture { gesture in
            self.countryPickView.showCountriesList(from: self)
        }
        #if DEBUG
            countryPickView.setCountryByPhoneCode("+91")
            fieldMobile.text = "7867976727"
        #endif
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
                        if name.isEmpty{
                            name = profile.name
                        }
                        lastName = profile.familyName ?? ""
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

    fileprivate func mobileValidation() -> Bool{
        if fieldMobile.text!.isEmpty{
            Utils.showToast(message: "Please enter your mobile number.")
            return false
        }else if !self.checkMobileValidation(codeNo: countryPickView.selectedCountry.phoneCode, phoneNo: fieldMobile.text ?? ""){
            Utils.showToast(message: "Please enter the valid mobile number")
            return false
        }
        return true
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        for item in [countryView,mobileView,emailView,appleView,googleView]{
            item!.config(borderColor:UIColor.init(hex: "#E3E3E5"), borderWidth : 1.0, isRoundCorner:true)
        }
        imgFlag.setCornerRadius(4.0)
        setGradientBackground()
    }
    func setGradientBackground() {
        let gradientLayer = CAGradientLayer()
        gradientLayer.frame = gradientView.bounds
       // Define colors
       gradientLayer.colors = [
           UIColor(hex: "#F4F4F4").cgColor,
           UIColor(hex: "#FFCC33").cgColor,
           UIColor(hex: "#DB3171").cgColor,
           UIColor(hex: "#422199").cgColor
       ].reversed()
       
       // Set gradient direction (top-right to bottom-left)
       gradientLayer.startPoint = CGPoint(x: 1.0, y: 0.0) // Top-right corner
       gradientLayer.endPoint = CGPoint(x: 0.0, y: 1.0)   // Bottom-left corner
              // Add the gradient layer to the view's background
        gradientView.layer.insertSublayer(gradientLayer, at: 0)
    }
    func triggerSendOTP(){
        let param = ["mobile_number":fieldMobile.text ?? "","country_code":countryPickView.selectedCountry.phoneCode]
        LoginRequest.instance.sendOTP(param: param) { (data,status) in
            if status{
                var params = [String:Any]()
                params["user_data"] = param
                params["response_data"] = data
                 if let vc: VerifyController = self.getController(from: .authentication) {
                     vc.userData = params
                     self.presentVC(vc: vc)
                 }
            }
        }
    }
}

extension ViewController:CountryPickerViewDelegate,CountryPickerViewDataSource{
    func countryPickerView(_ countryPickerView: CountryPickerView, didSelectCountry country: Country) {
        self.imgFlag.image = countryPickView.selectedCountry.flag
        self.fieldMobile.text = ""
        self.fieldMobile.restrictFieldInputs(charecterLength: self.getPhoneNumberLength(code: country.code))
    }
    func countryPickerView(_ countryPickerView: CountryPickerView, willShow viewController: CountryPickerViewController) {
        self.navigationController?.isNavigationBarHidden = false
    }
}
extension ViewController:UIScrollViewDelegate{
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        self.view.endEditing(true)
    }
}
extension ViewController: ASAuthorizationControllerDelegate,ASAuthorizationControllerPresentationContextProviding {
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
                    self.setRootController(board: .main, identifier: .homeVC)
                    return
                }
                socialData["response_data"] = data
                self.checkNavigateRegister(data: socialData)
            }else{
                Utils.showToast(message: modal.response.message)
            }
        }
    }
    func checkNavigateRegister(data:[String:Any]){
        if let vc: RegisterController = self.getController(from: .authentication) {
            vc.userData = data
            self.presentVC(vc: vc)
        }
        print(JSON(data))
    }
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
            return self.view.window!
        }
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        print("Authorization failed: \(error.localizedDescription)")
    }
    func triggerRegisterUser(data:[String:Any]){
        let user = data["user_data"] as? [String:Any] ?? [String:Any]()
        var param = [String:Any]()
        var socialToken = ""
        var socialId = ""
        if let responseData = data["response_data"] as? [String:Any]{
            if let responseSocial = responseData["response"] as? [String:Any]{
                socialToken = responseSocial["social_access_token"] as? String ?? ""
                socialId = responseSocial["social_id"] as? String ?? ""
            }
        }
        param["social_id"] = socialId
        param["access_token"] = socialToken
        param["email_id"] = user["email_id"] as? String ?? ""
        param["first_name"] = user["first_name"] as? String ?? ""
        param["last_name"] = user["last_name"] as? String ?? ""
        param["provider"] = "apple"
        print(JSON(param))

        RegisterRequest.instance.triggerRegister(param: param) { data, status in
            if status{
                let modal = CommonModal.init(fromDictionary: data)
                if modal.status{
                    let getResponse = data["response"] as? [String:Any] ?? [String:Any]()
                    let getToken = getResponse["access_token"] as? String ?? ""
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
                        self.setRootController(board: .main, identifier: .homeVC)
                    }
                }else{
                    Utils.showToast(message: modal.response.message)
                }
            }
        }
    }
}
