//
//  EventListItemCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class EventListItemCell: UICollectionViewCell {
    @IBOutlet weak var imgWishlist: UIImageView!
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblDate: SFProLabel!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var imgSpeaker: UIImageView!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var dateBgView: UIView!
    @IBOutlet weak var imgLogo: UIImageView!
    @IBOutlet weak var innerBgView: UIView!
    @IBOutlet weak var priceView: UIView!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.setCornerRadius(24.0)
        priceView.setCornerRadius(4.0)
        innerBgView.setCornerRadius(20.0)
        imgLogo.config(borderColor: .black, borderWidth: 1.0, isRoundCorner: true)
        dateBgView.setCornerRadius(8.0)
    }
    func config(data:HomePageEvent){
        imgWishlist.image = data.isWishlisted == 1 ? UIImage.init(named: "ic_wishlist_selected") : UIImage.init(named: "ic_unwishlist_alpha") ?? UIImage()
        if data.price == "FREE".localized{
            priceView.backgroundColor = UIColor.init(hex: "#C8F9AA")
        }else{
            priceView.backgroundColor = UIColor.init(hex: "#F9E5AA")
        }
        lblPrice.text = data.price
        imgSpeaker.loadAsyncImage(loadURL: data.primaryImage)
        imgLogo.loadAsyncImage(loadURL: data.categoryImage)
        lblDate.text = data.categoryTitle.trimmingCharacters(in: .whitespaces)
        lblTitle.text = "On".localized + " \(data.startDate.convertServerDateToDiffFormat())"
        lblSubtitle.text = data.title
    }
}
