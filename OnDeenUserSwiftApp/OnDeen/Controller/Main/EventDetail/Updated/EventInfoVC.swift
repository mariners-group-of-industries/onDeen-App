//
//  EventInfoVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 24/03/25.
//

import UIKit
protocol EventInfoVCDelegate: AnyObject {
    func updateContentViewHeight(to height: CGFloat)
}

class EventInfoVC: UIViewController {
    @IBOutlet weak var lblEventLink: SFProLabel!
    @IBOutlet weak var partiesWidth: NSLayoutConstraint!
    @IBOutlet weak var partiesView: UIView!
    @IBOutlet weak var classStack: UIStackView!
    @IBOutlet weak var lblClassDetail: SFProLabel!
    @IBOutlet weak var participantInnerView: UIView!
    weak var delegate: EventInfoVCDelegate?
    @IBOutlet weak var participantViewAll: GradientBorderView!
    @IBOutlet weak var participiantView: UIView!
    @IBOutlet weak var imgClassInfo: UIImageView!
    @IBOutlet weak var imgPercentage: UIImageView!
    @IBOutlet weak var lblSession: SFProLabel!
    @IBOutlet weak var lblJourney: UILabel!
    @IBOutlet weak var lblTicketCount: SFProLabel!
    @IBOutlet weak var innerPercentView: UIView!
    @IBOutlet weak var lblConfirmed: SFProLabel!
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
    @IBOutlet weak var carosoulView: iCarousel!
    private let avatarViewTag = 999
    var isFromMyBooking = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        carosoulView.type = .rotary
        carosoulView.isPagingEnabled = true
        carosoulView.isVertical = false
        carosoulView.delegate = self

        imgClassInfo.addTap { r in
            if let topVC = topViewController(){
                if let vc: JourneyInfoVC = topVC.getController(from: .authentication) {
                    vc.screenType = .event
                    vc.screenMessage = self.eventDetail.occursTextPop
                    topVC.presentVC(vc: vc)
                }
            }
        }

        addBorder()
        tagCollectionView.registerNIBs(FeatureTagCell.self)
        tagCollectionView.registerAutoLayout()
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
        
        self.view.setNeedsLayout()
        self.view.layoutIfNeeded()
        let newHeight = self.view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height
        delegate?.updateContentViewHeight(to: newHeight)
    }

    func addBorder(){
        viewInfo.configureGradientBorder(colors: [
            UIColor(hex: "#F4F4F4"),
            UIColor(hex: "#FFCC33"),
            UIColor(hex: "#DB3171"),
            UIColor(hex: "#422199")
        ], lineWidth: 1.5, cornerRadius: viewInfo.bounds.height / 2)
        participantViewAll.configureGradientBorder(colors: [
            UIColor(hex: "#F4F4F4"),
            UIColor(hex: "#FFCC33"),
            UIColor(hex: "#DB3171"),
            UIColor(hex: "#422199")
        ], lineWidth: 1.5, cornerRadius: viewInfo.bounds.height / 2)
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        lblAbout.preferredMaxLayoutWidth = lblAbout.frame.width
        lblTitle.preferredMaxLayoutWidth = lblTitle.frame.width

        addDottedBorder(to: lblPrice)
        innerPercentView.config(isRoundCorner: true)
        price1BgView.config(isRoundCorner: true)
        price2BgView.config(isRoundCorner: true)
        addBorder()
        dateView.setCornerRadius(8.0)
        imgTopSection.config(borderColor: .black, borderWidth: 1.0, isRoundCorner: true)
        requestBuddyView.config(borderColor: UIColor.init(hex: "#422199"), borderWidth: 1.0, isRoundCorner: true)
        viewTicketView.config(borderColor: UIColor.init(hex: "#422199"), borderWidth: 1.0, isRoundCorner: true)
        imgOrganizer.config(isRoundCorner: true)
    }
    override func viewDidAppear(_ animated: Bool) {
        if !isFromMyBooking{
//            self.bgView.setCornerRadius([.topLeft,.topRight], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
            bgInnerView.setCornerRadius(32.0)
        }else{
            bgView.backgroundColor = UIColor.white
            bgInnerView.backgroundColor = UIColor.white
            self.bgView.setCornerRadius([.bottomLeft,.bottomRight], radius: 32.0, borderColor: .clear, borderWidth: 0.0)
//            bgInnerView.setCornerRadius(32.0)
        }
        self.tagCollectionView.refreshCollection()
        delay(1.0, function: {
            self.tagCollectionView.refreshCollection()
        })
    }
    func config(data:EventDetailResponse){
        lblEventLink.text = data.locationType == 1 ? "View Ticket" : "Event Link"
        lblJourney.text = data.journeyName
        lblTicketCount.text = "You’ve \(data.participants.count) tickets"
        lblTicketCount.isHidden = data.participants.count <= 1
        if data.requestBuddy == "1"{
            lblRequstedbuddy.text = "Requested".localized
        }
        percentView.isHidden = data.status == 2 || data.occusr_type == 1
        lblPercentage.text = "\(data.percentage_completion) Complete"
        lblPercentage.isHidden = data.percentage_completion.isEmpty
        innerPercentView.isHidden = data.categoryId != 2
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
        let startDate = data.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: data.time_zone)
        let endDate = data.endDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: data.time_zone)
        if startDate == endDate{
            lblDate.text = startDate
        }else{
            lblDate.text = data.startDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: data.time_zone) + " - " + data.endDate.convertFromDateFormat(fromFormat: "E, dd MMM yyyy HH:mm:ss z", toFormat: "dd MMM yyyy", timeZone: data.time_zone)
        }
