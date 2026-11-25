//
//  UILabel+Extension.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 10/08/24.
//

import UIKit
//import SwiftyAttributes
//import CountryPickerView

//background: linear-gradient(91.18deg, #F4F4F4 -139.17%, #FFCC33 -6.5%, #DB3171 92.23%, #422199 209.23%);

var gradientColors = [
    UIColor(hex: "#F4F4F4"),
    UIColor(hex: "#FFCC33"),
    UIColor(hex: "#DB3171"),
    UIColor(hex: "#422199")
]
var gradientColors2 = [
    UIColor(hex: "#FFCC33"),
    UIColor(hex: "#DB3171"),
    UIColor(hex: "#422199")
]
extension UILabel{
    func addUnderline(){
        mainThread{
//            self.attributedText = self.text!.withUnderlineStyle(.single)
        }
    }
//    func setPrivacyPolicy(){
//        mainThread {
//            let attr = NSMutableAttributedString()
//            let paragraphStyle = NSMutableParagraphStyle()
//            paragraphStyle.alignment = (LocalizationSystem.sharedInstance.getLanguage() == "ar") ? .right : .left
//
//            attr.append(StringConstants.proceedAgree.localized.withTextColor(UIColor.init(hex: "#7F7F7F")))
//            attr.append(" ".withTextColor(UIColor.init(hex: "#7F7F7F")))
//            attr.append(StringConstants.termsCondtion.localized.withTextColor(UIColor.init(hex: "#12372A")).withUnderlineStyle(.single))
//            attr.addAttribute(.paragraphStyle, value: paragraphStyle, range: NSRange(location: 0, length: attr.length))
//
//            self.attributedText = attr
//        }
//    }
//    func setMobileHighlight(countryCode: String,mobile:String){
//        mainThread {
//            let fontPrefix = Fonts.AeonikRegular(12.0)
//            let fontSuffix = Fonts.AeonikMedium(12.0)
//            let attr = NSMutableAttributedString()
//            let codeMobile = countryCode + " " + mobile
//            attr.append(StringConstants.otpCode.localized.withTextColor(UIColor.init(hex: "#7F7F7F")).withFont(fontPrefix))
//            attr.append(" ".withTextColor(UIColor.init(hex: "#7F7F7F")))
//            attr.append(codeMobile.withTextColor(UIColor.init(hex: "#3E2F2F")).withFont(fontSuffix))
//            self.attributedText = attr
//        }
//    }
//    func setEmailHighlight(email: String){
//        mainThread {
//            let fontPrefix = Fonts.AeonikRegular(12.0)
//            let fontSuffix = Fonts.AeonikMedium(12.0)
//            let attr = NSMutableAttributedString()
//            let codeMobile = email
//            attr.append(StringConstants.otpCode.localized.withTextColor(UIColor.init(hex: "#7F7F7F")).withFont(fontPrefix))
//            attr.append(" ".withTextColor(UIColor.init(hex: "#7F7F7F")))
//            attr.append(codeMobile.withTextColor(UIColor.init(hex: "#3E2F2F")).withFont(fontSuffix))
//            self.attributedText = attr
//        }
//    }
    
