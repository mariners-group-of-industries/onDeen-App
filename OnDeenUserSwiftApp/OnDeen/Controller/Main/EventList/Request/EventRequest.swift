//
//  EventRequeset.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 21/12/24.
//
var isSkipLogin = false

class EventRequest:NSObject{
    static let instance = EventRequest()
    func triggerEventList(param:[String:Any],result: @escaping (HomePageResponse,Bool) -> ()){
        var params = param
        params["latitude"] = locationData.coordinate.latitude
        params["longitude"] = locationData.coordinate.longitude
        let apiRequest = APIRequest(path: .eventListAPI, method: .post,parameters: params, headers: .withToken)
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
    func triggerWishlistEvent(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            if let vc = topViewController(){
                vc.showGuestLogin()
            }
            return
        }
        let apiRequest = APIRequest(path: .eventWishlist, method: .post,parameters: param, headers: .withToken)
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
    func triggerBookEvent(param:[String:Any],result: @escaping ([String:Any],Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            if let vc = topViewController(){
                vc.showGuestLogin()
            }
            return
        }
        let apiRequest = APIRequest(path: .eventBooking, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                result(response,false)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([String:Any](),false)
            }
        }
    }
    func triggerCheckPayment(intentId:String,status:Int,result: @escaping ([String:Any],Bool) -> ()){
        let apiRequest = APIRequest(path: .updatePaymentStatus, method: .post,parameters: ["payment_intent_id":intentId,"status":status], headers: .withToken)
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
    func triggerEventById(id:Int,participantId:Int,searchId:Int = 0,result: @escaping (EventDetailResponse,Bool) -> ()){
        var item = "id=\(id)"
        if participantId > 0{
            item += "&participant_id=\(participantId)"
        }
        if searchId > 0{
            item += "&search=\(searchId)"
        }
        let apiRequest = APIRequest(path: .eventById, attachLastPath: item, method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = EventDetailModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(EventDetailResponse.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
    func triggerGetOrganizer(id:Int,result: @escaping (OrganizerDetailResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .organzierProfileById, attachLastPath: "id=\(id)", method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = OrganizerDetailModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(OrganizerDetailResponse.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
    func triggerGetSpeaker(id:Int,result: @escaping (SpeakerProfileResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .speakerProfileById, attachLastPath: "id=\(id)", method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = SpeakerProfileModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(SpeakerProfileResponse.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
    func triggerEventNotes(id:Int,result: @escaping ([EventNotesResponse],Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            if let vc = topViewController(){
                vc.showGuestLogin()
            }
            return
        }
        let apiRequest = APIRequest(path: .allEventNotes, method: .post,parameters: ["event_id":id], headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = EventNotesModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([EventNotesResponse](),false)
            }
        }
    }
    func triggerGetSpeakersSlots(param:[String:Any],result: @escaping ([TimeModel],[TimeModel],Bool,_ timeZone:String) -> ()){
        var morningSlots = [TimeModel]()
        var eveningSlots = [TimeModel]()

        let apiRequest = APIRequest(path: .getSpeakerAvailableDays, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                var timeZone = ""
                if let getResponse = response["response"] as? [String: Any],
                   let getTimes = getResponse["times"] as? [[String: Any]] {
                    for item in getTimes {
                        var datas = item
                        datas["available"] = 10000
                        datas["booked"] = 1
                        let modal = TimeModel(fromDictionary: datas)
                        modal.startDate = getResponse["date"] as? String ?? ""
                        modal.time_zone = getResponse["time_zone"] as? String ?? ""
                        timeZone = getResponse["time_zone"] as? String ?? ""
                        let formatter = DateFormatter()
                        formatter.timeZone = modal.time_zone.getTimeZone() // Force UTC
                        formatter.locale = Locale(identifier: "en_US_POSIX")
                        formatter.dateFormat = "HH:mm:ss"

                        if let startTime = formatter.date(from: modal.startTime) {
                            let calendar = Calendar(identifier: .gregorian)

                            // Print the original date (in system timezone)
                            print("Parsed time (Asia/Kolkata base):", startTime)

                            let londonTimeZone = TimeZone(identifier: "Europe/London")!
                            let components = calendar.dateComponents(in: londonTimeZone, from: startTime)

                            if let hour = components.hour {
                                print("Hour in Europe/London:", hour)

                                if hour >= 6 && hour < 12 {
                                    print("➡️ Morning")
                                    morningSlots.append(modal)
                                } else if hour >= 0 && hour < 6 {
                                    print("➡️ Early morning")
                                    morningSlots.append(modal)
                                } else {
                                    print("➡️ Evening")
                                    eveningSlots.append(modal)
                                }
                            } else {
                                print("❌ Failed to extract hour")
                            }
                        } else {
                            print("❌ Failed to parse time: \(modal.startTime)")
                        }
//                        if let startTime = formatter.date(from: modal.startTime) {
//                            let calendar = Calendar(identifier: .gregorian)
//                            let londonTimeZone = TimeZone.current
//
//                            // Convert startTime into London components
//                            let components = calendar.dateComponents(in: londonTimeZone, from: startTime)
//                            let hour = components.hour ?? 0
//
//                            if hour >= 6 && hour < 12 {
//                                morningSlots.append(modal)
//                            } else if hour >= 0 && hour < 6 {
//                                morningSlots.append(modal)
//                            } else {
//                                eveningSlots.append(modal)
//                            }
//                        }
                        
                        // Parse time in UTC
//                        if let startTime = formatter.date(from: modal.startTime) {
//                            var calendar = Calendar.current
//                            calendar.timeZone = TimeZone.current // Ensure UTC-based calculations
//
//                            let hour = calendar.component(.hour, from: startTime)
//
//                            if hour >= 6 && hour < 12 {
//                                // ✅ 6:00 AM - 11:59 AM → Morning slot
//                                morningSlots.append(modal)
//                            } else if hour >= 0 && hour < 6 {
//                                // ✅ 12:00 AM - 5:59 AM → Early morning (shouldn't go to evening)
//                                morningSlots.append(modal) // If you want to classify early morning as morning
//                            } else {
//                                // ✅ 12:00 PM onwards → Evening slot
//                                eveningSlots.append(modal)
//                            }
//                        }
                    }
                }
                result(morningSlots,eveningSlots,true,timeZone)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(morningSlots,eveningSlots,false,"")
            }
        }
    }

    func triggerGetQuestionAnsewrs(id:Int,result: @escaping ([EventQuestionsResponse],Bool) -> ()){
        let apiRequest = APIRequest(path: .questionAndAnswers, attachLastPathSlass: "\(id)", method: .get, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = EventQuestionsModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([EventQuestionsResponse](),false)
            }
        }
    }
    func triggerEventAddNote(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            if let vc = topViewController(){
                vc.showGuestLogin()
            }
            return
        }
        let apiRequest = APIRequest(path: .addEventNote, method: .post,parameters: param, headers: .withToken)
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
    func triggerEventDeleteNote(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            if let vc = topViewController(){
                vc.showGuestLogin()
            }
            return
        }
        let apiRequest = APIRequest(path: .deleteEventNote, method: .post,parameters: param, headers: .withToken)
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
    func triggerAddQuestion(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            if let vc = topViewController(){
                vc.showGuestLogin()
            }
            return
        }
        let apiRequest = APIRequest(path: .addEventQuestion, method: .post,parameters: param, headers: .withToken)
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
    func triggerEventSearch(param:[String:Any],result: @escaping ([SearchResponse],Bool) -> ()){
        let apiRequest = APIRequest(path: .eventSearch, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = SearchModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([SearchResponse](),false)
            }
        }
    }
    func triggerAddRating(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .addRating, method: .post,parameters: param, headers: .withToken)
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
    func triggerAddSupport(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .sendEmail, method: .post,parameters: param, headers: .withToken)
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
    func triggerEventInterSearch(param:[String:Any],result: @escaping (HomePageResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .eventListAPI, method: .post,parameters: param, headers: .withToken)
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

    func triggerParticipantSearch(param:[String:Any],result: @escaping ([ProfileResponse],Bool) -> ()){
        let apiRequest = APIRequest(path: .getParticipantList, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = ParticipantListModal.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result([ProfileResponse](),false)
            }
        }
    }

    func triggerGetHistory(param:[String:Any],result: @escaping (SearchModal,Bool) -> ()){
        let apiRequest = APIRequest(path: .searchHistoryList, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = SearchModal.init(fromDictionary: response)
                result(modal,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(SearchModal.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
    func triggerCheckInEvent(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .checkInEvent, method: .post,parameters: param, headers: .withToken)
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
    func triggerRequestBuddy(id:Int,type:Int,result: @escaping (CommonResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .requestBuddy, method: .post,parameters: ["event_id":id,"type":type], headers: .withToken)
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
    func triggerCancelEvent(id:Int,confirm:Int = 0,result: @escaping (CommonResponse,Bool) -> ()){
        var param = ["event_id":id]
        if confirm > 0{
            param["confirm"] = confirm
        }
        let apiRequest = APIRequest(path: .cancelbooking, method: .post,parameters: param, headers: .withToken)
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

    func triggerRequestSession(param:[String:Any],result: @escaping (CommonResponse,Bool) -> ()){
        let apiRequest = APIRequest(path: .requestBuddy, method: .post,parameters: param, headers: .withToken)
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
    func triggerGetAllTickets(param:[String:Any],result: @escaping ([EventDetailParticipant],Bool) -> ()){
        let apiRequest = APIRequest(path: .ticketsLists, method: .post,parameters: param, headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            var datas = [EventDetailParticipant]()
            switch resultt {
            case .success(let response):
                print(JSON(response))
                if let getResponse = response["response"] as? [[String:Any]]{
                    for item in getResponse{
                        let participant = EventDetailParticipant.init(fromDictionary: item)
                        datas.append(participant)
                    }
                }
                result(datas,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(datas,false)
            }
        }
    }

}
