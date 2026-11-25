//
//	SpeakerProfileImage.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class SpeakerProfileImage : NSObject{

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
}
