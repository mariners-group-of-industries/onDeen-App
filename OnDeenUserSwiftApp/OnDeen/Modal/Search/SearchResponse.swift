//
//	SearchResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class SearchResponse : NSObject{

	var categoryImage : String!
	var id : Int!
	var title : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		categoryImage = dictionary["category_image"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		title = dictionary["title"] as? String ?? ""
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if categoryImage != nil{
			dictionary["category_image"] = categoryImage
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
