//
//  EventOtherVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 24/03/25.
//

import UIKit
import MapKit
protocol EventOtherVCDelegate: AnyObject {
    func updateOtherContentViewHeight(to height: CGFloat)
}

class EventOtherVC: UIViewController {
    @IBOutlet weak var meetLink: UIView!
    @IBOutlet weak var lblMeetLink: SFProLabel!
    @IBOutlet weak var enquiryMapView: MKMapView!
    weak var delegate: EventOtherVCDelegate?
    @IBOutlet weak var lblTermsOfUse: SFProLabel!
    @IBOutlet weak var lblLocationHeader: SFProLabel!
    @IBOutlet weak var imgShareEnquireLocation: UIImageView!
    @IBOutlet weak var lblEnquireLocation: SFProLabel!
    @IBOutlet weak var enquiryLocationView: UIView!
    @IBOutlet weak var speakerView: UIView!
    @IBOutlet weak var speakerHeight: NSLayoutConstraint!
    @IBOutlet weak var speakerCollectionView: UICollectionView!

    @IBOutlet weak var courseTableHeight: NSLayoutConstraint!
    @IBOutlet weak var courseTableView: UITableView!
    @IBOutlet weak var courseView: UIView!

    @IBOutlet weak var iterTableView: UITableView!
    @IBOutlet weak var iterView: UIView!
    @IBOutlet weak var iterTableHeight: NSLayoutConstraint!
    @IBOutlet weak var faceilityHeight: NSLayoutConstraint!
    @IBOutlet weak var facilitiesTableView: UITableView!
    @IBOutlet weak var imgShare: UIImageView!
    @IBOutlet weak var lblAddress: SFProLabel!
    @IBOutlet weak var rulesView: UIView!
    @IBOutlet weak var breakdownView: UIView!
    @IBOutlet weak var eventView: UIView!
    @IBOutlet weak var breakdownTableHeight: NSLayoutConstraint!
    @IBOutlet weak var breakdownTableView: UITableView!
    @IBOutlet weak var mapView: MKMapView!
    var speakerTapped : ((Int) -> Void)?
    var moreTapped : (() -> Void)?
    var eventSpeakers = [EventDetailSpeaker](){
        didSet{
            self.speakerCollectionView.reloadData()
        }
    }
    var termsConditions = [[String:Any]]()
    var facilitiesData = [EventDetailFacility](){
        didSet{
            self.facilitiesTableView.reloadData()
        }
    }
    var eventData = EventDetailResponse.init(fromDictionary: [String : Any]())
    var isFromMyBooking = false

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        courseTableView.registerNIBs(EventCourseCell.self)
        iterTableView.registerNIBs(EventCourseCell.self)

        breakdownTableView.registerNIBs(EventBreakdownCell.self)
        speakerCollectionView.registerNIBs(EventSpeakerCell.self)
        facilitiesTableView.registerNIBs(EventBreakdownCell.self)
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        lblEnquireLocation.preferredMaxLayoutWidth = lblEnquireLocation.frame.width
        lblAddress.preferredMaxLayoutWidth = lblAddress.frame.width

        self.rulesView.setCornerRadius([.topLeft,.topRight], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
        self.courseView.setCornerRadius(32.0)
        self.iterView.setCornerRadius(32.0)
        self.eventView.setCornerRadius(32.0)
        self.speakerView.setCornerRadius(32.0)
        self.mapView.setCornerRadius(24.0)
        self.enquiryMapView.setCornerRadius(24.0)
        self.meetLink.setCornerRadius(24.0)
    }
    
