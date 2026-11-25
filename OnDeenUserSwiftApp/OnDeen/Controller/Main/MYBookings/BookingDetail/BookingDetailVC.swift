//
//  BookingDetailVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//
enum ServerTimeStatus {
    case lessThan15Minutes
    case within15Minutes
    case within30Minutes
    case exceeded30Minutes
    case eventInFuture(String) // 💬 label: "Event starts at 03:57 PM"
    case normal
}

import UIKit
import ImageSlideshow
import Lightbox
import IQKeyboardManagerSwift
import EventKit

class BookingDetailVC: UIViewController,DynamicHeightCellDelegate {
    @IBOutlet weak var addEventToCalendar: UIImageView!
    var countdownTimer: Timer?
    var targetDate: Date?
    var timeRemaining: TimeInterval = 0
    
    @IBOutlet weak var footerInfo: UIImageView!
    @IBOutlet weak var lblTimer: SFProLabel!
    @IBOutlet weak var imgSendReply: UIImageView!
    @IBOutlet weak var fieldReply: UITextField!
    @IBOutlet weak var replyView: UIView!
    @IBOutlet weak var lblQA: SFProLabel!
    @IBOutlet weak var detailInfoHeight: NSLayoutConstraint!
    @IBOutlet weak var otherInfoHeight: NSLayoutConstraint!

    @IBOutlet weak var imgMore: UIImageView!
    @IBOutlet weak var scrollView: UIScrollView!
    @IBOutlet weak var detailInfoVC: UIView!
    @IBOutlet weak var detailOtherVC: UIView!
    @IBOutlet weak var detailView: UIView!

