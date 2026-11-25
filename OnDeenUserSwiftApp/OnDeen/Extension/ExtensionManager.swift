//
//  ExtensionManager.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//

import UIKit

extension UIColor {
    convenience init(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        
        var rgb: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&rgb)
        
        let red = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
        let green = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
        let blue = CGFloat(rgb & 0x0000FF) / 255.0
        
        self.init(red: red, green: green, blue: blue, alpha: 1.0)
    }
}
extension String{
    func toDouble() -> Double
    {
        if let num = NumberFormatter().number(from: self) {
            return num.doubleValue
        } else {
            return NSString(string: self).doubleValue
        }
    }
    func checkVariable(value:Any) -> String{
        if self.isEmpty{
            if let getVal = value as? Int{
                return "\(getVal)"
            }else if let getVal = value as? Double{
                return "\(getVal)"
            }else if let getVal = value as? Float{
                return "\(getVal)"
            }
        }
        return self
    }
    func toServerDate() -> Date? {
        let dateFormatter = DateFormatter()
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        if let date = dateFormatter.date(from: self) {
            return date
        } else {
            dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
            if let date = dateFormatter.date(from: self) {
                return date
            } else {
                dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
                dateFormatter.timeZone = TimeZone(abbreviation: "GMT")
                return dateFormatter.date(from: self)
            }
        }
    }
        
    func getTimeZone() -> TimeZone{
        var eventTimeZone = TimeZone(secondsFromGMT: 0)
        if !self.isEmpty{
            if let timeZone = TimeZone(identifier: self) {
                eventTimeZone = timeZone
            }
        }
        return eventTimeZone ?? TimeZone(secondsFromGMT: 0)!
    }
    func convertServerDateFormat1(toFormat:String,timeZone:String) -> String{
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        dateFormatter.timeZone = timeZone.getTimeZone() // Ensure correct time zone
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Use a reliable locale

        if let date = dateFormatter.date(from: self) {
            dateFormatter.timeZone = TimeZone.current // Use device's current timezone
            dateFormatter.dateFormat = toFormat
            let formattedDate = dateFormatter.string(from: date)
            return formattedDate
        }else{
            dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
            if let date = dateFormatter.date(from: self) {
                dateFormatter.dateFormat = toFormat
                dateFormatter.timeZone = TimeZone.current // Use device's current timezone
                let formattedDate = dateFormatter.string(from: date)
                return formattedDate
            }else{
                //"start_date":"Thu, 13 Feb 2025 00:00:00 GMT",
                dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
                dateFormatter.locale = Locale(identifier: "en_US_POSIX")
                dateFormatter.timeZone = TimeZone.current // Use device's current timezone
                if let date = dateFormatter.date(from: self) {
                    dateFormatter.dateFormat = toFormat
                    let formattedDate = dateFormatter.string(from: date)
                    return formattedDate
                }
            }
        }
        return self
    }
    func removingMidnightTime() -> String {
        if self.hasSuffix("T00:00:00") {
            return self.replacingOccurrences(of: "T00:00:00", with: "")
        }
        return self
    }
    func convertServerDateFormat(toFormat: String, timeZone: String) -> String {
        let selectedDateTime = self.removingMidnightTime()
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")

        // 1. Try full date-time format
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        dateFormatter.timeZone = TimeZone(identifier: timeZone) ?? TimeZone(abbreviation: "UTC")
        if let date = dateFormatter.date(from: selectedDateTime) {
            dateFormatter.timeZone = TimeZone.current
            dateFormatter.dateFormat = toFormat
            return dateFormatter.string(from: date)
        }

        // 2. Try space-based date-time fallback
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        if let date = dateFormatter.date(from: selectedDateTime) {
            dateFormatter.timeZone = TimeZone.current
            dateFormatter.dateFormat = toFormat
            return dateFormatter.string(from: date)
        }

        // 3. Try RFC-style fallback
        dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        if let date = dateFormatter.date(from: selectedDateTime) {
            dateFormatter.timeZone = TimeZone.current
            dateFormatter.dateFormat = toFormat
            return dateFormatter.string(from: date)
        }

        // ✅ 4. Handle date-only strings like "2025-06-30"
        dateFormatter.dateFormat = "yyyy-MM-dd"
        dateFormatter.timeZone = TimeZone.current  // ⬅️ parse as local date, not UTC
        if let date = dateFormatter.date(from: selectedDateTime) {
            dateFormatter.dateFormat = toFormat
            return dateFormatter.string(from: date)
        }
        return self
    }
    
