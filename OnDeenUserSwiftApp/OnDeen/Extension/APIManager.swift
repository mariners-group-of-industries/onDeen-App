//
//  APIManager.swift
//  TC User APP
//
//  Created by Kavin on 01/12/20.
//  Copyright © 2020 Imcrinox. All rights reserved.
//

import UIKit
import Lottie

var isAppExpired = false

enum APIURLType: String {
    case storeURL = "https://apps.apple.com/us/app/ondeen/id6740039443"
    case liveApi = "https://api-production-517c1.up.railway.app/" // - live Railway backend
//    case liveApi = "http://35.154.40.168/"
//    case liveApi = "http://43.205.18.14:8080/" // Staging
    
    var baseUrl: String {
        return self.rawValue
    }
}
private var userPath: String {
    return "driver_app/driver/"
}

enum APIPath: String {

    case generateToken = "generate_token"
    case login = "customer_app/users/login"
    case emailOTP = "customer_app/users/email_send_otp"
    case sendOTP = "customer_app/users/send_otp"
    case verifyOTP = "customer_app/users/verify_otp"
    case verifyEmailOTP = "customer_app/users/email_verify_otp"
    case register = "customer_app/users/register"
    case getProfile = "customer_app/users/get_profile"
    case getOtherProfile = "customer_app/event/get_user_profile"
    case change_password = "customer_app/users/change_password"
    case getHome = "customer_app/home/home"
    case logout = "customer_app/users/logout"
    case eventListAPI = "customer_app/event/event"
    case notificationListAPI = "customer_app/users/get_notifications"
    case eventWishlist = "customer_app/wishlist/toggle"
    case eventById = "customer_app/event/event_id"
    case eventBooking = "customer_app/event/booking"
    case organzierProfileById = "customer_app/organizer/organizer_id"
    case speakerProfileById = "customer_app/speaker/speaker_id"
    case bookingList = "customer_app/event/booking_list"
    case questionAndAnswers = "customer_app/event/question_and_answers"
    case allEventNotes = "customer_app/event/get_all_event_note"
    case addEventNote = "customer_app/event/event_note_add"
    case deleteEventNote = "customer_app/event/event_note_delete"
    case addEventQuestion = "customer_app/event/add_event_question"
    case imageUpload = "image_upload"
    case eventSearch = "customer_app/event/event_search"
    case wishlist = "customer_app/wishlist/list"
    case journeyLevels = "customer_app/event/journey_levels"
    case membershipList = "customer_app/membership/list"
    case addMembership = "customer_app/membership/purchase"
    case myMembershipList = "customer_app/membership/mine"
    case requestBuddy = "customer_app/event/request_buddy"
    case checkInEvent = "customer_app/event/check_in"
    case filterList = "customer_app/event/filter"
    case updateProfile = "customer_app/users/update_profile"
    case registerSocial = "customer_app/users/register_social"
    case insertPushToken = "customer_app/users/insert_push_token"
    case getSpeakerAvailableDays = "customer_app/speaker/speaker_slot"
    case requestedBuddylist = "customer_app/event/get_request_buddy_list"
    case updateBuddylist = "customer_app/event/update_status_request_buddy"
    case ticketsLists = "customer_app/event/ticket_qrcodes"
    case searchHistoryList = "customer_app/event/search_history"
    case getRatingReviews = "customer_app/event/get_rating"
    case updatePrivacySetting = "customer_app/users/update_privacy"
    case getParticipantList = "customer_app/event/participant_list"
    case addRating = "customer_app/event/add_rating"
    case cancelbooking = "customer_app/event/cancle_booking"
    case deleteNotification = "customer_app/users/delete_notification"
    case seenNotification = "customer_app/users/seen_notification"
    case updatePaymentStatus = "update_payment_status"
    case deleteAccountAPI = "customer_app/users/delete_account"
    case sendEmail = "customer_app/users/send_email"
    
    func directURL(type: APIURLType) -> URL? {
        let urlPath = type.baseUrl + self.rawValue
        return URL(string: urlPath)
    }
    
    func extendedURL(type: APIURLType, attach path: String) -> URL? {
        let urlPath = type.baseUrl + self.rawValue + "?" + path
        return URL(string: urlPath)
    }
    func extendedURLWithSlash(type: APIURLType, attach path: String) -> URL? {
        let urlPath = type.baseUrl + self.rawValue + "/" + path
        return URL(string: urlPath)
    }
    