    func updateTableView() {
        DispatchQueue.main.async {
            self.tableView.beginUpdates()
            self.tableView.endUpdates()
        }
    }
    @IBOutlet weak var backTitle: SFProLabel!
    var isImageAppearing = false
    var isCompletedBooking = false
    @IBOutlet weak var tableBgView: UIView!
    @IBOutlet weak var imgAddQuestion: UIImageView!
    @IBOutlet weak var footerView: UIView!
    @IBOutlet weak var swipeView: SwipeButtonView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var lblEventDetail: SFProLabel!
    @IBOutlet weak var lblEventMaterial: SFProLabel!
    @IBOutlet weak var tabView: UIView!
    var tabType = 1 {
        didSet{
            self.detailView.isHidden = self.tabType != 1
            self.tableView.isHidden = self.tabType == 1
            self.configuTab()
            self.tableView.refreshTable()
        }
    }
    var eventData = HomePageEvent.init(fromDictionary: [String : Any]())
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]()){
        didSet{
            self.imgMore.isHidden = self.isCompletedBooking == true ? true : self.eventDetailData.status != 1
        }
    }
    var eventQuestions = [EventQuestionsResponse](){
        didSet{
            self.tableView.reloadData()
        }
    }
    var isQATabSelected = false
   
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        IQKeyboardManager.shared.isEnabled = true
        NotificationCenter.default.removeObserver(self, name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.removeObserver(self, name: UIResponder.keyboardWillHideNotification, object: nil)
    }
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillShow), name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillHide), name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    @objc func keyboardWillShow(notification: NSNotification) {
        if let topVC = topViewController(), topVC == self {
            if let keyboardFrame = (notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue {
                UIView.animate(withDuration: 0.3) {
                    if let sup = self.replyView.superview {
                        // Reset before applying new transform
                        sup.transform = .identity
                        sup.transform = CGAffineTransform(translationX: 0, y: -keyboardFrame.height)
                    }
                }
            }
        }
    }

    @objc func keyboardWillHide(notification: NSNotification) {
        if let topVC = topViewController(){
            if topVC == self{
                UIView.animate(withDuration: 0.3) {
                    if let sup = self.replyView.superview{
                        sup.transform = .identity
                    }
                }
            }
        }
    }

    override func viewDidAppear(_ animated: Bool) {
        if isImageAppearing{
            isImageAppearing = false
            return
        }
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        notificationType = ""
        notificationID = 0

        IQKeyboardManager.shared.isEnabled = false

        fieldReply.delegate = self

        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        self.eventDetailData = EventDetailResponse.init(fromDictionary: eventData.toDictionary())
        tableView.register(UINib(nibName: "EventDetailOtherCell", bundle: nil), forCellReuseIdentifier: "EventDetailOtherCell")
        tableView.registerNIBs(EventDetailCell.self,BookingMaterialNotesCell.self,BookingMaterialHeaderCell.self,BookingMaterialCell.self,BookingQuestionsCell.self)
        backView.addTap { r in
            self.popVC()
        }
        imgAddQuestion.addTap { r in
            if let vc: MaterialQuestionVC = self.getController(from: .main) {
                vc.eventDetailData = self.eventDetailData
                vc.isFromNote = true
                vc.noteTapped = { data in
                    self.triggerEvents()
                }
                self.presentVC(vc: vc)
            }
        }
        imgMore.addTap { r in
            ActionSheetHelper.presentCancelBookingSheet(type: .cancelBooking, from: self) {
                delay(0.2) {
                    self.showCancelBooking()
                }
            }
        }
        swipeView.handleAction { (isFinished) in
            print("isFinished: \(isFinished)")
            if isFinished{
                self.triggerCheckinEvent()
                self.swipeView.updateHintLabel(text: "")
            }
        }
        lblEventDetail.addTap { r in
            self.tabType = 1
            self.tableView.reloadData()
            delay(0.5) {
                self.tableView.reloadData()
            }
        }
        lblEventMaterial.addTap { r in
            self.tabType = 2
            self.tableView.reloadData()
            delay(0.5) {
                self.tableView.reloadData()
            }
        }
        addEventToCalendar.addTap { r in
            self.addEventToCalendarKit()
        }
        lblQA.addTap { r in
            self.tabType = 3
            self.tableView.reloadData()
            delay(0.5) {
                self.tableView.reloadData()
            }
        }
        imgSendReply.addTap { r in
            self.triggerAddQuestion()
        }
        mainThread { [self] in
            backTitle.text = "Event Details"
        }
        footerInfo.addTap { r in
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            let vc = storyboard.instantiateViewController(withIdentifier: "PopupControllerViewController") as! PopupControllerViewController
            vc.textInfo = self.eventDetailData.swipe_text_info
            vc.modalPresentationStyle = .popover
            if let popover = vc.popoverPresentationController {
               popover.permittedArrowDirections = .any
               popover.delegate = self
                if let sourceView = r.view as? UIImageView {
                   popover.sourceView = sourceView
                   popover.sourceRect = sourceView.bounds
               }
           }
            self.present(vc, animated: true, completion: nil)
        }
        self.tableView.isHidden = true
        self.tableBgView.backgroundColor = UIColor.white
//        delay(0.5) {
            self.triggerEvents(isFreshLoad: true)
//        }
    }
    func showCancelBooking(){
        self.showYesnoAlertWithClosure(title: "Are you sure you want to cancel?", type: 0, vc: self) { status in
            if status{
                self.triggerCancelBooking()
            }
        }
    }
    func triggerCancelBooking(confirm:Int = 0){
        EventRequest.instance.triggerCancelEvent(id: self.eventDetailData.id ?? 0,confirm: confirm) { data, status in
            if data.status{
                if data.confirm == 1 && confirm == 0{
                    self.showCancelConfirmAlert(modal: data)
                    return
                }
                self.triggerEvents()
            }
            Utils.showToast(message: data.message)
        }
    }
    func showCancelConfirmAlert(modal:CommonResponse){
        self.showYesnoAlertWithClosure(title: modal.message, type: 0, vc: self) { status in
            if status{
                self.triggerCancelBooking(confirm: 1)
            }
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
    func createEvent1(eventStore: EKEventStore) {
        // Parse GMT times
        let gmtFormatter = DateFormatter()
        gmtFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz HH:mm:ss"
        if let backendTZ = TimeZone(identifier: eventDetailData.time_zone) {
            if backendTZ.secondsFromGMT() == TimeZone.current.secondsFromGMT() &&
               backendTZ.isDaylightSavingTime(for: Date()) == TimeZone.current.isDaylightSavingTime(for: Date()) {
                // Effectively the same zone
                gmtFormatter.timeZone = TimeZone(secondsFromGMT: 0)
            } else {
                // Different zone
                gmtFormatter.timeZone = backendTZ
            }
        }
        let dateTime = eventDetailData.startDate + " " + eventDetailData.startTime
        let endDateTime = eventDetailData.endDate + " " + eventDetailData.endTime
        
        guard let gmtStartDate = gmtFormatter.date(from: dateTime),
              let gmtEndDate = gmtFormatter.date(from: endDateTime) else {
            print("Failed to parse dates")
            return
        }
        var savedCount = 0

        // Convert backend string "0,1,2" to an array of Ints
        var selectedWeekdays = eventDetailData.occusr_weekday
            .split(separator: ",")
            .compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
        if selectedWeekdays.count == 0{
            selectedWeekdays = [0,1,2,3,4,5,6]
        }
        var currentDate = gmtStartDate
        let calendar = Calendar(identifier: .gregorian)
        
        while currentDate <= gmtEndDate {
            let weekday = calendar.component(.weekday, from: currentDate) - 1 // Make Sunday=0
            
            if selectedWeekdays.contains(weekday) {
                let event = EKEvent(eventStore: eventStore)
                event.title = eventDetailData.title
                event.startDate = currentDate
                event.endDate = currentDate.addingTimeInterval(60 * 60) // 1 hr
                event.calendar = eventStore.defaultCalendarForNewEvents
                event.notes = eventDetailData.location
                
                do {
                    try eventStore.save(event, span: .thisEvent)
                    savedCount += 1
                    print("Saved event for weekday \(weekday) at \(currentDate)")
                } catch {
                    print("Error saving event: \(error.localizedDescription)")
                }
            }
            
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate)!
            
            if savedCount > 0 {
               Utils.showToast(message: "Event saved successfully")
           }
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
        // Always use backend timezone for initial parsing
        guard let backendTZ = TimeZone(identifier: eventDetailData.time_zone) else {
            print("Invalid backend timezone: \(eventDetailData.time_zone)")
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

    // Helper function to convert between timezones
    private func convertDate(_ date: Date, from sourceTimeZone: TimeZone, to targetTimeZone: TimeZone) -> Date {
        let sourceOffset = sourceTimeZone.secondsFromGMT(for: date)
        let targetOffset = targetTimeZone.secondsFromGMT(for: date)
        let timeDifference = TimeInterval(targetOffset - sourceOffset)
        return date.addingTimeInterval(timeDifference)
    }

    // Helper function to parse HH:mm:ss components
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

    // Helper function to get backend weekday format (Sunday=0, Monday=1, etc.)
    private func getBackendWeekday(from date: Date) -> Int {
        let calendar = Calendar.current
        let calendarWeekday = calendar.component(.weekday, from: date) // Sunday=1, Monday=2, etc.
        
        // Adjust to match backend format: Sunday=6, Monday=0, etc.
        let backendWeekday = (calendarWeekday - 2 + 7) % 7 // Map: Sunday (1) -> 6, Monday (2) -> 0, etc.
        return backendWeekday
    }


    /*
    func createEvent(eventStore: EKEventStore) {
        // Parse the main dates in backend timezone
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")
        
        // Always use backend timezone for initial parsing
        guard let backendTZ = TimeZone(identifier: eventDetailData.time_zone) else {
            print("Invalid backend timezone: \(eventDetailData.time_zone)")
            Utils.showToast(message: "Invalid timezone configuration")
            return
        }
        dateFormatter.timeZone = backendTZ
        
        guard let startDateOnly = dateFormatter.date(from: eventDetailData.startDate),
              let endDateOnly = dateFormatter.date(from: eventDetailData.endDate) else {
            print("Failed to parse date components")
            Utils.showToast(message: "Failed to parse event dates")
            return
        }
        
        // Parse time components
        guard let startTime = parseTimeComponents(eventDetailData.startTime),
              let endTime = parseTimeComponents(eventDetailData.endTime) else {
            print("Failed to parse time components")
            Utils.showToast(message: "Failed to parse event times")
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
            Utils.showToast(message: "Failed to create event schedule")
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
            selectedWeekdays = [0, 1, 2, 3, 4, 5, 6]
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
                
                // Add alarm 15 minutes before event
                let alarm = EKAlarm(relativeOffset: -15 * 60)
                event.addAlarm(alarm)
                
                do {
                    try eventStore.save(event, span: .thisEvent)
                    savedCount += 1
                    print("Saved event at local time: \(currentDate)")
                } catch {
                    print("Error saving event: \(error.localizedDescription)")
                    Utils.showToast(message: "Error saving event: \(error.localizedDescription)")
                }
            }
            
            guard let nextDate = calendar.date(byAdding: .day, value: 1, to: currentDate) else {
                break
            }
            currentDate = nextDate
        }
        
        if savedCount > 0 {
            Utils.showToast(message: "\(savedCount) event(s) saved to calendar in your local time")
        } else {
            Utils.showToast(message: "No events were saved")
        }
    }

    // Helper function to convert between timezones
    private func convertDate(_ date: Date, from sourceTimeZone: TimeZone, to targetTimeZone: TimeZone) -> Date {
        let sourceOffset = sourceTimeZone.secondsFromGMT(for: date)
        let targetOffset = targetTimeZone.secondsFromGMT(for: date)
        let timeDifference = TimeInterval(targetOffset - sourceOffset)
        return date.addingTimeInterval(timeDifference)
    }

    // Helper function to parse HH:mm:ss components
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

    // Helper function to get backend weekday format (Sunday=0, Monday=1, etc.)
    private func getBackendWeekday(from date: Date) -> Int {
        let calendar = Calendar.current
        let calendarWeekday = calendar.component(.weekday, from: date) // Sunday=1, Monday=2, etc.
        return calendarWeekday - 1 // Convert to backend format: Sunday=0, Monday=1, etc.
    }
     */
    func triggerAddQuestion(){
        let note = fieldReply.text ?? ""
        if note.isEmpty{
            Utils.showToast(message: "Pleaes enter the question")
            return
        }
        self.view.endEditing(true)
        let param = ["event_id":eventDetailData.id ?? 0,
                     "question":note] as [String : Any]
        EventRequest.instance.triggerAddQuestion(param: param) { response, status in
            if status{
                self.fieldReply.text = ""
                self.triggerGetAnswers()
                self.tableView.refreshTable()
            }
            Utils.showToast(message: response.message)
        }
    }

    func triggerCheckinEvent1(){
        let latitude = locationData.coordinate.latitude
        let longitude = locationData.coordinate.longitude
        let param = ["ticket_id":eventDetailData.participant_id ?? "",
                     "latitude":latitude,
                     "longitude":longitude,
                     "event_id":eventDetailData.id ?? 0] as [String : Any]
        EventRequest.instance.triggerCheckInEvent(param: param) { response, status in
            if status{
                Utils.showToast(message: response.message)
                self.triggerEvents()
            }
        }
    }
    func triggerCheckinEvent() {
        LocationPermissionManager.shared.checkPermission { allowed in
            guard allowed else {
                self.showLocationPermissionPopup()
                return
            }

            let latitude = locationData.coordinate.latitude
            let longitude = locationData.coordinate.longitude

            let param: [String: Any] = [
                "ticket_id": self.eventDetailData.participant_id ?? "",
                "latitude": latitude,
                "longitude": longitude,
                "event_id": self.eventDetailData.id ?? 0
            ]

            EventRequest.instance.triggerCheckInEvent(param: param) { response, status in
                if status {
                    Utils.showToast(message: response.message)
                    self.triggerEvents()
                }
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        replyView.config(cornerRadius: 24.0, borderColor: UIColor.init(hex: "#DDDDDD"), borderWidth: 1.0)
        tabView.config(isRoundCorner: true)
        swipeView.config(borderColor: UIColor.init(hex: "#D8D0E3"),borderWidth: 1.0,isRoundCorner: true)
        lblEventDetail.config(isRoundCorner: true)
        lblEventMaterial.config(isRoundCorner: true)
        lblQA.config(isRoundCorner: true)
        lblTimer.config(isRoundCorner: true)
        lblTimer.textAlignment = .center
    }
    func configuTab(){
        if let sView = replyView.superview{
            sView.isHidden = tabType != 3
            if tabType != 3{
                fieldReply.resignFirstResponder()
            }
        }
        footerView.isHidden = tabType == 2 || tabType == 3
        tableView.backgroundColor = tabType == 1 ? UIColor.black : UIColor.init(hex: "#FDFBFF")
        
        lblEventDetail.textColor = UIColor.init(hex: "#545454")
        lblEventMaterial.textColor = UIColor.init(hex: "#545454")
        lblQA.textColor = UIColor.init(hex: "#545454")
        
        lblEventDetail.backgroundColor = UIColor.clear
        lblEventMaterial.backgroundColor = UIColor.clear
        lblQA.backgroundColor = UIColor.clear

        if tabType == 1{
            lblEventDetail.textColor = UIColor.init(hex: "#17101F")
            lblEventDetail.backgroundColor = UIColor.init(hex: "#F9F6FD")
        }else if tabType == 2{
            lblEventMaterial.textColor = UIColor.init(hex: "#17101F")
            lblEventMaterial.backgroundColor = UIColor.init(hex: "#F9F6FD")
        }else if tabType == 3{
            lblQA.textColor = UIColor.init(hex: "#17101F")
            lblQA.backgroundColor = UIColor.init(hex: "#F9F6FD")
        }
        handleSwipeView()
    }
    func triggerEvents(isFreshLoad:Bool = false){
        EventRequest.instance.triggerEventById(id: eventData.id,participantId:eventData.participantId) { data, status in
            if status{
                self.eventDetailData = data
                self.triggerGetAnswers()
                self.tableView.reloadData()
                self.handleSwipeView()
                self.addDetailInfoVC()
                if isFreshLoad{
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: {
                        self.detailView.isHidden = false
                    })
                }
            }
        }
    }
    func addDetailInfoVC() {
        if let childVC = children.first(where: { $0 is EventInfoVC }) as? EventInfoVC {
            childVC.isFromMyBooking = true
            childVC.eventDetail = self.eventDetailData
            childVC.configureCarosoul()
            childVC.delegate = self
//            childVC.jpurneyLevelView.isHidden = true
//            if eventDetailData.categoryId == 2{
                childVC.jpurneyLevelView.isHidden = self.eventDetailData.journeyName.isEmpty ? true : false
//            }
            childVC.lblConfirmed.isHidden = isCompletedBooking
            childVC.config(data: eventDetailData)
            childVC.organizerView.addTap { r in
                if let vc: OrganizerProfileVC = self.getController(from: .main) {
                    vc.eventDetailData = self.eventDetailData
                    vc.itemTapped = {
                        self.triggerEvents()
                    }
                    self.pushVC(vc: vc)
                }
            }
            childVC.imgJourneyInfo.addTap { r in
                if let topVC = topViewController(){
                    if let vc: JourneyInfoVC = topVC.getController(from: .authentication) {
                        vc.screenType = .journey
                        vc.screenMessage = self.eventDetailData.journeySubName
                        topVC.presentVC(vc: vc)
                    }
                }
            }
            childVC.requestBuddyView.addTap { r in
                if self.eventDetailData.requestBuddy == "1"{
                    return
                }
                EventRequest.instance.triggerRequestBuddy(id: self.eventDetailData.id,type:1) { response, status in
                    if status{
                        self.eventDetailData.requestBuddy = "1"
                        childVC.lblRequstedbuddy.text = "Requested".localized
                        self.tableView.reloadData()
                        Utils.showToast(message: response.message)
                        self.showBuddyMessage()
                    }
                }
            }
            childVC.itemTapped = { index in
                let images = self.eventDetailData.images.map { $0.fullScreenImage ?? ""}
                if images.count == 0{
                    return
                }
                self.showSlideShow(data: images, showIndex: index)
            }
            childVC.lblAboutMore.addTap { r in
                self.eventDetailData.moreLines = self.eventDetailData.moreLines == 0 ? 2 : 0
                self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 0)], with: .none)
            }
            childVC.viewTicketView.addTap { r in
                if let vc: EventDownloadVC = self.getController(from: .main) {
                    vc.eventDetailData = self.eventDetailData
                    self.presentVC(vc: vc,overFull:false)
                }
            }
            childVC.bgInnerView.setCornerRadius([.bottomLeft,.bottomRight], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
            childVC.partiesView.addTap { r in
                if let vc: EventSearchVC = self.getController(from: .main) {
                    vc.eventDetail = self.eventDetailData
                    vc.wishlistTapped = {}
                    self.pushVC(vc: vc)
                }
            }
        }
        self.addDetailOtherVC()
    }
    func showBuddyMessage(){
        if let topVC = topViewController(){
            if let vc: JourneyInfoVC = topVC.getController(from: .authentication) {
                vc.screenType = .buddyMessage
                topVC.presentVC(vc: vc)
            }
        }
    }
    func addDetailOtherVC() {
        if let childVC = children.first(where: { $0 is EventOtherVC }) as? EventOtherVC {
            childVC.isFromMyBooking = true
            childVC.eventData = self.eventDetailData
            childVC.delegate = self
            childVC.config(data: self.eventDetailData)
            
            childVC.speakerTapped = { index in
                if let vc: SpeakerVC = self.getController(from: .main) {
                    vc.speakerData = self.eventDetailData.speakers[index]
                    vc.wishlistTapped = { data in
                        if data.id == self.eventDetailData.id{
                            self.eventDetailData.isWishlisted = data.isWishlisted
                            self.eventData.isWishlisted = data.isWishlisted
                        }
                    }
                    self.pushVC(vc: vc)
                }
            }
            childVC.imgShare.addTap { r in
                self.shareLocation(type: 1)
            }
            childVC.imgShareEnquireLocation.addTap { r in
                self.shareLocation(type: 2)
            }
            childVC.mapView.addTap { r in
                var latitude = Double(self.eventDetailData.latitude) ?? 0.0
                var longitude = Double(self.eventDetailData.longitude) ?? 0.0
                var placeName = self.eventDetailData.location
                if self.eventDetailData.to_latitude.toDouble() != 0.0{
                    if self.eventDetailData.to_latitude.toDouble() != 0.0 && self.eventDetailData.to_longitude.toDouble() != 0.0{
                        latitude = Double(self.eventDetailData.to_latitude) ?? 0.0
                        longitude = Double(self.eventDetailData.to_longitude) ?? 0.0
                        placeName = self.eventDetailData.to_location
                    }
                }
                MapOpener.openMap(latitude: latitude, longitude: longitude, placeName: placeName)
            }
            childVC.enquiryMapView.addTap { r in
                let latitude = Double(self.eventDetailData.latitude) ?? 0.0
                let longitude = Double(self.eventDetailData.longitude) ?? 0.0
                MapOpener.openMap(latitude: latitude, longitude: longitude, placeName: self.eventDetailData.location)
            }
        }
    }
    
   func setTargetDate(from timeString: String) {
       // Get the current date
       let currentDate = Date()
       
       // Set up a date formatter to convert timeString to a Date
       let dateFormatter = DateFormatter()
       dateFormatter.dateFormat = "HH:mm:ss"
       dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
       dateFormatter.locale = Locale(identifier: "en_US_POSIX")

       // Get the date from the time string
       if let startTime = dateFormatter.date(from: timeString) {
           // Combine current date with start time
           let calendar = Calendar.current
           let target = calendar.date(bySettingHour: calendar.component(.hour, from: startTime),
                                      minute: calendar.component(.minute, from: startTime),
                                      second: calendar.component(.second, from: startTime),
                                      of: currentDate)!
           targetDate = target
       }
   }
    func startCountdown(with seconds: TimeInterval) {
        guard seconds > 0 else { return }
        
        timeRemaining = seconds
        
        countdownTimer?.invalidate() // Stop any previous timer
        
        countdownTimer = Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(updateCountdown), userInfo: nil, repeats: true)
        
        // Initial call to update countdown immediately
        updateCountdown()
    }
    @objc func updateCountdown() {
        guard timeRemaining > 0 else {
            countdownTimer?.invalidate()
            lblTimer.isHidden = true
            return
        }
        
        let hours = Int(timeRemaining) / 3600
        let minutes = (Int(timeRemaining) % 3600) / 60
        let seconds = Int(timeRemaining) % 60
        
        var countdownString: String
        if hours > 0 {
            countdownString = String(format: "%02d:%02d:%02d", hours, minutes, seconds)
        } else {
            countdownString = String(format: "%02d:%02d", minutes, seconds)
        }
        
        lblTimer.isHidden = false
        lblTimer.text = "Swipe in \(countdownString)"
        
        timeRemaining -= 1
    }
    
   func startCountdown() {
       guard targetDate != nil else { return }
       
       countdownTimer?.invalidate() // Stop any previous timer
       
       countdownTimer = Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(updateCountdown), userInfo: nil, repeats: true)
       
       // Initial call to update countdown immediately
       updateCountdown()
   }
    
   /*@objc func updateCountdown() {
       guard let targetDate = targetDate else { return }
       let currentDate = Date()
       if currentDate >= targetDate {
           countdownTimer?.invalidate()
           lblTimer.isHidden = true
           return
       }
       let timeRemaining = targetDate.timeIntervalSince(currentDate)
       let hours = Int(timeRemaining) / 3600
       let minutes = (Int(timeRemaining) % 3600) / 60
       let seconds = Int(timeRemaining) % 60
       var countdownString: String
       if hours > 0 {
           countdownString = String(format: "%02d:%02d:%02d", hours, minutes, seconds)
       } else {
           countdownString = String(format: "%02d:%02d", minutes, seconds)
       }
       lblTimer.isHidden = false
       lblTimer.text = "Swipe in \(countdownString)"
   }*/
    func getTime(for eventDate: Date, timeString: String) -> Date? {
        let calendar = Calendar.current
        let components = timeString.split(separator: ":")
        guard components.count == 2,
              let hour = Int(components[0]),
              let minute = Int(components[1]) else { return nil }
        
        return calendar.date(bySettingHour: hour, minute: minute, second: 0, of: eventDate)
    }
    
    func handleSwipeView() {
        if isCompletedBooking{
            footerView.isHidden = true
            return
        }
        if eventDetailData.categoryId != 2{
            footerView.isHidden = true
            return
        }
        if tabType == 2 || tabType == 3 {
            footerView.isHidden = true
            return
        }
        swipeView.hintLabel.textColor = .black
        swipeView.isUserInteractionEnabled = true
        if eventDetailData.swipe_checkin == "1",
           eventDetailData.status == 1,
           eventDetailData.locationType == 1{
            footerView.isHidden = false
            if eventDetailData.swipe_flag == 1{
                lblTimer.isHidden = true
            }else if eventDetailData.swipe_timer > 0{
                lblTimer.isHidden = false
                startCountdown(with: Double(eventDetailData.swipe_timer)) // pass the seconds from backend
            }else{
                lblTimer.isHidden = false
                lblTimer.text = eventDetailData.swipe_text
            }
            return
        }
        guard eventDetailData.swipe_checkin == "1",
              eventDetailData.status == 1,
              eventDetailData.locationType == 1 else {
            footerView.isHidden = true
            return
        }

        // Attendance already marked
        if eventDetailData.attendance_today == "1" {
            swipeView.hintLabel.textColor = .darkGray
            swipeView.isUserInteractionEnabled = false
            footerView.isHidden = (tabType == 2 || tabType == 3)
            swipeView.updateHintLabel(text: "Already checked in")
            return
        }
        let swipeStartTimeStr = eventDetailData.startTime ?? "08:45" // From response
        let swipeEndTimeStr = eventDetailData.endTime ?? "09:30"     // From response

        let eventDate = Date() // Or use your event date logic here

        if let swipeStartTime = getTime(for: eventDate, timeString: swipeStartTimeStr),
           let swipeEndTime = getTime(for: eventDate, timeString: swipeEndTimeStr) {
            
            let now = Date()
            
            if now >= swipeStartTime && now <= swipeEndTime {
                print("✅ Swipe in window active")
                // Show swipe UI
            } else if now < swipeStartTime {
                print("⏰ Timer running till swipe window opens")
                // Show countdown timer
            } else {
                print("🚫 Swipe window closed")
                // Show 'Closed for today'
            }
        }
        

        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone.current
        
        // Combine event date + start time
        formatter.dateFormat = "dd-MM-yyyy"
        guard let eventDate = formatter.date(from: eventDetailData.startDate ?? "") else { return }
        
        formatter.dateFormat = "HH:mm:ss"
        guard let eventStartTime = formatter.date(from: eventDetailData.startTime ?? "") else { return }

        // Get full event datetime
        let calendar = Calendar.current
        let eventDateTime = calendar.date(bySettingHour: calendar.component(.hour, from: eventStartTime),
                                          minute: calendar.component(.minute, from: eventStartTime),
                                          second: calendar.component(.second, from: eventStartTime),
                                          of: eventDate)!

        let now = Date()
//        let diffMinutes = Int(now.timeIntervalSince(eventDateTime) / 60)

        let swipeStartTime = calendar.date(bySettingHour: 8, minute: 45, second: 0, of: eventDate)!
        let swipeEndTime = calendar.date(bySettingHour: 9, minute: 30, second: 0, of: eventDate)!
        
        // --- Your Conditions ---
        if now >= eventDateTime.addingTimeInterval(-24 * 60 * 60) && now < eventDateTime {
            // Timer starts 24 hours before event
            print("Show timer (24 hours before event)")
            setTargetDate(from: eventDetailData.startTime)
            startCountdown()
            lblTimer.isHidden = false
            footerView.isHidden = false
        }
        else if now >= swipeStartTime && now <= swipeEndTime {
            // 8:45 to 9:30 swipe in feature
            print("Swipe in active")
            lblTimer.isHidden = true
            footerView.isHidden = false
        }
        else if now > swipeEndTime && now <= eventDateTime.addingTimeInterval(2 * 60 * 60) { // assuming event ends in 2 hours
            // After 9:30 till event end
            print("Closed for today")
            lblTimer.text = "Closed for today"
            lblTimer.isHidden = false
            footerView.isHidden = true
        }
        else if now > eventDateTime.addingTimeInterval(2 * 60 * 60) {
            // After event ends
            print("Show timer for tomorrow's class")
            showNextDayTimer()
            footerView.isHidden = false
        }
        else {
            // Before 24 hours window
            print("Start at \(eventDetailData.startTime ?? "")")
            lblTimer.text = "Start at \(eventDetailData.startTime ?? "")"
            lblTimer.isHidden = false
            footerView.isHidden = false
        }

        footerInfo.isHidden = lblTimer.isHidden
        if tabType == 2 || tabType == 3 {
            footerView.isHidden = true
        }
    }

    func showNextDayTimer() {
        // Show timer for tomorrow's event
        let currentDate = Date()
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: currentDate)!
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "hh:mm a"
        timeFormatter.locale = Locale(identifier: "en_US_POSIX")
        let tomorrowTimeString = timeFormatter.string(from: tomorrow)
        
        lblTimer.text = "Next class: \(tomorrowTimeString)"
    }
    /*
    func handleSwipeView() {
        if self.eventDetailData.attendance_today == "1"{
            self.swipeView.hintLabel.textColor = .darkGray
            self.swipeView.isUserInteractionEnabled = false
            self.footerView.isHidden = false
            self.swipeView.updateHintLabel(text: "Already checked in")
            if tabType == 2 || tabType == 3{
                self.footerView.isHidden = true
            }
            return
        }
        if eventDetailData.swipe_checkin == "1" && eventDetailData.status == 1 && eventDetailData.locationType == 1{
            self.swipeView.hintLabel.textColor = .black
            let dateFormatter = DateFormatter()
            lblTimer.isHidden = self.eventDetailData.attendance_today == nil
            let startTime = eventDetailData.startTime ?? ""
            dateFormatter.dateFormat = "HH:mm:ss"
            if self.eventDetailData.attendance_today != nil{
                let formatterToday = DateFormatter()
                formatterToday.dateFormat = "dd-MM-yyyy"
                formatterToday.locale = Locale(identifier: "en_US_POSIX") // 🔥 Always set this for fixed format parsing
                let getTodayDate = formatterToday.string(from: Date())
                formatterToday.dateFormat = "HH:mm:ss"
                let getTodayTime = formatterToday.string(from: Date())
                let date1 = DateHelper().convertUTCToLocal(utcTime: "\(getTodayDate) \(startTime)") ?? "" // 05:22 pm
                let date2 = DateHelper().convertTime(from: "\(getTodayDate) \(getTodayTime)")
                let helper = DateHelper() //dd-MM-yyyy HH:mm:ss
                if let diffMinutes = helper.differenceInMinutes(from: date1, to: date2) {
                     if diffMinutes >= -15 && diffMinutes < 0 {
                        print("show timer") // -15 to +14 (inclusive)
                         setTargetDate(from: self.eventDetailData.startTime)
                         startCountdown()
                    } else if diffMinutes >= 0 && diffMinutes <= 30 {
                        print("show swipe") // 0 to 30 (inclusive)
                        lblTimer.isHidden = true
                    } else if diffMinutes < 0 {
                        print("Start at") // All other cases (< -15 or > 30)
                        let timeFormatter = DateFormatter()
                        timeFormatter.dateFormat = "HH:mm:ss"
                        timeFormatter.locale = Locale(identifier: "en_US_POSIX")
                        timeFormatter.timeZone = TimeZone(secondsFromGMT: 0) // Parse as UTC

                        guard let backendTimeOnly = timeFormatter.date(from: self.eventDetailData.startTime) else {
                            lblTimer.text = "Start at \(self.eventDetailData.startTime ?? "")"
                            return
                        }
                        let displayFormatter = DateFormatter()
                        displayFormatter.dateFormat = "hh:mm a"
                        displayFormatter.locale = Locale(identifier: "en_US_POSIX")
                        displayFormatter.timeZone = TimeZone(secondsFromGMT: 0)
                        let eventTimeString = displayFormatter.string(from: backendTimeOnly)
                        lblTimer.text = "Start at \(eventTimeString)"
                    } else {
                        print("closed for today") // All other cases (< -15 or > 30)
                        lblTimer.text = "Closed for today"
                    }
                }
            }
            var todayDate = Date()
            dateFormatter.dateFormat = "dd-MM-yyyy"
            var startDate = getEventDate(from: eventDetailData.startDate)
            var endDate = getEventDate(from: eventDetailData.endDate)
            
            let todayDateStr = dateFormatter.string(from: Date())
            let startDateStr = dateFormatter.string(from: startDate)
            let endDateStr = dateFormatter.string(from: endDate)
            
            todayDate = dateFormatter.date(from: todayDateStr)!
            startDate = dateFormatter.date(from: startDateStr)!
            endDate = dateFormatter.date(from: endDateStr)!
            
            if todayDate >= startDate && todayDate <= endDate && eventDetailData.swipe_checkin == "1" {
                self.footerView.isHidden = false
            } else {
                self.footerView.isHidden = true
            }
            if eventDetailData.locationType == 0 || self.eventDetailData.status == 2{
                self.footerView.isHidden = true
            }
            self.swipeView.isUserInteractionEnabled = true
            if todayDate < startDate && self.eventDetailData.attendance_today == nil{
                dateFormatter.dateFormat = "HH:mm:ss"
                let startTimeFormatt = dateFormatter.date(from: eventDetailData.startTime ?? "") ?? Date()
                dateFormatter.dateFormat = "hh:mm a"
                let getStr = dateFormatter.string(from: startTimeFormatt)
                lblTimer.text = "Start at \(startDateStr) \(getStr)"
                lblTimer.isHidden = false
                footerView.isHidden = false
            }
            footerInfo.isHidden = lblTimer.isHidden
            if tabType == 2 || tabType == 3{
                footerView.isHidden = true
            }
        }else{
            footerView.isHidden = true
        }
    }
     */
    func checkServerTimeStatus(backendTimeString: String) -> ServerTimeStatus {
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm:ss"
        timeFormatter.locale = Locale(identifier: "en_US_POSIX")
        timeFormatter.timeZone = TimeZone(secondsFromGMT: 0) // Parse as UTC

        guard let backendTimeOnly = timeFormatter.date(from: backendTimeString) else {
            print("Failed to parse backend time")
            return .normal
        }

        let calendar = Calendar(identifier: .gregorian)
        let utcTimeZone = TimeZone(secondsFromGMT: 0)!

        // Get today's date in UTC
        let nowUTC = Date()
        let todayUTCComponents = calendar.dateComponents(in: utcTimeZone, from: nowUTC)

        // Create backend date for today in UTC
        var backendComponents = DateComponents()
        backendComponents.year = todayUTCComponents.year
        backendComponents.month = todayUTCComponents.month
        backendComponents.day = todayUTCComponents.day
        backendComponents.hour = calendar.component(.hour, from: backendTimeOnly)
        backendComponents.minute = calendar.component(.minute, from: backendTimeOnly)
        backendComponents.second = calendar.component(.second, from: backendTimeOnly)
        backendComponents.timeZone = utcTimeZone // 👈 Force UTC

        guard let backendDate = calendar.date(from: backendComponents) else {
            print("Failed to create full backend date")
            return .normal
        }

        let differenceInSeconds = backendDate.timeIntervalSince(nowUTC)
        let differenceInMinutes = differenceInSeconds / 60.0

        print("⚡️ Diff minutes: \(differenceInMinutes)")

        if abs(differenceInMinutes) <= 15 {
            return .within15Minutes
        } else if abs(differenceInMinutes) <= 30 {
            return .within30Minutes
        } else if differenceInMinutes > 30 {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "hh:mm a"
            displayFormatter.locale = Locale(identifier: "en_US_POSIX")
            displayFormatter.timeZone = TimeZone(secondsFromGMT: 0)
            let eventTimeString = displayFormatter.string(from: backendDate)
            return .eventInFuture(eventTimeString)
        } else {
            return .normal
        }
    }
    func getEventDate(from dateString: String) -> Date {
        let formats = [
            "yyyy-MM-dd'T'HH:mm:ss", // Format 1
            "yyyy-MM-dd HH:mm:ss",    // Format 2
            "EEE, dd MMM yyyy HH:mm:ss zzz"
        ]
        let dateFormatter = DateFormatter()
        for format in formats {
            dateFormatter.dateFormat = format
            dateFormatter.timeZone = TimeZone(abbreviation: "GMT")
            if let date = dateFormatter.date(from: dateString) {
                return date // Return the parsed date if successful
            }
        }
        // Fallback to current date if parsing fails
        return Date()
    }

    func triggerGetAnswers(){
        EventRequest.instance.triggerGetQuestionAnsewrs(id: eventData.id) { response, status in
            self.eventQuestions = response
            if self.isQATabSelected{
                self.isQATabSelected = false
                self.tabType = 3
            }
        }
    }
}
extension BookingDetailVC:EventInfoVCDelegate,EventOtherVCDelegate{
    func updateContentViewHeight(to height: CGFloat) {
        detailInfoHeight.constant = height
        UIView.animate(withDuration: 0.3) {
            self.view.layoutIfNeeded()
        }
        updateScrollViewContentSize()
    }

