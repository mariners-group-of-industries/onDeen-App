//
//  SeachView.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//

import UIKit

class SeachView: UIImageView {
    override init(frame: CGRect) {
           super.init(frame: frame)
           setupTapGesture()
       }
       
       required init?(coder: NSCoder) {
           super.init(coder: coder)
           setupTapGesture()
       }
       
    private func setupTapGesture() {
        self.addTap { r in
            if let topVC = topViewController(){
                if let vc: EventSearchVC = topVC.getController(from: .main) {
                    topVC.pushVC(vc: vc)
                }
            }
        }
    }

}
