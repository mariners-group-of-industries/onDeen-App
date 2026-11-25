//
//  MYProfileInfoCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit
import Lottie
class MYProfileInfoCell: UITableViewCell {
    @IBOutlet weak var aniimateView: LottieAnimationView!
    @IBOutlet weak var awardsView: UIView!
    @IBOutlet weak var lblBadgesAwardsHeader: AllRoundLabel!
    @IBOutlet weak var lblJourneyLevel: UILabel!
    @IBOutlet weak var lblEventsAdded: UILabel!
    @IBOutlet weak var lblCoursesAttended: UILabel!

    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var journeyView: UIView!
    @IBOutlet weak var eventsView: UIView!
    @IBOutlet weak var courseView: UIView!
    @IBOutlet weak var collectionView: UICollectionView!
    var awardData:[ProfileAwardlevel]!

    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(AwardsCell.self)
        if let path = Bundle.main.path(forResource: "coming_soon_clear", ofType: "json"),
           let animation = LottieAnimation.filepath(path) {
            aniimateView.animation = animation

            // 3. Set animation content mode

            aniimateView!.contentMode = .scaleAspectFit

            // 4. Set animation loop mode

            aniimateView!.loopMode = .loop

            // 5. Adjust animation speed

            aniimateView!.animationSpeed = 0.5


            // 6. Play animation

            aniimateView!.play()

        } else {
            print("Failed to load animation from bundle.")
        }


    }
    override func layoutSubviews() {
        super.layoutSubviews()
        journeyView.setCornerRadius(16.0)
        eventsView.setCornerRadius(16.0)
        courseView.setCornerRadius(16.0)
        bgView.setCornerRadius([.bottomLeft,.bottomRight], radius: 32.0)
    }
    func config(data:ProfileResponse){
        lblBadgesAwardsHeader.font = Fonts.AllRoundBold(14.0)
        self.awardData = data.awardlevel
        lblBadgesAwardsHeader.isHidden = self.awardData.count == 0
        lblJourneyLevel.text = data.journeyLevelTitle.isEmpty ? "-" : data.journeyLevelTitle
        lblEventsAdded.text = "\(data.eventCount ?? 0)"
        lblCoursesAttended.text = "\(data.courseCount ?? 0)"
        collectionView.reloadData()
        eventsView.isHidden = data.showEvents == 1 ? false : true
        courseView.isHidden = data.showCourses == 1 ? false : true
        journeyView.isHidden = data.showJourneyLevel == 1 ? false : true
        awardsView.isHidden = data.showAwards == 1 ? false : true
        bgView.isHidden = false
        if data.showEvents == 0 && data.showCourses == 0 && data.showJourneyLevel == 0{
            bgView.isHidden = true
        }
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension MYProfileInfoCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return self.awardData.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(AwardsCell.self, at: indexPath)
        let dict = self.awardData[indexPath.row]
        cell.config(data: dict)
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: collectionView.bounds.height, height: collectionView.bounds.height)
    }

}

