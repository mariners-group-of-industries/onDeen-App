//
//  FeatureCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit

class FeatureCell: UITableViewCell {
    @IBOutlet weak var pageControl: UIPageControl!
    @IBOutlet weak var headerView: UIView!
    @IBOutlet weak var stackBottomCons: NSLayoutConstraint!
    @IBOutlet weak var stackTopCons: NSLayoutConstraint!
    @IBOutlet weak var bgStackView: UIStackView!
    @IBOutlet weak var lblTitle1: SFProLabel!
    @IBOutlet weak var lblTitle2: SFProLabel!
    @IBOutlet weak var lblTitle3: AllRoundLabel!
    @IBOutlet weak var lineView: UIView!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var lblWeek: SFProLabel!
    var eventData = [HomePageEvent]()
    var wishTapped : ((Int) -> Void)?
    var eventTapped : ((Int) -> Void)?

    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(FeatureItemCell.self)
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        lblWeek.applyGradient()
    }
    func config(type:Int){
        collectionView.tag = type
        if type == 1 || type == 2{
            lblTitle1.isHidden = true
            lblTitle2.isHidden = true
            lblTitle3.isHidden = false
            lblWeek.isHidden = true
            lineView.isHidden = true
            stackTopCons.constant = 8.0
            stackBottomCons.constant = 0.0
            headerView.isHidden = type == 2
        }else{
            lblTitle1.isHidden = false
            lblTitle2.isHidden = false
            lblTitle3.isHidden = true
            lblWeek.isHidden = false
            lineView.isHidden = false
            bgStackView.backgroundColor = UIColor.init(hex: "F3F0F7")
            bgStackView.setCornerRadius([.topLeft], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
        }
    }
    func configure(data:[HomePageEvent]){
        eventData = data
        pageControl.numberOfPages = data.count
        collectionView.refreshCollection()
        pageControl.onChange { index in
            self.pageControl.currentPage = index
        }
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension FeatureCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return eventData.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(FeatureItemCell.self, at: indexPath)
        cell.config(data: eventData[indexPath.item])
        cell.imgWishlist.tag = indexPath.item
        cell.imgWishlist.addTap { r in
            self.eventData[r.view?.tag ?? 0].isWishlisted = self.eventData[r.view?.tag ?? 0].isWishlisted == 1 ? 0 : 1
            self.collectionView.reloadItems(at: [IndexPath.init(row: r.view?.tag ?? 0, section: 0)])
            self.wishTapped?(r.view?.tag ?? 0)
        }
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        eventTapped?(indexPath.item)
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        guard collectionViewLayout is UICollectionViewFlowLayout else {
            return CGSize(width: collectionView.bounds.width, height: collectionView.bounds.height)
        }
        var width = UIScreen.main.bounds.width //- totalHorizontalInsets
        if collectionView.tag == 2{
            width -= 30
        }
        let height = collectionView.bounds.height // Adjust this as needed for your cell height
        let div = collectionView.tag == 2 ? 24 : 12
        return CGSize(width: width - CGFloat(div), height: height)
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        return UIEdgeInsets(top: 0, left:collectionView.tag == 2 ? 24 : 6, bottom: 0, right: collectionView.tag == 2 ? 0 : 6) // Custom insets
    }
    func collectionView(_ collectionView: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt indexPath: IndexPath) {
        pageControl.currentPage = indexPath.item
    }
}
