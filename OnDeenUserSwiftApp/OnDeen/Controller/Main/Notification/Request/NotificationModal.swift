//
//  NotificationModal.swift
//  OnDeen
//
//  Created by Thabu's Mac on 09/04/25.
//


import Foundation

class NotificationModal: NSObject {

    var response: [NotificationItem] = []
    var status: Bool = false

    init(fromDictionary dictionary: [String: Any]) {
        if let status = dictionary["status"] as? Bool {
            self.status = status
        }

        if let responseArray = dictionary["response"] as? [[String: Any]] {
            self.response = responseArray.map { NotificationItem(fromDictionary: $0) }
        }
    }

    func toDictionary() -> [String: Any] {
        var dictionary = [String: Any]()
        dictionary["status"] = status
        dictionary["response"] = response.map { $0.toDictionary() }
        return dictionary
    }
}
class NotificationItem: NSObject {

    var createdOn: String = ""
    var eventID: Int = 0
    var id: Int = 0
    var message: String = ""
    var seen: Int = 0
    var title: String = ""
    var type: Int = 0

    init(fromDictionary dictionary: [String: Any]) {
        self.createdOn = dictionary["created_on"] as? String ?? ""
        self.eventID = dictionary["event_id"] as? Int ?? 0
        self.id = dictionary["id"] as? Int ?? 0
        self.message = dictionary["message"] as? String ?? ""
        self.seen = dictionary["seen"] as? Int ?? 0
        self.title = dictionary["title"] as? String ?? ""
        self.type = dictionary["type"] as? Int ?? 0
    }

    func toDictionary() -> [String: Any] {
        return [
            "created_on": createdOn,
            "event_id": eventID,
            "id": id,
            "message": message,
            "seen": seen,
            "title": title,
            "type": type
        ]
    }
}
