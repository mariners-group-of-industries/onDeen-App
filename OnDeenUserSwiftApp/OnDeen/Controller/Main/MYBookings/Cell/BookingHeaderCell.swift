//
//  BookingHeaderCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class BookingHeaderCell: UITableViewCell {
    @IBOutlet weak var topViewCons: NSLayoutConstraint!
    @IBOutlet weak var bottomView: NSLayoutConstraint!
    @IBOutlet weak var lblTitle: AllRoundLabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    func config(title:String){
        lblTitle.text = title.localized
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