    func toDate(from format: String, timeZoneID: String) -> Date? {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        dateFormatter.dateFormat = format
        dateFormatter.timeZone = TimeZone(identifier: timeZoneID) // London

        // Parse the date in source timezone
        if let sourceDate = dateFormatter.date(from: self) {
            // Convert to device timezone by just returning the Date object
            // (Date stores UTC internally, so when you display it with device TZ, it adjusts automatically)
            return sourceDate
        }
        return nil
    }
    func utcStringToDeviceDate(format: String = "yyyy-MM-dd HH:mm:ss") -> Date? {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = format
        formatter.timeZone = TimeZone(abbreviation: "UTC") // incoming string is UTC
        
        return formatter.date(from: self) // Date stores in UTC internally
    }
    func utcToDeviceTime(_ utcString: String, format: String = "yyyy-MM-dd HH:mm:ss") -> String? {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = format
        formatter.timeZone = TimeZone(abbreviation: "UTC") // incoming string is UTC
        
        guard let utcDate = formatter.date(from: utcString) else { return nil }
        
        // Now format for device timezone
        formatter.timeZone = TimeZone.current
        return formatter.string(from: utcDate)
    }

    func convertServerDateFormatListing(toFormat:String,timeZone:String) -> String{
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        dateFormatter.timeZone = timeZone.getTimeZone() // Ensure correct time zone
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Use a reliable locale

        if let date = dateFormatter.date(from: self) {
            dateFormatter.dateFormat = toFormat
            dateFormatter.timeZone = TimeZone.current // Use device's current timezone
            let formattedDate = dateFormatter.string(from: date)
            return formattedDate
        }else{
            dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
            if let date = dateFormatter.date(from: self) {
                dateFormatter.dateFormat = toFormat
                dateFormatter.timeZone = TimeZone.current // Use device's current timezone
                let formattedDate = dateFormatter.string(from: date)
                return formattedDate
            }else{
                //"start_date":"Thu, 13 Feb 2025 00:00:00 GMT",
                dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
                dateFormatter.locale = Locale(identifier: "en_US_POSIX")
                dateFormatter.timeZone = TimeZone.current // Use device's current timezone
                if let date = dateFormatter.date(from: self) {
                    dateFormatter.dateFormat = toFormat
                    let formattedDate = dateFormatter.string(from: date)
                    return formattedDate
                }
            }
        }
        return self
    }
    func convertDateTime1(startDateString:String,startTimeString:String,timeZone:String) -> String{
        // Combine the date and time strings
        let combinedDateTimeString = "\(startDateString) \(startTimeString)"
        let dateFormatter = DateFormatter()

        // Input format for the combined date and time
        // Thu, 30 Jan 2025 12:46:48 GMT
        dateFormatter.dateFormat = "E, dd MMM yyyy HH:mm:ss z HH:mm:ss"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Consistent parsing
        dateFormatter.timeZone = timeZone.getTimeZone() // Match GMT timezone

        if let date = dateFormatter.date(from: combinedDateTimeString) {
            // Output format
            dateFormatter.timeZone = TimeZone.current // Use device's current timezone
            dateFormatter.dateFormat = "E, hh:mm a" // Short day name and 12-hour time
            return dateFormatter.string(from: date)
        } else {
            return self
        }
    }
    func convertDateTime(startDateString: String, startTimeString: String, timeZone: String) -> String {
        // Combine the date and time strings properly
        let combinedDateTimeString = "\(startDateString.dropLast(4))\(startTimeString)" // Removes " GMT"
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E, dd MMM yyyyHH:mm:ss"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        
        // Set source timezone (e.g., GMT+5:30)
        dateFormatter.timeZone = TimeZone(identifier: timeZone)
        
        if let date = dateFormatter.date(from: combinedDateTimeString) {
            // Output format and device's timezone (e.g., GMT+1)
            dateFormatter.timeZone = TimeZone.current
            dateFormatter.dateFormat = "E, hh:mm a"
            return dateFormatter.string(from: date)
        } else {
            return "Invalid date"
        }
    }
    func extractWeekday() -> String {
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        inputFormatter.locale = Locale(identifier: "en_US_POSIX")
        inputFormatter.timeZone = TimeZone(secondsFromGMT: 0)
        
        guard let date = inputFormatter.date(from: self) else { return "" }
        
        let calendar = Calendar.current
        let weekday = calendar.component(.weekday, from: date)
        let weekdays = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return weekdays[weekday]
    }
    func convertTimeOnly(startDate:String,startTimeString: String, timeZone: String,isDayNameRequired:Bool = false) -> String {
        var dayName = ""
        let selectedDateTime = startDate.removingMidnightTime()
        let dateFormatter1 = DateFormatter()
        dateFormatter1.locale = Locale(identifier: "en_US_POSIX")

        // 1. Try full date-time format
        dateFormatter1.dateFormat = "yyyy-MM-dd"
        dateFormatter1.timeZone = timeZone.getTimeZone()
        if let date = dateFormatter1.date(from: selectedDateTime) {
            dateFormatter1.timeZone = TimeZone.current
            dateFormatter1.dateFormat = "E"
            dayName = dateFormatter1.string(from: date)
        } else {
            // 2. Try fallback format: "EEE, dd MMM yyyy HH:mm:ss zzz"
            dateFormatter1.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
            if let date = dateFormatter1.date(from: selectedDateTime) {
                dateFormatter1.timeZone = TimeZone.current
                dateFormatter1.dateFormat = "E"
                dayName = dateFormatter1.string(from: date)
            }
        }
        if dayName.isEmpty{
            dayName = startDate.extractWeekday()
        }
        // Combine with today’s date to get accurate timezone (especially for DST)
        let today = Date()
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month, .day], from: today)
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")

        guard let year = components.year,
              let month = components.month,
              let day = components.day else {
            return startTimeString
        }

        let fullDateTimeString = String(format: "%04d-%02d-%02d %@", year, month, day, self)
        
        // Parse as time in given timezone
        dateFormatter.timeZone = TimeZone(identifier: timeZone)
        if let date = dateFormatter.date(from: fullDateTimeString) {
            // Convert to current timezone (e.g. London)
            dateFormatter.timeZone = TimeZone.current
            dateFormatter.dateFormat = "hh:mm a"
            if !isDayNameRequired{
                return "\(dateFormatter.string(from: date))"
            }
            return "\(dayName), \(dateFormatter.string(from: date))"
        } else {
            return startTimeString
        }
    }
    func convertDateTime(startDateString2:String,startTimeString2:String,timeZone:String) -> String{
        // Combine the date and time strings
        let combinedDateTimeString = "\(startDateString2) \(startTimeString2)"
        let dateFormatter = DateFormatter()

        // Input format for the combined date and time
        // Thu, 30 Jan 2025 12:46:48 GMT
        dateFormatter.dateFormat = "E, dd MMM yyyy HH:mm:ss z HH:mm:ss"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Consistent parsing
        dateFormatter.timeZone = timeZone.getTimeZone() // Match GMT timezone

        if let date = dateFormatter.date(from: combinedDateTimeString) {
            // Output format
            dateFormatter.timeZone = TimeZone.current // Use device's current timezone
            dateFormatter.dateFormat = "hh:mm a" // Short day name and 12-hour time
            return dateFormatter.string(from: date)
        } else {
            return self
        }
    }
    func convertFromDateFormat(fromFormat:String,toFormat:String,timeZone:String) -> String{
        if toFormat == "h:m a"{
            let timeParts = self.split(separator: ":").map { Int($0) }
            guard timeParts.count == 3,
                  let hour = timeParts[0],
                  let minute = timeParts[1],
                  let second = timeParts[2] else {
                return self
            }

            // Get today's date
            let today = Date()
            let calendar = Calendar(identifier: .gregorian)
            let dateComponents = calendar.dateComponents([.year, .month, .day], from: today)

            // Combine today's date with given time (in GMT)
            var fullDateComponents = DateComponents()
            fullDateComponents.year = dateComponents.year
            fullDateComponents.month = dateComponents.month
            fullDateComponents.day = dateComponents.day
            fullDateComponents.hour = hour
            fullDateComponents.minute = minute
            fullDateComponents.second = second
            fullDateComponents.timeZone = timeZone.getTimeZone() // Input is in GMT

            let gmtCalendar = Calendar(identifier: .gregorian)
            guard let date = gmtCalendar.date(from: fullDateComponents) else {
                return self
            }

            // Convert to desired time zone (e.g., Europe/London)
            let formatter = DateFormatter()
            formatter.timeZone = TimeZone.current
            formatter.locale = Locale(identifier: "en_US_POSIX")

            // Smart formatting
            let adjustedMinute = calendar.dateComponents(in: TimeZone.current, from: date).minute ?? 0
            formatter.dateFormat = adjustedMinute == 0 ? "h a" : "h:mm a"

            return formatter.string(from: date).lowercased()
        }
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = fromFormat
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        dateFormatter.timeZone = timeZone.getTimeZone() // Backend timezone (e.g., Asia/Calcutta)

        if let date = dateFormatter.date(from: self) {
            let calendar = Calendar.current
            let components = calendar.dateComponents([.day, .month, .year], from: date)
            
            // Reconstruct the date in UTC (no timezone shifts)
            if let reconstructedDate = calendar.date(from: components) {
                dateFormatter.dateFormat = toFormat
                dateFormatter.timeZone = TimeZone.current // Force UTC to prevent day shift
                return dateFormatter.string(from: reconstructedDate)
            }
        }
        return self
    }
    func convertServerDateToDiffFormat() -> String{
        let dateFormatter = DateFormatter()

        // Input format
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        if let date = dateFormatter.date(from: self) {
            let calendar = Calendar.current
            let day = calendar.component(.day, from: date)
            
            // Get the ordinal suffix
            var suffix = "th".localized
            if (day % 10 == 1 && day % 100 != 11) {
                suffix = "st".localized
            } else if (day % 10 == 2 && day % 100 != 12) {
                suffix = "nd".localized
            } else if (day % 10 == 3 && day % 100 != 13) {
                suffix = "rd".localized
            }
            // Output format
            dateFormatter.dateFormat = "MMM"
            dateFormatter.timeZone = TimeZone.current // Use device's current timezone
            let month = dateFormatter.string(from: date)
            
            let formattedDate = "\(day)\(suffix) \(month)"
            return formattedDate
        }
        return self
    }
}
extension UIStackView {
    func addBadge(count: Int, onTap: (() -> Void)? = nil) {
        // Remove old badge if it exists
        self.subviews.forEach {
            if $0.tag == 999 { $0.removeFromSuperview() }
        }

        // Create badge label
        let badgeLabel = UILabel()
        badgeLabel.tag = 999
        badgeLabel.text = "\(count)"
        badgeLabel.textColor = .white
        badgeLabel.backgroundColor = .red
        badgeLabel.font = UIFont.systemFont(ofSize: 12, weight: .bold)
        badgeLabel.textAlignment = .center
        badgeLabel.clipsToBounds = true

        // Calculate width based on content
        let padding: CGFloat = 8
        let height: CGFloat = 20
        let badgeTextWidth = badgeLabel.intrinsicContentSize.width + padding

        badgeLabel.frame = CGRect(
            x: self.frame.width - badgeTextWidth / 2,
            y: -height / 2,
            width: badgeTextWidth,
            height: height
        )

        badgeLabel.layer.cornerRadius = height / 2
        badgeLabel.isUserInteractionEnabled = true

        badgeLabel.addTap { r in
            onTap?()
        }
        // Add to stack
        self.addSubview(badgeLabel)
    }
}
