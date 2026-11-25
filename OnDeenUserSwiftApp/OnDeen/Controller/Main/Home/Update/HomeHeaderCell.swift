//
//  HomeHeaderCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 06/02/25.
//

import UIKit

class HomeHeaderCell: UITableViewCell {
    @IBOutlet weak var filterView: UIView!
    @IBOutlet weak var lblHeaderTitle: UILabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        filterView.config(cornerRadius: 16.0, borderColor: UIColor.init(hex: "#C4C4C4"), borderWidth: 1.0)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
