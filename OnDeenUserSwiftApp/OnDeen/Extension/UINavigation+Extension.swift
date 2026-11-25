//
//  UINavigation+Extension.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 09/08/24.
//
var isDirectLogin = false
enum Storyboard: String {
    case main = "Main"
    case authentication = "Authentication"
}
enum Controller:String {
    case homeVC = "MainTabVC"
    case loginVC = "ViewController"
    case membershipVC = "MembershipVC"
    case LoginEmailVC = "LoginEmailVC"
}
enum CellConfig : String{
    case topRated = "Top rated outlets"
    case outletOffers = "Outlets with great Offer"
    case nearYour = "Nearby you"
    case nearHairOffer = "Outlet offering hair services"
    
    case quickFilters = "Quick Filters"
    case distance = "Distance"
    case lookingFor = "Looking for"
    case none = ""
}
import UIKit
import SafariServices
import PhoneNumberKit

extension UIViewController{
    func showLocationPermissionPopup() {
        let alert = UIAlertController(
            title: "Location Permission Needed",
            message: "Please allow location access to continue.",
            preferredStyle: .alert
        )

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))

        alert.addAction(UIAlertAction(title: "Open Settings", style: .default, handler: { _ in
            guard let settingsURL = URL(string: UIApplication.openSettingsURLString) else { return }
            if UIApplication.shared.canOpenURL(settingsURL) {
                UIApplication.shared.open(settingsURL)
            }
        }))

        self.present(alert, animated: true)
    }
    func dismissAllPresentedControllers(from rootViewController: UIViewController? = UIApplication.shared.keyWindow?.rootViewController, completion: (() -> Void)? = nil) {
        guard let rootVC = rootViewController else {
            completion?()
            return
        }
        if let presentedVC = rootVC.presentedViewController {
            presentedVC.dismiss(animated: false) {
                self.dismissAllPresentedControllers(from: rootVC, completion: completion)
            }
        } else {
            completion?()
        }
    }

    public func isValidPassword(password:String) -> Bool {
        let passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,}$"
        return NSPredicate(format: "SELF MATCHES %@", passwordRegex).evaluate(with: password)
    }
    func isValidEmailAddress(_ email: String) -> Bool {
       var returnValue = true
       let emailRegEx = "[A-Z0-9a-z.-_]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,3}"
       do {
           let regex = try NSRegularExpression(pattern: emailRegEx)
           let nsString = email as NSString
           let results = regex.matches(in: email, range: NSRange(location: 0, length: nsString.length))
           if results.count == 0
           {
               returnValue = false
           }
       }catch let error as NSError {
           print("invalid regex: \(error.localizedDescription)")
           returnValue = false
       }
       return  returnValue
   }
    func getPhoneNumberLength(code:String) -> Int{
        print(code)
        let phoneNumberKit = PhoneNumberKit().getExampleNumber(forCountry: code)?.nationalNumber
        if let myInt: Int = Int(exactly:phoneNumberKit ?? 0){
            print("\(myInt)".count)
            return "\(myInt)".count
        }
        return 12
    }
    func checkMobileValidation(codeNo:String,phoneNo:String) -> Bool{
        let tempfield = PhoneNumberTextField()
        tempfield.text = "\(codeNo + phoneNo)".validStringCode()
        if !tempfield.isValidNumber{
            return false
        }
        return true
    }
    func popOverMenuGender(completion: @escaping (Int) -> Void) -> UIMenu{
        let maleItem = UIAction(title: "Male".localized) { (action) in
            completion(1)
       }
        let femaleItem = UIAction(title: "Female".localized) { (action) in
            completion(2)
       }
        let otherItem = UIAction(title: "Others".localized) { (action) in
            completion(3)
       }
        return UIMenu(title: "", options: .displayInline, children: [maleItem , femaleItem])
    }
    func getController<T: UIViewController>(from storyboard: Storyboard) -> T? {
        let storyboard = UIStoryboard(name: storyboard.rawValue, bundle: nil)
        let identifier = String(describing: T.self)
        return storyboard.instantiateViewController(withIdentifier: identifier) as? T
    }
    func presentVC(vc:UIViewController,overFull:Bool = true){
        mainThread {
            if overFull{
                vc.modalPresentationStyle = .overFullScreen
            }
            self.present(vc, animated: true)
        }
    }
    func pushVC(vc:UIViewController){
        mainThread {
            self.navigationController?.pushViewController(vc, animated: true)
        }
    }

    func dismissVC(){
        mainThread {
            self.dismiss(animated: true)
        }
    }
    func popVC(){
        mainThread {
            self.navigationController?.popViewController(animated: true)
        }
    }
    func setRootController(board:Storyboard,identifier:Controller){
        mainThread {
            isDirectLogin = false
            if identifier.rawValue == "ViewController"{
                isDirectLogin = true
            }
            let storyboard = UIStoryboard(name: board.rawValue, bundle: nil)
            let mainViewController = storyboard.instantiateViewController(withIdentifier: identifier.rawValue)
            let nav = UINavigationController.init(rootViewController: mainViewController)
            nav.isNavigationBarHidden = true
            UIApplication.shared.windows.first?.rootViewController = nav
            UIApplication.shared.windows.first?.makeKeyAndVisible()
        }
    }
    func setRootControllerWithTabIndex(board:Storyboard,identifier:Controller,index:Int){
        mainThread {
            isDirectLogin = false
            if identifier.rawValue == "ViewController"{
                isDirectLogin = true
            }
            let storyboard = UIStoryboard(name: board.rawValue, bundle: nil)
            let mainViewController = storyboard.instantiateViewController(withIdentifier: identifier.rawValue)
            if let vc = mainViewController as? MainTabVC{
                vc.selectedIndex = index
                let nav = UINavigationController.init(rootViewController: vc)
                nav.isNavigationBarHidden = true
                UIApplication.shared.windows.first?.rootViewController = nav
                UIApplication.shared.windows.first?.makeKeyAndVisible()
                return
            }
            let nav = UINavigationController.init(rootViewController: mainViewController)
            nav.isNavigationBarHidden = true
            UIApplication.shared.windows.first?.rootViewController = nav
            UIApplication.shared.windows.first?.makeKeyAndVisible()
        }
    }

    func setRootController(board:Storyboard,identifier:Controller, showNavigationBar: Bool){
        mainThread {
            let storyboard = UIStoryboard(name: board.rawValue, bundle: nil)
            let mainViewController = storyboard.instantiateViewController(withIdentifier: identifier.rawValue)
            let nav = UINavigationController.init(rootViewController: mainViewController)
            nav.isNavigationBarHidden = !showNavigationBar
            nav.interactivePopGestureRecognizer?.isEnabled = false
            UIApplication.shared.windows.first?.rootViewController = nav
            UIApplication.shared.windows.first?.makeKeyAndVisible()
        }
    }
    
    func setRootController(with controller: UIViewController)
    {
        let navigationController = UINavigationController.init(rootViewController: controller)
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let windowSceneDelegate = windowScene.delegate as? SceneDelegate,
              let window = windowSceneDelegate.window else {
            return
        }
        navigationController.interactivePopGestureRecognizer?.isEnabled = false
        window.rootViewController = navigationController
        window.makeKeyAndVisible()
    }
    func openBrowser(urlString:String){
        let openURL = urlString
       DispatchQueue.main.async {
            guard let url = URL(string: openURL) else {
                return //be safe
            }
            if ["http", "https"].contains(url.scheme?.lowercased() ?? "") {
                // Can open with SFSafariViewController
                let safariViewController = SFSafariViewController(url: url)
                self.present(safariViewController, animated: true, completion: nil)
            } else {
                // Scheme is not supported or no scheme is given, use openURL
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
    }
//    func shareEvent(name: String, organizer: String, date: String, location: String, category: String, link: String, from controller: UIViewController) {
//        let message = """
//        I wanted to share an exciting event with you that I think you’d love. It’s called \(name), and it’s being organized by \(organizer).
//
//        Event Details:
//        📅 Date: \(date)
//        📍 Location: \(location.isEmpty ? "-" : location)
//        🎤 Topic: \(category)
//
//        You can find more details here: \(link)
//
//        If you're interested, I think it will be a great experience!
//        """
//
//        let activityVC = UIActivityViewController(activityItems: [message], applicationActivities: nil)
//        activityVC.popoverPresentationController?.sourceView = controller.view // For iPad
//
//        controller.present(activityVC, animated: true, completion: nil)
//    }
//    func shareEvent(name: String, organizer: String, date: String, location: String, category: String, link: String, imageURL: URL?, from controller: UIViewController) {
//        let message = """
//        I wanted to share an exciting event with you that I think you’d love. It’s called \(name), and it’s being organized by \(organizer).
//
//        Event Details:
//        📅 Date: \(date)
//        📍 Location: \(location.isEmpty ? "-" : location)
//        🎤 Topic: \(category)
//
//        You can find more details here: \(link)
//
//        If you're interested, I think it will be a great experience!
//        """
//        
//        // Create an image to share (either from URL or local asset)
//        var activityItems: [Any] = [message]  // Start with the message text
//
//        // Check if we have a valid image URL
//        if let imageURL = imageURL {
//            // Fetch image from URL and add to activity items
//            if let imageData = try? Data(contentsOf: imageURL), let image = UIImage(data: imageData) {
//                activityItems.append(image) // Append the image to the share sheet
//            }
//        } else {
//            // Optionally add a local image
//            if let localImage = UIImage(named: "defaultImage.png") {  // Replace with your local image name
//                activityItems.append(localImage)
//            }
//        }
//
//        // Present the Activity View Controller to share the message + image
//        let activityVC = UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
//        activityVC.popoverPresentationController?.sourceView = controller.view // For iPad
//
//        controller.present(activityVC, animated: true, completion: nil)
//    }
    func shareEvent(name: String, organizer: String, date: String, location: String, category: String, link: String, imageURL: URL?, from controller: UIViewController) {
        let message = """
        I wanted to share an exciting event with you that I think you’d love. It’s called \(name), and it’s being organized by \(organizer).

        Event Details:
        📅 Date: \(date)
        📍 Location: \(location.isEmpty ? "-" : location)
        🎤 Topic: \(category)

        You can find more details here: \(link)

        If you're interested, I think it will be a great experience!
        """
        
        // Create an image to share (either from URL or local asset)
        var activityItems: [Any] = [message]  // Start with the message text
        
        // Show loading indicator
        let activityIndicator = UIActivityIndicatorView(style: .large)
        activityIndicator.center = controller.view.center
        controller.view.addSubview(activityIndicator)
        activityIndicator.startAnimating()

        // Check if we have a valid image URL
        if let imageURL = imageURL {
            // Fetch image from URL asynchronously
            URLSession.shared.dataTask(with: imageURL) { data, response, error in
                // Make sure we have valid data and no errors
                guard let data = data, error == nil, let image = UIImage(data: data) else {
                    DispatchQueue.main.async {
                        activityIndicator.stopAnimating()
                        activityIndicator.removeFromSuperview()
                        // Handle error (you can append a default image or do nothing)
                        let fallbackImage = UIImage(named: "splash_logo") // Your default image
                        activityItems.append(fallbackImage ?? UIImage())
                        presentActivityVC()
                    }
                    return
                }

                // Append the image to the activityItems
                DispatchQueue.main.async {
                    activityItems.append(image)
                    activityIndicator.stopAnimating()
                    activityIndicator.removeFromSuperview()
                    presentActivityVC()
                }
            }.resume()
        } else {
            // Optionally add a local image if no image URL is provided
            if let localImage = UIImage(named: "splash_logo") {  // Replace with your local image name
                activityItems.append(localImage)
                presentActivityVC()
            }
        }

        // Function to present the UIActivityViewController
        func presentActivityVC() {
            // Present the Activity View Controller to share the message + image
            let activityVC = UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
            activityVC.popoverPresentationController?.sourceView = controller.view // For iPad
            controller.present(activityVC, animated: true, completion: nil)
        }
    }

    func shareURL(url:String) {
            // URL to be shared
        guard let url = URL(string: url) else { return }
        
        // Create the activity view controller
        let activityViewController = UIActivityViewController(
            activityItems: [url],
            applicationActivities: nil
        )
        
        // For iPads, specify a sourceView to avoid a crash
        activityViewController.popoverPresentationController?.sourceView = self.view
        
        // Present the activity view controller
        self.present(activityViewController, animated: true, completion: nil)
    }
    func shareText(textToShare:String) {
            // URL to be shared
        let activityViewController = UIActivityViewController(
            activityItems: [textToShare],
            applicationActivities: nil
        )

        // For iPads, specify a sourceView to avoid a crash
        activityViewController.popoverPresentationController?.sourceView = self.view
        
        // Present the activity view controller
        self.present(activityViewController, animated: true, completion: nil)
    }
    func convertImageToBase64(image: UIImage) -> String? {
        // Convert UIImage to Data
        guard let imageData = image.jpegData(compressionQuality: 1.0) else {
            print("Failed to convert image to data")
            return nil
        }

        // Convert Data to Base64 string
        let base64String = imageData.base64EncodedString(options: .lineLength64Characters)
        return base64String
    }
    func showGuestLogin(){
        if let vc = topViewController(){
            isSkipLogin = true
            vc.showYesnoAlertWithClosure(title: "Continue to login?", type: 0, vc: vc) { status in
                if status{
                    self.clearSession()
                }
            }
        }
    }
    func isGuestUser() -> Bool{
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        return getAuthorization.isEmpty
    }
}
func topViewController() -> UIViewController? {
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let windowSceneDelegate = windowScene.delegate as? SceneDelegate,
          let window = windowSceneDelegate.window else {
        return nil
    }
    return topViewControllers(base: window.rootViewController)
}

 func topViewControllers(base: UIViewController?) -> UIViewController? {
    if let nav = base as? UINavigationController {
        return topViewControllers(base: nav.visibleViewController)
    }
    if let tab = base as? UITabBarController, let selected = tab.selectedViewController {
        return topViewControllers(base: selected)
    }
    if let presented = base?.presentedViewController {
        return topViewControllers(base: presented)
    }
    
    return base
}

func setRootController(board:Storyboard,identifier:Controller)
{
    let Home = UIStoryboard(name:board.rawValue, bundle: nil).instantiateViewController(withIdentifier:identifier.rawValue)
    let navigationController = UINavigationController.init(rootViewController: Home)
//    navigationController.isNavigationBarHidden = true
//    navigationController.navigationBar.isHidden = true
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let windowSceneDelegate = windowScene.delegate as? SceneDelegate,
          let window = windowSceneDelegate.window else {
        return
    }
    window.rootViewController = navigationController
    window.makeKeyAndVisible()
}
func setRootController(with controller: UIViewController)
{
    let navigationController = UINavigationController.init(rootViewController: controller)
//    navigationController.isNavigationBarHidden = true
//    navigationController.navigationBar.isHidden = true
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let windowSceneDelegate = windowScene.delegate as? SceneDelegate,
          let window = windowSceneDelegate.window else {
        return
    }
    window.rootViewController = navigationController
    window.makeKeyAndVisible()
}

