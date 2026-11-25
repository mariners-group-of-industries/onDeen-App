//
//	EventDetailSpeaker.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailSpeaker : NSObject, NSCoding{

	var firstName : String!
	var id : Int!
	var lastName : String!
	var profileImage : String!
	var status : Int!
	var userId : Int!
    var eventId : Int!

	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		firstName = dictionary["first_name"] as? String ?? ""
        firstName = firstName.trimmingCharacters(in: .whitespacesAndNewlines)
        id = dictionary["id"] as? Int ?? 0
        eventId = dictionary["eventId"] as? Int ?? 0
		lastName = dictionary["last_name"] as? String ?? ""
        lastName = lastName.trimmingCharacters(in: .whitespacesAndNewlines)
		profileImage = dictionary["profile_image"] as? String ?? ""
		status = dictionary["status"] as? Int ?? 0
		userId = dictionary["user_id"] as? Int ?? 0
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
		if eventId != nil{
			dictionary["eventId"] = eventId
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
		if status != nil{
			dictionary["status"] = status
		}
		if userId != nil{
			dictionary["user_id"] = userId
		}
		return dictionary
	}

    /**
    * NSCoding required initializer.
    * Fills the data from the passed decoder
    */
    @objc required init(coder aDecoder: NSCoder)
	{
         firstName = aDecoder.decodeObject(forKey: "first_name") as? String ?? ""
         id = aDecoder.decodeObject(forKey: "id") as? Int ?? 0
         lastName = aDecoder.decodeObject(forKey: "last_name") as? String ?? ""
         profileImage = aDecoder.decodeObject(forKey: "profile_image") as? String ?? ""
         status = aDecoder.decodeObject(forKey: "status") as? Int ?? 0
         userId = aDecoder.decodeObject(forKey: "user_id") as? Int ?? 0

	}

    /**
    * NSCoding required method.
    * Encodes mode properties into the decoder
    */
    @objc func encode(with aCoder: NSCoder)
	{
		if firstName != nil{
			aCoder.encode(firstName, forKey: "first_name")
		}
		if id != nil{
			aCoder.encode(id, forKey: "id")
		}
		if lastName != nil{
			aCoder.encode(lastName, forKey: "last_name")
		}
		if profileImage != nil{
			aCoder.encode(profileImage, forKey: "profile_image")
		}
		if status != nil{
			aCoder.encode(status, forKey: "status")
		}
		if userId != nil{
			aCoder.encode(userId, forKey: "user_id")
		}

	}

}