//        lblTime.text = data.startTime.convertDateTime(startDateString: data.startDate, startTimeString: data.startTime,timeZone:data.time_zone) + " - " + data.endTime.convertDateTime(startDateString2: data.endDate, startTimeString2: data.endTime, timeZone: data.time_zone)
        lblTime.text = data.startTime.convertTimeOnly(startDate: data.startDate, startTimeString: data.startTime,timeZone:data.time_zone,isDayNameRequired:true) + " - " + data.endTime.convertTimeOnly(startDate: data.startDate, startTimeString: data.endTime, timeZone: data.time_zone,isDayNameRequired:false)
        classStack.isHidden = data.totalNoClass.toDouble() == 0.0
        let totalClass = Int(data.totalNoClass ?? "") ?? 0
        lblClassDetail.text = "\(data.totalNoClass ?? "") \(totalClass == 1 ? "\(data.categoryId == 2 ? "Class" : "Day")" : "\(data.categoryId == 2 ? "Classes" : "Days")")"
        lblClassTitle.text = data.occusr_text
        lblClassTitle.isHidden = data.occusr_text.isEmpty
        imgClassInfo.isHidden = lblClassTitle.isHidden
        lblClassSubtitle.isHidden = true
        
        lblOrganizedBy.text = ""
        lblOrganizeCount.text = ""
        self.organizerView.isHidden = false
        if data.organizer != nil{
            if data.organizer.name.isEmpty{
                self.organizerView.isHidden = true
            }
            lblOrganizedBy.text = data.organizer.name
            let eventCount = data.organizer.eventCount ?? 0
            let eventText = eventCount == 1 ? "event".localized : "\("events".localized)"
            lblOrganizeCount.text = "\(eventCount) \(eventText)"
            imgOrganizer.loadAsyncImageWithPlaceholder(loadURL: data.organizer.logo, placeHolder: "ic_profile_crop")
        }else{
            self.organizerView.isHidden = true
        }
        imgTopSection.loadAsyncImage(loadURL: data.categoryImage)
        lblAbout.text = data.descriptionField.htmlToPlainText()

//        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: {
//            self.view.setNeedsLayout()
//            self.view.layoutIfNeeded()
//            let newHeight = self.view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height
//            self.delegate?.updateContentViewHeight(to: newHeight)
//        })
        if data.originalPrice.toDouble() > 0.0{
            priceView.backgroundColor = UIColor.init(hex: "#F9E5AA")
        }else{
            priceView.backgroundColor = UIColor.init(hex: "#C8F9AA")
        }
        if eventDetail.participantImages.count > 0{
            let participantImages = eventDetail.participantImages.map { $0.image ?? ""}
            let avatarView = createOverlappingProfileImages(imageUrls: participantImages, extraCount: eventDetail.total_participants_count)
            avatarView.tag = avatarViewTag
            avatarView.translatesAutoresizingMaskIntoConstraints = false
            self.partiesView.addSubview(avatarView)

            // Layout constraints (important!)
            NSLayoutConstraint.activate([
                avatarView.topAnchor.constraint(equalTo: self.partiesView.topAnchor),
                avatarView.leadingAnchor.constraint(equalTo: self.partiesView.leadingAnchor)
            ])

            // Force layout of the superview
            self.partiesView.layoutIfNeeded()

            // Now you can safely access the frame
            let visibleCount = min(participantImages.count, 3)
            let hasExtra = eventDetail.total_participants_count > 3
            let totalItems = visibleCount + (hasExtra ? 1 : 0)

            let itemWidth: CGFloat = 28
            let overlapSpacing: CGFloat = -5

            let totalWidth = CGFloat(totalItems) * itemWidth + CGFloat(totalItems - 1) * overlapSpacing
            self.partiesWidth.constant = totalWidth
            self.partiesView.layoutIfNeeded()
            
            // Add constraints as needed
            NSLayoutConstraint.activate([
                avatarView.topAnchor.constraint(equalTo: avatarView.safeAreaLayoutGuide.topAnchor, constant: 0),
                avatarView.leadingAnchor.constraint(equalTo: avatarView.leadingAnchor, constant: 0),
            ])
        }
        
        self.tagCollectionView.refreshCollection()

        self.view.setNeedsLayout()
        self.view.layoutIfNeeded()
        let newHeight = self.view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height
        delegate?.updateContentViewHeight(to: newHeight)
        
