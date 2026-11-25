//
//  DateListResponse.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 28/01/25.
//


class DateListResponse  {
    var selected : Bool = false
    var date: Date = Date()
    var dateTitle: String = ""
    var dayTitle: String = ""
    var id: Int = 0
    
    init(selected: Bool,date : Date, dateTitle: String, dayTitle: String, id: Int) {
        self.selected = selected
        self.date = date
        self.dateTitle = dateTitle
        self.dayTitle = dayTitle
        self.id = id
    }
}
