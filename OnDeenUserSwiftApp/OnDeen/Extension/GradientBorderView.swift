//
//  GradientBorderView.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//


import UIKit

class GradientBorderView: UIView {
    
    private let gradientLayer = CAGradientLayer()
    private let shapeLayer = CAShapeLayer()
    

    func configureGradientBorder(colors: [UIColor], lineWidth: CGFloat, cornerRadius: CGFloat) {
       // Setup gradient layer
        mainThread { [self] in
            gradientLayer.colors = colors.map { $0.cgColor }
            gradientLayer.startPoint = CGPoint(x: 0, y: 0)
            gradientLayer.endPoint = CGPoint(x: 1, y: 1)
            gradientLayer.frame = bounds
            
            // Create the shape layer for the border
            shapeLayer.path = UIBezierPath(roundedRect: bounds.insetBy(dx: lineWidth / 2, dy: lineWidth / 2),cornerRadius: cornerRadius).cgPath
            shapeLayer.lineWidth = lineWidth
            shapeLayer.fillColor = UIColor.clear.cgColor
            shapeLayer.strokeColor = UIColor.black.cgColor
            
            // Mask the gradient layer with the shape layer
            gradientLayer.mask = shapeLayer
            
            // Add the gradient layer to the view
            layer.addSublayer(gradientLayer)
        }
   }
   
   override func layoutSubviews() {
       super.layoutSubviews()
       gradientLayer.frame = bounds
       shapeLayer.path = UIBezierPath(roundedRect: bounds.insetBy(dx: shapeLayer.lineWidth / 2, dy: shapeLayer.lineWidth / 2),cornerRadius: layer.cornerRadius).cgPath
   }
}
