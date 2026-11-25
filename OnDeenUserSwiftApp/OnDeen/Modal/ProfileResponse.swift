//
//	ProfileResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class ProfileResponse : NSObject{

	var countryCode : String!
	var courseCount : Int!
	var createdOn : String!
	var emailId : String!
	var eventCount : Int!
	var firstName : String!
	var gender : Int!
    var journeyLevelId : Int!
	var journeyLevelTitle : String!
	var lastName : String!
	var mobileNumber : String!
	var profileImage : String!
	var status : Int!
	var tourCount : Int!
    var awardlevel : [ProfileAwardlevel]!
    var age : Int!
    var userId : Int!
    var ratingCount : Int!
    var avgRating : String!
    
    var showAwards : Int!
    var showCourses : Int!
    var showReviews : Int!
    var showEvents : Int!
    var showJourneyLevel : Int!
    var showMobileNumber : Int!
    var is_mine : Int!
	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        avgRating = dictionary["avg_rating"] as? String ?? ""
        avgRating = avgRating.checkVariable(value: dictionary["avg_rating"] as Any)
        is_mine = dictionary["is_mine"] as? Int ?? 0
        userId = dictionary["user_id"] as? Int ?? 0
        ratingCount = dictionary["rating_count"] as? Int ?? 0
        showAwards = dictionary["show_awards"] as? Int ?? 0
        showCourses = dictionary["show_course"] as? Int ?? 0
        showReviews = dictionary["show_reviews"] as? Int ?? 0
        showEvents = dictionary["show_events"] as? Int ?? 0
        showJourneyLevel = dictionary["show_journeylevel"] as? Int ?? 0
        showMobileNumber = dictionary["show_mobile_number"] as? Int ?? 0

		countryCode = dictionary["country_code"] as? String ?? ""
        age = dictionary["age"] as? Int ?? 0
		courseCount = dictionary["course_count"] as? Int ?? 0
		createdOn = dictionary["created_on"] as? String ?? ""
		emailId = dictionary["email_id"] as? String ?? ""
		eventCount = dictionary["event_count"] as? Int ?? 0
		firstName = dictionary["first_name"] as? String ?? ""
		gender = dictionary["gender"] as? Int ?? 0
		journeyLevelId = dictionary["journey_level_id"] as? Int ?? 0
		journeyLevelTitle = dictionary["journey_level_title"] as? String ?? ""
		lastName = dictionary["last_name"] as? String ?? ""
		mobileNumber = dictionary["mobile_number"] as? String ?? ""
		profileImage = dictionary["profile_image"] as? String ?? ""
		status = dictionary["status"] as? Int ?? 0
        tourCount = dictionary["tour_count"] as? Int ?? 0
        awardlevel = [ProfileAwardlevel]()
        if let categoryArray = dictionary["award_level"] as? [[String:Any]]{
            for dic in categoryArray{
                let value = ProfileAwardlevel(fromDictionary: dic)
                awardlevel.append(value)
            }
        }
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
        if age != nil{
            dictionary["age"] = age
        }
		if countryCode != nil{
			dictionary["country_code"] = countryCode
		}
		if courseCount != nil{
			dictionary["course_count"] = courseCount
		}
		if createdOn != nil{
			dictionary["created_on"] = createdOn
		}
		if emailId != nil{
			dictionary["email_id"] = emailId
		}
		if eventCount != nil{
			dictionary["event_count"] = eventCount
		}
		if firstName != nil{
			dictionary["first_name"] = firstName
		}
		if gender != nil{
			dictionary["gender"] = gender
		}
		if journeyLevelId != nil{
			dictionary["journey_level_id"] = journeyLevelId
		}
		if journeyLevelTitle != nil{
			dictionary["journey_level_title"] = journeyLevelTitle
		}
		if lastName != nil{
			dictionary["last_name"] = lastName
		}
		if mobileNumber != nil{
			dictionary["mobile_number"] = mobileNumber
		}
		if profileImage != nil{
			dictionary["profile_image"] = profileImage
		}
		if status != nil{
			dictionary["status"] = status
		}
		if tourCount != nil{
			dictionary["tour_count"] = tourCount
		}
		return dictionary
	}
}
class ProfileAwardlevel : NSObject{
    
