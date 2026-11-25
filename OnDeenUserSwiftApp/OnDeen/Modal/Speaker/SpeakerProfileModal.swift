//
//	SpeakerProfileModal.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class SpeakerProfileModal : NSObject{
    
    var response : SpeakerProfileResponse!
    var status : Bool!
    
    
    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        if let responseData = dictionary["response"] as? [String:Any]{
            response = SpeakerProfileResponse(fromDictionary: responseData)
        }
        status = dictionary["status"] as? Bool ?? false
    }
    
    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
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
