//
//  MembershipPlanCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 27/12/24.
//

import UIKit

class MembershipPlanCell: UITableViewCell {
    @IBOutlet weak var lblOffer: SFProLabel!
    @IBOutlet weak var offerView: UIView!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var imgSelect: UIImageView!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var bgView1: UIView!
    @IBOutlet weak var bgView3: UIView!

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        offerView.config(cornerRadius: 4.0)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
