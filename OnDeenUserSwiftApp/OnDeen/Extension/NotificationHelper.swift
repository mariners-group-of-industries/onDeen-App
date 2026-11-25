//
//  NotificationHelper.swift
//  DirbeelUser
//
//  Created by IMCRINOX on 22/04/20.
//  Copyright © 2020 IMCRINOX. All rights reserved.
//

import UIKit
import Firebase
import UserNotifications
import FirebaseMessaging
var deviceID = ""
var pushArrived = false
var pushOID = ""

var notificationType = ""
var notificationID = 0

class NotificationHelper: NSObject,UNUserNotificationCenterDelegate,MessagingDelegate {
    static let shared = NotificationHelper()
    func registerNotification(application: UIApplication){
        // iOS 10 support
        Messaging.messaging().delegate = self

        if #available(iOS 10.0, *) {
            // For iOS 10 display notification (sent via APNS)
            UNUserNotificationCenter.current().delegate = self
            
            let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
            UNUserNotificationCenter.current().requestAuthorization(
                options: authOptions,
                completionHandler: {_, _ in })
        } else {
            let settings: UIUserNotificationSettings =
                UIUserNotificationSettings(types: [.alert, .badge, .sound], categories: nil)
            application.registerUserNotificationSettings(settings)
        }
        
        application.registerForRemoteNotifications()
    }
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        print(userInfo)
        
    }
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("Firebase registration token: \(fcmToken ?? "")")
        deviceID = fcmToken ?? ""
        let dataDict:[String: String] = ["token": fcmToken ?? ""]
        NotificationCenter.default.post(name: Notification.Name("FCMToken"), object: nil, userInfo: dataDict)
        // TODO: If necessary send token to application server.
        // Note: This callback is fired at each app startup and whenever a new token is generated.
    }
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken as Data
        if let token = Messaging.messaging().fcmToken {
            print("token - \(token)")
            deviceID = token
        }
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        // Print the error to console (you should alert the user that registration failed)
        print("APNs registration failed: \(error)")
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        let userInfo = notification.request.content.userInfo
        print(userInfo)
        completionHandler([.alert, .badge, .sound])
    }
    
    // For handling tap and user actions
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        if let typeValue = userInfo["type"],
           let odidValue = userInfo["odid"] {
            let type = String(describing: typeValue)
            let odid = Int(String(describing: odidValue)) ?? 0
            handlePushRedirection(type: type, odid: odid)
        }
        completionHandler()
    }
    // Handle redirection based on type and odid
    func handlePushRedirection(type: String, odid: Int) {
        notificationType = type
        notificationID = odid

        if let topVC = topViewController(){
            if type == "2" {
                if let vc: EventDetailController = topVC.getController(from: .main) {
                    vc.eventData = HomePageEvent.init(fromDictionary: ["id" : odid])
                    topVC.pushVC(vc: vc)
                }
            }else if type == "3" || type == "5" || type == "6" || type == "7"  || type == "8" || type == "9"{
                if let vc: BookingDetailVC = topVC.getController(from: .main) {
                    vc.eventData = HomePageEvent.init(fromDictionary: ["id" : odid])
                    vc.isCompletedBooking = type == "8"
                    vc.isQATabSelected = type == "9"
                    topVC.pushVC(vc: vc)
                }
            }else if type == "4" {
                if let vc: OneSessionVC = topVC.getController(from: .main) {
                    vc.sessionId = odid
                    topVC.pushVC(vc: vc)
                }
            }
        }
    }
}