    func extendedURL(type: APIURLType, using parameters: [String:String]) -> URL? {
        let urlPath = parameters.reduce(type.baseUrl + self.rawValue) { (urlPath, parameter) -> String in
            return urlPath + "?" + parameter.key + "=" + parameter.value
        }
        return URL(string: urlPath)
    }
    
}

enum APIMethod: String {
    case get = "GET"
    case put = "PUT"
    case post = "POST"
    case patch = "PATCH"
    case delete = "DELETE"
}

enum APIHeaders {
    case withToken
    case withoutToken
    
    var authorization: [String:String] {
        let authToken = UserDefaults.standard.object(forKey: "access_token") as? String ?? ""
        let authorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        let timeZone = TimeZone.current.identifier
//        print(authToken)
//        print(authorization)
        switch self {
        case .withoutToken:
            print("$$$$$$")
            print("Auth-Token:\n"+authToken)
            print("$$$$$$")
            return ["Content-Type":"application/json","Authentication" : "","Token":"","Accept-Language":LocalizationSystem.sharedInstance.getLanguage(),"app":"1","auth-token":authToken,"Timezone":timeZone]
        case .withToken:
            print("$$$$$$")
//            print("Auth-Token:\n"+authToken)
            print("authorization-Token:\n"+authorization)
            print("$$$$$$")
            return ["Content-Type":"application/json","Accept-Language":LocalizationSystem.sharedInstance.getLanguage(),"app":"1","auth-token":authToken,"Authorization":"Bearer \(authorization)","Timezone":timeZone]
        }
    }
}

struct APIRequest {
    
    var url: URL?
    var method: String
    var parameters: Data?
    var headers: [String:String]
    
    init(urlType: APIURLType = .liveApi, path: APIPath, method: APIMethod, headers: APIHeaders) {
        self.url = path.directURL(type: urlType)
        #if DEBUG
            print(self.url?.absoluteString as Any)
        #endif
        self.method = method.rawValue
        self.headers = headers.authorization
    }
    
    init(urlType: APIURLType = .liveApi, path: APIPath, attachLastPath lastPath: String, method: APIMethod, headers: APIHeaders) {
        self.url = path.extendedURL(type: urlType, attach: lastPath)
        #if DEBUG
            print(self.url?.absoluteString as Any)
        #endif
        self.method = method.rawValue
        self.headers = headers.authorization
    }
    init(urlType: APIURLType = .liveApi, path: APIPath, attachLastPathSlass lastPath: String, method: APIMethod, headers: APIHeaders) {
        self.url = path.extendedURLWithSlash(type: urlType, attach: lastPath)
        #if DEBUG
            print(self.url?.absoluteString as Any)
        #endif
        self.method = method.rawValue
        self.headers = headers.authorization
    }
    
    init(urlType: APIURLType = .liveApi, path: APIPath, attachParameters parameters: [String:String], method: APIMethod, headers: APIHeaders) {
        self.url = path.extendedURL(type: urlType, using: parameters)
        #if DEBUG
            print(self.url?.absoluteString as Any)
            print(JSON(parameters))
        #endif
        self.method = method.rawValue
        self.headers = headers.authorization
    }
    
    init(urlType: APIURLType = .liveApi, path: APIPath, method: APIMethod, parameters: [String:Any], headers: APIHeaders) {
        self.url = path.directURL(type: urlType)
        #if DEBUG
            print(self.url?.absoluteString as Any)
            print(JSON(parameters))
        #endif
        self.method = method.rawValue
        self.parameters = try? JSONSerialization.data(withJSONObject: parameters, options: .sortedKeys)
        self.headers = headers.authorization
    }
    
    init<Encode: Encodable>(urlType: APIURLType = .liveApi, path: APIPath, method: APIMethod, parameters: Encode, headers: APIHeaders) {
        self.url = path.directURL(type: urlType)
        #if DEBUG
            print(self.url?.absoluteString as Any)
        #endif
        self.method = method.rawValue
        self.parameters = try? JSONEncoder().encode(parameters)
        self.headers = headers.authorization
    }

    init(urlType: String, method: APIMethod, headers: APIHeaders) {
        self.url = URL(string: urlType)
        #if DEBUG
            print(self.url?.absoluteString as Any)
        #endif
        self.method = method.rawValue
        self.headers = headers.authorization
    }
}


struct APIError: Error {
    let reason: String
    init(reason: String) {
        self.reason = reason
    }
}


struct APIDispatcher {
    
    static let instance = APIDispatcher()
    private init() {}
    
