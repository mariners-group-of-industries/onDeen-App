//
//	HomePageEvent.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class HomePageEvent : NSObject{
    var time_zone : String!
    var to_location : String!
    var to_latitude : String!
    var to_longitude : String!
    var status : Int!
	var arTitle : String!
	var categoryImage : String!
	var categoryTitle : String!
	var endDate : String!
	var id : Int!
	var isWishlisted : Int!
    var price : String!
	var originalPrice : String!
	var priceType : Int!
	var primaryImage : String!
	var startDate : String!
	var tags : String!
    var categoryId : String!
    var distance : String!
    var location : String!
    var ticketPrice : String!
    var title : String!
    var participantId : Int!
    var locationType : Int!
	var total_participants_count : Int!
    var tagsLists : [String] = [String]()
    var participantImages : [EventParticipiantImage] = [EventParticipiantImage]()
    var isSelected : Bool = false
    var startTime : String!
    var subTitle : String!
    var occusr_type : Int!
    var occusr_weekday : String!
    var occusr_month : Int!
    var booked_count : Int!
    var organizerName : String!
	init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
        organizerName = dictionary["organizer_name"] as? String ?? ""
        if organizerName.isEmpty{
            organizerName = dictionary["organization_name"] as? String ?? ""
        }
        booked_count = dictionary["booked_count"] as? Int ?? 0
        status = dictionary["status"] as? Int ?? 0

        participantImages = [EventParticipiantImage]()
        if let participantsArray = dictionary["participant_images"] as? [[String:Any]]{
            for dic in participantsArray{
                let value = EventParticipiantImage(fromDictionary: dic)
                participantImages.append(value)
            }
        }
        occusr_type = dictionary["occusr_type"] as? Int ?? 0
        occusr_weekday = dictionary["occusr_weekday"] as? String ?? ""
        occusr_month = dictionary["occusr_month"] as? Int ?? 0
        
        to_location = dictionary["to_location"] as? String ?? ""
        to_latitude = dictionary["to_latitude"] as? String ?? ""
        to_longitude = dictionary["to_longitude"] as? String ?? ""

        total_participants_count = dictionary["total_participants_count"] as? Int ?? 0
        locationType = dictionary["location_type"] as? Int ?? 0
        participantId = dictionary["participant_id"] as? Int ?? 0
        arTitle = dictionary["ar_title"] as? String ?? ""
        startTime = dictionary["start_time"] as? String ?? ""
        subTitle = dictionary["sub_title"] as? String ?? ""
        
        location = dictionary["location"] as? String ?? ""
        ticketPrice = dictionary["ticket_price"] as? String ?? ""
        ticketPrice = ticketPrice.checkVariable(value: dictionary["ticket_price"] as Any)
        ticketPrice = ticketPrice.formatAmount()

        distance = dictionary["distance"] as? String ?? ""
        distance = distance.checkVariable(value: dictionary["distance"] as Any)

        categoryId = dictionary["category_id"] as? String ?? ""
        categoryId = categoryId.checkVariable(value: dictionary["category_id"] as Any)

		categoryImage = dictionary["category_image"] as? String ?? ""
		categoryTitle = dictionary["category_title"] as? String ?? ""
		endDate = dictionary["end_date"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		isWishlisted = dictionary["is_wishlisted"] as? Int ?? 0
		price = dictionary["price"] as? String ?? ""
        price = price.checkVariable(value: dictionary["price"] as Any)
        originalPrice = price
        if price.toDouble() == 0.0{
            price = "FREE".localized
        }else{
            price = currency + price.formatAmount()
        }
        priceType = dictionary["price_type"] as? Int ?? 0
		primaryImage = dictionary["primary_image"] as? String ?? ""
		startDate = dictionary["start_date"] as? String ?? ""
		tags = dictionary["tags"] as? String ?? ""
		title = dictionary["title"] as? String ?? ""
        if !tags.isEmpty{
            tagsLists = tags.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        }
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
        dictionary["tagsLists"] = tagsLists
        if time_zone != nil{
            dictionary["time_zone"] = time_zone
        }
        if organizerName != nil{
            dictionary["organizer_name"] = organizerName
        }
        if booked_count != nil{
            dictionary["booked_count"] = booked_count
        }
        if to_location != nil{
            dictionary["to_location"] = to_location
        }
        if to_latitude != nil{
            dictionary["to_latitude"] = to_latitude
        }
        if to_longitude != nil{
            dictionary["to_longitude"] = to_longitude
        }
        if subTitle != nil{
            dictionary["sub_title"] = subTitle
        }
        if locationType != nil{
            dictionary["location_type"] = locationType
        }
        if participantId != nil{
            dictionary["participant_id"] = participantId
        }
		if arTitle != nil{
			dictionary["ar_title"] = arTitle
		}
		if categoryImage != nil{
			dictionary["category_image"] = categoryImage
		}
		if categoryTitle != nil{
			dictionary["category_title"] = categoryTitle
		}
		if endDate != nil{
			dictionary["end_date"] = endDate
		}
		if id != nil{
			dictionary["id"] = id
		}
		if isWishlisted != nil{
			dictionary["is_wishlisted"] = isWishlisted
		}
		if price != nil{
			dictionary["price"] = price
		}
		if priceType != nil{
			dictionary["price_type"] = priceType
		}
		if primaryImage != nil{
			dictionary["primary_image"] = primaryImage
		}
		if startDate != nil{
			dictionary["start_date"] = startDate
		}
		if tags != nil{
			dictionary["tags"] = tags
		}
		if title != nil{
			dictionary["title"] = title
		}
		return dictionary
	}
}
