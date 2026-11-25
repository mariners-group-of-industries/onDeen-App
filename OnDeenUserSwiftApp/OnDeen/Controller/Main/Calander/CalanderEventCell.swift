//
//  CalanderEventCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//

import UIKit

class CalanderEventCell: UICollectionViewCell {
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    var events = [HomePageEvent]()
    var eventTapped : ((Int) -> Void)?
    var colors = [UIColor.init(hex: "#DB3171"),UIColor.init(hex: "#FFE493"),UIColor.init(hex: "#5F39C5"),UIColor.init(hex: "#FFF9E6"),UIColor.init(hex: "#F6EDFF"),UIColor.init(hex: "#C8F9AA"),UIColor.init(hex: "#EDEDED"),UIColor.init(hex: "#DD89F5"),UIColor.init(hex: "#FFD5E3")]
    override func awakeFromNib() {
        super.awakeFromNib()
        tableView.registerNIBs(CalanderListItemCell.self,CalanderNoEventCell.self)
        
        // Initialization code
    }
    func config(event:[HomePageEvent]){
        events = event
        tableView.refreshTable()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        tableHeight.constant = tableView.contentSize.height
        // Notify the collection view to update its layout
        if let collectionView = self.superview as? UICollectionView {
            collectionView.collectionViewLayout.invalidateLayout()
        }
    }
}
extension CalanderEventCell:UITableViewDataSource,UITableViewDelegate{
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return events.count == 0 ? 1 : events.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if events.count == 0 {
            let cell = tableView.configureCell(CalanderNoEventCell.self, at: indexPath)
            return cell
        }
        let cell = tableView.configureCell(CalanderListItemCell.self, at: indexPath)
        if events.count > indexPath.row{
            cell.lblTitle.text = events[indexPath.row].title
//            cell.lblTume.text = events[indexPath.row].startTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: "hh:mm a", timeZone: events[indexPath.row].time_zone)
            cell.lblTume.text = events[indexPath.row].startTime.convertTimeOnly(startDate: events[indexPath.row].startDate, startTimeString: events[indexPath.row].startTime, timeZone: events[indexPath.row].time_zone)
            cell.lblHighlight.backgroundColor = colors.randomElement()
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        eventTapped?(indexPath.row)
    }
}
