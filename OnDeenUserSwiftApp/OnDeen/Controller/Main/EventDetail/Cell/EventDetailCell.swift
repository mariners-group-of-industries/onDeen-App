//
//  EventDetailCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 18/12/24.
//

import UIKit

class EventDetailCell: UITableViewCell {
    @IBOutlet weak var imgPercentage: UIImageView!
    @IBOutlet weak var lblSession: SFProLabel!
    @IBOutlet weak var lblJourney: UILabel!
    @IBOutlet weak var lblTicketCount: SFProLabel!
    @IBOutlet weak var innerPercentView: UIView!
    @IBOutlet weak var lblConfirmed: SFProLabel!
    @IBOutlet weak var classStack: UIStackView!
    @IBOutlet weak var percentView: UIStackView!
    @IBOutlet weak var lblPercentage: SFProLabel!
    @IBOutlet weak var lblRequstedbuddy: SFProLabel!
    @IBOutlet weak var priceView: UIView!
    @IBOutlet weak var jpurneyLevelView: UIView!
    @IBOutlet weak var lblEvent: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblPrice: SFProLabel!
    @IBOutlet weak var lblDate: SFProLabel!
    @IBOutlet weak var lblTime: SFProLabel!
    @IBOutlet weak var lblClassTitle: SFProLabel!
    @IBOutlet weak var lblClassSubtitle: SFProLabel!
    @IBOutlet weak var lblOrganizedBy: SFProLabel!
    @IBOutlet weak var lblOrganizeCount: SFProLabel!
    @IBOutlet weak var lblAbout: UILabel!
    @IBOutlet weak var lblAboutMore: SFProLabel!
    @IBOutlet weak var imgOrganizer: UIImageView!
    
    @IBOutlet weak var organizerView: UIView!
    @IBOutlet weak var viewTicketView: UIView!
    @IBOutlet weak var requestBuddyView: UIView!
    @IBOutlet weak var bookTicketView: UIView!
    @IBOutlet weak var imgJourneyInfo: UIImageView!
    @IBOutlet weak var carosoulView: iCarousel!
    @IBOutlet weak var alphaView: UIView!
    @IBOutlet weak var bgInnerView: UIView!
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var price1BgView: UIView!
    @IBOutlet weak var price2BgView: UIView!
    @IBOutlet weak var viewInfo: GradientBorderView!
    @IBOutlet weak var dateView: UIView!
    @IBOutlet weak var tagCollectionView: UICollectionView!
    @IBOutlet weak var imgTopSection: UIImageView!
    var bookingItemsView = [BookingUpcoming]()
    var bookingTags = [EventDetailTag](){
        didSet{
            self.tagCollectionView.reloadData()
        }
    }
    var eventDetail = EventDetailResponse.init(fromDictionary: [String : Any]())
    var itemTapped : ((Int) -> Void)?
    @IBOutlet weak var carosoulHeight: NSLayoutConstraint!

