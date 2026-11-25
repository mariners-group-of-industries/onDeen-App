//
//  ViewAllTicketVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 12/02/25.
//

import UIKit
import Photos

class ViewAllTicketVC: UIViewController {
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var lblTapToShareTicket: SFProLabel!
    @IBOutlet weak var lblDownloadAll: SFProLabel!
    @IBOutlet weak var backView: UIStackView!
    @IBOutlet weak var lblHeaderTitle: SFProLabel!
    var participantData = EventDetailParticipant.init(fromDictionary: [String : Any]())
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var allTickets = [EventDetailParticipant]()
    var isSingleTickets = false
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        tableView.registerNIBs(DownloadTicketCell.self)
        backView.addTap { r in
            self.dismissVC()
        }
        if !isSingleTickets{
            lblHeaderTitle.text = participantData.ticketTitle
            EventRequest.instance.triggerGetAllTickets(param: ["participant_id" : participantData.participantId ?? 0]) { data, status in
                if status{
                    self.allTickets = data
                    self.tableView.refreshTable()
                }
            }
        }else{
            lblHeaderTitle.text = self.eventDetailData.title
            self.allTickets += self.eventDetailData.participants
            self.tableView.refreshTable()
        }
        lblDownloadAll.isHidden = true
        lblDownloadAll.addTap { r in
            let images = self.allTickets.map { $0.qrcodePath ?? ""}
            if images.count != 0{
                self.downloadAndSaveImages(imageUrls: images)
            }
        }
    }
}
extension ViewAllTicketVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.allTickets.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(DownloadTicketCell.self, at: indexPath)
        cell.configTicket(data: allTickets[indexPath.row], data1: participantData, index: indexPath.row)
        cell.footerStack.isHidden = true
        cell.lblDownload.isHidden = false
        cell.lblDownload.tag = indexPath.row
        cell.lblDownload.addTap { r in
            let getTag = r.view?.tag ?? 0
            self.downloadAndSaveFile(from: self.allTickets[getTag].ticket ?? "")
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if let cell = tableView.cellForRow(at: indexPath) as? DownloadTicketCell{
            if let getImage = cell.imgQR.image{
                shareImage(getImage, from: self)
            }
        }
    }
    func shareImage(_ image: UIImage, from viewController: UIViewController) {
        let activityViewController = UIActivityViewController(activityItems: [image], applicationActivities: nil)
        
        // For iPads, set the sourceView to avoid crashes
        if let popoverController = activityViewController.popoverPresentationController {
            popoverController.sourceView = viewController.view
            popoverController.sourceRect = CGRect(x: viewController.view.bounds.midX, y: viewController.view.bounds.midY, width: 0, height: 0)
            popoverController.permittedArrowDirections = []
        }
        
        viewController.present(activityViewController, animated: true)
    }
}
extension ViewAllTicketVC:UIDocumentPickerDelegate{
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

extension ViewAllTicketVC{
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
