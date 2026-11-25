//
//  FilterVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 08/01/25.
//
struct Pricedata {
    var id : String?
    var title : String?
    var isSelected : Bool = false
    
    init(id: String = "", title: String = "", isSelected: Bool = false) {
        self.id = id
        self.title = title
        self.isSelected = isSelected
    }
}


import UIKit

class FilterVC: UIViewController {
    @IBOutlet weak var lblClear: SFProLabel!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var cancelView: UIView!
    @IBOutlet weak var applyView: UIView!
    var filterParam = [String:Any]()
    var headers = ["Event Date","","Organizers","Speakers","Journey Level","Price Type","Location Type"]
    var itemTapped : (([String:Any]) -> Void)?
    var journies = [HomePageEvent]()
    var categoryData = [HomePageCategory]()
    var pricelist : [Pricedata] = []
    var locationlist : [Pricedata] = []
    var categoriesLists = [FilterListCategory]()
    var filterData = FilterListResponse.init(fromDictionary: [String : Any]())
    var isFromHome = false

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        if isFromHome{
            headers[1] = "Categories"
        }
        self.view.setAlphaBackground()
        cancelView.addTap { r in
            self.dismissVC()
        }
        applyView.addTap { r in
            self.itemTapped?(self.filterParam)
            self.dismissVC()
        }
        triggerJournies()
        triggerHome()

