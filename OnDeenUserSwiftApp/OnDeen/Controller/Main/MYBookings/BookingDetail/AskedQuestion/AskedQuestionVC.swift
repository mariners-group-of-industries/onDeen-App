//
//  AskedQuestionVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit
import IQKeyboardManagerSwift

class AskedQuestionVC: UIViewController {
    @IBOutlet weak var fieldQuestion: UITextField!
    @IBOutlet weak var imgSend: UIImageView!
    @IBOutlet weak var footerView: UIView!
    @IBOutlet weak var moreView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    var eventQuestions = [EventQuestionsResponse](){
        didSet{
            self.tableView.refreshTable()
        }
    }
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var noteTapped : (([String:Any]) -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        NotificationCenter.default.removeObserver(self, name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.removeObserver(self, name: UIResponder.keyboardWillHideNotification, object: nil)
    }
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillShow), name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillHide), name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    @objc func keyboardWillShow(notification: NSNotification) {
        if let topVC = topViewController(){
            if topVC == self{
                if let keyboardFrame = (notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue {
                    UIView.animate(withDuration: 0.3) {
                        if let sup = self.footerView.superview{
                            sup.transform = CGAffineTransform(translationX: 0, y: -keyboardFrame.height)
                        }
                    }
                }
            }
        }
        
    }

    @objc func keyboardWillHide(notification: NSNotification) {
        if let topVC = topViewController(){
            if topVC == self{
                UIView.animate(withDuration: 0.3) {
                    if let sup = self.footerView.superview{
                        sup.transform = .identity
                    }
                }
            }
        }
    }

    func config(){
        fieldQuestion.delegate = self
        tableView.registerNIBs(AskedQuestionCell.self)
        backView.addTap { r in
            self.dismissVC()
        }
        imgSend.addTap { r in
            self.triggerAddQuestion()
        }
        triggerGetAnswers()
    }
    func triggerAddQuestion(){
        let note = fieldQuestion.text ?? ""
        if note.isEmpty{
            Utils.showToast(message: "Pleaes enter the question")
            return
        }
        self.view.endEditing(true)
        let param = ["event_id":eventDetailData.id ?? 0,
                     "question":note] as [String : Any]
        EventRequest.instance.triggerAddQuestion(param: param) { response, status in
            if status{
                self.fieldQuestion.text = ""
                self.triggerGetAnswers()
                self.tableView.refreshTable()
                self.noteTapped?(param)
            }
            Utils.showToast(message: response.message)
        }
    }
    func triggerGetAnswers(){
        EventRequest.instance.triggerGetQuestionAnsewrs(id: eventDetailData.id) { response, status in
            self.eventQuestions = response
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        footerView.config(cornerRadius: 24.0, borderColor: UIColor.init(hex: "#DDDDDD"), borderWidth: 1.0)
    }
}
extension AskedQuestionVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return self.eventQuestions.count
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        let data = eventQuestions[section]
        return data.answer.isEmpty ? 1 : 2
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(AskedQuestionCell.self, at: indexPath)
        let data = eventQuestions[indexPath.section]
        cell.lblSeperator.isHidden = false
        if indexPath.row > 0{
            let name = data.organizationName
            cell.loadComments(index: indexPath.section)
            cell.lblTitle.text = name
            cell.lblDate.text = "\(data.createdOn.convertServerDateFormat(toFormat: "dd MMM yyyy, hh:mm a", timeZone: data.time_zone))"
//            cell.lblDate.text = data.createdOn.convertFromDateFormat(fromFormat: "yyyy-MM-dd HH:mm:ss", toFormat: "dd MMM yyyy, hh:mm a", timeZone: data.time_zone)
            cell.lblQuestion.html2String(string: data.answer,customFont: Fonts.SFProRegular(14.0),color:UIColor.init(hex: "#3A3A3A"))
            cell.imgView.loadAsyncImageWithPlaceholder(loadURL: data.organizerProfileImage, placeHolder: "ic_profile_crop")
            cell.imgLeading.constant = 48.0
        }else{
            let name = data.userFirstName + " " + data.userLastName
            cell.loadComments(index: indexPath.section)
            cell.lblTitle.text = name
            cell.lblDate.text = "\(data.createdOn.convertServerDateFormat(toFormat: "dd MMM yyyy, hh:mm a", timeZone: data.time_zone))"
//            cell.lblDate.text = data.createdOn.convertFromDateFormat(fromFormat: "yyyy-MM-dd HH:mm:ss", toFormat: "dd MMM yyyy, hh:mm a", timeZone: data.time_zone)
            cell.lblQuestion.text = data.question
            cell.imgView.loadAsyncImageWithPlaceholder(loadURL: data.userProfileImage, placeHolder: "ic_profile_crop")
            cell.imgLeading.constant = 24.0
            
            let data = eventQuestions[indexPath.section]
            if !data.answer.isEmpty{
                cell.lblSeperator.isHidden = true
            }
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
    }
}

extension AskedQuestionVC:UITextFieldDelegate{
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder() // Dismiss the keyboard
        return true
    }
}
