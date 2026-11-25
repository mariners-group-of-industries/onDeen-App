//
//  EventRequest.swift
//  OnDeen
//
//  Created by Thabu's Mac on 09/04/25.
//


class NotificationRequest:NSObject{
    static let instance = NotificationRequest()
    func triggerNotificationLists(result: @escaping ([NotificationItem],Bool) -> ()){
        let apiRequest = APIRequest(path: .notificationListAPI, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = NotificationModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([NotificationItem](),false)
            }
        }
    }
    
    func triggerDeleteNotification(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .deleteNotification, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = CommonModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(CommonResponse.init(fromDictionary: [String : Any]()),false)
            }
        }
    }

    func triggerSeenNotification(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .seenNotification, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = CommonModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(CommonResponse.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
}
