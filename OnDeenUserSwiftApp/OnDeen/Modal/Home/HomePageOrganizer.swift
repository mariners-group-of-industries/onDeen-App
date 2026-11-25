//
//	HomePageOrganizer.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class HomePageOrganizer : NSObject{

	var eventCount : Int!
	var id : Int!
	var title : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		eventCount = dictionary["event_count"] as? Int ?? 0
		id = dictionary["id"] as? Int ?? 0
		title = dictionary["title"] as? String ?? ""
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if eventCount != nil{
			dictionary["event_count"] = eventCount
		}
		if id != nil{
			dictionary["id"] = id
		}
		if title != nil{
			dictionary["title"] = title
		}
		return dictionary
	}
}
