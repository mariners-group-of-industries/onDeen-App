//
//	CommonResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class CommonResponse : NSObject{

	var message : String!
	var status : Bool!
    var extra : String!
    var token : String!
    var paymentStatus : String!
    var isRegister : Bool!
    var confirm : Int!
	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        isRegister = dictionary["is_register"] as? Bool ?? false
        paymentStatus = dictionary["payment_status"] as? String ?? ""
        token = dictionary["token"] as? String ?? ""
        extra = dictionary["extra"] as? String ?? ""
		message = dictionary["message"] as? String ?? ""
        status = dictionary["status"] as? Bool ?? false
        confirm = dictionary["confirm"] as? Int ?? 0
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
        if isRegister != nil{
            dictionary["is_register"] = isRegister
        }
		if message != nil{
			dictionary["message"] = message
		}
		if status != nil{
			dictionary["status"] = status
		}
		return dictionary
	}

}
