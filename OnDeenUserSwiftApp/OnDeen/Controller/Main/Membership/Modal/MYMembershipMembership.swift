//
//	MYMembershipMembership.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class MYMembershipMembership : NSObject{

	var descriptionField : String!
	var endsOn : String!
	var id : Int!
	var membershipId : Int!
	var purchasedOn : String!
	var subTitle : String!
    var title : String!
	var time_zone : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
		descriptionField = dictionary["description"] as? String ?? ""
		endsOn = dictionary["ends_on"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		membershipId = dictionary["membership_id"] as? Int ?? 0
		purchasedOn = dictionary["purchased_on"] as? String ?? ""
		subTitle = dictionary["sub_title"] as? String ?? ""
		title = dictionary["title"] as? String ?? ""
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
		if descriptionField != nil{
			dictionary["description"] = descriptionField
		}
		if endsOn != nil{
			dictionary["ends_on"] = endsOn
		}
		if id != nil{
			dictionary["id"] = id
		}
		if membershipId != nil{
			dictionary["membership_id"] = membershipId
		}
		if purchasedOn != nil{
			dictionary["purchased_on"] = purchasedOn
		}
		if subTitle != nil{
			dictionary["sub_title"] = subTitle
		}
		if title != nil{
			dictionary["title"] = title
		}
		return dictionary
	}

}