    func updateScrollViewContentSize() {
        DispatchQueue.main.async {
            let totalHeight = self.detailInfoVC.frame.height + self.detailOtherVC.frame.height
            self.scrollView.contentSize = CGSize(width: self.scrollView.frame.width, height: totalHeight)
        }
    }

    func updateOtherContentViewHeight(to height: CGFloat) {
        otherInfoHeight.constant = height
        UIView.animate(withDuration: 0.3) {
            self.view.layoutIfNeeded()
        }
        self.updateScrollViewContentSize()
    }
}

extension BookingDetailVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return tabType == 2 ? 2 : 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if tabType == 2{
            if section == 1{
                return eventDetailData.documents.count > 0 ? eventDetailData.documents.count : 1
            }else if section == 2{
                return 1 //eventQuestions.count > 0 ? 1 : 0
            }
        }else if tabType == 3{
            return 1
        }
        return 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if tabType == 3{
            let cell = tableView.configureCell(BookingQuestionsCell.self, at: indexPath)
            cell.delegate = self // Set delegate
            cell.headerView.isHidden = indexPath.section == 2
            cell.tableView.tag = 2//indexPath.section
            cell.tableView.accessibilityHint = "\(indexPath.row)"
            cell.filesTapped = { (tag,index) in
                self.downloadAndSaveFile(from: self.eventDetailData.documents[tag].files[index].filePath)
            }
            cell.questionTapped = { (tag,index) in
                if tag == 2{
                    if let vc: AskedQuestionVC = self.getController(from: .main) {
                        vc.eventDetailData = self.eventDetailData
                        vc.noteTapped = { data in
                            self.eventQuestions.append(EventQuestionsResponse.init(fromDictionary: ["question" : data["question"] as? String ?? ""]))
                            self.tableView.reloadData()
                        }
                        self.presentVC(vc: vc)
                    }
                }else{
                    self.downloadAndSaveFile(from: self.eventDetailData.documents[index].filePath)
                }
            }
            cell.lblDesc.text = ""
            cell.headerView.isHidden = true
            if indexPath.section == 1{
                if eventDetailData.documents.count > 0 {
                    if !eventDetailData.documents[indexPath.row].documentName.isEmpty{
                        cell.headerView.isHidden = false
                    }
                    cell.lblDesc.html2String(string: eventDetailData.documents[indexPath.row].documentName, customFont: Fonts.SFProMedium(12.0), color: .black)
                }
            }else{
                if eventQuestions.count > indexPath.row{
                    cell.lblDesc.text = eventQuestions[indexPath.row].question
                }
            }
            if eventDetailData.documents.count > indexPath.row{
                cell.configdata(item: eventDetailData.documents[indexPath.row].files)
            }
            cell.configQuestions(item: eventQuestions)
            
            return cell
        }
        if tabType == 2{
            if indexPath.section == 1 || indexPath.section == 2{
                let cell = tableView.configureCell(BookingMaterialCell.self, at: indexPath)
                cell.delegate = self // Set delegate
                cell.headerView.isHidden = indexPath.section == 2
                cell.tableView.tag = indexPath.section
                cell.tableView.accessibilityHint = "\(indexPath.row)"
                cell.filesTapped = { (tag,index) in
                    self.downloadAndSaveFile(from: self.eventDetailData.documents[tag].files[index].filePath)
                }
                cell.questionTapped = { (tag,index) in
                    if tag == 2{
                        if let vc: AskedQuestionVC = self.getController(from: .main) {
                            vc.eventDetailData = self.eventDetailData
                            vc.noteTapped = { data in
                                self.eventQuestions.append(EventQuestionsResponse.init(fromDictionary: ["question" : data["question"] as? String ?? ""]))
                                self.tableView.reloadData()
                            }
                            self.presentVC(vc: vc)
                        }
                    }else{
                        self.downloadAndSaveFile(from: self.eventDetailData.documents[index].filePath)
                    }
                }
                cell.lblDesc.text = ""
                cell.headerView.isHidden = true
                if indexPath.section == 1{
                    if eventDetailData.documents.count > 0 {
                        if !eventDetailData.documents[indexPath.row].documentName.isEmpty{
                            cell.headerView.isHidden = false
                        }
                        cell.lblDesc.html2String(string: eventDetailData.documents[indexPath.row].documentName, customFont: Fonts.SFProMedium(12.0), color: .black)
                    }
                }else{
                    if eventQuestions.count > indexPath.row{
                        cell.lblDesc.text = eventQuestions[indexPath.row].question
                    }
                }
                if eventDetailData.documents.count > 0{
                    cell.configdata(item: eventDetailData.documents[indexPath.row].files)
                }else{
                    cell.configdata(item: [])
                }
                cell.configQuestions(item: eventQuestions)
                return cell
            }
            let cell = tableView.configureCell(BookingMaterialNotesCell.self, at: indexPath)
            cell.lblNotesTitle.text = "You have \(eventDetailData.eventNoteCount ?? 0) notes".localized
            return cell
        }
        if indexPath.section == 1{
            let cell = tableView.dequeueReusableCell(withIdentifier: "EventDetailOtherCell", for: indexPath) as! EventDetailOtherCell
            cell.speakerTapped = { index in
                if let vc: SpeakerVC = self.getController(from: .main) {
                    vc.speakerData = self.eventDetailData.speakers[index]
                    self.pushVC(vc: vc)
                }
            }
            cell.moreTapped = {
                self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 1)], with: .none)
            }
            cell.imgShare.addTap { r in
                self.shareLocation(type: 1)
            }
            cell.imgShareEnquireLocation.addTap { r in
                self.shareLocation(type: 2)
            }
            cell.mapView.addTap { r in
                let latitude = Double(self.eventDetailData.latitude) ?? 0.0
                let longitude = Double(self.eventDetailData.longitude) ?? 0.0
                MapOpener.openMap(latitude: latitude, longitude: longitude, placeName: self.eventDetailData.location)
            }
            cell.config(data: eventDetailData)
            cell.delegate = self // Set delegate
            return cell
        }
        let cell = tableView.configureCell(EventDetailCell.self, at: indexPath)
        cell.tag = 1
        cell.alphaView.isHidden = true
