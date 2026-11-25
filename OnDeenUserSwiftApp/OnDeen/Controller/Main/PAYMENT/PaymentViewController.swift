//
//  PaymentViewController.swift
//  OnDeen
//
//  Created by Thabu MacbookPRO on 09/05/25.
//


import UIKit
import Stripe
import IQKeyboardManagerSwift

class PaymentViewController: UIViewController {
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var cardTextField: STPPaymentCardTextField!
    @IBOutlet weak var payNowView: GlobalGradientView!
    @IBOutlet weak var backBtn: UIStackView!
    
    let payButton = UIButton(type: .system)
    var paymentInfo = [String:Any]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        IQKeyboardManager.shared.isEnabled = false
        self.view.backgroundColor = UIColor.init(red: 31.0/255.0, green: 31.0/255.0, blue: 31.0/255.0, alpha: 0.5)

        cardTextField.postalCodeEntryEnabled = false
        
        backBtn.addTap { r in
            self.dismiss(animated: true)
        }
        bgView.addTap { r in
            self.payNowTapped()
        }
        mainThread {
            self.cardTextField.becomeFirstResponder()
        }
//        // Card Field
//        cardTextField.frame = CGRect(x: 15, y: 100, width: view.frame.width - 30, height: 44)
//        view.addSubview(cardTextField)
//
//        // Pay Button
//        payButton.setTitle("Pay Now", for: .normal)
//        payButton.frame = CGRect(x: 15, y: 160, width: view.frame.width - 30, height: 50)
//        payButton.addTarget(self, action: #selector(payNowTapped), for: .touchUpInside)
//        view.addSubview(payButton)
    }
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
        if let topVC = topViewController(){
            if topVC == self{
                if let keyboardFrame = (notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue {
                    UIView.animate(withDuration: 0.3) {
                        if let sup = self.payNowView.superview{
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
                    if let sup = self.payNowView.superview{
                        sup.transform = .identity
                    }
                }
            }
        }
    }

    override func viewDidLayoutSubviews() {
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
    }
    @objc func payNowTapped() {
        if let response = paymentInfo["response"] as? [String:Any]{
            let clientSecret = response["client_secret"] as? String ?? ""
            self.confirmPayment(clientSecret: clientSecret)
        }else{
            self.showSimpleAlert(withTitle: "Something went wrong. Please try again.", vc: self, type: 5)
        }
    }
    func confirmPayment(clientSecret: String) {
        DispatchQueue.main.async {
            let paymentMethodParams = self.cardTextField.paymentMethodParams
            if !self.cardTextField.isValid {
                Utils.showToast(message: "Please enter valid card details.")
                return
            }
            self.view.endEditing(true)
            APIDispatcher.instance.showLoading()
            let paymentIntentParams = STPPaymentIntentParams(clientSecret: clientSecret)
            paymentIntentParams.paymentMethodParams = paymentMethodParams

//            let cardParams = self.cardTextField.cardParams
//            let paymentMethodParams = STPPaymentMethodParams(card: cardParams, billingDetails: nil, metadata: nil)
//
//            let paymentIntentParams = STPPaymentIntentParams(clientSecret: clientSecret)
//            paymentIntentParams.paymentMethodParams = paymentMethodParams

            STPPaymentHandler.shared().confirmPayment(paymentIntentParams, with: self) { (status, paymentIntent, error) in
                APIDispatcher.instance.removeLoading()
                var stripeId = ""
                if let stripe = paymentIntent{
                    stripeId = stripe.stripeId
                }
                var message = ""
                if let errors = error{
                    message = errors.localizedDescription
                }
                switch status {
                case .succeeded:
                    self.triggerCheckPayment(intentId: stripeId,paymentStatus: 1,paymentMessage: message)
                    print("✅ Payment Successful!")
                case .failed:
                    print("❌ Payment Failed: \(error?.localizedDescription ?? "")")
                    self.triggerCheckPayment(intentId: stripeId,paymentStatus: 2,paymentMessage: message)
                case .canceled:
                    print("⚠️ Payment Canceled")
                    self.triggerCheckPayment(intentId: stripeId,paymentStatus: 2,paymentMessage: message)
                @unknown default:
                    fatalError()
                }
            }
        }
    }
    func triggerCheckPayment(intentId:String,paymentStatus:Int,paymentMessage:String){
        var clientSecret = intentId
        if let response = self.paymentInfo["response"] as? [String:Any]{
            clientSecret = response["payment_intent_id"] as? String ?? ""
        }
        EventRequest.instance.triggerCheckPayment(intentId: clientSecret,status:paymentStatus) { response, status in
            let modal = CommonModal.init(fromDictionary: response)
            if status && paymentStatus == 1{
                if let vc: EventSuccessVC = self.getController(from: .main) {
                    vc.eventInfo = self.paymentInfo
                    self.presentVC(vc: vc)
                }
            }else{
                var message = modal.response.message ?? ""
                if message.isEmpty {
                    message = "Something went wrong. Please try again."
                }
                self.showSimpleAlert(withTitle: !paymentMessage.isEmpty ? paymentMessage : message, vc: self, type: 5)
            }
        }
    }
    func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

extension PaymentViewController: STPAuthenticationContext {
    func authenticationPresentingViewController() -> UIViewController {
        return self
    }
}
