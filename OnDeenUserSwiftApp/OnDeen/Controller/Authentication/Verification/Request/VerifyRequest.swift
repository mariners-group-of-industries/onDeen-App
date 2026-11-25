//
//  VerifyRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 20/12/24.
//

import Foundation
class VerifyRequest:NSObject{
    static let instance = VerifyRequest()
    func verifyOTP(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .verifyOTP, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                result(response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([String:Any](),false)
            }
        }
    }
    func verifyEmailOTP(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .verifyEmailOTP, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                result(response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([String:Any](),false)
            }
        }
    }
}