//        cell.jpurneyLevelView.isHidden = false
//        if eventDetailData.journeyLevelId == 0{
//            cell.jpurneyLevelView.isHidden = true //self.eventDetailData.journeyName.isEmpty ? true : false
//        }
        cell.jpurneyLevelView.isHidden = self.eventDetailData.journeyName.isEmpty ? true : false
        cell.config(data: eventDetailData)
        cell.configureCarosoul()
        cell.organizerView.addTap { r in
            if let vc: OrganizerProfileVC = self.getController(from: .main) {
                vc.eventDetailData = self.eventDetailData
                vc.itemTapped = {
                    self.triggerEvents()
                }
                self.pushVC(vc: vc)
            }
        }
        cell.requestBuddyView.addTap { r in
            if self.eventDetailData.requestBuddy == "1"{
                return
            }
            EventRequest.instance.triggerRequestBuddy(id: self.eventDetailData.id,type:1) { response, status in
                if status{
                    self.eventDetailData.requestBuddy = "1"
                    self.tableView.reloadData()
                    Utils.showToast(message: response.message)
                }
            }
        }
        cell.itemTapped = { index in
            let images = self.eventDetailData.images.map { $0.fullScreenImage ?? ""}
            if images.count == 0{
                return
            }
            self.showSlideShow(data: images, showIndex: index)
        }
        cell.lblAboutMore.addTap { r in
            self.eventDetailData.moreLines = self.eventDetailData.moreLines == 0 ? 2 : 0
            self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 0)], with: .none)
        }
        cell.viewTicketView.addTap { r in
            if let vc: EventDownloadVC = self.getController(from: .main) {
                vc.eventDetailData = self.eventDetailData
                self.presentVC(vc: vc,overFull:false)
            }
        }
        cell.lblConfirmed.isHidden = isCompletedBooking
        return cell
    }
    func shareLocation(type:Int){
        var location = eventDetailData.location ?? ""
        var latitude = eventDetailData.latitude ?? ""
        var longitude = eventDetailData.longitude ?? ""
        if !eventDetailData.to_location.isEmpty || eventDetailData.to_latitude.toDouble() != 0.0 || eventDetailData.to_longitude.toDouble() != 0.0{
            if type == 1{
                latitude = eventDetailData.to_latitude ?? ""
                longitude = eventDetailData.to_longitude ?? ""
                location = eventDetailData.to_location ?? ""
            }
        }
        let textToShare = "Address:".localized + " \(location) \("url:".localized) \("https://www.google.com/maps?q=\(latitude),\(longitude)")"
        self.shareText(textToShare: textToShare)
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if tabType == 2 && indexPath.section == 0{
            if let vc: MYNotesVC = self.getController(from: .main) {
                vc.eventDetailData = self.eventDetailData
                vc.noteCount = { count in
                    self.eventDetailData.eventNoteCount = count
                    self.tableView.refreshTable()
                }
                self.presentVC(vc: vc)
            }
        }
    }
    func navigateToNotes(){
        if let vc: MYNotesVC = self.getController(from: .main) {
            vc.eventDetailData = self.eventDetailData
            vc.noteCount = { count in
                self.eventDetailData.eventNoteCount = count
                self.tableView.reloadData()
            }
            self.presentVC(vc: vc)
        }
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingMaterialHeaderCell.self)
        if section == 0{
            cell.configHeader(title: "MY NOTES", subTitle: "")
        }else if section == 1{
            cell.configHeader(title: "FILES AND DOCUMENTS", subTitle: "material provided by the organizer")
        }else if section == 2{
            cell.configHeader(title: "Asked Questions", subTitle: "Questions asked by you")
        }
        cell.bgView.backgroundColor = .clear
        return cell
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if tabType == 3 {
            return 0.1
        }
        let numberOfRows = self.tableView(tableView, numberOfRowsInSection: section)
        return tabType == 1 ? 0 : section == 2 ? 0 : numberOfRows == 0 ? 0.1 : UITableView.automaticDimension
    }
    func showSlideShow(data:Any,showIndex:Int){
        let slideshow = ImageSlideshow()
        var valueContains = false
        if let showData = data as? [String]{
            if showData.count > 0 {
                showLightBox(urls: showData, index: showIndex)
            }
        }
    }

}
extension BookingDetailVC{
    func showLightBox(urls:[String],index:Int){
        // Create an array of images.
        var images = [LightboxImage]()
        for image in urls{
            images.append(LightboxImage(imageURL: URL(string: image)!))
        }
        // Create an instance of LightboxController.
        let controller = LightboxController(images: images)
        // Set delegates.
        controller.pageDelegate = self
        controller.dismissalDelegate = self
        // Use dynamic background.
        controller.dynamicBackground = true
        // Present your controller.
        present(controller, animated: true, completion: {
            controller.goTo(index)
        })
    }
}
extension BookingDetailVC: LightboxControllerPageDelegate,LightboxControllerDismissalDelegate {
    func lightboxController(_ controller: LightboxController, didMoveToPage  page: Int) {
       print(page)
    }
    func lightboxControllerWillDismiss(_ controller: LightboxController) {

    }
}

