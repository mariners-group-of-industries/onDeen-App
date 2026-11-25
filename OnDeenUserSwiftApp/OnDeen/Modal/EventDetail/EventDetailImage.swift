//
//	EventDetailImage.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailImage : NSObject, NSCoding{

	var croppedImage : String!
	var fullScreenImage : String!
	var id : Int!
	var status : Int!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		croppedImage = dictionary["cropped_image"] as? String ?? ""
		fullScreenImage = dictionary["full_screen_image"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		status = dictionary["status"] as? Int ?? 0
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if croppedImage != nil{
			dictionary["cropped_image"] = croppedImage
		}
		if fullScreenImage != nil{
			dictionary["full_screen_image"] = fullScreenImage
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
         croppedImage = aDecoder.decodeObject(forKey: "cropped_image") as? String ?? ""
         fullScreenImage = aDecoder.decodeObject(forKey: "full_screen_image") as? String ?? ""
         id = aDecoder.decodeObject(forKey: "id") as? Int ?? 0
         status = aDecoder.decodeObject(forKey: "status") as? Int ?? 0

	}

    /**
    * NSCoding required method.
    * Encodes mode properties into the decoder
    */
    @objc func encode(with aCoder: NSCoder)
	{
		if croppedImage != nil{
			aCoder.encode(croppedImage, forKey: "cropped_image")
		}
		if fullScreenImage != nil{
			aCoder.encode(fullScreenImage, forKey: "full_screen_image")
		}
		if id != nil{
			aCoder.encode(id, forKey: "id")
		}
		if status != nil{
			aCoder.encode(status, forKey: "status")
		}

	}

}
