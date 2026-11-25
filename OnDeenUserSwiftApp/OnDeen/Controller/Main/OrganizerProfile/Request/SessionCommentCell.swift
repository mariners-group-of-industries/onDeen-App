//
//  SessionCommentCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 11/02/25.
//

import UIKit
class SessionCommentCell: UITableViewCell {
    @IBOutlet weak var textVew: UITextView!
    override func awakeFromNib() {
        super.awakeFromNib()
        textVew.delegate = self
        textVew.setPlaceholder()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        if let sView = textVew.superview{
            sView.setCornerRadius(20.0)
        }
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        // Configure the view for the selected state
    }
    
}
extension SessionCommentCell:UITextViewDelegate{
    func textViewDidChange(_ textView: UITextView) {
        textView.checkPlaceholder()
    }
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool
        {
            if(text == "\n")
            {
                textView.resignFirstResponder()
                return false
            }
            else
            {
                return true
            }
        }
}
extension UITextView{
    func setPlaceholder() {
        let placeholderLabel = UILabel()
        placeholderLabel.text = "Write something for the speaker".localized
        placeholderLabel.font = UIFont.italicSystemFont(ofSize: (self.font?.pointSize)!)
        placeholderLabel.sizeToFit()
        placeholderLabel.tag = 222
        placeholderLabel.frame.origin = CGPoint(x: 5, y: (self.font?.pointSize)! / 2)
        placeholderLabel.textColor = UIColor.init(hex: "#969696")
        placeholderLabel.isHidden = !self.text.isEmpty
        self.addSubview(placeholderLabel)
    }
    func checkPlaceholder() {
        let placeholderLabel = self.viewWithTag(222) as! UILabel
        placeholderLabel.isHidden = !self.text.isEmpty
    }
}
