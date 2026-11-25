//
//  MembershipRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 27/12/24.
//

import Foundation
class MembershipRequest:NSObject{
    static let instance = MembershipRequest()
    func triggerMembershipList(result: @escaping (MembershipListMembership,Bool) -> ()){
        let apiRequest = APIRequest(path: .membershipList, method: .post, parameters: [String:Any]() , headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = MembershipListModal.init(fromDictionary: response)
                if modal.response != nil{
                    result(modal.response.membership,true)
                }else{
                    result(MembershipListMembership.init(fromDictionary: [String : Any]()),false)
                }
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(MembershipListMembership.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
    func triggerAddMembership(id:Int,result: @escaping ([String : Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .addMembership, method: .post, parameters: ["id":id], headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                result(response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([String : Any](),false)
            }
        }
    }
    func triggerMyMembership(result: @escaping ([MYMembershipMembership],Bool) -> ()){
        let apiRequest = APIRequest(path: .myMembershipList, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = MYMembershipModal.init(fromDictionary: response)
                if modal.response != nil{
                    result(modal.response.membership,true)
                }else{
                    result([MYMembershipMembership](),false)
                }
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([MYMembershipMembership](),false)
            }
        }
    }
}
