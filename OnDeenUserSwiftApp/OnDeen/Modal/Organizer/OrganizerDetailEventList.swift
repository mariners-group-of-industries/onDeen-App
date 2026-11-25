//
//	OrganizerDetailEventList.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class OrganizerDetailEventList : NSObject{

	var currentPage : Int!
    var events : [HomePageEvent]!
	var pages : Int!
	var perPage : Int!
	var total : Int!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		currentPage = dictionary["current_page"] as? Int ?? 0
		events = [HomePageEvent]()
		if let eventsArray = dictionary["events"] as? [[String:Any]]{
			for dic in eventsArray{
				let value = HomePageEvent(fromDictionary: dic)
				events.append(value)
			}
		}
		pages = dictionary["pages"] as? Int ?? 0
		perPage = dictionary["per_page"] as? Int ?? 0
		total = dictionary["total"] as? Int ?? 0
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if currentPage != nil{
            dictionary["current_page"] = currentPage
        }
        if events != nil{
            var dictionaryElements = [[String:Any]]()
            for eventsElement in events {
                dictionaryElements.append(eventsElement.toDictionary())
            }
            dictionary["events"] = dictionaryElements
        }
        if pages != nil{
            dictionary["pages"] = pages
        }
        if perPage != nil{
            dictionary["per_page"] = perPage
        }
        if total != nil{
            dictionary["total"] = total
        }
        return dictionary
    }
}
