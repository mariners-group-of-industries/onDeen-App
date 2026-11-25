//
//  FeatureTagCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class FeatureTagCell: UICollectionViewCell {
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var imgView: UIImageView!
    
    @IBOutlet weak var bgView: UIView!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        if self.tag != 100{
            bgView.config(isRoundCorner: true)
        }
    }
    func config(type:Int){
        if type == 1{
            bgView.isHidden = true
            imgView.isHidden = true
            lblTitle.textColor = UIColor.init(hex: "#DB3171")
            lblTitle.font = Fonts.SFProBold(10.0)
            self.config(borderColor: UIColor.init(hex: "#C4C4C4"), borderWidth: 1.0, isRoundCorner: true)
        }
    }
}
