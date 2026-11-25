//
//  EventChooseDateVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 07/02/25.
//

import UIKit

class EventChooseDateVC: UIViewController,FSCalendarDelegate, FSCalendarDataSource {
    @IBOutlet weak var lblMonth: SFProLabel!
    @IBOutlet weak var rightArrow: UIImageView!
    @IBOutlet weak var leftArrow: UIImageView!
    @IBOutlet weak var calendarHeight: NSLayoutConstraint!
    @IBOutlet weak var applyView: GlobalGradientView!
    @IBOutlet weak var lblEndDate: SFProLabel!
    @IBOutlet weak var lblStartDate: SFProLabel!
    @IBOutlet weak var imgClose: UIImageView!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var calendarView: UIView!
    var filterParam = [String:Any]()
    var itemTapped : (([String:Any]) -> Void)?
    var dateSelected = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        configView()
        // Do any additional setup after loading the view.
    }
    func setDateView(){
        let startDate = filterParam["start_date"] as? String ?? ""
        let endDate = filterParam["end_date"] as? String ?? ""
        if !startDate.isEmpty{
            lblStartDate.text = startDate
        }else{
            lblStartDate.text = "Add Start Date"
        }
        if !endDate.isEmpty{
            lblEndDate.text = endDate
        }else{
            lblEndDate.text = "Add End Date"
        }
    }
    func configView(){
        setDateView()
        imgClose.addTap { r in
            self.dismissVC()
        }
        applyView.addTap { r in
            if !self.dateSelected{
                Utils.showToast(message: "Please select the date range")
                return
            }
            self.filterParam["start_date"] = self.lblStartDate.accessibilityHint ?? ""
            self.filterParam["end_date"] = self.lblEndDate.accessibilityHint ?? ""
            self.filterParam["date_filter"] = 0
            self.itemTapped?(self.filterParam)
            self.dismissVC()
        }
        setupCalendar()
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        self.view.setAlphaBackground()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
        if let topView = lblStartDate.superview{
            topView.config(borderColor: UIColor.init(hex: "#4F4F4F"), borderWidth: 1.0, isRoundCorner: true)
        }
        if let topView = lblEndDate.superview{
            topView.config(borderColor: UIColor.init(hex: "#4F4F4F"), borderWidth: 1.0, isRoundCorner: true)
        }
        
    }
    func setupCalendar() {
        let fastisController = FastisController<FastisRange>() // Use FastisRange or Date based on your requirement
        let calendar = Calendar.current
        let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: Date()))!
        let endOfMonth = calendar.date(byAdding: .year, value: 100, to: startOfMonth)!
        fastisController.minimumDate = Date()
        fastisController.maximumDate = endOfMonth
        fastisController.allowToChooseNilDate = true
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        if let startDate = formatter.date(from: lblStartDate.text ?? ""),
           let endDate = formatter.date(from: lblEndDate.text ?? "") {
            fastisController.calendarView.selectDates(from: startDate, to: endDate, triggerSelectionDelegate: false, keepSelectionIfMultiSelectionAllowed: true)
            
            let formatter = DateFormatter()
            formatter.dateFormat = "dd-MM-yyyy"
            self.lblStartDate.text = formatter.string(from: startDate)
            self.lblEndDate.text = formatter.string(from: endDate)

            self.dateSelected = true
            formatter.dateFormat = "yyyy-MM-dd"
            self.lblStartDate.accessibilityHint = formatter.string(from: startDate)
            self.lblEndDate.accessibilityHint = formatter.string(from: endDate)
            self.filterParam["start_date"] = formatter.string(from: startDate)
            self.filterParam["end_date"] = formatter.string(from: endDate)
        }else{
            if let startDate = formatter.date(from: lblStartDate.text ?? "") {
                fastisController.calendarView.selectDates(from: startDate, to: startDate, triggerSelectionDelegate: false, keepSelectionIfMultiSelectionAllowed: true)

                let formatter = DateFormatter()
                formatter.dateFormat = "dd-MM-yyyy"
                self.lblStartDate.text = formatter.string(from: startDate)

                self.dateSelected = true
                formatter.dateFormat = "yyyy-MM-dd"
                self.lblStartDate.accessibilityHint = formatter.string(from: startDate)
                self.filterParam["start_date"] = formatter.string(from: startDate)

                // Handle missing end date case
                self.filterParam["end_date"] = nil
                self.lblEndDate.text = "Add End Date"
                self.lblEndDate.accessibilityHint = ""
                self.dateSelected = true
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: {
            if let startDate = formatter.date(from: self.lblStartDate.text ?? ""){
                fastisController.calendarView.scrollToDate(startDate, animateScroll: true)
            }
        })
        fastisController.fromTapped = { (date) in
            let formatter = DateFormatter()
            formatter.dateFormat = "dd-MM-yyyy"
            self.lblStartDate.text = formatter.string(from: date)
            self.lblEndDate.text = "Add End Date"
            self.filterParam["start_date"] = formatter.string(from: date)
            self.filterParam["end_date"] = ""
            self.dateSelected = true
            self.setDateView()
            formatter.dateFormat = "yyyy-MM-dd"
            self.lblStartDate.accessibilityHint = formatter.string(from: date)
            self.lblEndDate.accessibilityHint = ""
        }
        fastisController.dateTapped = { (data1,date2) in
            let formatter = DateFormatter()
            formatter.dateFormat = "dd-MM-yyyy"
            self.filterParam["start_date"] = formatter.string(from: data1)
            self.lblStartDate.text = formatter.string(from: data1)
            self.lblEndDate.text = formatter.string(from: date2)
            self.filterParam["end_date"] = formatter.string(from: date2)
            self.dateSelected = true
            self.setDateView()
            formatter.dateFormat = "yyyy-MM-dd"
            self.lblStartDate.accessibilityHint = formatter.string(from: data1)
            self.lblEndDate.accessibilityHint = formatter.string(from: date2)
        }
        fastisController.dateClearTapped = {
            self.filterParam["start_date"] = ""
            self.filterParam["end_date"] = ""
            self.lblStartDate.accessibilityHint = ""
            self.lblEndDate.accessibilityHint = ""
            self.dateSelected = false
            self.setDateView()
        }
        fastisController.cellUpdated = { value in
//            self.calendarHeight.constant = value
        }
        fastisController.monthUpdated = { value in
            self.lblMonth.text = value
        }
        leftArrow.addTap { r in
            fastisController.calendarView.scrollToSegment(.previous)
        }
        rightArrow.addTap { r in
            fastisController.calendarView.scrollToSegment(.next)
        }
        self.addChild(fastisController)
        fastisController.view.translatesAutoresizingMaskIntoConstraints = false
        self.calendarView.addSubview(fastisController.view)

        // Setup constraints
        NSLayoutConstraint.activate([
            fastisController.view.topAnchor.constraint(equalTo: self.calendarView.topAnchor),
            fastisController.view.leadingAnchor.constraint(equalTo: self.calendarView.leadingAnchor),
            fastisController.view.trailingAnchor.constraint(equalTo: self.calendarView.trailingAnchor),
            fastisController.view.bottomAnchor.constraint(equalTo: self.calendarView.bottomAnchor)
        ])

        fastisController.didMove(toParent: self)
    }
}
