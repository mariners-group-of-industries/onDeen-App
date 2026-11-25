//
//	FilterListSpeaker.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class FilterListSpeaker : NSObject{
    
    var firstName : String!
    var id : Int!
    var lastName : String!
    var profileImage : String!
    var isSelected : Bool = false

    
    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        firstName = dictionary["first_name"] as? String ?? ""
        id = dictionary["id"] as? Int ?? 0
        lastName = dictionary["last_name"] as? String ?? ""
        profileImage = dictionary["profile_image"] as? String ?? ""
    }
    
    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if firstName != nil{
            dictionary["first_name"] = firstName
        }
        if id != nil{
            dictionary["id"] = id
        }
        if lastName != nil{
            dictionary["last_name"] = lastName
        }
        if profileImage != nil{
            dictionary["profile_image"] = profileImage
        }
        return dictionary
    }
}
