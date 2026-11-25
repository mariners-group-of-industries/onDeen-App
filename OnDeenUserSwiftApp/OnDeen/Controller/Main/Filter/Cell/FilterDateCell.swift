//
//  FilterDateCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 08/01/25.
//

import UIKit

class FilterDateCell: UITableViewCell {
    @IBOutlet weak var endView: UIView!
    @IBOutlet weak var startView: UIView!
    @IBOutlet weak var lblStart: SFProLabel!
    @IBOutlet weak var lblEnd: SFProLabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        startView.config(isRoundCorner: true)
        endView.config(isRoundCorner: true)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
