//
//  TYCalendarView.swift
//  TabbyDemo
//
//  Created by Imcrinox Technologies Pvt Ltd on 20/12/23.
//

import UIKit
protocol TYCalenderDelegate : AnyObject{
    func didMonthChanged(monthYear: String , month: Int, year : Int)
    func didDateSelected(date: Date, stringDate: String)
}
extension TYCalenderDelegate{
    func didMonthChanged(monthYear: String , month: Int, year : Int){}
    func didDateSelected(date: Date, stringDate: String){}
}


class TYCalendarView: UIView {
//    var calenderModelList : [CalenderModel] = []
    @IBOutlet weak var imgRight: UIImageView!
    @IBOutlet weak var imgLeft: UIImageView!
    @IBOutlet weak var lblYear: UILabel!
    @IBOutlet weak var lblMonth: UILabel!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var contentView: UIView!
    weak var delegate : TYCalenderDelegate?
    let itemsPerRow: CGFloat = 7
    let sectionInsets = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
    
    var currentMonth = 0
    var currentYear = 0
    
    var calandarData = [TYCalendarModal](){
        didSet{
            self.collectionView.reloadData()
        }
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        initializeView()
        addSwipeGestures()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        initializeView()
        addSwipeGestures()
    }
    
    func initializeView() {
        Bundle.main.loadNibNamed("TYCalendarView", owner: self, options: nil)
        contentView.frame = self.bounds
        contentView.autoresizingMask = [.flexibleWidth,.flexibleHeight]
        contentView.translatesAutoresizingMaskIntoConstraints = true
        self.addSubview(contentView)
        
        
        collectionView.register(UINib.init(nibName: "TYCalendarMonthCell", bundle: nil), forCellWithReuseIdentifier: "TYCalendarMonthCell")

        collectionView.delegate = self
        collectionView.dataSource = self
        
        if let flowLayout = collectionView.collectionViewLayout as? UICollectionViewFlowLayout{
            flowLayout.sectionInset = .zero
            flowLayout.minimumInteritemSpacing = .zero
            flowLayout.minimumLineSpacing = 10
            flowLayout.scrollDirection = .vertical
        }
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(previousMonth(_:)))
        self.imgLeft.addGestureRecognizer(tapGesture)
        
