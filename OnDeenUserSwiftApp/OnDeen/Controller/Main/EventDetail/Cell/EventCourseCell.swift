//
//  EventCourseCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 27/12/24.
//

import UIKit

class EventCourseCell: UITableViewCell {
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var lblTitle2: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var imgView: UIImageView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
