//
//	HomePageResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class HomePageResponse : NSObject{

	var banner : HomePageBanner!
	var category : [HomePageCategory]!
	var organizer : [HomePageOrganizer]!
	var recent : HomePageBanner!
    var events : [HomePageEvent]!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        events = [HomePageEvent]()
        if let eventsArray = dictionary["events"] as? [[String:Any]]{
            for dic in eventsArray{
                let value = HomePageEvent(fromDictionary: dic)
                events.append(value)
            }
        }
		if let bannerData = dictionary["banner"] as? [String:Any]{
			banner = HomePageBanner(fromDictionary: bannerData)
		}
		category = [HomePageCategory]()
		if let categoryArray = dictionary["category"] as? [[String:Any]]{
			for dic in categoryArray{
				let value = HomePageCategory(fromDictionary: dic)
				category.append(value)
			}
		}
		organizer = [HomePageOrganizer]()
		if let organizerArray = dictionary["organizer"] as? [[String:Any]]{
			for dic in organizerArray{
				let value = HomePageOrganizer(fromDictionary: dic)
				organizer.append(value)
			}
		}
		if let recentData = dictionary["recent"] as? [String:Any]{
			recent = HomePageBanner(fromDictionary: recentData)
		}
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
        if events != nil{
            var dictionaryElements = [[String:Any]]()
            for eventsElement in events {
                dictionaryElements.append(eventsElement.toDictionary())
            }
            dictionary["events"] = dictionaryElements
        }
		if banner != nil{
			dictionary["banner"] = banner.toDictionary()
		}
		if category != nil{
			var dictionaryElements = [[String:Any]]()
			for categoryElement in category {
				dictionaryElements.append(categoryElement.toDictionary())
			}
			dictionary["category"] = dictionaryElements
		}
		if organizer != nil{
			var dictionaryElements = [[String:Any]]()
			for organizerElement in organizer {
				dictionaryElements.append(organizerElement.toDictionary())
			}
			dictionary["organizer"] = dictionaryElements
		}
		if recent != nil{
			dictionary["recent"] = recent.toDictionary()
		}
		return dictionary
	}
}
