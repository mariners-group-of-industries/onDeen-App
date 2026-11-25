//
//  EventItemListCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class EventItemListCell: UICollectionViewCell {
    @IBOutlet weak var lblCategory: SFProLabel!
    @IBOutlet weak var categoryBg: UIView!
    @IBOutlet weak var categoryLogo: UIImageView!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblDate: SFProLabel!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var imgSpeaker: UIImageView!
    @IBOutlet weak var imgWishlist: UIImageView!
    @IBOutlet weak var priceView: UIView!
    @IBOutlet weak var imgBgView: UIView!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        imgBgView.setCornerRadius(24.0)
        priceView.setCornerRadius(4.0)
        
        categoryBg.setCornerRadius(8.0)
        categoryLogo.config(borderColor: .black, borderWidth: 1.0, isRoundCorner: true)
    }
    
    func config(data:HomePageEvent){
        //ic_wishlist_selected
        lblCategory.text = data.categoryTitle
        categoryLogo.loadAsyncImage(loadURL: data.categoryImage)
        imgWishlist.image = data.isWishlisted == 1 ? UIImage.init(named: "ic_wishlist_selected") : UIImage.init(named: "ic_unwishlist_alpha") ?? UIImage()
        lblPrice.text = data.price
        imgSpeaker.loadAsyncImage(loadURL: data.primaryImage)
        lblDate.text = "\(data.startDate.convertServerDateFormat(toFormat: "dd MMM yyyy", timeZone: data.time_zone))"
        lblTitle.text = data.title
        
        if data.originalPrice.toDouble() > 0.0{
            priceView.backgroundColor = UIColor.init(hex: "#F9E5AA")
        }else{
            priceView.backgroundColor = UIColor.init(hex: "#C8F9AA")
        }
    }
}
