//
//
//
//
//
//
//

import UIKit

enum Language: String
{
    case english = "en"
    case arabic = "ar"
    
    static func allValues() -> [Language]
    {
        return [.english, .arabic]
        
    }
    
    func serverValue() -> String
    {
        switch self
        {
            case .english: return "en-en"
            case .arabic: return "ar-ar"
        }
    }
    
    static var current: Language!
    static let defaultLanguage = "en"
    
    
    
    // MARK: PickerInterface Methods
    func namePicker() -> String
    {
        return "language_\(self.rawValue)".localized
    }
}

extension String
{
    var localized: String
    {
        return LocalizationSystem.sharedInstance.localizedStringForKey(key: self, comment: "")
    }
    
    var localizedImage: UIImage?
    {
        return localizedImage()
            ?? localizedImage(type: ".png")
            ?? localizedImage(type: ".jpg")
            ?? localizedImage(type: ".jpeg")
            ?? UIImage(named: self)
    }
    
    private func localizedImage(type: String = "") -> UIImage?
    {
        guard let imagePath = Bundle.localizedBundle.path(forResource: self, ofType: type) else {
            return nil
        }
        
        return UIImage(contentsOfFile: imagePath)
    }
}

extension Bundle
{
    static var localizedBundle: Bundle
    {
        guard let path = Bundle.main.path(forResource: Language.current.rawValue, ofType: "lproj") else {
            return Bundle.main
        }
        
        return Bundle(path: path)!
    }
}
