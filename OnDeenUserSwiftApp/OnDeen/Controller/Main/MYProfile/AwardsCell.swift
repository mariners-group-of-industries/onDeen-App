//
//  AwardsCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class AwardsCell: UICollectionViewCell {
    @IBOutlet weak var progress: UIProgressView!
    @IBOutlet weak var lblArcheived: SFProLabel!
    @IBOutlet weak var imgAward: UIImageView!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var bgView: UIView!

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.setCornerRadius(16.0)
    }
    func config(data:ProfileAwardlevel){
        lblArcheived.text = " "
        progress.isHidden = true
        lblTitle.text = data.title
        self.imgAward.loadAsyncImage(loadURL: data.image)
        if data.attendcount > 0 && data.attendcount < 100{
            let progressValue = Float(data.attendcount) / 100.0 // Convert 78% to 0.78
            progress.progress = progressValue
            progress.isHidden = false
        }else if data.attendcount > 0{
            lblArcheived.text = "Archived"
        }
    }
}
