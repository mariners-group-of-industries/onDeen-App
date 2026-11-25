//
//  FilterController.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 07/02/25.
//

import UIKit

class FilterController: UIViewController {
    @IBOutlet weak var imgClose: UIImageView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var cancelView: UIView!
    @IBOutlet weak var applyView: UIView!
    var journies = [HomePageEvent]()
    var filterParam = [String:Any]()
    var itemTapped : (([String:Any]) -> Void)?
    var isFromHome = true
    var filterData = FilterListResponse.init(fromDictionary: [String : Any]())
    var categoryData = [HomePageCategory]()
    var pricelist : [Pricedata] = []
    var locationlist : [Pricedata] = []
    var categoriesLists = [FilterListCategory]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        tableView.registerNIBs(FilterHeaderCell.self,FilterItemCell.self)
        imgClose.addTap { r in
            self.dismissVC()
        }
        cancelView.addTap { r in
            self.filterParam = [String:Any]()
            for item in self.journies{
                item.isSelected = false
            }
            for item in self.categoriesLists{
                item.isSelected = false
            }
            self.filterData = FilterListResponse.init(fromDictionary: [String : Any]())
            self.itemTapped?(self.filterParam)
            self.triggerFilterLists()
            self.tableView.refreshTable()
        }
        applyView.addTap { r in
            self.itemTapped?(self.filterParam)
            self.dismissVC()
        }
        triggerFilterLists()
        triggerJournies()
    }
    func triggerJournies(){
        RegisterRequest.instance.triggerJourneyList { data, status in
            self.journies = data
            let category = self.filterParam["journey_level_id"] as? Int ?? 0
            for index in 0..<self.journies.count{
                if self.journies[index].id == category{
                    self.journies[index].isSelected = true
                }
            }
            self.tableView.reloadData()
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        cancelView.config(borderColor: UIColor.init(hex: "#000000"), borderWidth: 1.0, isRoundCorner: true)
    }
}
extension FilterController:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 5
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 1{
            if filterData.categoriesData.count > 3 && !filterData.showCategory{
                return 3
            }
            return filterData.categoriesData.count
        }else if section == 2{
            if filterData.speakers.count == 0{
                return 0
            }
            return !self.filterData.showSpeakers ? 1 : filterData.speakers.count
        }else if section == 3{
            if filterData.organizers.count == 0{
                return 0
            }
            return !self.filterData.showOrganizer ? 1 : filterData.organizers.count
        }else if section == 4{
            return filterData.genderData.count
        }
        return 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section > 0{
            let cell = tableView.configureCell(FilterItemCell.self, at: indexPath)
            cell.stackTop.constant = 0.0
            cell.lineCons.constant = 0.0
            cell.showAllStack.isHidden = true
            cell.imgRightArrow.isHidden = true
            cell.subView.tag = indexPath.section
            cell.subView.accessibilityHint = "\(indexPath.row)"
            cell.subView.addTap { r in
                let section = r.view?.tag ?? 0
                let row = Int(r.view?.accessibilityHint ?? "") ?? 0
                self.didTapItems(section: section, row: row)
            }
            if indexPath.section == 1{
                cell.subView.isHidden = false
                cell.lblTitle.isHidden = indexPath.row > 0
                cell.lblTitle.text = "Category".localized
                cell.lblSubtitle.text = filterData.categoriesData[indexPath.row].title
                if filterData.categoriesData.count > 3 && !filterData.showCategory{
                    cell.lblLine.isHidden = filterData.categoriesData.count != 2
                }else{
                    cell.lblLine.isHidden = filterData.categoriesData.count != indexPath.row + 1
                }
                cell.showAllStack.addTap { r in
                    self.filterData.showCategory = !self.filterData.showCategory
                    DispatchQueue.main.async {
                        self.tableView.reloadData()
                    }
                }
                cell.lblShowAll.text = self.filterData.showCategory ? "Show Less".localized : "Show All".localized
                UIView.animate(withDuration: 0.3) {
                    cell.imgArrow.transform = self.filterData.showCategory ? CGAffineTransform(rotationAngle: .pi) : .identity
                }
                if filterData.categoriesData.count > 3 && !filterData.showCategory{
                    cell.showAllStack.isHidden = indexPath.row + 1 == 3 ? false : true
                }else{
                    cell.showAllStack.isHidden = indexPath.row + 1 == filterData.categoriesData.count ? false : true
                }
                
                cell.showAllStack.isHidden = filterData.categoriesData.count == 3 ? true : cell.showAllStack.isHidden
                cell.imgCheck.image = UIImage.init(named: filterData.categoriesData[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
                cell.lineCons.constant = cell.showAllStack.isHidden ? 0.0 : 20.0
                cell.lblLine.isHidden = cell.showAllStack.isHidden
                return cell
            }else if indexPath.section == 2{
                cell.imgRightArrow.isHidden = false
                cell.lblTitle.isHidden = indexPath.row > 0
                cell.lblTitle.text = "Speakers".localized
                cell.lblSubtitle.text = filterData.speakers[indexPath.row].firstName + " " + filterData.speakers[indexPath.row].lastName
                cell.lblLine.isHidden = false// filterData.speakers.count != indexPath.row + 1
                cell.lblTitle.addTap { r in
                    self.navigateToSearch(type: .Speakers)
                    /*self.filterData.showSpeakers = !self.filterData.showSpeakers
                    DispatchQueue.main.async {
                        let sectionIndexSet = IndexSet(integer: indexPath.section)
                        self.tableView.reloadSections(sectionIndexSet, with: .automatic)
                    }*/
                }
                cell.subView.isHidden = !self.filterData.showSpeakers
                cell.imgCheck.image = UIImage.init(named: filterData.speakers[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
                cell.lineCons.constant = 20.0
                return cell
            }else if indexPath.section == 3{
                cell.imgRightArrow.isHidden = false
                cell.lblTitle.isHidden = indexPath.row > 0
                cell.lblTitle.text = "Organisers".localized
                cell.lblSubtitle.text = filterData.organizers[indexPath.row].organizationName
                cell.lblLine.isHidden = false//filterData.organizers.count != indexPath.row + 1
                cell.lblTitle.addTap { r in
                    self.navigateToSearch(type: .Organizers)
                }
                cell.subView.isHidden = !self.filterData.showOrganizer
                cell.imgCheck.image = UIImage.init(named: filterData.organizers[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
                return cell
            }else if indexPath.section == 4{
                cell.stackTop.constant = indexPath.row == 0 ? 10.0 : 0.0
                cell.subView.isHidden = false
                cell.lblTitle.isHidden = indexPath.row > 0
                cell.lblTitle.text = "Gender".localized
                cell.lblSubtitle.text = filterData.genderData[indexPath.row].title
                if filterData.genderData.count == indexPath.row + 1{
                    cell.lblLine.isHidden = true //filterData.genderData.count != 2
                }else{
                    cell.lblLine.isHidden = false //filterData.genderData.count != indexPath.row + 1
                }
                cell.showAllStack.addTap { r in
                    self.filterData.showGender = !self.filterData.showGender
                    DispatchQueue.main.async {
                        self.tableView.reloadData()
                    }
                }
                cell.lblShowAll.text = self.filterData.showGender ? "Show Less".localized : "Show All".localized
                UIView.animate(withDuration: 0.3) {
                    cell.imgArrow.transform = self.filterData.showGender ? CGAffineTransform(rotationAngle: .pi) : .identity
                }
                if filterData.genderData.count > 3 && !filterData.showGender{
                    cell.showAllStack.isHidden = indexPath.row + 1 == 3 ? false : true
                }else{
                    cell.showAllStack.isHidden = indexPath.row + 1 == filterData.genderData.count ? false : true
                }
                
                cell.showAllStack.isHidden = filterData.genderData.count == 3 ? true : cell.showAllStack.isHidden
                cell.imgCheck.image = UIImage.init(named: filterData.genderData[indexPath.row].isSelected ? "ic_check" : "ic_uncheck")!
                cell.lineCons.constant = cell.showAllStack.isHidden ? 0.0 : 20.0
                cell.lblLine.isHidden = cell.showAllStack.isHidden
                return cell
            }
            return cell
        }
        let cell = tableView.configureCell(FilterHeaderCell.self, at: indexPath)
        cell.config(data: journies)
        cell.dateItemTapped = { type in
            if type == 0{
                if let vc: EventDateVC = self.getController(from: .main) {
                    vc.filterParam = self.filterParam
                    vc.itemTapped = { data in
                        self.filterParam = data
                        DispatchQueue.main.async(execute: {
                            self.tableView.reloadData()
                        })
                        self.tableView.reloadData()
                    }
                    self.presentVC(vc: vc)
                }
            }else if type == 1{
                if let vc: EventChooseDateVC = self.getController(from: .main) {
                    vc.filterParam = self.filterParam
                    vc.itemTapped = { data in
                        self.filterParam = data
                        DispatchQueue.main.async(execute: {
                            self.tableView.reloadData()
                        })
                        self.tableView.reloadData()
                    }
                    self.presentVC(vc: vc)
                }
            }
        }
        let dateFilter = self.filterParam["date_filter"] as? Int ?? 0
        if let superField = cell.lblChooseDate.superview{
            superField.isHidden = dateFilter > 0
        }
        var startDate = filterParam["start_date"] as? String ?? ""
        let formater = DateFormatter()
        formater.dateFormat = "yyyy-MM-dd"
        if let getDate = formater.date(from: startDate){
            formater.dateFormat = "dd-MM-yyyy"
            startDate = formater.string(from: getDate)
        }
        formater.dateFormat = "yyyy-MM-dd"
        var endDate = filterParam["end_date"] as? String ?? ""
        if let getDate = formater.date(from: endDate){
            formater.dateFormat = "dd-MM-yyyy"
            endDate = formater.string(from: getDate)
        }
        if dateFilter == 1{
            endDate = ""
        }
        if startDate.isEmpty{
            cell.lblChooseDate.text = "Choose Date".localized
        }else{
            if !endDate.isEmpty{
                startDate += " - " + endDate
            }
            cell.lblChooseDate.text = startDate
        }
        cell.lblAnyDate.text = "Any Date".localized
        var items = ["Any Date","Today","Tomorrow","This week","This Month"]
        if dateFilter >= 0{
            cell.lblAnyDate.text = items[dateFilter].localized
        }
        cell.btnSwitch.isOn = false
        let priceType = self.filterParam["price_type"] as? String ?? ""
        if priceType == "0"{
            cell.btnSwitch.isOn = true
        }
        cell.btnSwitch.onChange { value in
            self.filterParam["price_type"] = value ? "0" : ""
        }
        cell.tagTapped = { index in
            for item in self.journies{
                item.isSelected = false
            }
            self.journies[index].isSelected = true
            self.filterParam["journey_level_id"] = self.journies[index].id
        }
        return cell
    }
    func didTapItems(section:Int,row:Int){
        if section == 1{
            if isFromHome{
                for item in self.filterData.categoriesData{
                    item.isSelected = false
                }
                self.filterData.categoriesData[row].isSelected = true
                self.filterParam["category_id"] = self.filterData.categoriesData[row].id
            }else{
                for item in self.categoryData{
                    item.isSelected = false
                }
                self.categoryData[row].isSelected = true
                self.filterParam["category_id"] = self.categoryData[row].id
            }
            self.filterParam["organizer_id"] = []
            self.filterParam["speakers"] = []
            self.triggerFilterLists()
        }else if section == 2{
            filterData.speakers[row].isSelected = !filterData.speakers[row].isSelected
            self.filterParam["speakers"] = filterData.speakers
                .filter { $0.isSelected }
                .map { $0.id }
        }else if section == 3{
            filterData.organizers[row].isSelected = !filterData.organizers[row].isSelected
            self.filterParam["organizer_id"] = filterData.organizers
                .filter { $0.isSelected }
                .map { $0.id }
        }else if section == 4{
            for item in self.filterData.genderData{
                item.isSelected = false
            }
            self.filterData.genderData[row].isSelected = true
            self.filterParam["gender"] = self.filterData.genderData[row].id
        }
        tableView.reloadData()
    }
    func navigateToSearch(type:SearchBy){
        if let vc: FilterSearchVC = self.getController(from: .main) {
            vc.filterData = self.filterData
            vc.filterParam = self.filterParam
            vc.searchType = type
            vc.itemTapped = { data in
                self.filterParam = data
            }
            self.presentVC(vc: vc)
        }
    }
}
extension FilterController{
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
                for index in 0..<self.filterData.categoriesData.count{
                    if self.filterData.categoriesData[index].isSelected{
                        if index > 3{
                            self.filterData.showCategory = true
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
                let genders = self.filterData.genderData.filter { $0.isSelected }
                if genders.count == 0{
                    let catId = self.filterParam["gender"] as? Int ?? 0
                    for item in self.filterData.genderData{
                        if item.id == catId{
                            item.isSelected = true
                        }
                    }
                }
                self.tableView.reloadData()
            }
        }
    }
}
