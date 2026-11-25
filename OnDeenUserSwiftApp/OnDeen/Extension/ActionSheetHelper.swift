//
//  ActionSheetHelper.swift
//  OnDeen
//
//  Created by Thabu's Mac on 08/04/25.
//


import UIKit
enum ActionSheetType{
    case cancelBooking
    case none
}
class ActionSheetHelper {
    static func presentCancelBookingSheet(type:ActionSheetType,from viewController: UIViewController,
                                          onCancelBooking: @escaping () -> Void) {
        var title = ""
        var message = ""
        if type == .cancelBooking{
            title = "What would you like to do?"
            message = "Cancel Booking"
        }
        
        let actionSheet = UIAlertController(title: nil,
                                            message: title,
                                            preferredStyle: .actionSheet)

        let cancelBookingAction = UIAlertAction(title: message, style: .destructive) { _ in
            onCancelBooking()
        }

        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)

        actionSheet.addAction(cancelBookingAction)
        actionSheet.addAction(cancelAction)

        // For iPad
        if let popover = actionSheet.popoverPresentationController {
            popover.sourceView = viewController.view
            popover.sourceRect = CGRect(x: viewController.view.bounds.midX,
                                        y: viewController.view.bounds.midY,
                                        width: 0,
                                        height: 0)
            popover.permittedArrowDirections = []
        }

        viewController.present(actionSheet, animated: true)
    }
}
