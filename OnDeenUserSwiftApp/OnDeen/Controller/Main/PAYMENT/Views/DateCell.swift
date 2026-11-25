//
//  BookingDateCell.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 11/09/24.
//

import UIKit

class DateCell: UICollectionViewCell {
    @IBOutlet private weak var lblSubtitle: SFProLabel!
    @IBOutlet private weak var lblTitle: SFProLabel!
    @IBOutlet private weak var bgView: UIView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    func config(date:DateModel){
        if date.status == 1{
            lblTitle.text = date.dateTitle
            lblSubtitle.text = date.dayTitle
            bgView.backgroundColor = date.selected ? UIColor(named: "9977F2") : UIColor(named: "EFEAF3")
            lblTitle.textColor = date.selected ?  UIColor.white : UIColor(named: "06332C")
            lblSubtitle.textColor = date.selected ? UIColor.white : UIColor(named: "06332C")
        }else{
            lblTitle.text = date.dateTitle
            lblSubtitle.text = date.dayTitle
            bgView.backgroundColor =  UIColor(named: "EFEAF3")
            lblTitle.textColor = UIColor(named: "B0B0B0")
            lblSubtitle.textColor = UIColor(named: "B0B0B0")
        }
        
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.setCornerRadius(8.0)
    }
}
