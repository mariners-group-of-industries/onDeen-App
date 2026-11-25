//
//	HomePageCategory.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class HomePageCategory : NSObject{

	var arTitle : String!
	var id : Int!
	var image : String!
	var title : String!
    var isSelected : Bool = false

	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		arTitle = dictionary["ar_title"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		image = dictionary["image"] as? String ?? ""
		title = dictionary["title"] as? String ?? ""
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if arTitle != nil{
			dictionary["ar_title"] = arTitle
		}
		if id != nil{
			dictionary["id"] = id
		}
		if image != nil{
			dictionary["image"] = image
		}
		if title != nil{
			dictionary["title"] = title
		}
		return dictionary
	}
}
