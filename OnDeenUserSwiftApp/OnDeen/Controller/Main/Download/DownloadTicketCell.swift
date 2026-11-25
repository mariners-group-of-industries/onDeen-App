//
//  DownloadTicketCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 12/02/25.
//

import UIKit

class DownloadTicketCell: UITableViewCell {
    @IBOutlet weak var lblDownload: UIImageView!
    @IBOutlet weak var lblAmount: SFProLabel!
    @IBOutlet weak var lblTitle: SFProLabel!
    @IBOutlet weak var lblTicketId: SFProLabel!
    @IBOutlet weak var lblCount: SFProLabel!
    @IBOutlet weak var imgQR: UIImageView!
    @IBOutlet weak var footerStack: UIStackView!
    @IBOutlet weak var lblViewAll: UILabel!
    @IBOutlet weak var lblTotalTickets: UILabel!
    @IBOutlet weak var bgView: UIView!
    var participantData = EventDetailParticipant.init(fromDictionary: [String : Any]())

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    func config(data:EventDetailParticipant,index:Int){
        footerStack.tag = index
        if data.paidAmount.toDouble() > 0.0{
            lblAmount.text = "Amount:".localized + " \(currency)\(data.paidAmount ?? "") \("(Paid)".localized)"
        }else{
            let amount = data.paidAmount.toDouble()
            if amount == 0.0{
                lblAmount.text = "Amount:".localized + " Free"
            }else{
                lblAmount.text = "Amount:".localized + " \(currency)\(data.paidAmount ?? "")"
            }
        }
        lblTitle.text = data.ticketTitle
        lblTicketId.text = "Ticket ID :".localized + " \(data.ticketNo ?? "0")"
        lblCount.isHidden = data.qrcodeCount == 1
        lblCount.text = index < 10 ? "0\(index + 1)" : "\(index + 1)"
        lblTotalTickets.text = "You’ve \(data.qrcodeCount ?? 0) \(data.ticketTitle ?? "") tickets"
        imgQR.loadAsyncImage(loadURL: data.qrcodePath)
        footerStack.isHidden = data.qrcodeCount == 1 || data.qrcodeCount == 0
    }
    func configTicket(data:EventDetailParticipant,data1:EventDetailParticipant,index:Int){
        footerStack.tag = index
        if data.paidAmount.toDouble() > 0.0{
            lblAmount.text = "Amount:".localized + " \(currency)\(data.paidAmount ?? "")"
        }else{
            let amount = data.paidAmount.toDouble()
            if amount == 0.0{
                lblAmount.text = "Amount:".localized + " Free"
            }else{
                lblAmount.text = "Amount:".localized + " \(currency)\(data.paidAmount ?? "0")"
            }
        }
        lblTitle.text = data1.ticketTitle
        lblTicketId.text = "Ticket ID :".localized + " \(data.ticketNo ?? "0")"
        lblCount.text = index < 10 ? "0\(index + 1)" : "\(index + 1)"
        lblTotalTickets.text = "You’ve \(data1.qrcodeCount ?? 0) \(data.ticketTitle ?? "") tickets"
        imgQR.loadAsyncImage(loadURL: data.qrcodePath)
        footerStack.isHidden = data1.qrcodeCount == 1
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.setCornerRadius(12.0)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
}
/*extension String{
    func formatAmount() -> String{
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal // Formats without decimals
        formatter.maximumFractionDigits = 0 // Removes decimals

        if let amount = Double(self),
           let formattedAmount = formatter.string(from: NSNumber(value: amount)) {
            return formattedAmount
        }
        return self
    }
}*/
extension String {
    func formatAmount() -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = 0   // remove .00
        formatter.maximumFractionDigits = 2   // keep up to 2 decimals
        formatter.roundingMode = .halfUp

        if let decimal = Decimal(string: self),
           let formatted = formatter.string(from: decimal as NSDecimalNumber) {
            return formatted
        }
        return self
    }
}
extension Decimal {
    func formatAmount() -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 2
        formatter.roundingMode = .halfUp

        return formatter.string(from: self as NSDecimalNumber) ?? "\(self)"
    }
}
