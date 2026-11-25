//
//  HomeViewController.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit
import CoreLocation
import GLWalkthrough
var isInterSearch = false

class HomeViewController: UIViewController {
    @IBOutlet weak var imgNotification: UIImageView!
    @IBOutlet weak var imgFilter: UIImageView!
    @IBOutlet weak var lblSearchLocation: UILabel!
    @IBOutlet weak var locationStack: UIStackView!
    @IBOutlet weak var rightStack: UIStackView!
    @IBOutlet weak var lblAddress: UILabel!
    @IBOutlet weak var imgWishlist: UIImageView!
    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var tableView: UITableView!
    var homeData = HomePageResponse.init(fromDictionary: [String : Any]())
    var filterLists = FilterListResponse.init(fromDictionary: [String : Any]())
    let refreshControl = UIRefreshControl()
    var coachMarker:GLWalkThrough!
    var nearByEvents = [HomePageEvent]()
    var filterData = [String:Any]()
    var isViewLoads = false
    var isForceUpdate = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        imgNotification.addTap { r in
            self.didTapNotification()
        }
        let walkThrough = UserDefaults.standard.object(forKey: "walkThrough") as? Bool ?? false
        if !walkThrough{
            coachMarker = GLWalkThrough()
            coachMarker.dataSource = self
            coachMarker.delegate = self
            coachMarker.show()
        }
        tableView.registerNIBs(ExploreCell.self,FeatureCell.self,EventListCell.self,SubscribeListCell.self,HomeInterestCell.self,HomeEventListCell.self,HomeHeaderCell.self,CalanderNoEventCell.self)
        searchView.addTap { r in
            if let vc: EventSearchVC = self.getController(from: .main) {
                isInterSearch = false
                vc.wishlistTapped = {
                    self.triggerFilterList()
                }
                self.pushVC(vc: vc)
            }
        }
        imgWishlist.addTap { r in
            let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
            if getAuthorization.isEmpty{
                self.showGuestLogin()
                return
            }
            if let vc: WishlistVC = self.getController(from: .main) {
                vc.eventTapped = {
                    self.triggerFilterList()
                }
                self.pushVC(vc: vc)
            }
        }
        locationStack.addTap { r in
            if let vc: AddressVC = self.getController(from: .main) {
                self.presentVC(vc: vc)
            }
        }
        imgFilter.addTap { r in
            if let vc: FilterController = self.getController(from: .main) {
                vc.filterParam = self.filterData
                vc.itemTapped = { data in
                    self.filterData = data
                    self.triggerPopularEvents(sort: 1, filter: data)
                }
                vc.isFromHome = true
                self.presentVC(vc: vc)
            }
        }
        refreshControl.addTarget(self, action: #selector(refreshData), for: .valueChanged)
        tableView.refreshControl = refreshControl
        getLocationDetail()
        self.triggerFilterList()
    }
    @objc func refreshData() {
        self.triggerPopularEvents(sort: 1)
    }
    func didTapNotification(){
        if self.isGuestUser(){
            self.showGuestLogin()
            return
        }
        if let vc:NotificationVC = self.getController(from: .main){
            vc.wishlistTapped = {
                self.triggerFilterList()
            }
            vc.notificationTapped = { count in
                self.filterLists.new_notification_count = count
                self.rightStack.addBadge(count: self.filterLists.new_notification_count) {
                    self.didTapNotification()
                }
            }
            self.pushVC(vc: vc)
        }
    }
    func triggerFilterList(){
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        HomeRequest.instance.triggerFilter(param: ["type" : 0,"ios_version":appVersion]) { data, status in
            if status{
                self.isForceUpdate = self.getForceUpdate(from: data)
//                #if DEBUG
//                    self.isForceUpdate = true
//                #endif
                let modal = FilterListModel.init(fromDictionary: data)
                self.filterLists = modal.response
                self.rightStack.addBadge(count: self.filterLists.new_notification_count) {
                    self.didTapNotification()
                }
                if self.filterLists.categoriesData.count > 0{
                    let category = FilterListCategory.init(fromDictionary: [String : Any]())
                    category.title = "All\ncategories".localized
                    category.id = 10000
                    category.isSelected = true
                    self.filterLists.categoriesData.insert(category, at: 0)
                }
                self.triggerPopularEvents(sort: 1)
                self.tableView.refreshTable()
            }
        }
    }
    func getForceUpdate(from response: [String: Any]) -> Bool {
        let keys = ["response", "contact", "app_update"]
        for key in keys {
            if let getResponse = response[key] as? [String: Any],
               let forceIosUpdate = getResponse["force_ios_update"] {
                if let value = forceIosUpdate as? Bool {
                    return value
                } else if let value = forceIosUpdate as? Int {
                    return value == 1
                } else if let value = forceIosUpdate as? NSNumber {
                    return value == 1
                } else if let value = forceIosUpdate as? String {
                    return value == "1"
                }
            }
        }
        return false
    }

