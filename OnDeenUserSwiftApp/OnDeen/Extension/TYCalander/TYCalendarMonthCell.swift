//
//  TYCalendarMonthCell.swift
//  TabbyDemo
//
//  Created by Imcrinox Technologies Pvt Ltd on 20/12/23.
//

import UIKit

class TYCalendarMonthCell: UICollectionViewCell {
    @IBOutlet weak var bgStack: UIStackView!
    @IBOutlet weak var lblDate: UILabel!
    
   
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var countView: UIView!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        bgView.setCornerRadius(6.0)
        countView.config(isRoundCorner: true)
        countView.isHidden = true
    }
    
    
    func config(_ date:Date){
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "dd"
        dateFormatter.locale = Locale.init(identifier: "en")
        self.lblDate.text = isCacheDate(date) ? "" : dateFormatter.string(from: date)
    }
    
    func isCacheDate(_ date:Date) -> Bool{
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "dd-MM-yyyy"
        dateFormatter.locale = Locale.init(identifier: "en")
        let getCacheDate = dateFormatter.string(from: date)
        if getCacheDate == "01-01-1000"{
            return true
        }
        return false
    }
}
