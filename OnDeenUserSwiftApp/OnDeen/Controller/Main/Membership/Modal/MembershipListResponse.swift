//
//	MembershipListResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class MembershipListResponse : NSObject{

	var membership : MembershipListMembership!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		if let membershipData = dictionary["membership"] as? [String:Any]{
			membership = MembershipListMembership(fromDictionary: membershipData)
		}
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if membership != nil{
			dictionary["membership"] = membership.toDictionary()
		}
		return dictionary
	}
}
