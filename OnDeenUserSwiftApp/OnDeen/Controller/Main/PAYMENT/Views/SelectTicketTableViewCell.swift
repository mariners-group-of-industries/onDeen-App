//
//  SelectTicketTableViewCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 28/01/25.
//

import UIKit

class SelectTicketTableViewCell: UITableViewCell {
    @IBOutlet weak var lblAddText: SFProLabel!
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var lblDuration: SFProLabel!
    @IBOutlet weak var labelTicketCount: SFProLabel!
    @IBOutlet weak var imageMinus: UIImageView!
    @IBOutlet weak var imagePlus: UIImageView!
    @IBOutlet weak var ticketView: UIView!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        ticketView.setCornerRadius(8.0)
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
