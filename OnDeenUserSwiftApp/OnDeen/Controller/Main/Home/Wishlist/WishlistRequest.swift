//
//  WishlistRequest.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 26/12/24.
//

class WishlistRequest:NSObject{
    static let instance = WishlistRequest()
    func triggerWishlist(result: @escaping (WishlistingResponse,Bool) -> ()){
        let getAuthorization = UserDefaults.standard.object(forKey: "Authorization") as? String ?? ""
        if getAuthorization.isEmpty{
            if let vc = topViewController(){
                vc.showGuestLogin()
            }
            return
        }
        let apiRequest = APIRequest(path: .wishlist, method: .post,parameters: ["index" : 0,"size":100], headers: .withToken)
        APIDispatcher.instance.dispatch(request: apiRequest) { (resultt) in
            var events = [HomePageEvent]()
            switch resultt {
            case .success(let response):
                print(JSON(response))
                let modal = WishlistingModel.init(fromDictionary: response)
                result(modal.response,true)
            case .failure(let apiError):
                print(apiError.localizedDescription)
                result(WishlistingResponse.init(fromDictionary: [String : Any]()),false)
            }
        }
    }
}
class WishlistingModel : NSObject{
    var response : WishlistingResponse!
    var status : Bool!
    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        if let responseData = dictionary["response"] as? [String:Any]{
            response = WishlistingResponse(fromDictionary: responseData)
        }
        status = dictionary["status"] as? Bool
    }
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if response != nil{
            dictionary["response"] = response.toDictionary()
        }
        if status != nil{
            dictionary["status"] = status
        }
        return dictionary
    }
}
class WishlistingResponse : NSObject{

    var courseWishlist : [HomePageEvent]!
    var tourWishlist : [HomePageEvent]!
    var wishlist : [HomePageEvent]!

    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        courseWishlist = [HomePageEvent]()
        if let tourWishlistArray = dictionary["course_wishlist"] as? [[String:Any]]{
            for dic in tourWishlistArray{
                let value = HomePageEvent(fromDictionary: dic)
                courseWishlist.append(value)
            }
        }

        tourWishlist = [HomePageEvent]()
        if let tourWishlistArray = dictionary["tour_wishlist"] as? [[String:Any]]{
            for dic in tourWishlistArray{
                let value = HomePageEvent(fromDictionary: dic)
                tourWishlist.append(value)
            }
        }

        
        wishlist = [HomePageEvent]()
        if let tourWishlistArray = dictionary["wishlist"] as? [[String:Any]]{
            for dic in tourWishlistArray{
                let value = HomePageEvent(fromDictionary: dic)
                wishlist.append(value)
            }
        }
    }

    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if tourWishlist != nil{
            var dictionaryElements = [[String:Any]]()
            for tourWishlistElement in tourWishlist {
                dictionaryElements.append(tourWishlistElement.toDictionary())
            }
            dictionary["tour_wishlist"] = dictionaryElements
        }
        if courseWishlist != nil{
            var dictionaryElements = [[String:Any]]()
            for tourWishlistElement in courseWishlist {
                dictionaryElements.append(tourWishlistElement.toDictionary())
            }
            dictionary["course_wishlist"] = dictionaryElements
        }
        if wishlist != nil{
            var dictionaryElements = [[String:Any]]()
            for tourWishlistElement in wishlist {
                dictionaryElements.append(tourWishlistElement.toDictionary())
            }
            dictionary["wishlist"] = dictionaryElements
        }
        return dictionary
    }
}
