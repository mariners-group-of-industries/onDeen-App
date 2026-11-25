//
//  MYNotesVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class MYNotesVC: UIViewController {
    @IBOutlet weak var createNoteView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIView!
    @IBOutlet weak var addNoteView: UIView!
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var notesData = [EventNotesResponse]()
    var groupedEvents: [String: [EventNotesResponse]] = [:]
    var sortedDates: [String] = []
    var noteCount : ((Int) -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    func config(){
        tableView.registerNIBs(MYNotesCell.self,BookingMaterialHeaderCell.self)
        addNoteView.addTap { r in
            self.addnoteView()
        }
        backView.addTap { r in
            self.dismissVC()
        }
        self.createNoteView.addTap { r in
            self.addnoteView()
        }
        triggerNotes()
    }
    func addnoteView(isEdit:Bool = false,data:EventNotesResponse = EventNotesResponse.init(fromDictionary: [String : Any]())){
        if let vc: MaterialQuestionVC = self.getController(from: .main) {
            vc.eventDetailData = self.eventDetailData
            vc.isFromNote = true
            vc.noteTapped = { data in
                self.triggerNotes()
            }
            vc.isEditNote = isEdit
            vc.noteData = data
            self.presentVC(vc: vc)
        }
    }
    func triggerNotes(){
        EventRequest.instance.triggerEventNotes(id: eventDetailData.id) { response, status in
            self.notesData = response
            self.createNoteView.isHidden = self.notesData.count != 0
            self.tableView.isHidden = self.notesData.count == 0
            self.noteCount?(self.notesData.count)
            self.groupAndSortNotes()
        }
    }
    func groupAndSortNotes() {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "en_US_POSIX") // Ensures consistency
        formatter.timeZone = TimeZone.current // Use the device's timezone

        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "dd-MM-yyyy"
        outputFormatter.locale = Locale(identifier: "en_US_POSIX")
        outputFormatter.timeZone = TimeZone.current

        var tempGroupedEvents: [String: [EventNotesResponse]] = [:] // Temp dictionary for debugging

        for note in notesData {
            if let createdOn = note.createdOn {
                if let date = formatter.date(from: createdOn) {
                    let dateString = outputFormatter.string(from: date)
                    tempGroupedEvents[dateString, default: []].append(note)
                }
            }
        }

        groupedEvents = tempGroupedEvents
        sortedDates = groupedEvents.keys.sorted(by: { $0 > $1 })
        tableView.reloadData()
    }
}
extension MYNotesVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
            return sortedDates.count
        }
        
        func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
            return sortedDates[section]
        }
        
        func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
            let key = sortedDates[section]
            return groupedEvents[key]?.count ?? 0
        }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(MYNotesCell.self, at: indexPath)
        let key = sortedDates[indexPath.section]
        if let notes = groupedEvents[key] {
            let event = notes[indexPath.row]
            cell.lblTitle.text = event.title
            cell.lblSubtitle.text = event.notes
            cell.lblTime.text = event.createdOn.convertServerDateFormat(toFormat: "hh:mm a", timeZone: event.time_zone)
            return cell
        }
        let event = self.notesData[indexPath.row]
        cell.lblTitle.text = event.title
        cell.lblSubtitle.text = event.notes
        cell.lblTime.text = event.createdOn.convertServerDateFormat(toFormat: "hh:mm a", timeZone: event.time_zone)
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let key = sortedDates[indexPath.section]
        if let notes = groupedEvents[key] {
            self.addnoteView(isEdit: true,data:notes[indexPath.row])
            return
        }
        self.addnoteView(isEdit: true,data:self.notesData[indexPath.row])
    }
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        let cell = tableView.configHeaderCell(BookingMaterialHeaderCell.self)
        cell.configHeader(title: sortedDates[section].convertServerDateFormat(toFormat: "dd MMM yyyy", timeZone: ""), subTitle: "")
        cell.bgView.backgroundColor = .clear
        cell.backgroundColor = .clear
        return cell
    }
    // MARK: - Swipe to Delete
   func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
       if editingStyle == .delete {
           let key = sortedDates[indexPath.section]
           if let notes = groupedEvents[key] {
               let event = notes[indexPath.row]
               self.triggerDeleteNote(id: event.id)
           }
           groupedEvents[key]?.remove(at: indexPath.row)
           // If section is empty, remove it
           if groupedEvents[key]?.isEmpty == true {
               groupedEvents.removeValue(forKey: key)
               sortedDates.removeAll { $0 == key }
           }
           tableView.reloadData()
       }
   }
    func triggerDeleteNote(id:Int){
        var param = ["id":id] as [String : Any]
        EventRequest.instance.triggerEventDeleteNote(param: param) { response, status in
            self.triggerNotes()
            Utils.showToast(message: response.message)
        }
    }
}
