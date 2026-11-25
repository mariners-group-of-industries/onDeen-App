//
//  TSDatePicker.swift
//  BabyShop
//
//  Created by Kavin on 03/12/20.
//

import UIKit

class TSDatePicker: UIViewController {
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var datePicker: UIDatePicker!
    @IBOutlet weak var btnOk: UIButton!
    @IBOutlet weak var btnCancel: UIButton!
    typealias pickerCompletionBlock  = (_ date: Date, _ isCancel:Bool) -> Void
    var pickerCompletion: pickerCompletionBlock?

    override func viewDidLoad() {
        super.viewDidLoad()
        setupView()
    }
    func setupView(){
        datePicker.locale = Locale.init(identifier: "en")
        bgView.setCornerRadius([.bottomLeft,.bottomRight], radius: 15.0)
        lblTitle.setCornerRadius([.topLeft,.topRight], radius: 15.0)
        btnOk.onTap {
            self.pickerCompletion?(self.datePicker.date,true)
        }
        btnCancel.onTap {
            self.pickerCompletion?(self.datePicker.date,false)
        }
    }
    func setupPicker(title:String,selectedDate:Date,minimumDate:Date,maxDate:Date,pickerMode:UIDatePicker.Mode){
        DispatchQueue.main.async { [self] in
            lblTitle.text = title
            datePicker.date = selectedDate
            datePicker.datePickerMode = pickerMode
            datePicker.minimumDate = minimumDate
            datePicker.maximumDate = maxDate
            if pickerMode == .time{
                datePicker.minuteInterval = 15
            }
        }
    }
    override func viewDidAppear(_ animated: Bool) {
        setupView()
    }
}
extension UIViewController{
    func showDatePicker(title:String,selectedDate:Date,mode:UIDatePicker.Mode,minDate:Date,maxDate:Date, result: @escaping (_ cancel: Bool, _ date:Date) -> ()){
        let vc = TSDatePicker(nibName: "TSDatePicker", bundle: nil)
        vc.setupPicker(title: title, selectedDate: selectedDate, minimumDate: minDate, maxDate: maxDate, pickerMode: mode)
        vc.pickerCompletion = { (date,isCancel) in
            vc.dismiss(animated: true, completion: nil)
            result(isCancel,date)
        }
        vc.modalPresentationStyle = .overFullScreen
        self.present(vc, animated: true, completion: nil)
    }
}
enum DateRoundingType {
    case round
    case ceil
    case floor
}
extension Date {
    func rounded(minutes: TimeInterval, rounding: DateRoundingType = .round) -> Date {
        return rounded(seconds: minutes * 60, rounding: rounding)
    }
    func rounded(seconds: TimeInterval, rounding: DateRoundingType = .round) -> Date {
        var roundedInterval: TimeInterval = 0
        switch rounding  {
        case .round:
            roundedInterval = (timeIntervalSinceReferenceDate / seconds).rounded() * seconds
        case .ceil:
            roundedInterval = ceil(timeIntervalSinceReferenceDate / seconds) * seconds
        case .floor:
            roundedInterval = floor(timeIntervalSinceReferenceDate / seconds) * seconds
        }
        return Date(timeIntervalSinceReferenceDate: roundedInterval)
    }
}
