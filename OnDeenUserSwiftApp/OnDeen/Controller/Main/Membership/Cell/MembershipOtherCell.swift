//
//  MembershipOtherCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 27/12/24.
//

import UIKit

class MembershipOtherCell: UITableViewCell {
    @IBOutlet weak var viewMoreView: UIView!
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var bgView: GradientBorderView!
    var otherData = [String]()
    var items = 0
    
    override func awakeFromNib() {
        super.awakeFromNib()
        addBorder()
        tableView.registerNIBs(MembershipOtherListCell.self)
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        viewMoreView.config(cornerRadius: 12.0, borderColor: UIColor.init(hex: "#DB3171"), borderWidth: 1.0)
        tableHeight.constant = tableView.contentSize.height
        addBorder()
    }
    func addBorder(){
        bgView.configureGradientBorder(colors: [
            UIColor(hex: "#F4F4F4"),
            UIColor(hex: "#FFCC33"),
            UIColor(hex: "#DB3171"),
            UIColor(hex: "#422199")
        ], lineWidth: 1.5, cornerRadius: 24.0)
    }
    func config(data:String,items:Int){
        otherData = data.extractParagraphs()
        self.items = items
        viewMoreView.isHidden = items == 0 ? true : otherData.count < 2
        tableView.refreshTable()
        delay(1.0) { [self] in
            tableHeight.constant = tableView.contentSize.height
        }
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        
        // Configure the view for the selected state
    }
}
extension MembershipOtherCell:UITableViewDataSource,UITableViewDelegate{
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return items == 0 ? otherData.count : 2
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(MembershipOtherListCell.self, at: indexPath)
        if otherData.count > indexPath.row{
            let data = otherData[indexPath.row]
            cell.lblTitle.html2String(string: data, customFont: Fonts.SFProMedium(12.0), color: UIColor.init(hex: "#161616"))
        }
        tableHeight.constant = tableView.contentSize.height
        return cell
    }
    func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        tableHeight.constant = tableView.contentSize.height
    }
}
extension String {
    func extractParagraphs() -> [String] {
        // Replace `<p>` and `</p>` tags with newline
        var cleanedString = self.replacingOccurrences(of: "<p>", with: "")
                              .replacingOccurrences(of: "</p>", with: "\n")
                              .trimmingCharacters(in: .whitespacesAndNewlines)
        cleanedString = cleanedString.replacingOccurrences(of: "<br>", with: "\n").replacingOccurrences(of: "</br>", with: "\n")
                              .trimmingCharacters(in: .whitespacesAndNewlines)

        let paragraphs = cleanedString.components(separatedBy: "\n").filter { !$0.isEmpty }
        return paragraphs
    }
}
