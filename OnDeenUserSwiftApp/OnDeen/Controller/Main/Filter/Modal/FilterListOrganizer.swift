//
//	FilterListOrganizer.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class FilterListOrganizer : NSObject{

	var id : Int!
	var organizationName : String!
	var profileImage : String!
    var isSelected : Bool = false

	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		id = dictionary["id"] as? Int ?? 0
		organizationName = dictionary["organization_name"] as? String ?? ""
		profileImage = dictionary["profile_image"] as? String ?? ""
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
		if organizationName != nil{
			dictionary["organization_name"] = organizationName
		}
		if profileImage != nil{
			dictionary["profile_image"] = profileImage
		}
		return dictionary
	}
}
