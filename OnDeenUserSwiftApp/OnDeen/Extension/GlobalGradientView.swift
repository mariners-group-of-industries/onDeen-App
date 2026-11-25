//
//  GlobalCustomView.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 17/12/24.
//


import UIKit

@IBDesignable
class GlobalGradientView: UIView {

    // Gradient Layer
    private var gradientLayer: CAGradientLayer!
    var isVertical = false
    // MARK: - Initializers
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupGradient()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupGradient()
    }

    // MARK: - Setup Gradient Layer
    private func setupGradient() {
        gradientLayer = CAGradientLayer()
        gradientLayer.frame = bounds
        layer.insertSublayer(gradientLayer, at: 0)
        updateGradient()
    }

    // MARK: - Update Gradient Colors and Direction
    private func updateGradient() {
        if self.tag == 1{
            gradientLayer.colors = [
                UIColor(hex: "#FFD861").cgColor,
                UIColor(hex: "#FFAECC").cgColor
            ]
        }else if self.tag == 2{
            gradientLayer.colors = [
                UIColor(hex: "#DB3171").cgColor,
                UIColor(hex: "#FFCC33").cgColor
            ]
        }else if self.tag == 3{
            gradientLayer.colors = [
                UIColor(hex: "#DD89F5").cgColor,
                UIColor(hex: "#FFD5E3").cgColor
            ]
        }else if self.tag == 4{
            gradientLayer.colors = [
                UIColor(hex: "#FFAECC").cgColor,
                UIColor(hex: "#FFD861").cgColor
            ]
        }else if self.tag == 100{
            return
        }else{
            gradientLayer.colors = [
                UIColor(hex: "#F4F4F4").cgColor,
                UIColor(hex: "#FFCC33").cgColor,
                UIColor(hex: "#DB3171").cgColor,
                UIColor(hex: "#422199").cgColor
            ]
        }
        if isVertical {
            gradientLayer.startPoint = CGPoint(x: 0.5, y: 0.0)  // Top center
            gradientLayer.endPoint = CGPoint(x: 0.5, y: 1.0)    // Bottom center
        } else {
            gradientLayer.startPoint = CGPoint(x: 0.0, y: 0.5)  // Left center
            gradientLayer.endPoint = CGPoint(x: 1.0, y: 0.5)    // Right center
        }
    }
    // MARK: - Layout Override
    override func layoutSubviews() {
        super.layoutSubviews()
        gradientLayer.frame = bounds
        if self.tag == 1 || self.tag == 3 || self.tag == 4{
            self.setCornerRadius(24.0)
        }else{
            self.config(isRoundCorner: true)
        }
    }
}
@IBDesignable
class GlobalMembersipView: UIView {

    // Gradient Layer
    private var gradientLayer: CAGradientLayer!
    var isVertical = false
    // MARK: - Initializers
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupGradient()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupGradient()
    }

    // MARK: - Setup Gradient Layer
    private func setupGradient() {
        gradientLayer = CAGradientLayer()
        gradientLayer.frame = bounds
        layer.insertSublayer(gradientLayer, at: 0)
        updateGradient()
    }

    // MARK: - Update Gradient Colors and Direction
    private func updateGradient() {
        if self.tag == 2{
            gradientLayer.colors = [
                UIColor(hex: "#FFD861").cgColor,
                UIColor(hex: "#FFAECC").cgColor
            ].reversed()
        }else if self.tag == 1 || self.tag == 5{
            gradientLayer.colors = [
                UIColor(hex: "#DD89F5").cgColor,
                UIColor(hex: "#FFD5E3").cgColor
            ].reversed()
        }
        if isVertical {
            gradientLayer.startPoint = CGPoint(x: 0.5, y: 0.0)  // Top center
            gradientLayer.endPoint = CGPoint(x: 0.5, y: 1.0)    // Bottom center
        } else {
            gradientLayer.startPoint = CGPoint(x: 0.0, y: 0.5)  // Left center
            gradientLayer.endPoint = CGPoint(x: 1.0, y: 0.5)    // Right center
        }
    }
    // MARK: - Layout Override
    override func layoutSubviews() {
        super.layoutSubviews()
        gradientLayer.frame = bounds
        if self.tag == 5{
            self.config(cornerRadius: 24.0, borderColor: UIColor.init(hex: "#DB3171"), borderWidth: 1.0)
        }else{
            self.setCornerRadius(24.0)
        }
    }
}
