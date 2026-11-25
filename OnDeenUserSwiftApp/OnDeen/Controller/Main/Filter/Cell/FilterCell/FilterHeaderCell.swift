//
//  FilterHeaderCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 07/02/25.
//

import UIKit

class FilterHeaderCell: UITableViewCell {
    @IBOutlet weak var lblSeperaterJourne: UILabel!
    @IBOutlet weak var journeyView: UIView!
    @IBOutlet weak var collectionHeight: NSLayoutConstraint!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var tagHeight: NSLayoutConstraint!
    @IBOutlet weak var tagView: TTGTextTagCollectionView!
    @IBOutlet weak var btnSwitch: UISwitch!
    @IBOutlet weak var lblAnyDate: SFProLabel!
    @IBOutlet weak var lblChooseDate: SFProLabel!
    var tagTapped : ((Int) -> Void)?
    var dateItemTapped : ((Int) -> Void)?
    var journies = [HomePageEvent]()
    
    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(FilterHeaderItemCell.self)
        tagView.alignment = .left
        collectionView.registerAutoLayout()
        if let layout = collectionView.collectionViewLayout as? UICollectionViewFlowLayout {
            layout.estimatedItemSize = UICollectionViewFlowLayout.automaticSize
            layout.itemSize = UICollectionViewFlowLayout.automaticSize
            layout.minimumInteritemSpacing = 8 // Adjust spacing if needed
            layout.minimumLineSpacing = 8
            layout.scrollDirection = .horizontal // If items should be in a single row
        }
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        if let topView = lblAnyDate.superview{
            topView.addTap { r in
                self.dateItemTapped?(0)
            }
            topView.config(borderColor: UIColor.init(hex: "#4F4F4F"), borderWidth: 1.0, isRoundCorner: true)
        }
        if let topView = lblChooseDate.superview{
            topView.addTap { r in
                self.dateItemTapped?(1)
            }
            topView.config(borderColor: UIColor.init(hex: "#4F4F4F"), borderWidth: 1.0, isRoundCorner: true)
        }
    }
    func config(data:[HomePageEvent]){
        journies = data
        collectionView.reloadData()
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension FilterHeaderCell:TTGTextTagCollectionViewDelegate{
    func textTagCollectionView(_ textTagCollectionView: TTGTextTagCollectionView!, didTap tag: TTGTextTag!, at index: UInt) {
        tagTapped?(Int(index))
    }
}
extension FilterHeaderCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return journies.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(FilterHeaderItemCell.self, at: indexPath)
        cell.tag = 100
        let data = journies[indexPath.item]
        cell.lblTitle.text = data.title
        cell.bgView.backgroundColor = data.isSelected ? .black : UIColor.clear
        cell.lblTitle.textColor = data.isSelected ? .white : .black
        cell.bgView.config(borderColor: .black, borderWidth: 1.0, isRoundCorner: true)
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: 1, height: 40)
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        for item in journies{
            item.isSelected = false
        }
        journies[indexPath.item].isSelected = true
        tagTapped?(indexPath.item)
        collectionView.reloadData()
    }
}