    func triggerPopularEvents(sort:Int = 1,filter:[String:Any] = [String:Any]()){
        var param : [String:Any] = filter
        if sort > 0{
            param["sort_Filter"] = sort
        }
        param["sort_Filter"] = sort
        print("========")
        print(JSON(param))
        print("========")
        let filter = self.filterLists.categoriesData.filter { $0.isSelected }
        if filter.count > 0{
            if filter[0].id != 10000{
                param["category_id"] = filter[0].id
            }
        }
        EventRequest.instance.triggerEventList(param: param) { data, status in
            self.refreshControl.endRefreshing()
            self.nearByEvents = data.events
            self.isViewLoads = true
            self.checkNotificationSeen()
            self.tableView.refreshTable()
        }
    }
    func checkNotificationSeen(){        
        if !notificationType.isEmpty && notificationID > 0{
            self.handlePushRedirection(type: notificationType, odid: notificationID)
        }
        if isForceUpdate{
            self.showSimpleAlert(withTitle: "Please update your app to continue", vc: self, type: 50)
        }
    }
    func handlePushRedirection(type: String, odid: Int) {
        notificationType = type
        notificationID = odid

        if let topVC = topViewController(){
            if type == "2" {
                if let vc: EventDetailController = topVC.getController(from: .main) {
                    vc.eventData = HomePageEvent.init(fromDictionary: ["id" : odid])
                    topVC.pushVC(vc: vc)
                }
            }else if type == "3" || type == "5" || type == "6" || type == "7"  || type == "8" || type == "9"{
                if let vc: BookingDetailVC = topVC.getController(from: .main) {
                    vc.eventData = HomePageEvent.init(fromDictionary: ["id" : odid])
                    vc.isCompletedBooking = type == "8"
                    vc.isQATabSelected = type == "9"
                    topVC.pushVC(vc: vc)
                }
            }else if type == "4" {
                if let vc: OneSessionVC = topVC.getController(from: .main) {
                    vc.sessionId = odid
                    topVC.pushVC(vc: vc)
                }
            }
        }
    }

