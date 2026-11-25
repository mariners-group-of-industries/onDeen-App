//
//	MYMembershipModal.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class MYMembershipModal : NSObject, NSCoding{

	var response : MYMembershipResponse!
	var status : Bool!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		if let responseData = dictionary["response"] as? [String:Any]{
			response = MYMembershipResponse(fromDictionary: responseData)
		}
		status = dictionary["status"] as? Bool ?? false
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if response != nil{
			dictionary["response"] = response.toDictionary()
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
         response = aDecoder.decodeObject(forKey: "response") as? MYMembershipResponse
         status = aDecoder.decodeObject(forKey: "status") as? Bool

	}

    /**
    * NSCoding required method.
    * Encodes mode properties into the decoder
    */
    @objc func encode(with aCoder: NSCoder)
	{
		if response != nil{
			aCoder.encode(response, forKey: "response")
		}
		if status != nil{
			aCoder.encode(status, forKey: "status")
		}

	}

}
