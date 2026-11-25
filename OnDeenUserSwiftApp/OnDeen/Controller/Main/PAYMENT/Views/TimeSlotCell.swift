//
//  FilterCell.swift
//  TreatIt
//
//  Created by Imcrinox Technologies Pvt Ltd on 08/08/24.
//

import UIKit

class TimeSlotCell: UICollectionViewCell {
    @IBOutlet weak var labelRemainingSeats: SFProLabel!
    @IBOutlet private weak var bgView: UIView!
    @IBOutlet private weak var labelTitle: SFProLabel!

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        bgView.setCornerRadius(8.0)
    }

    func configure(model: TimeModel,timeZone:String){
        labelTitle.text = model.startTime.convertTimeOnly(startDate: model.startDate, startTimeString: "HH:mm:ss", timeZone: timeZone)

        if model.status == 1{
            if model.remaining > 0{
                labelRemainingSeats.text = "Available \(model.remaining) \("Tickets".localized)"
                if model.isSelected{
                    bgView.backgroundColor = UIColor(named: "9977F2")
                    labelTitle.textColor = UIColor.white
                    labelRemainingSeats.textColor = UIColor.white
                }else{
                    bgView.backgroundColor = UIColor(named: "EFEAF3")
                    labelTitle.textColor = UIColor(named: "17101F")
                    labelRemainingSeats.textColor = UIColor(named: "9977F2")
                }
            }else{
                labelRemainingSeats.text = "Fully Booked".localized
                bgView.backgroundColor = UIColor(named: "EFEAF3")
                labelTitle.textColor = UIColor(named: "B0B0B0")
                labelRemainingSeats.textColor = UIColor(named: "B0B0B0")
            }
        }else{
            labelRemainingSeats.text = "Not Available".localized
            bgView.backgroundColor = UIColor(named: "EFEAF3")
            labelTitle.textColor = UIColor(named: "B0B0B0")
            labelRemainingSeats.textColor = UIColor(named: "B0B0B0")
        }
        
        if self.tag == 100000{
            self.labelRemainingSeats.isHidden = true
        }
    }
}