    func triggerHome(){
        HomeRequest.instance.triggerHome { data, status in
            self.refreshControl.endRefreshing()
            self.homeData = HomePageResponse.init(fromDictionary: [String : Any]())
            if status{
                self.homeData = data
            }
            self.tableView.refreshTable()
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        searchView.config(borderColor: UIColor.init(hex: "#DBD4E3"), borderWidth: 0.0, isRoundCorner: true)
    }
    func getLocationDetail(){
        if customLocationPicked{
            LocationHelper.shared.getAddress(from: locationData) { address, error in
                if let error = error {
                    print("Failed to get address: \(error.localizedDescription)")
                } else if let address = address {
                    self.lblAddress.text = address
                    self.lblSearchLocation.text = address
                }
            }
            return
        }
        LocationHelper.shared.getCurrentLocation { location, error in
            locationData = location ?? CLLocation.init(latitude: 0.0, longitude: 0.0)
            if let error = error {
                self.lblAddress.text = "Select Location".localized
                self.lblSearchLocation.text = "".localized
                print("Failed to get location: \(error.localizedDescription)")
            } else if let location = location {
                LocationHelper.shared.getAddress(from: location) { address, error in
                    if let error = error {
                        print("Failed to get address: \(error.localizedDescription)")
                    } else if let address = address {
                        self.lblAddress.text = address
                        self.lblSearchLocation.text = address
                    }
                }
            }
        }
    }
}
extension HomeViewController:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        if self.filterLists.categoriesData.count > 0 || homeData.banner != nil || homeData.recent != nil || homeData.organizer.count > 0{
            return 2
        }
        return 0
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 1{
            return self.nearByEvents.count == 0 ? isViewLoads ? 1 : 0 : self.nearByEvents.count
        }
        if section == 0 && self.filterLists.categoriesData.count > 0{
            return 1
        }else if section == 1 && homeData.banner != nil{
            if homeData.banner.events.count > 0{
                return 1
            }
            return 0
        }else if section == 2 && homeData.recent != nil{
            if homeData.recent.events.count > 0{
                return 1
            }
            return 0
        }else if section == 3{
            return 1
        }else if section == 4{
            return homeData.organizer.count > 0 ? 1 : 0
        }
        return 0
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 1{
            if self.nearByEvents.count == 0{
                let cell = tableView.configureCell(CalanderNoEventCell.self, at: indexPath)
                cell.lblTitle.text = "NO RESULTS FOUND".localized
                cell.lblSubtitle.text = ""
                cell.exploreView.isHidden = true
                return cell
            }
            let cell = tableView.configureCell(HomeEventListCell.self, at: indexPath)
            cell.config(data: nearByEvents[indexPath.row])
            cell.imgWishlist.tag = indexPath.row
            cell.imgWishlist.addTap { r in
                self.triggerToggleWishlist(type: 4, index: r.view?.tag ?? 0)
            }
            cell.lblLine.isHidden = indexPath.row == nearByEvents.count - 1
            return cell
        }else if indexPath.section == 2{
            let cell = tableView.configureCell(EventListCell.self, at: indexPath)
            cell.config(type: 0)
            if homeData.recent != nil{
                cell.configureData(data: homeData.recent.events)
            }
            cell.wishTapped = { index in
                self.triggerToggleWishlist(type:2,index: index)
            }
            cell.eventTapped = { (tag,index) in
                self.navigateToEvent(tag: 0, index: index, type: 1)
            }
            cell.viewAll.isHidden = false
            cell.viewAll.addTap { r in
                if let vc: EventListVC = self.getController(from: .main) {
                    vc.homeData = self.homeData
                    self.pushVC(vc: vc)
                }
            }
            return cell
        }else if indexPath.section == 3{
            let cell = tableView.configureCell(SubscribeListCell.self, at: indexPath)
            cell.collectionView.addTap { r in
                let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
                if getAuthorization.isEmpty{
                    self.showGuestLogin()
                    return
                }
                if let vc:MembershipVC = self.getController(from: .main){
                    self.pushVC(vc: vc)
                }
            }
            return cell
        }else if indexPath.section == 4{
            let cell = tableView.configureCell(HomeInterestCell.self, at: indexPath)
            cell.config(data: homeData.organizer)
            cell.itemTapped = { index in
                if let vc: OrganizerProfileVC = self.getController(from: .main) {
                    vc.eventDetailData = EventDetailResponse.init(fromDictionary: ["user_id":self.homeData.organizer[index].id ?? 0])
                    vc.itemTapped = {
                        self.triggerFilterList()
                    }
                    self.pushVC(vc: vc)
                }
            }
            return cell
        }
        let cell = tableView.configureCell(ExploreCell.self, at: indexPath)
        cell.config(data: self.filterLists.categoriesData)
        cell.eventTapped = { index in
            self.filterData = [String:Any]()
            self.filterLists.categoriesData.forEach { item in
                item.isSelected = false
            }
            self.filterLists.categoriesData[index].isSelected = true
            self.tableView.refreshTable()
            self.triggerPopularEvents(sort: 1)
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if indexPath.section == 1{
            self.navigateToEvent(tag: indexPath.row, index: indexPath.row, type: 2)
        }
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(HomeHeaderCell.self)
        let data = ["HAPPENING AROUND YOU", "CURRENTLY ONGOING",
                    "UPCOMING EVENTS",
                    "HIGHEST PRICES FIRST",
                    "LOWEST PRICES FIRST"]
        let filterIndex = self.filterData["sort_Filter"] as? Int ?? 1
        cell.lblHeaderTitle.text = data[filterIndex - 1]
        cell.filterView.addTap { r in
            self.showSortView()
        }
        return cell
    }
    func showSortView(){
        if let vc: EventDateVC = self.getController(from: .main) {
            vc.filterParam = self.filterData
            vc.pageType = 2
            vc.itemTapped = { data in
                let indexPath = IndexPath(row: 0, section: 0)
                self.tableView.scrollToRow(at: indexPath, at: .top, animated: false)
                self.filterData = data
                let index = self.filterData["sort_Filter"] as? Int ?? 0
                self.triggerPopularEvents(sort: index, filter: self.filterData)
            }
            self.presentVC(vc: vc)
        }
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if section == 1{
            return UITableView.automaticDimension
        }
        return 0
    }
    func navigateToEvent(tag:Int,index:Int,type:Int){
        if let vc: EventDetailController = self.getController(from: .main) {
            if type == 0{
                vc.eventData = homeData.banner.events[index]
            }else if type == 1{
                vc.eventData = homeData.recent.events[index]
            }else if type == 2{
                if nearByEvents.count == 0{
                    return
                }
                vc.eventData = nearByEvents[index]
            }
            vc.wishlistTapped = {
                if type == 0{
                    self.homeData.banner.events[index].isWishlisted = self.homeData.banner.events[index].isWishlisted == 1 ? 0 : 1
                    self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 1)], with: .none)
                }else if type == 1{
                    self.homeData.recent.events[index].isWishlisted = self.homeData.recent.events[index].isWishlisted == 1 ? 0 : 1
                    self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 2)], with: .none)
                }else if type == 2{
                    self.nearByEvents[index].isWishlisted = self.nearByEvents[index].isWishlisted == 1 ? 0 : 1
                    self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 1)], with: .none)
                }
            }
            vc.wishlistUpdated = { data in
                for item in self.nearByEvents{
                    if item.id == data.id{
                        item.isWishlisted = data.isWishlisted
                        self.tableView.refreshTable()
                    }
                }
            }
            self.pushVC(vc: vc)
        }
    }
    func triggerToggleWishlist(type:Int,index:Int){
        var id = 0
        if type == 1{
            id = self.homeData.banner.events[index].id
        }else if type == 2{
            id = self.homeData.recent.events[index].id
        }else if type == 4{
            id = self.nearByEvents[index].id
        }
        EventRequest.instance.triggerWishlistEvent(param: ["event_id" : id]) { response, status in
            if response.status{
                if type == 1{
                    self.homeData.banner.events[index].isWishlisted = self.homeData.banner.events[index].isWishlisted == 1 ? 0 : 1
                }else if type == 1{
                    self.homeData.recent.events[index].isWishlisted = self.homeData.recent.events[index].isWishlisted == 1 ? 0 : 1
                }else if type == 4{
                    self.nearByEvents[index].isWishlisted = self.nearByEvents[index].isWishlisted == 1 ? 0 : 1
                    self.tableView.refreshTable()
                }
            }
        }
    }
}
// MARk: --
extension HomeViewController: GLWalkThroughDelegate {
    func didSelectNextAtIndex(index: Int) {
        if index == 6 {
            coachMarker.dismiss()
            UserDefaults.standard.set(true, forKey: "walkThrough")
            UserDefaults.standard.synchronize()
        }
    }
    
