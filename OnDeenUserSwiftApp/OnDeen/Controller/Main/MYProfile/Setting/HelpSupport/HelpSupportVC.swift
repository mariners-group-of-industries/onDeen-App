//
//  HelpSupportVC.swift
//  OnDeen
//
//  Created by Thabu MacbookPRO on 09/09/25.
//

import UIKit

class HelpSupportVC: UIViewController {
    @IBOutlet weak var lblBackTitle: UILabel!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var lblHeaderTitle: UILabel!
    @IBOutlet weak var nameView: UIView!
    @IBOutlet weak var messageView: UIView!
    @IBOutlet weak var fieldName: UITextField!
    @IBOutlet weak var fieldMessage: UITextView!
    @IBOutlet weak var submitView: UIView!
    let placeholderLabel = UILabel()
    var viewType = 1
    var profileData = ProfileResponse.init(fromDictionary: [String : Any]())
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        ProfileRequest.instance.fetchUserProfile { data, status in
            self.profileData = data
        }
        if viewType == 1{
            lblBackTitle.text = "Help & Support"
            lblHeaderTitle.text = "Please fill out this form for\nHelp & Support"
        }else if viewType == 2{
            lblBackTitle.text = "Report an issue"
            lblHeaderTitle.text = "Please fill out this form for\nReport An Issue"
        }
        fieldMessage.delegate = self
        backView.addTap { r in
            self.dismissVC()
        }
        // Set up the placeholder label
       fieldMessage.font = Fonts.SFProRegular(12.0)
       placeholderLabel.text = "Message".localized
       placeholderLabel.font = Fonts.SFProRegular(12.0)
       placeholderLabel.textColor = UIColor.init(hex: "#B5B5B5")
       placeholderLabel.frame = CGRect(x: 5, y: 8, width: fieldMessage.frame.width - 10, height: 20)
       placeholderLabel.isHidden = !fieldMessage.text.isEmpty
       fieldMessage.addSubview(placeholderLabel)
       submitView.addTap { r  in
           if self.checkValidation(){
               self.triggerHelpSupport()
           }
        }
    }
    func triggerHelpSupport(){
        var param = ["message" : self.fieldMessage.text ?? "","fullname":self.fieldName.text ?? "","type":viewType] as [String : Any]
        let systemVersion = UIDevice.current.systemVersion
        if let infoDictionary = Bundle.main.infoDictionary {
            let appVersion = infoDictionary["CFBundleShortVersionString"] as? String ?? "Unknown"
            let buildNumber = infoDictionary["CFBundleVersion"] as? String ?? "Unknown"
            param["appVersion"] = appVersion
            param["buildNumber"] = buildNumber
        }
        param["platform"] = "iOS"
        param["osVersion"] = systemVersion
        param["deviceId"] = deviceID
        param["brand"] = "\(UIDevice.current.modelName)"
        param["model"] = "\(UIDevice.current.modelName)"
        param["systemName"] = "iPhone"
        param["systemVersion"] = systemVersion
        param["mobileNumber"] = "\(profileData.countryCode ?? "") \(profileData.mobileNumber ?? "")"
        print(JSON(param))
        EventRequest.instance.triggerAddSupport(param: param) { data, status in
            Utils.showToast(message: data.message)
            self.resetFields()
        }
    }
    func resetFields(){
        mainThread { [self] in
            fieldName.text = ""
            fieldMessage.text = ""
            self.view.endEditing(true)
        }
    }
    func checkValidation() -> Bool{
        let message = fieldMessage.text ?? ""
        if fieldName.text!.isEmpty{
            Utils.showToast(message: "Full name is required")
            return false
        }
        if message.isEmpty{
            Utils.showToast(message: "Message is required")
            return false
        }
        if message.count < 10{
            Utils.showToast(message: "Message must be at least 10 charecters")
            return false
        }
        return true
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        messageView.setCornerRadius(20.0)
        nameView.setCornerRadius(20.0)
    }
}
extension HelpSupportVC:UITextViewDelegate{
   func textViewDidChange(_ textView: UITextView) {
       placeholderLabel.isHidden = !textView.text.isEmpty
   }
   
   func textViewDidBeginEditing(_ textView: UITextView) {
       if textView.text == placeholderLabel.text {
           textView.text = ""
           textView.textColor = UIColor.init(hex: "#161616")
       }
   }
   
   func textViewDidEndEditing(_ textView: UITextView) {
       if textView.text.isEmpty {
           textView.text = placeholderLabel.text
           textView.textColor = UIColor.init(hex: "#B5B5B5")
       }
   }
    func textViewShouldEndEditing(_ textView: UITextView) -> Bool {
        textView.resignFirstResponder()
        return true
    }
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        return true
    }
}
extension UIDevice {
    var modelName: String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let identifier = withUnsafePointer(to: &systemInfo.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) {
                String(validatingUTF8: $0)
            }
        } ?? "Unknown"
        
        // Map known identifiers
        switch identifier {
        case "iPhone13,2": return "iPhone 12"
        case "iPhone13,3": return "iPhone 12 Pro"
        case "iPhone14,5": return "iPhone 13"
        case "iPhone15,2": return "iPhone 14 Pro"
        case "iPhone16,1": return "iPhone 15 Pro"
        case "iPad13,18": return "iPad Air (5th generation)"
        // Add more mappings as needed...
        default: return identifier // fallback to raw model identifier
        }
    }
}
