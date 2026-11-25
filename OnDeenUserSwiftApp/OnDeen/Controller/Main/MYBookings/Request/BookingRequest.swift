//
//  BookingRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 24/12/24.
//

class BookingRequest:NSObject{
    static let instance = BookingRequest()
    func triggerBookedEvents(param:[String:Any],result: @escaping ([HomePageEvent],Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            return
        }
        let apiRequest = APIRequest(path: .bookingList, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            var events = [HomePageEvent]()
            switch resultt {
            case .success(let response):
                print(JSON(response))
                if let event = response["response"] as? [[String:Any]]{
                    for item in event{
                        events.append(HomePageEvent.init(fromDictionary: item))
                    }
                }
                result(events,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(events,false)
            }
        }
    }
}
