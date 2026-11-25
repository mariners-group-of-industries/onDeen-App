//
//  UICollectionView+Extension.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 01/10/24.
//

import UIKit
extension UICollectionView{
    func refreshCollection(){
        mainThread {
            self.reloadData()
        }
    }
    func registerNIBs(_ cellTypes: UICollectionViewCell.Type...) {
       for cellType in cellTypes {
           let identifier = String(describing: cellType)
           self.register(UINib(nibName: identifier, bundle: nil), forCellWithReuseIdentifier: identifier)
       }
   }
    func registerHeaderView(_ cellTypes: UICollectionReusableView.Type...){
        for cellType in cellTypes {
            let identifier = String(describing: cellType)
            self.register(cellType, forSupplementaryViewOfKind: UICollectionView.elementKindSectionHeader,
                                    withReuseIdentifier: identifier)
        }
    }
    func configureCell<CellType: UICollectionViewCell>(_ cellType: CellType.Type, at indexPath: IndexPath) -> CellType {
       let cell = self.dequeueReusableCell(withReuseIdentifier: String(describing: cellType), for: indexPath) as! CellType
       return cell
   }
    func registerAutoLayout(){
        if let flowLayout = self.collectionViewLayout as? UICollectionViewFlowLayout {
            flowLayout.estimatedItemSize = UICollectionViewFlowLayout.automaticSize
        }
    }
}
