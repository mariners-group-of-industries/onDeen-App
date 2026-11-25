//
//	FilterListResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class FilterListResponse : NSObject{

	var organizers : [FilterListOrganizer]!
	var speakers : [FilterListSpeaker]!
    var category : FilterListCategory!
    var categoriesData : [FilterListCategory] = [FilterListCategory]()
    var genderData : [FilterListCategory] = [FilterListCategory]()
    var showCategory = false
    var showSpeakers = false
    var showOrganizer = false
    var showGender = false
    var new_notification_count = 0

	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        if let categoryData = dictionary["category"] as? [String:Any]{
            category = FilterListCategory(fromDictionary: categoryData)
            categoriesData = category.categories
        }
        
        organizers = [FilterListOrganizer]()
        if let organizersArray = dictionary["organizers"] as? [[String:Any]]{
            for dic in organizersArray{
                let value = FilterListOrganizer(fromDictionary: dic)
                organizers.append(value)
            }
        }
        genderData = [FilterListCategory]()
		if let organizersArray = dictionary["gender"] as? [[String:Any]]{
			for dic in organizersArray{
				let value = FilterListCategory(fromDictionary: dic)
                genderData.append(value)
			}
		}
		speakers = [FilterListSpeaker]()
		if let speakersArray = dictionary["speakers"] as? [[String:Any]]{
			for dic in speakersArray{
				let value = FilterListSpeaker(fromDictionary: dic)
				speakers.append(value)
			}
		}
        new_notification_count = dictionary["new_notification_count"] as? Int ?? 0
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if organizers != nil{
			var dictionaryElements = [[String:Any]]()
			for organizersElement in organizers {
				dictionaryElements.append(organizersElement.toDictionary())
			}
			dictionary["organizers"] = dictionaryElements
		}
		if speakers != nil{
			var dictionaryElements = [[String:Any]]()
			for speakersElement in speakers {
				dictionaryElements.append(speakersElement.toDictionary())
			}
			dictionary["speakers"] = dictionaryElements
		}
		return dictionary
	}
}
class FilterListCategory : NSObject{
    
    var arTitle : String!
    var homeView : Bool!
    var id : Int!
    var image : String!
    var isCurriculum : Int!
    var isItinerary : Int!
    var isMaterial : Int!
    var isSpeaker : Int!
    var isTourslot : Int!
    var position : Int!
    var status : Int!
    var title : String!
    var categories : [FilterListCategory]!
    var isSelected : Bool = false
    
    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        arTitle = dictionary["ar_title"] as? String ?? ""
        homeView = dictionary["home_view"] as? Bool ?? false
        isSelected = dictionary["isSelected"] as? Bool ?? false
        id = dictionary["id"] as? Int ?? 0
        image = dictionary["image"] as? String ?? ""
        isCurriculum = dictionary["is_curriculum"] as? Int ?? 0
        isItinerary = dictionary["is_itinerary"] as? Int ?? 0
        isMaterial = dictionary["is_material"] as? Int ?? 0
        isSpeaker = dictionary["is_speaker"] as? Int ?? 0
        isTourslot = dictionary["is_tourslot"] as? Int ?? 0
        position = dictionary["position"] as? Int ?? 0
        status = dictionary["status"] as? Int ?? 0
        title = dictionary["title"] as? String ?? ""
        categories = [FilterListCategory]()
        if let categoriesArray = dictionary["categories"] as? [[String:Any]]{
            for dic in categoriesArray{
                let value = FilterListCategory(fromDictionary: dic)
                categories.append(value)
            }
        }
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
        if homeView != nil{
            dictionary["home_view"] = homeView
        }
        if id != nil{
            dictionary["id"] = id
        }
        if image != nil{
            dictionary["image"] = image
        }
        if isCurriculum != nil{
            dictionary["is_curriculum"] = isCurriculum
        }
        if isItinerary != nil{
            dictionary["is_itinerary"] = isItinerary
        }
        if isMaterial != nil{
            dictionary["is_material"] = isMaterial
        }
        if isSpeaker != nil{
            dictionary["is_speaker"] = isSpeaker
        }
        if isTourslot != nil{
            dictionary["is_tourslot"] = isTourslot
        }
        if position != nil{
            dictionary["position"] = position
        }
        if status != nil{
            dictionary["status"] = status
        }
        if title != nil{
            dictionary["title"] = title
        }
        if categories != nil{
            var dictionaryElements = [[String:Any]]()
            for categoriesElement in categories {
                dictionaryElements.append(categoriesElement.toDictionary())
            }
            dictionary["categories"] = dictionaryElements
        }
        return dictionary
    }
    
    
}

