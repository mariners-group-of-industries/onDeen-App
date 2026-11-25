//
//  SceneDelegate.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit
import FirebaseDynamicLinks

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?
    // SceneDelegate.swift
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = userActivity.webpageURL else { return }
        DeepLinkRouter.shared.handle(url: url)
    }

//    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
//            guard let webpageURL = userActivity.webpageURL else {
//                return
//            }
//            DynamicLinks.dynamicLinks().handleUniversalLink(webpageURL) { dynamicLink, error in
//                if let link = dynamicLink?.url {
//                    print("🔥 SceneDelegate - Dynamic Link: \(link.absoluteString)")
//                    // Handle the link (e.g., navigate in your app)
//                    self.handleIncomingDynamicLink(link)
//                } else {
//                    print("❌ Failed to handle dynamic link in SceneDelegate: \(String(describing: error))")
//                    self.handleIncomingDynamicLink(webpageURL)
//                }
//            }
//        }

        func handleIncomingDynamicLink(_ url: URL) {
            let values = self.getQueryItems(url.absoluteString)
            if values.count > 0{
                let getEventId = values["event_id"] ?? ""
                if !getEventId.isEmpty{
                    notificationType = "2"
                    notificationID = Int(getEventId) ?? 0
                    if let topVC = topViewController(){
                        if let vc: EventDetailController = topVC.getController(from: .main) {
                            vc.eventData = HomePageEvent.init(fromDictionary: ["id" : notificationID])
                            topVC.pushVC(vc: vc)
                        }
                    }
                }
            }else{
                let lastComponent = url.lastPathComponent
                if let data = Data(base64Encoded: lastComponent),
                   let decodedString = String(data: data, encoding: .utf8) {
                    let eventID = Int(decodedString) ?? 0
                    if eventID > 0{
                        notificationType = "2"
                        notificationID = eventID
                        if let topVC = topViewController(){
                            if let vc: EventDetailController = topVC.getController(from: .main) {
                                vc.eventData = HomePageEvent.init(fromDictionary: ["id" : notificationID])
                                topVC.pushVC(vc: vc)
                            }
                        }
                    }
                    print(decodedString)  // Output: 38
                } else {
                    print("Failed to decode")
                }
            }
        }
  
    func getQueryItems(_ urlString: String) -> [String : String] {
        var queryItems: [String : String] = [:]
        let components: NSURLComponents? = getURLComonents(urlString)
        for item in components?.queryItems ?? [] {
            queryItems[item.name] = item.value?.removingPercentEncoding
        }
        return queryItems
    }
    func getURLComonents(_ urlString: String?) -> NSURLComponents? {
        var components: NSURLComponents? = nil
        let linkUrl = URL(string: urlString?.addingPercentEncoding(withAllowedCharacters: CharacterSet.urlQueryAllowed) ?? "")
        if let linkUrl = linkUrl {
            components = NSURLComponents(url: linkUrl, resolvingAgainstBaseURL: true)
        }
        return components
    }
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        if let userActivity = connectionOptions.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }),
           let url = userActivity.webpageURL {
            DynamicLinks.dynamicLinks().handleUniversalLink(url) { dynamicLink, error in
                let finalURL = dynamicLink?.url ?? url
                self.handleIncomingDynamicLink(finalURL)
            }
        }
    }
    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
        // This occurs shortly after the scene enters the background, or when its session is discarded.
        // Release any resources associated with this scene that can be re-created the next time the scene connects.
        // The scene may re-connect later, as its session was not necessarily discarded (see `application:didDiscardSceneSessions` instead).
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Called when the scene has moved from an inactive state to an active state.
        // Use this method to restart any tasks that were paused (or not yet started) when the scene was inactive.
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will move from an active state to an inactive state.
        // This may occur due to temporary interruptions (ex. an incoming phone call).
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
        // Use this method to undo the changes made on entering the background.
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called as the scene transitions from the foreground to the background.
        // Use this method to save data, release shared resources, and store enough scene-specific state information
        // to restore the scene back to its current state.
    }


}

final class DeepLinkRouter {
    static let shared = DeepLinkRouter()
    func handle(url: URL) {
        let base64String = url.pathComponents.last
        // Decode the Base64 string to Data
        if let data = Data(base64Encoded: base64String ?? "") {
            // Convert Data to a UTF-8 string
            if let decodedString = String(data: data, encoding: .utf8) {
                print("Decoded String: \(decodedString)") // Output: "30"
                notificationType = "2"
                notificationID = Int(decodedString) ?? 0
                if let topVC = topViewController(){
                    if let vc: EventDetailController = topVC.getController(from: .main) {
                        vc.eventData = HomePageEvent.init(fromDictionary: ["id" : notificationID])
                        topVC.pushVC(vc: vc)
                    }
                }
            } else {
                print("Failed to decode Base64 string to UTF-8 string.")
            }
        } else {
            print("Invalid Base64 string.")
        }
    }
}
