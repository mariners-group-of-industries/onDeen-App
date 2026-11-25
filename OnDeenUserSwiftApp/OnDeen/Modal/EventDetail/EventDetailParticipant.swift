//
//	EventDetailParticipant.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailParticipant : NSObject{

	var date : String!
	var endTime : String!
	var paidAmount : String!
	var participantId : Int!
	var qrcode : String!
	var qrcodeCount : Int!
	var qrcodePath : String!
	var quantity : Int!
	var startTime : String!
	var ticket : String!
	var ticketId : Int!
	var ticketNo : String!
	var ticketTitle : String!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
		date = dictionary["date"] as? String ?? ""
		endTime = dictionary["end_time"] as? String ?? ""
		paidAmount = dictionary["paid_amount"] as? String ?? ""
        if paidAmount.isEmpty{
            paidAmount = dictionary["event_price"] as? String ?? ""
        }
        paidAmount = paidAmount.formatAmount()
		participantId = dictionary["participant_id"] as? Int ?? 0
		qrcode = dictionary["qrcode"] as? String ?? ""
		qrcodeCount = dictionary["qrcode_count"] as? Int ?? 0
		qrcodePath = dictionary["qrcode_path"] as? String ?? ""
		quantity = dictionary["quantity"] as? Int ?? 0
		startTime = dictionary["start_time"] as? String ?? ""
		ticket = dictionary["ticket"] as? String ?? ""
		ticketId = dictionary["ticket_id"] as? Int ?? 0
		ticketNo = dictionary["ticket_no"] as? String ?? ""
        ticketNo = ticketNo.checkVariable(value: dictionary["ticket_no"] as Any)
        
		ticketTitle = dictionary["ticket_title"] as? String ?? ""
        if ticketNo.toDouble() == 0.0{
            ticketNo = "\(ticketId ?? 0)"
        }
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if date != nil{
			dictionary["date"] = date
		}
		if endTime != nil{
			dictionary["end_time"] = endTime
		}
		if paidAmount != nil{
			dictionary["paid_amount"] = paidAmount
		}
		if participantId != nil{
			dictionary["participant_id"] = participantId
		}
		if qrcode != nil{
			dictionary["qrcode"] = qrcode
		}
		if qrcodeCount != nil{
			dictionary["qrcode_count"] = qrcodeCount
		}
		if qrcodePath != nil{
			dictionary["qrcode_path"] = qrcodePath
		}
		if quantity != nil{
			dictionary["quantity"] = quantity
		}
		if startTime != nil{
			dictionary["start_time"] = startTime
		}
		if ticket != nil{
			dictionary["ticket"] = ticket
		}
		if ticketId != nil{
			dictionary["ticket_id"] = ticketId
		}
		if ticketNo != nil{
			dictionary["ticket_no"] = ticketNo
		}
		if ticketTitle != nil{
			dictionary["ticket_title"] = ticketTitle
		}
		return dictionary
	}

}
