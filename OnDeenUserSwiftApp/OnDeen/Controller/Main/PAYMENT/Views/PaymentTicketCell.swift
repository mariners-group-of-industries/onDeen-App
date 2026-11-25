//
//  PaymentTicketCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 06/02/25.
//

import UIKit

class PaymentTicketCell: UITableViewCell {
    @IBOutlet weak var lblDuration: SFProLabel!
    @IBOutlet weak var lblAddText: SFProLabel!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var lblAdd: SFProLabel!
    @IBOutlet weak var lblQty: SFProLabel!
    @IBOutlet weak var lblRemove: SFProLabel!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var rightView: UIView!
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.setCornerRadius(16.0)
    }
    func config(data:EventDetailTicket){
        lblDuration.text = "Duration \(data.duration ?? "") hours"
        lblDuration.isHidden = data.duration.toDouble() == 0.0
        lblTitle.text = data.title
        lblSubtitle.text = "Available \(data.remaining) \("Tickets".localized)"
        lblSubtitle.textColor = UIColor(named: "545454")
        
        lblAddText.text = "Add".localized
        lblAddText.backgroundColor = UIColor(named: "3E146F")
        rightView.config(cornerRadius: 8.0, borderColor: UIColor.init(hex: "#422199"), borderWidth: 1.0)

        if data.remaining == 0{
            lblAddText.text = "Sold out".localized
            lblAddText.backgroundColor = UIColor.red
            rightView.config(cornerRadius: 8.0, borderColor: UIColor.init(hex: "#422199"), borderWidth: 0.0)
        }
        lblPrice.text = data.price
        lblQty.text = "\(data.quantity)"
        lblAddText.isHidden = data.quantity != 0
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
}
