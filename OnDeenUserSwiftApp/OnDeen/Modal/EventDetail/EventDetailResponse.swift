//
//	EventDetailResponse.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailResponse : NSObject{
    var gender : Int!
    var time_zone : String!
    var duration : String!
    var ticket_start_time : String!
    var swipe_checkin : String!
    var meet_link : String!
    var to_location : String!
    var to_latitude : String!
    var to_longitude : String!
    var quantity_per_user : Int!
    var ticket_date : String!
    var participants : [EventDetailParticipant]!
    var selectedParticipiantId = 0
    var occursTextPop : String!
    var isWishlisted : Int!
    var available : Int!
    var booked : Int!
	var arCancellationPolicy : AnyObject!
	var arDescription : AnyObject!
	var arEligibility : AnyObject!
	var arRule : AnyObject!
	var arTermsCondition : String!
	var arTitle : String!
    var callPerWeek : String!
	var cancellationPolicy : String!
	var categoryId : Int!
	var categoryImage : String!
	var categoryTitle : String!
    var curriculum : [EventDetailCurriculum]!
	var descriptionField : String!
	var documents : [EventDetailDocument]!
	var eligibility : String!
	var endDate : String!
	var endTime : String!
	var eventNoteCount : Int!
	var eventType : Int!
	var facilities : [EventDetailFacility]!
	var id : Int!
	var images : [EventDetailImage]!
    var itineraries : [EventDetailItinerary]!
	var journeyLevelId : Int!
	var latitude : String!
	var location : String!
	var locationType : Int!
    var longitude : String!
	var organizer : EventDetailOrganizer!
    var price : String!
    var actualPrice : String!
	var originalPrice : String!
	var priceType : Int!
	var rule : String!
	var shareUrl : String!
	var speakers : [EventDetailSpeaker]!
	var startDate : String!
	var startTime : String!
    var status : Int!
    var occusr_type : Int!
	var participant_id : Int!
	var subCategoryId : Int!
	var tags : [EventDetailTag]!
	var termsCondition : String!
	var title : String!
    var totalNoClass : String!
    var occusr_text : String!
	var qrcode : String!
	var userId : Int!
    var moreLines : Int = 2
    var total_participants_count : Int = 0
    var percentage_completion : String = ""
    var termsConditions = [[String:Any]]()
    var showTerms = true
    var showFacilities = true
    var showCourse = true
    var showIteration = true
    var qrPath : String!
    var ticket : String!
    var ticketNo : String!
    var requestBuddy : String!
    var journeyName : String!
    var journeySubName : String!
    var occusr_weekday : String!
    var attendance_today : String!
    var dates : [DateModel]!
    var participantImages : [EventParticipiantImage]!
    var tickets : [EventDetailTicket]!
    var remaining: Int {
        guard let available = available, let booked = booked else {
            return 0
        }
        
        if booked > available || available < 0 || booked < 0 {
            return 0
        }
        
        return available - booked
    }

    var swipe_flag : Int = 0
    var swipe_text : String = ""
    var swipe_text_info : String = ""
    var swipe_timer : Int = 0
    
	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        occusr_type = dictionary["occusr_type"] as? Int ?? 0
        swipe_flag = dictionary["swipe_flag"] as? Int ?? 0
        swipe_text_info = dictionary["swipe_text_info"] as? String ?? ""
        time_zone = dictionary["time_zone"] as? String ?? ""
        swipe_text = dictionary["swipe_text"] as? String ?? ""
        swipe_timer = dictionary["swipe_timer"] as? Int ?? 0

        
        tickets = [EventDetailTicket]()
        if let ticketsArray = dictionary["tickets"] as? [[String:Any]]{
            for dic in ticketsArray{
                let value = EventDetailTicket(fromDictionary: dic)
                tickets.append(value)
            }
        }

        total_participants_count = dictionary["total_participants_count"] as? Int ?? 0
        participant_id = dictionary["participant_id"] as? Int ?? 0
        available = dictionary["available"] as? Int ?? 0
        booked = dictionary["booked"] as? Int ?? 0
        quantity_per_user = dictionary["quantity_per_user"] as? Int ?? 0

        participants = [EventDetailParticipant]()
        if let participantsArray = dictionary["participants"] as? [[String:Any]]{
            for dic in participantsArray{
                let value = EventDetailParticipant(fromDictionary: dic)
                participants.append(value)
            }
        }
        participantImages = [EventParticipiantImage]()
        if let participantsArray = dictionary["participant_images"] as? [[String:Any]]{
            for dic in participantsArray{
                let value = EventParticipiantImage(fromDictionary: dic)
                participantImages.append(value)
            }
        }
        gender = dictionary["gender"] as? Int ?? 0
        duration = dictionary["duration"] as? String ?? ""
        duration = duration.checkVariable(value: dictionary["duration"] as Any)
        occursTextPop = dictionary["occusr_text_pop"] as? String ?? ""
        occusr_weekday = dictionary["occusr_weekday"] as? String ?? ""
        meet_link = dictionary["meet_link"] as? String ?? ""
        to_location = dictionary["to_location"] as? String ?? ""
        to_latitude = dictionary["to_latitude"] as? String ?? ""
        to_latitude = to_latitude.checkVariable(value: dictionary["to_latitude"] as Any)
        to_longitude = dictionary["to_longitude"] as? String ?? ""
        to_longitude = to_longitude.checkVariable(value: dictionary["to_longitude"] as Any)
        
        if to_location.isEmpty && to_latitude.toDouble() == 0.0 || to_longitude.toDouble() == 0.0 {
            to_location = ""
            to_latitude = ""
            to_longitude = ""
        }
        swipe_checkin = dictionary["swipe_checkin"] as? String ?? ""
        swipe_checkin = swipe_checkin.checkVariable(value: dictionary["swipe_checkin"] as Any)

        occusr_text = dictionary["occusr_text"] as? String ?? ""
        ticket_date = dictionary["ticket_date"] as? String ?? ""
        ticket_start_time = dictionary["ticket_start_time"] as? String ?? ""

        locationType = dictionary["location_type"] as? Int ?? 0
        dates = [DateModel]()

        if let datesArray = dictionary["dates"] as? [[String: Any]] {
            for dic in datesArray {
                let value = DateModel(fromDictionary: dic)
                let dateString = value.date ?? ""

                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
                dateFormatter.locale = Locale(identifier: "en_US_POSIX")
                dateFormatter.timeZone = TimeZone(abbreviation: "GMT")

                if let givenDate = dateFormatter.date(from: dateString) {
                    let calendar = Calendar.current

                    // Get only the date part (ignoring time)
                    let givenDateOnly = calendar.startOfDay(for: givenDate)
                    let currentDateOnly = calendar.startOfDay(for: Date())

                    if givenDateOnly >= currentDateOnly {  // Includes today & future dates
                        dates.append(value)
                    }
                } else {
                    dates.append(value) // Append if date parsing fails
                }
            }
        }
        isWishlisted = dictionary["is_wishlisted"] as? Int ?? 0
        percentage_completion = dictionary["percentage_completion"] as? String ?? ""
        
		arCancellationPolicy = dictionary["ar_cancellation_policy"] as? AnyObject
		arDescription = dictionary["ar_description"] as? AnyObject
		arEligibility = dictionary["ar_eligibility"] as? AnyObject
		arRule = dictionary["ar_rule"] as? AnyObject
        ticketNo = dictionary["ticket_no"] as? String ?? ""
        ticketNo = ticketNo.checkVariable(value: dictionary["ticket_no"] as Any)
        requestBuddy = dictionary["request_buddy"] as? String ?? ""
        requestBuddy = requestBuddy.checkVariable(value: dictionary["request_buddy"] as Any)

        ticket = dictionary["ticket"] as? String ?? ""
        qrcode = dictionary["qrcode"] as? String ?? ""
        qrPath = dictionary["qrcode_path"] as? String ?? ""
		arTermsCondition = dictionary["ar_terms_condition"] as? String ?? ""
		arTitle = dictionary["ar_title"] as? String ?? ""
        callPerWeek = dictionary["call_per_week"] as? String ?? ""
        callPerWeek = callPerWeek.checkVariable(value: dictionary["call_per_week"] as Any)

		cancellationPolicy = dictionary["cancellation_policy"] as? String ?? ""
		categoryId = dictionary["category_id"] as? Int ?? 0
		categoryImage = dictionary["category_image"] as? String ?? ""
		categoryTitle = dictionary["category_title"] as? String ?? ""
        curriculum = [EventDetailCurriculum]()
        if let curriculumArray = dictionary["curriculum"] as? [[String:Any]]{
            for dic in curriculumArray{
                let value = EventDetailCurriculum(fromDictionary: dic)
                curriculum.append(value)
            }
        }
		descriptionField = dictionary["description"] as? String ?? ""
		documents = [EventDetailDocument]()
		if let documentsArray = dictionary["documents"] as? [[String:Any]]{
			for dic in documentsArray{
				let value = EventDetailDocument(fromDictionary: dic)
				documents.append(value)
			}
		}
		eligibility = dictionary["eligibility"] as? String ?? ""
		endDate = dictionary["end_date"] as? String ?? ""
        if endDate.isEmpty{
            endDate = dictionary["event_end_date"] as? String ?? ""
        }

		endTime = dictionary["end_time"] as? String ?? ""
        if endTime.isEmpty{
            endTime = dictionary["event_end_time"] as? String ?? ""
        }

		eventNoteCount = dictionary["event_note_count"] as? Int ?? 0
		eventType = dictionary["event_type"] as? Int ?? 0
		facilities = [EventDetailFacility]()
		if let facilitiesArray = dictionary["facilities"] as? [[String:Any]]{
			for dic in facilitiesArray{
				let value = EventDetailFacility(fromDictionary: dic)
				facilities.append(value)
			}
		}
		id = dictionary["id"] as? Int ?? 0
		images = [EventDetailImage]()
		if let imagesArray = dictionary["images"] as? [[String:Any]]{
			for dic in imagesArray{
				let value = EventDetailImage(fromDictionary: dic)
				images.append(value)
			}
		}
        itineraries = [EventDetailItinerary]()
        if let itinerariesArray = dictionary["itineraries"] as? [[String:Any]]{
            for dic in itinerariesArray{
                let value = EventDetailItinerary(fromDictionary: dic)
                itineraries.append(value)
            }
        }

		journeyLevelId = dictionary["journey_level_id"] as? Int ?? 0
        attendance_today = dictionary["attendance_today"] as? String ?? ""
        attendance_today = attendance_today.checkVariable(value: dictionary["attendance_today"] as Any)
		latitude = dictionary["latitude"] as? String ?? ""
        latitude = latitude.checkVariable(value: dictionary["latitude"] as Any)
		location = dictionary["location"] as? String ?? ""
        if location.isEmpty{
            location = dictionary["event_address"] as? String ?? ""
        }
		longitude = dictionary["longitude"] as? String ?? ""
        longitude = longitude.checkVariable(value: dictionary["longitude"] as Any)

		if let organizerData = dictionary["organizer"] as? [String:Any]{
			organizer = EventDetailOrganizer(fromDictionary: organizerData)
		}
        price = dictionary["price"] as? String ?? ""
        price = price.checkVariable(value: dictionary["price"] as Any)

        if let eventPrice = dictionary["event_price"] as? String {
            price = eventPrice
        } else if let eventPrice = dictionary["event_price"] as? Int {
            price = "\(eventPrice)"
        } else if let eventPrice = dictionary["event_price"] as? Double {
            price = String(eventPrice)
        } else if let eventPrice = dictionary["event_price"] as? Float {
            price = String(eventPrice)
        }

        actualPrice = price

        if tickets.count > 0 {
            var getPrice = tickets.first!.originalPrice.toDouble()

            for item in tickets {
                let priceValue = item.originalPrice.toDouble()
                if priceValue < getPrice {
                    getPrice = priceValue
                }
            }

            // ✅ DO NOT ROUND HERE
            price = String(getPrice)
        }

        originalPrice = price

        if price.toDouble() == 0.0 {
            price = "FREE".localized
        } else {
            price = currency + price.formatAmount()
        }
        
		priceType = dictionary["price_type"] as? Int ?? 0
		rule = dictionary["rule"] as? String ?? ""
		shareUrl = dictionary["share_url"] as? String ?? ""
        let iosURL = dictionary["share_urle"] as? String ?? ""
        if !iosURL.isEmpty{
            shareUrl = iosURL
        }
		speakers = [EventDetailSpeaker]()
		if let speakersArray = dictionary["speakers"] as? [[String:Any]]{
			for dic in speakersArray{
				let value = EventDetailSpeaker(fromDictionary: dic)
                value.eventId = id
				speakers.append(value)
			}
		}
		startDate = dictionary["start_date"] as? String ?? ""
        if startDate.isEmpty{
            startDate = dictionary["event_start_date"] as? String ?? ""
        }
		startTime = dictionary["start_time"] as? String ?? ""
        if startTime.isEmpty{
            startTime = dictionary["event_start_time"] as? String ?? ""
        }

		status = dictionary["status"] as? Int ?? 0
		subCategoryId = dictionary["sub_category_id"] as? Int ?? 0
		tags = [EventDetailTag]()
		if let tagsArray = dictionary["tags"] as? [[String:Any]]{
			for dic in tagsArray{
				let value = EventDetailTag(fromDictionary: dic)
				tags.append(value)
			}
		}
        var genderTitle = "Unisex"
        if gender == 1{
            genderTitle = "Male Only"
        }else if gender == 2{
            genderTitle = "Female Only"
        }
        tags.insert(EventDetailTag.init(fromDictionary: ["title" : genderTitle]), at: 0)
        if locationType != 1{
            let value = EventDetailTag(fromDictionary: [String:Any]())
            value.title = "Online"
            value.id = 100000
            tags.insert(value, at: 0)
        }else{
            let value = EventDetailTag(fromDictionary: [String:Any]())
            value.title = "Onsite"
            value.id = 100000
            tags.insert(value, at: 0)
        }

		termsCondition = dictionary["terms_condition"] as? String ?? ""
		title = dictionary["title"] as? String ?? ""
        if title.isEmpty{
            title = dictionary["event_title"] as? String ?? ""
        }
        journeyName = dictionary["journey_level_name"] as? String ?? ""
        journeySubName = dictionary["journey_level_sub_name"] as? String ?? ""
        totalNoClass = dictionary["total_no_class"] as? String ?? ""
        totalNoClass = totalNoClass.checkVariable(value: dictionary["total_no_class"] as Any)

		userId = dictionary["user_id"] as? Int ?? 0
        termsConditions = [[String:Any]]()
        
        termsCondition = termsCondition.replacingOccurrences(of: "<br>", with: "")
        rule = rule.replacingOccurrences(of: "<br>", with: "")
        eligibility = eligibility.replacingOccurrences(of: "<br>", with: "")
        cancellationPolicy = cancellationPolicy.replacingOccurrences(of: "<br>", with: "")
                    
        termsCondition = termsCondition.toHTMLAttributedString()?.string
        rule = rule.toHTMLAttributedString()?.string
        eligibility = eligibility.toHTMLAttributedString()?.string
        cancellationPolicy = cancellationPolicy.toHTMLAttributedString()?.string
       
        termsCondition = termsCondition.replacingOccurrences(of: "<p>", with: "")
        rule = rule.replacingOccurrences(of: "<p>", with: "")
        eligibility = eligibility.replacingOccurrences(of: "<p>", with: "")
        cancellationPolicy = cancellationPolicy.replacingOccurrences(of: "<p>", with: "")
        termsCondition = termsCondition.replacingOccurrences(of: "</p>", with: "")
        rule = rule.replacingOccurrences(of: "</p>", with: "")
        eligibility = eligibility.replacingOccurrences(of: "</p>", with: "")
        cancellationPolicy = cancellationPolicy.replacingOccurrences(of: "</p>", with: "")
        
        termsCondition = termsCondition.replacingOccurrences(of: "\n", with: "")
        rule = rule.replacingOccurrences(of: "\n", with: "")
        eligibility = eligibility.replacingOccurrences(of: "\n", with: "")
        cancellationPolicy = cancellationPolicy.replacingOccurrences(of: "\n", with: "")
        if !eligibility.isEmpty{
            termsConditions.append(["title":"Eligibility","sub_title":eligibility ?? "","lines":2])
        }
        if !rule.isEmpty{
            termsConditions.append(["title":"What's Included","sub_title":rule ?? "","lines":2])
        }
        if !cancellationPolicy.isEmpty{
            termsConditions.append(["title":"Cancellation policy","sub_title":cancellationPolicy ?? "","lines":2])
        }

        if !termsCondition.isEmpty{
            termsConditions.append(["title":"Terms & conditions","sub_title":termsCondition ?? "","lines":2])
        }
        if tickets.count == 0{
            let value = EventDetailTicket(fromDictionary: [String:Any]())
            value.title = "Select Tickets".localized
            value.id = 10000
            value.price = self.price
            value.originalPrice = self.originalPrice
            value.available = self.available
            value.booked = self.booked
            value.status = 1
            value.quantity = 0
            if self.duration.toDouble() > 0.0{
                value.duration = "Duration \(self.duration ?? "") Hour"
            }
            if quantity_per_user != 0{
                value.other = "\(self.quantity_per_user ?? 0) ticket per person"
            }
            tickets.append(value)
        }
        if participants.count == 0{
            let value = EventDetailParticipant(fromDictionary: [String:Any]())
            value.paidAmount = originalPrice
            value.qrcodeCount = 1
            value.qrcodePath = qrPath
            value.ticketTitle = title
            value.ticketNo = ticketNo
            participants.append(value)
        }
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if tickets != nil{
            var dictionaryElements = [[String:Any]]()
            for ticketsElement in tickets {
                dictionaryElements.append(ticketsElement.toDictionary())
            }
            dictionary["tickets"] = dictionaryElements
        }
        if participants != nil{
            var dictionaryElements = [[String:Any]]()
            for participantsElement in participants {
                dictionaryElements.append(participantsElement.toDictionary())
            }
            dictionary["participants"] = dictionaryElements
        }
        if occusr_type != nil{
            dictionary["occusr_type"] = occusr_type
        }
        if swipe_text_info != nil{
            dictionary["swipe_text_info"] = swipe_text_info
        }
        if time_zone != nil{
            dictionary["time_zone"] = time_zone
        }
        if participant_id != nil{
            dictionary["participant_id"] = participant_id
        }
        if occursTextPop != nil{
            dictionary["occusr_text_pop"] = occursTextPop
        }
        if quantity_per_user != nil{
            dictionary["quantity_per_user"] = quantity_per_user
        }
        dictionary["total_participants_count"] = total_participants_count
        if journeyName != nil{
            dictionary["journey_level_name"] = journeyName
        }
        if occusr_weekday != nil{
            dictionary["occusr_weekday"] = occusr_weekday
        }
        if gender != nil{
            dictionary["gender"] = gender
        }
        if journeySubName != nil{
            dictionary["journey_level_sub_name"] = journeySubName
        }
        if meet_link != nil{
            dictionary["meet_link"] = meet_link
        }
        if swipe_checkin != nil{
            dictionary["swipe_checkin"] = swipe_checkin
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
        if occusr_text != nil{
            dictionary["occusr_text"] = occusr_text
        }
        if ticket_date != nil{
            dictionary["ticket_date"] = ticket_date
        }
        if ticket_start_time != nil{
            dictionary["ticket_start_time"] = ticket_start_time
        }
        if requestBuddy != nil{
            dictionary["request_buddy"] = requestBuddy
        }
        if arCancellationPolicy != nil{
            dictionary["ar_cancellation_policy"] = arCancellationPolicy
        }
        if arDescription != nil{
            dictionary["ar_description"] = arDescription
        }
        if arEligibility != nil{
            dictionary["ar_eligibility"] = arEligibility
        }
        if arRule != nil{
            dictionary["ar_rule"] = arRule
        }
        if arTermsCondition != nil{
            dictionary["ar_terms_condition"] = arTermsCondition
        }
        if arTitle != nil{
            dictionary["ar_title"] = arTitle
        }
        if callPerWeek != nil{
            dictionary["call_per_week"] = callPerWeek
        }
        if cancellationPolicy != nil{
            dictionary["cancellation_policy"] = cancellationPolicy
        }
        if categoryId != nil{
            dictionary["category_id"] = categoryId
        }
        if categoryImage != nil{
            dictionary["category_image"] = categoryImage
        }
        if categoryTitle != nil{
            dictionary["category_title"] = categoryTitle
        }
        if curriculum != nil{
            var dictionaryElements = [[String:Any]]()
            for curriculumElement in curriculum {
                dictionaryElements.append(curriculumElement.toDictionary())
            }
            dictionary["curriculum"] = dictionaryElements
        }
        if descriptionField != nil{
            dictionary["description"] = descriptionField
        }
        if documents != nil{
            var dictionaryElements = [[String:Any]]()
            for documentsElement in documents {
                dictionaryElements.append(documentsElement.toDictionary())
            }
            dictionary["documents"] = dictionaryElements
        }
        if eligibility != nil{
            dictionary["eligibility"] = eligibility
        }
        if endDate != nil{
            dictionary["end_date"] = endDate
        }
        if endTime != nil{
            dictionary["end_time"] = endTime
        }
        if eventNoteCount != nil{
            dictionary["event_note_count"] = eventNoteCount
        }
        if eventType != nil{
            dictionary["event_type"] = eventType
        }
        if facilities != nil{
            var dictionaryElements = [[String:Any]]()
            for facilitiesElement in facilities {
                dictionaryElements.append(facilitiesElement.toDictionary())
            }
            dictionary["facilities"] = dictionaryElements
        }
        if id != nil{
            dictionary["id"] = id
        }
        if images != nil{
            var dictionaryElements = [[String:Any]]()
            for imagesElement in images {
                dictionaryElements.append(imagesElement.toDictionary())
            }
            dictionary["images"] = dictionaryElements
        }
        if isWishlisted != nil{
            dictionary["is_wishlisted"] = isWishlisted
        }
        if itineraries != nil{
            var dictionaryElements = [[String:Any]]()
            for itinerariesElement in itineraries {
                dictionaryElements.append(itinerariesElement.toDictionary())
            }
            dictionary["itineraries"] = dictionaryElements
        }
        if journeyLevelId != nil{
            dictionary["journey_level_id"] = journeyLevelId
        }
        if latitude != nil{
            dictionary["latitude"] = latitude
        }
        if location != nil{
            dictionary["location"] = location
        }
        if locationType != nil{
            dictionary["location_type"] = locationType
        }
        if longitude != nil{
            dictionary["longitude"] = longitude
        }
        if organizer != nil{
            dictionary["organizer"] = organizer.toDictionary()
        }
        if price != nil{
            dictionary["price"] = price
        }
        if priceType != nil{
            dictionary["price_type"] = priceType
        }
        if rule != nil{
            dictionary["rule"] = rule
        }
        if shareUrl != nil{
            dictionary["share_url"] = shareUrl
        }
        if speakers != nil{
            var dictionaryElements = [[String:Any]]()
            for speakersElement in speakers {
                dictionaryElements.append(speakersElement.toDictionary())
            }
            dictionary["speakers"] = dictionaryElements
        }
        if startDate != nil{
            dictionary["start_date"] = startDate
        }
        if startTime != nil{
            dictionary["start_time"] = startTime
        }
        if status != nil{
            dictionary["status"] = status
        }
        if subCategoryId != nil{
            dictionary["sub_category_id"] = subCategoryId
        }
        if tags != nil{
            var dictionaryElements = [[String:Any]]()
            for tagsElement in tags {
                dictionaryElements.append(tagsElement.toDictionary())
            }
            dictionary["tags"] = dictionaryElements
        }
        if termsCondition != nil{
            dictionary["terms_condition"] = termsCondition
        }
        if title != nil{
            dictionary["title"] = title
        }
        if totalNoClass != nil{
            dictionary["total_no_class"] = totalNoClass
        }
        if userId != nil{
            dictionary["user_id"] = userId
        }
        return dictionary
    }
}


