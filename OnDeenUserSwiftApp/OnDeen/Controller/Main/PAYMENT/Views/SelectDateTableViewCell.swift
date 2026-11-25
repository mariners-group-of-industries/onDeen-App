//
//  SelectDateTableViewCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 28/01/25.
//

import UIKit

class SelectDateTableViewCell: UITableViewCell {
    @IBOutlet weak var bottomCons: NSLayoutConstraint!
    @IBOutlet weak var lblSubHeader: SFProLabel!
    
    @IBOutlet weak var collectionViewHeight: NSLayoutConstraint!
    @IBOutlet weak var bottomLineView: UIView!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var labelTitle: AllRoundLabel!
    var itemTapped: ((Int) -> Void)?
    var timeTapped: ((Int,Int) -> Void)?
    var dateList: [DateModel] = []
    var timeList: [TimeModel] = []
    var selectedQuantity = 1
    var isDate: Bool = true {
            didSet {
                updateCollectionViewLayout()
            }
        }
    var timeZone : String = ""
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        collectionView.registerNIBs(TimeSlotCell.self, DateCell.self)
        collectionView.delegate = self
        collectionView.dataSource = self
    }
    
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        
        // Configure the view for the selected state
    }
    func configure(for dateModel: [DateModel]){
        dateList = dateModel
        collectionViewHeight.constant = 52
        isDate = true
        bottomLineView.isHidden = true
    }
    func configure(for timeModel: [TimeModel], selectedQuantity: Int,timeZone:String){
        self.timeZone = timeZone
        self.selectedQuantity = selectedQuantity
        timeList = timeModel
        isDate = false
        bottomLineView.isHidden = false
    }
    
}
extension SelectDateTableViewCell: UICollectionViewDelegate, UICollectionViewDataSource{
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if isDate{
            dateList.count
        }else{
            timeList.count
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        if isDate{
            let cell = collectionView.configureCell(DateCell.self, at: indexPath)
            if dateList.count > indexPath.item{
                cell.config(date: dateList[indexPath.item])
            }
            return cell
        }else{
            let cell = collectionView.configureCell(TimeSlotCell.self, at: indexPath)
            cell.tag = self.tag
            if timeList.count > indexPath.item{
                cell.configure(model: timeList[indexPath.item],timeZone:self.timeZone)
            }
            return cell
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        
        if !isDate{
            let model = timeList[indexPath.item]
            if model.status != 1{
                return
            }
            if model.remaining <= 0{
                return
            }
            if selectedQuantity > model.remaining {
                return
            }
            timeTapped?(collectionView.tag,indexPath.item)
        }else{
            let model = dateList[indexPath.item]
            if model.status != 1{
                return
            }
        }
        itemTapped?(indexPath.item)
    }
    
    private func updateCollectionViewLayout() {
           let layout = UICollectionViewFlowLayout()
           if isDate {
               layout.scrollDirection = .horizontal
               layout.sectionInset = UIEdgeInsets(top: 0, left: 24, bottom: 0, right: 0)
           } else {
               layout.scrollDirection = .vertical
               layout.sectionInset = UIEdgeInsets(top: 0, left: 24, bottom: 0, right: 24)
               var itemWidth = (UIScreen.main.bounds.width - 48 - 20) / 3 // 48 for insets, 20 for spacing
               itemWidth = itemWidth - 1
               layout.itemSize = CGSize(width: itemWidth, height: 50) // Adjust height as needed
               layout.minimumInteritemSpacing = 10
               layout.minimumLineSpacing = 10
           }
            collectionView.collectionViewLayout = layout
            updateCollectionViewHeight()
            collectionView.setNeedsLayout()
            collectionView.reloadData()
        scrollToItem()
       }
    
    private func updateCollectionViewHeight() {
            if !isDate {
                let numberOfItems = timeList.count // Replace with your actual data count
                let rows = ceil(CGFloat(numberOfItems) / 3.0)
                let itemHeight: CGFloat = 50
                let spacing: CGFloat = 10
                let height = (rows * itemHeight) + ((rows - 1) * spacing)
                collectionViewHeight.constant = height
            }
        }
    private func scrollToItem(){
        guard isDate else {return}
        guard let index = dateList.firstIndex(where: {$0.selected}) else {return}
        if index > 5{
            collectionView.scrollToItem(at: IndexPath(item: index, section: 0), at: .centeredVertically, animated: true)
        }
    }
}


