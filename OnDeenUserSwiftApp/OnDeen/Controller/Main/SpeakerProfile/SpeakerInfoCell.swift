//
//  SpeakerInfoCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class SpeakerInfoCell: UITableViewCell {
    @IBOutlet weak var aboutBottom: NSLayoutConstraint!
    @IBOutlet weak var aboutStack: UIStackView!
    @IBOutlet weak var lblReadMore: SFProLabel!
    @IBOutlet weak var lblAboutSubtitle: SFProLabel!
    @IBOutlet weak var lblAboutTitle: SFProLabel!
    @IBOutlet weak var imgProfile: UIImageView!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblSubtitle: SFProLabel!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var requestSessison: SFProLabel!
    @IBOutlet weak var sessionView: UIView!
    var experts = [SpeakerProfileExpertise]()
    
    override func awakeFromNib() {
        super.awakeFromNib()
        collectionView.registerNIBs(FeatureTagCell.self)
        collectionView.registerAutoLayout()
        collectionView.isPagingEnabled = true
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        imgProfile.config(isRoundCorner: true)
        requestSessison.setCornerRadius(requestSessison.bounds.height / 2)
    }
    func configExperts(data: [SpeakerProfileExpertise]) {
        self.experts = data
        collectionView.refreshCollection()
        delay(0.5, function: {
            self.collectionView.refreshCollection()
        })
    }
    private func centerAlignCollectionView() {
        let totalCellWidth = CGFloat(experts.count) * 100 // Adjust 100 to actual item width
        let totalSpacingWidth = CGFloat(experts.count - 1) * 10 // Adjust 10 to actual spacing

        let totalContentWidth = totalCellWidth + totalSpacingWidth
        let collectionViewWidth = collectionView.bounds.width

        let leftInset = max((collectionViewWidth - totalContentWidth) / 2, 0)
        collectionView.contentInset = UIEdgeInsets(top: 0, left: leftInset, bottom: 0, right: leftInset)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension SpeakerInfoCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let font = Fonts.SFProRegular(12.0)
        let width = experts[indexPath.item].title.size(withAttributes: [.font: font]).width + 30
              
        let height: CGFloat = 25 // Adjust based on your design
             
        return CGSize(width: width, height: height)
    }

    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        guard experts.count > 0 else { return .zero }
        
        let totalCellWidths = experts.reduce(0) { total, expert in
            total + expert.title.size(withAttributes: [.font: UIFont.systemFont(ofSize: 16)]).width + 30
        }
        
        let totalSpacing = CGFloat(experts.count - 1) * 10 // Assuming 10px spacing
        let totalContentWidth = totalCellWidths + totalSpacing
        let collectionViewWidth = collectionView.bounds.width
        
        let sideInset = max((collectionViewWidth - totalContentWidth) / 2, 0)
        return UIEdgeInsets(top: 0, left: sideInset, bottom: 0, right: sideInset)
        
    }

    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return experts.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(FeatureTagCell.self, at: indexPath)
        cell.lblTitle.text = experts[indexPath.item].title
        cell.imgView.isHidden = true//indexPath.item != 0
        if indexPath.item % 2 == 0{
            cell.bgView.backgroundColor = UIColor.init(hex: "#DB3171")
        }else{
            cell.bgView.backgroundColor = UIColor.init(hex: "#FFEFBD")
        }
        cell.lblTitle.textColor = .black
        return cell
    }
}
