//
//  EventDetailController.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 24/03/25.
//

import UIKit
import ImageSlideshow
import Lightbox

class EventDetailController: UIViewController {
    @IBOutlet weak var itemView: UIStackView!
    @IBOutlet weak var lblPayNow: UILabel!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var bookView: GlobalGradientView!
    @IBOutlet weak var footerStatusView: UIView!

    @IBOutlet weak var backgroundView: UIView!
    @IBOutlet weak var detailInfoHeight: NSLayoutConstraint!
    @IBOutlet weak var otherInfoHeight: NSLayoutConstraint!
    @IBOutlet weak var detailInfoVC: UIView!
    @IBOutlet weak var backStack: UIStackView!
    @IBOutlet weak var pageControl: UIPageControl!
    @IBOutlet weak var otherView: UIView!
    @IBOutlet weak var bannerCollectionView: UICollectionView!
    var eventData = HomePageEvent.init(fromDictionary: [String : Any]())
    var eventDetailData = EventDetailResponse.init(fromDictionary: [String : Any]()){
        didSet{
            if self.eventDetailData.categoryId == 3 || eventDetailData.categoryId == 4 || eventDetailData.categoryId == 9{
                self.lblPayNow.text = "BOOK TICKET".localized
            }else{
                self.eventDetailData.qrcode = ""
                self.lblPayNow  .text = self.eventDetailData.qrcode.isEmpty ? "BOOK TICKET".localized : "Already Booked".localized
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
    var apiLoaded = false
    var isFromSearch = false
    var wishlistUpdated : ((EventDetailResponse) -> Void)?
    var wishlistTapped : (() -> Void)?
    @IBOutlet weak var imgShare: UIImageView!
    @IBOutlet weak var imgWishlist: UIImageView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        notificationType = ""
        notificationID = 0

        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        backStack.addTap { r in
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
            let date = self.eventDetailData.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: self.eventDetailData.time_zone)
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
        bannerCollectionView.registerNIBs(SubscriptionImageCell.self)
        triggerEvents()
    }
    func navigatePayment(){
        if let vc: MakePaymentVC = self.getController(from: .main) {
            vc.eventDetailData = self.eventDetailData
            self.pushVC(vc: vc)
        }
    }
    func triggerEvents(){
        itemView.isHidden = true
        EventRequest.instance.triggerEventById(id: eventData.id ,participantId: eventData.participantId,searchId:isFromSearch ? 1 : 0) { data, status in
            if status{
                self.apiLoaded = true
                self.eventDetailData = data
                self.pageControl.numberOfPages = self.eventDetailData.images.count
                self.bannerCollectionView.refreshCollection()
                self.eventData.isWishlisted = self.eventDetailData.isWishlisted
                self.refreshWishlist()
                self.wishlistUpdated?(self.eventDetailData)
                self.addDetailInfoVC()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3, execute: {
                    self.itemView.isHidden = false
                })
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
        }
    }

    func addDetailInfoVC() {
        if let childVC = children.first(where: { $0 is EventInfoVC }) as? EventInfoVC {
            childVC.eventDetail = self.eventDetailData
            childVC.delegate = self
            childVC.viewTicketView.isHidden = true //self.eventDetailData.qrcode.isEmpty
            childVC.requestBuddyView.isHidden = true
            childVC.jpurneyLevelView.isHidden = self.eventDetailData.journeyName.isEmpty ? true : false
//            childVC.jpurneyLevelView.isHidden = self.eventDetailData.journeyLevelId == 0
            childVC.percentView.isHidden = true
            childVC.config(data: self.eventDetailData)
            childVC.imgJourneyInfo.addTap { r in
                if let topVC = topViewController(){
                    if let vc: JourneyInfoVC = topVC.getController(from: .authentication) {
                        vc.screenType = .journey
                        vc.screenMessage = self.eventDetailData.journeySubName
                        topVC.presentVC(vc: vc)
                    }
                }
            }
            childVC.organizerView.addTap { r in
                if let vc: OrganizerProfileVC = self.getController(from: .main) {
                    vc.eventDetailData = self.eventDetailData
                    vc.itemTapped = {
                        self.triggerEvents()
                    }
                    self.pushVC(vc: vc)
                }
            }
            childVC.partiesView.addTap { r in
                if let vc: EventSearchVC = self.getController(from: .main) {
                    vc.eventDetail = self.eventDetailData
                    vc.wishlistTapped = {
                        self.wishlistTapped?()
                    }
                    self.pushVC(vc: vc)
                }
            }
            childVC.viewTicketView.addTap { r in
                if let vc: EventDownloadVC = self.getController(from: .main) {
                    vc.eventDetailData = self.eventDetailData
                    self.presentVC(vc: vc,overFull:false)
                }
            }
            childVC.requestBuddyView.addTap { r in
                if self.eventDetailData.requestBuddy == "1"{
                    return
                }
                EventRequest.instance.triggerRequestBuddy(id: self.eventDetailData.id,type:1) { response, status in
                    if status{
                        self.eventDetailData.requestBuddy = "1"
                        childVC.lblRequstedbuddy.text = "Requested".localized
                        Utils.showToast(message: response.message)
                    }
                }
            }
            childVC.bgInnerView.setCornerRadius(32.0)
            childVC.partiesView.isHidden = true
            childVC.innerPercentView.isHidden = true
            childVC.view.setNeedsLayout()
            childVC.view.layoutIfNeeded()
        }
        self.addDetailOtherVC()
    }
    func addDetailOtherVC() {
        if let childVC = children.first(where: { $0 is EventOtherVC }) as? EventOtherVC {
            childVC.eventData = self.eventDetailData
            childVC.delegate = self
            childVC.config(data: self.eventDetailData)
            
            childVC.speakerTapped = { index in
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
            childVC.imgShare.addTap { r in
                self.shareLocation(type: 1)
            }
            childVC.imgShareEnquireLocation.addTap { r in
                self.shareLocation(type: 2)
            }
            childVC.mapView.addTap { r in
                var latitude = Double(self.eventDetailData.latitude) ?? 0.0
                var longitude = Double(self.eventDetailData.longitude) ?? 0.0
                var placeName = self.eventDetailData.location
                if self.eventDetailData.to_latitude.toDouble() != 0.0{
                    if self.eventDetailData.to_latitude.toDouble() != 0.0 && self.eventDetailData.to_longitude.toDouble() != 0.0{
                        latitude = Double(self.eventDetailData.to_latitude) ?? 0.0
                        longitude = Double(self.eventDetailData.to_longitude) ?? 0.0
                        placeName = self.eventDetailData.to_location
                    }
                }
                MapOpener.openMap(latitude: latitude, longitude: longitude, placeName: placeName)
            }
            childVC.enquiryMapView.addTap { r in
                let latitude = Double(self.eventDetailData.latitude) ?? 0.0
                let longitude = Double(self.eventDetailData.longitude) ?? 0.0
                MapOpener.openMap(latitude: latitude, longitude: longitude, placeName: self.eventDetailData.location)
            }
            childVC.view.setNeedsLayout()
            childVC.view.layoutIfNeeded()
        }
    }
    func shareLocation(type:Int){
        var location = eventDetailData.location ?? ""
        var latitude = eventDetailData.latitude ?? ""
        var longitude = eventDetailData.longitude ?? ""
        if !eventDetailData.to_location.isEmpty || eventDetailData.to_latitude.toDouble() != 0.0 || eventDetailData.to_longitude.toDouble() != 0.0{
            if type == 1{
                latitude = eventDetailData.to_latitude ?? ""
                longitude = eventDetailData.to_longitude ?? ""
                location = eventDetailData.to_location ?? ""
            }
        }
        let textToShare = "Address:".localized + " \(location) \("url:".localized) \("https://www.google.com/maps?q=\(latitude),\(longitude)")"
        self.shareText(textToShare: textToShare)
    }
    func refreshWishlist(){
        self.imgWishlist.image = self.eventData.isWishlisted == 1 ? UIImage.init(systemName: "heart.fill") : UIImage.init(named: "ic_event_unwishlist") ?? UIImage()
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        backgroundView.setCornerRadius([.topLeft,.topRight], radius: 32.0)
//        detailInfoVC.setCornerRadius(32.0)
//        otherView.setCornerRadius(32.0)
    }
}
extension EventDetailController:EventInfoVCDelegate,EventOtherVCDelegate{
    func updateContentViewHeight(to height: CGFloat) {
        detailInfoHeight.constant = height
        self.view.setNeedsLayout()
        self.view.layoutIfNeeded()
    }
    func updateOtherContentViewHeight(to height: CGFloat) {
        otherInfoHeight.constant = height
        self.view.setNeedsLayout()
        self.view.layoutIfNeeded()
    }
}
extension EventDetailController: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
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
extension EventDetailController{
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
extension EventDetailController: LightboxControllerPageDelegate,LightboxControllerDismissalDelegate {
    func lightboxController(_ controller: LightboxController, didMoveToPage  page: Int) {
       print(page)
    }
    func lightboxControllerWillDismiss(_ controller: LightboxController) {

    }
}