extension BookingDetailVC:UIDocumentPickerDelegate{
    func downloadAndSaveFile(from urlString: String) {
        guard let url = URL(string: urlString) else {
            Utils.showToast(message: ("Invalid URL"))
            return
        }
        APIDispatcher.instance.showLoading()
        // Start the download
        let task = URLSession.shared.downloadTask(with: url) { [weak self] tempURL, response, error in
            APIDispatcher.instance.removeLoading()
            if let error = error {
                Utils.showToast(message: ("Download failed: \(error)"))
                return
            }
            guard let tempURL = tempURL else {
                Utils.showToast(message: ("No file URL"))
                return
            }
            // Move the file to a persistent location in Documents directory
             let fileManager = FileManager.default
             let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
             let destinationURL = documentsDirectory.appendingPathComponent(url.lastPathComponent)
             
             do {
                 // Remove existing file if any
                 if fileManager.fileExists(atPath: destinationURL.path) {
                     try fileManager.removeItem(at: destinationURL)
                 }
                 // Move the file from temp to the persistent directory
                 try fileManager.moveItem(at: tempURL, to: destinationURL)
                 
                 // Present the save dialog for the persistent file
                 DispatchQueue.main.async {
                     self?.presentSaveDialog(tempURL: destinationURL)
                 }
             } catch {
                 print("File move error: \(error)")
             }
        }
        task.resume()
    }
    
    private func presentSaveDialog(tempURL: URL) {
        if #available(iOS 14.0, *) {
            let documentPicker = UIDocumentPickerViewController(forExporting: [tempURL])
            documentPicker.delegate = self
            documentPicker.allowsMultipleSelection = false
            documentPicker.modalPresentationStyle = .formSheet
            present(documentPicker, animated: true, completion: nil)
        } else {
            // Fallback on earlier versions
        }
    }
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let savedURL = urls.first else { return }
        Utils.showToast(message: ("File successfully saved"))
    }
    
    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        print("User canceled file save.")
    }

}
extension BookingDetailVC:UITextFieldDelegate{
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder() // Dismiss the keyboard
        return true
    }
}
extension BookingDetailVC:UIPopoverPresentationControllerDelegate{
    func adaptivePresentationStyle(for controller: UIPresentationController) -> UIModalPresentationStyle {
        return .none
    }
}
