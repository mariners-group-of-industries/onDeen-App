//
//  EventSearchCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//

import UIKit

class EventSearchCell: UITableViewCell {
    @IBOutlet weak var imgArrow: UIImageView!
    @IBOutlet weak var lblTitle: UILabel!
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
