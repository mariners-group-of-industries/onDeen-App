//
//	EventDetailCurriculum.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailCurriculum : NSObject{

	var arDescription : String!
	var descriptionField : String!
	var endDate : String!
	var endTime : String!
	var id : Int!
	var noOfDays : Int!
	var startDate : String!
    var time_zone : String!
	var startTime : String!
	var status : Int!
    var activeNow : Int!

	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
		arDescription = dictionary["ar_description"] as? String ?? ""
		descriptionField = dictionary["description"] as? String ?? ""
		endDate = dictionary["end_date"] as? String ?? ""
		endTime = dictionary["end_time"] as? String ?? ""
        id = dictionary["id"] as? Int ?? 0
        activeNow = dictionary["active_now"] as? Int ?? 0
		noOfDays = dictionary["no_of_days"] as? Int ?? 0
		startDate = dictionary["start_date"] as? String ?? ""
		startTime = dictionary["start_time"] as? String ?? ""
		status = dictionary["status"] as? Int ?? 0
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
        if activeNow != nil{
            dictionary["active_now"] = activeNow
        }
		if arDescription != nil{
			dictionary["ar_description"] = arDescription
		}
		if descriptionField != nil{
			dictionary["description"] = descriptionField
		}
		if endDate != nil{
			dictionary["end_date"] = endDate
		}
		if endTime != nil{
			dictionary["end_time"] = endTime
		}
		if id != nil{
			dictionary["id"] = id
		}
		if noOfDays != nil{
			dictionary["no_of_days"] = noOfDays
		}
		if startDate != nil{
			dictionary["start_date"] = startDate
		}
		if startTime != nil{
			dictionary["start_time"] = startTime
		}
		if status != nil{
			dictionary["status"] = status
		}
		return dictionary
	}
}
