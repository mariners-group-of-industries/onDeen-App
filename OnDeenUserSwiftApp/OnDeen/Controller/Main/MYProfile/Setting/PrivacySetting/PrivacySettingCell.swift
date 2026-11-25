//
//  PrivacySettingCell.swift
//  OnDeen
//
//  Created by Thabu's Mac on 07/04/25.
//

import UIKit

class PrivacySettingCell: UITableViewCell {
    @IBOutlet weak var btnSwitch: UISwitch!
    
    @IBOutlet weak var lblLine: UILabel!
    @IBOutlet weak var saveView: GlobalGradientView!
    @IBOutlet weak var lblTitle: UILabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
