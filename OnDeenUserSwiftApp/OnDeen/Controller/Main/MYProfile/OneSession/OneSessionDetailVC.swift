//
//  OneSessionDetailVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 11/02/25.
//

import UIKit

class OneSessionDetailVC: UIViewController {
    @IBOutlet weak var resheduleView: UIView!
    @IBOutlet weak var cancelView: UIView!
    @IBOutlet weak var joinMeetStack: UIStackView!
    @IBOutlet weak var lblMeetLink: SFProLabel!
    @IBOutlet weak var lblSessionTime: SFProLabel!
    @IBOutlet weak var lblSessionDate: SFProLabel!
    @IBOutlet weak var lblDate: SFProLabel!
    @IBOutlet weak var lblSpeakerName: SFProLabel!
    @IBOutlet weak var imgSpeakerLogo: UIImageView!
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var backView: UIStackView!
    var sessionData = SessionListResponse.init(fromDictionary: [String : Any]())
    var itemTapped : (() -> Void)?
    var reassingTapped : ((SessionListResponse) -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    
    func config(){
        backView.addTap { r in
            self.dismissVC()
        }
        cancelView.addTap { r in
            self.showYesnoAlertWithClosure(title: "Are you sure you want to cancel?", type: 0, vc: self) { status in
                if status{
                    let param = ["id":self.sessionData.id ?? 0,"status":2]
                    ProfileRequest.instance.triggerUpdateBookedSession(param: param) { response, status in
                        if status{
                            self.itemTapped?()
                            Utils.showToast(message: response.message)
                            self.dismissVC()
                        }
                    }
                }
            }
        }
        resheduleView.addTap { r in
            self.reassingTapped?(self.sessionData)
            self.dismiss(animated: false, completion: nil)
        }
        let startDate = "\(sessionData.date.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "EEE, dd MMM yyyy",timeZone:sessionData.time_zone))"
        let startTime = "\(sessionData.time.convertTimeOnly(startDate: sessionData.date, startTimeString: sessionData.time, timeZone: sessionData.time_zone))"

//        let startTime = "\(sessionData.time.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "hh:mm a",timeZone:sessionData.time_zone))"
        
        
//        let startDate = "\(data.date.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "EEE, dd MMM yyyy", timeZone: data.time_zone))"

        
        let userName = "\(sessionData.speakerFirstname ?? "") \(sessionData.speakerLastName ?? "")"
        lblHeaderTitle.text = "Session with".localized + " " + userName
        lblSpeakerName.text = userName
        lblDate.text = " "
        lblSessionDate.text = startDate
        lblSessionTime.text = startTime
        lblMeetLink.text = sessionData.meetLink.isEmpty ? "-" : sessionData.meetLink
        lblMeetLink.addTap { r in
            self.openBrowser(urlString: self.sessionData.meetLink)
        }
        imgSpeakerLogo.loadAsyncImageWithPlaceholder(loadURL: sessionData.speakerImage, placeHolder: "ic_profile_crop")
        joinMeetStack.addTap { r in
            if self.sessionData.meetLink.isEmpty{
                Utils.showToast(message: "Meet link not exist")
            }else{
                self.openBrowser(urlString: self.sessionData.meetLink)
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        imgSpeakerLogo.config(isRoundCorner: true)
        self.view.setAlphaBackground()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
        cancelView.config(borderColor: UIColor.init(hex: "#3E146F"), borderWidth: 1.0, isRoundCorner: true)
        resheduleView.config(borderColor: UIColor.init(hex: "#3E146F"), borderWidth: 1.0, isRoundCorner: true)
    }

}
