//
//  BookingUpcoming.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class BookingUpcoming: UIView {
    @IBOutlet weak var partiesWidth: NSLayoutConstraint!
    @IBOutlet weak var partiesView: UIView!
    @IBOutlet weak var participiantView: UIView!
    @IBOutlet weak var participiantWidth: NSLayoutConstraint!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var lblTitle: AllRoundLabel!
    @IBOutlet weak var lblDate: SFProLabel!
    @IBOutlet weak var imgEventDetail: UIImageView!
    @IBOutlet weak var contentView: UIView!
    
    @IBOutlet weak var statusView: UIView!
    @IBOutlet weak var imgView: UIImageView!
    /*
    // Only override draw() if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func draw(_ rect: CGRect) {
        // Drawing code
    }
    */
    override func layoutSubviews() {
        super.layoutSubviews()
//        contentView.setCornerRadius(24.0)
        bgView.setCornerRadius(24.0)
        imgView.setCornerRadius(24.0)
        statusView.setCornerRadius(12.0)
    }
}
