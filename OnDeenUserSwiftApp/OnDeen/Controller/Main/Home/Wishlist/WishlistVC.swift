//
//  WishlistVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 26/12/24.
//

import UIKit

class WishlistVC: UIViewController {
    var headerTitles = ["RECENT WISHLISTED","TOURS","COURSES"]

    @IBOutlet weak var noDataView: UIView!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    var wishEvents = [HomePageEvent](){
        didSet{
            self.collectionView.refreshCollection()
//            self.tableView.refreshTable()
        }
    }
    var eventTapped : (() -> Void)?
    var wishlistData = WishlistingResponse.init(fromDictionary: [String : Any]()){
        didSet{
            self.collectionView.refreshCollection()
//            self.tableView.refreshTable()
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        tableView.registerNIBs(BookingActiveCell.self)
        collectionView.registerNIBs(EventListItemCell.self,EventItemListCell.self)
        collectionView.register(UINib(nibName: "WishlistHeaderCell", bundle: nil), forSupplementaryViewOfKind: UICollectionView.elementKindSectionHeader, withReuseIdentifier: "WishlistHeaderCell")
        backView.addTap { r in
            self.popVC()
        }
        triggerWishlist()
    }
    func triggerWishlist(){
        WishlistRequest.instance.triggerWishlist { data, status in
            self.wishlistData = data
            if self.wishlistData.wishlist.count == 0 && self.wishlistData.tourWishlist.count == 0 && self.wishlistData.courseWishlist.count == 0{
                self.noDataView.isHidden = false
            }
        }
    }
}
extension WishlistVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 0{
            return wishlistData.wishlist.count
        }else if section == 1{
            return wishlistData.tourWishlist.count
        }
        return wishlistData.courseWishlist.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(BookingActiveCell.self, at: indexPath)
        if indexPath.section == 0{
            cell.config(data: wishlistData.wishlist[indexPath.row])
        }else if indexPath.section == 1{
            cell.config(data: wishlistData.tourWishlist[indexPath.row])
        }else{
            cell.config(data: wishlistData.courseWishlist[indexPath.row])
        }
        cell.imgWishlist.isHidden = false
        cell.imgWishlist.tag = indexPath.row
        cell.imgWishlist.addTap { r in
//            self.triggerRemoveWishlist(index: r.view?.tag ?? 0)
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
       if let vc: BookingDetailVC = self.getController(from: .main) {
           if indexPath.section == 0{
               vc.eventData = wishlistData.wishlist[indexPath.row]
           }else if indexPath.section == 1{
               vc.eventData = wishlistData.tourWishlist[indexPath.row]
           }else{
               vc.eventData = wishlistData.courseWishlist[indexPath.row]
           }
            self.pushVC(vc: vc)
        }
    }
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 100
    }
    func triggerRemoveWishlist(section:Int,index:Int){
        var id = 0
        if section == 0{
            id = wishlistData.wishlist[index].id
        }else if section == 1{
            id = wishlistData.tourWishlist[index].id
        }else{
            id = wishlistData.courseWishlist[index].id
        }

        if id == 0{
            return
        }
        EventRequest.instance.triggerWishlistEvent(param: ["event_id" : id]) { data, status in
            if data.status{
                self.triggerWishlist()
                if section == 0{
                    self.wishlistData.wishlist.remove(at: index)
                }else if section == 1{
                    self.wishlistData.tourWishlist.remove(at: index)
                }else{
                    self.wishlistData.courseWishlist.remove(at: index)
                }
                self.eventTapped?()
            }
        }
    }

}
extension WishlistVC: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 3
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if section == 0{
            return wishlistData.wishlist.count
        }else if section == 1{
            return wishlistData.tourWishlist.count
        }
        return wishlistData.courseWishlist.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(EventItemListCell.self, at: indexPath)
        if indexPath.section == 0{
            cell.config(data: wishlistData.wishlist[indexPath.row])
        }else if indexPath.section == 1{
            cell.config(data: wishlistData.tourWishlist[indexPath.row])
        }else{
            cell.config(data: wishlistData.courseWishlist[indexPath.row])
        }
        cell.imgWishlist.tag = indexPath.item
        cell.imgWishlist.accessibilityHint = "\(indexPath.section)"
        cell.imgWishlist.addTap { r in
            let hint = Int(r.view?.accessibilityHint ?? "") ?? 0
            self.triggerRemoveWishlist(section:hint,index: r.view?.tag ?? 0)
        }
        cell.categoryBg.isHidden = false
        cell.categoryLogo.isHidden = false
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        var event = HomePageEvent.init(fromDictionary: [String : Any]())//booked_count
        if indexPath.section == 0{
            event = wishlistData.wishlist[indexPath.row]
        }else if indexPath.section == 1{
            event = wishlistData.tourWishlist[indexPath.row]
        }else{
            event = wishlistData.courseWishlist[indexPath.row]
        }
        if event.booked_count != 0{
            if let vc: BookingDetailVC = self.getController(from: .main) {
                if indexPath.section == 0{
                    vc.eventData = wishlistData.wishlist[indexPath.item]
                }else if indexPath.section == 1{
                    vc.eventData = wishlistData.tourWishlist[indexPath.item]
                }else{
                    vc.eventData = wishlistData.courseWishlist[indexPath.item]
                }
                 self.pushVC(vc: vc)
             }
        }else{
            if let vc: EventDetailController = self.getController(from: .main) {
                vc.eventData = event
                vc.wishlistTapped = {
                    self.triggerWishlist()
                }
                vc.wishlistUpdated = { data in
                    self.triggerWishlist()
                }
                self.pushVC(vc: vc)
            }
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let width = collectionView.bounds.width / 2 - 10
        return CGSize(width: width, height: 240.0)
    }
}