class TimeModel : NSObject{
    var remaining: Int {
            guard let available = available, let booked = booked else {
                return 0
            }
            
            if booked > available || available < 0 || booked < 0 {
                return 0
            }
            
            return available - booked
        }
    var available : Int!
    var booked : Int!
    var endTime : String!
    var id : Int!
    var startTime : String!
    var ticketNo : String!
    var status : Int!
    var isSelected = false
    var time_zone : String!
    var startDate : String!
    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        startDate = dictionary["startDate"] as? String ?? ""
        time_zone = dictionary["time_zone"] as? String ?? ""
        ticketNo = dictionary["ticket_no"] as? String ?? ""
        
        available = dictionary["available"] as? Int
        booked = dictionary["booked"] as? Int
        endTime = dictionary["end_time"] as? String
        id = dictionary["id"] as? Int
        startTime = dictionary["start_time"] as? String
        status = dictionary["status"] as? Int
        
        
    }

    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if time_zone != nil{
            dictionary["time_zone"] = time_zone
        }
        if remaining != nil{
            dictionary["available"] = remaining
        }
        if booked != nil{
            dictionary["booked"] = booked
        }
        if endTime != nil{
            dictionary["end_time"] = endTime
        }
        if id != nil{
            dictionary["id"] = id
        }
        if startTime != nil{
            dictionary["start_time"] = startTime
        }
        if status != nil{
            dictionary["status"] = status
        }
        return dictionary
    }

    

}
class EventParticipiantImage : NSObject{
    
