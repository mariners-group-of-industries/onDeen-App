//
//	EventDetailItinerary.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailItinerary : NSObject{

	var arTitle : String!
	var day : Int!
	var endTime : String!
	var id : Int!
	var startTime : String!
	var status : Int!
	var title : String!
    var startDate : String!
    var endDate : String!
    var time_zone : String!

	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
        startDate = dictionary["start_date"] as? String ?? ""
        endDate = dictionary["end_date"] as? String ?? ""
		arTitle = dictionary["ar_title"] as? String ?? ""
		day = dictionary["day"] as? Int ?? 0
		endTime = dictionary["end_time"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		startTime = dictionary["start_time"] as? String ?? ""
		status = dictionary["status"] as? Int ?? 0
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
        if arTitle != nil{
            dictionary["ar_title"] = arTitle
        }
        if day != nil{
            dictionary["day"] = day
        }
        if endTime != nil{
            dictionary["end_time"] = endTime
        }
        if id != nil{
            dictionary["id"] = id
        }
        if startTime != nil{
            dictionary["start_time"] = startTime
        }
        if status != nil{
            dictionary["status"] = status
        }
        if title != nil{
            dictionary["title"] = title
        }
        return dictionary
    }
}
