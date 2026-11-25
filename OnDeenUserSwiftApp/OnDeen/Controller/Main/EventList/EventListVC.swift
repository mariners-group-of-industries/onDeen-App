//
//  EventListVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class EventListVC: UIViewController {
    @IBOutlet weak var searchView: UIImageView!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    var category = HomePageCategory.init(fromDictionary: [String : Any]())
    var organizer = HomePageOrganizer.init(fromDictionary: [String : Any]())
    var popularEvents = [HomePageEvent]()
    var nearByEvents = [HomePageEvent]()
    var topRatedEvents = [HomePageEvent]()
    var popularUsersEvents = [HomePageEvent]()
    var allEvents = [HomePageEvent]()
    var headerTitles = ["HAPPENING NEARBY YOU","POPULAR EVENT","UPCOMING EVENT","EXPLORE TOP"]
    var homeData = HomePageResponse.init(fromDictionary: [String : Any]())
    var filterData = [String:Any]()
    var isViewLoads = false
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        self.filterData["category_id"] = category.id
        for index in 0..<homeData.category.count{
            homeData.category[index].isSelected = false
            if homeData.category[index].id == category.id{
                homeData.category[index].isSelected = true
            }
        }
        backView.addTap { r in
            self.popVC()
        }
        tableView.registerNIBs(FeatureCell.self,EventListCell.self, FilterCollectionContainerCell.self,BookingActiveCell.self,CalanderNoEventCell.self)
        triggerPopularEvents(sort: 1)
    }
    func triggerPopularEvents(sort:Int,filter:[String:Any] = [String:Any]()){
        var isOrganizer = false
        var id = category.id ?? 0
        if id == 0{
            id = organizer.id ?? 0
            isOrganizer = true
        }
        var param : [String:Any] = [isOrganizer ? "organizer_id" : "category_id" : id,"sort":sort]
        if id == 0{
            param = ["sort":sort]
        }
        if sort == 5{
            let catId = filter["category_id"] as? Int ?? 0
            if catId == 0{
                param["category_id"] = id
            }else{
                param = filter
            }
        }
        print("========")
        print(JSON(param))
        print("========")
        EventRequest.instance.triggerEventList(param: param) { data, status in
            if sort == 1{
                self.popularEvents = data.events
                self.triggerPopularEvents(sort: sort + 1)
            }else if sort == 2{
                self.nearByEvents = data.events
                self.triggerPopularEvents(sort: sort + 1)
            }else if sort == 3{
                self.topRatedEvents = data.events
                self.triggerPopularEvents(sort: sort + 1)
            }else if sort == 4{
                self.popularUsersEvents = data.events
                self.triggerPopularEvents(sort: sort + 1)
            }else if sort == 5{
                self.isViewLoads = true
                self.allEvents = data.events
            }
            self.tableView.refreshTable()
        }
    }
}
extension EventListVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 5
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 0 && self.popularEvents.count > 0{
            return 1
        }else if section == 1 && self.nearByEvents.count > 0{
            return 1
        }else if section == 2 && self.topRatedEvents.count > 0{
            return 1
        }else if section == 3 && self.popularUsersEvents.count > 0{
            return 1
        }else if section == 4{
            return self.allEvents.count == 0 ? isViewLoads ? 1 : 0 : self.allEvents.count
        }
        return 0
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 4{
            if self.allEvents.count == 0{
                let cell = tableView.configureCell(CalanderNoEventCell.self, at: indexPath)
                cell.lblTitle.text = "NO RESULTS FOUND".localized
                cell.lblSubtitle.text = ""
                cell.exploreView.isHidden = true
                return cell
            }
            let cell = tableView.configureCell(BookingActiveCell.self, at: indexPath)
            cell.config(data: allEvents[indexPath.row])
            cell.imgWishlist.isHidden = true
            cell.imgWishlist.tag = indexPath.row
            cell.imgWishlist.addTap { r in
                self.triggerToggleWishlist(type: 4, index: r.view?.tag ?? 0)
            }
            return cell
        }
        if indexPath.section > 0{
            let cell = tableView.configureCell(EventListCell.self, at: indexPath)
            cell.headerTitle.text = headerTitles[indexPath.section - 1]
            cell.config(type: indexPath.section)
            cell.eventTapped = { (tag,index) in
                self.navigateToEvent(tag: tag, index: index, type: 1)
            }
            cell.eventItemTapped = { (tag,index) in
                self.triggerToggleWishlist(type: tag, index: index)
            }
            cell.configureData(data: [self.nearByEvents,self.topRatedEvents,self.popularUsersEvents,allEvents][indexPath.section - 1])
            cell.viewAll.isHidden = true
            return cell
        }
        let cell = tableView.configureCell(FeatureCell.self, at: indexPath)
        cell.config(type: 1)
        cell.configure(data: self.popularEvents)
        cell.wishTapped = { index in
            self.triggerToggleWishlist(type: 100, index: index)
        }
        cell.eventTapped = { index in
            self.navigateToEvent(tag: 0, index: index, type: 0)
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if indexPath.section == 4{
            if self.allEvents.count == 0{
                return
            }
            self.navigateToEvent(tag: 4, index: indexPath.row, type: 1)
        }
    }
    func navigateToEvent(tag:Int,index:Int,type:Int){
        if let vc: EventDetailController = self.getController(from: .main) {
            if type == 1{
                if tag == 1{
                    vc.eventData = self.nearByEvents[index]
                }else if tag == 2{
                    vc.eventData = self.topRatedEvents[index]
                }else if tag == 3{
                    vc.eventData = self.popularUsersEvents[index]
                }else if tag == 4{
                    vc.eventData = self.allEvents[index]
                }
            }else if type == 0{
                vc.eventData = self.popularEvents[index]
            }
            vc.wishlistTapped = {
                if type == 1{
                    if tag == 1{
                        self.nearByEvents[index].isWishlisted = self.nearByEvents[index].isWishlisted == 1 ? 0 : 1
                    }else if tag == 2{
                        self.topRatedEvents[index].isWishlisted = self.topRatedEvents[index].isWishlisted == 1 ? 0 : 1
                    }else if tag == 3{
                        self.popularUsersEvents[index].isWishlisted = self.popularUsersEvents[index].isWishlisted == 1 ? 0 : 1
                    }else if tag == 4{
                        self.allEvents[index].isWishlisted = self.allEvents[index].isWishlisted == 1 ? 0 : 1
                    }
                }else if type == 0{
                    self.popularEvents[index].isWishlisted = self.popularEvents[index].isWishlisted == 1 ? 0 : 1
                }
                self.tableView.refreshTable()
            }
            self.pushVC(vc: vc)
        }
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(FilterCollectionContainerCell.self)
        if homeData.category != nil{
            cell.cellConfig(category: homeData.category,filterData:self.filterData)
        }
        var title = ""
        for index in 0..<homeData.category.count{
            var categoryId = category.id
            let catFilter = self.filterData["category_id"] as? Int ?? 0
            if catFilter > 0{
                categoryId = catFilter
            }
            if homeData.category[index].id == categoryId{
                title = homeData.category[index].title
            }
        }
        cell.lblTitle.text = "EXPLORE".localized + " " + title.uppercased()
        cell.itemTapped = { (section,index) in
            if index == 0 && section == 0{
                if let vc: FilterVC = self.getController(from: .main) {
                    vc.filterParam = self.filterData
                    vc.itemTapped = { data in
                        self.filterData = data
                        let catFilter = self.filterData["category_id"] as? Int ?? 0
                        if catFilter == 0{
                            self.filterData["category_id"] = self.category.id
                        }
                        for index in 0..<self.homeData.category.count{
                            self.homeData.category[index].isSelected = false
                        }
                        
                        self.triggerPopularEvents(sort: 5, filter: data)
                    }
                    self.presentVC(vc: vc)
                }
            }else{
                var catFilter = self.filterData["sort_Filter"] as? Int ?? 1
                catFilter -= 1
                let titles = ["Near By","Ongoing","Upcoming","Price High to Low","Price Low to High"]
                self.showPicker(title: "Sort Options", selectedItem: titles[catFilter], pickerValues: titles) { status, index in
                    if status{
                        self.filterData["sort_Filter"] = index + 1
                        self.triggerPopularEvents(sort: 5, filter: self.filterData)
                    }
                }
            }
        }
        return cell
    }
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return indexPath.section == 4 ? allEvents.count == 0 ? UITableView.automaticDimension : 100 : UITableView.automaticDimension
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if section == 4{
            if allEvents.count == 0{
                return 0
            }
            return 120
        }
        return 0
    }
    func triggerToggleWishlist(type:Int,index:Int){
        var id = 0
        if type == 100{
            id = self.popularEvents[index].id
        }else{
            if type == 0{
                id = self.nearByEvents[index].id
            }else if type == 1{
                id = self.topRatedEvents[index].id
            }else if type == 2{
                id = self.popularUsersEvents[index].id
            }else if type == 3{
                id = self.allEvents[index].id
            }
        }
        if id == 0{
            return
        }
        EventRequest.instance.triggerWishlistEvent(param: ["event_id" : id]) { response, status in
//            Utils.showToast(message: response.message)
        }
    }
}
