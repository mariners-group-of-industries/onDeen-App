//
//  MakePaymentVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 23/12/24.
//

import UIKit
import PassKit
import Stripe

class MakePaymentVC: UIViewController, STPAuthenticationContext {
    func authenticationPresentingViewController() -> UIViewController {
        return self
    }
    
    @IBOutlet weak var applyPayBtn: PKPaymentButton!
    @IBOutlet weak var lblPayNow: SFProLabel!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var payNow: UIView!
    var selectedDateTimeId = ""
    var calenderDateList: [DateModel] = []
    var payTypes = [PaymentTypes]()
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var membershipData = MembershipListMembership.init(fromDictionary: [String : Any]())
    var isFromRegistration = false
    var selectedQuantity = 0
    var makePaymentTableSectionList: [MakePaymentTableSectionEnum] = []
    var finalPay = 0.0
    var bookedEventData = [String:Any]()
    var applePayButton = PKPaymentButton(paymentButtonType: .book, paymentButtonStyle: .black)

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        setupApplePayButton()
        payTypes.append(PaymentTypes.init(title: "Credit/debit card".localized, selected: true, type: 0))
        payTypes.append(PaymentTypes.init(title: "Apple Pay".localized, selected: false, type: 1))
        tableView.registerNIBs(PaymentCell.self,PaymentBookingCell.self,BookingMaterialHeaderCell.self, SelectTicketTableViewCell.self, SelectDateTableViewCell.self,PaymentTicketCell.self)
        calenderDateList = eventDetailData.dates ?? []
        if let selectedDate = calenderDateList.first(where: { $0.selected}){
        }else{
            if calenderDateList.count > 0{
                calenderDateList[0].selected = true
            }
        }
        if eventDetailData.dates.count > 0{
//            selectedQuantity = 1
        }
        getMakePaymentSectionList()
        tableView.reloadData()
        backView.addTap { r in
            if self.isFromRegistration{
                self.dismissVC()
                return
            }
            for item in self.eventDetailData.tickets{
                if item.id != 10000{
                    item.quantity = 0
                }
            }
            self.popVC()
        }
        payNow.addTap { r in
            if self.membershipData.id > 0{
                self.purchaseMembership()
            }else{
                self.triggerBookEvent()
            }
        }
        self.lblPrice.text = membershipData.id > 0 ? membershipData.price : self.eventDetailData.price
        finalPay = membershipData.id > 0 ? membershipData.originalPrice.toDouble() : self.eventDetailData.originalPrice.toDouble()
    }
    func setupApplePayButton() {
        applePayButton.translatesAutoresizingMaskIntoConstraints = false
        applePayButton.addTarget(self, action: #selector(applePayButtonTapped), for: .touchUpInside)

        payNow.addSubview(applePayButton)

        // Constraints to make it fill the containerView
        NSLayoutConstraint.activate([
            applePayButton.leadingAnchor.constraint(equalTo: payNow.leadingAnchor),
            applePayButton.trailingAnchor.constraint(equalTo: payNow.trailingAnchor),
            applePayButton.topAnchor.constraint(equalTo: payNow.topAnchor),
            applePayButton.bottomAnchor.constraint(equalTo: payNow.bottomAnchor)
        ])
        applePayButton.isHidden = true
    }

    @objc func applePayButtonTapped() {
        if self.membershipData.id > 0{
            self.purchaseMembership()
        }else{
            self.triggerBookEvent()
        }
    }
    override func viewDidAppear(_ animated: Bool) {
        self.tableView.refreshTable()
    }
    func refreshPrice(){
        finalPay = 0.0
        if membershipData.id == 0 {
            var price = eventDetailData.actualPrice.toDouble() //* Double(selectedQuantity)
            if eventDetailData.tickets.count == 1{
                let id = eventDetailData.tickets[0].id
                if id == 10000{
                    price = 0.0
                }
            }
            price += eventDetailData.tickets
                .filter { $0.quantity > 0 }
                .reduce(0) { $0 + Double($1.quantity) * $1.originalPrice.toDouble() }
            if price == 0.0{
                price = eventDetailData.originalPrice.toDouble() * Double(selectedQuantity)
                if selectedQuantity == 0{
                    price = eventDetailData.originalPrice.toDouble()
                }
            }
            finalPay = price
            if finalPay == 0.0{
                lblPrice.text = "FREE".localized
            }else{
                let pay = String(format: "%.2f", price).formatAmount()
                lblPrice.text = "\(currency)\(pay)"
            }
        }
    }
    func triggerBookEvent(){
        var request: [String: Any] = ["event_id" : eventDetailData.id ?? 0]
        if eventDetailData.categoryId == 3 || eventDetailData.categoryId == 4 || eventDetailData.categoryId == 9{
            if selectedDateTimeId.isEmpty{
                Utils.showToast(message: "Please select the slot")
                return
            }
            request["date_time_id"] = selectedDateTimeId
        }
        if eventDetailData.tickets.count == 1{
            if eventDetailData.dates.count == 0{
//                if eventDetailData.tickets[0].id == 10000{
//                    eventDetailData.tickets[0].quantity = 1
//                }else{
                    eventDetailData.tickets[0].quantity = selectedQuantity
//                }
            }
            if eventDetailData.categoryId == 3 || eventDetailData.categoryId == 4 || eventDetailData.categoryId == 9 {
                eventDetailData.tickets[0].quantity = selectedQuantity
            }
            let id = eventDetailData.tickets[0].id
            if id == 10000{
                if eventDetailData.tickets[0].quantity == 0{
                    Utils.showToast(message: "Please add the ticket")
                    return
                }
                request["quantity"] = eventDetailData.tickets[0].quantity
                triggerAddEvent(request: request)
                return
            }
        }
        var tickets = [[String:Any]]()
        var isTicketSelected = false
        for item in eventDetailData.tickets{
            if item.quantity > 0{
                isTicketSelected = true
            }
            if item.quantity > 0{
                tickets.append(["quantity":item.quantity,"id":item.id ?? 0])
            }
        }
        if !isTicketSelected{
            Utils.showToast(message: "Please add the ticket")
            return
        }
        if tickets.count > 0{
            request["tickets"] = tickets
        }
        triggerAddEvent(request: request)
    }
    func triggerAddEvent(request:[String:Any]){
        print(JSON(request))
        EventRequest.instance.triggerBookEvent(param: request) { response, status in
           self.bookedEventData = response
           let modal = CommonModal.init(fromDictionary: response)
           if modal.status{
               if self.finalPay > 0.0{
                   if let responseData = response["response"] as? [String:Any]{
                       let clientSecret = responseData["client_secret"] as? String ?? ""
                       if !clientSecret.isEmpty{
                           let payModes = self.payTypes.filter { $0.selected == true }
                           if payModes.count > 0{
                               if payModes[0].type == 1{
                                   self.startApplePay()
                                   return
                               }
                           }
                           if let vc: PaymentViewController = self.getController(from: .main) {
                               vc.paymentInfo = response
                               self.presentVC(vc: vc)
                           }
                          return
                       }
                   }
                   self.showSimpleAlert(withTitle: "Missing: Client id", vc: self, type: 0)
                   return
               }
               if let vc: EventSuccessVC = self.getController(from: .main) {
                   vc.eventInfo = response
                   self.presentVC(vc: vc)
               }
           }else{
               Utils.showToast(message: modal.response.message)
           }
       }
    }
    func purchaseMembership(){
        MembershipRequest.instance.triggerAddMembership(id: membershipData.id) { data, status in
            if status{
                let modal = CommonModal.init(fromDictionary: data)
                self.showTSAlert(modal.response.message, "Ok", "", 0) { isCancelled, tag in
                    UserDefaults.standard.removeObject(forKey: "membershipCount")
                    UserDefaults.standard.synchronize()
                    if isEventLogin{
                        isEventLogin = false
                        self.view.window?.rootViewController?.dismiss(animated: true, completion: nil)
                        return
                    }
                    self.setRootController(board: .main, identifier: .homeVC)
                }
            }
        }
    }
}
extension MakePaymentVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return makePaymentTableSectionList.count
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        let sectionTitle = makePaymentTableSectionList[section]
        switch sectionTitle{
        case .bookingDetail:
           return 1
        case .selectTickets:
            return 1
        case .selectDate:
            return 1
        case .selectTimeSlot:
            return 1
        case .paymentMethod:
            var eventId = 0
            if eventDetailData.originalPrice.toDouble() == 0.0 && self.membershipData.id == 0 && eventDetailData.tickets.count == 0{
                self.lblPayNow.text = "Book Ticket"
                return 0
            }
            if finalPay == 0.0{
                self.lblPayNow.text = "Book Ticket"
                return 0
            }
            if eventDetailData.tickets.count > 0{
                let items = eventDetailData.tickets.filter { $0.quantity > 0 }
                if items.count == 0{
                    return 0
                }
            }
            return payTypes.count
        case .tickets:
            return eventDetailData.tickets.count
        }
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let sectionTitle = makePaymentTableSectionList[indexPath.section]
        switch sectionTitle{
            
        case .bookingDetail:
            let cell = tableView.configureCell(PaymentBookingCell.self, at: indexPath)
            if membershipData.id > 0{
                cell.configMembership(data:membershipData)
            }else{
                cell.config(data:eventDetailData)
            }
            return cell
        case .selectTickets:
            let cell = tableView.configureCell(SelectTicketTableViewCell.self, at: indexPath)
            cell.lblDuration.text = "Duration \(self.eventDetailData.duration ?? "") hours"
            cell.lblDuration.isHidden = self.eventDetailData.duration.toDouble() == 0.0
            cell.labelTicketCount.text = "\(self.selectedQuantity)"
            cell.imageMinus.tag = indexPath.row
            cell.imagePlus.tag = indexPath.row
            cell.imageMinus.addTap { r in
                if self.selectedQuantity > 1{
                    self.selectedQuantity -= 1
                    if self.eventDetailData.tickets.count == 1{
                        self.eventDetailData.tickets[0].quantity = self.selectedQuantity
                    }
                    cell.labelTicketCount.text = "\(self.selectedQuantity)"
                    self.refreshPrice()
                    let timeModel = self.getTimeSlots()
                    timeModel.forEach{$0.isSelected = false}
                    tableView.refreshTable()
                }
            }
            cell.imagePlus.addTap { r in
                if !self.checkQuantityPerUser(){
                    return
                }
                self.selectedQuantity += 1
                if self.eventDetailData.tickets.count == 1{
                    self.eventDetailData.tickets[0].quantity = self.selectedQuantity
                }
                cell.labelTicketCount.text = "\(self.selectedQuantity)"
                self.refreshPrice()
                let timeModel = self.getTimeSlots()
                timeModel.forEach{$0.isSelected = false}
                tableView.refreshTable()
            }
            cell.lblAddText.isHidden = true
            if eventDetailData.tickets.count > 0{
                let items = eventDetailData.tickets.filter { $0.quantity > 0 }
                if items.count > 0{
                    if items[0].id == 10000{
                        cell.lblDuration.text = items[0].duration
                        cell.lblDuration.isHidden = false
                        cell.lblHeaderTitle.text = items[0].other
                        cell.lblAddText.isHidden = false
                        cell.lblAddText.text = "Add".localized
                        cell.lblAddText.backgroundColor = UIColor(named: "3E146F")

                        if items[0].remaining == 0{
                            cell.lblAddText.text = "Sold out".localized
                            cell.lblAddText.backgroundColor = UIColor.red
                        }
                    }
                }
            }
            return cell
        case .selectDate:
            let cell = tableView.configureCell(SelectDateTableViewCell.self, at: indexPath)
            cell.labelTitle.text = "SELECT A DATE"
            cell.configure(for: calenderDateList)
            cell.itemTapped = { [weak self] index in
                self?.selectedDateTimeId = ""
                self?.didSelectDate(at: index)
            }
            return cell
        case .selectTimeSlot:
            let cell = tableView.configureCell(SelectDateTableViewCell.self, at: indexPath)
                 cell.labelTitle.text = "CHOOSE A SLOT"
                 let timeModel  = getTimeSlots()
            cell.configure(for: timeModel, selectedQuantity: self.selectedQuantity,timeZone:eventDetailData.time_zone)
                 cell.itemTapped = { index in
                     timeModel.forEach{ $0.isSelected = false}
                     timeModel[index].isSelected = true
                     self.selectedDateTimeId = "\(timeModel[index].id ?? 0)"
                     cell.configure(for: timeModel, selectedQuantity: self.selectedQuantity, timeZone: self.eventDetailData.time_zone)
                 }
                 return cell
        case .paymentMethod:
            let cell = tableView.configureCell(PaymentCell.self, at: indexPath)
            if self.payTypes.count > indexPath.row{
                cell.cellConfig(data: self.payTypes[indexPath.row])
            }
            return cell
        case .tickets:
            let cell = tableView.configureCell(PaymentTicketCell.self, at: indexPath)
            cell.config(data:eventDetailData.tickets[indexPath.row])
            cell.lblAddText.tag = indexPath.row
            cell.lblAdd.tag = indexPath.row
            cell.lblRemove.tag = indexPath.row
            cell.lblAddText.addTap { r in
                self.updateQuantity(index: r.view?.tag ?? 0, type: 1)
            }
            cell.lblAdd.addTap { r in
                self.updateQuantity(index: r.view?.tag ?? 0, type: 1)
            }
            cell.lblRemove.addTap { r in
                self.updateQuantity(index: r.view?.tag ?? 0, type: 2)
            }
            
//            cell.lblAddText.isHidden = true
//            if eventDetailData.tickets.count > 0{
//                let items = eventDetailData.tickets.filter { $0.quantity > 0 }
//                if items.count > 0{
//                    if items[0].id == 10000{
//                        cell.lblDuration.text = items[0].duration
//                        cell.lblDuration.isHidden = false
//                        cell.lblHeaderTitle.text = items[0].other
//                        cell.lblAddText.isHidden = false
//                        cell.lblAddText.text = "Add".localized
//                        cell.lblAddText.backgroundColor = UIColor(named: "3E146F")
//
//                        if items[0].remaining == 0{
//                            cell.lblAddText.text = "Sold out".localized
//                            cell.lblAddText.backgroundColor = UIColor.red
//                        }
//                    }
//                }
//            }

            return cell
        }
    }
    func checkQuantityPerUser() -> Bool{
        var addedQuantities = 0
        let quantityUser = eventDetailData.quantity_per_user
        for item in eventDetailData.tickets{
            addedQuantities += item.quantity
        }
        if addedQuantities == quantityUser{
            Utils.showToast(message: "Max quantity per user is \(quantityUser ?? 0) only.")
            return false
        }
        return true
    }
    func updateQuantity(index:Int,type:Int){
        if eventDetailData.tickets.count == 0{
            return
        }
        if type == 1{
            if !self.checkQuantityPerUser(){
                return
            }
        }
        let model = eventDetailData.tickets[index]
        if model.status != 1{
            return
        }
        if model.remaining <= 0{
            return
        }
        if model.quantity >= model.remaining && type == 1{
            return
        }
        if type == 1{
            eventDetailData.tickets[index].quantity += 1
        }else if type == 2{
            eventDetailData.tickets[index].quantity -= 1
        }
        selectedQuantity = eventDetailData.tickets[index].quantity
        self.refreshPrice()
        tableView.reloadData()
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let sectionTitle = makePaymentTableSectionList[indexPath.section]
        if sectionTitle == .paymentMethod{
            for item in payTypes{
                item.selected = false
            }
            self.refreshBookButton(type: payTypes[indexPath.row].type ?? 0)
            payTypes[indexPath.row].selected = true
            tableView.refreshTable()
        }
    }
    func refreshBookButton(type:Int){
        applePayButton.isHidden = type != 1
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingMaterialHeaderCell.self)
        let sectionTitle = makePaymentTableSectionList[section]
        if sectionTitle == .bookingDetail{
            cell.configHeader(title: "BOOKING FOR".localized, subTitle: "")
        }else if sectionTitle == .paymentMethod{
            cell.configHeader(title: "PAYMENT METHOD", subTitle: "")
            if eventDetailData.originalPrice.toDouble() == 0.0 && self.membershipData.id == 0 && eventDetailData.tickets.count == 0{
                cell.configHeader(title: "", subTitle: "")
            }
        }else if sectionTitle == .tickets{
            cell.configHeader(title: "ADD YOUR TICKETS".localized, subTitle: "")
        }
        cell.bgView.backgroundColor = UIColor.init(hex: "#F9F6FD")
        return cell
    }
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        let sectionTitle = makePaymentTableSectionList[section]
        if sectionTitle == .bookingDetail || sectionTitle == .paymentMethod || sectionTitle == .tickets{
            let numberOfRows = self.tableView(tableView, numberOfRowsInSection: section)
            return numberOfRows == 0 ? 0.1 : UITableView.automaticDimension
        }
        return 0.01
    }
    
}
//MARK: - MakePaymentTableSection
extension MakePaymentVC{
    enum MakePaymentTableSectionEnum{
        case bookingDetail
        case selectTickets
        case selectDate
        case selectTimeSlot
        case paymentMethod
        case tickets
    }
    private func getMakePaymentSectionList(){
        makePaymentTableSectionList = []
        if membershipData.id > 0{
            makePaymentTableSectionList.append(.bookingDetail)
            makePaymentTableSectionList.append(.paymentMethod)
            return
        }
        if eventDetailData.categoryId == 3 || eventDetailData.categoryId == 4 || eventDetailData.categoryId == 9 {
            makePaymentTableSectionList.append(.bookingDetail)
            if eventDetailData.tickets.count == 0{
                makePaymentTableSectionList.append(.selectTickets)
            }else{
                makePaymentTableSectionList.append(.tickets)
            }
            makePaymentTableSectionList.append(.selectDate)
            makePaymentTableSectionList.append(.selectTimeSlot)
            makePaymentTableSectionList.append(.paymentMethod)
        }else{
            makePaymentTableSectionList.append(.bookingDetail)
            makePaymentTableSectionList.append(.tickets)
            makePaymentTableSectionList.append(.paymentMethod)
        }
        delay(0.5, function: {
            self.tableView.reloadData()
        })
        
    }
    func getWeekDates(startDate: Date, endDate: Date) {
        var dates = [DateListResponse]()
        let calendar = Calendar.current
        // Calculate the number of days between startDate and endDate
        let daysCount = calendar.dateComponents([.day], from: startDate, to: endDate).day ?? 0
        for i in 0...daysCount + 1 {
            if let nextDate = calendar.date(byAdding: .day, value: i, to: startDate) {
                let formatter = DateFormatter()
               let language = LocalizationSystem.sharedInstance.getLanguage()
                formatter.locale = Locale(identifier: language)
                formatter.dateFormat = "dd"
                let getDate = formatter.string(from: nextDate)
                formatter.dateFormat = "EEE"
                let getDay = formatter.string(from: nextDate)
                dates.append(DateListResponse.init(selected: false, date: nextDate, dateTitle: getDate, dayTitle: getDay, id: i))
            }
        }
    }
    private func didSelectDate(at index: Int){
        calenderDateList.forEach{$0.selected = false}
        calenderDateList[index].selected = true
        self.tableView.reloadData()
    }
    
