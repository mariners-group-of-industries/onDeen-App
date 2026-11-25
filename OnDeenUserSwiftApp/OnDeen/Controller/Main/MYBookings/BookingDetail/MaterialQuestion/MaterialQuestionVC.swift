//
//  MaterialQuestionVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit
import IQKeyboardManagerSwift

class MaterialQuestionVC: UIViewController {
    @IBOutlet weak var btnClose: UIButton!
    @IBOutlet weak var lblDiscard: SFProLabel!
    @IBOutlet weak var lblAddNote: SFProLabel!
    @IBOutlet weak var lblSaveNote: SFProLabel!
    @IBOutlet weak var fieldDesc: UITextView!
    @IBOutlet weak var fieldTitle: SFProField!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var bgView: UIView!
    let placeholderLabel = UILabel()
    var isFromNote = false
    var isEditNote = false
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var noteData = EventNotesResponse.init(fromDictionary: [String : Any]())
    var noteTapped : (([String:Any]) -> Void)?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
            NotificationCenter.default.removeObserver(self, name: UIResponder.keyboardWillShowNotification, object: nil)
            NotificationCenter.default.removeObserver(self, name: UIResponder.keyboardWillHideNotification, object: nil)
//        }
    }
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
            NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillShow), name: UIResponder.keyboardWillShowNotification, object: nil)
            NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillHide), name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    @objc func keyboardWillShow(notification: NSNotification) {
        if let topVC = topViewController(){
            if topVC == self{
                if let keyboardFrame = (notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue {
                    UIView.animate(withDuration: 0.3) {
                        if let sup = self.bgView{
                            sup.transform = CGAffineTransform(translationX: 0, y: -keyboardFrame.height)
                        }
                    }
                }
            }
        }
        
    }

    @objc func keyboardWillHide(notification: NSNotification) {
        if let topVC = topViewController(){
            if topVC == self{
                UIView.animate(withDuration: 0.3) {
                    if let sup = self.bgView{
                        sup.transform = .identity
                    }
                }
            }
        }
    }

    func config(){
        btnClose.addTap { r in
            if self.fieldTitle.isFirstResponder || self.fieldDesc.isFirstResponder {
                self.view.endEditing(true)
                return
            }
            self.dismissVC()
        }
        backView.addTap { r in
            self.dismissVC()
        }
        lblSaveNote.addTap { r in
            if self.checkValidation(){
                if self.isFromNote{
                    self.triggerAddNote()
                }else{
                    self.triggerAddQuestion()
                }
            }
        }
        if !isFromNote{
            lblAddNote.text = "Done".localized
            lblDiscard.text = "Back".localized
        }
        // Set up the placeholder label
       fieldDesc.font = Fonts.SFProRegular(12.0)
       placeholderLabel.text = "Paragraph".localized
       placeholderLabel.font = Fonts.SFProRegular(12.0)
       placeholderLabel.textColor = UIColor.init(hex: "#B5B5B5")
       placeholderLabel.frame = CGRect(x: 5, y: 8, width: fieldDesc.frame.width - 10, height: 20)
       placeholderLabel.isHidden = !fieldDesc.text.isEmpty
       fieldDesc.addSubview(placeholderLabel)
       fieldDesc.isUserInteractionEnabled = isFromNote
        placeholderLabel.isHidden = !isFromNote
        if isEditNote{
            placeholderLabel.isHidden = true
            self.fieldTitle.text = noteData.title
            self.fieldDesc.text = noteData.notes
        }
    }
    func checkValidation() -> Bool {
        let note = fieldDesc.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let title = fieldTitle.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        
        if title.isEmpty {
            Utils.showToast(message: "Please enter the title")
            return false
        }
        
        if note.isEmpty && self.isFromNote {
            Utils.showToast(message: "Please enter the paragraph")
            return false
        }
        
        return true
    }
    func triggerAddNote(){
        let note = fieldDesc.text ?? ""
        let title = fieldTitle.text ?? ""
        var param = ["event_id":eventDetailData.id ?? 0,
                     "note":note,
                     "title":title] as [String : Any]
        if isEditNote{
            param["id"] = self.noteData.id ?? 0
        }
        EventRequest.instance.triggerEventAddNote(param: param) { response, status in
            if status{
                self.noteTapped?(param)
                self.dismissVC()
            }
            Utils.showToast(message: response.message)
        }
    }
    func triggerAddQuestion(){
        let note = fieldTitle.text ?? ""
        let param = ["event_id":eventDetailData.id ?? 0,
                     "question":note] as [String : Any]
        EventRequest.instance.triggerAddQuestion(param: param) { response, status in
            if status{
                self.noteTapped?(param)
                self.dismissVC()
            }
            Utils.showToast(message: response.message)
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        self.view.setAlphaBackground()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
    }

}
extension MaterialQuestionVC:UITextViewDelegate{
    // UITextViewDelegate methods
       
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
