//
//  AppDelegate.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit
import Firebase
import IQKeyboardManagerSwift
import Stripe

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
   

  

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let londonFormatter = DateFormatter()
        londonFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        londonFormatter.timeZone = TimeZone(identifier: "Europe/London")

        // Step 1: Parse the London time string into Date
        if let londonDate = londonFormatter.date(from: "2025-08-11 20:15:00") {
            
            // Step 2: Convert to UTC string
            let utcFormatter = DateFormatter()
            utcFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
            utcFormatter.timeZone = TimeZone(abbreviation: "UTC")
            let utcString = utcFormatter.string(from: londonDate)
            print("UTC time string: \(utcString)")
            
            // Step 3: Convert to India time
            let indiaFormatter = DateFormatter()
            indiaFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
            indiaFormatter.timeZone = TimeZone(identifier: "Asia/Kolkata")
            let indiaString = indiaFormatter.string(from: londonDate)
            print("India time string: \(indiaString)")
            
            // For calendar storage, you usually store the Date object (UTC internally)
            // Example:
            let eventDate = londonDate // This is already in absolute UTC time internally
        }

//        let responseDateTime = "2025-08-11 20:15:00"
//        if let date = responseDateTime.toDate(from: "yyyy-MM-dd HH:mm:ss", timeZoneID: "Europe/London") {
//            print(date) // prints in UTC by default when printed
//        }
//        if let localTime = "".utcToDeviceTime("2025-08-11 19:15:00") {
//            print(localTime) // For India → "2025-08-12 00:45:00"
//        }
//        let responseTimeZone = "Europe/London"
//        let startDate = responseDateTime.convertServerDateFormat(toFormat: "yyyy-MM-dd HH:mm:ss", timeZone: responseTimeZone)
//        print(startDate)
//
//        let dateFormatter = DateFormatter()
//        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
//
//        // 1. Try full date-time format
//        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
//        dateFormatter.timeZone = TimeZone(identifier: responseTimeZone) ?? TimeZone(abbreviation: "UTC")
//        if let date = dateFormatter.date(from: responseDateTime) {
//            dateFormatter.timeZone = TimeZone.current
//            let getStr = dateFormatter.string(from: date)
//            let getTimeZoneDate  = dateFormatter.date(from: getStr)
//            print(getTimeZoneDate ?? Date())
//        }
//

        
//        STPAPIClient.shared.publishableKey = "pk_test_51R8kcgCzPIetccQO5heMt4ft2ibBaleIc2tzUUVOvBif0uhSWm35oPb6m68fvewoxgEHSZNcbHeDSrgVqL6WDipd00jP8jmAv5"
        if APIURLType.liveApi.rawValue == "http://43.205.18.14:8080/"{
            STPAPIClient.shared.publishableKey = "pk_test_51R8kcgCzPIetccQO5heMt4ft2ibBaleIc2tzUUVOvBif0uhSWm35oPb6m68fvewoxgEHSZNcbHeDSrgVqL6WDipd00jP8jmAv5"
        }else{
            STPAPIClient.shared.publishableKey = "pk_live_51R8kcYE3po3v3vTQTRaCaknPaGGrXzSP5FKMvdCZk1ZLtvog5j5yk7tYfh8BTcaGKEcdatx10CV3PUuH5ZyHlTss00TLXLr76d"
        }
        AppVersionManager.checkForAppUpdate()

        IQKeyboardManager.shared.isEnabled = true
        IQKeyboardManager.shared.resignOnTouchOutside = true

        let isForgotTokenExist = UserDefaults.standard.object(forKey: "isForgotToken") as? Bool ?? false
        if isForgotTokenExist{
            UserDefaults.standard.removeObject(forKey: "access_token")
            UserDefaults.standard.removeObject(forKey: "Authorization")
            UserDefaults.standard.removeObject(forKey: "isForgotToken")
            UserDefaults.standard.synchronize()
        }
        UserDefaults.standard.set(160.0, forKey: "pixelsPerInch")
        UserDefaults.standard.synchronize()

        LocationHelper.shared.requestLocationPermission()
        FirebaseApp.configure()
        NotificationHelper.shared.registerNotification(application: application)
    
//        let startDate = "Fri, 04 Jul 2025 00:00:00 GMT"
//        let startTime = "19:00:05"
//
//        print(convertDateTime(startDateString: startDate, startTimeString: startTime)) // shows local time
//        print(convertDateTimeGMTOnly(startDateString: startDate, startTimeString: startTime)) // shows 07:00 PM (GMT)
        
        return true
    }

    func convertDateTime(startDateString: String, startTimeString: String) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0) // Input is in GMT

        // Replace the time part of the date with the real time string
        let dateTimeString = startDateString.replacingOccurrences(of: "00:00:00", with: startTimeString)

        dateFormatter.dateFormat = "E, dd MMM yyyy HH:mm:ss z"
        guard let date = dateFormatter.date(from: dateTimeString) else {
            return "Invalid date"
        }

        // Convert to local time zone for display
        let outputFormatter = DateFormatter()
        outputFormatter.locale = Locale(identifier: "en_US_POSIX")
        outputFormatter.timeZone = TimeZone.current // Convert to device's time zone
        outputFormatter.dateFormat = "E, hh:mm a"

        return outputFormatter.string(from: date)
    }
    func convertDateTimeGMTOnly(startDateString: String, startTimeString: String) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)

        let dateTimeString = startDateString.replacingOccurrences(of: "00:00:00", with: startTimeString)
        dateFormatter.dateFormat = "E, dd MMM yyyy HH:mm:ss z"

        guard let date = dateFormatter.date(from: dateTimeString) else {
            return startTimeString
        }

        let outputFormatter = DateFormatter()
        outputFormatter.locale = Locale(identifier: "en_US_POSIX")
        outputFormatter.timeZone = TimeZone(secondsFromGMT: 0) // Keep in GMT
        outputFormatter.dateFormat = "E, hh:mm a"

        return outputFormatter.string(from: date)
    }
    // MARK: UISceneSession Lifecycle

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
        // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
        // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
    }
}
