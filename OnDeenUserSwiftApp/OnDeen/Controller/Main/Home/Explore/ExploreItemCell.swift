//
//  ExploreItemCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit

class ExploreItemCell: UICollectionViewCell {
    @IBOutlet weak var bgView: GradientBorderView!
    @IBOutlet weak var exploreView: ExploreBgView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var lblTitle: UILabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        addBorder()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        addBorder()
    }
    func addBorder(){
        bgView.configureGradientBorder(colors: [
            UIColor(hex: "#FFEAA9"),
            UIColor(hex: "#BDA4FF")], lineWidth: 1.5, cornerRadius: 28.0)
    }
}
