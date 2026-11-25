//
//  EventSearchVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//

import UIKit

class EventSearchVC: UIViewController {
    @IBOutlet weak var btnClear: UIButton!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var backTitle: SFProLabel!
    @IBOutlet weak var fieldSearch: UITextField!
    var samePageRefresh = false
    var searchData = [SearchResponse](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var trendingData = [SearchResponse](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var historyData = [SearchResponse](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var showClear = false{
        didSet{
            self.btnClear.isHidden = !self.showClear
        }
    }
    var interSearchResponse = HomePageResponse.init(fromDictionary: [String : Any]())
    var eventDetail = EventDetailResponse.init(fromDictionary: [String : Any]())
    var wishlistTapped : (() -> Void)?
    var isAPICalling = false
    var keySearch = ""
    var participantData = [ProfileResponse](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var filteredParticipants: [ProfileResponse] = []{
        didSet{
            self.tableView.refreshTable()
        }
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        self.showClear = false
        if eventDetail.id == 0 && !isInterSearch{
            fieldSearch.becomeFirstResponder()
        }else{
            self.backTitle.text = !keySearch.isEmpty ? keySearch : "Participants"
            fieldSearch.placeholder = "Search"
        }
        backView.addTap { r in
            isInterSearch = false
            self.popVC()
        }
        btnClear.onTap {
            self.filteredParticipants = []
            self.fieldSearch.text = ""
            self.showClear = false
            self.triggerSearch(text: "")
        }
        fieldSearch.onChange { text in
            if isInterSearch{
                self.keySearch = text
            }
            if self.eventDetail.id > 0{
                if text.isEmpty {
                    self.filteredParticipants = []
                } else {
                    self.filteredParticipants = self.participantData.filter {
                        $0.firstName.contains(text) || $0.lastName.contains(text)
                    }
                }
                self.showClear = true
                return
            }else{
                self.showClear = true
                self.triggerSearch(text: text)
            }
        }
        fieldSearch.shouldReturn {
            self.navigateToSearch()
            return self.fieldSearch.resignFirstResponder()
        }
        tableView.registerNIBs(EventSearchCell.self,BookingMaterialHeaderCell.self,HomeEventListCell.self,CalanderNoEventCell.self)
        triggerHistory()
        if isInterSearch{
            fieldSearch.text = keySearch
            self.triggerSearch(text: keySearch)
        }else if eventDetail.id > 0{
            EventRequest.instance.triggerParticipantSearch(param: ["event_id" : eventDetail.id ?? 0]) { data, status in
                self.participantData = data
            }
        }
    }
    func navigateToSearch(){
        if isInterSearch || eventDetail.id > 0{
           return
        }
        if let vc: EventSearchVC = self.getController(from: .main) {
            isInterSearch = true
            samePageRefresh = true
            vc.wishlistTapped = {
                self.wishlistTapped?()
            }
            vc.keySearch = self.fieldSearch.text ?? ""
            self.pushVC(vc: vc)
        }
    }
    override func viewWillAppear(_ animated: Bool) {
        APIDispatcher.instance.removeLoading()
    }
    func triggerHistory(){
        if isInterSearch || eventDetail.id > 0{
            return
        }
        self.isAPICalling = true
        APIDispatcher.instance.removeLoading()
        EventRequest.instance.triggerGetHistory(param: [String : Any]()) { data, status in
            if status{
                self.isAPICalling = false
                APIDispatcher.instance.removeLoading()
                self.trendingData = data.trending
                self.historyData = data.history
            }
        }
    }
    func triggerSearch(text:String){
        self.showClear = !text.isEmpty
        if text.isEmpty{
            self.searchData = []
            self.triggerHistory()
            return
        }
        self.isAPICalling = true
        let isFieldFirstResponder = fieldSearch.isFirstResponder
        if isInterSearch{
            EventRequest.instance.triggerEventInterSearch(param: ["keyword" : self.keySearch,"latitude":locationData.coordinate.latitude,"longitude":locationData.coordinate.longitude]) { data, status in
                self.isAPICalling = false
                self.interSearchResponse = data
                self.tableView.refreshTable()
                if isFieldFirstResponder {
                    self.fieldSearch.becomeFirstResponder()
                }
            }
            return
        }
        EventRequest.instance.triggerEventSearch(param: ["search" : text]) { data, status in
            self.isAPICalling = false
            self.searchData = data
            if isFieldFirstResponder {
                self.fieldSearch.becomeFirstResponder()
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        searchView.config(isRoundCorner: true)
    }
}

extension EventSearchVC:UITableViewDelegate,UITableViewDataSource{
    func numberOfSections(in tableView: UITableView) -> Int {
        if eventDetail.id > 0{
            return self.fieldSearch.text!.isEmpty ? participantData.count : filteredParticipants.count < 1 ? 1 : filteredParticipants.count
        }
        if isInterSearch{
            return 1
        }
        if self.fieldSearch.text!.isEmpty{
            return 2
        }
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if eventDetail.id > 0{
            return 1
        }
        if isInterSearch{
            if !self.fieldSearch.text!.isEmpty && interSearchResponse.events.count == 0{
                return self.isAPICalling ? 0 : 1
            }
            return interSearchResponse.events.count
        }
        if self.fieldSearch.text!.isEmpty{
            if section == 0{
                return trendingData.count
            }
            return historyData.count
        }
        return searchData.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if eventDetail.id > 0{
            if !self.fieldSearch.text!.isEmpty && filteredParticipants.count == 0{
                let cell = tableView.configureCell(CalanderNoEventCell.self, at: indexPath)
                cell.lblTitle.text = "NO RESULTS FOUND".localized
                cell.lblSubtitle.text = ""
                cell.exploreView.isHidden = true
                return cell
            }
            let cell = tableView.configureCell(EventSearchCell.self, at: indexPath)
            let data = filteredParticipants.count > 0 ? filteredParticipants : participantData
            cell.lblTitle.text = "\(data[indexPath.section].firstName ?? "")" + " " + "\(data[indexPath.section].lastName ?? "")"
            cell.imgView.loadAsyncImageWithPlaceholder(loadURL: data[indexPath.section].profileImage, placeHolder: "ic_account")
            cell.imgArrow.isHidden = false
            return cell
        }
        if isInterSearch{
            if !self.fieldSearch.text!.isEmpty && interSearchResponse.events.count == 0{
                let cell = tableView.configureCell(CalanderNoEventCell.self, at: indexPath)
                cell.lblTitle.text = "NO RESULTS FOUND".localized
                cell.lblSubtitle.text = ""
                cell.exploreView.isHidden = true
                return cell
            }else{
                let cell = tableView.configureCell(HomeEventListCell.self, at: indexPath)
                cell.config(data: interSearchResponse.events[indexPath.row])
                cell.imgWishlist.tag = indexPath.row
                cell.imgWishlist.addTap { r in
                    self.triggerToggleWishlist(index: r.view?.tag ?? 0)
                }
                return cell
            }
        }
        let cell = tableView.configureCell(EventSearchCell.self, at: indexPath)
        if self.fieldSearch.text!.isEmpty{
            if indexPath.section == 0{
                if trendingData.count > indexPath.row{
                    cell.lblTitle.text = trendingData[indexPath.row].title
                    cell.imgView.loadAsyncImage(loadURL: trendingData[indexPath.row].categoryImage)
                }
            }else{
                if historyData.count > indexPath.row{
                    cell.lblTitle.text = historyData[indexPath.row].title
                    cell.imgView.loadAsyncImage(loadURL: historyData[indexPath.row].categoryImage)
                }
            }
            return cell
        }
        if searchData.count > indexPath.row{
            cell.lblTitle.text = searchData[indexPath.row].title
            cell.imgView.loadAsyncImage(loadURL: searchData[indexPath.row].categoryImage)
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if eventDetail.id > 0 {
            if !self.fieldSearch.text!.isEmpty && filteredParticipants.count == 0{
                return
            }
            let data = filteredParticipants.count > 0 ? filteredParticipants[indexPath.section] : participantData[indexPath.section]
            if data.is_mine == 1{
                self.setRootControllerWithTabIndex(board: .main, identifier: .homeVC, index: 3)
                return
            }
            if let vc : MYProfileVC = self.getController(from: .main){
                vc.profileData = data
                self.eventDetail.selectedParticipiantId = data.userId
                vc.eventDetail = self.eventDetail
                vc.isFromParticipant = true
                self.pushVC(vc: vc)
            }
            return
        }
        if isInterSearch{
            if let vc: EventDetailController = self.getController(from: .main) {
                vc.eventData = interSearchResponse.events[indexPath.row]
                vc.isFromSearch = true
                vc.wishlistTapped = {
                    self.wishlistTapped?()
                }
                vc.wishlistUpdated = { data in
                    let isFieldFirstResponder = self.fieldSearch.isFirstResponder
                    for item in self.interSearchResponse.events{
                        if data.id == item.id{
                            item.isWishlisted = data.isWishlisted
                            tableView.refreshTable()
                            if isFieldFirstResponder {
                                self.fieldSearch.becomeFirstResponder()
                            }
                        }
                    }
                    self.wishlistTapped?()
                }
                self.pushVC(vc: vc)
            }
            return
        }
        APIDispatcher.instance.removeLoading()
        let event = HomePageEvent.init(fromDictionary: [String : Any]())
        if self.fieldSearch.text!.isEmpty{
            if indexPath.section == 0{
                event.id = trendingData[indexPath.row].id
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0, execute: {
                    self.triggerHistory()
                })
            }else{
                event.id = historyData[indexPath.row].id
            }
        }else{
            if searchData.count > indexPath.row{
                event.id = searchData[indexPath.row].id
            }
        }
        if event.id == 0{
            return
        }
        if let vc: EventDetailController = self.getController(from: .main) {
            vc.eventData = event
            vc.isFromSearch = true
            vc.wishlistTapped = {
                self.wishlistTapped?()
            }
            vc.wishlistUpdated = { data in
                self.wishlistTapped?()
            }
            self.pushVC(vc: vc)
        }
        APIDispatcher.instance.removeLoading()
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingMaterialHeaderCell.self)
        cell.configHeader(title: section == 0 ? "Popular Search" : "History", subTitle: "")
        cell.backgroundColor = UIColor.init(hex: "#F9F6FD")
        return cell
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if isInterSearch || eventDetail.id > 0 {
            return 0.1
        }
        if self.fieldSearch.text!.isEmpty{
            let numberOfRows = self.tableView(tableView, numberOfRowsInSection: section)
            return numberOfRows == 0 ? 0.1 : UITableView.automaticDimension
        }
        return 0.1
    }
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        if !isAPICalling{
            self.view.endEditing(true)
        }
    }
    func triggerToggleWishlist(index:Int){
        let isFieldFirstResponder = self.fieldSearch.isFirstResponder
        let id = interSearchResponse.events[index].id ?? 0
        EventRequest.instance.triggerWishlistEvent(param: ["event_id" : id]) { response, status in
            if response.status{
                self.interSearchResponse.events[index].isWishlisted = self.interSearchResponse.events[index].isWishlisted == 1 ? 0 : 1
                self.tableView.refreshTable()
                if isFieldFirstResponder {
                    self.fieldSearch.becomeFirstResponder()
                }
            }
        }
    }
}
