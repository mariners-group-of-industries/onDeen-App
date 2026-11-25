//
//  DateHelper.swift
//  OnDeen
//
//  Created by Thabu MacbookPRO on 06/05/25.
//

import Foundation

class DateHelper{
    func convertUTCToLocal(utcTime: String) -> String? {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // 🔥 Always set this for fixed format parsing
        dateFormatter.dateFormat = "dd-MM-yyyy HH:mm:ss"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
        
        if let date = dateFormatter.date(from: utcTime) {
            dateFormatter.timeZone = TimeZone.current // Local timezone
            dateFormatter.dateFormat = "dd-MM-yyyy hh:mm a"
            return dateFormatter.string(from: date)
        }
        return nil
    }
    func convertTime(from inputDateString: String) -> String{
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "dd-MM-yyyy HH:mm:ss"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Always good for fixed formats
        
        // Convert string to Date
        if let date = dateFormatter.date(from: inputDateString) {
            dateFormatter.dateFormat = "dd-MM-yyyy hh:mm a"
            // Convert back to string (could be the same format or a different one)
            let outputDateString = dateFormatter.string(from: date)
            return outputDateString
        } else {
            // Invalid input format
            return ""
        }
    }
    // New function to get difference in minutes
        func differenceInMinutes(from dateStr1: String, to dateStr2: String) -> Int? {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "dd-MM-yyyy hh:mm a"
            dateFormatter.locale = Locale(identifier: "en_US_POSIX")
            
            guard let date1 = dateFormatter.date(from: dateStr1),
                  let date2 = dateFormatter.date(from: dateStr2) else {
                return nil
            }
            
            let difference = date2.timeIntervalSince(date1) // in seconds
            return Int(difference / 60) // convert to minutes
        }
}
