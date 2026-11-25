//
//	EventDetailTag.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailTag : NSObject, NSCoding{

	var id : Int!
	var status : Int!
	var tagId : Int!
	var title : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		id = dictionary["id"] as? Int ?? 0
		status = dictionary["status"] as? Int ?? 0
		tagId = dictionary["tag_id"] as? Int ?? 0
		title = dictionary["title"] as? String ?? ""
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if id != nil{
			dictionary["id"] = id
		}
		if status != nil{
			dictionary["status"] = status
		}
		if tagId != nil{
			dictionary["tag_id"] = tagId
		}
		if title != nil{
			dictionary["title"] = title
		}
		return dictionary
	}

    /**
    * NSCoding required initializer.
    * Fills the data from the passed decoder
    */
    @objc required init(coder aDecoder: NSCoder)
	{
         id = aDecoder.decodeObject(forKey: "id") as? Int ?? 0
         status = aDecoder.decodeObject(forKey: "status") as? Int ?? 0
         tagId = aDecoder.decodeObject(forKey: "tag_id") as? Int ?? 0
         title = aDecoder.decodeObject(forKey: "title") as? String ?? ""

	}

    /**
    * NSCoding required method.
    * Encodes mode properties into the decoder
    */
    @objc func encode(with aCoder: NSCoder)
	{
		if id != nil{
			aCoder.encode(id, forKey: "id")
		}
		if status != nil{
			aCoder.encode(status, forKey: "status")
		}
		if tagId != nil{
			aCoder.encode(tagId, forKey: "tag_id")
		}
		if title != nil{
			aCoder.encode(title, forKey: "title")
		}

	}

}