    var image : String!
    init(fromDictionary dictionary: [String:Any]){
        image = dictionary["profile_image"] as? String ?? ""
    }
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if image != nil{
            dictionary["profile_image"] = image
        }
        return dictionary
    }
}
class DateModel : NSObject{

    var date : String!
    var id : Int!
    var status : Int!
    var times : [TimeModel]!
    var selected: Bool = false
    var time_zone : String!
    var dateTitle: String{
        date.convertFromDateFormat(fromFormat: "EEE, dd MMM yyyy HH:mm:ss zzz", toFormat: "dd", timeZone: time_zone)
    }
    var dayTitle: String {
        date.convertFromDateFormat(fromFormat: "EEE, dd MMM yyyy HH:mm:ss zzz", toFormat: "EEE", timeZone: time_zone)
    }
    var serverDate: String {
        date.convertFromDateFormat(fromFormat: "EEE, dd MMM yyyy HH:mm:ss zzz", toFormat: "yyyy-MM-dd", timeZone: time_zone)
    }

    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        time_zone = dictionary["time_zone"] as? String ?? ""
        date = dictionary["date"] as? String ?? ""
        id = dictionary["id"] as? Int ?? 0
        status = dictionary["status"] as? Int ?? 0
        times = [TimeModel]()
        if let timesArray = dictionary["times"] as? [[String:Any]]{
            for dic in timesArray{
                let value = TimeModel(fromDictionary: dic)
                value.startDate = date
                times.append(value)
            }
        }
    }

    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if time_zone != nil{
            dictionary["time_zone"] = time_zone
        }
        if date != nil{
            dictionary["date"] = date
        }
        if id != nil{
            dictionary["id"] = id
        }
        if status != nil{
            dictionary["status"] = status
        }
        if times != nil{
            var dictionaryElements = [[String:Any]]()
            for timesElement in times {
                dictionaryElements.append(timesElement.toDictionary())
            }
            dictionary["times"] = dictionaryElements
        }
        return dictionary
    }
}
class EventDetailTicket : NSObject{
    var other : String = ""
    var duration : String!
    var available : Int!
    var booked : Int!
    var id : Int!
    var price : String!
    var status : Int!
    var quantity : Int = 0
    var title : String!
    var originalPrice : String!
    var remaining: Int {
        guard let available = available, let booked = booked else {
            return 0
        }
        
        if booked > available || available < 0 || booked < 0 {
            return 0
        }
        
        return available - booked
    }
    
    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        available = dictionary["available"] as? Int ?? 0
        booked = dictionary["booked"] as? Int ?? 0
        id = dictionary["id"] as? Int ?? 0
        duration = dictionary["duration"] as? String ?? ""
        price = dictionary["price"] as? String ?? ""
        price = price.checkVariable(value: dictionary["price"] as Any)
        status = dictionary["status"] as? Int ?? 0
        title = dictionary["title"] as? String ?? ""
        originalPrice = price
        if price.toDouble() == 0.0{
            price = "FREE".localized
        }else{
            price = currency + price.formatAmount()
        }
    }
    
    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if available != nil{
            dictionary["available"] = available
        }
        if duration != nil{
            dictionary["duration"] = duration
        }
        if booked != nil{
            dictionary["booked"] = booked
        }
        if id != nil{
            dictionary["id"] = id
        }
        if price != nil{
            dictionary["price"] = price
        }
        if status != nil{
            dictionary["status"] = status
        }
        if title != nil{
            dictionary["title"] = title
        }
        return dictionary
    }
}
extension String {
    func toHTMLAttributedString() -> NSAttributedString? {
        guard let data = self.data(using: .utf8) else { return nil }
        do {
            return try NSAttributedString(data: data,
                                          options: [.documentType: NSAttributedString.DocumentType.html,
                                                    .characterEncoding: String.Encoding.utf8.rawValue],
                                          documentAttributes: nil)
        } catch {
            return NSAttributedString.init(string: self)
        }
    }
}
