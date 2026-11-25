//
//  EventSpeakerCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class EventSpeakerCell: UICollectionViewCell {
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var bgView: UIView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        imgView.config(isRoundCorner: true)
        bgView.config(cornerRadius: 24.0, borderColor: UIColor.init(hex: "#DFD7C0"), borderWidth: 1.0)
    }
}
