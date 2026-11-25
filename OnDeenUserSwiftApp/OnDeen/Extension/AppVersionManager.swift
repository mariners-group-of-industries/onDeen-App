//
//  AppVersionManager.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 06/03/25.
//


import UIKit

class AppVersionManager {
    
    static let lastVersionKey = "LastInstalledAppVersion"
    
    static func checkForAppUpdate() {
        let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "0.0.0"
        let lastVersion = UserDefaults.standard.string(forKey: lastVersionKey) ?? ""
        if lastVersion != currentVersion {
            print("New version detected! Clearing session data...")
            clearSessionData()
            UserDefaults.standard.setValue(currentVersion, forKey: lastVersionKey)
        }
    }
    
    private static func clearSessionData() {
        // Clear UserDefaults
        UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)
        UserDefaults.standard.synchronize()
        if let vc = topViewController(){
            LoginRequest.instance.registerInitToken { status in
                vc.setRootController(board: .authentication, identifier: .loginVC)
            }
        }
    }
}
