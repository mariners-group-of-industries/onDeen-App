//
//  HomeEventListCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 06/02/25.
//

import UIKit

class HomeEventListCell: UITableViewCell {
    @IBOutlet weak var tralingCons: NSLayoutConstraint!
    @IBOutlet weak var leadingCons: NSLayoutConstraint!
    @IBOutlet weak var locationStack: UIStackView!
    @IBOutlet weak var lblCategory: SFProLabel!
    @IBOutlet weak var imgDistanceLogo: UIImageView!
    @IBOutlet weak var lblDistance: SFProLabel!
    @IBOutlet weak var lblLocation: SFProLabel!
    @IBOutlet weak var imgWishlist: UIImageView!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var imgCategory: UIImageView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var lblLine: UILabel!

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        imgView.setCornerRadius(12.0)
    }
    func config(data:HomePageEvent){
        if data.id == 226{
            print("ddd")
        }
        imgView.loadAsyncImage(loadURL: data.primaryImage)
        imgCategory.loadAsyncImage(loadURL: data.categoryImage)
        lblTitle.text = data.title
        // Assuming `data` is your model having `startDate` and `startTime` as String
        let serverStartDate = data.startDate ?? ""
        let serverStartTime = data.startTime ?? ""
        var startDate = ""
        var startTime = ""
        if let eventDate = serverStartDate.toServerDate() {
            let currentYear = Calendar.current.component(.year, from: Date())
            let eventYear = Calendar.current.component(.year, from: eventDate)
            let dateFormat = (eventYear > currentYear) ? "E, d MMM yyyy" : "E, d MMM"
            startDate = serverStartDate.convertServerDateFormat(toFormat: dateFormat, timeZone: data.time_zone)
            startTime = serverStartTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "h:m a",timeZone:data.time_zone).lowercased()
        }
        var date = "\(startDate) \u{00B7} \(startTime)"
        imgWishlist.image = UIImage.init(named: data.isWishlisted == 1 ? "ic_heart_pink" : "ic_heart_gray")
        let regular = Fonts.SFProRegular(10.0)
        let medium = Fonts.SFProMedium(12.0)
        var attr = NSMutableAttributedString()
        if data.ticketPrice.toDouble() > 0.0{
            let text = "\("Starts from: ".localized) "
            let text2 = "\(appCurrency)\(data.ticketPrice ?? "")"
            attr.append(text.withTextColor(UIColor.init(hex: "#606060")).withFont(regular))
            attr.append(text2.withTextColor(UIColor.init(hex: "#161616")).withFont(medium))
            lblPrice.attributedText = attr
        }else{
            attr.append(data.price.withTextColor(UIColor.init(hex: "#161616")).withFont(medium))
            lblPrice.attributedText = attr
            lblPrice.textColor = data.originalPrice.toDouble() != 0.0 ? UIColor.init(hex: "#161616") : UIColor.init(hex: "#28B446")
        }
        if data.categoryId == "3" || data.categoryId == "4" || data.categoryId == "9"{
            let serverStartDate = data.startDate ?? ""
            let serverStartTime = data.endDate ?? ""
            var startDate = ""
            var startTime = ""
            
            if let eventDate = serverStartDate.toServerDate() {
                let currentYear = Calendar.current.component(.year, from: Date())
                let eventYear = Calendar.current.component(.year, from: eventDate)
                let dateFormat = (eventYear > currentYear) ? "E, d MMM yyyy" : "E, d MMM"
                startDate = serverStartDate.convertServerDateFormat(toFormat: dateFormat, timeZone: data.time_zone)
                startTime = serverStartTime.convertServerDateFormat(toFormat: dateFormat, timeZone: data.time_zone)
                date = startDate + " - " + startTime
            }
        }
        locationStack.isHidden = data.organizerName.isEmpty
        imgDistanceLogo.isHidden = data.locationType == 0
        lblDistance.text = data.locationType == 0 ? "Online".localized :  data.distance + " mi"
        lblDistance.textColor = data.locationType == 0 ? UIColor.init(hex: "#28B446") :  UIColor.init(hex: "#606060")
        lblLocation.text = data.organizerName
        attr = NSMutableAttributedString()
        let catTitle = "\(data.categoryTitle ?? "") "
        let dateTitle = "\(date)"
        attr.append(catTitle.withTextColor(UIColor.init(hex: "#606060")).withFont(medium))
        attr.append(dateTitle.withTextColor(UIColor.init(hex: "#606060")).withFont(regular))
        lblCategory.attributedText = attr
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
