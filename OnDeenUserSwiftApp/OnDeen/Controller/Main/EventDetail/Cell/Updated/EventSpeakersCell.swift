//
//  EventSpeakersCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 10/03/25.
//

import UIKit

class EventSpeakersCell: UITableViewCell {
    @IBOutlet weak var speakerView: UIView!
    @IBOutlet weak var speakerHeight: NSLayoutConstraint!
    @IBOutlet weak var speakerCollectionView: UICollectionView!
    var eventSpeakers = [EventDetailSpeaker]()
    var speakerTapped : ((Int) -> Void)?
    override func awakeFromNib() {
        super.awakeFromNib()
        speakerCollectionView.registerNIBs(EventSpeakerCell.self)
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        self.speakerView.setCornerRadius(32.0)
    }
    func config(data: EventDetailResponse) {
        eventSpeakers = data.speakers
        speakerView.isHidden = false
        if data.speakers.count == 0{
            speakerView.isHidden = true
        }
        speakerCollectionView.dataSource = self
        speakerCollectionView.delegate = self
        speakerCollectionView.reloadData()
        updateHeight()
    }
    func updateHeight(){
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [self] in
            speakerCollectionView.layoutIfNeeded()
            speakerHeight.constant = speakerCollectionView.contentSize.height
        }
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension EventSpeakersCell: UICollectionViewDelegate, UICollectionViewDataSource,UICollectionViewDelegateFlowLayout {
    
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
                if collectionView.cellForItem(at: indexPath) is EventSpeakerCell {
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
        return CGSize(width: collectionView.bounds.width / 2 - 4, height: 50)
    }

}