        let tapGesture1 = UITapGestureRecognizer(target: self, action: #selector(nextMonth(_:)))
        self.imgRight.addGestureRecognizer(tapGesture1)
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MM"
        dateFormatter.locale = Locale.init(identifier: "en")
        currentMonth = Int(dateFormatter.string(from: Date())) ?? 0
        dateFormatter.dateFormat = "yyyy"
        currentYear = Int(dateFormatter.string(from: Date())) ?? 0
        dateFormatter.dateFormat = "MMMM yyyy"
        let monthYr  = dateFormatter.string(from: Date())
        delegate?.didMonthChanged(monthYear: monthYr, month: currentMonth, year: currentYear)
//        refreshMonths()
    }
    func addSwipeGestures() {
           let swipeLeft = UISwipeGestureRecognizer(target: self, action: #selector(handleSwipe(_:)))
           swipeLeft.direction = .left
//           self.collectionView.addGestureRecognizer(swipeLeft)

           let swipeRight = UISwipeGestureRecognizer(target: self, action: #selector(handleSwipe(_:)))
           swipeRight.direction = .right
//           self.collectionView.addGestureRecognizer(swipeRight)
       }

    @objc func handleSwipe(_ gesture: UISwipeGestureRecognizer) {
        switch gesture.direction {
        case .left:
            showNextMonthWithAnimation()
        case .right:
            showPreviousMonthWithAnimation()
        default:
            break
        }
    }
    func configNextYear(month:Int){
        currentMonth = month
        refreshMonths()
    }
    func showNextMonthWithAnimation() {
        currentMonth += 1
        refreshMonths()

        let indexPath = IndexPath(item: 0, section: 0)
        
        self.collectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: false)
//        UIView.transition(with: collectionView,
//                          duration: 0.5,
//                          options: .transitionCurlUp,
//                          animations: {
//                              self.collectionView.reloadData()
//                          },
//                          completion: { _ in
//                              self.collectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: false)
//                          })
    }

    func showPreviousMonthWithAnimation() {
        currentMonth -= 1
        refreshMonths()

        let indexPath = IndexPath(item: 0, section: 0)
        self.collectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: false)
//        UIView.transition(with: collectionView,
//                          duration: 0.5,
//                          options: .transitionCurlDown,
//                          animations: {
//                              self.collectionView.reloadData()
//                          },
//                          completion: { _ in
//                              self.collectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: false)
//                          })
    }

    
    @objc func previousMonth(_ sender: UITapGestureRecognizer) {
//        currentMonth -= 1
//        self.refreshMonths()
        showPreviousMonthWithAnimation()
    }
    @objc func nextMonth(_ sender: UITapGestureRecognizer) {
//        currentMonth += 1
//        self.refreshMonths()
        showNextMonthWithAnimation()
    }
    func refreshMonths(){
        self.calandarData = []
        let dateFormatter = DateFormatter()
        let monthDates = self.getAllDatesInMonth(year: currentYear, month: currentMonth)
        for index in 0..<monthDates.count{
            let modal = TYCalendarModal.init(fromDictionary: ["date" :  monthDates[index]])
            self.calandarData.append(modal)
        }
        let datee = monthDates.first!
        dateFormatter.dateFormat = "yyyy"
        dateFormatter.locale = Locale.init(identifier: "en")
    //    self.lblYear.text = dateFormatter.string(from: datee)
        let year = Int(dateFormatter.string(from: Date())) ?? 0
        
        dateFormatter.dateFormat = "MMM"
        dateFormatter.dateFormat = "MM"
        dateFormatter.locale = Locale.init(identifier: "en")
        let month = Int(dateFormatter.string(from: Date())) ?? 0
        
     //   self.lblMonth.text = dateFormatter.string(from: datee)
        dateFormatter.dateFormat = "MMMM yyyy"
         let monthYr  = dateFormatter.string(from: datee)
        
            delegate?.didMonthChanged(monthYear: monthYr, month: month, year: year)
        

        var weekday = Calendar.current.component(.weekday, from: monthDates[0]) - 1
        if weekday < 0{
            weekday = 6
        }
        for _ in 0..<weekday{
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "dd-MM-yyyy"
//            dateFormatter.locale = Locale.init(identifier: "en")
            if let getCacheDate = dateFormatter.date(from: "01-01-1000"){
                let modal = TYCalendarModal.init(fromDictionary: [String : Any]())
                modal.isCacheDate = true
                self.calandarData.insert(modal, at: 0)
            }
        }
    }
}
extension TYCalendarView:UICollectionViewDataSource, UICollectionViewDelegateFlowLayout{
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return calandarData.count
    }
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "TYCalendarMonthCell", for: indexPath) as! TYCalendarMonthCell
        let data = calandarData[indexPath.item]
        cell.lblDate.text = data.isCacheDate ? "" : data.dateStr
        cell.backgroundColor = .clear
        cell.lblDate.textColor = .black
        
        if data.date.convertToString("dd-MM-yyyy") == Date().convertToString("dd-MM-yyyy") {
            cell.bgView.backgroundColor = data.isCacheDate ? .clear : .black
            cell.lblDate.textColor = data.isCacheDate ? .black : .white
        } else {
            cell.bgView.backgroundColor = .clear
            cell.lblDate.textColor = .black
        }
        #if DEBUG
        cell.lblDate.text = data.date.convertToString("dd MM yyyy")
        #endif
        
