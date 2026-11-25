//
//  TSFieldView.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 13/08/24.
//

import UIKit
import PhoneNumberKit
import IQKeyboardManagerSwift
enum KeyboardType{
    case none
    case firstName
    case lastName
    case mobileNo
    case emailId
    case gender
    case password
    case confirmPassword
    case age
    case agee
    
    
    case houseNo
    case apartment
    case city
}
class TSFieldView: UIView {
    @IBOutlet weak var imgInfoView: UIImageView!
    @IBOutlet weak var tapButton: UIButton!
    @IBOutlet weak var imgArrow: UIImageView!
    @IBOutlet weak var fieldItem: SFProField!
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var contentView: UIView!
    override init(frame: CGRect) {
        super.init(frame: frame)
        initialSetup()
    }
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initialSetup()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.config(isRoundCorner: true)
    }
    private func initialSetup() {
        Bundle.main.loadNibNamed("TSFieldView", owner: self, options: nil)
        contentView.frame = self.bounds
        contentView.autoresizingMask = [.flexibleWidth,.flexibleHeight]
        contentView.translatesAutoresizingMaskIntoConstraints = true
        addSubview(contentView)
        imgInfoView.addTap { r in
            if let topVC = topViewController() {
                topVC.view.endEditing(true)
                if let vc: JourneyInfoVC = topVC.getController(from: .authentication) {
                    topVC.presentVC(vc: vc)
                }
            }
        }
    }
    func config(keyType : KeyboardType = .none,placeHolder:String = "",showArrow : Bool = false, showRightView : Bool = false,isDropDown : Bool = false, isKeyActive : Bool = true,text:String = "", rightViewText: String = "",headerTitle: String = "",extra:Any = [String:Any](),showInfoView:Bool = false,completion: @escaping (Any) -> Void){
        imgInfoView.isHidden = !showInfoView
        fieldItem.textAlignment = LocalizationSystem.sharedInstance.getLanguage() == "ar" ? .right : .left
        fieldItem.text = text
        lblHeaderTitle.text = headerTitle.localized
        fieldItem.placeholder = "  \(placeHolder.localized)  "
        imgArrow.isHidden = !showArrow
        fieldItem.isUserInteractionEnabled = !isDropDown
        if !isKeyActive || keyType == .gender{
            fieldItem.isUserInteractionEnabled = false
        }
        tapButton.isHidden = true
        if keyType == .gender{
        }else if keyType == .emailId{
            self.fieldItem.keyboardType = .emailAddress
        }else if keyType == .password || keyType == .confirmPassword{
            self.fieldItem.isSecureTextEntry = true
            addPasswordToggleIcon()
        }else if keyType == .agee{
            self.fieldItem.keyboardType = .numberPad
        }
        if isDropDown{
            self.addTap { r in
                completion(r)
            }
        }
        self.fieldItem.onTextChange { text in
            if keyType == .firstName || keyType == .lastName {
                let allowedCharacters = CharacterSet.letters.union(.whitespaces)
                let filteredText = text.unicodeScalars.filter { allowedCharacters.contains($0) }
                
                if filteredText.count != text.count {
                    if var text = self.fieldItem.text, !text.isEmpty {
                        text.removeLast()
                        self.fieldItem.text = text
                    }
                    return
                }
            }

            // 🚨 Prevent spaces in password and confirm password
            if keyType == .password || keyType == .confirmPassword {
                if text.contains(" ") {
                    self.fieldItem.text = text.replacingOccurrences(of: " ", with: "")
                    return
                }
            }

            if text.hasPrefix(" ") {
                self.fieldItem.text = text.trimmingCharacters(in: .whitespaces)
            } else {
                self.fieldItem.text = text
                completion(text)
            }
        }
//        self.fieldItem.onTextChange { text in
//            if keyType == .firstName || keyType == .lastName {
//                let allowedCharacters = CharacterSet.letters.union(.whitespaces)
//                let filteredText = text.unicodeScalars.filter { allowedCharacters.contains($0) }
//                
//                if filteredText.count != text.count {
//                    if var text = self.fieldItem.text, !text.isEmpty {
//                        text.removeLast()
//                        self.fieldItem.text = text
//                    }
//                    return
//                }
//            }
//
//
//            if text.hasPrefix(" ") {
//                self.fieldItem.text = text.trimmingCharacters(in: .whitespaces)
//            } else {
//                self.fieldItem.text = text
//                completion(text)
//            }
//        }
        self.fieldItem.onReturns {
            self.fieldItem.resignFirstResponder()
        }
    }
    private func addPasswordToggleIcon() {
        let toggleButton = UIButton(type: .custom)
        toggleButton.setImage(UIImage(named: "eye_icon"), for: .normal) // Replace with your "eye" icon
        toggleButton.setImage(UIImage(named: "eye_slash_icon"), for: .selected) // Replace with your "eye slash" icon
        toggleButton.frame = CGRect(x: 0, y: 0, width: 30, height: 30)
        toggleButton.addTarget(self, action: #selector(togglePasswordVisibility), for: .touchUpInside)
        fieldItem.rightView = toggleButton
        fieldItem.rightViewMode = .always
    }
    @objc private func togglePasswordVisibility(_ sender: UIButton) {
        sender.isSelected.toggle()
        fieldItem.isSecureTextEntry.toggle()
    }
}
