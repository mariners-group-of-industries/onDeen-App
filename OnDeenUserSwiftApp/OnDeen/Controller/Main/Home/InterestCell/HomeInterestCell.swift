//
//  HomeInterestCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 23/12/24.
//

import UIKit

class HomeInterestCell: UITableViewCell {
    @IBOutlet weak var tagHeight: NSLayoutConstraint!
    @IBOutlet weak var tagView: TTGTextTagCollectionView!
    var itemTapped : ((Int) -> Void)?

    override func awakeFromNib() {
        super.awakeFromNib()
        tagView.alignment = .center
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        self.tagHeight.constant = tagView.contentSize.height
    }
    func config(data:[HomePageOrganizer]){
        tagView.removeAllTags()
        tagView.delegate = self
        for text in data {
            let title = text.title.uppercased()
            let content = TTGTextTagStringContent.init(text: "  \(title)  ")
            content.textColor = UIColor.init(hex: "#3A3A3A")
            content.textFont = Fonts.AllRoundDemi(14.0)
            
            let normalStyle = TTGTextTagStyle.init()
            normalStyle.backgroundColor = UIColor.init(hex: "#EDEDED")
            normalStyle.extraSpace = CGSize.init(width: 8, height: 8)
            normalStyle.minHeight = 141.0
            normalStyle.maxHeight = 141.0
            normalStyle.cornerRadius = 20.0
            
            let selectedStyle = TTGTextTagStyle.init()
            selectedStyle.backgroundColor = UIColor.init(hex: "#EDEDED")
            selectedStyle.extraSpace = CGSize.init(width: 8, height: 8)
            selectedStyle.minHeight = 141.0
            normalStyle.maxHeight = 141.0
            normalStyle.cornerRadius = 20.0

            let tag = TTGTextTag.init()
            tag.content = content
            tag.style = normalStyle
            tag.selectedStyle = selectedStyle
            tagView.addTag(tag)
        }
        tagView.reload()
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
extension HomeInterestCell:TTGTextTagCollectionViewDelegate{
    func textTagCollectionView(_ textTagCollectionView: TTGTextTagCollectionView!, didTap tag: TTGTextTag!, at index: UInt) {
        itemTapped?(Int(index))
    }
}
