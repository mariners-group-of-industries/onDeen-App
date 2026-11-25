//
//  FilterItemCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 07/02/25.
//

import UIKit

class FilterItemCell: UITableViewCell {
    @IBOutlet weak var stackTop: NSLayoutConstraint!
    @IBOutlet weak var lineCons: NSLayoutConstraint!
    @IBOutlet weak var imgRightArrow: UIImageView!
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var lblSubtitle: UILabel!
    @IBOutlet weak var lblShowAll: UILabel!
    @IBOutlet weak var imgArrow: UIImageView!
    @IBOutlet weak var lblLine: UILabel!
    @IBOutlet weak var showAllStack: UIStackView!
    @IBOutlet weak var subView: UIView!
    @IBOutlet weak var imgCheck: UIImageView!

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
