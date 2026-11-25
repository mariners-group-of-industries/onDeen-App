//
//  EventDownloadVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 24/12/24.
//

import UIKit
import Photos

class EventDownloadVC: UIViewController {
    @IBOutlet weak var lblVenueTitle: SFProLabel!
    @IBOutlet weak var lblDownloadAll: SFProLabel!
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var lblTicketNo: SFProLabel!
    @IBOutlet weak var lblEventTitle: SFProLabel!
    @IBOutlet weak var lblEventTime: SFProLabel!
    @IBOutlet weak var lblEventDate: SFProLabel!
    @IBOutlet weak var lblVenueDetail: SFProLabel!
    @IBOutlet weak var lblAmount: SFProLabel!
    @IBOutlet weak var lblDashline: UILabel!
    @IBOutlet weak var imgQr: UIImageView!
    @IBOutlet weak var downloadView: UIView!
    @IBOutlet weak var addWalletview: UIView!
    @IBOutlet weak var circleLeftView: UIView!
    @IBOutlet weak var circleRightView: UIView!
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var isFromSuccess = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        tableView.registerNIBs(DownloadTicketCell.self)
        bgView.setAlphaBackground()
        lblTicketNo.text = "Ticket No.".localized + " \(eventDetailData.ticketNo ?? "")"
        lblEventTitle.text = eventDetailData.title
        lblEventDate.text = eventDetailData.startDate.convertFromDateFormat(fromFormat: isFromSuccess ? "yyyy-MM-dd" : "E, dd MMM yyyy HH:mm:ss z", toFormat: isFromSuccess ? "dd-MM-yyyy" : "dd MMM yyyy", timeZone: eventDetailData.time_zone)
        lblEventTime.text = eventDetailData.startTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: isFromSuccess ? "hh:mm a" : "hh:mm a", timeZone: eventDetailData.time_zone)
        if eventDetailData.categoryId == 3 || eventDetailData.categoryId == 4 || eventDetailData.categoryId == 9{
            lblEventDate.text = eventDetailData.ticket_date.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: eventDetailData.time_zone)
//            lblEventTime.text = eventDetailData.ticket_start_time.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: isFromSuccess ? "hh:mm a" : "hh:mm a", timeZone: eventDetailData.time_zone)
            
            lblEventTime.text = eventDetailData.ticket_start_time.convertTimeOnly(startDate: eventDetailData.startDate, startTimeString: eventDetailData.ticket_start_time, timeZone: eventDetailData.time_zone)
            if eventDetailData.ticket_date.isEmpty{
                lblEventDate.text = eventDetailData.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: eventDetailData.time_zone)

                let formats = [
                    "yyyy-MM-dd'T'HH:mm:ss", // Format 1
                    "yyyy-MM-dd HH:mm:ss",    // Format 2
                    "EEE, dd MMM yyyy HH:mm:ss zzz",
                    "yyyy-MM-dd"
                ]
                let dateFormatter = DateFormatter()
                for format in formats {
                    dateFormatter.dateFormat = format
                    let getTimeZone = eventDetailData.time_zone.getTimeZone()
                    dateFormatter.timeZone = getTimeZone
                    if let date = dateFormatter.date(from: eventDetailData.startDate) {
                        dateFormatter.dateFormat = "dd MMM yyyy"
                        let formattedDate = dateFormatter.string(from: date)
                        lblEventDate.text = formattedDate
                    }else{
                        lblEventDate.text = eventDetailData.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: eventDetailData.time_zone)
                    }
                }
                // Fallback to current date if parsing fails
                lblEventTime.text = eventDetailData.startTime.convertTimeOnly(startDate: eventDetailData.startDate, startTimeString: eventDetailData.startTime, timeZone: eventDetailData.time_zone)

            }


        }else{
            lblEventDate.text = eventDetailData.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: eventDetailData.time_zone)

            let formats = [
                "yyyy-MM-dd'T'HH:mm:ss", // Format 1
                "yyyy-MM-dd HH:mm:ss",    // Format 2
                "EEE, dd MMM yyyy HH:mm:ss zzz",
                "yyyy-MM-dd"
            ]
            let dateFormatter = DateFormatter()
            for format in formats {
                dateFormatter.dateFormat = format
                let getTimeZone = eventDetailData.time_zone.getTimeZone()
                dateFormatter.timeZone = getTimeZone
                if let date = dateFormatter.date(from: eventDetailData.startDate) {
                    dateFormatter.dateFormat = "dd MMM yyyy"
                    let formattedDate = dateFormatter.string(from: date)
                    lblEventDate.text = formattedDate
                }else{
                    lblEventDate.text = eventDetailData.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: eventDetailData.time_zone)
                }
            }
            // Fallback to current date if parsing fails
            lblEventTime.text = eventDetailData.startTime.convertTimeOnly(startDate: eventDetailData.startDate, startTimeString: eventDetailData.startTime, timeZone: eventDetailData.time_zone)
