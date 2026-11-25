//
//  FilterCheckCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 08/01/25.
//

import UIKit

class FilterCheckCell: UITableViewCell {
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var imgCheck: UIImageView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