    func dispatch<Decode: Decodable>(request: APIRequest, response: Decode.Type, result: @escaping (Result<Decode, APIError>) -> ()) {
        self.connectToServer(with: request) { (resultant) in
            switch resultant {
            case .success(let data):
                do {
                    let decoded = try JSONDecoder().decode(response, from: data)
                    DispatchQueue.main.async {
                        result(.success(decoded))
                    }
                } catch {
                    let apiError = APIError(reason: error.localizedDescription)
                    DispatchQueue.main.async {
                        result(.failure(apiError))
                    }
                }
            case .failure(let error):
                DispatchQueue.main.async {
                    result(.failure(error))
                }
            }
        }
    }
    
    func dispatch(request: APIRequest,loaderRequired:Bool = true, result: @escaping (Result<Dictionary<String,Any>, APIError>) -> ()) {
        if !isInternetReachable() {
            self.showInternetView()
            return
        }
        self.connectToServer(with: request,loaderRequired:loaderRequired) { (resultant) in
            switch resultant {
            case .success(let data):
                do {
                    if let serialized = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? Dictionary<String,Any> {
                        DispatchQueue.main.async {
                            result(.success(serialized))
                        }
                    } else {
                        let apiError = APIError(reason: "No Data as Dictionary<String, Any>")
                        DispatchQueue.main.async {
                            result(.failure(apiError))
                        }
                    }
                } catch {
                    let error = APIError(reason: error.localizedDescription)
                    DispatchQueue.main.async {
                        result(.failure(error))
                    }
                }
            case .failure(let error):
                DispatchQueue.main.async {
                    result(.failure(error))
                }
            }
        }
    }
    
    private func connectToServer(with request: APIRequest,loaderRequired:Bool = true, result: @escaping (Result<Data, APIError>) -> ()) {
        guard let url = request.url else {
            let error = APIError(reason: "Invalid URL")
            result(.failure(error))
            return
        }
        if !url.absoluteString.contains("customer_app/event/search_history") && !url.absoluteString.contains("customer_app/event/event_search") && !url.absoluteString.contains("customer_app/users/seen_notification") {
            if loaderRequired{
                self.showLoading()
            }
        }
        var urlRequest = URLRequest(url: url, timeoutInterval: 30.0)
        urlRequest.httpMethod = request.method
        urlRequest.httpBody = request.parameters
        urlRequest.allHTTPHeaderFields = request.headers
        let urlSessionConfiguration = URLSessionConfiguration.default
        urlSessionConfiguration.waitsForConnectivity = true
        urlSessionConfiguration.timeoutIntervalForRequest = 30
        urlSessionConfiguration.timeoutIntervalForResource = 30
        let urlSession = URLSession(configuration: urlSessionConfiguration)
        urlSession.dataTask(with: urlRequest) { (data, response, error) in
            if let httpResponse = response as? HTTPURLResponse {
                print("Status Code: " + "\(httpResponse.statusCode)")
            }
            self.removeLoading()
            guard let httpResponse = response as? HTTPURLResponse,
                (200...299).contains(httpResponse.statusCode) else {
                var errorDescription = ""
                if let httpResponse = response as? HTTPURLResponse {
                    if httpResponse.statusCode == 403{
                        isAppExpired = true
                        DispatchQueue.main.async {
                            if let topVC = topViewController() {
                                topVC.showSimpleAlert(withTitle: "Session expired. Please login to continue", vc: topVC, type: 15)
                            }
                        }
                        return
                    }
                    errorDescription = ("Status Code: " + httpResponse.statusCode.description + "\n")
                }
                if let data = data, let errorResponse = try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? Dictionary<String, Any> {
                    errorDescription += (errorResponse.compactMap({ (key, value) -> String in
                        return key + ": " + (value as? String ?? "")
                    })).joined(separator: "\n")
                }
                let apiError = APIError(reason: errorDescription)
                result(.failure(apiError))
                return
        }
            
            if let error = error {
                let apiError = APIError(reason: error.localizedDescription)
                result(.failure(apiError))
                return
            }
            if let data = data {
                if let serialized = try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? Dictionary<String, Any>, serialized.contains(where: { $0.key == "error" }), let errorText = ((serialized["message"] as? String) ?? serialized["error"] as? String) {
                    let apiError = APIError(reason: errorText)
                    result(.failure(apiError))
                    return
                }
                result(.success(data))
            }
        }.resume()
        
    }
    /*func showLoading() {
        DispatchQueue.main.async {
            if let topVC = topViewController() {
                let loadingView = UIView(frame: topVC.view.bounds)
                loadingView.tag = 999
                loadingView.accessibilityIdentifier = "loading_view"
                loadingView.backgroundColor = UIColor.black.withAlphaComponent(0.5) // Semi-transparent background

                // Configure Lottie Animation View
                let animationView = LottieAnimationView(name: "ondeen-loader") // Use your JSON file name (without .json)

                animationView.frame = CGRect(x: 0, y: 0, width: 200, height: 200) // Set width & height to 200x200
                animationView.center = CGPoint(x: topVC.view.bounds.midX, y: topVC.view.bounds.midY) // Center in parent view                animationView.center = loadingView.center
                animationView.loopMode = .loop
                animationView.play()

                // Add animationView to loadingView
                loadingView.addSubview(animationView)
                topVC.view.addSubview(loadingView)
            }
        }
    }
    func removeLoading() {
        DispatchQueue.main.async {
            if let topVC = topViewController() {
                if let loadingView = topVC.view.subviews.first(where: { $0.tag == 999 && $0.accessibilityIdentifier == "loading_view" }) {
                    loadingView.removeFromSuperview()
                }
            }
        }
    }*/
    func showInternetView(){
        DispatchQueue.main.async {
            if let topVC = topViewController() {
                Utils.showToast(message: "No internet connection")
            }
        }
    }
    
