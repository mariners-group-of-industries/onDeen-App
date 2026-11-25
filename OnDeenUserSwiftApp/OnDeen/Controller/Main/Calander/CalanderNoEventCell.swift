//
//  CalanderNoEventCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 22/01/25.
//

import UIKit

class CalanderNoEventCell: UITableViewCell {
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var exploreView: GlobalGradientView!
    @IBOutlet weak var lblTitle: AllRoundLabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
