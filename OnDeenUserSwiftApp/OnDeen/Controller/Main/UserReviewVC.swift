//
//  UserReviewVC.swift
//  OnDeen
//
//  Created by Thabu's Mac on 07/04/25.
//

import UIKit
import IQKeyboardManagerSwift

class UserReviewVC: UIViewController {
    @IBOutlet weak var fieldTitle: UITextField!
    @IBOutlet weak var btnClose: UIButton!
    @IBOutlet weak var submitView: GlobalGradientView!
    @IBOutlet weak var cancelView: GradientBorderView!
    @IBOutlet weak var fieldTextView: UITextView!
    @IBOutlet weak var textBgView: UIView!
    @IBOutlet weak var bgView: UIView!
    let placeholderLabel = UILabel()
    var eventDetail = EventDetailResponse.init(fromDictionary: [String : Any]())
    var itemTapped : (() -> Void)?
    var speakerDetail = SpeakerProfileResponse.init(fromDictionary: [String : Any]())
    override func viewDidLoad() {
        super.viewDidLoad()
        IQKeyboardManager.shared.keyboardDistance = 100 // default is 10
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        fieldTextView.delegate = self
        btnClose.addTap { r in
            if self.fieldTextView.isFirstResponder {
                self.view.endEditing(true)
                return
            }
            self.dismissVC()
        }
        // Set up the placeholder label
       fieldTextView.font = Fonts.SFProRegular(12.0)
       placeholderLabel.text = "Write your comment here".localized
       placeholderLabel.font = Fonts.SFProRegular(12.0)
       placeholderLabel.textColor = UIColor.init(hex: "#B5B5B5")
       placeholderLabel.frame = CGRect(x: 5, y: 8, width: fieldTextView.frame.width - 10, height: 20)
       placeholderLabel.isHidden = !fieldTextView.text.isEmpty
       fieldTextView.addSubview(placeholderLabel)
       submitView.addTap { r  in
            if self.checkValidation(){
                self.triggerEventAddRating()
            }
        }
       cancelView.addTap { r in
            self.closePage()
        }
    }
    func closePage(){
        if self.fieldTextView.isFirstResponder {
            self.view.endEditing(true)
        }
        self.dismissVC()
    }
    func triggerEventAddRating(){
        if speakerDetail.speakerId != 0{
            EventRequest.instance.triggerAddRating(param: ["event_id" : speakerDetail.speakerEventId ?? 0,"user_id" : speakerDetail.speakerId ?? 0,"review":self.fieldTextView.text ?? "","title":fieldTitle.text ?? ""]) { data, status in
                self.itemTapped?()
                self.closePage()
            }
            return
        }
        EventRequest.instance.triggerAddRating(param: ["event_id" : eventDetail.id ?? 0,"review":self.fieldTextView.text ?? "","title":fieldTitle.text ?? ""]) { data, status in
            self.itemTapped?()
            self.closePage()
        }
    }
    func checkValidation() -> Bool {
        let review = fieldTitle.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let note = fieldTextView.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if review.isEmpty {
            Utils.showToast(message: "Please enter the title")
            return false
        }        
        if note.isEmpty {
            Utils.showToast(message: "Please enter the review")
            return false
        }        
        return true
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        self.view.setAlphaBackground()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
        if let review = fieldTitle.superview{
            review.setCornerRadius(20.0)
        }
        textBgView.setCornerRadius(20.0)
        cancelView.config(borderColor: UIColor.init(hex: "#D0D0D0"), borderWidth: 1.0, isRoundCorner: true)
    }
}
extension UserReviewVC:UITextFieldDelegate{
    func textFieldDidBeginEditing(_ textField: UITextField) {
        IQKeyboardManager.shared.keyboardDistance = 150
    }
    func textFieldDidEndEditing(_ textField: UITextField) {
        IQKeyboardManager.shared.keyboardDistance = 10
    }
}
extension UserReviewVC:UITextViewDelegate{
    // UITextViewDelegate methods
       
   func textViewDidChange(_ textView: UITextView) {
       placeholderLabel.isHidden = !textView.text.isEmpty
   }
   
   func textViewDidBeginEditing(_ textView: UITextView) {
       if textView.text == placeholderLabel.text {
           textView.text = ""
           textView.textColor = UIColor.init(hex: "#161616")
       }
       IQKeyboardManager.shared.keyboardDistance = 150
   }
   
   func textViewDidEndEditing(_ textView: UITextView) {
       if textView.text.isEmpty {
           textView.text = placeholderLabel.text
           textView.textColor = UIColor.init(hex: "#B5B5B5")
       }
       IQKeyboardManager.shared.keyboardDistance = 10
   }
    func textViewShouldEndEditing(_ textView: UITextView) -> Bool {
        textView.resignFirstResponder()
        return true
    }
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        return true
    }
}
