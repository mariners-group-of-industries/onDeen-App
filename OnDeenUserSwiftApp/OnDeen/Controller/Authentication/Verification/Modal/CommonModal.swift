//
//	CommonModal.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class CommonModal : NSObject{

	var message : Bool!
	var response : CommonResponse!
	var status : Bool!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		message = dictionary["message"] as? Bool ?? false
        response = CommonResponse(fromDictionary: [String:Any]())
		if let responseData = dictionary["response"] as? [String:Any]{
			response = CommonResponse(fromDictionary: responseData)
		}else if let responseData = dictionary["response"] as? String{
            response = CommonResponse(fromDictionary: ["message":responseData])
        }
		status = dictionary["status"] as? Bool ?? false
        response.status = status
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if message != nil{
			dictionary["message"] = message
		}
		if response != nil{
			dictionary["response"] = response.toDictionary()
		}
		if status != nil{
			dictionary["status"] = status
		}
		return dictionary
	}
}
