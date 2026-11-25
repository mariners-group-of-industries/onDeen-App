//
//  ForgotPasswordVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 22/01/25.
//

import UIKit
import CountryPickerView

class ForgotPasswordVC: UIViewController {
    @IBOutlet weak var nextView: GlobalGradientView!
    @IBOutlet weak var fieldMobile: SFProField!
    @IBOutlet weak var imgFlag: UIImageView!
    @IBOutlet weak var countryStack: UIView!
    @IBOutlet weak var mobileView: UIView!
    @IBOutlet weak var backView: UIStackView!
    let countryPickView = CountryPickerView()
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        backView.addTap { r in
            self.dismissVC()
        }
        nextView.addTap { r in
            if self.mobileValidation(){
                self.triggerSendOTP()
            }
        }
        countryPickView.delegate = self
        countryPickView.dataSource = self
        imgFlag.image = countryPickView.selectedCountry.flag
        self.fieldMobile.restrictFieldInputs(charecterLength: self.getPhoneNumberLength(code: countryPickView.selectedCountry.code))
        countryStack.addTapGesture { gesture in
            self.countryPickView.showCountriesList(from: self)
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        for item in [countryStack,mobileView]{
            item!.config(borderColor:UIColor.init(hex: "#E3E3E5"), borderWidth : 1.0, isRoundCorner:true)
        }
        imgFlag.setCornerRadius(4.0)
    }
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        self.view.endEditing(true)
    }
}
extension ForgotPasswordVC:CountryPickerViewDelegate,CountryPickerViewDataSource{
    func countryPickerView(_ countryPickerView: CountryPickerView, didSelectCountry country: Country) {
        self.imgFlag.image = countryPickView.selectedCountry.flag
        self.fieldMobile.text = ""
        self.fieldMobile.restrictFieldInputs(charecterLength: self.getPhoneNumberLength(code: country.code))
    }
    func countryPickerView(_ countryPickerView: CountryPickerView, willShow viewController: CountryPickerViewController) {
        self.navigationController?.isNavigationBarHidden = false
    }
}
extension ForgotPasswordVC{
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
    func triggerSendOTP(){
        let param = ["mobile_number":fieldMobile.text ?? "","country_code":countryPickView.selectedCountry.phoneCode]
        LoginRequest.instance.sendOTP(param: param) { (data,status) in
            if status{
                var params = [String:Any]()
                params["user_data"] = param
                params["response_data"] = data
                if let response = ["response"] as? [String:Any]{
                    let isRegister = response["is_register"] as? Bool ?? true
                    if !isRegister{
                        Utils.showToast(message: "The entered mobile number is not exist")
                        return
                    }
                }
                 if let vc: VerifyController = self.getController(from: .authentication) {
                     vc.userData = params
                     vc.isFromforgotPassword = true
                     self.presentVC(vc: vc)
                 }
            }
        }
    }    
}