    private func getTimeSlots() -> [TimeModel]{
        if let selectedDate = calenderDateList.first(where: { $0.selected}){
            return selectedDate.times
        }
        return []
    }
}
//MARK:- APPLE PAY
extension MakePaymentVC{
    
    private func startApplePay() {
        let totalAmount = NSDecimalNumber(string: self.finalPay.toString())
        // 1. Check if Apple Pay is available
        if !PKPaymentAuthorizationViewController.canMakePayments(usingNetworks: [.visa, .masterCard, .amex]) {
            Utils.showToast(message: "Apple Pay not available on this device or no card setup.")
            return
        }
//        // 2. Set up payment request
//        let request = PKPaymentRequest()
//        request.merchantIdentifier = "merchant.com.ondeen.user"
//        request.countryCode = "GB"  // 🇬🇧 UK
//        request.currencyCode = "GBP" // Pounds
//        request.supportedNetworks = [.visa, .masterCard, .amex]
//        request.merchantCapabilities = .capability3DS
//
//        // 3. Add payment summary items
//        request.paymentSummaryItems = [
//            PKPaymentSummaryItem(label: self.eventDetailData.title, amount: totalAmount)
//        ]
//        // 4. Show Apple Pay sheet
//        if let paymentVC = PKPaymentAuthorizationViewController(paymentRequest: request) {
//            paymentVC.delegate = self
//            present(paymentVC, animated: true, completion: nil)
//        } else {
//            Utils.showToast(message: "Unable to present Apple Pay authorization.")
//                
        let paymentRequest = StripeAPI.paymentRequest(
            withMerchantIdentifier: "merchant.com.ondeen.user", // from Apple Developer portal
            country: "GB",
            currency: "GBP"
        )

        paymentRequest.paymentSummaryItems = [
            PKPaymentSummaryItem(label: self.eventDetailData.title, amount: totalAmount)
        ]

        if StripeAPI.canSubmitPaymentRequest(paymentRequest),
           let paymentVC = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) {
            paymentVC.delegate = self
            present(paymentVC, animated: true, completion: nil)
        } else {
            print("Apple Pay not supported")
        }
    }
}
extension MakePaymentVC: PKPaymentAuthorizationViewControllerDelegate {
//    func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController,
//                                             didAuthorizePayment payment: PKPayment,
//                                             handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
//
//        // 5. Convert Apple Pay token to Stripe token
//        STPAPIClient.shared.createPaymentMethod(with: payment) { paymentMethod, error in
//            var stripeId = ""
//            if let method = paymentMethod{
//                stripeId = method.stripeId
//            }
//            if let error = error {
//                Utils.showToast(message: "Failed to create PaymentMethod: \(error.localizedDescription)")
//                self.triggerCheckPayment(intentId: stripeId, paymentStatus: 2)
//
//                print("❌ Failed to create PaymentMethod: \(error.localizedDescription)")
//                completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
//                return
//            }
//            
//            // 6. Send paymentMethod?.stripeId to your backend to confirm PaymentIntent
//            print("✅ Got Stripe PaymentMethod ID: \(stripeId)")
//            self.triggerCheckPayment(intentId: paymentMethod?.stripeId ?? "", paymentStatus: 1)
//            // (Here you would call your backend API)
//            // self.confirmPaymentIntent(paymentMethodId: paymentMethod?.stripeId ?? "")
//            
//            completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
//        }
//    }
    func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController,
                                            didAuthorizePayment payment: PKPayment,
                                            handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
        var clientSecret = ""
        if let response = self.bookedEventData["response"] as? [String:Any]{
            clientSecret = response["client_secret"] as? String ?? ""
        }
        print(clientSecret)
        // 1. Convert PKPayment to PaymentMethod
        STPAPIClient.shared.createPaymentMethod(with: payment) { paymentMethod, error in
            if let error = error {
                completion(PKPaymentAuthorizationResult(status: .failure, errors: [error]))
                return
            }
            guard let paymentMethod = paymentMethod else {
                completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                return
            }

            var clientSecretId = ""
            if let response = self.bookedEventData["response"] as? [String:Any]{
                clientSecretId = response["client_secret"] as? String ?? ""
            }
            print("-----")
            print(clientSecretId)
            print("-----")

            // 2. Attach PaymentMethod to PaymentIntent
            let paymentIntentParams = STPPaymentIntentParams(clientSecret: clientSecretId)
            paymentIntentParams.paymentMethodId = paymentMethod.stripeId

            // 3. Confirm with Stripe
            STPPaymentHandler.shared().confirmPayment(paymentIntentParams, with: self) { status, _, error in
                switch status {
                case .succeeded:
                    completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
                    print("✅ Payment succeeded")
                    self.triggerCheckPayment(intentId: paymentMethod.stripeId, paymentStatus: 1)
                case .failed:
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: [error].compactMap { $0 }))
                    self.triggerCheckPayment(intentId: paymentMethod.stripeId, paymentStatus: 2)
                    print("❌ Payment failed: \(String(describing: error))")
                case .canceled:
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                    print("⚠️ Payment canceled")
                    self.triggerCheckPayment(intentId: paymentMethod.stripeId, paymentStatus: 2)
                @unknown default:
                    self.triggerCheckPayment(intentId: paymentMethod.stripeId, paymentStatus: 2)
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                }
            }
        }
    }
    func triggerCheckPayment(intentId:String,paymentStatus:Int){
        print(intentId)
        var clientSecret = intentId
        if let response = self.bookedEventData["response"] as? [String:Any]{
            clientSecret = response["payment_intent_id"] as? String ?? ""
        }
        print(intentId)
        EventRequest.instance.triggerCheckPayment(intentId: clientSecret,status:paymentStatus) { response, status in
            let modal = CommonModal.init(fromDictionary: response)
            if status && paymentStatus == 1{
                delay(1.0, function: {
                    if let vc: EventSuccessVC = self.getController(from: .main) {
                        vc.eventInfo = self.bookedEventData
                        self.presentVC(vc: vc)
                    }
                })
            }else{
                self.showSimpleAlert(withTitle: modal.response.message, vc: self, type: 5)
            }
        }
    }
    func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
        controller.dismiss(animated: true, completion: nil)
    }
}
class PaymentTypes{
    var title : String?
    var selected : Bool?
    var type : Int?

    init(title: String? = nil, selected: Bool? = nil, type: Int? = nil) {
        self.title = title
        self.selected = selected
        self.type = type
    }
}
