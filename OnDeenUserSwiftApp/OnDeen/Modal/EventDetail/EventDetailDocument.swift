//
//	EventDetailDocument.swift
//	Model file generated using JSONExport: https://github.com/Ahmed-Ali/JSONExport

import Foundation


class EventDetailDocument : NSObject{

	var arDocumentName : String!
	var documentName : String!
	var filePath : String!
	var id : Int!
	var status : Int!
    var files : [EventDetailFile]!


	/**
	 * Instantiate the instance using the passed dictionary values to set the properties values
	 */
	init(fromDictionary dictionary: [String:Any]){
        files = [EventDetailFile]()
        if let filesArray = dictionary["files"] as? [[String:Any]]{
            for dic in filesArray{
                let value = EventDetailFile(fromDictionary: dic)
                files.append(value)
            }
        }
        arDocumentName = dictionary["ar_document_name"] as? String ?? ""
		documentName = dictionary["document_name"] as? String ?? ""
		filePath = dictionary["file_path"] as? String ?? ""
		id = dictionary["id"] as? Int ?? 0
		status = dictionary["status"] as? Int ?? 0
	}

	/**
	 * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
	 */
	func toDictionary() -> [String:Any]
	{
		var dictionary = [String:Any]()
		if arDocumentName != nil{
			dictionary["ar_document_name"] = arDocumentName
		}
		if documentName != nil{
			dictionary["document_name"] = documentName
		}
		if filePath != nil{
			dictionary["file_path"] = filePath
		}
		if id != nil{
			dictionary["id"] = id
		}
		if status != nil{
			dictionary["status"] = status
		}
        if files != nil{
            var dictionaryElements = [[String:Any]]()
            for filesElement in files {
                dictionaryElements.append(filesElement.toDictionary())
            }
            dictionary["files"] = dictionaryElements
        }
		return dictionary
	}
}
class EventDetailFile : NSObject{
    
    var filePath : String!
    var id : Int!
    var status : Int!
    
    
    /**
     * Instantiate the instance using the passed dictionary values to set the properties values
     */
    init(fromDictionary dictionary: [String:Any]){
        filePath = dictionary["file_path"] as? String ?? ""
        id = dictionary["id"] as? Int ?? 0
        status = dictionary["status"] as? Int ?? 0
    }
    
    /**
     * Returns all the available property values in the form of [String:Any] object where the key is the approperiate json key and the value is the value of the corresponding property
     */
    func toDictionary() -> [String:Any]
    {
        var dictionary = [String:Any]()
        if filePath != nil{
            dictionary["file_path"] = filePath
        }
        if id != nil{
            dictionary["id"] = id
        }
        if status != nil{
            dictionary["status"] = status
        }
        return dictionary
    }
    
}
