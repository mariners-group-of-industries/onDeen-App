//
//  EventDetailVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit
import ImageSlideshow
import SDWebImage
import Lightbox
var isEventLogin = false
class EventDetailVC: UIViewController,DynamicHeightCellDelegate {
    @IBOutlet weak var tableStack: UIStackView!
    @IBOutlet weak var pageControl: UIPageControl!
    var isImageAppearing = false
    @IBOutlet weak var lblPayNow: UILabel!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var bookView: GlobalGradientView!
    @IBOutlet weak var footerStatusView: UIView!
    @IBOutlet weak var imgShare: UIImageView!
    @IBOutlet weak var imgWishlist: UIImageView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backView: UIStackView!
    var eventData = HomePageEvent.init(fromDictionary: [String : Any]())
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]()){
        didSet{
            if self.eventDetailData.categoryId == 3 || eventDetailData.categoryId == 4 || eventDetailData.categoryId == 9{
                self.lblPayNow.text = "BOOK TICKET".localized
            }else{
                self.eventDetailData.qrcode = ""
                self.lblPayNow.text = self.eventDetailData.qrcode.isEmpty ? "BOOK TICKET".localized : "Already Booked".localized
            }
            if self.eventDetailData.categoryId == 3 || eventDetailData.categoryId == 4 || eventDetailData.categoryId == 9{
                self.bookView.isUserInteractionEnabled = true
            }else{
                self.bookView.isUserInteractionEnabled = self.eventDetailData.qrcode.isEmpty
            }
            self.lblPrice.text = self.eventDetailData.price
            self.refreshWishlist()
        }
    }
    var wishlistTapped : (() -> Void)?
    var wishlistUpdated : ((EventDetailResponse) -> Void)?
    var apiLoaded = false
    var isFromSearch = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        tableView.rowHeight = UITableView.automaticDimension
        tableView.estimatedRowHeight = 100 // A reasonable estimate
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        backView.addTap { r in
            self.popVC()
        }
        imgWishlist.addTap { r in
            if self.isGuestUser(){
                self.showGuestLogin()
                return
            }
            self.wishlistTapped?()
            self.triggerToggleWishlist()
        }
        imgShare.addTap { r in
            var organiserName = ""
            if let organiser = self.eventDetailData.organizer{
                organiserName = organiser.name
            }
            let date = self.eventDetailData.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy",timeZone:self.eventDetailData.time_zone)
            let time = self.eventDetailData.startTime.convertDateTime(startDateString: self.eventDetailData.startDate, startTimeString: self.eventDetailData.startTime, timeZone: self.eventDetailData.time_zone)
            
            if let imageURLString = self.eventDetailData.images[0].fullScreenImage,
               let imageURL = URL(string: imageURLString) {
                // Call the shareEvent function with the valid URL
                self.shareEvent(name: self.eventDetailData.title,
                                organizer: organiserName,
                                date: "\(date) \(time)",
                                location: self.eventDetailData.location,
                                category: self.eventDetailData.categoryTitle,
                                link: self.eventDetailData.shareUrl,
                                imageURL: imageURL,
                                from: self)
            } else {
                // Handle invalid image URL
                self.shareEvent(name: self.eventDetailData.title,
                                organizer: organiserName,
                                date: "\(date) \(time)",
                                location: self.eventDetailData.location,
                                category: self.eventDetailData.categoryTitle,
                                link: self.eventDetailData.shareUrl,
                                imageURL: URL.init(string: ""),
                                from: self)
            }

            
//            self.shareEvent(name: self.eventDetailData.title, organizer: organiserName, date: "\(date) \(time)", location: self.eventDetailData.location, category: self.eventDetailData.categoryTitle, link: self.eventDetailData.shareUrl, from: self)
        }
        bookView.addTap { r in
            if self.isGuestUser(){
                isSkipLogin = true
                self.showYesnoAlertWithClosure(title: "Continue to login?", type: 0, vc: self) { status in
                    if status{
                        UserDefaults.standard.removeObject(forKey: "access_token")
                        UserDefaults.standard.removeObject(forKey: "Authorization")
                        UserDefaults.standard.removeObject(forKey: "isForgotToken")
                        UserDefaults.standard.synchronize()
                        LoginRequest.instance.registerInitToken { status in
                            if let vc: ViewController = self.getController(from: .authentication) {
                                isEventLogin = true
                                self.presentVC(vc: vc)
                            }
                        }
                    }
                }
                return
            }
            self.navigatePayment()
        }
        tableView.register(UINib(nibName: "EventCourseHeaderCell", bundle: nil), forCellReuseIdentifier: "EventCourseHeaderCell")
        tableView.registerNIBs(EventDetailCell.self,EventLocationCell.self,EventSpeakersCell.self,EventDetailOtherCell.self)
        collectionView.registerNIBs(SubscriptionImageCell.self)
        tableView.backgroundColor = .white
        triggerEvents()

    }
    func triggerBookEvent(){
        EventRequest.instance.triggerBookEvent(param: ["event_id" : eventDetailData.id ?? 0]) { response, status in
            let modal = CommonModal.init(fromDictionary: response)
            if modal.status{
                if let vc: EventSuccessVC = self.getController(from: .main) {
                    vc.eventInfo = response
                    self.presentVC(vc: vc)
                }
            }else{
                Utils.showToast(message: modal.response.message)
            }
        }
    }
    func navigatePayment(){
        if let vc: MakePaymentVC = self.getController(from: .main) {
            vc.eventDetailData = self.eventDetailData
            self.pushVC(vc: vc)
        }
    }
    func triggerEvents() {
        EventRequest.instance.triggerEventById(id: eventData.id, participantId: eventData.participantId, searchId: isFromSearch ? 1 : 0) { data, status in
            if status {
                DispatchQueue.main.async {
                    self.apiLoaded = true
                    self.eventDetailData = data
                    self.pageControl.numberOfPages = self.eventDetailData.images.count
                    self.collectionView.reloadData()
                    self.tableView.reloadData()
                    self.eventData.isWishlisted = self.eventDetailData.isWishlisted
                    self.refreshWishlist()
                    self.wishlistUpdated?(self.eventDetailData)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: {
                        self.tableView.backgroundColor = .black
                    })
                }
            }
        }
    }

    func triggerEvents123(){
        EventRequest.instance.triggerEventById(id: eventData.id ,participantId: eventData.participantId,searchId:isFromSearch ? 1 : 0) { data, status in
            if status{
                self.apiLoaded = true
                self.eventDetailData = data
                self.pageControl.numberOfPages = self.eventDetailData.images.count
                self.collectionView.refreshCollection()
                UIView.performWithoutAnimation {
                    self.tableView.reloadData()
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: {
                    self.tableView.backgroundColor = .black
                })
                self.eventData.isWishlisted = self.eventDetailData.isWishlisted
                self.refreshWishlist()
                self.wishlistUpdated?(self.eventDetailData)
            }
        }
    }
    func triggerToggleWishlist(){
        let id = eventData.id ?? 0
        EventRequest.instance.triggerWishlistEvent(param: ["event_id" : id]) { response, status in
            EventRequest.instance.triggerEventById(id: self.eventData.id ,participantId: self.eventData.participantId,searchId:self.isFromSearch ? 1 : 0) { data, status in
                self.eventDetailData = data
                self.eventData.isWishlisted = self.eventDetailData.isWishlisted
                self.refreshWishlist()
                self.wishlistUpdated?(self.eventDetailData)
            }
//            Utils.showToast(message: response.message)
        }
    }
    func refreshWishlist(){
        self.imgWishlist.image = self.eventData.isWishlisted == 1 ? UIImage.init(systemName: "heart.fill") : UIImage.init(named: "ic_event_unwishlist") ?? UIImage()
    }

    override func viewDidAppear(_ animated: Bool) {
        if isImageAppearing{
            isImageAppearing = false
            return
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        footerStatusView.config(cornerRadius: 12.0)
        tableView.config(cornerRadius: 32.0)
    }
    func updateTableView() {
        DispatchQueue.main.async {
            self.tableView.beginUpdates()
            self.tableView.endUpdates()
        }
    }
}
extension EventDetailVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return self.apiLoaded ? 2 : 0
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
//        if section == 3{
//            return 1
//        }
        return 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if indexPath.section == 1{
            let cell = tableView.dequeueReusableCell(withIdentifier: "EventDetailOtherCell", for: indexPath) as! EventDetailOtherCell
            cell.speakerTapped = { index in
                if let vc: SpeakerVC = self.getController(from: .main) {
                    vc.speakerData = self.eventDetailData.speakers[index]
                    vc.wishlistTapped = { data in
                        if data.id == self.eventDetailData.id{
                            self.eventDetailData.isWishlisted = data.isWishlisted
                            self.eventData.isWishlisted = data.isWishlisted
                            self.refreshWishlist()
                            self.wishlistUpdated?(self.eventDetailData)
                        }
                    }
                    self.pushVC(vc: vc)
                }
            }
            cell.moreTapped = {
                self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 1)], with: .none)
            }
            cell.imgShare.addTap { r in
                self.shareLocation(type: 1)
            }
            cell.imgShareEnquireLocation.addTap { r in
                self.shareLocation(type: 2)
            }
            cell.mapView.addTap { r in
                let latitude = Double(self.eventDetailData.latitude) ?? 0.0
                let longitude = Double(self.eventDetailData.longitude) ?? 0.0
                MapOpener.openMap(latitude: latitude, longitude: longitude, placeName: self.eventDetailData.location)
            }
            cell.config(data: eventDetailData)
            cell.delegate = self // Set delegate
            return cell
        }
        let cell = tableView.configureCell(EventDetailCell.self, at: indexPath)
        cell.carosoulView.isHidden = true
        cell.bookTicketView.isHidden = true
        cell.organizerView.addTap { r in
            if let vc: OrganizerProfileVC = self.getController(from: .main) {
                vc.eventDetailData = self.eventDetailData
                vc.itemTapped = {
                    self.triggerEvents()
                }
                self.pushVC(vc: vc)
            }
        }
        cell.lblAboutMore.addTap { r in
            self.eventDetailData.moreLines = self.eventDetailData.moreLines == 0 ? 2 : 0
            self.tableView.reloadRows(at: [IndexPath.init(row: 0, section: 0)], with: .none)
        }
        cell.config(data: eventDetailData)
        cell.percentView.isHidden = true
        return cell
    }
    func shareLocation(type:Int){
        var location = eventDetailData.location ?? ""
        var latitude = eventDetailData.latitude ?? ""
        var longitude = eventDetailData.longitude ?? ""
        if !eventDetailData.to_location.isEmpty && type == 1{
            latitude = eventDetailData.to_latitude ?? ""
            longitude = eventDetailData.to_longitude ?? ""
            location = eventDetailData.to_location ?? ""
        }
        let textToShare = "Address:".localized + " \(location) \("url:".localized) \("https://www.google.com/maps?q=\(latitude),\(longitude)")"
        self.shareText(textToShare: textToShare)
    }
}
extension EventDetailVC: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return eventDetailData.images.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(SubscriptionImageCell.self, at: indexPath)
        cell.tag = 1
        cell.imgView.loadAsyncImage(loadURL: eventDetailData.images[indexPath.item].fullScreenImage)
        return cell
    }
    
    // MARK: - UIScrollViewDelegate
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let page = Int(scrollView.contentOffset.x / scrollView.frame.width)
        pageControl.currentPage = page
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: collectionView.bounds.width, height: collectionView.bounds.height)
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let images = eventDetailData.images.map { $0.fullScreenImage ?? ""}
        if images.count == 0{
            return
        }
        self.showSlideShow(data: images, showIndex: indexPath.item)
    }
    func showSlideShow(data: Any, showIndex: Int) {
        let slideshow = ImageSlideshow()
        var valueContains = false

        if let showData = data as? [String], showData.count > 0 {
            showLightBox(urls: showData, index: showIndex)
        }
    }
}
extension EventDetailVC{
    func showLightBox(urls:[String],index:Int){
        // Create an array of images.
        var images = [LightboxImage]()
        for image in urls{
            images.append(LightboxImage(imageURL: URL(string: image)!))
        }
        // Create an instance of LightboxController.
        let controller = LightboxController(images: images)
        // Set delegates.
        controller.pageDelegate = self
        controller.dismissalDelegate = self
        // Use dynamic background.
        controller.dynamicBackground = true
        // Present your controller.
        present(controller, animated: true, completion: {
            controller.goTo(index)
        })
    }
}
extension EventDetailVC: LightboxControllerPageDelegate,LightboxControllerDismissalDelegate {
    func lightboxController(_ controller: LightboxController, didMoveToPage  page: Int) {
       print(page)
    }
    func lightboxControllerWillDismiss(_ controller: LightboxController) {

    }
}
