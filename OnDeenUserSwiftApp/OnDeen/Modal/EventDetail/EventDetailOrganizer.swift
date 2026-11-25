//
//	EventDetailOrganizer.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailOrganizer : NSObject, NSCoding{

	var eventCount : Int!
	var logo : String!
	var name : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		eventCount = dictionary["event_count"] as? Int ?? 0
		logo = dictionary["logo"] as? String ?? ""
		name = dictionary["name"] as? String ?? ""
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
		if logo != nil{
			dictionary["logo"] = logo
		}
		if name != nil{
			dictionary["name"] = name
		}
		return dictionary
	}

    /**
    * NSCoding required initializer.
    * Fills the data from the passed decoder
    */
    @objc required init(coder aDecoder: NSCoder)
	{
         eventCount = aDecoder.decodeObject(forKey: "event_count") as? Int ?? 0
         logo = aDecoder.decodeObject(forKey: "logo") as? String ?? ""
         name = aDecoder.decodeObject(forKey: "name") as? String ?? ""

	}

    /**
    * NSCoding required method.
    * Encodes mode properties into the decoder
    */
    @objc func encode(with aCoder: NSCoder)
	{
		if eventCount != nil{
			aCoder.encode(eventCount, forKey: "event_count")
		}
		if logo != nil{
			aCoder.encode(logo, forKey: "logo")
		}
		if name != nil{
			aCoder.encode(name, forKey: "name")
		}

	}

}
