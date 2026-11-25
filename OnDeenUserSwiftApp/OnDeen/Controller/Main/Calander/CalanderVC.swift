//
//  CalanderVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

struct CalendarDay {
    let date: Date
    let isPadding: Bool
    var isSelected: Bool
    var events: [String] // Store event titles or event objects
}

struct CalendarSection {
    let month: String
    var days: [CalendarDay]
}

class CalanderVC: UIViewController {
    @IBOutlet weak var lblCurrentYear: SFProLabel!
    @IBOutlet weak var backView: UIStackView!
    var switchType = 0{
        didSet{
            self.imgSwitch.image = UIImage.init(named: switchType == 1 ? "ic_grid_switch" : "ic_grid_calander")
        }
    }
    
    @IBOutlet weak var imgSwitch: UIImageView!
    @IBOutlet weak var collectionView: UICollectionView!
    private var sections: [CalendarSection] = []
    private var filterSections: [CalendarSection] = []
    private var calendar: Calendar = {
        var calendar = Calendar(identifier: .gregorian)
        calendar.locale = Locale(identifier: "en_US_POSIX")
        calendar.timeZone = TimeZone.current
        return calendar
    }()
    var weekEvents = [HomePageEvent](){
        didSet{
            self.collectionView.refreshCollection()
        }
    }
    var isEventTapped = false
    var filteredEvents = [HomePageEvent]()

