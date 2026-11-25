//
//  FeatureItemCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit

class FeatureItemCell: UICollectionViewCell {
    @IBOutlet weak var imgWishlist: UIImageView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var lblDate: UILabel!
    @IBOutlet weak var lblPrice: UILabel!
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var bgView: GlobalGradientView!
    @IBOutlet weak var priceView: UIView!
    @IBOutlet weak var collectionView: UICollectionView!
    var tagData = [String]()
    
    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(FeatureTagCell.self)
        collectionView.registerAutoLayout()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        priceView.setCornerRadius(4.0)
    }
    func config(data:HomePageEvent){
        if data.price == "FREE".localized{
            priceView.backgroundColor = UIColor.init(hex: "#C8F9AA")
        }else{
            priceView.backgroundColor = UIColor.init(hex: "#F9E5AA")
        }
        tagData = data.tagsLists
        collectionView.refreshCollection()
        lblDate.text = data.startDate.convertServerDateFormat(toFormat: "dd MMM yyyy", timeZone: data.time_zone)
        lblPrice.text = data.price
        lblTitle.text = data.title.uppercased()
        imgView.loadAsyncImage(loadURL: data.primaryImage)
        imgWishlist.image = data.isWishlisted == 1 ? UIImage.init(systemName: "heart.fill") : UIImage.init(named: "ic_wishlist_ffffff") ?? UIImage()
    }
}
extension FeatureItemCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return tagData.count > 3 ? 3 : tagData.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(FeatureTagCell.self, at: indexPath)
        cell.imgView.isHidden = indexPath.item != 0
        cell.lblTitle.text = tagData[indexPath.item]
        return cell
    }
}
