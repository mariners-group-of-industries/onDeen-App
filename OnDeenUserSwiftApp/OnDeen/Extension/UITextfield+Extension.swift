//
//  UITextfield+Extension.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 08/08/24.
//

import UIKit
import PhoneNumberKit

extension UITextField{
    func setPlaceholderColor(color:UIColor){
        let placeholderText = self.placeholder ?? ""
        let attributes: [NSAttributedString.Key: Any] = [
            .foregroundColor: color
        ]
        self.attributedPlaceholder = NSAttributedString(string: placeholderText, attributes: attributes)
    }
    func restrictFieldInputs(charecterLength: Int) {
        self.didBeginEditing {
            // UITextField did begin editing
        }.shouldClear {
            true
        }.shouldReturn {
            true
        }.shouldChangeCharacters { range, string in
            // Combine existing + new input
            let currentText = self.text ?? ""
            guard let textRange = Range(range, in: currentText) else { return false }
            var updatedText = currentText.replacingCharacters(in: textRange, with: string)
            
            // 🚫 Rule 1: Remove emojis
//            if self.containsEmoji(data: string) {
//                return false
//            }

            // 🚫 Rule 2: Remove spaces
            updatedText = updatedText.replacingOccurrences(of: " ", with: "")

            // 🚫 Rule 3: Prevent leading "0"
            if updatedText.hasPrefix("0") {
                updatedText.removeFirst()
            }

            // 🚫 Rule 4: Enforce max length (even for pasted text)
            if updatedText.count > charecterLength {
                let allowedText = String(updatedText.prefix(charecterLength))
                self.text = allowedText
                return false
            }

            // ✅ Assign sanitized text
            self.text = updatedText
            return false
        }.onEditingEnded {
            // Cleanup on end
            let cleaned = self.text?.replacingOccurrences(of: " ", with: "") ?? ""
            self.text = cleaned
            self.resignFirstResponder()
        }
    }
    func restrictFieldInputs1(charecterLength:Int){
        self.didBeginEditing {
                // UITextField did begin editing code
            }.shouldClear {
                true
            }.shouldReturn(handler: {
                return true
            }) .shouldChangeCharacters { range, string in
                if self.containsEmoji(data:string) { return true }
                // Map Arabic digits to English digits
                let range1 = string.rangeOfCharacter(from: .whitespaces)
                if ((self.text?.count)! == 0 && range1  != nil)
                || ((self.text?.count)! > 0 && self.text?.last  == " " && range1 != nil)  {
                    return false
                }
                let textCount = string.count + self.text!.count - range.length
                if textCount > 0 {
                    return textCount <= charecterLength
                }
                return true
        }.onEditingEnded {
            let sub = self.text!.trimmingCharacters(in: NSCharacterSet.whitespaces)
            self.text = sub
            self.resignFirstResponder()
        }
    }
    func containsEmoji(data:String) -> Bool {
        if ["0","1","2","3","4","5","6","7","8","9"].contains(data){
            return false
        }
        for scalar in data.unicodeScalars {
            if !scalar.properties.isEmoji { continue }
            return true
        }
        return false
    }
}



private var textFieldOnTextChangeClosureKey: UInt8 = 0

extension UITextField {
    // Define the closure type
    typealias TextChangeClosure = (String) -> Void

    // Store the closure using associated objects
    private var onTextChangeClosure: TextChangeClosure? {
        get {
            return objc_getAssociatedObject(self, &textFieldOnTextChangeClosureKey) as? TextChangeClosure
        }
        set {
            objc_setAssociatedObject(self, &textFieldOnTextChangeClosureKey, newValue, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            addTarget(self, action: #selector(textFieldDidChange(_:)), for: .editingChanged)
        }
    }

    // Method to set the closure
    func onTextChange(handler: @escaping TextChangeClosure) {
        self.onTextChangeClosure = handler
    }

    // The method that calls the closure when text changes
    @objc private func textFieldDidChange(_ textField: UITextField) {
        onTextChangeClosure?(textField.text ?? "")
    }
}


