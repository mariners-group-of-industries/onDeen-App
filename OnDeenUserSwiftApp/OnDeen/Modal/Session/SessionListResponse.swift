//
//	SessionListResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class SessionListResponse : NSObject{

    var buddyFirstName : String!
	var buddyId : Int!
	var buddyLastName : String!
	var createdOn : String!
	var date : String!
	var eventId : Int!
	var eventTitle : String!
	var id : Int!
	var meetLink : String!
	var organizationName : String!
	var speakerId : Int!
	var status : Int!
	var time : String!
	var type : Int!
	var userComment : String!
	var userId : Int!
    var userProfileImage : String!
    var speakerFirstname : String!
    var speakerLastName : String!
    var speakerImage : String!
	var time_zone : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
        speakerFirstname = dictionary["speaker_first_name"] as? String ?? ""
        speakerLastName = dictionary["speaker_last_name"] as? String ?? ""
        speakerImage = dictionary["speaker_image"] as? String ?? ""
		buddyFirstName = dictionary["buddy_first_name"] as? String ?? ""
		buddyId = dictionary["buddy_id"] as? Int ?? 0
		buddyLastName = dictionary["buddy_last_name"] as? String ?? ""
		createdOn = dictionary["created_on"] as? String ?? ""
		date = dictionary["date"] as? String ?? ""
		eventId = dictionary["event_id"] as? Int ?? 0
		eventTitle = dictionary["event_title"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		meetLink = dictionary["meet_link"] as? String ?? ""
		organizationName = dictionary["organization_name"] as? String ?? ""
		speakerId = dictionary["speaker_id"] as? Int ?? 0
		status = dictionary["status"] as? Int ?? 0
		time = dictionary["time"] as? String ?? ""
		type = dictionary["type"] as? Int ?? 0
		userComment = dictionary["user_comment"] as? String ?? ""
		userId = dictionary["user_id"] as? Int ?? 0
		userProfileImage = dictionary["user_profile_image"] as? String ?? ""
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
        if speakerFirstname != nil{
            dictionary["speaker_first_name"] = speakerFirstname
        }
        if speakerLastName != nil{
            dictionary["speaker_last_name"] = speakerLastName
        }
        if speakerImage != nil{
            dictionary["speaker_image"] = speakerImage
        }
		if buddyFirstName != nil{
			dictionary["buddy_first_name"] = buddyFirstName
		}
		if buddyId != nil{
			dictionary["buddy_id"] = buddyId
		}
		if buddyLastName != nil{
			dictionary["buddy_last_name"] = buddyLastName
		}
		if createdOn != nil{
			dictionary["created_on"] = createdOn
		}
		if date != nil{
			dictionary["date"] = date
		}
		if eventId != nil{
			dictionary["event_id"] = eventId
		}
		if eventTitle != nil{
			dictionary["event_title"] = eventTitle
		}
		if id != nil{
			dictionary["id"] = id
		}
		if meetLink != nil{
			dictionary["meet_link"] = meetLink
		}
		if organizationName != nil{
			dictionary["organization_name"] = organizationName
		}
		if speakerId != nil{
			dictionary["speaker_id"] = speakerId
		}
		if status != nil{
			dictionary["status"] = status
		}
		if time != nil{
			dictionary["time"] = time
		}
		if type != nil{
			dictionary["type"] = type
		}
		if userComment != nil{
			dictionary["user_comment"] = userComment
		}
		if userId != nil{
			dictionary["user_id"] = userId
		}
		if userProfileImage != nil{
			dictionary["user_profile_image"] = userProfileImage
		}
		return dictionary
	}
}