    var title : String!
    var attendcount : Int!
    var image : String!
    var id : Int!
    
    init(fromDictionary dictionary: [String:Any]){
        title = dictionary["title"] as? String ?? ""
        attendcount = dictionary["attend_count"] as? Int ?? 0
        image = dictionary["image"] as? String ?? ""
        id = dictionary["id"] as? Int ?? 0
    }
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if title != nil{
            dictionary["title"] = title
        }
        if attendcount != nil{
            dictionary["attend_count"] = attendcount
        }
        if image != nil{
            dictionary["image"] = image
        }
        if id != nil{
            dictionary["id"] = id
        }
        return dictionary
    }
}
class EventReviewResponse: NSObject {
    
    var status: Bool!
    var response: [EventReview] = []
    
    init(fromDictionary dictionary: [String: Any]) {
        status = dictionary["status"] as? Bool ?? false
        if let responseArray = dictionary["response"] as? [[String: Any]] {
            for item in responseArray {
                let review = EventReview(fromDictionary: item)
                response.append(review)
            }
        }
    }
    
    func toDictionary() -> [String: Any] {
        var dictionary = [String: Any]()
        dictionary["status"] = status
        dictionary["response"] = response.map { $0.toDictionary() }
        return dictionary
    }
}
class EventReview: NSObject {
    
    var createdOn: String!
    var id: Int!
    var userFirstName: String!
    var userLastName: String?
    var eventTitle: String!
    var review: String!
    var userId: Int!
    var eventId: Int!
    var ratingValue: Int!
    var reviewBgColor : UIColor!
    var colors = [UIColor(hex: "#FFF1C8"),UIColor(hex: "#F0F0F0"),UIColor(hex: "#E9E1FF")]
    var title : String!
    var message : String!
    
    init(fromDictionary dictionary: [String: Any]) {
        message = dictionary["message"] as? String ?? ""
        title = dictionary["title"] as? String ?? ""
        createdOn = dictionary["created_on"] as? String ?? ""
        id = dictionary["id"] as? Int ?? 0
        userFirstName = dictionary["user_first_name"] as? String ?? ""
        userLastName = dictionary["user_last_name"] as? String
        eventTitle = dictionary["event_title"] as? String ?? ""
        review = dictionary["review"] as? String ?? ""
        review = review.replacingOccurrences(of: "\n+$", with: "", options: .regularExpression)
        userId = dictionary["user_id"] as? Int ?? 0
        eventId = dictionary["event_id"] as? Int ?? 0
        ratingValue = dictionary["rating_value"] as? Int ?? 0
        reviewBgColor = colors.randomElement() ?? UIColor(hex: "#FFF1C8")
    }
    
    func toDictionary() -> [String: Any] {
        var dictionary = [String: Any]()
        if message != nil {
            dictionary["message"] = message
        }
        if title != nil {
            dictionary["title"] = title
        }
        if createdOn != nil {
            dictionary["created_on"] = createdOn
        }
        if id != nil {
            dictionary["id"] = id
        }
        if userFirstName != nil {
            dictionary["user_first_name"] = userFirstName
        }
        if userLastName != nil {
            dictionary["user_last_name"] = userLastName
        }
        if eventTitle != nil {
            dictionary["event_title"] = eventTitle
        }
        if review != nil {
            dictionary["review"] = review
        }
        if userId != nil {
            dictionary["user_id"] = userId
        }
        if eventId != nil {
            dictionary["event_id"] = eventId
        }
        if ratingValue != nil {
            dictionary["rating_value"] = ratingValue
        }
        return dictionary
    }
}
