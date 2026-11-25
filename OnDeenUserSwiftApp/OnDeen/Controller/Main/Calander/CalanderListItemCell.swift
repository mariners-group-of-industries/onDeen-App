//
//  CalanderListItemCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//

import UIKit

class CalanderListItemCell: UITableViewCell {

    @IBOutlet weak var lblHighlight: UILabel!
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var lblTume: UILabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        lblHighlight.setCornerRadius(1.5)
    }


    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
