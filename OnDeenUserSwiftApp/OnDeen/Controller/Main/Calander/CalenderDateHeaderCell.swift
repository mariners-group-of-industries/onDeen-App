//
//  CalenderDateHeaderCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//

import UIKit

class CalenderDateHeaderCell: UICollectionViewCell {
    @IBOutlet weak var lblTitle: UILabel!

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

}
extension Date {
    func isSameDay(as otherDate: Date) -> Bool {
        let calendar = Calendar.current
        return calendar.isDate(self, inSameDayAs: otherDate)
    }
    func isPreviousDate() -> Bool {
       let calendar = Calendar.current
       let today = calendar.startOfDay(for: Date()) // Get the start of the current day
       return self < today
   }
}
struct Event {
    let title: String
    let time: Date
    let description: String
}
