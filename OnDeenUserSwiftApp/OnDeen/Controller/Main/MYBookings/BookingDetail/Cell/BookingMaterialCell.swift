//
//  BookingMaterialCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 19/12/24.
//

import UIKit

class BookingMaterialCell: UITableViewCell {
    @IBOutlet weak var lblDesc: SFProLabel!
    @IBOutlet weak var headerView: UIStackView!
    
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    var questionTapped : ((Int,Int) -> Void)?
    var filesTapped : ((Int,Int) -> Void)?
    var materialData = [EventDetailFile]()
    var questionlData = [EventQuestionsResponse]()
    weak var delegate: DynamicHeightCellDelegate? // Delegate reference

    override func awakeFromNib() {
        super.awakeFromNib()
        tableView.registerNIBs(BookingMaterialInfoCell.self)
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        tableHeight.constant = tableView.contentSize.height
        bgView.config(cornerRadius: 20.0, borderColor: UIColor.init(hex: "#E2E2E2"), borderWidth: 1.0)
    }
    func updateHeight(){
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [self] in
            tableView.layoutIfNeeded()

            tableHeight.constant = tableView.contentSize.height

            self.layoutIfNeeded()
            delegate?.updateTableView()
        }
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        // Configure the view for the selected state
    }
    func configdata(item:[EventDetailFile]){
        materialData = item
        tableView.reloadData()
        updateHeight()
    }
    func configQuestions(item:[EventQuestionsResponse]){
        questionlData = item
        tableView.reloadData()
        updateHeight()
    }
}
extension BookingMaterialCell:UITableViewDataSource,UITableViewDelegate{
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if tableView.tag == 1{
            return materialData.count == 0 ? 1 : materialData.count
        }
        return tableView.tag == 1 ? materialData.count : questionlData.count == 0 ? 1 : questionlData.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.configureCell(BookingMaterialInfoCell.self, at: indexPath)
        cell.lblTitle.isHidden = tableView.tag == 2
        cell.lblSubtitle.text = tableView.tag == 2 ? "Quis nostrud exercitation ullamco labor..." : "12kb"
        cell.imgDownload.image = UIImage.init(named: tableView.tag == 2 ? "ic_booking_go" : "ic_download_file") ?? UIImage()
        cell.imgDownload.isHidden = false
        if tableView.tag == 1{
            cell.lblSubtitle.isHidden = true
            cell.lblTitle.font = Fonts.SFProMedium(12.0)
            cell.lblTitle.textColor = .black
            cell.lblTitle.html2String(string: "File \(indexPath.row + 1)", customFont: Fonts.SFProMedium(12.0), color: .black)
            if materialData.count == 0{
                cell.lblTitle.text = "No files added"
                cell.lblTitle.textColor = .lightGray
                cell.imgDownload.isHidden = true
                cell.lblTitle.font = Fonts.SFProRegular(12.0)
            }
        }else {
            cell.lblSubtitle.isHidden = false
            if questionlData.count > 0{
                cell.lblSubtitle.text = questionlData[indexPath.row].question
            }else{
                cell.lblSubtitle.text = "No questions asked you".localized
            }
        }
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if tableView.tag == 1 {
            if materialData.count == 0{
                return
            }
            let getTableRow = Int(tableView.accessibilityHint ?? "") ?? 0
            filesTapped?(getTableRow,indexPath.row)
            return
        }
        questionTapped?(tableView.tag,indexPath.row)
    }
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 55.0
    }
}

