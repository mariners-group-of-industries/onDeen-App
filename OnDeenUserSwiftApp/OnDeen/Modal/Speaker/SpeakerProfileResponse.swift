//
//	SpeakerProfileResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class SpeakerProfileResponse : NSObject{
    var speakerId : Int!
    var speakerEventId : Int!
    var aboutUs : String!
	var countryOfResidence : String!
	var eventList : SpeakerProfileEventList!
	var formalIdDocument : String!
	var userCountryCode : String!
	var userEmailId : String!
	var userFirstName : String!
	var userLastName : String!
	var userMobileNumber : String!
    var userProfileImage : String!
    var nextAvailableDate : String!
	var numberOfAbout : Int = 2
    var slotCount : Int!
    var expertise : [SpeakerProfileExpertise]!
	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        expertise = [SpeakerProfileExpertise]()
        if let expertiseArray = dictionary["expertise"] as? [[String:Any]]{
            for dic in expertiseArray{
                let value = SpeakerProfileExpertise(fromDictionary: dic)
                if !value.title.isEmpty{
                    expertise.append(value)
                }
            }
        }

        speakerId = dictionary["speakerId"] as? Int ?? 0
        speakerEventId = dictionary["speakerEventId"] as? Int ?? 0
        slotCount = dictionary["slot_count"] as? Int ?? 0
        nextAvailableDate = dictionary["next_available_date"] as? String ?? ""
        aboutUs = dictionary["about_us"] as? String ?? ""
		countryOfResidence = dictionary["country_of_residence"] as? String ?? ""
		if let eventListData = dictionary["event_list"] as? [String:Any]{
			eventList = SpeakerProfileEventList(fromDictionary: eventListData)
		}
		formalIdDocument = dictionary["formal_id_document"] as? String ?? ""
		userCountryCode = dictionary["user_country_code"] as? String ?? ""
		userEmailId = dictionary["user_email_id"] as? String ?? ""
		userFirstName = dictionary["user_first_name"] as? String ?? ""
        userFirstName = userFirstName.trimmingCharacters(in: .whitespacesAndNewlines)
		userLastName = dictionary["user_last_name"] as? String ?? ""
        userLastName = userLastName.trimmingCharacters(in: .whitespacesAndNewlines)
		userMobileNumber = dictionary["user_mobile_number"] as? String ?? ""
		userProfileImage = dictionary["user_profile_image"] as? String ?? ""
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
        if nextAvailableDate != nil{
            dictionary["next_available_date"] = nextAvailableDate
        }
        if slotCount != nil{
            dictionary["slot_count"] = slotCount
        }
		if aboutUs != nil{
			dictionary["about_us"] = aboutUs
		}
		if countryOfResidence != nil{
			dictionary["country_of_residence"] = countryOfResidence
		}
		if eventList != nil{
			dictionary["event_list"] = eventList.toDictionary()
		}
		if formalIdDocument != nil{
			dictionary["formal_id_document"] = formalIdDocument
		}
		if userCountryCode != nil{
			dictionary["user_country_code"] = userCountryCode
		}
		if userEmailId != nil{
			dictionary["user_email_id"] = userEmailId
		}
		if userFirstName != nil{
			dictionary["user_first_name"] = userFirstName
		}
		if userLastName != nil{
			dictionary["user_last_name"] = userLastName
		}
		if userMobileNumber != nil{
			dictionary["user_mobile_number"] = userMobileNumber
		}
		if userProfileImage != nil{
			dictionary["user_profile_image"] = userProfileImage
		}
		return dictionary
	}
}
class SpeakerProfileExpertise : NSObject{

    var title : String!


    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        title = dictionary["title"] as? String ?? ""
    }

    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if title != nil{
            dictionary["title"] = title
        }
        return dictionary
    }
}
