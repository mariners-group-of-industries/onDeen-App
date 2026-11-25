//
//  FirebaseExtension.swift
//  Saadeddin
//
//  Created by Thabrez Thabu on 02/09/20.
//  Copyright © 2020 Imcrinox. All rights reserved.
//

import UIKit
import FirebaseAuth
var otpVerificationID = ""

class FirebaseExtension: NSObject {
    static let shared = FirebaseExtension()
    
    typealias CompletionHandler = (_ success:Bool) -> Void

    func sendOTPToUser(code:String,mobile:String,controller:UIViewController, completion: @escaping (Bool) -> Void){
        DispatchQueue.main.async {
            #if DEBUG
                Utils.showToast(message: "OTP Sent successfully")
                completion(true)
                return
            #else
                APIDispatcher.instance.showLoading()
                let getStr = "\(code + mobile)".validStringCode()
                 #if targetEnvironment(simulator)
//                     getStr = "+917867976727"
                 #endif
                PhoneAuthProvider.provider().verifyPhoneNumber(getStr, uiDelegate: nil) { (verificationID, error) in
                 DispatchQueue.main.async {
                    APIDispatcher.instance.removeLoading()
                 }
                  if let error = error {
                    print("=====\(error.localizedDescription)=====")
                    print("=====\(error.localizedDescription)=====")
                    
                      completion(false)
                    #if DEBUG
                        Utils.showToast(message: "\(error.localizedDescription)")
                      #else
                      Utils.showToast(message: "Invalid OTP")
                      #endif
                    return
                  }
                  otpVerificationID = verificationID ?? ""
                  DispatchQueue.main.async {
                    completion(true)
                      Utils.showToast(message: "Activation code sent to".localized + " " + mobile.validStringCode())
                  }
                }
            #endif
        }
    }
    func validateOTP(otp:String,controller:UIViewController, completion: @escaping (Bool) -> Void) {
       #if DEBUG
            completion(true)
        #else
            DispatchQueue.main.async {
                APIDispatcher.instance.showLoading()
            }
            let credential = PhoneAuthProvider.provider().credential(withVerificationID: otpVerificationID,verificationCode: otp)
            Auth.auth().signIn(with: credential) { (authResult, error) in
                DispatchQueue.main.async {
                    APIDispatcher.instance.removeLoading()
                }
              if let error = error {
                
                if error.localizedDescription.contains("blocked all requests") {
                    Utils.showToast(message: "Invalid OTP")
                }else {
                    Utils.showToast(message: "Invalid OTP")
                }
                completion(false)
                return
              }
               completion(true)
            }
        #endif
    }
}