    func didSelectSkip(index: Int) {
        coachMarker.dismiss()
        UserDefaults.standard.set(true, forKey: "walkThrough")
        UserDefaults.standard.synchronize()
    }
}
extension HomeViewController: GLWalkThroughDataSource {
    func getTabbarFrame(index:Int) -> CGRect? {
        if let bar = self.tabBarController?.tabBar.subviews {
            var idx = 0
            var frame:CGRect!
            for view in bar {
                if view.isKind(of: NSClassFromString("UITabBarButton")!) {
                    print(view.description)
                    if idx == index {
                        frame =  view.frame
                    }
                    idx += 1
                }
            }
            return frame
        }
        return nil
    }
    
    func numberOfItems() -> Int {
        return 6
    }
    
    func configForItemAtIndex(index: Int) -> GLWalkThroughConfig {
        var tabbarPadding:CGFloat = Helper.shared.hasTopNotch ? 88 : 50
        tabbarPadding += 33
        let overlaySize:CGFloat = Helper.shared.hasTopNotch ? 60 : 50
        let leftPadding:CGFloat = Helper.shared.hasTopNotch ? 10 : 5
        switch index {
        case 0:
            var config = GLWalkThroughConfig()
            config.title = "Location"
            config.subtitle = "Search at any location to find the Events, Courses and tours."
            config.frameOverWindow = CGRect(x: locationStack.frame.origin.x + locationStack.frame.width - 40, y: locationStack.frame.origin.y - 20, width: overlaySize, height: overlaySize)
            config.position = .topLeft
            return config
        case 1:
            var config = GLWalkThroughConfig()
            config.title = "Access Your Wishlist"
            config.subtitle = "Find Courses, Events, and Tours You’ve Wishlisted"
            config.frameOverWindow = CGRect(x: rightStack.frame.origin.x + rightStack.frame.width - 30, y: rightStack.frame.origin.y - 20, width: overlaySize, height: overlaySize)
            config.position = .topRight
            return config
        case 2:
            guard let frame = getTabbarFrame(index: 0) else {
                return GLWalkThroughConfig()
            }
            var config = GLWalkThroughConfig()
            config.title = "Home"
            config.subtitle = "Explore latest Events, Courses and Tours on the home screen."
            config.frameOverWindow = CGRect(x: frame.origin.x + leftPadding + 22, y: view.frame.size.height - tabbarPadding, width: overlaySize, height: overlaySize)
            
            return config
        case 3:
            guard let frame = getTabbarFrame(index: 1) else {
                return GLWalkThroughConfig()
            }
            var config = GLWalkThroughConfig()
            config.title = "Calendar"
            config.subtitle = "Easily Track All Your Booked Events by Date"
            config.frameOverWindow = CGRect(x: frame.origin.x + leftPadding + 22, y: view.frame.size.height - tabbarPadding, width: overlaySize, height: overlaySize)
            config.position = .bottomLeft
            return config
        case 4:
            guard let frame = getTabbarFrame(index: 2) else {
                return GLWalkThroughConfig()
            }
            var config = GLWalkThroughConfig()
            config.title = "Bookings"
            config.subtitle = "View all your upcoming and completed bookings."
            config.frameOverWindow = CGRect(x: frame.origin.x + leftPadding + 22, y: view.frame.size.height - tabbarPadding, width: overlaySize, height: overlaySize)
            config.position = .bottomCenter
            return config
        case 5:
            guard let frame = getTabbarFrame(index: 3) else {
                return GLWalkThroughConfig()
            }
            var config = GLWalkThroughConfig()
            config.title = "My Profile"
            config.subtitle = "Your account details and settings"
            config.nextBtnTitle = "Done"
            config.frameOverWindow = CGRect(x: frame.origin.x + leftPadding + 22, y: view.frame.size.height - tabbarPadding, width: overlaySize, height: overlaySize)
            config.position = .bottomRight
            return config
        default:
            return GLWalkThroughConfig()
        }
    }
}


struct Helper {
    static var shared = Helper()
    
    var hasTopNotch: Bool {
        if #available(iOS 11.0, tvOS 11.0, *) {
            return UIApplication.shared.delegate?.window??.safeAreaInsets.top ?? 0 > 20
        }
        return false
    }
}
