//
//  OrganizerReviewCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class OrganizerReviewCell: UITableViewCell {
    @IBOutlet weak var lblRateUserTitle: SFProLabel!
    @IBOutlet weak var infoView: UIView!
    @IBOutlet weak var organizerStack: UIStackView!
    @IBOutlet weak var lblTotalReviews: SFProLabel!
    @IBOutlet weak var lblOrgTitle: SFProLabel!
    @IBOutlet weak var reviewView: UIView!
    @IBOutlet weak var imgStar: UIImageView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var lblLetter: AllRoundLabel!
    @IBOutlet weak var rateView: GradientBorderView!

    @IBOutlet weak var lblName: SFProLabel!
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        addBorder()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        reviewView.setCornerRadius(12.0)
        imgView.config(isRoundCorner: true)
        lblLetter.config(isRoundCorner: true)
        addBorder()
    }
    func addBorder(){
        rateView.configureGradientBorder(colors: [
            UIColor(hex: "#F4F4F4"),
            UIColor(hex: "#FFCC33"),
            UIColor(hex: "#DB3171"),
            UIColor(hex: "#422199")
        ], lineWidth: 1.5, cornerRadius: rateView.bounds.height / 2)
    }
    func config(data:EventReview){
        lblTitle.text = data.title
        lblSubtitle.text = data.review
        lblName.text = "\(data.userFirstName ?? "")" + " " + "\(data.userLastName ?? "")"
        lblLetter.text = ""
        if let name = data.userFirstName{
            lblLetter.text = name.first.map { String($0) } ?? ""
        }
        lblLetter.backgroundColor = data.reviewBgColor
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
