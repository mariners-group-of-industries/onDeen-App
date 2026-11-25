//
//  RegisterController.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit
import CountryPickerView

class RegisterController: UIViewController {
    @IBOutlet weak var mobileInnerView: UIView!
    @IBOutlet weak var fieldSocialMobile: SFProField!
    @IBOutlet weak var imgFlag: UIImageView!
    @IBOutlet weak var countryView: UIView!
    @IBOutlet weak var socialMobileView: UIView!
    @IBOutlet weak var lblVerify: SFProLabel!
    @IBOutlet weak var lblEditPic: SFProLabel!
    @IBOutlet weak var agingView: TSFieldView!
    @IBOutlet weak var lblBackTitle: SFProLabel!
    @IBOutlet weak var imgProfile: UIImageView!
    @IBOutlet weak var firstNameView: TSFieldView!
    @IBOutlet weak var lastNameView: TSFieldView!
    @IBOutlet weak var mobileView: TSFieldView!
    @IBOutlet weak var emailView: TSFieldView!
    @IBOutlet weak var passwordView: TSFieldView!
    @IBOutlet weak var confirmPasswordView: TSFieldView!
    @IBOutlet weak var genderView: TSFieldView!
    @IBOutlet weak var ageView: TSFieldView!
    @IBOutlet weak var saveView: UIView!
    @IBOutlet weak var backView: UIStackView!
    var userData = [String:Any]()
    var registerInfo = [String:Any]()
    var isImagePicked = false
    var journies = [HomePageEvent]()
    var isFromSocial = false
    var isFromEmailLogin = false
    let countryPickView = CountryPickerView()
    var isOTPVerified = false{
        didSet{
            self.lblVerify.text = self.isOTPVerified ? "Verified" : "Verify"
            self.lblVerify.isUserInteractionEnabled = !self.isOTPVerified
            self.countryView.isUserInteractionEnabled = !self.isOTPVerified
            self.fieldSocialMobile.isUserInteractionEnabled = !self.isOTPVerified
        }
    }
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        self.view.endEditing(true)
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        countryPickView.delegate = self
        countryPickView.dataSource = self
        self.imgFlag.image = countryPickView.selectedCountry.flag
        self.fieldSocialMobile.restrictFieldInputs(charecterLength: self.getPhoneNumberLength(code: countryPickView.selectedCountry.code))
        countryView.addTapGesture { gesture in
            self.countryPickView.showCountriesList(from: self)
        }
        backView.addTap { r in
            let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
            if !getAuthorization.isEmpty{
                self.dismissVC()
                return
            }
            self.setRootController(board: .authentication, identifier: .loginVC)
        }
        saveView.addTap { r in
            if self.checkValidation(){
                self.view.endEditing(true)
                if self.isImagePicked{
                    self.triggerImageUpload()
                    return
                }
                self.triggerRegisterUser()
            }
        }
        imgProfile.addTap { r in
            self.showImagePicker { image, status, str in
                self.isImagePicked = true
                self.imgProfile.image = image
            }
        }
        lblEditPic.addTap { r in
            self.showImagePicker { image, status, str in
                self.isImagePicked = true
                self.imgProfile.image = image
            }
        }
        lblVerify.addTap { r in
            if self.mobileValidation(){
                self.view.endEditing(true)
                self.triggerMobileCheck()
            }
        }
        triggerJournies()
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        let user = userData["user_data"] as? [String:Any] ?? [String:Any]()
        var code = user["country_code"] as? String ?? ""
        var mobile = user["mobile_number"] as? String ?? ""
        if getAuthorization.isEmpty{
            lblEditPic.text = ""//"Upload Picture"
            self.registerInfo["mobile_number"] = user["mobile_number"] as? String ?? ""
            self.registerInfo["country_code"] = user["country_code"] as? String ?? ""
            let responseData = userData["response_data"] as? [String:Any] ?? [String:Any]()
            self.registerInfo["otp"] = responseData["otp"] as? String ?? ""
        }else{
            lblBackTitle.text = "Edit Profile".localized
            code = self.registerInfo["country_code"] as? String ?? ""
            mobile = self.registerInfo["mobile_number"] as? String ?? ""
            passwordView.isHidden = true
            confirmPasswordView.isHidden = true
            imgProfile.loadAsyncImageWithPlaceholder(loadURL: self.registerInfo["profile_image"] as? String ?? "", placeHolder: "ic_account")
            self.registerInfo["gender_title"] = self.getGender(index: self.registerInfo["gender"] as? Int ?? 0)
        }
        isFromSocial = userData["is_from_social"] as? Bool ?? false
        var editEmail = true
        if isFromSocial{
            var email = user["email_id"] as? String ?? ""
            if email.isEmpty{
                if let responseData = userData["response_data"] as? [String:Any]{
                    if let responseSocial = responseData["response"] as? [String:Any]{
                        email = responseSocial["email_id"] as? String ?? ""
                    }
                }
            }
            self.registerInfo["first_name"] = user["first_name"] as? String ?? ""
            self.registerInfo["last_name"] = user["last_name"] as? String ?? ""
            self.registerInfo["email_id"] = email
            self.registerInfo["provider"] = user["provider"] as? String ?? ""
            editEmail = email.isEmpty
        }else{
            if getAuthorization.isEmpty{
                let email = userData["email_id"] as? String ?? ""
                registerInfo["email_id"] = email
                editEmail = email.isEmpty
            }
        }
        mobileView.isHidden = isFromSocial || isFromEmailLogin
        lblVerify.isHidden = true //!isFromSocial || !isFromEmailLogin
        if isFromSocial || isFromEmailLogin{
            lblVerify.isHidden = false
        }
        socialMobileView.isHidden = !isFromSocial
        if isFromEmailLogin{
            socialMobileView.isHidden = false
            lblVerify.isHidden = false
        }
        var isFirstnameActive = true
        var isLastnameActive = true
        if isFromSocial{
            let fName = self.registerInfo["first_name"] as? String ?? ""
            isFirstnameActive = fName.isEmpty
            
            let lName = self.registerInfo["last_name"] as? String ?? ""
            isLastnameActive = lName.isEmpty
        }
        firstNameView.config(keyType: .firstName, placeHolder: "Enter First Name",isKeyActive:isFirstnameActive, text: self.registerInfo["first_name"] as? String ?? "",headerTitle: "First Name") { [weak self] value in
            self?.registerInfo["first_name"] = value as? String ?? ""
        }
        lastNameView.config(keyType: .lastName, placeHolder: "Enter Last Name",isKeyActive:isLastnameActive, text: self.registerInfo["last_name"] as? String ?? "",headerTitle: "Last Name") { [weak self] value in
            self?.registerInfo["last_name"] = value as? String ?? ""
        }
        mobileView.config(keyType: .mobileNo,placeHolder: "Enter Mobile Number", isKeyActive: isFromSocial, text: "\(code) \(mobile)",headerTitle: "Mobile Number") { value in
            print(value as? String ?? "")
        }
        print(self.registerInfo["email_id"] as? String ?? "")
        emailView.config(keyType: .emailId, placeHolder: "Enter Email",isKeyActive: !getAuthorization.isEmpty ? false : editEmail, text: self.registerInfo["email_id"] as? String ?? "",headerTitle: "Email") { [weak self] value in
            self?.registerInfo["email_id"] = value as? String ?? ""
        }
        passwordView.config(keyType: .password, placeHolder: "Enter Password", text: self.registerInfo["password"] as? String ?? "",headerTitle: "Password") { [weak self] value in
            self?.registerInfo["password"] = value as? String ?? ""
        }
        confirmPasswordView.config(keyType: .confirmPassword, placeHolder: "Repeat Password", text: self.registerInfo["confirm_password"] as? String ?? "",headerTitle: "Confirm Password") { [weak self] value in
            self?.registerInfo["confirm_password"] = value as? String ?? ""
        }
        genderView.config(keyType: .gender, placeHolder: "Select Gender (Optional)", showArrow: true, isDropDown: true, text: self.registerInfo["gender_title"] as? String ?? "",headerTitle: "Gender") { [weak self] value in
            var titles = ["Male","Female"]
            self?.showPicker(title: "Select Gender", selectedItem: self?.registerInfo["gender_title"] as? String ?? "", pickerValues: titles, result: { status, index in
                if status{
                    self?.registerInfo["gender_title"] = titles[index]
                    self?.registerInfo["gender_id"] = index + 1
                    self?.genderView.fieldItem.text = titles[index]
                }
            })
        }
        var agee = self.registerInfo["age"] as? String ?? ""
        if agee.isEmpty{
            agee = "\(self.registerInfo["age"] as? Int ?? 0)"
            if agee == "0"{
                agee = ""
            }
        }
        agingView.config(keyType: .agee, placeHolder: "Select Age (Optional)", showArrow: true, showRightView: false, isDropDown: true, text: agee, headerTitle: "Age") { [weak self] value in
            self?.showAgePicker()
        }
        ageView.config(keyType: .age, placeHolder: "Select Journey Level (Optional)", showArrow: true, isDropDown: true, text: self.registerInfo["journey_level_title"] as? String ?? "",headerTitle: "Journey Level",extra: self.journies,showInfoView:true) { [weak self] value in
            var titles = [String]()
            var subTitles = [String]()
            if let journies = self?.journies { // Safely unwrap the optional array
                for item in journies {
                    titles.append(item.title)
                    subTitles.append(item.subTitle)
                }
            }
            self?.showPicker(title: "Select journey level",info:subTitles, selectedItem: self?.registerInfo["journey_level_title"] as? String ?? "", pickerValues: titles, result: { status, index in
                if status{
                    self?.registerInfo["journey_level_title"] = titles[index]
                    self?.registerInfo["journey_level_id"] = self?.journies[index].id
                    self?.ageView.fieldItem.text = titles[index]
                }
            })
        }
        if isFromSocial{
            passwordView.isHidden = true
            confirmPasswordView.isHidden = true
            genderView.isHidden = true
            agingView.isHidden = true
            ageView.isHidden = true
        }
    }
    func showAgePicker() {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        let currentDate = Date()
        let calendar = Calendar.current
        // Calculate the minimum selectable date (100 years ago from today)
        let minSelectableDate = calendar.date(byAdding: .year, value: -100, to: currentDate)
        // Calculate the maximum selectable date (exactly 18 years ago)
        let maxSelectableDate = calendar.date(byAdding: .year, value: -18, to: currentDate)
        if let minDate = minSelectableDate, let maxDate = maxSelectableDate {
            let selectedDate = self.registerInfo["agee_title"] as? String ?? ""
            var pickedDate = maxDate
            if !selectedDate.isEmpty{
                pickedDate = formatter.date(from: selectedDate) ?? maxDate
            }
            self.showDatePicker(title: "Select date of birth",
                                selectedDate: pickedDate, // Default to 18 years ago
                                mode: .date,
                                minDate: minDate,
                                maxDate: maxDate) { status, date in
                if status {
                    let selectedDateString = formatter.string(from: date)
                    let age = self.calculateAge(from: date)
                    self.registerInfo["age"] = "\(age)"
                    self.agingView.fieldItem.text = "\(age)"
                    self.registerInfo["agee_title"] = selectedDateString
                }
            }
        }
    }
    func calculateAge(from date: Date) -> Int {
        let calendar = Calendar.current
        let ageComponents = calendar.dateComponents([.year], from: date, to: Date())
        return ageComponents.year ?? 0
    }

    func triggerMobileCheck(){
        let param = ["mobile_number":fieldSocialMobile.text ?? "","country_code":countryPickView.selectedCountry.phoneCode]
        LoginRequest.instance.sendOTP(param: param) { (dataa,status) in
            if status{
                if let respone = dataa["response"] as? [String:Any]{
                    let isRegistered = respone["is_register"] as? Bool ?? false
                    if isRegistered{
                        Utils.showToast(message: "Mobile Number Already Exist")
                        return
                    }
                }
                var params = [String:Any]()
                var isSocial = false
                if self.isFromSocial || self.isFromEmailLogin{
                    isSocial = true
                }
                params["user_data"] = ["mobile_number":self.fieldSocialMobile.text ?? "","country_code":self.countryPickView.selectedCountry.phoneCode,"is_from_social":isSocial]
                if let vc: VerifyController = self.getController(from: .authentication) {
                    vc.userData = params
                    vc.itemTapped = {
                        self.isOTPVerified = true
                    }
                    self.presentVC(vc: vc)
                }
            }
        }
    }

    func getGender(index:Int) -> String{
        var text = ""
        switch index {
        case 1:
            text = "Male".localized
        case 2:
            text = "Female".localized
        default:
            text = "".localized
        }
        return text
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        imgProfile.config(isRoundCorner: true)
        mobileInnerView.config(isRoundCorner: true)
    }
    func triggerJournies(){
        RegisterRequest.instance.triggerJourneyList { data, status in
            self.journies = data
            let journey = self.registerInfo["journey_level_id"] as? Int ?? 0
            for item in self.journies{
                if item.id == journey{
                    item.isSelected = true
                }
            }
        }
    }
    fileprivate func mobileValidation() -> Bool{
        if fieldSocialMobile.text!.isEmpty{
            Utils.showToast(message: "Please enter your mobile number.")
            return false
        }else if !self.checkMobileValidation(codeNo: countryPickView.selectedCountry.phoneCode, phoneNo: fieldSocialMobile.text ?? ""){
            Utils.showToast(message: "Please enter the valid mobile number")
            return false
        }
        return true
    }

    fileprivate func checkValidation() -> Bool{
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        let firstName = self.registerInfo["first_name"] as? String ?? ""
        let lastName = self.registerInfo["last_name"] as? String ?? ""
        let email = self.registerInfo["email_id"] as? String ?? ""
        let password = self.registerInfo["password"] as? String ?? ""
        let confirm = self.registerInfo["confirm_password"] as? String ?? ""
        let gender = self.registerInfo["gender_title"] as? String ?? ""
        var age = self.registerInfo["age"] as? String ?? ""
        if age.isEmpty{
            if let getAge = self.registerInfo["age"] as? Int{
                age = "\(getAge)"
            }
        }
        let journey = self.registerInfo["journey_level_id"] as? Int ?? 0
        if firstName.isEmpty{
            Utils.showToast(message: "Please enter the first name")
            return false
        }else if lastName.isEmpty{
            Utils.showToast(message: "Please enter the last name")
            return false
        }else if email.isEmpty{
            Utils.showToast(message: "Please enter the email")
            return false
        }else if !self.isValidEmailAddress(email){
            Utils.showToast(message: "Please enter the valid email id")
            return false
        }else if password.isEmpty && getAuthorization.isEmpty && !isFromSocial{
            Utils.showToast(message: "Please enter the password")
            return false
        }else if password.isEmpty && getAuthorization.isEmpty && isFromEmailLogin{
            Utils.showToast(message: "Please enter the password")
            return false
        }else if !self.isValidPassword(password: password) && getAuthorization.isEmpty && !isFromSocial{
            Utils.showToast(message: "Password must contain atleast 8 characters,1 uppercase, 1 lowercase, 1 number, 1 symbol")
            return false
        }else if !self.isValidPassword(password: password) && getAuthorization.isEmpty && isFromEmailLogin{
            Utils.showToast(message: "Password must contain atleast 8 characters,1 uppercase, 1 lowercase, 1 number, 1 symbol")
            return false
        }else if confirm.isEmpty && getAuthorization.isEmpty && !isFromSocial{
            Utils.showToast(message: "Please enter the confirm password")
            return false
        }else if confirm.isEmpty && getAuthorization.isEmpty && isFromEmailLogin{
            Utils.showToast(message: "Please enter the confirm password")
            return false
        }else if password != confirm && getAuthorization.isEmpty && !isFromSocial{
            Utils.showToast(message: "Password not matched")
            return false
        }else if password != confirm && getAuthorization.isEmpty && isFromEmailLogin{
            Utils.showToast(message: "Password not matched")
            return false
        }else if gender.isEmpty && !isFromSocial{
//            Utils.showToast(message: "Please select the gender")
//            return false
        }else if age.isEmpty && !isFromSocial{
//            Utils.showToast(message: "Please enter the age")
//            return false
        } else if journey == 0 && !isFromSocial{
//            Utils.showToast(message: "Please select the journey level")
//            return false
        }
        return true
    }
    func triggerImageUpload(){
        if let base64String = convertImageToBase64(image: self.imgProfile.image!) {
            RegisterRequest.instance.triggerUpload(param: ["file" : base64String,"module":"profile"]) { data, status in
                print(JSON(data))
                if let response = data["response"] as? [String:Any]{
                    let getURL = response["url"] as? String ?? ""
                    self.registerInfo["profile_image"] = getURL
                    self.triggerRegisterUser()
                }else{
                    let modal = CommonModal.init(fromDictionary: data)
                    if modal.status{
                        Utils.showToast(message: modal.response.message)
                    }
                }
            }
        } else {
            self.triggerRegisterUser()
        }
    }
    func triggerRegisterUser(){
        print(JSON(self.registerInfo))
        var param = self.registerInfo
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if !getAuthorization.isEmpty{
            let genderId = registerInfo["gender_id"] as? Int ?? 0
            if genderId != 0{
                param["gender"] = registerInfo["gender_id"] as? Int ?? 0
            }
            RegisterRequest.instance.triggerUpdateProfile(param: param) { data, status in
                if status{
                    let modal = CommonModal.init(fromDictionary: data)
                    if modal.status{
                        self.showTSAlert(modal.response.message, "Ok", "", 0) { isCancelled, tag in
                            self.dismissVC()
                        }
                    }else{
                        Utils.showToast(message: modal.response.message)
                    }
                }
            }
            return
        }
        param["gender"] = registerInfo["gender_id"] as? Int ?? 0
        if isFromSocial || isFromEmailLogin{
            if !isOTPVerified{
                Utils.showToast(message: "Please verify the mobile number")
                return
            }
            var socialToken = ""
            var socialId = ""
            if let responseData = userData["response_data"] as? [String:Any]{
                if let responseSocial = responseData["response"] as? [String:Any]{
                    socialToken = responseSocial["social_access_token"] as? String ?? ""
                    socialId = responseSocial["social_id"] as? String ?? ""
                }
            }
            param["mobile_number"] = self.fieldSocialMobile.text ?? ""
            param["country_code"] = self.countryPickView.selectedCountry.phoneCode
            param["social_id"] = socialId
            param["access_token"] = socialToken
            print(JSON(param))
        }
        #if DEBUG
            print(JSON(param))
        #else
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
                        ProfileRequest.instance.triggerPushRegister()
                        self.setRootController(board: .main, identifier: .homeVC)
//                        if let vc:MembershipVC = self.getController(from: .main){
//                            vc.isFromRegistration = true
//                            self.presentVC(vc: vc)
//                        }
                    }
                }else{
                    Utils.showToast(message: modal.response.message)
                }
            }
        }
        #endif

    }
}
extension RegisterController:CountryPickerViewDelegate,CountryPickerViewDataSource{
    func countryPickerView(_ countryPickerView: CountryPickerView, didSelectCountry country: Country) {
        self.imgFlag.image = countryPickView.selectedCountry.flag
        self.fieldSocialMobile.text = ""
        self.fieldSocialMobile.restrictFieldInputs(charecterLength: self.getPhoneNumberLength(code: country.code))
    }
    func countryPickerView(_ countryPickerView: CountryPickerView, willShow viewController: CountryPickerViewController) {
        self.navigationController?.isNavigationBarHidden = false
    }
}