    private func makeDateFormatter(_ format: String) -> DateFormatter {
        let formatter = DateFormatter()
        formatter.calendar = calendar
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = calendar.timeZone
        formatter.dateFormat = format
        return formatter
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        imgSwitch.addTap { r in
            if self.switchType == 1 {
                self.switchType = 0
                self.sections = []
                self.filterSections = []
                self.filteredEvents = []
                self.collectionView.refreshCollection()
                self.generateCalendar()
            }
        }
    }
    override func viewWillAppear(_ animated: Bool) {
//        if isEventTapped{
            isEventTapped = false
//            return
//        }
        if sections.count > 0{
            self.switchType = 0
            self.sections = []
            filterSections = []
            filteredEvents = []
            generateCalendar()
        }
    }
    override func viewDidAppear(_ animated: Bool) {
        config()
        collectionView.isHidden = true
        generateCalendar()
    }
    func generateCalendar() {
        let today = Date()
//        calendar.timeZone = TimeZone(identifier: "UTC") ?? TimeZone.current
        calendar.timeZone = TimeZone.current
        let startMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: today))!
        let endMonth = calendar.date(byAdding: DateComponents(year: 2, month: 0, day: -1), to: startMonth)! // Exactly 2 years span

        sections.removeAll() // Reset sections before regenerating
        collectionView.isHidden = true // Hide until fully loaded
        
        generateDays(from: startMonth, to: endMonth)
        generateDatePayload(fromDate: startMonth, toDate: endMonth)
    }
    private func generateDays(from startMonth: Date, to endMonth: Date) {
        calendar.firstWeekday = 1 // Monday as the first day of the week
        var date = startMonth
        var currentMonthYear: String?
        var daysInCurrentMonth: [CalendarDay] = []
        
        while date <= endMonth {
            let month = calendar.component(.month, from: date)
            let year = calendar.component(.year, from: date)
            let monthYear = "\(calendar.monthSymbols[month - 1]) \(year)" // Example: "March 2025"

            if currentMonthYear == nil || currentMonthYear != monthYear {
                if let currentMonthYear = currentMonthYear {
                    finalizeMonth(&daysInCurrentMonth, monthYear: currentMonthYear)
                }
                currentMonthYear = monthYear
                daysInCurrentMonth = []
            }

            daysInCurrentMonth.append(CalendarDay(date: date, isPadding: false, isSelected: false, events: []))

            if let nextDate = calendar.date(byAdding: .day, value: 1, to: date) {
                date = nextDate
            } else {
                break
            }
        }

        // Finalize the last month after the loop ends
        if let currentMonthYear = currentMonthYear {
            finalizeMonth(&daysInCurrentMonth, monthYear: currentMonthYear)
        }

        collectionView.reloadData()
    }

    // Helper function to finalize and append a month
    private func finalizeMonth(_ daysInCurrentMonth: inout [CalendarDay], monthYear: String) {
        guard let firstDay = daysInCurrentMonth.first else { return }

        // Get the weekday of the first day of the month (1 = Sunday, 2 = Monday, ..., 7 = Saturday)
        let firstDayOfWeek = calendar.component(.weekday, from: firstDay.date)

        print("📅 Finalizing: \(monthYear), FirstDay: \(firstDay.date), Weekday: \(firstDayOfWeek)")

        // Calculate the number of padding days needed to align the first day of the month with the start of the week (Monday)
        // calendar.firstWeekday = 2 (Monday)
        let emptyDays = (firstDayOfWeek - calendar.firstWeekday + 7) % 7

        var paddingDays: [CalendarDay] = []

        // Add padding days for the previous month
        if emptyDays > 0 {
            if let previousDate = calendar.date(byAdding: .day, value: -emptyDays, to: firstDay.date) {
                for i in 0..<emptyDays {
                    if let paddingDate = calendar.date(byAdding: .day, value: i, to: previousDate) {
                        paddingDays.append(CalendarDay(date: paddingDate, isPadding: true, isSelected: false, events: []))
                    }
                }
            }
        }

        // Insert padding days at the beginning of the month
        daysInCurrentMonth.insert(contentsOf: paddingDays, at: 0)

        print("✅ \(monthYear) starts on weekday \(firstDayOfWeek) → Adding \(emptyDays) padding days")

        // Append the finalized month to the sections array
        sections.append(CalendarSection(month: monthYear, days: daysInCurrentMonth))
    }
    func generateDatePayload(fromDate: Date, toDate: Date) {
        let dateFormatter = makeDateFormatter("MMMM yyyy") // Example: "March 2025"
        
        let currentMonthYear = dateFormatter.string(from: Date())
        DispatchQueue.main.async {
            self.lblCurrentYear.text = currentMonthYear
        }

        collectionView.backgroundView = UIView()
        
        let formatter = makeDateFormatter("yyyy-MM-dd") // Ensure the format matches the required format

        let fromDateString = formatter.string(from: fromDate)
        let toDateString = formatter.string(from: toDate)

        let payload: [String: Any] = [
            "from_date": fromDateString,
            "to_date": toDateString,
            "status":1
        ]

        BookingRequest.instance.triggerBookedEvents(param: payload) { response, status in
            DispatchQueue.main.async {
                self.collectionView.isHidden = false
                self.weekEvents = response
                self.addEventsToCalendar()
            }
        }
    }

    func config(){
        self.setupCollectionView()
        backView.addTap { r in
            if self.switchType == 1{
                self.switchType = 0
                self.filterSections = []
                self.filteredEvents = []
                self.generateCalendar()
                return
            }
            self.setRootController(board: .main, identifier: .homeVC)
        }
    }
    private func setupCollectionView() {
        let width = collectionView.bounds.width / 7 - 10
        let layout = UICollectionViewFlowLayout()
        layout.headerReferenceSize = CGSize(width: collectionView.frame.width, height: 100) // Set your desired height
        layout.itemSize = CGSize(width: width, height: width)
        layout.minimumLineSpacing = 10
        layout.minimumInteritemSpacing = 10
        collectionView.collectionViewLayout = layout
        
        collectionView.register(CalendarCell.self, forCellWithReuseIdentifier: CalendarCell.identifier)
        collectionView.registerNIBs(CalanderEventCell.self)
        collectionView.register(CalendarHeader.self, forSupplementaryViewOfKind: UICollectionView.elementKindSectionHeader, withReuseIdentifier: CalendarHeader.identifier)
        collectionView.register(UINib(nibName: "CalenderDateHeaderCell", bundle: nil), forSupplementaryViewOfKind: UICollectionView.elementKindSectionHeader, withReuseIdentifier:"CalenderDateHeaderCell")
    }
    func checkPlaceholder(){
        if self.weekEvents.count == 0{
            self.sections = []
            self.filterSections = []
            self.collectionView.showPlaceHolder(type: .noActiveBookings)
        }
    }
    private func addEventsToCalendar() {
        // Prepare the event list
        var events: [(startDate: Date, endDate: Date, title: String, occusrType: Int, occusrWeekdays: [Int], occusrMonth: Int)] = []

        let dateFormatter = makeDateFormatter("yyyy-MM-dd'T'00:00:00")

        // Parse weekEvents into internal event structure
        for item in weekEvents {
            // start_date/end_date are date-only values. Parse them in the same
            // display timezone as the calendar so an event on Aug 20 stays on
            // the Aug 20 cell instead of shifting across midnight.
            dateFormatter.timeZone = calendar.timeZone
            if let start = dateFormatter.date(from: item.startDate),
               let end = dateFormatter.date(from: item.endDate) {
                let weekdays = item.occusr_weekday?
                    .split(separator: ",")
                    .compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
                events.append((
                    startDate: start,
                    endDate: end,
                    title: "\(item.id ?? 0)",
                    occusrType: item.occusr_type ?? 1,
                    occusrWeekdays: weekdays ?? [],
                    occusrMonth: item.occusr_month ?? 1
                ))
            }
        }

        // Use UTC calendar
        var utcCalendar = Calendar(identifier: .gregorian)
        utcCalendar.timeZone = TimeZone.current

        // Loop over calendar sections and days
        for sectionIndex in 0..<sections.count {
            for dayIndex in 0..<sections[sectionIndex].days.count {
                var day = sections[sectionIndex].days[dayIndex]
                guard !day.isPadding else { continue }

                let dayStart = utcCalendar.startOfDay(for: day.date)

                // Apple weekday: 1 = Sunday ... 7 = Saturday
                // Backend weekday: 0 = Monday ... 6 = Sunday
                let appleWeekday = utcCalendar.component(.weekday, from: dayStart)
                let backendWeekday = (appleWeekday + 5) % 7

                let dayOfMonth = utcCalendar.component(.day, from: dayStart)

                day.events = events.filter { event in
                    switch event.occusrType {
                    case 0:
                        return dayStart >= event.startDate && dayStart <= event.endDate
                    case 1: // Once
                        return (event.startDate...event.endDate).contains(dayStart)

                    case 2: // Daily
                        return dayStart >= event.startDate && dayStart <= event.endDate

                    case 3: // Weekly
                        return dayStart >= event.startDate &&
                               dayStart <= event.endDate &&
                               event.occusrWeekdays.contains(backendWeekday)

                    case 4: // Monthly
                        guard dayStart >= event.startDate && dayStart <= event.endDate else { return false }

                        switch event.occusrMonth {
                        case 1: // By date (e.g., 15th of every month)
                            let startDay = utcCalendar.component(.day, from: event.startDate)
                            return dayOfMonth == startDay

                        case 2: // By weekday ordinal (e.g., 1st Wednesday)
                            // Determine the target weekday and its ordinal for each month (based on the original pattern)
                               let eventWeekday = utcCalendar.component(.weekday, from: event.startDate)

                               // Get first day of month for the current dayStart
                               let firstDayOfMonth = utcCalendar.date(from: utcCalendar.dateComponents([.year, .month], from: dayStart))!
                               
                               // Count to find the 1st/2nd/3rd/etc occurrence of that weekday this month
                               var ordinal = 0
                               var current = firstDayOfMonth
                               while current <= dayStart {
                                   if utcCalendar.component(.weekday, from: current) == eventWeekday {
                                       ordinal += 1
                                   }
                                   guard let next = utcCalendar.date(byAdding: .day, value: 1, to: current) else { break }
                                   current = next
                               }

                               let currentWeekday = utcCalendar.component(.weekday, from: dayStart)
                               let currentOrdinal = ordinal

                               // Now compare: does this day match the pattern? (e.g., 1st Wednesday)
                               let originalWeekday = utcCalendar.component(.weekday, from: event.startDate)
                               let originalOrdinal = utcCalendar.component(.weekOfMonth, from: event.startDate)

                               return currentWeekday == originalWeekday &&
                                      currentOrdinal == originalOrdinal

                        default:
                            return false
                        }

                    default:
                        return false
                    }
                }
                .map { $0.title }

                sections[sectionIndex].days[dayIndex] = day
            }
        }
    }
    func filterDateSelectedEvents(){
        filterSections = []
        for index in 0..<sections.count{
            for days in 0..<sections[index].days.count{
                if sections[index].days[days].isSelected{
                    filterSections.append(sections[index])
                }
            }
        }
        collectionView.refreshCollection()
    }
}
extension CalanderVC: UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout {
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return filterSections.count > 0 ? filterSections.count + 1 : sections.count
    }

    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if filterSections.count > 0{
            if filterSections.count == section{
                return 1
            }
            return filterSections[section].days.count
        }
        return sections[section].days.count
    }
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        guard let collectionView = scrollView as? UICollectionView else { return }
        
        let visibleIndexPaths = collectionView.indexPathsForVisibleItems
        let sortedIndexPaths = visibleIndexPaths.sorted { $0.section < $1.section }
        
        if let firstVisibleIndexPath = sortedIndexPaths.first {
            if filterSections.count > 0 {
                if filterSections.count > firstVisibleIndexPath.section{
                    lblCurrentYear.text = filterSections[firstVisibleIndexPath.section].month
                }
            } else {
                lblCurrentYear.text = sections[firstVisibleIndexPath.section].month
            }
        }
    }
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        if filterSections.count == indexPath.section && filterSections.count > 0{
            let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "CalanderEventCell", for: indexPath) as! CalanderEventCell
            cell.config(event: filteredEvents)
            cell.eventTapped = { index in
                if self.filteredEvents.count == 0{
                    self.setRootController(board: .main, identifier: .homeVC)
                    return
                }
                if let vc: BookingDetailVC = self.getController(from: .main) {
                    vc.eventData = self.filteredEvents[index]
                    self.isEventTapped = true
                    self.pushVC(vc: vc)
                }
            }
            return cell
        }
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: CalendarCell.identifier, for: indexPath) as! CalendarCell
        if filterSections.count > 0{
            let day = filterSections[indexPath.section].days[indexPath.item]
            cell.configure(with: day)
        }else{
            let day = sections[indexPath.section].days[indexPath.item]
            cell.configure(with: day)
        }
        return cell
    }

    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        reloadSection(indexPath: indexPath)
        delay(0.5) {
            self.reloadSection(indexPath: indexPath)
        }
    }
    func reloadSection(indexPath:IndexPath){
        if filterSections.count == indexPath.section && filterSections.count > 0{
            return
        }
        if self.switchType == 1{
            for index in 0..<filterSections.count{
                for days in 0..<filterSections[index].days.count{
                    filterSections[index].days[days].isSelected = false
                }
            }
            if filterSections.count > indexPath.section{
                if filterSections[indexPath.section].days.count > indexPath.item{
                    let day = filterSections[indexPath.section].days[indexPath.item]
                    filterSections[indexPath.section].days[indexPath.item].isSelected = true
                    filteredEvents = day.events.compactMap { event -> HomePageEvent? in
                        guard let idd = Int(event) else { return nil }
                        return weekEvents.first(where: { $0.id == idd })
                    }
                    collectionView.refreshCollection()
                }
            }
            return
        }
        for index in 0..<sections.count{
            for days in 0..<sections[index].days.count{
                sections[index].days[days].isSelected = false
            }
        }
        if sections.count > indexPath.section{
            if sections[indexPath.section].days.count > indexPath.item{
                let day = sections[indexPath.section].days[indexPath.item]
                sections[indexPath.section].days[indexPath.item].isSelected = true
                switchType = 1
                filteredEvents = day.events.compactMap { event -> HomePageEvent? in
                    guard let idd = Int(event) else { return nil }
                    return weekEvents.first(where: { $0.id == idd })
                }
                filterDateSelectedEvents()
                collectionView.refreshCollection()
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        collectionView.collectionViewLayout.invalidateLayout()
    }
    func getSelectedDateString() -> String? {
        let dateFormatter = makeDateFormatter("EEEE, dd-MM-yyyy") // "EEEE" gives the full weekday name
        if self.filterSections.count > 0{
            for section in self.filterSections {
                if let selectedDay = section.days.first(where: { $0.isSelected }) {
                    return dateFormatter.string(from: selectedDay.date)
                }
            }
            return "No Result Found".localized // Return a default message if no day is selected
        }
        for section in sections {
            if let selectedDay = section.days.first(where: { $0.isSelected }) {
                return dateFormatter.string(from: selectedDay.date)
            }
        }
        return "No Result Found".localized // Return a default message if no day is selected
    }

    func collectionView(_ collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, at indexPath: IndexPath) -> UICollectionReusableView {
        guard kind == UICollectionView.elementKindSectionHeader else {
            return UICollectionReusableView()
        }
        if filterSections.count == indexPath.section && filterSections.count > 0{//
            let header = collectionView.dequeueReusableSupplementaryView(ofKind: kind, withReuseIdentifier: "CalenderDateHeaderCell", for: indexPath) as! CalenderDateHeaderCell
            header.lblTitle.text = getSelectedDateString()
            return header
        }
        
        let header = collectionView.dequeueReusableSupplementaryView(ofKind: kind, withReuseIdentifier: CalendarHeader.identifier, for: indexPath) as! CalendarHeader
        if filterSections.count > 0{
            header.configure(with: filterSections[indexPath.section].month)
            return header
        }
        header.configure(with: sections[indexPath.section].month)
        return header
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, referenceSizeForHeaderInSection section: Int) -> CGSize {
           // Set desired header height and width
        if filterSections.count == section && filterSections.count > 0{
            return CGSize(width: collectionView.bounds.width, height: 50)
        }
           return CGSize(width: collectionView.bounds.width, height: 70) // Adjust height as needed
       }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        if filterSections.count == indexPath.section && filterSections.count > 0{
            guard let cell = collectionView.cellForItem(at: indexPath) as? CalanderEventCell else {
                      return CGSize(width: collectionView.bounds.width, height: 200)
                  }
                  let tableHeight = cell.tableView.contentSize.height
                  return CGSize(width: collectionView.bounds.width, height: tableHeight)
        }
        let width = collectionView.bounds.width / 7 - 10
        return CGSize(width: width, height: width)
    }
}
class CalendarCell: UICollectionViewCell {
    static let identifier = "CalendarCell"
    private let dateLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.textAlignment = .center
        label.font = .systemFont(ofSize: 16, weight: .medium)
        return label
    }()
    private let eventDot: UIView = {
        let dot = UIView()
        dot.translatesAutoresizingMaskIntoConstraints = false
        dot.layer.cornerRadius = 4
        dot.backgroundColor = UIColor.init(hex: "#DB3171")  // You can customize the color for events
        dot.isHidden = true  // Initially hidden until there are events
        return dot
    }()
    override init(frame: CGRect) {
        super.init(frame: frame)
        contentView.addSubview(dateLabel)
        contentView.addSubview(eventDot)
        NSLayoutConstraint.activate([
            dateLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            dateLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            
            eventDot.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            eventDot.topAnchor.constraint(equalTo: dateLabel.bottomAnchor, constant: 4),
            eventDot.widthAnchor.constraint(equalToConstant: 8),  // Adjust the size of the dot
            eventDot.heightAnchor.constraint(equalToConstant: 8)
        ])
        contentView.backgroundColor = .systemGray6
        contentView.layer.cornerRadius = contentView.bounds.height / 2
        contentView.layer.masksToBounds = true
    }
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    func configure(with day: CalendarDay) {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone.current
        let dateFormatter = DateFormatter()
        dateFormatter.calendar = calendar
        dateFormatter.dateFormat = "d"
        dateFormatter.timeZone = calendar.timeZone
        dateFormatter.locale = Locale(identifier: "en_US_POSIX")

        eventDot.isHidden = true
        if day.isPadding {
            dateLabel.text = nil
            contentView.backgroundColor = .clear
        } else {
            if day.date.isPreviousDate(){
                dateLabel.textColor = .darkGray
            }else{
                dateLabel.textColor = day.isSelected ? .white : .label
            }

            dateLabel.text = dateFormatter.string(from: day.date)
            dateFormatter.dateFormat = "yyyy-MM-dd"
            
            let todayDate = dateFormatter.string(from: Date())
            let eventDate = dateFormatter.string(from: day.date)
            contentView.backgroundColor = day.isSelected ? UIColor.init(hex: "#DB3171") : .clear
            if todayDate == eventDate && !day.isSelected{
                dateLabel.textColor = UIColor.init(hex: "#DB3171")
                contentView.backgroundColor = UIColor.clear
            }
            // Show dot if there are events
            if !day.events.isEmpty {
                eventDot.isHidden = false
            } else {
                eventDot.isHidden = true
            }
        }
    }
}