    override func awakeFromNib() {
        super.awakeFromNib()
        imgJourneyInfo.addTap { r in
            if let topVC = topViewController(){
                if let vc: JourneyInfoVC = topVC.getController(from: .authentication) {
                    topVC.presentVC(vc: vc)
                }
            }
        }
        addBorder()
        tagCollectionView.registerNIBs(FeatureTagCell.self)
        tagCollectionView.registerAutoLayout()
        
        carosoulView.type = .rotary
        carosoulView.isPagingEnabled = true
        carosoulView.isVertical = false
        carosoulView.delegate = self
    }
    func configureCarosoul(){
        self.bookingItemsView = []
        for index in 0..<eventDetail.images.count{
            if let cellView = Bundle.main.loadNibNamed("BookingUpcoming", owner: self, options: nil)! [0] as? BookingUpcoming{
                
                cellView.imgEventDetail.tag = index
                cellView.imgEventDetail.isHidden = false
                cellView.imgEventDetail.loadAsyncImage(loadURL: eventDetail.images[index].fullScreenImage)
                cellView.frame = CGRect(x: 24.0, y: 0.0, width: UIScreen.main.bounds.width - 24.0, height: UIScreen.main.bounds.height / 100 * 25)
                cellView.setCornerRadius(24.0)
                cellView.imgEventDetail.addTap { r in
                    self.itemTapped?(r.view?.tag ?? 0)
                }
                self.bookingItemsView.append(cellView)
            }
        }
        carosoulView.bounces = false
        carosoulHeight.constant = UIScreen.main.bounds.height / 100 * 25
        carosoulView.reloadData()
    }
    func addBorder(){
        viewInfo.configureGradientBorder(colors: [
            UIColor(hex: "#F4F4F4"),
            UIColor(hex: "#FFCC33"),
            UIColor(hex: "#DB3171"),
            UIColor(hex: "#422199")
        ], lineWidth: 1.5, cornerRadius: viewInfo.bounds.height / 2)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        
        addDottedBorder(to: lblPrice)

        innerPercentView.config(isRoundCorner: true)
        price1BgView.config(isRoundCorner: true)
        price2BgView.config(isRoundCorner: true)
        addBorder()
        if self.tag == 1{
            self.bgInnerView.setCornerRadius([.bottomLeft,.bottomRight], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
        }else{
            self.bgInnerView.setCornerRadius(32.0)
        }
        dateView.setCornerRadius(8.0)
        imgTopSection.config(borderColor: .black, borderWidth: 1.0, isRoundCorner: true)
        requestBuddyView.config(borderColor: UIColor.init(hex: "#422199"), borderWidth: 1.0, isRoundCorner: true)
        viewTicketView.config(borderColor: UIColor.init(hex: "#422199"), borderWidth: 1.0, isRoundCorner: true)
        imgOrganizer.config(isRoundCorner: true)
    }
    func config(data:EventDetailResponse){
        lblJourney.text = data.journeyName
        lblTicketCount.text = "You’ve \(data.participants.count) tickets"
        lblTicketCount.isHidden = data.participants.count <= 1
        classStack.isHidden = data.categoryId != 2
        if data.requestBuddy == "1"{
            lblRequstedbuddy.text = "Requested".localized
        }
        lblPercentage.text = "\(data.percentage_completion)%"
//        percentView.isHidden = data.percentage_completion == 0
        innerPercentView.isHidden = data.categoryId != 2 || data.percentage_completion.isEmpty

        eventDetail = data
        var isExistCurriculam = false
        var curriculamIndex = 0
        if let index = data.curriculum.firstIndex(where: { $0.activeNow == 1 }) {
            isExistCurriculam = true
            curriculamIndex = index + 1
        }
        lblSession.isHidden = true
        if innerPercentView.isHidden == true && isExistCurriculam{
            innerPercentView.isHidden = false
            imgPercentage.isHidden = true
            lblPercentage.isHidden = true
            lblSession.text = "\(curriculamIndex)\(ordinalSuffix(for: curriculamIndex)) session"
        }else if isExistCurriculam{
            lblSession.isHidden = false
            lblSession.text = "\(curriculamIndex)\(ordinalSuffix(for: curriculamIndex)) session"
        }
        lblAbout.numberOfLines = 0
        lblAboutMore.text = data.moreLines == 0 ? "Less".localized : "Read more...".localized
        bookingTags = data.tags
        lblEvent.text = data.categoryTitle
        lblTitle.text = data.title
        lblPrice.text = "   \(data.price ?? "")   "
        lblDate.text = data.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: data.time_zone) + " - " + data.endDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: data.time_zone)
        lblTime.text = data.startTime.convertDateTime(startDateString: data.startDate, startTimeString: data.startTime, timeZone: data.time_zone) + " - " + data.endTime.convertDateTime(startDateString2: data.endDate, startTimeString2: data.endTime, timeZone: data.time_zone)
        lblClassTitle.text = data.occusr_text
        lblClassTitle.isHidden = data.occusr_text.isEmpty
        lblClassSubtitle.isHidden = true
        
