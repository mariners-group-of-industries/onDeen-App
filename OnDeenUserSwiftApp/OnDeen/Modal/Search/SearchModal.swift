//
//	SearchModal.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class SearchModal : NSObject{

    var response : [SearchResponse]!
    var trending : [SearchResponse]!
	var history : [SearchResponse]!
	var status : Bool!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        response = [SearchResponse]()
        if let responseArray = dictionary["response"] as? [[String:Any]]{
            for dic in responseArray{
                let value = SearchResponse(fromDictionary: dic)
                response.append(value)
            }
        }else if let getResponse = dictionary["response"] as? [String:Any]{
            trending = [SearchResponse]()
            if let responseArray = getResponse["trending"] as? [[String:Any]]{
                for dic in responseArray{
                    let value = SearchResponse(fromDictionary: dic)
                    trending.append(value)
                }
            }
            history = [SearchResponse]()
            if let responseArray = getResponse["history"] as? [[String:Any]]{
                for dic in responseArray{
                    let value = SearchResponse(fromDictionary: dic)
                    history.append(value)
                }
            }
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
            var dictionaryElements = [[String:Any]]()
            for responseElement in response {
                dictionaryElements.append(responseElement.toDictionary())
            }
            dictionary["response"] = dictionaryElements
        }
        if status != nil{
            dictionary["status"] = status
        }
        return dictionary
    }

}
