//
//  EventListCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class EventListCell: UITableViewCell {
    @IBOutlet weak var topCons: NSLayoutConstraint!
    @IBOutlet weak var footerHeight: NSLayoutConstraint!
    @IBOutlet weak var collectionHeight: NSLayoutConstraint!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var headerTitle: AllRoundLabel!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var viewAll: GradientBorderView!
    var eventTapped : ((Int,Int) -> Void)?
    var eventItemTapped : ((Int,Int) -> Void)?
    var events = [HomePageEvent](){
        didSet{
            self.collectionView.refreshCollection()
        }
    }
    var wishTapped : ((Int) -> Void)?

    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(EventListItemCell.self,EventItemListCell.self)
        addBorder()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        addBorder()
    }
    func addBorder(){
        viewAll.configureGradientBorder(colors: [
            UIColor(hex: "#F4F4F4"),
            UIColor(hex: "#FFCC33"),
            UIColor(hex: "#DB3171"),
            UIColor(hex: "#422199")
        ], lineWidth: 1.5, cornerRadius: viewAll.bounds.height / 2)
    }
    func config(type:Int){
        collectionView.tag = type
        if type == 0{
            bgView.setCornerRadius([.bottomLeft], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
            bgView.backgroundColor = UIColor.init(hex: "F3F0F7")
        }else{
            collectionHeight.constant = 240.0
            footerHeight.constant = 0.0
        }
    }
    func configureData(data:[HomePageEvent]){
        events = []
        events = data
        self.collectionView.refreshCollection()
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension EventListCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return events.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        if collectionView.tag > 0{
            let cell = collectionView.configureCell(EventItemListCell.self, at: indexPath)
            cell.config(data: events[indexPath.item])
            cell.imgWishlist.tag = indexPath.item
            cell.imgWishlist.accessibilityHint = "\(collectionView.tag)"
            cell.imgWishlist.addTap { r in
                var collectionTag = Int(r.view?.accessibilityHint ?? "") ?? 0
                collectionTag -= 1
                self.events[r.view?.tag ?? 0].isWishlisted = self.events[r.view?.tag ?? 0].isWishlisted == 1 ? 0 : 1
                self.collectionView.reloadItems(at: [IndexPath.init(row: r.view?.tag ?? 0, section: 0)])
                self.eventItemTapped?(collectionTag,r.view?.tag ?? 0)
            }
            return cell
        }
        let cell = collectionView.configureCell(EventListItemCell.self, at: indexPath)
        cell.config(data: events[indexPath.item])
        cell.imgWishlist.tag = indexPath.item
        cell.imgWishlist.addTap { r in
            self.events[r.view?.tag ?? 0].isWishlisted = self.events[r.view?.tag ?? 0].isWishlisted == 1 ? 0 : 1
            self.collectionView.reloadItems(at: [IndexPath.init(row: r.view?.tag ?? 0, section: 0)])
            self.wishTapped?(r.view?.tag ?? 0)
        }
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        eventTapped?(collectionView.tag,indexPath.item)
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        if collectionView.tag == 1{
            let width = collectionView.bounds.width / 2 - 12
            return CGSize(width: width, height: collectionView.bounds.height)
        }
        if collectionView.tag == 0{
            let collectionWidth = collectionView.bounds.width / 100
            let width = collectionWidth * 70 - 12
            return CGSize(width: width, height: collectionView.bounds.height)
        }
        let collectionWidth = collectionView.bounds.width / 100
        let width = collectionView.bounds.width / 2 - 12
        return CGSize(width: width, height: collectionView.bounds.height)
    }
}