        lblOrganizedBy.text = ""
        lblOrganizeCount.text = ""
        self.organizerView.isHidden = false
        if data.organizer != nil{
            if data.organizer.name.isEmpty{
                self.organizerView.isHidden = true
            }
            let categoryTitle = data.categoryTitle ?? ""
            lblOrganizedBy.text = data.organizer.name
            let eventCount = data.organizer.eventCount ?? 0
            let eventText = eventCount == 1 ? "event".localized : "\("events".localized)"
            lblOrganizeCount.text = "\(eventCount) \(eventText)"
            imgOrganizer.loadAsyncImageWithPlaceholder(loadURL: data.organizer.logo, placeHolder: "ic_profile_crop")
        }else{
            self.organizerView.isHidden = true
        }
        imgTopSection.loadAsyncImage(loadURL: data.categoryImage)
        lblAbout.html2String(string: data.descriptionField,customFont: Fonts.SFProRegular(12.0),color:UIColor.init(hex: "#545454"))

        if data.originalPrice.toDouble() > 0.0{
            priceView.backgroundColor = UIColor.init(hex: "#F9E5AA")
        }else{
            priceView.backgroundColor = UIColor.init(hex: "#C8F9AA")
        }
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        // Configure the view for the selected state
    }
    // Helper function to get ordinal suffix
    func ordinalSuffix(for number: Int) -> String {
        let suffixes = ["th", "st", "nd", "rd"]
        let mod100 = number % 100
        let mod10 = number % 10
        if mod100 >= 11 && mod100 <= 13 {
            return suffixes[0]
        }
        switch mod10 {
        case 1: return suffixes[1]
        case 2: return suffixes[2]
        case 3: return suffixes[3]
        default: return suffixes[0]
        }
    }
}
extension EventDetailCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return bookingTags.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(FeatureTagCell.self, at: indexPath)
        cell.lblTitle.text = bookingTags[indexPath.item].title
        cell.imgView.isHidden = true//indexPath.item != 0
        if indexPath.item % 2 == 0{
            cell.bgView.backgroundColor = UIColor.init(hex: "#F6EDFF")
        }else{
            cell.bgView.backgroundColor = UIColor.init(hex: "#FFF9E6")
        }
        if bookingTags[indexPath.item].id == 100000{
            cell.bgView.backgroundColor = UIColor.init(hex: "#DB3171")
        }
        cell.lblTitle.textColor = .black
        return cell
    }
}
extension EventDetailCell:iCarouselDelegate,iCarouselDataSource{
    func numberOfItems(in carousel: iCarousel) -> Int {
        return bookingItemsView.count
    }
    func carousel(_ carousel: iCarousel, viewForItemAt index: Int, reusing view: UIView?) -> UIView {
        return bookingItemsView[index]
    }
    func carousel(_ carousel: iCarousel, didSelectItemAt index: Int) {
        self.itemTapped?(index)
     }
    func carouselDidEndScrollingAnimation(_ carousel: iCarousel) {
//        currentPageIndex = carousel.currentItemIndex
    }
    func carouselDidScroll(_ carousel: iCarousel) {
    }
}
extension UITableViewCell{
    func addDottedBorder(to view: UIView) {
        view.layer.sublayers?.removeAll(where: { $0.name == "DottedBorder" })

        view.layer.cornerRadius = 4.0
        
        view.layer.masksToBounds = true
        let shapeLayer = CAShapeLayer()
        shapeLayer.name = "DottedBorder"
        shapeLayer.strokeColor = UIColor.init(hex: "#494844").cgColor // Border Color
        shapeLayer.lineWidth = 3.0
        shapeLayer.lineDashPattern = [4, 4] // Dotted Pattern (Dash, Space)
        shapeLayer.fillColor = nil
        
        let path = UIBezierPath(roundedRect: view.bounds, cornerRadius: view.layer.cornerRadius)
        shapeLayer.path = path.cgPath
        
        view.layer.addSublayer(shapeLayer)
    }
}
