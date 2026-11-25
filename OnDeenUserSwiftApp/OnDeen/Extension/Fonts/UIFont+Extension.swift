//
//  UIFont+Extension.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 07/08/24.
//

import UIKit


class Fonts
{
    static func SFProRegular(_ iphone: CGFloat) -> UIFont { return UIFont(name: Font.FontType.SFProRegular.rawValue, size:  Utils.size(iphone))! }
    static func SFProMedium(_ iphone: CGFloat) -> UIFont { return UIFont(name: Font.FontType.SFProMedium.rawValue, size:  Utils.size(iphone))! }
    static func SFProBold(_ iphone: CGFloat) -> UIFont { return UIFont(name: Font.FontType.SFProBold.rawValue, size:  Utils.size(iphone))! }
    static func PingMedium(_ iphone: CGFloat) -> UIFont { return UIFont(name: Font.FontType.SFProMedium.rawValue, size:  Utils.size(iphone))! }
    static func AllRoundDemi(_ iphone: CGFloat) -> UIFont { return UIFont(name: Font.FontType.allRoundRegular.rawValue, size:  Utils.size(iphone))! }
    static func AllRoundBold(_ iphone: CGFloat) -> UIFont { return UIFont(name: Font.FontType.allRoundBold.rawValue, size:  Utils.size(iphone))! }

}


struct Font {
    enum FontType : String{
        case SFProThin = "SFProRounded-Thin"
        case SFProLight = "SFProRounded-Light"
        case SFProRegular = "SFProRounded-Regular"
        case SFProMedium = "SFProRounded-Medium"
        case SFProBold = "SFProRounded-Bold"
        case SFProBlack = "SFProRounded-Black"

        case allRoundRegular = "FONTSPRINGDEMO-AllRoundGothicDemiRegular"
        case allRoundMedium = "FONTSPRINGDEMO-AllRoundGothicMediumRegular"
        case allRoundBold = "FONTSPRINGDEMO-AllRoundGothicBoldRegular"
        
        case none = ""
    }
    enum FontFamily {
        case SFPro
        case AllRound
        case none
    }
}
// ---------------- SFPro ---------------- //
@IBDesignable
class SFProLabel:UILabel{
    @IBInspectable var fontWeight: Int = 0 {
        didSet {
            self.accessibilityLanguage = "\(fontWeight)"
            self.setup()
        }
    }
    override func awakeFromNib() {
        super.awakeFromNib()
        setup()
    }
    func setup(size : CGFloat = 0.0) {
        self.text = self.text?.localized
        let fontName = self.font?.fontName ?? "regular"
        self.setFontStyle(family: .SFPro, size: self.font?.pointSize ?? 0.0, fontWeight: fontName.getFontType())
    }
}
@IBDesignable

class SFProField:UITextField{
    @IBInspectable var fontWeight: Int = 0 {
        didSet {
            setup()
        }
    }
    override func awakeFromNib() {
        super.awakeFromNib()
        setup()
    }
    func setup() {
        self.placeholder = self.placeholder?.localized
        let fontName = self.font?.fontName ?? "regular"
        self.setFontStyle(family: .SFPro, size: self.font?.pointSize ?? 0.0, fontWeight: fontName.getFontType())
        
        let paddingView = UIView(frame: CGRect(x: 0, y: 0, width: self.tag == 100 ? 8.0 : 24, height: self.frame.height))
        self.leftView = paddingView
        self.leftViewMode = .always
    }
}
@IBDesignable
class SFProButton:UIButton{
    @IBInspectable var fontWeight: Int = 0 {
        didSet {
            self.accessibilityLanguage = "\(fontWeight)"
            self.setup()
        }
    }
    override func awakeFromNib() {
        super.awakeFromNib()
        setup()
    }
    func setup() {
        let appText = self.titleLabel?.text ?? ""
        self.setTitle(appText.localized, for: .normal)
        
        let fontName = self.titleLabel?.font?.fontName ?? "regular"
        self.setFontStyle(family: .SFPro, size: self.titleLabel?.font?.pointSize ?? 0.0, fontWeight: fontName.getFontType())
    }
}
// ---------------- SFPro ---------------- //

// ---------------- All Rounder ---------------- //
@IBDesignable
class AllRoundLabel:UILabel{
    @IBInspectable var fontWeight: Int = 0 {
        didSet {
            self.accessibilityLanguage = "\(fontWeight)"
            self.setup()
        }
    }
    override func awakeFromNib() {
        super.awakeFromNib()
        setup()
    }
    func setup(size : CGFloat = 0.0) {
        self.text = self.text?.localized
        let fontName = self.font?.fontName ?? "regular"
        self.setFontStyle(family: .AllRound, size: self.font?.pointSize ?? 0.0, fontWeight: fontName.getFontType())
    }
}
@IBDesignable

