//
//  BookingMaterialInfoCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class BookingMaterialInfoCell: UITableViewCell {
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var imgDownload: UIImageView!
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var lblTitle: AllRoundLabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.config(cornerRadius: 12.0, borderColor: UIColor.init(hex: "#E2E2E2"), borderWidth: 1.0)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        
        // Configure the view for the selected state
    }
}