//            lblEventTime.text = eventDetailData.startTime.convertFromDateFormat(fromFormat: "HH:mm:ss", toFormat: isFromSuccess ? "hh:mm a" : "hh:mm a", timeZone: eventDetailData.time_zone)
        }
        lblVenueDetail.text = eventDetailData.location
        lblAmount.text = "Amount:".localized + " \(eventDetailData.price ?? "") \("(Paid)".localized)"
        imgQr.loadAsyncImage(loadURL: eventDetailData.qrPath)
        downloadView.addTap { r in
            if self.eventDetailData.participants.count > 1 {
                if let vc: ViewAllTicketVC = self.getController(from: .main) {
                    vc.eventDetailData = self.eventDetailData
                    vc.isSingleTickets = true
                    self.presentVC(vc: vc)
                }
            }else if self.eventDetailData.participants.count == 1{
                self.downloadAndSaveFile(from: self.eventDetailData.participants[0].ticket ?? "")
            }
        }
        addWalletview.addTap { r in
            self.dismissVC()
        }
        if eventDetailData.locationType == 0{
            lblVenueTitle.text = "Event Link"
            lblVenueDetail.text = eventDetailData.meet_link
            lblVenueDetail.addTap { r in
                self.openBrowser(urlString: self.eventDetailData.meet_link)
            }
        }
        tableView.reloadData()
        DispatchQueue.main.asyncAfter(deadline: .now()) {
            self.lblDownloadAll.text = "Download All"
            if self.eventDetailData.participants.count == 1{
                self.lblDownloadAll.text = "Download"
            }
            self.tableView.layoutIfNeeded() // Ensures layout is updated
            self.tableHeight.constant = self.tableView.contentSize.height

            UIView.animate(withDuration: 0.3) {
                self.view.layoutIfNeeded()
            }
        }
    }
    func addDashedBorder(to label: UILabel) {
        let borderLayer = CAShapeLayer()
        borderLayer.strokeColor = UIColor.black.cgColor
        borderLayer.lineDashPattern = [6, 3] // Dash length and space length
        borderLayer.frame = label.bounds
        borderLayer.fillColor = nil
        borderLayer.path = UIBezierPath(rect: label.bounds).cgPath
        label.layer.addSublayer(borderLayer)
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
        circleLeftView.config(isRoundCorner: true)
        circleRightView.config(isRoundCorner: true)
        downloadView.config(isRoundCorner: true)
        addWalletview.config(isRoundCorner: true)
        DispatchQueue.main.asyncAfter(deadline: .now()) {
            self.tableView.layoutIfNeeded() // Ensures layout is updated
            self.tableHeight.constant = self.tableView.contentSize.height

            UIView.animate(withDuration: 0.3) {
                self.view.layoutIfNeeded()
            }
        }
    }
}
extension EventDownloadVC:UIDocumentPickerDelegate{
    func downloadAndSaveFile(from urlString: String) {
        guard let url = URL(string: urlString) else {
            Utils.showToast(message: ("Invalid URL"))
            return
        }
        APIDispatcher.instance.showLoading()
        // Start the download
        let task = URLSession.shared.downloadTask(with: url) { [weak self] tempURL, response, error in
            APIDispatcher.instance.removeLoading()
            if let error = error {
                Utils.showToast(message: ("Download failed: \(error)"))
                return
            }
            guard let tempURL = tempURL else {
                Utils.showToast(message: ("No file URL"))
                return
            }
            // Move the file to a persistent location in Documents directory
             let fileManager = FileManager.default
             let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
             let destinationURL = documentsDirectory.appendingPathComponent(url.lastPathComponent)
             
             do {
                 // Remove existing file if any
                 if fileManager.fileExists(atPath: destinationURL.path) {
                     try fileManager.removeItem(at: destinationURL)
                 }
                 // Move the file from temp to the persistent directory
                 try fileManager.moveItem(at: tempURL, to: destinationURL)
                 
                 // Present the save dialog for the persistent file
                 DispatchQueue.main.async {
                     self?.presentSaveDialog(tempURL: destinationURL)
                 }
             } catch {
                 print("File move error: \(error)")
             }
        }
        task.resume()
    }
    