class AllRoundField:UITextField{
    @IBInspectable var fontWeight: Int = 0 {
        didSet {
            setup()
        }
    }
    override func awakeFromNib() {
        super.awakeFromNib()
        setup()
    }

    func setup() {
        self.placeholder = self.placeholder?.localized
        let fontName = self.font?.fontName ?? "regular"
        self.setFontStyle(family: .AllRound, size: self.font?.pointSize ?? 0.0, fontWeight: fontName.getFontType())
    }
}
@IBDesignable
class AllRoundButton:UIButton{
    @IBInspectable var fontWeight: Int = 0 {
        didSet {
            self.accessibilityLanguage = "\(fontWeight)"
            self.setup()
        }
    }
    override func awakeFromNib() {
        super.awakeFromNib()
        setup()
    }
    func setup() {
        let appText = self.titleLabel?.text ?? ""
        self.setTitle(appText.localized, for: .normal)
        
        let fontName = self.titleLabel?.font?.fontName ?? "regular"
        self.setFontStyle(family: .AllRound, size: self.titleLabel?.font?.pointSize ?? 0.0, fontWeight: fontName.getFontType())
    }
}
// ---------------- SFPro ---------------- //

extension UIView{
    func setFontStyle(family:Font.FontFamily = .none,size:CGFloat, fontWeight:Int){
        var light = Font.FontType.none
        var regular = Font.FontType.none
        var medium = Font.FontType.none
        var semibold = Font.FontType.none
        var bold = Font.FontType.none
        var heavy = Font.FontType.none
        var black = Font.FontType.none
        if family == .SFPro{
            light = Font.FontType.SFProThin
            regular = Font.FontType.SFProRegular
            medium = Font.FontType.SFProMedium
            semibold = Font.FontType.SFProMedium
            bold = Font.FontType.SFProBold
            heavy = Font.FontType.SFProBlack
            black = Font.FontType.SFProBlack
        }else if family == .AllRound{
            light = Font.FontType.allRoundRegular
            regular = Font.FontType.allRoundRegular
            medium = Font.FontType.allRoundMedium
            semibold = Font.FontType.allRoundMedium
            bold = Font.FontType.allRoundBold
            heavy = Font.FontType.allRoundBold
            black = Font.FontType.allRoundBold
        }
        var font = UIFont.init(name: regular.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
//        let fontWeight = Int(self.accessibilityLanguage ?? "") ?? 400
        if fontWeight == 100{
            font = UIFont.init(name: light.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 200{
            font = UIFont.init(name: light.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 300{
            font = UIFont.init(name: light.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 400{
            font = UIFont.init(name: regular.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 500{
            font = UIFont.init(name: medium.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 600{
            font = UIFont.init(name: semibold.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 700{
            font = UIFont.init(name: bold.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 800{
            font = UIFont.init(name: black.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }else if fontWeight == 900{
            font = UIFont.init(name: heavy.rawValue, size: size) ?? UIFont.systemFont(ofSize: size)
        }
        if let getLbl = self as? UILabel{
            if family == .AllRound{
                let attributedString = NSAttributedString(
                    string: getLbl.text!,
                    attributes: [.font: font]
                )
                getLbl.attributedText = attributedString
            }else{
                getLbl.font = font
            }
        }else if let getLbl = self as? UITextField{
            getLbl.placeholder = getLbl.placeholder?.localized
            getLbl.font = font
        }else if let getLbl = self as? UIButton{
            getLbl.titleLabel?.text = getLbl.titleLabel?.text?.localized
            getLbl.titleLabel?.font = font
        }
    }
}
extension String{
    func getFontType() -> Int{
        if self.lowercased().contains("light"){
            return 100
        }else if self.lowercased().contains("regular"){
            return 400
        }else if self.lowercased().contains("medium"){
            return 500
        }else if self.lowercased().contains("semibold"){
            return 600
        }else if self.lowercased().contains("bold"){
            return 700
        }else if self.lowercased().contains("heavy"){
            return 900
        }else if self.lowercased().contains("black"){
            return 800
        }
        return 400
    }
}

/*
 Common Font Weights
 100: Thin
 200: Extra Light (Ultra Light)
 300: Light
 400: Regular (Normal)
 500: Medium
 600: Semi Bold (Demi Bold)
 700: Bold
 800: Extra Bold (Ultra Bold)
 900: Black (Heavy)
 */
