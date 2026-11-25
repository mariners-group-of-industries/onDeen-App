//
//  NotificationListCell.swift
//  OnDeen
//
//  Created by Thabu's Mac on 09/04/25.
//

import UIKit

class NotificationListCell: UITableViewCell {
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var imgNotification: UIImageView!
    
    @IBOutlet weak var lblViewQuestion: SFProLabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    func config(data:NotificationItem){
        lblTitle.text = data.title
        lblSubtitle.text = data.message
        var btnTitle = "View Event"
        if data.type == 4{
            btnTitle = "View Session"
        }
        lblViewQuestion.text = btnTitle
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
