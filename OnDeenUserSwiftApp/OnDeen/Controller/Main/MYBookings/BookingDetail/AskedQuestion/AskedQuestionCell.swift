//
//  AskedQuestionCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class AskedQuestionCell: UITableViewCell {
    @IBOutlet weak var lblQuestion: SFProLabel!
    @IBOutlet weak var lblDate: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblSeperator: UILabel!
    @IBOutlet weak var imgLeading: NSLayoutConstraint!
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var imgView: UIImageView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        tableView.registerNIBs(AskedQuestionCell.self)
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        tableHeight.constant = tableView.contentSize.height
        imgView.config(isRoundCorner: true)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    func loadComments(index:Int){
//        tableView.tag = index
//        tableView.refreshTable()
//        tableHeight.constant = tableView.contentSize.height
    }
}
extension AskedQuestionCell:UITableViewDataSource,UITableViewDelegate{
    func numberOfSections(in tableView: UITableView) -> Int {
        return tableView.tag == 1 ? 1 : 0
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 1
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(AskedQuestionCell.self, at: indexPath)
        cell.lblSeperator.isHidden = true
        return cell
    }
}

