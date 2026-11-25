//
//	OrganizerDetailResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class OrganizerDetailResponse : NSObject{

    var aboutUs : String!
	var countryCode : String!
	var emailId : String!
	var eventList : OrganizerDetailEventList!
	var foundationDate : String!
	var latitude : Float!
	var location : String!
	var longitude : Float!
	var managerName : String!
	var mobileNumber : String!
	var organizationName : String!
	var profileImage : String!
    var numberOfAbout : Int = 2
    var ratingCount : Int = 0
    /**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        ratingCount = dictionary["rating_count"] as? Int ?? 0
        aboutUs = dictionary["about_us"] as? String ?? ""
		countryCode = dictionary["country_code"] as? String ?? ""
		emailId = dictionary["email_id"] as? String ?? ""
		if let eventListData = dictionary["event_list"] as? [String:Any]{
			eventList = OrganizerDetailEventList(fromDictionary: eventListData)
		}
		foundationDate = dictionary["foundation_date"] as? String ?? ""
		latitude = dictionary["latitude"] as? Float ?? 0.0
		location = dictionary["location"] as? String ?? ""
		longitude = dictionary["longitude"] as? Float ?? 0.0
		managerName = dictionary["manager_name"] as? String ?? ""
		mobileNumber = dictionary["mobile_number"] as? String ?? ""
		organizationName = dictionary["organization_name"] as? String ?? ""
		profileImage = dictionary["profile_image"] as? String ?? ""
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if aboutUs != nil{
			dictionary["about_us"] = aboutUs
		}
		if countryCode != nil{
			dictionary["country_code"] = countryCode
		}
		if emailId != nil{
			dictionary["email_id"] = emailId
		}
		if eventList != nil{
			dictionary["event_list"] = eventList.toDictionary()
		}
		if foundationDate != nil{
			dictionary["foundation_date"] = foundationDate
		}
		if latitude != nil{
			dictionary["latitude"] = latitude
		}
		if location != nil{
			dictionary["location"] = location
		}
		if longitude != nil{
			dictionary["longitude"] = longitude
		}
		if managerName != nil{
			dictionary["manager_name"] = managerName
		}
		if mobileNumber != nil{
			dictionary["mobile_number"] = mobileNumber
		}
		if organizationName != nil{
			dictionary["organization_name"] = organizationName
		}
		if profileImage != nil{
			dictionary["profile_image"] = profileImage
		}
		return dictionary
	}
}
