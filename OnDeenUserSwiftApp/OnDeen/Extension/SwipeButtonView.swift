//
//  DrawView.swift
//  DrawButton
//
//  Created by ktrkathir on 26/01/19.
//  Copyright © 2019 ktrkathir. All rights reserved.
//

/*import UIKit

/// DrawSwitchView
@IBDesignable class SwipeButtonView: UIView {
    
    /// Radius of background view
    @IBInspectable var radius: CGFloat = 10.0
    
    /// Background hint view
    @IBInspectable var hint: String = "Swipe to check-in".uppercased()
    
    /// drag image
    @IBInspectable var image: UIImage?
    
    /// state
    private var isSuccess: Bool = false
    
    /// Completion handler
    private var completionHandler: ((_ isSuccess: Bool) -> ())?
    
    override func draw(_ rect: CGRect) {
        super.draw(rect)
        
        self.layer.cornerRadius = self.bounds.height / 2
        self.layer.masksToBounds = true
        
        setUp()
    }
    
    public var hintLabel: UILabel = UILabel()
    
    public var swipeImageView: UIImageView = UIImageView()
    
    private func setUp() {
        
        hintLabel.frame = CGRect(x: 0, y: 0, width: frame.width, height: frame.height)
        hintLabel.font = Fonts.SFProMedium(12.0)
        self.addSubview(hintLabel)
        hintLabel.textColor = UIColor.black
        hintLabel.textAlignment = .center
        hintLabel.text = hint
        
        swipeImageView.image = UIImage.init(named: "ic_swipe_arrorw") ?? UIImage()
        swipeImageView.frame = CGRect(x: 5, y: 5, width: frame.height - 10, height: frame.height - 10)
        swipeImageView.backgroundColor = UIColor.white
        swipeImageView.layer.cornerRadius = (frame.height - 10) / 2
        swipeImageView.layer.borderColor = UIColor.clear.cgColor
        swipeImageView.layer.borderWidth = 5
        self.addSubview(swipeImageView)
        swipeImageView.isUserInteractionEnabled = true
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesMoved(touches, with: event)
        
        if let touch = touches.first, swipeImageView == touch.view {
            let touchedPosition = touch.location(in: self)
            
//            let alpha = (1.0 -  touchedPosition.x / frame.width)
            swipeImageView.alpha = 1.0// alpha
            
            if touchedPosition.x > (frame.height/2) {
                swipeImageView.center = CGPoint(x: touchedPosition.x, y: swipeImageView.frame.midY)
            }
        }
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if let touch = touches.first, swipeImageView == touch.view {
            // let touchedPosition = touch.location(in: self)
            setToDefault()
        }
    }
    
    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesCancelled(touches, with: event)
        if let touch = touches.first, swipeImageView == touch.view {
            setToDefault()
        }
    }
    
    /// Set to default
    private func setToDefault() {
        if self.frame.midX > swipeImageView.center.x { // Move to initial
            UIView.animate(withDuration: 0.25, animations: {
                self.swipeImageView.frame.origin = CGPoint(x: 5, y: 5)
                self.swipeImageView.alpha = 1.0
            }) { (isFinished) in
                if isFinished {
                    self.isSuccess = false
                    if let complete = self.completionHandler {
                        complete(self.isSuccess)
                    }
                }
            }
        } else if self.frame.midX < swipeImageView.center.x { // Move to final
            let xPosi = self.frame.width - (self.swipeImageView.frame.width + 5)
            UIView.animate(withDuration: 0.25, animations: {
                self.swipeImageView.frame.origin = CGPoint(x: xPosi, y: 5)
                self.swipeImageView.alpha = 1.0
            }) { (isFinished) in
                if isFinished {
                    self.isSuccess = true
                    if let complete = self.completionHandler {
                        complete(self.isSuccess)
                    }
                }
            }
        }
    }
    
    /// Handle action
    ///
    /// - Parameter completed: with completion
    public func handleAction(_ completed: @escaping((_ isSuccess: Bool) -> ()) ) {
        completionHandler = completed
    }
    
    /// Update hint value
    ///
    /// - Parameter text: by string
    public func updateHint() {
//        hintLabel.text = text
        self.swipeImageView.frame.origin = CGPoint(x: 5, y: 5)
        self.swipeImageView.alpha = 1.0
    }
    public func updateHintLabel(text:String) {
        hintLabel.text = text
    }
}*/
import UIKit

