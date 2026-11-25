//
//	MembershipListMembership.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class MembershipListMembership : NSObject{

	var descriptionField : String!
	var duration : Int!
	var durationType : Int!
	var id : Int!
    var price : String!
	var originalPrice : String!
	var subTitle : String!
	var title : String!
	var currentPage : Int!
	var membership : [MembershipListMembership]!
	var pages : Int!
	var perPage : Int!
	var total : Int!
    var selected : Bool = false
    var purchasedOn : String!
    var endsOn : String!
	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        purchasedOn = dictionary["purchased_on"] as? String ?? ""
        endsOn = dictionary["ends_on"] as? String ?? ""
		descriptionField = dictionary["description"] as? String ?? ""
		duration = dictionary["duration"] as? Int ?? 0
		durationType = dictionary["duration_type"] as? Int ?? 0
		id = dictionary["id"] as? Int ?? 0
		price = dictionary["price"] as? String ?? ""
        price = price.checkVariable(value: dictionary["price"] as Any)
        originalPrice = price
        if price.toDouble() == 0.0{
            price = "FREE".localized
        }else{
            price = currency + price
        }
        price = price.formatAmount()

		subTitle = dictionary["sub_title"] as? String ?? ""
		title = dictionary["title"] as? String ?? ""
		currentPage = dictionary["current_page"] as? Int ?? 0
		membership = [MembershipListMembership]()
		if let membershipArray = dictionary["membership"] as? [[String:Any]]{
			for dic in membershipArray{
				let value = MembershipListMembership(fromDictionary: dic)
				membership.append(value)
			}
		}
        if membership.count > 0{
            membership[0].selected = true
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
        if purchasedOn != nil{
            dictionary["purchased_on"] = purchasedOn
        }
        if endsOn != nil{
            dictionary["ends_on"] = endsOn
        }
		if descriptionField != nil{
			dictionary["description"] = descriptionField
		}
		if duration != nil{
			dictionary["duration"] = duration
		}
		if durationType != nil{
			dictionary["duration_type"] = durationType
		}
		if id != nil{
			dictionary["id"] = id
		}
		if price != nil{
			dictionary["price"] = price
		}
		if subTitle != nil{
			dictionary["sub_title"] = subTitle
		}
		if title != nil{
			dictionary["title"] = title
		}
		if currentPage != nil{
			dictionary["current_page"] = currentPage
		}
		if membership != nil{
			var dictionaryElements = [[String:Any]]()
			for membershipElement in membership {
				dictionaryElements.append(membershipElement.toDictionary())
			}
			dictionary["membership"] = dictionaryElements
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
