//
//  UITableView+Extension.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 08/08/24.
//

import UIKit

extension UITableView{
    func registerNIBs(_ cellTypes: UITableViewCell.Type...) {
        if #available(iOS 15.0, *){
            self.sectionHeaderTopPadding = 0.0
        }
        self.showsVerticalScrollIndicator = false
        self.showsHorizontalScrollIndicator = false
        self.separatorColor = .clear
        self.separatorStyle = .none
        
       for cellType in cellTypes {
           let identifier = String(describing: cellType)
           self.register(UINib(nibName: identifier, bundle: nil), forCellReuseIdentifier: identifier)
       }
   }
    func configHeaderCell<CellType: UITableViewCell>(_ cellType: CellType.Type) -> CellType {
        let cell = self.dequeueReusableCell(withIdentifier: String(describing: cellType)) as! CellType
        return cell
    }
    func configureCell<CellType: UITableViewCell>(_ cellType: CellType.Type, at indexPath: IndexPath) -> CellType {
       let cell = self.dequeueReusableCell(withIdentifier: String(describing: cellType), for: indexPath) as! CellType
       return cell
   }
    func refreshTable(){
        mainThread {
            self.reloadData()
        }
    }
}

