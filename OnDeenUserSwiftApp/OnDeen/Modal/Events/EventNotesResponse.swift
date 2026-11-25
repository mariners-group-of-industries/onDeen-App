//
//	EventNotesResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventNotesResponse : NSObject{

	var createdOn : String!
	var eventId : Int!
	var id : Int!
	var notes : String!
    var title : String!
	var time_zone : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
		createdOn = dictionary["created_on"] as? String ?? ""
		eventId = dictionary["event_id"] as? Int ?? 0
		id = dictionary["id"] as? Int ?? 0
		notes = dictionary["notes"] as? String ?? ""
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
		if createdOn != nil{
			dictionary["created_on"] = createdOn
		}
		if eventId != nil{
			dictionary["event_id"] = eventId
		}
		if id != nil{
			dictionary["id"] = id
		}
		if notes != nil{
			dictionary["notes"] = notes
		}
		if title != nil{
			dictionary["title"] = title
		}
		return dictionary
	}


}
