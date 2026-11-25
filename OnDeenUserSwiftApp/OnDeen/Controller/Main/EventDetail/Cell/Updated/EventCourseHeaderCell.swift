//
//  EventCourseHeaderCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 10/03/25.
//

import UIKit

enum CellType: String {
    case courseBreakdown
    case itineraries
    case termsOfUse
    case facilities
    case none
}
class EventCourseHeaderCell: UITableViewCell {
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    @IBOutlet weak var bgView: UIView!
    var cellType : CellType = .none
    weak var delegate: DynamicHeightCellDelegate? // Delegate reference
    var eventData = EventDetailResponse.init(fromDictionary: [String : Any]())

    override func awakeFromNib() {
        super.awakeFromNib()
        let nib = UINib(nibName: "EventCourseCell", bundle: nil)
           tableView.register(nib, forCellReuseIdentifier: "EventCourseCell")
           
           // Preload the nib to avoid race conditions
       DispatchQueue.main.async {
           _ = Bundle.main.loadNibNamed("EventCourseCell", owner: nil, options: nil)
       }
    }
    func config(data: EventDetailResponse,type:CellType) {
        DispatchQueue.main.async {
            self.eventData = data
            self.cellType = type
            if type == .courseBreakdown{
                self.lblHeaderTitle.text = "Course Breakdown"
            }else if type == .itineraries{
                self.lblHeaderTitle.text = "Itineraries"
            }else if type == .termsOfUse{
                self.lblHeaderTitle.text = "Terms of Use"
            }else if type == .facilities{
                self.lblHeaderTitle.text = "Facilities"
            }else{
                self.lblHeaderTitle.text = ""
            }
        }
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension EventCourseHeaderCell:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if self.cellType == .courseBreakdown{
            return eventData.curriculum.count
        }else if self.cellType == .itineraries{
            return 0//eventData.itineraries.count
        }else if self.cellType == .facilities{
            return 0//eventData.facilities.count
        }else if self.cellType == .termsOfUse{
            return 0//eventData.termsConditions.count
        }
        return 0
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if self.cellType == .courseBreakdown{
            let cell = tableView.dequeueReusableCell(withIdentifier: "EventCourseCell", for: indexPath) as! EventCourseCell
//            let cell = tableView.configureCell(EventCourseCell.self, at: indexPath)
            let data = eventData.curriculum[indexPath.row]
            cell.lblHeaderTitle.text = "Class".localized + " \(indexPath.row + 1)"
            cell.lblTitle.text = ""
            let startDate = "Start Date:".localized + " \(data.startDate.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "dd-MM-yyyy", timeZone: eventData.time_zone))"
            let endDate = "End Date:".localized + " \(data.endDate.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "dd-MM-yyyy", timeZone: eventData.time_zone))"
            let date = startDate + "   " + endDate
            
            let startTime = "Start Time:".localized + " \(data.startTime.convertTimeOnly(startDate: data.startDate, startTimeString: data.startTime, timeZone: eventData.time_zone)))"
            let endTime = "End Time:".localized + " \(data.startTime.convertTimeOnly(startDate: data.startDate, startTimeString: data.startTime, timeZone: eventData.time_zone)))"

//            let startTime = "Start Time:".localized + " \(data.startTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "hh:mm a", timeZone: data.time_zone))"
//            let endTime = "End Time:".localized + " \(data.endTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "hh:mm a", timeZone: data.time_zone))"
            let time = startTime + "   " + endTime
            cell.lblTitle2.text = date + "\n\n" + time
            cell.imgView.image = UIImage.init(named: "ic_education") ?? UIImage()
            return cell
        }else if self.cellType == .itineraries{
            let cell = tableView.configureCell(EventCourseCell.self, at: indexPath)
            let data = eventData.itineraries[indexPath.row]
            cell.lblHeaderTitle.text = "Day".localized + " \(data.day ?? 1)"
            cell.lblTitle.text = data.title
            let startTime = "Start Time:".localized + " \(data.startTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "hh:mm a", timeZone: data.time_zone))"
            let endTime = "End Time:".localized + " \(data.endTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "hh:mm a", timeZone: data.time_zone))"
            let time = startTime + "\n" + endTime
            cell.lblTitle2.text = time
            cell.imgView.image = UIImage.init(named: eventData.categoryId == 3 || eventData.categoryId == 4 || eventData.categoryId == 9 ? "ic_Itenary" : "ic_education") ?? UIImage()
            return cell
        }
        let cell = tableView.configureCell(EventBreakdownCell.self, at: indexPath)
        if self.cellType == .facilities{
            cell.lblTitle.text = "\(indexPath.row + 1). " + eventData.facilities[indexPath.row].facilitiesTitle
            cell.lblHeaderTitle.isHidden = true
            cell.lblSubtitle.isHidden = true
            cell.lblReadMore.isHidden = true
            return cell
        }
        let data = eventData.termsConditions[indexPath.row]
        let title = data["sub_title"] as? String ?? ""
        cell.lblHeaderTitle.text = ""
        cell.lblTitle.text = data["title"] as? String ?? ""
        cell.lblTitle.font = Fonts.SFProRegular(12.0)
        cell.lblTitle.textColor = UIColor.init(hex: "#3A3A3A")
        cell.lblSubtitle.text = ""
        DispatchQueue.global(qos: .userInitiated).async {
            let convertedText = title.htmlToAttributedString(customFont: Fonts.SFProMedium(12.0), color: UIColor(hex: "#3A3A3A"))
            DispatchQueue.main.async {
                if let visibleCell = tableView.cellForRow(at: indexPath) as? EventBreakdownCell {
                    visibleCell.lblSubtitle.attributedText = convertedText
                    tableView.beginUpdates()
                    tableView.endUpdates()
                }
            }
        }
        cell.lblSubtitle.numberOfLines = 0//lines
        return cell
    }
}
