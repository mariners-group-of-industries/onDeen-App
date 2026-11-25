//
//  FilterSearchVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 07/02/25.
//

import UIKit
enum SearchBy{
    case none
    case Speakers
    case Organizers
}
class FilterSearchVC: UIViewController {
    @IBOutlet weak var applyView: GlobalGradientView!
    @IBOutlet weak var resetView: UIView!
    @IBOutlet weak var fieldSearch: SFProField!
    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var backView: UIStackView!
    var filterData = FilterListResponse.init(fromDictionary: [String : Any]())
    var searchType : SearchBy = .none
    var filterParam = [String:Any]()

    var filteredSpeakers: [FilterListSpeaker] = []
    var filteredOrganizers: [FilterListOrganizer] = []
    
    var speakers: [FilterListSpeaker] = []
    var organizers: [FilterListOrganizer] = []
    
    var isSearching = false
    var itemTapped : (([String:Any]) -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        print(JSON(self.filterParam))
        let selectedSpeakerIDs: [Int] = self.filterParam["speakers"] as? [Int] ?? [Int]()
        let selectedOrganizerss: [Int] = self.filterParam["organizer_id"] as? [Int] ?? [Int]()
        filterData.speakers.forEach { item in
            item.isSelected = selectedSpeakerIDs.contains(item.id)
        }
        filterData.organizers.forEach { item in
            item.isSelected = selectedOrganizerss
                .contains(item.id)
        }
        speakers = filterData.speakers
        organizers = filterData.organizers
        tableView.registerNIBs(FilterItemCell.self)
        applyView.addTap { r in
            if self.searchType == .Speakers{
                self.filterParam["speakers"] = self.speakers
                    .filter { $0.isSelected }
                    .map { $0.id }
            }else if self.searchType == .Organizers{
                self.filterParam["organizer_id"] = self.organizers
                    .filter { $0.isSelected }
                    .map { $0.id }
            }
            self.itemTapped?(self.filterParam)
            self.dismissVC()
        }
        resetView.addTap { r in
            switch self.searchType {
            case .Speakers:
                self.speakers.forEach{
                    $0.isSelected = false
                }
                self.filterParam["speakers"] = self.speakers
                    .filter { $0.isSelected }
                    .map { $0.id }
            case .Organizers:
                self.organizers.forEach{
                    $0.isSelected = false
                }
                self.filterParam["organizer_id"] = self.organizers
                    .filter { $0.isSelected }
                    .map { $0.id }
            default:
                print("other")
            }
            self.itemTapped?(self.filterParam)
            self.dismissVC()
        }
        backView.addTap { r in
            self.dismissVC()
        }
        fieldSearch.onTextChange { text in
            if text.isEmpty{
                self.isSearching = false
                self.tableView.reloadData()
                return
            }
            self.isSearching = true
            switch self.searchType {
            case .Speakers:
                self.filteredSpeakers = self.speakers.filter {
                    $0.firstName.lowercased().contains(text) ||
                    $0.lastName.lowercased().contains(text)
                }
            case .Organizers:
                self.filteredOrganizers = self.organizers.filter {
                    $0.organizationName.lowercased().contains(text)
                }
            default:
                break
            }
            self.tableView.reloadData()
        }
        mainThread { [self] in
            lblTitle.text = ""
            switch self.searchType {
            case .Speakers:
                lblTitle.text = "Speakers"
            case .Organizers:
                lblTitle.text = "Organisers"
            default:
                print("other")
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        resetView.config(borderColor: UIColor.init(hex: "#000000"), borderWidth: 1.0, isRoundCorner: true)
        searchView.config(borderColor: UIColor.init(hex: "#DBD4E3"), borderWidth: 1.0, isRoundCorner: true)
    }
}
extension FilterSearchVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        switch self.searchType {
        case .Speakers:
            return isSearching ? filteredSpeakers.count : speakers.count
        case .Organizers:
            return isSearching ? filteredOrganizers.count : organizers.count
        default:
            return 0
        }
    }

    func didTapItems(section:Int,row:Int){
        switch self.searchType {
        case .Speakers:
            if !isSearching{
                speakers[row].isSelected = !speakers[row].isSelected
            }else{
                if filteredSpeakers.count > row{
                    for item in 0..<speakers.count{
                        if speakers[item].id == filteredSpeakers[row].id{
                            speakers[item].isSelected = !speakers[item].isSelected
                        }
                    }
                }
            }
        case .Organizers:
            if !isSearching{
                organizers[row].isSelected = !organizers[row].isSelected
            }else{
                if filteredOrganizers.count > row{
                    for item in 0..<organizers.count{
                        if organizers[item].id == filteredOrganizers[row].id{
                            organizers[item].isSelected = !organizers[item].isSelected
                        }
                    }
                }
            }
        default:
            print("other")
        }
        tableView.reloadData()
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(FilterItemCell.self, at: indexPath)
        cell.showAllStack.isHidden = true
        cell.imgRightArrow.isHidden = true
        cell.subView.tag = indexPath.section
        cell.subView.accessibilityHint = "\(indexPath.row)"
        cell.subView.addTap { r in
            let section = r.view?.tag ?? 0
            let row = Int(r.view?.accessibilityHint ?? "") ?? 0
            self.didTapItems(section: section, row: row)
        }
        cell.lineCons.constant = 0.0
        cell.lblTitle.isHidden = indexPath.row > 0
        switch searchType {
        case .Speakers:
            let speaker = isSearching ? filteredSpeakers[indexPath.row] : speakers[indexPath.row]
            cell.lblTitle.text = ""
            cell.lblSubtitle.text = "\(speaker.firstName ?? "") \(speaker.lastName ?? "")"
            cell.imgCheck.image = UIImage(named: speaker.isSelected ? "ic_check" : "ic_uncheck")
            let data = isSearching ? filteredSpeakers.count : speakers.count
            cell.lblLine.isHidden = true //indexPath.row + 1 != data
        case .Organizers:
            let organizer = isSearching ? filteredOrganizers[indexPath.row] : organizers[indexPath.row]
            cell.lblTitle.text = ""
            cell.lblSubtitle.text = organizer.organizationName
            cell.imgCheck.image = UIImage(named: organizer.isSelected ? "ic_check" : "ic_uncheck")
            let data = isSearching ? filteredOrganizers.count : organizers.count
            cell.lblLine.isHidden = true//indexPath.row + 1 != data
        default:
            break
        }
        
        return cell
    }
}
