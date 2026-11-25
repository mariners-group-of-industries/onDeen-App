//
//  FilterCollectionContainerCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class FilterCollectionContainerCell: UITableViewCell {
    @IBOutlet weak var lblTitle: AllRoundLabel!
    let flowLayout = UICollectionViewFlowLayout()
    @IBOutlet weak var collectionView: UICollectionView!
    var itemTapped : ((Int,Int) -> Void)?
    var categories = [HomePageCategory]()
    var filterData = [String:Any]()
    var selectedCategoryId = 0
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        configure()
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    func configure(){
        collectionView.registerNIBs(FeatureTagCell.self)
    }
    func cellConfig(category:[HomePageCategory],filterData:[String:Any]){
        self.categories = category
        self.filterData = filterData
        self.selectedCategoryId = self.filterData["category_id"] as? Int ?? 0
            self.categories = [HomePageCategory.init(fromDictionary: ["title": "Sort By" ,"id" : 1])]
            self.selectedCategoryId = 0
        self.collectionView.refreshCollection()
    }
}
extension FilterCollectionContainerCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout{
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        categories.count + 1
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(FeatureTagCell.self, at: indexPath)
        cell.config(type: 1)
        
        cell.bgView.isHidden = true
        cell.imgView.isHidden = true
        cell.lblTitle.textColor = UIColor.init(hex: "#DB3171")
        cell.lblTitle.font = Fonts.SFProBold(10.0)
        cell.config(borderColor: UIColor.init(hex: "#C4C4C4"), borderWidth: 1.0, isRoundCorner: true)
        cell.backgroundColor = .white

        if indexPath.row == 0{
            cell.lblTitle.text = "Filter".localized
        }else{
            if self.selectedCategoryId == 0{
                if categories[indexPath.item - 1].isSelected {
                    cell.lblTitle.textColor = .white
                    cell.backgroundColor = UIColor.init(hex: "#DB3171")
                    cell.config(borderColor: UIColor.init(hex: "#C4C4C4"), borderWidth: 0.0, isRoundCorner: true)
                }
            }else{
                if selectedCategoryId == indexPath.item{
                    cell.lblTitle.textColor = .white
                    cell.backgroundColor = UIColor.init(hex: "#DB3171")
                    cell.config(borderColor: UIColor.init(hex: "#C4C4C4"), borderWidth: 0.0, isRoundCorner: true)
                }
            }
            cell.lblTitle.text = categories[indexPath.item - 1].title
        }
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        if indexPath.row == 0{
            itemTapped?(0,indexPath.item)
        }else{
            itemTapped?(1,indexPath.item - 1)
        }
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: collectionView.bounds.width / 3 - 20, height: collectionView.bounds.height)
    }
}
