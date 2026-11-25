//
//  PaymentBookingCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 23/12/24.
//

import UIKit

class PaymentBookingCell: UITableViewCell {
    @IBOutlet weak var priceView: UIView!
    @IBOutlet weak var lblCalandar: SFProLabel!
    @IBOutlet weak var imgCategory: UIImageView!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var price1BgView: UIView!
    @IBOutlet weak var price2BgView: UIView!
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())

    override func awakeFromNib() {
        super.awakeFromNib()
    }
    func config(data:EventDetailResponse){
        lblCalandar.text = data.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: data.time_zone)
        lblTitle.text = data.title
        lblPrice.text = data.price
        lblPrice.text = "   \(data.price ?? "")    "
        if data.originalPrice.toDouble() > 0.0{
            priceView.backgroundColor = UIColor.init(hex: "#F9E5AA")
        }else{
            priceView.backgroundColor = UIColor.init(hex: "#C8F9AA")
        }
        addDottedBorder(to: lblPrice)
    }
    func configMembership(data:MembershipListMembership){
        lblCalandar.text = data.subTitle
        lblTitle.text = data.title
        lblPrice.text = "   \(data.price ?? "")   "
        
        if data.originalPrice.toDouble() > 0.0{
            priceView.backgroundColor = UIColor.init(hex: "#F9E5AA")
        }else{
            priceView.backgroundColor = UIColor.init(hex: "#C8F9AA")
        }
        addDottedBorder(to: lblPrice)
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        addDottedBorder(to: lblPrice)
        price1BgView.config(isRoundCorner: true)
        price2BgView.config(isRoundCorner: true)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
