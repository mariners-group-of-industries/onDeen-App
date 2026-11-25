//
//  MainTabVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit
var tabHeight = 0.0
var previousTabIndex = 0

class MainTabVC: UITabBarController,UITabBarControllerDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        self.delegate = self
        // Do any additional setup after loading the view.
    }
    override func viewDidAppear(_ animated: Bool) {
        if let tabBarHeight = tabBarController?.tabBar.frame.size.height {
            tabHeight = tabBarHeight
        }
    }
    func tabBarController(_ tabBarController: UITabBarController, didSelect viewController: UIViewController) {
        LoadingManager.shared.hide() // Hide any leftover loader
        if let firstVC = viewControllers?.first, viewController == firstVC {
            if let homeVC = firstVC as? HomeViewController {
                homeVC.triggerFilterList()
            }
        }
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        let selectedIndex = tabBarController.selectedIndex
        if selectedIndex == 2 && getAuthorization.isEmpty {
            // Temporarily revert the selectedIndex
            tabBarController.selectedIndex = previousTabIndex
            self.showYesnoAlertWithClosure(title: "Continue to login?", type: 0, vc: self) { status in
                if status {
                    self.setRootController(board: .authentication, identifier: .loginVC)
                }
            }
            return
        }else if selectedIndex == 1 && getAuthorization.isEmpty {
            // Temporarily revert the selectedIndex
            tabBarController.selectedIndex = previousTabIndex

            self.showYesnoAlertWithClosure(title: "Continue to login?", type: 0, vc: self) { status in
                if status {
                    self.setRootController(board: .authentication, identifier: .loginVC)
                }
            }
            return
        }else if selectedIndex == 3 && getAuthorization.isEmpty {
            // Temporarily revert the selectedIndex
            tabBarController.selectedIndex = previousTabIndex

            self.showYesnoAlertWithClosure(title: "Continue to login?", type: 0, vc: self) { status in
                if status {
                    self.setRootController(board: .authentication, identifier: .loginVC)
                }
            }
            return
        }

        // Update previousTabIndex only if the user has valid access
        previousTabIndex = selectedIndex
        print("Selected Tab Index: \(selectedIndex)")
    }
}
extension UIViewController{
    func switchTab() {
        if let vc = topViewController() {
            print("Switching tab from index: \(vc.tabBarController?.selectedIndex ?? -1) to \(previousTabIndex)")
            vc.tabBarController?.selectedIndex = previousTabIndex
        } else {
            print("Failed to retrieve topViewController")
        }
    }
}
