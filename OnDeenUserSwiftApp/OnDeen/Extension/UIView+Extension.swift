

import UIKit
import SDWebImage
import SVGKit
import SDWebImageSVGCoder

extension UIView
{
    func addTap(function: @escaping (UITapGestureRecognizer)->()) {
        self.isUserInteractionEnabled = true
        self.addTapGesture { gesture in
            function(gesture)
        }
    }
    
    func setAlphaBackground(){
        mainThread{
            self.backgroundColor = UIColor.init(red: 31.0/255.0, green: 31.0/255.0, blue: 31.0/255.0, alpha: 0.5)
        }
    }

    func setBorder(color: UIColor, width: CGFloat)
    {
        self.layer.borderColor = color.cgColor
        self.layer.borderWidth = width
    }
    
    func setCornerRadius(_ radius: CGFloat)
    {
        self.layer.cornerRadius = radius
        self.clipsToBounds = true
    }
    
    func setCornerRadius(_ corners: UIRectCorner, radius: CGFloat = 10, borderColor: UIColor = .clear, borderWidth : CGFloat = 1.0)
    {
        delay(0.1, function:
        {
            let path = UIBezierPath(roundedRect: self.bounds, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
            
            let mask = CAShapeLayer()
            mask.path = path.cgPath
            self.layer.mask = mask

            // Add border
           let borderLayer = CAShapeLayer()
           borderLayer.path = mask.path // Reuse the Bezier path
           borderLayer.fillColor = UIColor.clear.cgColor
            borderLayer.strokeColor = borderColor.cgColor
           borderLayer.lineWidth = borderWidth
            borderLayer.frame = self.bounds
            self.layer.addSublayer(borderLayer)


        })
    }
    
    
    func config(cornerRadius:CGFloat = 0.0,borderColor:UIColor = UIColor.clear, borderWidth : CGFloat = 0.0, isRoundCorner:Bool = false){
        if isRoundCorner{
            self.setCornerRadius(self.bounds.height / 2)
        }else{
            self.setCornerRadius(cornerRadius)
        }
        self.setBorder(color: borderColor, width: borderWidth)
    }
    func addTopShadow() {
        // Configure shadow properties
        self.layer.shadowColor = UIColor.black.cgColor // Shadow color
        self.layer.shadowOpacity = 0.5                 // Shadow opacity
        self.layer.shadowOffset = CGSize(width: 0, height: -2) // Shadow offset
        self.layer.shadowRadius = 4                    // Shadow radius

        // Optionally set a shadow path for performance optimization
        let shadowRect = CGRect(x: 0, y: 0, width: self.bounds.width, height: 10) // Shadow size
        self.layer.shadowPath = UIBezierPath(rect: shadowRect).cgPath
    }
}
extension UISearchBar{
    func setSearchBackgroundColor(color:UIColor){
        self.barTintColor = color
        self.setBackgroundImage(UIImage.init(), for: UIBarPosition.any, barMetrics: UIBarMetrics.default)
        if let textfield = self.value(forKey: "searchField") as? UITextField {
            if let backgroundview = textfield.subviews.first {
                backgroundview.backgroundColor = color
            }
        }
    }
}
extension UISegmentedControl{
    func customizeSegmentedControl(backgroundColor:UIColor, tintColor:UIColor, selectedColor : UIColor, unselectedColor:UIColor, fontSize:CGFloat) {
        self.backgroundColor = backgroundColor
           // Customize the text color and background for selected segment
        self.selectedSegmentTintColor = tintColor // Background color for selected segment
           
           // Set text attributes for the selected and unselected states
//        let normalTextAttributes: [NSAttributedString.Key: Any] = [
//            .foregroundColor: unselectedColor
//        ]
        let normalTextAttributes: [NSAttributedString.Key: Any] = [
            .foregroundColor: unselectedColor,
            .font: Fonts.SFProMedium(fontSize)
        ]
        let selectedTextAttributes: [NSAttributedString.Key: Any] = [
            .foregroundColor: selectedColor,
            .font: Fonts.SFProMedium(fontSize)
        ]
        self.setTitleTextAttributes(normalTextAttributes, for: .normal)   // Text color for unselected segments
        self.setTitleTextAttributes(selectedTextAttributes, for: .selected) // Text color for selected segment
    }
}
class CircleImageView: UIImageView
{
    override func layoutSubviews()
    {
        super.layoutSubviews()
        
        self.layer.cornerRadius = self.frame.size.width/2.0
        
        self.contentMode = .scaleAspectFill
        self.layer.masksToBounds = true
    }
}
extension UIControl {
    func addTargetClosure(closure: @escaping () -> ()) {
        let sleeve = ClosureSleeve(closure)
        addTarget(sleeve, action: #selector(ClosureSleeve.invoke), for: .touchUpInside)
        objc_setAssociatedObject(self, "[\(arc4random())]", sleeve, objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN)
    }
}

class ClosureSleeve {
    let closure: () -> ()

    init(_ closure: @escaping () -> ()) {
        self.closure = closure
    }

    @objc func invoke() {
        closure()
    }
}
extension UIImageView{
    func loadAsyncImage(loadURL:String){
        self.tintColor = .lightGray
        let currentUrl = loadURL
        let image = UIImage(named: "splash_logo") ?? UIImage()
        let trimmedString  = currentUrl.trimmingCharacters(in: NSCharacterSet.whitespaces)
        let urlNew:String = trimmedString.replacingOccurrences(of: " ", with: "%20")
        if urlNew.count > 0{
            if let url = URL(string: urlNew) {
                if url.pathExtension.lowercased() == "svg" {
                    let svgCoder = SDImageSVGCoder.shared
                    SDImageCodersManager.shared.addCoder(svgCoder)
                }
                self.sd_setImage(with: url, placeholderImage: image)
            }else{
                self.image = image
            }
        }else{
            self.image = image
        }
    }
    func loadAsyncImageWithPlaceholder(loadURL:String,placeHolder:String){
        let currentUrl = loadURL
        let image = UIImage(named: placeHolder) ?? UIImage()
        let trimmedString  = currentUrl.trimmingCharacters(in: NSCharacterSet.whitespaces)
        let urlNew:String = trimmedString.replacingOccurrences(of: " ", with: "%20")
        if urlNew.count > 0{
            if let url = URL(string: urlNew) {
                if url.pathExtension.lowercased() == "svg" {
                    if url.pathExtension.lowercased() == "svg" {
                        let svgCoder = SDImageSVGCoder.shared
                        SDImageCodersManager.shared.addCoder(svgCoder)
                    }
                }
                self.sd_setImage(with: url, placeholderImage: image)
            }else{
                self.image = image
            }
        }else{
            self.image = image
        }
    }
}