//        for i in HomeViewModel.shared.calenderModelList{
//            if data.date.convertToString("dd-MM-yyyy") == i.date?.convertToDateString("yyyy-MM-dd", "dd-MM-yyyy"){
//                cell.countView.isHidden = i.appointment_count ?? 0 > 0  ? false : true
//                if i.appointment_count ?? 0 > 0 {
//                    cell.countView.isHidden = false
//                    cell.countView.backgroundColor = .systemGreen
//                }
//            }
//            
//        }
        
        if data.isCacheDate{
            cell.countView.backgroundColor = .clear
        }

       
//        if data.selected{
////            cell.backgroundColor = UIColor.init(red: 243.0/255.0, green: 5.0/255.0, blue: 68.0/255.0, alpha: 1.0)
//            cell.countView.isHidden = false
//            cell.bgView.backgroundColor = UIColor.black
//            cell.lblDate.textColor = .white
//        }else{
//            cell.countView.isHidden = true
//            cell.bgView.backgroundColor = .clear
//            cell.lblDate.textColor = .black
//        }
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        if calandarData[indexPath.item].isCacheDate{
            return
        }
        calandarData.forEach { modal in
            modal.selected = false
        }
        calandarData[indexPath.item].selected = true
//        print(calandarData[indexPath.item].dateStr)
//        print(calandarData[indexPath.item].date!)
        delegate?.didDateSelected(date: calandarData[indexPath.item].date!, stringDate: calandarData[indexPath.item].dateStr)
       
        self.collectionView.reloadData()
    }

    // MARK: - UICollectionViewDelegateFlowLayout
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let getWidth = collectionView.bounds.width / 7
//        let paddingSpace = sectionInsets.left * (itemsPerRow + 1)
//        let availableWidth = collectionView.bounds.width - paddingSpace
//        let widthPerItem = availableWidth / itemsPerRow
        return CGSize(width: getWidth, height: getWidth - 4)
    }
//    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
//        return sectionInsets
//    }
//    
//    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
//        return sectionInsets.left
//    }
    
}
extension TYCalendarView{
    func getAllDatesInMonth(year: Int, month: Int) -> [Date] {
        var dates: [Date] = []
        
        // Create a calendar instance
        var calendar = Calendar.current
                calendar.firstWeekday = 2
        // Define the date components
        var dateComponents = DateComponents()
        dateComponents.year = year
        dateComponents.month = month
        dateComponents.day = 1
        
        // Get the first day of the month
        guard let firstDayOfMonth = calendar.date(from: dateComponents) else {
            return dates
        }
        
        // Get the range of days in the month
        guard let range = calendar.range(of: .day, in: .month, for: firstDayOfMonth) else {
            return dates
        }
        
        // Generate all the dates in the month
        for day in range.lowerBound..<range.upperBound {
            dateComponents.day = day
            if let date = calendar.date(from: dateComponents) {
                dates.append(date)
            }
        }
        
        return dates
    }

}
class TYCalendarModal : NSObject{
    var date : Date!
    var dateStr : String!
    var isCacheDate : Bool!
    var selected : Bool!
    var isAppointment : Bool!
    init(fromDictionary dictionary: [String:Any]){
        date = dictionary["date"] as? Date ?? Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "d"
        
        //dateFormatter.locale = Locale.init(identifier: "en")
        //dateFormatter.timeZone = TimeZone(identifier: "UTC")
        dateStr = dateFormatter.string(from: date)
        isCacheDate = dictionary["isCacheDate"] as? Bool ?? false
        selected = dictionary["selected"] as? Bool ?? false
    }
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if date != nil{
            dictionary["date"] = date
        }
        if dateStr != nil{
            dictionary["date_str"] = dateStr
        }
        if isCacheDate != nil{
            dictionary["isCacheDate"] = isCacheDate
        }
        if selected != nil{
            dictionary["selected"] = selected
        }
        return dictionary
    }
}
extension Date {
    func convertToString(_ outputFormat: String) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.locale = Locale(identifier: "en")
        dateFormatter.dateFormat = outputFormat
        return dateFormatter.string(from: self)
    }
}
