//
//  ExploreCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit

class ExploreCell: UITableViewCell {
    var eventTapped : ((Int) -> Void)?
    @IBOutlet weak var collectionView: UICollectionView!
    var categories = [FilterListCategory]()
    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(ExploreItemCell.self)
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    func config(data:[FilterListCategory]){
        self.categories = data
        collectionView.reloadData()
    }
}
extension ExploreCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return self.categories.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(ExploreItemCell.self, at: indexPath)
        let data = categories[indexPath.item]
        cell.lblTitle.text = data.title
        if data.id == 10000{
            cell.imgView.image = UIImage.init(named: "ic_all_category") ?? UIImage()
        }else{
            cell.imgView.image = categoryIcon(for: data.title)
        }
        cell.exploreView.isHidden = !data.isSelected
        return cell
    }

    private func categoryIcon(for title: String) -> UIImage {
        let value = title.lowercased()
        let assetName: String

        if value.contains("course") || value.contains("class") || value.contains("quran") {
            assetName = "ic_category_courses"
        } else if value.contains("tour") || value.contains("mosque") {
            assetName = "ic_category_tours"
        } else if value.contains("seminar") || value.contains("workshop") {
            assetName = "ic_category_seminars"
        } else {
            assetName = "ic_category_events"
        }

        return UIImage(named: assetName) ?? UIImage()
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        eventTapped?(indexPath.item)
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: collectionView.bounds.width / 4 - 18, height: collectionView.bounds.height)
    }
}
class ExploreBgView: UIView {
    
    private let gradientLayer = CAGradientLayer()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupGradient()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupGradient()
    }
    
    private func setupGradient() {
        gradientLayer.colors = [
            UIColor(red: 255/255, green: 174/255, blue: 204/255, alpha: 0.4).cgColor,
            UIColor(red: 255/255, green: 216/255, blue: 97/255, alpha: 0.4).cgColor
        ]
        gradientLayer.startPoint = CGPoint(x: 0.1, y: 0.2) // Approx. 135.85° angle
        gradientLayer.endPoint = CGPoint(x: 0.9, y: 0.8)
        
        layer.insertSublayer(gradientLayer, at: 0)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        layer.cornerRadius = 28.0
        // Update gradient layer to match rounded corners
        gradientLayer.frame = bounds
        gradientLayer.cornerRadius = 28.0
    }
}
