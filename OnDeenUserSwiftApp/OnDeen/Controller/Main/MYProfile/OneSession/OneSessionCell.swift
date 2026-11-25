//
//  OneSessionCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 11/02/25.
//

import UIKit

class OneSessionCell: UITableViewCell {
    @IBOutlet weak var lblJoinMeeting: SFProLabel!
    @IBOutlet weak var imgJoinLogo: UIImageView!
    @IBOutlet weak var lineview: UIView!
    @IBOutlet weak var joinStack: UIStackView!
    @IBOutlet weak var lblDate: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var imgView: UIImageView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        imgView.config(isRoundCorner: true)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
