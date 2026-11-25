//
//  PaymentCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 23/12/24.
//

import UIKit

class PaymentCell: UITableViewCell {
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var imgSelect: UIImageView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    func cellConfig(data:PaymentTypes){
        lblTitle.text = data.title
        imgSelect.image = UIImage.init(named: (data.selected ?? false) ? "ic_round_select" : "ic_round_unselect") ?? UIImage()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.config(cornerRadius: 12.0, borderColor: UIColor.init(hex: "#D5D5D5"), borderWidth: 1.0)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
