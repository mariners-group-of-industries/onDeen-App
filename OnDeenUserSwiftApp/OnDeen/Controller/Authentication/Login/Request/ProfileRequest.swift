//
//  ProfileRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 20/12/24.
//

class ProfileRequest:NSObject{
    static let instance = ProfileRequest()
    func fetchUserProfile(result: @escaping (ProfileResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .getProfile, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = ProfileModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(ProfileResponse.init(fromDictionary: [String : Any]()),true)
            }
        }
    }
    func fetchOtherUserProfile(userId:Int,result: @escaping (ProfileResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .getOtherProfile, method: .post,parameters: ["user_id" : userId], headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = ProfileModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(ProfileResponse.init(fromDictionary: [String : Any]()),true)
            }
        }
    }
    func fetchUserRatingProfile(userId:Int = 0,result: @escaping ([EventReview],Bool) -> ()){
        var params = [String:Any]()
        if userId > 0 {
            params["user_id"] = userId
        }
        let apiRequest = APIRequest(path: .getRatingReviews, method: .post,parameters:params, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = EventReviewResponse.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([EventReview](),false)
            }
        }
    }
    func triggerLogout(result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .logout, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                result(response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([String:Any](),true)
            }
        }
    }
    func triggerDeleteUser(result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .deleteAccountAPI, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                result(response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([String:Any](),true)
            }
        }
    }
    func triggerUpdateBookedSession(param: [String: Any], result: @escaping (CommonResponse, Bool) -> ()) {
        let apiRequest = APIRequest(path: .updateBuddylist, method: .post, parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = CommonModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(CommonResponse.init(fromDictionary: [String : Any]())
                       , false)
            }
        }
    }
    func triggerUpdatePrivacy(param: [String: Any], result: @escaping (CommonResponse, Bool) -> ()) {
        let apiRequest = APIRequest(path: .updatePrivacySetting, method: .post, parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = CommonModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(CommonResponse.init(fromDictionary: [String : Any]())
                       , false)
            }
        }
    }
    func triggerGetBookedSession(param: [String: Any], result: @escaping ([SessionListResponse], [SessionListResponse], Bool) -> ()) {
        let apiRequest = APIRequest(path: .requestedBuddylist, method: .post, parameters: param, headers: .withToken)
        
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = SessionListModal(fromDictionary: response)
                
                // Get current date
                var currentDate = Date()
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd"
                dateFormatter.timeZone = TimeZone(identifier: "UTC") // Ensure correct timezone
                dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Use a reliable locale
                let todayDate = dateFormatter.string(from: Date())
                if let getDate = dateFormatter.date(from: todayDate){
                    currentDate = getDate
                }

                // Filter past and future sessions
                let pastSessions = modal.response.filter { session in
                    if let sessionDate = dateFormatter.date(from: session.date) {
                        return sessionDate < currentDate
                    }
                    return false
                }
                
                let futureSessions = modal.response.filter { session in
                    if let sessionDate = dateFormatter.date(from: session.date) {
                        return sessionDate >= currentDate
                    }
                    return false
                }
                result(futureSessions, pastSessions, true)
                // Return both past and future sessions
            
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([], [], false)
            }
        }
    }
    func triggerPushRegister(){
        if deviceID.isEmpty{
            delay(1.0) {
                self.triggerPushRegister()
            }
            return
        }
        print(JSON(["push_token":deviceID]))
        let apiRequest = APIRequest(path: .insertPushToken, method: .post, parameters: ["push_token":deviceID] , headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest,loaderRequired: false) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
            case .failure(let apiError):
                print(apiError.localizedDescription)
            }
        }
    }
}