    func showLoading() {
        LoadingManager.shared.show()

//        DispatchQueue.main.async {
//            guard let window = UIApplication.shared.windows.first else { return }
//
//            // Check if already showing
//            if window.viewWithTag(999) != nil { return }
//
//            let loadingView = UIView(frame: window.bounds)
//            loadingView.tag = 999
//            loadingView.accessibilityIdentifier = "loading_view"
//            loadingView.backgroundColor = UIColor.black.withAlphaComponent(0.5)
//
//            let animationView = LottieAnimationView(name: "ondeen-loader")
//            animationView.frame = CGRect(x: 0, y: 0, width: 200, height: 200)
//            animationView.center = loadingView.center
//            animationView.loopMode = .loop
//            animationView.play()
//
//            loadingView.addSubview(animationView)
//            window.addSubview(loadingView)
//        }
    }

    func removeLoading() {
        LoadingManager.shared.hide()
//        DispatchQueue.main.async {
//            guard let window = UIApplication.shared.windows.first else { return }
//
//            if let loadingView = window.viewWithTag(999) {
//                loadingView.removeFromSuperview()
//            }
//        }
    }
}
/*final class LoadingManager {
    static let shared = LoadingManager()
    
    private var loadingView: UIView?
    
    private init() {}
    
    func show() {
        guard let window = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap({ $0.windows })
            .first(where: { $0.isKeyWindow }) else { return }
        
        // Avoid showing multiple times
        if loadingView != nil { return }
        
        let loader = UIView(frame: window.bounds)
        loader.tag = 999
        loader.accessibilityIdentifier = "loading_view"
        loader.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        
        let animationView = LottieAnimationView(name: "ondeen-loader")
        animationView.frame = CGRect(x: 0, y: 0, width: 200, height: 200)
        animationView.center = loader.center
        animationView.loopMode = .loop
        animationView.play()
        
        loader.addSubview(animationView)
        window.addSubview(loader)
        
        self.loadingView = loader
    }
    
    func hide() {
        DispatchQueue.main.async { [weak self] in
            self?.loadingView?.removeFromSuperview()
            self?.loadingView = nil
        }
    }
}
*/
final class LoadingManager {
    static let shared = LoadingManager()

    private var loadingView: UIView?
    private var showCount = 0
    private let lock = NSLock() // thread safety

    private init() {}

    func show() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.lock.lock()
            self.showCount += 1
            let shouldShow = self.showCount == 1
            self.lock.unlock()

            if shouldShow {
                self.addLoadingView()
            }
        }
    }

    func hide() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            self.lock.lock()
            self.showCount = max(0, self.showCount - 1)
            let shouldHide = self.showCount == 0
            self.lock.unlock()

            if shouldHide {
                self.loadingView?.removeFromSuperview()
                self.loadingView = nil
            }
        }
    }

    private func addLoadingView() {
        guard let window = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap({ $0.windows })
            .first(where: { $0.isKeyWindow }) else { return }

        let loader = UIView(frame: window.bounds)
        loader.tag = 999
        loader.accessibilityIdentifier = "loading_view"
        loader.backgroundColor = UIColor.black.withAlphaComponent(0.5)

        let animationView = LottieAnimationView(name: "ondeen-loader")
        animationView.frame = CGRect(x: 0, y: 0, width: 200, height: 200)
        animationView.center = loader.center
        animationView.loopMode = .loop
        animationView.play()

        loader.addSubview(animationView)
        window.addSubview(loader)

        self.loadingView = loader
    }
}
