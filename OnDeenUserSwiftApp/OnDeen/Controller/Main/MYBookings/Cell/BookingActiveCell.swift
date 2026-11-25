//
//  BookingActiveCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class BookingActiveCell: UITableViewCell {
    @IBOutlet weak var participiantView: UIView!
    @IBOutlet weak var participiantWidth: NSLayoutConstraint!
    @IBOutlet weak var lblConfirmed: SFProLabel!
    @IBOutlet weak var imgWishlist: UIImageView!
    @IBOutlet weak var lblStatusTitle: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblDAte: SFProLabel!
    @IBOutlet weak var imgView: UIImageView!
    private let avatarViewTag = 999

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        imgView.setCornerRadius(12.0)
    }
    func config(data:HomePageEvent){
        participiantView.isHidden = data.total_participants_count == 0
        participiantView.viewWithTag(avatarViewTag)?.removeFromSuperview()

        let participantImages = data.participantImages.map { $0.image ?? ""}
        let avatarView = createOverlappingProfileImages(imageUrls: participantImages, extraCount: data.total_participants_count)
        avatarView.tag = avatarViewTag
        avatarView.translatesAutoresizingMaskIntoConstraints = false
        participiantView.addSubview(avatarView)

        // Layout constraints (important!)
        NSLayoutConstraint.activate([
            avatarView.topAnchor.constraint(equalTo: participiantView.topAnchor),
            avatarView.leadingAnchor.constraint(equalTo: participiantView.leadingAnchor)
        ])

        // Force layout of the superview
        participiantView.layoutIfNeeded()

        // Now you can safely access the frame
        let visibleCount = min(participantImages.count, 3)
        let hasExtra = data.total_participants_count > 3
        let totalItems = visibleCount + (hasExtra ? 1 : 0)

        let itemWidth: CGFloat = 28
        let overlapSpacing: CGFloat = -5

        let totalWidth = CGFloat(totalItems) * itemWidth + CGFloat(totalItems - 1) * overlapSpacing
        participiantWidth.constant = totalWidth
        participiantView.layoutIfNeeded()

        imgView.loadAsyncImage(loadURL: data.primaryImage)
        lblTitle.text = data.title
        lblDAte.text = "\(data.startDate.convertServerDateFormat(toFormat: "dd MMM yyyy", timeZone: data.time_zone))"
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
