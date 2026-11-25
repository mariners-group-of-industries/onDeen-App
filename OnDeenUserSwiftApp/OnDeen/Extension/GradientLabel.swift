//
//  GradientLabel.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//


import UIKit

class GradientLabel: UILabel {
    
    /// Configures the gradient for the text
    /// - Parameters:
    ///   - colors: Array of `UIColor` for the gradient.
    ///   - startPoint: Start point of the gradient (e.g., top-left: (0, 0)).
    ///   - endPoint: End point of the gradient (e.g., bottom-right: (1, 1)).
//    func applyGradient(colors: [UIColor], startPoint: CGPoint, endPoint: CGPoint) {
//        mainThread { [self] in
//            let gradientLayer = CAGradientLayer()
//            // Configure the gradient layer
//            gradientLayer.colors = colors.map { $0.cgColor }
//            gradientLayer.startPoint = startPoint
//            gradientLayer.endPoint = endPoint
//            gradientLayer.frame = bounds
//            
//            // Use the text as a mask for the gradient
//            let textMask = CATextLayer()
//            textMask.string = text
//            textMask.font = font
//            textMask.fontSize = font.pointSize
//            textMask.alignmentMode = .center
//            textMask.contentsScale = UIScreen.main.scale
//            textMask.frame = bounds
//            textMask.foregroundColor = UIColor.black.cgColor
//            
//            gradientLayer.mask = textMask
//            layer.addSublayer(gradientLayer)
//        }
//    }
//    
//    override func layoutSubviews() {
//        super.layoutSubviews()
//        gradientLayer.frame = bounds
//        (gradientLayer.mask as? CATextLayer)?.frame = bounds
//    }
}
