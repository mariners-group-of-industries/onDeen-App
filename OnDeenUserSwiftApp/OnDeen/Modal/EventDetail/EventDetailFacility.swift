//
//	EventDetailFacility.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailFacility : NSObject, NSCoding{

	var facilitiesId : Int!
	var facilitiesTitle : String!
	var id : Int!
	var status : Int!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		facilitiesId = dictionary["facilities_id"] as? Int ?? 0
		facilitiesTitle = dictionary["facilities_title"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		status = dictionary["status"] as? Int ?? 0
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if facilitiesId != nil{
			dictionary["facilities_id"] = facilitiesId
		}
		if facilitiesTitle != nil{
			dictionary["facilities_title"] = facilitiesTitle
		}
		if id != nil{
			dictionary["id"] = id
		}
		if status != nil{
			dictionary["status"] = status
		}
		return dictionary
	}

    /**
    * NSCoding required initializer.
    * Fills the data from the passed decoder
    */
    @objc required init(coder aDecoder: NSCoder)
	{
         facilitiesId = aDecoder.decodeObject(forKey: "facilities_id") as? Int ?? 0
         facilitiesTitle = aDecoder.decodeObject(forKey: "facilities_title") as? String ?? ""
         id = aDecoder.decodeObject(forKey: "id") as? Int ?? 0
         status = aDecoder.decodeObject(forKey: "status") as? Int ?? 0

	}

    /**
    * NSCoding required method.
    * Encodes mode properties into the decoder
    */
    @objc func encode(with aCoder: NSCoder)
	{
		if facilitiesId != nil{
			aCoder.encode(facilitiesId, forKey: "facilities_id")
		}
		if facilitiesTitle != nil{
			aCoder.encode(facilitiesTitle, forKey: "facilities_title")
		}
		if id != nil{
			aCoder.encode(id, forKey: "id")
		}
		if status != nil{
			aCoder.encode(status, forKey: "status")
		}

	}

}
