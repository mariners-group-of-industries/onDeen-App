//
//  EventSuccessVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 23/12/24.
//

import UIKit
import EventKit

class EventSuccessVC: UIViewController {
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var downLoadticket: UIView!
    @IBOutlet weak var addAppleWallet: UIView!
    var eventInfo = [String:Any]()
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        if let response = eventInfo["response"] as? [String:Any]{
            print(JSON(response))
            self.eventDetailData = EventDetailResponse.init(fromDictionary: response)
        }
        backView.addTap { r in
            self.setRootController(board: .main, identifier: .homeVC)
        }
        downLoadticket.addTap { r in
            if let vc: EventDownloadVC = self.getController(from: .main) {
                vc.isFromSuccess = true
                vc.eventDetailData = self.eventDetailData
                self.presentVC(vc: vc,overFull:false)
            }
        }
        addAppleWallet.addTap { r in
            self.addEventToCalendarKit()
        }
    }
    func addEventToCalendarKit() {
        // Access the Event Store
        let eventStore = EKEventStore()
        
        switch EKEventStore.authorizationStatus(for: .event) {
        case .authorized:
            createEvent(eventStore: eventStore)
        case .denied, .restricted:
            Utils.showToast(message: "Calendar access denied. Please enable it in Settings.")
        case .notDetermined:
            eventStore.requestAccess(to: .event) { [weak self] granted, error in
                DispatchQueue.main.async {
                    if granted && error == nil {
                        self?.createEvent(eventStore: eventStore)
                    } else {
                        Utils.showToast(message: "Calendar access denied.")
                    }
                }
            }
        @unknown default:
            Utils.showToast(message: "Unknown calendar access status")
        }
    }
    func createEvent(eventStore: EKEventStore) {
        // Parse the main dates in backend timezone
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        if eventDetailData.time_zone.isEmpty{
            eventDetailData.time_zone = TimeZone.current.identifier
        }
        if eventDetailData.endDate.isEmpty{
            eventDetailData.endDate = eventDetailData.startDate
        }
        // Always use backend timezone for initial parsing
        guard let backendTZ = TimeZone(identifier: eventDetailData.time_zone) else {
            print("Invalid backend timezone: \(eventDetailData.time_zone ?? "")")
            return
        }
        dateFormatter.timeZone = backendTZ
        
        guard let startDateOnly = dateFormatter.date(from: eventDetailData.startDate),
              let endDateOnly = dateFormatter.date(from: eventDetailData.endDate) else {
            print("Failed to parse date components")
            return
        }
        
        // Parse time components
        guard let startTime = parseTimeComponents(eventDetailData.startTime),
              let endTime = parseTimeComponents(eventDetailData.endTime) else {
            print("Failed to parse time components")
            return
        }
        
        // Combine date and time in BACKEND timezone
        let calendar = Calendar.current
        
        var startComponents = calendar.dateComponents(in: backendTZ, from: startDateOnly)
        startComponents.hour = startTime.hour
        startComponents.minute = startTime.minute
        startComponents.second = startTime.second
        
        var endComponents = calendar.dateComponents(in: backendTZ, from: endDateOnly)
        endComponents.hour = endTime.hour
        endComponents.minute = endTime.minute
        endComponents.second = endTime.second
        
        guard let startDateInBackendTZ = calendar.date(from: startComponents),
              let endDateInBackendTZ = calendar.date(from: endComponents) else {
            print("Failed to combine date and time")
            return
        }
        
        // Convert from backend timezone to LOCAL device timezone
        let localTZ = TimeZone.current
        let startDateLocal = convertDate(startDateInBackendTZ, from: backendTZ, to: localTZ)
        let endDateLocal = convertDate(endDateInBackendTZ, from: backendTZ, to: localTZ)
        
        print("Backend timezone: \(backendTZ.identifier)")
        print("Device timezone: \(localTZ.identifier)")
        print("Original time (London): \(startDateInBackendTZ)")
        print("Converted time (Calcutta): \(startDateLocal)")
        
        var savedCount = 0

        // Convert backend string "0,1,2" to an array of Ints
        var selectedWeekdays = eventDetailData.occusr_weekday
            .split(separator: ",")
            .compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
        
        if selectedWeekdays.isEmpty {
            selectedWeekdays = [0, 1, 2, 3, 4, 5, 6]  // Default: All weekdays
        }
        
        var currentDate = startDateLocal
        let endDate = endDateLocal
        
        while currentDate <= endDate {
            let currentBackendWeekday = getBackendWeekday(from: currentDate)
            
            if selectedWeekdays.contains(currentBackendWeekday) {
                let event = EKEvent(eventStore: eventStore)
                event.title = eventDetailData.title
                event.startDate = currentDate
                
                // Calculate duration
                if let eventDuration = calculateEventDuration(startTime: startTime, endTime: endTime) {
                    event.endDate = currentDate.addingTimeInterval(eventDuration)
                } else {
                    let durationHours = Int(eventDetailData.duration) ?? 1
                    event.endDate = calendar.date(byAdding: .hour, value: durationHours, to: currentDate)
                }
                
                event.calendar = eventStore.defaultCalendarForNewEvents
                event.notes = eventDetailData.location
                event.location = eventDetailData.location
                
                do {
                    try eventStore.save(event, span: .thisEvent)
                    savedCount += 1
                    print("Saved event at local time: \(currentDate)")
                } catch {
                    print("Error saving event: \(error.localizedDescription)")
                }
            }
            
            guard let nextDate = calendar.date(byAdding: .day, value: 1, to: currentDate) else {
                break
            }
            currentDate = nextDate
        }
        
        if savedCount > 0 {
            Utils.showToast(message: "Event saved to your calendar")
        }
    }
    private func parseTimeComponents(_ timeString: String) -> (hour: Int, minute: Int, second: Int)? {
        let components = timeString.split(separator: ":").compactMap { Int($0) }
        
        guard components.count >= 2 else {
            return nil
        }
        
        let hour = components[0]
        let minute = components[1]
        let second = components.count > 2 ? components[2] : 0
        
        guard hour >= 0 && hour <= 23,
              minute >= 0 && minute <= 59,
              second >= 0 && second <= 59 else {
            return nil
        }
        
        return (hour, minute, second)
    }
    // Helper function to convert between timezones
    private func convertDate(_ date: Date, from sourceTimeZone: TimeZone, to targetTimeZone: TimeZone) -> Date {
        let sourceOffset = sourceTimeZone.secondsFromGMT(for: date)
        let targetOffset = targetTimeZone.secondsFromGMT(for: date)
        let timeDifference = TimeInterval(targetOffset - sourceOffset)
        return date.addingTimeInterval(timeDifference)
    }
    private func getBackendWeekday(from date: Date) -> Int {
        let calendar = Calendar.current
        let calendarWeekday = calendar.component(.weekday, from: date) // Sunday=1, Monday=2, etc.
        
        // Adjust to match backend format: Sunday=6, Monday=0, etc.
        let backendWeekday = (calendarWeekday - 2 + 7) % 7 // Map: Sunday (1) -> 6, Monday (2) -> 0, etc.
        return backendWeekday
    }
    // Helper function to calculate event duration in seconds
    private func calculateEventDuration(startTime: (hour: Int, minute: Int, second: Int),
                                       endTime: (hour: Int, minute: Int, second: Int)) -> TimeInterval? {
        let startTotalSeconds = startTime.hour * 3600 + startTime.minute * 60 + startTime.second
        let endTotalSeconds = endTime.hour * 3600 + endTime.minute * 60 + endTime.second
        
        if endTotalSeconds < startTotalSeconds {
            return TimeInterval((24 * 3600) - startTotalSeconds + endTotalSeconds)
        }
        
        return TimeInterval(endTotalSeconds - startTotalSeconds)
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        addAppleWallet.config(isRoundCorner: true)
    }
}
