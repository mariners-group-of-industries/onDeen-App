//
//  TSPickerVC.swift
//  BabyShop
//
//  Created by IMCRINOX on 08/01/21.
//

import UIKit

class TSPickerVC: UIViewController {
    @IBOutlet weak var imgInfo: UIImageView!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var pickerView: UIPickerView!
    @IBOutlet weak var btnOk: UIButton!
    @IBOutlet weak var btnCancel: UIButton!
    typealias pickerViewCompletionBlock  = (_ value: Int, _ isCancel:Bool) -> Void
    var pickerViewCompletion: pickerViewCompletionBlock?
    var pickerItems = [String]()
    var infoMessage = [String]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupView()
        // Do any additional setup after loading the view.
    }
    func setupView(){
        mainThread {
            self.view.endEditing(true)
        }
        bgView.setCornerRadius([.bottomLeft,.bottomRight], radius: 15.0)
        lblTitle.setCornerRadius([.topLeft,.topRight], radius: 15.0)
        btnOk.onTap {
            let exp = self.pickerView.selectedRow(inComponent: 0)
            self.pickerViewCompletion?(exp,true)
        }
        btnCancel.onTap {
            let exp = self.pickerView.selectedRow(inComponent: 0)
            self.pickerViewCompletion?(exp,false)
        }
        imgInfo.addTap { r in
            if let vc = topViewController(){
                let exp = self.pickerView.selectedRow(inComponent: 0)
                Utils.showToast(message: self.infoMessage[exp])
            }
        }
    }
    func setupPicker(title:String,info:[String] = [String](),selectedItem:String,pickerValues:[String]){
        DispatchQueue.main.async { [self] in
            self.infoMessage = info
            lblTitle.text = title
            pickerItems = pickerValues
            self.pickerView.reloadAllComponents()
            for index in 0..<self.pickerItems.count{
                if self.pickerItems[index] == selectedItem{
                    self.pickerView.selectRow(index, inComponent: 0, animated: true)
                    break
                }
            }
            if lblTitle.text == "Select journey level"{
                imgInfo.isHidden = false
            }
        }
    }
    override func viewDidAppear(_ animated: Bool) {
        setupView()
    }
}
extension TSPickerVC:UIPickerViewDataSource,UIPickerViewDelegate{
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }

    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return pickerItems.count
    }

    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        return pickerItems[row]
    }
    func pickerView(_ pickerView: UIPickerView, viewForRow row: Int, forComponent component: Int, reusing view: UIView?) -> UIView {
        var pickerLabel : UILabel
        if let label = view as? UILabel {
            pickerLabel = label
        } else {
            pickerLabel = UILabel()
            pickerLabel.textColor = UIColor.black
            if  pickerLabel.effectiveUserInterfaceLayoutDirection == .rightToLeft {
                pickerLabel.textAlignment = NSTextAlignment.center
            }
        }
        pickerLabel.text = pickerItems[row]
        pickerLabel.sizeToFit()
        return pickerLabel
    }
}
extension UIViewController{
    func showPicker(title:String,info:[String] = [String](),selectedItem:String,pickerValues:[String], result: @escaping (_ cancel: Bool, _ value:Int) -> ()){
        self.view.endEditing(true)
        let vc = TSPickerVC(nibName: "TSPickerVC", bundle: nil)
        vc.setupPicker(title: title,info:info, selectedItem: selectedItem, pickerValues: pickerValues)
        vc.pickerViewCompletion = { (value,isCancel) in
            vc.dismiss(animated: true, completion: nil)
            result(isCancel,value)
        }
        vc.modalPresentationStyle = .overFullScreen
        self.present(vc, animated: true, completion: nil)
    }
}