//        delay(1.0, function: {
//            self.view.setNeedsLayout()
//            self.view.layoutIfNeeded()
//            let newHeight = self.view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height
//            self.delegate?.updateContentViewHeight(to: newHeight)
//        })
        
    }
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
    func createOverlappingProfileImages(imageUrls: [String], extraCount: Int) -> UIView {
        let maxVisible = 3  // Show only 4, rest in "+ count"
        var remainingCount = extraCount
        remainingCount = extraCount - maxVisible
        let containerView = UIView()
        var previousImageView: UIImageView?
        let spacing: CGFloat = -5  // Negative spacing for overlap
        for i in 0..<min(imageUrls.count, maxVisible) {
            let imageView = UIImageView()
            imageView.translatesAutoresizingMaskIntoConstraints = false
            imageView.layer.cornerRadius = 14
            imageView.clipsToBounds = true
            imageView.contentMode = .scaleAspectFill
            imageView.backgroundColor = .lightGray // placeholder
            imageView.widthAnchor.constraint(equalToConstant: 28).isActive = true
            imageView.heightAnchor.constraint(equalToConstant: 28).isActive = true
            imageView.layer.borderColor = UIColor.white.cgColor
            imageView.layer.borderWidth = 2
            imageView.loadAsyncImageWithPlaceholder(loadURL: imageUrls[i], placeHolder: "ic_profile_crop")
            containerView.addSubview(imageView)
            if let prev = previousImageView {
                imageView.leadingAnchor.constraint(equalTo: prev.trailingAnchor, constant: spacing).isActive = true
            } else {
                imageView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor).isActive = true
            }
            imageView.topAnchor.constraint(equalTo: containerView.topAnchor).isActive = true
            previousImageView = imageView
        }
        if remainingCount != 0 && remainingCount > 0{
            // Add the "+ count" badge
            let countLabel = UILabel()
            countLabel.translatesAutoresizingMaskIntoConstraints = false
            countLabel.text = "+\(remainingCount)"
            countLabel.font = Fonts.SFProMedium(10.0)
            countLabel.textColor = .white
            countLabel.textAlignment = .center
            countLabel.backgroundColor = UIColor(hex: "#3E146F")
            countLabel.layer.cornerRadius = 14
            countLabel.clipsToBounds = true
            countLabel.widthAnchor.constraint(equalToConstant: 28).isActive = true
            countLabel.heightAnchor.constraint(equalToConstant: 28).isActive = true
            containerView.addSubview(countLabel)
            if let prev = previousImageView {
                countLabel.leadingAnchor.constraint(equalTo: prev.trailingAnchor, constant: spacing).isActive = true
            } else {
                countLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor).isActive = true
            }
            countLabel.topAnchor.constraint(equalTo: containerView.topAnchor).isActive = true
            countLabel.bottomAnchor.constraint(equalTo: containerView.bottomAnchor).isActive = true
        }
        return containerView
    }
}
extension EventInfoVC: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
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
extension EventInfoVC:iCarouselDelegate,iCarouselDataSource{
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
extension String {
    func htmlToPlainText() -> String {
        guard let data = self.data(using: .utf8) else { return self }
        
        do {
            let attributedString = try NSAttributedString(
                data: data,
                options: [
                    .documentType: NSAttributedString.DocumentType.html,
                    .characterEncoding: String.Encoding.utf8.rawValue
                ],
                documentAttributes: nil
            )
            return attributedString.string.trimmingCharacters(in: .whitespacesAndNewlines)
        } catch {
            return self
        }
    }
}