        pricelist.append(Pricedata(id: "0", title: "Free".localized,isSelected:false))
        pricelist.append(Pricedata(id: "1", title: "Paid".localized,isSelected: false))
        locationlist.append(Pricedata(id: "0", title: "Online".localized,isSelected:false))
        locationlist.append(Pricedata(id: "1", title: "Onsite".localized,isSelected: false))
        let category = self.filterParam["price_type"] as? String ?? ""
        for index in 0..<self.pricelist.count {
            self.pricelist[index].isSelected = self.pricelist[index].id == category
        }
        let location = self.filterParam["location"] as? String ?? ""
        for index in 0..<self.locationlist.count {
            self.locationlist[index].isSelected = self.locationlist[index].id == location
        }
        tableView.registerNIBs(FilterDateCell.self,FilterCheckCell.self,BookingMaterialHeaderCell.self)
        lblClear.addTap { r in
            self.filterParam = [String:Any]()
            self.itemTapped?(self.filterParam)
            self.triggerFilterLists()
            self.tableView.refreshTable()
//            self.dismissVC()
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
        cancelView.config( borderColor: UIColor.init(hex: "#D0D0D0"), borderWidth: 1.0, isRoundCorner: true)
    }
}
extension FilterVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return headers.count
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 1{
            return isFromHome ? filterData.categoriesData.count : 0//categoryData.count
        }else if section == 2{
            return filterData.organizers.count
        }else if section == 3{
            return filterData.speakers.count
        }else if section == 4{
            return journies.count
        }else if section == 5{
            return pricelist.count
        }else if section == 6{
            return locationlist.count
        }
        return section == 0 ? 1 : 0
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 0{
            let cell = tableView.configureCell(FilterDateCell.self, at: indexPath)
            cell.startView.addTap { r in
                self.showPicker(type: 1)
            }
            cell.endView.addTap { r in
                self.showPicker(type: 2)
            }
            let startDate = filterParam["start_date"] as? String ?? ""
            let endDate = filterParam["end_date"] as? String ?? ""
            cell.lblStart.text = startDate.isEmpty ? "Start date".localized : startDate
            cell.lblEnd.text = endDate.isEmpty ? "End date".localized : endDate
            return cell
        }
        let cell = tableView.configureCell(FilterCheckCell.self, at: indexPath)
        if indexPath.section == 1{
            cell.lblTitle.text = isFromHome ? filterData.categoriesData[indexPath.row].title : categoryData[indexPath.row].title
            let isSelected = isFromHome ? filterData.categoriesData[indexPath.row].isSelected : categoryData[indexPath.row].isSelected
            cell.imgCheck.image = UIImage.init(named: isSelected ? "ic_check" : "ic_uncheck")!
        }else if indexPath.section == 2{
            cell.lblTitle.text = filterData.organizers[indexPath.row].organizationName
            cell.imgCheck.image = UIImage.init(named: filterData.organizers[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
        }else if indexPath.section == 3{
            let name = filterData.speakers[indexPath.row].firstName + " " + filterData.speakers[indexPath.row].lastName
            cell.lblTitle.text = name
            cell.imgCheck.image = UIImage.init(named: filterData.speakers[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
        }else if indexPath.section == 4{
            cell.lblTitle.text = journies[indexPath.row].title
            cell.imgCheck.image = UIImage.init(named: journies[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
        }else if indexPath.section == 5{
            cell.lblTitle.text = pricelist[indexPath.row].title
            cell.imgCheck.image = UIImage.init(named: pricelist[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
        }else if indexPath.section == 6{
            cell.lblTitle.text = locationlist[indexPath.row].title
            cell.imgCheck.image = UIImage.init(named: locationlist[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if indexPath.section == 1{
            if isFromHome{
                for item in self.filterData.categoriesData{
                    item.isSelected = false
                }
                self.filterData.categoriesData[indexPath.row].isSelected = true
                self.filterParam["category_id"] = self.filterData.categoriesData[indexPath.row].id
            }else{
                for item in self.categoryData{
                    item.isSelected = false
                }
                self.categoryData[indexPath.row].isSelected = true
                self.filterParam["category_id"] = self.categoryData[indexPath.row].id
            }
            self.filterParam["organizer_id"] = []
            self.filterParam["speakers"] = []
            self.triggerFilterLists()
        }else if indexPath.section == 2{
            filterData.organizers[indexPath.row].isSelected = !filterData.organizers[indexPath.row].isSelected
            self.filterParam["organizer_id"] = filterData.organizers
                .filter { $0.isSelected }
                .map { $0.id }
        }else if indexPath.section == 3{
            filterData.speakers[indexPath.row].isSelected = !filterData.speakers[indexPath.row].isSelected
            self.filterParam["speakers"] = filterData.speakers
                .filter { $0.isSelected }
                .map { $0.id }
        }else if indexPath.section == 4{
            for item in journies{
                item.isSelected = false
            }
            journies[indexPath.row].isSelected = true
            self.filterParam["journey_level_id"] = self.journies[indexPath.row].id
        }else if indexPath.section == 5{
            for index in 0..<pricelist.count{
                pricelist[index].isSelected = false
            }
            pricelist[indexPath.row].isSelected = true
            self.filterParam["price_type"] = self.pricelist[indexPath.row].id
        }else if indexPath.section == 6{
            for index in 0..<locationlist.count{
                locationlist[index].isSelected = false
            }
            locationlist[indexPath.row].isSelected = true
            self.filterParam["location"] = self.locationlist[indexPath.row].id
        }
        tableView.refreshTable()

    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingMaterialHeaderCell.self)
        cell.configHeader(title: headers[section], subTitle: "")
        cell.leadingCons.constant = 0.0
        cell.trailingCons.constant = 0.0
        return cell
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        // Check if the section has any rows
        if section == 1 && !isFromHome{
            return 0.1
        }
        let numberOfRows = self.tableView(tableView, numberOfRowsInSection: section)
        // If no rows, hide the header by returning 0.1
        return numberOfRows == 0 ? 0.1 : UITableView.automaticDimension
    }

    func showPicker(type:Int){
        let currentDate = Date()
        let calendar = Calendar.current
        if let nextYearDate = calendar.date(byAdding: .year, value: 100, to: currentDate) {
            self.showDatePicker(title: type == 1 ? "Start Date" : "End Date", selectedDate: Date(), mode: .date, minDate: currentDate, maxDate: nextYearDate) { status, date in
                if status{
                    let formatter = DateFormatter()
                    formatter.dateFormat = "yyyy-MM-dd"
                    self.filterParam[type == 1 ? "start_date" : "end_date"] = formatter.string(from: date)
                    self.tableView.refreshTable()
                }
            }
        }
    }
}
extension FilterVC{
    func triggerJournies(){
        RegisterRequest.instance.triggerJourneyList { data, status in
            self.journies = data
            let category = self.filterParam["journey_level_id"] as? Int ?? 0
            for index in 0..<self.journies.count{
                if self.journies[index].id == category{
                    self.journies[index].isSelected = true
                }
            }
            self.tableView.refreshTable()
        }
    }
    func triggerHome(){
        HomeRequest.instance.triggerHome { data, status in
            self.categoryData = []
            if status{
                self.categoryData = data.category
                let category = self.filterParam["category_id"] as? Int ?? 0
                for index in 0..<self.categoryData.count{
                    if self.categoryData[index].id == category{
                        self.categoryData[index].isSelected = true
                    }
                }
            }
            self.triggerFilterLists()
            self.tableView.refreshTable()
        }
    }
    func triggerFilterLists(){
        var type = 0
        if isFromHome{
            let filter = self.filterData.categoriesData.filter { $0.isSelected }
            if filter.count > 0{
                categoriesLists = self.filterData.categoriesData
                type = filter[0].id
            }else{
                let catId = filterParam["category_id"] as? Int ?? 0
                if catId > 0{
                    type = catId
                }
            }
        }else{
            let filter = self.categoryData.filter { $0.isSelected }
            if filter.count > 0{
                type = filter[0].id
            }else{
                if self.categoryData.count > 0{
                    type = self.categoryData[0].id
                }
            }
        }
        HomeRequest.instance.triggerFilter(param: ["type" : type]) { data, status in
            if status{
                let modal = FilterListModel.init(fromDictionary: data)
                self.filterData = modal.response
                if self.categoriesLists.count > 0{
                    self.filterData.categoriesData = self.categoriesLists
                }
                if self.isFromHome{
                    let filter = self.filterData.categoriesData.filter { $0.isSelected }
                    if filter.count == 0{
                        let catId = self.filterParam["category_id"] as? Int ?? 0
                        for item in self.filterData.categoriesData{
                            if item.id == catId{
                                item.isSelected = true
                            }
                        }
                    }
                }
                let organizers = self.filterParam["organizer_id"] as? [Int] ?? []
                self.filterData.organizers.forEach { organizer in
                    organizer.isSelected = organizers.contains(organizer.id)
                }
                let speakers = self.filterParam["speakers"] as? [Int] ?? []
                self.filterData.speakers.forEach { speaker in
                    speaker.isSelected = speakers.contains(speaker.id)
                }
                DispatchQueue.main.async {
                    let indexSet = IndexSet(integersIn: 0..<self.headers.count) // Get all section indexes
                    self.tableView.reloadSections(indexSet, with: .fade) // Use smooth animation
                }
            }
        }
    }
}
