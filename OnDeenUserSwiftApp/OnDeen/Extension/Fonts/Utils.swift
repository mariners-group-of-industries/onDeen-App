//
//
//
//
//
//
//
import AppTrackingTransparency
import StoreKit
func mainThread(_ function: @escaping ()->()) {
    DispatchQueue.main.async(execute: function)
}
func delay(_ delay: Double, function: @escaping ()->()) {
    DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + Double(Int64(delay * Double(NSEC_PER_SEC))) / Double(NSEC_PER_SEC), execute: function)
}

class Utils {
    
    static let appDelegate = UIApplication.shared.delegate as! AppDelegate
    static let sizeScreen = UIScreen.main.bounds.size
    static func showToast(message:String){
        mainThread {
            ToastAppearanceManager.default.backgroundColor = UIColor.init(hex: "#422199")
            ToastAppearanceManager.default.textColor = .white
            ToastAppearanceManager.default.height = AutomaticDimension
            ToastAppearanceManager.default.textFont = Fonts.SFProMedium(20.0)
            ToastAppearanceManager.default.textAlignment = .center
            let toast: Toast = Toast.default(text: message.localized, direction: .top)
            toast.show()
            DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
                toast.dismiss()
            }
        }
    }
    
    static func size(_ iphone: CGFloat) -> CGFloat {
        var widthScreen = sizeScreen.width
        if widthScreen > sizeScreen.height {
            widthScreen = sizeScreen.height
        }
        let widthReference: CGFloat = 375
        let value = (iphone * widthScreen)/widthReference
        return value
    }
    
    static func iterateEnum<T: Hashable>(_: T.Type) -> AnyIterator<T> {
        var i = 0
        return AnyIterator {
            let next = withUnsafeBytes(of: &i) { $0.load(as: T.self) }
            if next.hashValue != i { return nil }
            i += 1
            return next
        }
    }
}
