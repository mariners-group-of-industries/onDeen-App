//
//  LoginRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 20/12/24.
//

class LoginRequest:NSObject{
    static let instance = LoginRequest()
    func registerInitToken(result: @escaping (Bool) -> ()){
        let apiRequest = APIRequest(path: .generateToken, method: .get, headers: .withoutToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let token = response["access_token"] as? String ?? ""
                UserDefaults.standard.set(token, forKey: "access_token")
                UserDefaults.standard.synchronize()
                result(true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(false)
            }
        }
    }
    func sendOTP(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .sendOTP, method: .post, parameters: param , headers: .withToken)
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
    func triggerEmailLogin(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .login, method: .post, parameters: param , headers: .withToken)
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
    func triggerEmailSendOTP(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .emailOTP, method: .post, parameters: param , headers: .withToken)
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
    func triggerCreatePassword(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .change_password, method: .post, parameters: param , headers: .withToken)
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
