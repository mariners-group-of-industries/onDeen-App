//
//  EmptySlotCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 13/02/25.
//

import UIKit

class EmptySlotCell: UITableViewCell {
    @IBOutlet weak var nextDateLabel: SFProLabel!
    @IBOutlet weak var availableFromLabel: SFProLabel!

    override func awakeFromNib() {
        super.awakeFromNib()
        nextDateLabel.superview?.setCornerRadius(8.0)
        nextDateLabel.superview?.setBorder(color: .gray, width: 1.0)
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
