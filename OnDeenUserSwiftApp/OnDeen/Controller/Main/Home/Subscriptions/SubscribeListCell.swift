//
//  SubscribeListCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class SubscribeListCell: UITableViewCell {

    @IBOutlet weak var collectionView: UICollectionView!
    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(SubscriptionImageCell.self)
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension SubscribeListCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(SubscriptionImageCell.self, at: indexPath)
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        guard let flowLayout = collectionViewLayout as? UICollectionViewFlowLayout else {
            return CGSize(width: collectionView.bounds.width, height: collectionView.bounds.height)
        }
        let totalHorizontalInsets = flowLayout.sectionInset.left + flowLayout.sectionInset.right
        let width = UIScreen.main.bounds.width //- totalHorizontalInsets
        let height = collectionView.bounds.height // Adjust this as needed for your cell height
        return CGSize(width: width - 12, height: height)
    }
}