    private func presentSaveDialog(tempURL: URL) {
        if #available(iOS 14.0, *) {
            let documentPicker = UIDocumentPickerViewController(forExporting: [tempURL])
            documentPicker.delegate = self
            documentPicker.allowsMultipleSelection = false
            documentPicker.modalPresentationStyle = .formSheet
            present(documentPicker, animated: true, completion: nil)
        } else {
            // Fallback on earlier versions
        }
    }
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let savedURL = urls.first else { return }
        Utils.showToast(message: ("File successfully saved"))
    }
    
    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        print("User canceled file save.")
    }

}
extension EventDownloadVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return eventDetailData.participants.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(DownloadTicketCell.self, at: indexPath)
        cell.config(data: eventDetailData.participants[indexPath.row], index: indexPath.row)
        cell.footerStack.addTap { r in
            let getTag = r.view?.tag ?? 0
            self.navigatetToAllTicket(index: getTag)
        }
        return cell
    }
    func navigatetToAllTicket(index:Int){
        if let vc: ViewAllTicketVC = self.getController(from: .main) {
            vc.participantData = self.eventDetailData.participants[index]
            self.presentVC(vc: vc)
        }
    }
}
extension UILabel {
    func createDashedLine(from point1: CGPoint, to point2: CGPoint, color: UIColor, strokeLength: NSNumber, gapLength: NSNumber, width: CGFloat) {
        let shapeLayer = CAShapeLayer()

        shapeLayer.strokeColor = color.cgColor
        shapeLayer.lineWidth = width
        shapeLayer.lineDashPattern = [strokeLength, gapLength]

        let path = CGMutablePath()
        path.addLines(between: [point1, point2])
        shapeLayer.path = path
        layer.addSublayer(shapeLayer)
    }
}
extension EventDownloadVC{
    func downloadAndSaveImages(imageUrls:[String]) {
        requestPhotoLibraryAccess { granted in
            guard granted else {
                Utils.showToast(message: "Photo Library access denied.")
                return
            }
            
            for urlString in imageUrls {
                if let url = URL(string: urlString) {
                    self.downloadImage(from: url) { image in
                        if let image = image {
                            self.saveImageToPhotos(image)
                        }
                    }
                }
            }
        }
    }

    // Request permission to access the photo library
    func requestPhotoLibraryAccess(completion: @escaping (Bool) -> Void) {
        PHPhotoLibrary.requestAuthorization { status in
            DispatchQueue.main.async {
                if #available(iOS 14, *) {
                    completion(status == .authorized || status == .limited)
                } else {
                    // Fallback on earlier versions
                }
            }
        }
    }

    // Download image from URL
    func downloadImage(from url: URL, completion: @escaping (UIImage?) -> Void) {
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let data = data, error == nil, let image = UIImage(data: data) {
                DispatchQueue.main.async {
                    completion(image)
                }
            } else {
                print("Failed to download image: \(error?.localizedDescription ?? "Unknown error")")
                completion(nil)
            }
        }.resume()
    }

    // Save image to Photos app
    func saveImageToPhotos(_ image: UIImage) {
        PHPhotoLibrary.shared().performChanges {
            PHAssetChangeRequest.creationRequestForAsset(from: image)
        } completionHandler: { success, error in
            if success {
                Utils.showToast(message: "Your ticket has been successfully saved to your Photos.")
            }
        }
    }
}