@IBDesignable
class SwipeButtonView: UIView {
    
    /// Radius of background view
    @IBInspectable var radius: CGFloat = 10.0
    
    /// Background hint text
    @IBInspectable var hint: String = "Swipe to check-in".uppercased() {
        didSet {
            hintLabel.text = hint
        }
    }
    
    /// Drag image
    @IBInspectable var image: UIImage? {
        didSet {
            swipeImageView.image = image
        }
    }
    
    /// State
    private var isSuccess: Bool = false
    
    /// Completion handler
    private var completionHandler: ((_ isSuccess: Bool) -> ())?
    
    // UI Elements
    public var hintLabel: UILabel = UILabel()
    public var swipeImageView: UIImageView = UIImageView()
    
    // Pan gesture
    private var panGesture: UIPanGestureRecognizer!
    
    // MARK: - Init
    override init(frame: CGRect) {
        super.init(frame: frame)
        setUp()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setUp()
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        self.layer.cornerRadius = self.bounds.height / 2
        self.layer.masksToBounds = true
        
        // Layout hint label
        hintLabel.frame = CGRect(x: 0, y: 0, width: bounds.width, height: bounds.height)
        
        // Layout swipe image view
        let imageSize = bounds.height - 10
        swipeImageView.frame = CGRect(x: 5, y: 5, width: imageSize, height: imageSize)
        swipeImageView.layer.cornerRadius = imageSize / 2
    }
    
    private func setUp() {
        self.backgroundColor = UIColor.lightGray.withAlphaComponent(0.2)
        
        // Setup hint label
        hintLabel.font = UIFont.systemFont(ofSize: 12, weight: .medium) // Replace with your Fonts.SFProMedium if needed
        hintLabel.textColor = UIColor.black
        hintLabel.textAlignment = .center
        hintLabel.text = hint
        addSubview(hintLabel)
        
        // Setup swipe image view
        swipeImageView.image = UIImage(named: "ic_swipe_arrorw") ?? UIImage()
        swipeImageView.backgroundColor = UIColor.white
        swipeImageView.layer.borderColor = UIColor.clear.cgColor
        swipeImageView.layer.borderWidth = 5
        swipeImageView.isUserInteractionEnabled = true
        addSubview(swipeImageView)
        
        // Gesture
        panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        swipeImageView.addGestureRecognizer(panGesture)
    }
    
    // MARK: - Gesture Handler
    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: self)
        
        switch gesture.state {
        case .changed:
            var newX = swipeImageView.center.x + translation.x
            newX = max(swipeImageView.bounds.width / 2 + 5, newX)
            newX = min(bounds.width - swipeImageView.bounds.width / 2 - 5, newX)
            swipeImageView.center = CGPoint(x: newX, y: swipeImageView.center.y)
            gesture.setTranslation(.zero, in: self)
            
        case .ended, .cancelled:
            completeSwipe()
            
        default:
            break
        }
    }
    
    private func completeSwipe() {
        let centerX = swipeImageView.center.x
        let successThreshold = bounds.width * 0.75 // Swipe 75% to succeed
        
        if centerX >= successThreshold {
            moveToSuccess()
        } else {
            moveToDefault()
        }
    }
    
    private func moveToSuccess() {
        let xPos = bounds.width - swipeImageView.bounds.width - 5
        UIView.animate(withDuration: 0.25, animations: {
            self.swipeImageView.frame.origin.x = xPos
        }) { finished in
            if finished {
                self.isSuccess = true
                self.completionHandler?(self.isSuccess)
            }
        }
    }
    
    private func moveToDefault() {
        UIView.animate(withDuration: 0.25, animations: {
            self.swipeImageView.frame.origin.x = 5
        }) { finished in
            if finished {
                self.isSuccess = false
                self.completionHandler?(self.isSuccess)
            }
        }
    }
    
    /// Set action completion
    public func handleAction(_ completed: @escaping((_ isSuccess: Bool) -> ()) ) {
        completionHandler = completed
    }
    
    /// Update hint text
    public func updateHintLabel(text: String) {
        self.hint = text
    }
    
    /// Reset swipe button to default
    public func resetSwipe() {
        moveToDefault()
    }
}