class CalendarHeader: UICollectionReusableView {
    static let identifier = "CalendarHeader"
    
    private let titleLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = .systemFont(ofSize: 18, weight: .bold)
        return label
    }()
    
    private let weekdaysStackView: UIStackView = {
        let stackView = UIStackView()
        stackView.translatesAutoresizingMaskIntoConstraints = false
        stackView.axis = .horizontal
        stackView.distribution = .fillEqually
        return stackView
    }()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        addSubview(titleLabel)
        addSubview(weekdaysStackView)
        
        let weekdays = ["S", "M", "T", "W", "T", "F", "S"]
        for day in weekdays {
            let label = UILabel()
            label.text = day
            label.font = .systemFont(ofSize: 14, weight: .medium)
            label.textAlignment = .center
            weekdaysStackView.addArrangedSubview(label)
        }
        
        NSLayoutConstraint.activate([
            titleLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            titleLabel.topAnchor.constraint(equalTo: topAnchor, constant: 8),
            
            weekdaysStackView.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),
            weekdaysStackView.leadingAnchor.constraint(equalTo: leadingAnchor),
            weekdaysStackView.trailingAnchor.constraint(equalTo: trailingAnchor),
            weekdaysStackView.heightAnchor.constraint(equalToConstant: 20)
        ])
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func configure(with title: String) {
        titleLabel.text = title
    }
}
