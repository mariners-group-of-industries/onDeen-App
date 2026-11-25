//
//  HomeRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 20/12/24.
//

class HomeRequest:NSObject{
    static let instance = HomeRequest()
    func triggerHome(result: @escaping (HomePageResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .getHome, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = HomePageModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(HomePageResponse.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
    func triggerFilter(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .filterList, method: .post, parameters: param , headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest,loaderRequired:false) { (resultt) in
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
