//
//  BookingBannerCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class BookingBannerCell: UITableViewCell {
    @IBOutlet weak var carouselView: iCarousel!
    var bookingItemsView = [BookingUpcoming]()
    var eventDataa = [HomePageEvent]()
    var eventTapped : ((Int) -> Void)?

    override func awakeFromNib() {
        super.awakeFromNib()
        carouselView.type = .linear
        carouselView.isPagingEnabled = true
        carouselView.isVertical = false
        
    }
    func configEvent(data:[HomePageEvent]){
        self.bookingItemsView = []
        for index in 0..<data.count{
            if let cellView = Bundle.main.loadNibNamed("BookingUpcoming", owner: self, options: nil)! [0] as? BookingUpcoming{
                cellView.tag = index
                cellView.imgEventDetail.isHidden = true
                cellView.partiesView.isHidden = true
                cellView.frame = CGRect(x: 24.0, y: 0.0, width: UIScreen.main.bounds.width - 24.0, height: UIScreen.main.bounds.height / 100 * 30)
                cellView.statusView.isHidden = false
                cellView.lblDate.text = data[index].status == 2 ? "Cancelled".localized : "Confirmed"
                cellView.statusView.backgroundColor = data[index].status == 2 ? UIColor.red : UIColor.init(hex: "#45C624")
                cellView.imgView.loadAsyncImage(loadURL: data[index].primaryImage)
                cellView.lblTitle.text = data[index].title
                cellView.lblSubtitle.text = "\(data[index].startDate.convertServerDateFormat(toFormat: "dd MMM yyyy", timeZone: data[index].time_zone))"
                
                cellView.participiantView.isHidden = data[index].total_participants_count == 0
                let participantImages = data[index].participantImages.map { $0.image ?? ""}
                let avatarView = createOverlappingProfileImages(imageUrls: participantImages, extraCount: data[index].total_participants_count)
                avatarView.translatesAutoresizingMaskIntoConstraints = false
                cellView.participiantView.addSubview(avatarView)

                // Add constraints as needed
                NSLayoutConstraint.activate([
                    avatarView.topAnchor.constraint(equalTo: avatarView.safeAreaLayoutGuide.topAnchor, constant: 0),
                    avatarView.leadingAnchor.constraint(equalTo: avatarView.leadingAnchor, constant: 0),
                ])

                let visibleCount = min(participantImages.count, 3)
                let hasExtra = data[index].total_participants_count > 3
                let totalItems = visibleCount + (hasExtra ? 1 : 0)

                let itemWidth: CGFloat = 28
                let overlapSpacing: CGFloat = -5

                let totalWidth = CGFloat(totalItems) * itemWidth + CGFloat(totalItems - 1) * overlapSpacing
                print("Total Width :",totalWidth)
                cellView.participiantWidth.constant = totalWidth
                cellView.participiantView.layoutIfNeeded()

                self.bookingItemsView.append(cellView)
            }
        }
        carouselView.bounces = false
        carouselView.reloadData()
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

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension BookingBannerCell:iCarouselDelegate,iCarouselDataSource{
    func numberOfItems(in carousel: iCarousel) -> Int {
        return bookingItemsView.count
    }
    func carousel(_ carousel: iCarousel, viewForItemAt index: Int, reusing view: UIView?) -> UIView {
        return bookingItemsView[index]
    }
    func carousel(_ carousel: iCarousel, didSelectItemAt index: Int) {
        self.eventTapped?(index)
    }
    func carouselDidEndScrollingAnimation(_ carousel: iCarousel) {
//        currentPageIndex = carousel.currentItemIndex
    }
    func carouselDidScroll(_ carousel: iCarousel) {
    }
}