    func applyGradient(colors: [UIColor] = gradientColors,
                           startPoint: CGPoint = CGPoint(x: 0, y: 0),
                           endPoint: CGPoint = CGPoint(x: 1, y: 0),
                           customText: String = "") {
            mainThread { [self] in
                layer.sublayers?.removeAll(where: { $0 is CAGradientLayer }) // Remove previous gradient layers
                
                let gradientLayer = CAGradientLayer()
                gradientLayer.colors = colors.map { $0.cgColor }
                gradientLayer.startPoint = startPoint
                gradientLayer.endPoint = endPoint
                gradientLayer.frame = bounds
                
                let textLayer = CATextLayer()
                textLayer.string = customText.isEmpty ? text ?? "" : customText
                textLayer.font = CTFontCreateWithName((font.fontName as CFString), font.pointSize, nil)
                textLayer.fontSize = font.pointSize
                textLayer.alignmentMode = .center
                textLayer.contentsScale = UIScreen.main.scale
                textLayer.frame = bounds
                textLayer.foregroundColor = UIColor.black.cgColor
                
                gradientLayer.mask = textLayer
                layer.addSublayer(gradientLayer)
            }
        }
    func html2String(string: String, customFont: UIFont, color: UIColor) {
        // Trim leading/trailing whitespaces and newlines before parsing HTML
        let sanitizedString = string.trimmingCharacters(in: .whitespacesAndNewlines)

        guard let data = sanitizedString.data(using: .utf8) else {
            self.text = sanitizedString
            return
        }

        do {
            let attributedString = try NSMutableAttributedString(
                data: data,
                options: [
                    .documentType: NSAttributedString.DocumentType.html,
                    .characterEncoding: String.Encoding.utf8.rawValue
                ],
                documentAttributes: nil
            )

            // Apply text style
            let paragraphStyle = NSMutableParagraphStyle()
            paragraphStyle.lineBreakMode = .byWordWrapping
            paragraphStyle.paragraphSpacing = 4

            attributedString.addAttributes(
                [
                    .font: customFont,
                    .foregroundColor: color,
                    .paragraphStyle: paragraphStyle
                ],
                range: NSRange(location: 0, length: attributedString.length)
            )

            // ✅ Remove trailing whitespace or newline characters after rendering
            let trimmedText = attributedString.string.trimmingCharacters(in: .whitespacesAndNewlines)
            let finalAttributed = NSMutableAttributedString(string: trimmedText, attributes: [
                .font: customFont,
                .foregroundColor: color,
                .paragraphStyle: paragraphStyle
            ])

            self.attributedText = finalAttributed
            self.numberOfLines = 0
            self.lineBreakMode = .byWordWrapping

            // ✅ Force layout update
            DispatchQueue.main.async {
                self.setNeedsLayout()
                self.layoutIfNeeded()
            }
        } catch {
            self.text = sanitizedString
        }
    }
//    func html2String(string: String, customFont: UIFont, color: UIColor) {
//        var sanitizedString = string
//        
//        // Remove only the last newline character if present
//        if sanitizedString.hasSuffix("\n") {
//            sanitizedString.removeLast()
//        }
//        
//        sanitizedString = sanitizedString.trimmingCharacters(in: .whitespacesAndNewlines)
//
//        if let data = sanitizedString.data(using: .utf8) {
//            do {
//                let attributedString = try NSMutableAttributedString(
//                    data: data,
//                    options: [
//                        .documentType: NSAttributedString.DocumentType.html,
//                        .characterEncoding: String.Encoding.utf8.rawValue
//                    ],
//                    documentAttributes: nil
//                )
//
//                attributedString.addAttributes(
//                    [
//                        .font: customFont,
//                        .foregroundColor: color
//                    ],
//                    range: NSRange(location: 0, length: attributedString.length)
//                )
//                if attributedString.string.hasSuffix("\n") {
//                    let newLength = attributedString.length - 1
//                    attributedString.replaceCharacters(in: NSRange(location: newLength, length: 1), with: "")
//                }
//                self.attributedText = attributedString
//            } catch {
//                self.text = sanitizedString
//            }
//        } else {
//            self.text = sanitizedString
//        }
//    }
}
extension String {
    func htmlToAttributedString(customFont: UIFont, color: UIColor) -> NSMutableAttributedString {
        let sanitizedString = self.replacingOccurrences(of: "\n", with: "<br>").trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard let data = sanitizedString.data(using: .utf8) else {
            return NSMutableAttributedString(string: self, attributes: [.font: customFont, .foregroundColor: color])
        }

        do {
            let attributedString = try NSMutableAttributedString(
                data: data,
                options: [
                    .documentType: NSAttributedString.DocumentType.html,
                    .characterEncoding: String.Encoding.utf8.rawValue
                ],
                documentAttributes: nil
            )

            // Apply custom font and color
            attributedString.addAttributes(
                [
                    .font: customFont,
                    .foregroundColor: color
                ],
                range: NSRange(location: 0, length: attributedString.length)
            )
            
            return attributedString
        } catch {
            return NSMutableAttributedString(string: self, attributes: [.font: customFont, .foregroundColor: color])
        }
    }
}