    func config(data:EventDetailResponse){
        lblTermsOfUse.text = "Important information"
        eventView.isHidden = false
        speakerView.isHidden = false
        rulesView.isHidden = false
        iterView.isHidden = false
        courseView.isHidden = false

        if data.locationType != 1{
            eventView.isHidden = true
        }
        if data.speakers.count == 0{
            speakerView.isHidden = true
        }
        if data.facilities.count == 0{
            rulesView.isHidden = true
        }
        if data.itineraries.count == 0{
            iterView.isHidden = true
        }
        if data.curriculum.count == 0{
            courseView.isHidden = true
        }
        eventData = data
        meetLink.isHidden = !isFromMyBooking ? true : data.meet_link.isEmpty
        lblMeetLink.text = data.meet_link
        lblMeetLink.addTap { r in
            self.openBrowser(urlString: data.meet_link)
        }
            facilitiesData = data.facilities
            termsConditions = data.termsConditions
            breakdownView.isHidden = termsConditions.count == 0
            breakdownTableView.reloadData()
            iterTableView.reloadData()
            courseTableView.reloadData()
            lblAddress.text = data.location
            eventSpeakers = data.speakers
            mapView.removeAnnotations(mapView.annotations)
            enquiryMapView.removeAnnotations(enquiryMapView.annotations)
            // Latitude and longitude
            enquiryLocationView.isHidden = true
            enquiryMapView.isHidden = true
//            if !data.to_location.isEmpty{
            if !data.to_location.isEmpty || data.to_latitude.toDouble() != 0.0 || data.to_longitude.toDouble() != 0.0 {
                enquiryLocationView.isHidden = false
                enquiryMapView.isHidden = false
                lblLocationHeader.text = "Destination location"
                lblAddress.text = data.to_location
                lblEnquireLocation.text = data.location
                                
                let latitude: CLLocationDegrees = "\(data.to_latitude ?? "")".toDouble()
                let longitude: CLLocationDegrees = "\(data.to_longitude ?? "")".toDouble()
                
                let annotation = MKPointAnnotation()
                annotation.coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
                mapView.addAnnotation(annotation)
                
                let coordinate = annotation.coordinate
                if CLLocationCoordinate2DIsValid(coordinate) {
                    let region = MKCoordinateRegion(
                        center: coordinate,
                        latitudinalMeters: 1000,
                        longitudinalMeters: 1000
                    )
                    mapView.setRegion(region, animated: true)
                }

                // Optional String to Double conversion safely
                if let latString = data.latitude,
                   let lonString = data.longitude,
                   let latitude = Double(latString),
                   let longitude = Double(lonString) {
                    let coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
                    // Check if coordinate is valid
                    if CLLocationCoordinate2DIsValid(coordinate) {
                        let annotationEnquiry = MKPointAnnotation()
                        annotationEnquiry.coordinate = coordinate
                        enquiryMapView.addAnnotation(annotationEnquiry)
                        let regionEnquiry = MKCoordinateRegion(
                            center: coordinate,
                            latitudinalMeters: 1000,
                            longitudinalMeters: 1000
                        )
                        enquiryMapView.setRegion(regionEnquiry, animated: true)
                    }
                }
            }else{
                if let latString = data.latitude,
                   let lonString = data.longitude,
                   let latitude = Double(latString),
                   let longitude = Double(lonString) {
                    let coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
                    if CLLocationCoordinate2DIsValid(coordinate) {
                        let annotation = MKPointAnnotation()
                        annotation.coordinate = coordinate
                        mapView.addAnnotation(annotation)
                        
                        let region = MKCoordinateRegion(
                            center: coordinate,
                            latitudinalMeters: 1000,
                            longitudinalMeters: 1000
                        )
                        mapView.setRegion(region, animated: true)
                    }
                }
            }
       if data.categoryId == 3 || data.categoryId == 4 || data.categoryId == 9{ //course
           iterView.isHidden = data.itineraries.count == 0 ? true : false
           rulesView.isHidden = data.facilities.count == 0 ? true : false
       }else if data.categoryId == 2{
           courseView.isHidden = data.curriculum.count == 0 ? true : false
       }
        breakdownTableView.reloadData()
        facilitiesTableView.reloadData()
        courseTableView.reloadData()
        iterTableView.reloadData()
        speakerCollectionView.reloadData()
        updateHeight()
    }
    func updateHeight(){
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [self] in
            breakdownTableView.layoutIfNeeded()
            facilitiesTableView.layoutIfNeeded()
            courseTableView.layoutIfNeeded()
            iterTableView.layoutIfNeeded()
            speakerCollectionView.layoutIfNeeded()

            breakdownTableHeight.constant = breakdownTableView.contentSize.height
            faceilityHeight.constant = facilitiesTableView.contentSize.height
            courseTableHeight.constant = courseTableView.contentSize.height
            iterTableHeight.constant = iterTableView.contentSize.height
            speakerHeight.constant = speakerCollectionView.contentSize.height
            
            if self.eventData.facilities.count == 0{
                self.breakdownView.setCornerRadius([.topLeft,.topRight], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
            }else{
                self.breakdownView.setCornerRadius(32.0)
            }
            self.view.layoutIfNeeded()
            
            let newHeight = self.view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height
            delegate?.updateOtherContentViewHeight(to: newHeight)
        }
    }
}
extension EventOtherVC:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if tableView == courseTableView{
            return eventData.curriculum.count
        }else if tableView == iterTableView{
            return eventData.itineraries.count
        }
        return tableView == facilitiesTableView ? facilitiesData.count : termsConditions.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if tableView == courseTableView{
            let cell = tableView.configureCell(EventCourseCell.self, at: indexPath)
            let data = eventData.curriculum[indexPath.row]
            cell.lblHeaderTitle.text = "Class".localized + " \(indexPath.row + 1)"
            cell.lblTitle.text = ""
            DispatchQueue.global(qos: .userInitiated).async {
                let convertedText = data.descriptionField.htmlToAttributedString(customFont: Fonts.SFProMedium(14.0), color: UIColor(hex: "#000000"))
                DispatchQueue.main.async {
                    if let visibleCell = tableView.cellForRow(at: indexPath) as? EventCourseCell {
                        visibleCell.lblTitle.attributedText = convertedText
                        tableView.beginUpdates()
                        tableView.endUpdates()
                        self.updateHeight()
                    }
                }
            }
            let startDate = "Start Date:".localized + " \(data.startDate.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "dd-MM-yyyy", timeZone: data.time_zone))"
            let endDate = "End Date:".localized + " \(data.endDate.convertFromDateFormat(fromFormat: "yyyy-MM-dd", toFormat: "dd-MM-yyyy", timeZone: data.time_zone))"
            let date = startDate + "   " + endDate
            
            /*
             let startTime = startDate + " " + "Start Time:".localized + " \(data.startTime.convertTimeOnly(startDate: data.startDate, startTimeString: data.startTime, timeZone: eventData.time_zone,isDayNameRequired:true))"
             let endTime = endDate + " " +  "End Time:".localized + " \(data.endTime.convertTimeOnly(startDate: data.endDate, startTimeString: data.endTime, timeZone: eventData.time_zone,isDayNameRequired:true))"
             */
            let startTime = "Start Time:".localized + " \(data.startTime.convertTimeOnly(startDate: data.startDate, startTimeString: data.startTime, timeZone: eventData.time_zone))"
            let endTime = "End Time:".localized + " \(data.endTime.convertTimeOnly(startDate: data.endDate, startTimeString: data.endTime, timeZone: eventData.time_zone))"
            let time = startTime + "   " + endTime
            cell.lblTitle2.text = date + "\n\n" + time
            cell.imgView.image = UIImage.init(named: "ic_education") ?? UIImage()
            return cell
        }else if tableView == iterTableView{
            let cell = tableView.configureCell(EventCourseCell.self, at: indexPath)
            let data = eventData.itineraries[indexPath.row]
            cell.lblHeaderTitle.text = "Destination".localized + " \(indexPath.row + 1)"
            cell.lblTitle.text = data.title
            
            let sDate = "\(data.startDate ?? "") \(data.startTime ?? "")"
            let eDate = "\(data.endDate ?? "") \(data.endTime ?? "")"
            let startDate = "Start Date:".localized + " \(sDate.convertFromDateFormat(fromFormat: "yyyy-MM-dd HH:mm:ss", toFormat: "dd-MM-yyyy", timeZone: eventData.time_zone)) "
            let endDate = "End Date:".localized + " \(eDate.convertFromDateFormat(fromFormat: "yyyy-MM-dd HH:mm:ss", toFormat: "dd-MM-yyyy", timeZone: eventData.time_zone)) "
            
            let startTime = startDate + " " + "Start Time:".localized + " \(data.startTime.convertTimeOnly(startDate: data.startDate, startTimeString: data.startTime, timeZone: eventData.time_zone,isDayNameRequired:true))"
            let endTime = endDate + " " +  "End Time:".localized + " \(data.endTime.convertTimeOnly(startDate: data.endDate, startTimeString: data.endTime, timeZone: eventData.time_zone,isDayNameRequired:true))"
            let time = startTime + "\n\n" + endTime
            cell.lblTitle2.text = time

            cell.imgView.image = UIImage.init(named: eventData.categoryId == 3 || eventData.categoryId == 4 || eventData.categoryId == 9 ? "ic_Itenary" : "ic_education") ?? UIImage()
            DispatchQueue.global(qos: .userInitiated).async {
                DispatchQueue.main.async {
                    if tableView.cellForRow(at: indexPath) is EventCourseCell {
                        tableView.beginUpdates()
                        tableView.endUpdates()
                        self.updateHeight()
                    }
                }
            }
            return cell
        }
        let cell = tableView.configureCell(EventBreakdownCell.self, at: indexPath)
        if tableView == facilitiesTableView{
            cell.lblTitle.text = "\(indexPath.row + 1). " + facilitiesData[indexPath.row].facilitiesTitle
            cell.lblHeaderTitle.isHidden = true
            cell.lblSubtitle.isHidden = true
            cell.lblReadMore.isHidden = true
            return cell
        }
        let data = termsConditions[indexPath.row]
        let title = data["sub_title"] as? String ?? ""
        cell.lblHeaderTitle.text = ""
        cell.lblTitle.text = "\(data["title"] as? String ?? "")".uppercased()
        cell.lblTitle.font = Fonts.SFProBold(8.0)
        cell.lblTitle.textColor = UIColor.init(hex: "#545454")
        cell.lblSubtitle.text = ""
        DispatchQueue.global(qos: .userInitiated).async {
            let convertedText = title.htmlToAttributedString(customFont: Fonts.SFProRegular(12.0), color: UIColor.black)
            DispatchQueue.main.async {
                if let visibleCell = tableView.cellForRow(at: indexPath) as? EventBreakdownCell {
                    visibleCell.lblSubtitle.attributedText = convertedText
                    tableView.beginUpdates()
                    tableView.endUpdates()
                    self.updateHeight()
                }
            }
        }
        cell.lblSubtitle.numberOfLines = 0//lines
        cell.lblReadMore.tag = indexPath.row
        cell.lblReadMore.addTap { r in
            var data = self.termsConditions[r.view?.tag ?? 0]
            var lines = data["lines"] as? Int ?? 0
            lines = lines == 2 ? 0 : 2
            data["lines"] = lines
            self.termsConditions[r.view?.tag ?? 0] = data
            self.moreTapped?()
        }
        return cell
    }
}
extension EventOtherVC: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return eventSpeakers.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(EventSpeakerCell.self, at: indexPath)
        cell.imgView.loadAsyncImageWithPlaceholder(loadURL: eventSpeakers[indexPath.item].profileImage, placeHolder: "ic_profile_crop")
        cell.lblTitle.text = eventSpeakers[indexPath.item].firstName + " " + eventSpeakers[indexPath.item].lastName
        DispatchQueue.global(qos: .userInitiated).async {
            DispatchQueue.main.async {
                if let visibleCell = collectionView.cellForItem(at: indexPath) as? EventSpeakerCell {
                    self.updateHeight()
                }
            }
        }
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        self.speakerTapped?(indexPath.item)
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: collectionView.bounds.width / 2 - 4, height: 44)
    }
}
