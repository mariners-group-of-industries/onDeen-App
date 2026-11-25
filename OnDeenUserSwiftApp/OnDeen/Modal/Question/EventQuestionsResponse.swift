//
//	EventQuestionsResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventQuestionsResponse : NSObject{
    let organizationName : String?
	var answer : String!
	var createdOn : String!
	var eventId : Int!
	var id : Int!
	var organizerFirstName : String!
	var organizerId : Int!
	var organizerLastName : String!
	var organizerProfileImage : String!
	var question : String!
	var updatedOn : String!
	var userFirstName : String!
	var userId : Int!
	var userLastName : String!
    var userProfileImage : String!
	var time_zone : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
		answer = dictionary["answer"] as? String ?? ""
		createdOn = dictionary["created_on"] as? String ?? ""
		eventId = dictionary["event_id"] as? Int ?? 0
		id = dictionary["id"] as? Int ?? 0
		organizerFirstName = dictionary["organizer_first_name"] as? String ?? ""
		organizerId = dictionary["organizer_id"] as? Int ?? 0
		organizerLastName = dictionary["organizer_last_name"] as? String ?? ""
		organizerProfileImage = dictionary["organizer_profile_image"] as? String ?? ""
		question = dictionary["question"] as? String ?? ""
		updatedOn = dictionary["updated_on"] as? String ?? ""
		userFirstName = dictionary["user_first_name"] as? String ?? ""
		userId = dictionary["user_id"] as? Int ?? 0
		userLastName = dictionary["user_last_name"] as? String ?? ""
		userProfileImage = dictionary["user_profile_image"] as? String ?? ""
        organizationName = dictionary["organization_name"] as? String
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
        if time_zone != nil{
            dictionary["time_zone"] = time_zone
        }
		if answer != nil{
			dictionary["answer"] = answer
		}
		if createdOn != nil{
			dictionary["created_on"] = createdOn
		}
		if eventId != nil{
			dictionary["event_id"] = eventId
		}
		if id != nil{
			dictionary["id"] = id
		}
		if organizerFirstName != nil{
			dictionary["organizer_first_name"] = organizerFirstName
		}
		if organizerId != nil{
			dictionary["organizer_id"] = organizerId
		}
		if organizerLastName != nil{
			dictionary["organizer_last_name"] = organizerLastName
		}
		if organizerProfileImage != nil{
			dictionary["organizer_profile_image"] = organizerProfileImage
		}
		if question != nil{
			dictionary["question"] = question
		}
		if updatedOn != nil{
			dictionary["updated_on"] = updatedOn
		}
		if userFirstName != nil{
			dictionary["user_first_name"] = userFirstName
		}
		if userId != nil{
			dictionary["user_id"] = userId
		}
		if userLastName != nil{
			dictionary["user_last_name"] = userLastName
		}
		if userProfileImage != nil{
			dictionary["user_profile_image"] = userProfileImage
		}
		return dictionary
	}
}
