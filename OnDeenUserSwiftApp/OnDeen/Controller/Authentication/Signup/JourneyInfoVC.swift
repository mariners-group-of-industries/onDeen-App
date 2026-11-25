//
//  JourneyInfoVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 26/02/25.
//

import UIKit
enum JourneyType{
    case journey
    case event
    case none
    case buddyMessage
}
class JourneyInfoVC: UIViewController {
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var lblDismiss: UILabel!
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var btnClose: UIButton!
    @IBOutlet weak var lblSubTitle: UILabel!
    var screenType : JourneyType = .journey
    var screenMessage = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
        lblDismiss.addTap { r in
            self.dismissVC()
        }
        btnClose.addTap { r in
            self.dismissVC()
        }
        if screenType == .event{
            lblTitle.text = ""
            lblSubTitle.text = self.getMessage()
        }else if screenType == .journey{
            lblSubTitle.text = screenMessage
        }else if screenType == .buddyMessage{
            lblSubTitle.text = "Get matched with a friendly volunteer who’ll reach out before the event to help you settle in, answer questions, and be a familiar face on the day"
        }
    }
    func getMessage() -> String{
        return screenMessage.isEmpty ? "This course is scheduled everyday at the same time." : screenMessage
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        self.view.setAlphaBackground()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
    }
}
