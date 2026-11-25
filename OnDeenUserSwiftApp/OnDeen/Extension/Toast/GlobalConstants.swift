//
//  GlobalConstants.swift
//  AwaitToast
//
//  Created by DongHeeKang on 01/04/2019.
//  Copyright © 2019 k-lpmg. All rights reserved.
//
import UIKit

public let AutomaticDimension: CGFloat = -1
public let currency = "£" + ""
public let appCurrency = currency

enum popupType{
    case none
    case cancelOrder
    case deleteCard
    case otpAttempt
}
enum dueType{
    case upcoming
    case allDues
}
enum paymentTypes : String{
    case none
    case AmazonPayment = "AmazonPayment"
}
enum webType{
    case none
    case terms
    case privacy
    case contact
    
    case twitter
    case instagram
}
enum language{
    case en
    case ar
}
enum GAnalytics : String{
    case Login = "Login"
    case signUp = "Sign_up"
    case qrScan = "QRScan"
    case InvoiceNumberAdded = "Invoice_number_added"
    case paymentSuccess = "Successful_payment"
    case paymentFailed = "Failed_payment"
    case paymentCancelled = "Cancelled_payment"
    case placeReq = "Place_Req"
    
    case profileView = "View_ProfilePage"
    case clickForgot = "Click_ForgetPassword"
    case clickOTP = "Click_OTP"
    case viewForgot = "View_ForgetPassword"
    case appLaunched = "app_launched"
    case appOpen = "App Open"
    case viewLogin = "View_Login"
    case clickSignup = "Click_Signup"
    case clickLogin = "Click_Login"
    case viewOTP = "View_OTP"
    case rewardView = "View_RewardsPage"
    case rewardResponse = "Rewards_Response"
    case viewHome = "View_HomePage"
    case clickAllStore = "Click_ViewAllPopularRestaurants"
    case viewAllStore = "View_ViewAllPopularRestaurants"
    case viewStore = "View_Store"
    case clickLocation = "Click_Directions"
    case qrLaunch = "QR_Launched"
    case viewPurchase = "View_PurchasesPage"
    case clickPay = "Click_Pay"
    case clickMyOrder = "Click_MyOrders"
    case clickTransaction = "Click_Transactions"
    case clickUpcoming = "Click_UpcomingPayments"
    case clickScan = "Click_Scan"
    case changeLanguage = "Change_Language"
}
extension String {
    var containsNonEnglishNumbers: Bool {
        return !isEmpty && range(of: "[^0-9]", options: .regularExpression) == nil
    }
    var english: String {
        return self.applyingTransform(StringTransform.toLatin, reverse: false) ?? self
    }
    func fromBase64() -> String? {
        guard let data = Data(base64Encoded: self) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }
    func toBase64() -> String {
        return Data(self.utf8).base64EncodedString()
    }
    func validStringCode() -> String{
       var getStr = self.replacingOccurrences(of: " ", with:"")
       getStr = getStr.replacingOccurrences(of: "(", with: "")
       getStr = getStr.replacingOccurrences(of: ")", with: "")
       getStr = getStr.replacingOccurrences(of: "-", with: "")
       return getStr
    }
}
extension Int{
    func getBookingStatus() -> String{
        var bookingStatus = ""
        switch self{
        case 100:
            bookingStatus = "Waiting for confirmation"
        case 101:
            bookingStatus = "Confirmed"
        case 102:
            bookingStatus = "In progress"
        case 103:
            bookingStatus = "Completed"
        case 104:
            bookingStatus = "Rejected"
        case 105:
            bookingStatus = "Cancelled"
        default:
            bookingStatus = ""
        }
        return bookingStatus.localized
    }
    func getBookingColor() -> String{
        var bookingColor = ""
        switch self{
        case 100:
            bookingColor = "#FFC107"
        case 101:
            bookingColor = "#A0D468"
        case 102:
            bookingColor = "#FFEB39"
        case 103:
            bookingColor = "#18B067"
        case 104:
            bookingColor = "#F10000"
        case 105:
            bookingColor = "#F10000"
        default:
            bookingColor = "#000000"
        }
        return bookingColor
    }
}
