//
//	MYMembershipResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class MYMembershipResponse : NSObject, NSCoding{

	var membership : [MYMembershipMembership]!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		membership = [MYMembershipMembership]()
		if let membershipArray = dictionary["membership"] as? [[String:Any]]{
			for dic in membershipArray{
				let value = MYMembershipMembership(fromDictionary: dic)
				membership.append(value)
			}
		}
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if membership != nil{
			var dictionaryElements = [[String:Any]]()
			for membershipElement in membership {
				dictionaryElements.append(membershipElement.toDictionary())
			}
			dictionary["membership"] = dictionaryElements
		}
		return dictionary
	}

    /**
    * NSCoding required initializer.
    * Fills the data from the passed decoder
    */
    @objc required init(coder aDecoder: NSCoder)
	{
         membership = aDecoder.decodeObject(forKey :"membership") as? [MYMembershipMembership]

	}

    /**
    * NSCoding required method.
    * Encodes mode properties into the decoder
    */
    @objc func encode(with aCoder: NSCoder)
	{
		if membership != nil{
			aCoder.encode(membership, forKey: "membership")
		}

	}

}