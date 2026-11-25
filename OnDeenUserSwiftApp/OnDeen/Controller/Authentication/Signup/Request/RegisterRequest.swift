//
//  VerifyRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 20/12/24.
//

import Foundation
class RegisterRequest:NSObject{
    static let instance = RegisterRequest()
    func triggerRegister(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
//        #if DEBUG
//        print(JSON(param))
//        #else
        let apiRequest = APIRequest(path: .register, method: .post,parameters: param, headers: .withToken)
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
//#endif
    }
    func triggerSocial(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .registerSocial, method: .post,parameters: param, headers: .withToken)
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
    func triggerUpdateProfile(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .updateProfile, method: .post,parameters: param, headers: .withToken)
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

    func triggerUpload(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .imageUpload, method: .post,parameters: param, headers: .withToken)
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
    func triggerJourneyList(result: @escaping ([HomePageEvent],Bool) -> ()){
        let apiRequest = APIRequest(path: .journeyLevels, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            var journies = [HomePageEvent]()
            switch resultt {
            case .success(let response):
                print(JSON(response))
                if let responsee = response["response"] as? [[String:Any]]{
                    for item in responsee{
                        let journey = HomePageEvent.init(fromDictionary: item)
                        journies.append(journey)
                    }
                }
                result(journies,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(journies,true)
            }
        }
    }
}
