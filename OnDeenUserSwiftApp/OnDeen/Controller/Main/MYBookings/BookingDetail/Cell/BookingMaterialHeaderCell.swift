class BookingMaterialHeaderCell: UITableViewCell {
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var trailingCons: NSLayoutConstraint!
    @IBOutlet weak var leadingCons: NSLayoutConstraint!
    @IBOutlet weak var lblSubTitle: SFProLabel!
    @IBOutlet weak var lblBenefits: UIImageView!
    @IBOutlet weak var lblTitle: AllRoundLabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
    }
    
    func configHeader(title: String, subTitle: String) {
        if title == "Premium benefits".localized {
            lblBenefits.isHidden = false
            lblTitle.isHidden = true
            lblSubTitle.isHidden = true
        } else {
            lblTitle.text = title.localized
            lblTitle.isHidden = false
            lblBenefits.isHidden = true
        }
        lblSubTitle.text = subTitle.localized
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
    }
}

extension UILabel {
    func applyGradientText(colors: [UIColor] = gradientColors2,
                           startPoint: CGPoint = CGPoint(x: 0, y: 0),
                           endPoint: CGPoint = CGPoint(x: 1, y: 0)) {
        
        guard let text = self.text, !text.isEmpty else { return }
        
        // Remove existing gradient layers
        layer.sublayers?.removeAll(where: { $0 is CAGradientLayer })

        // Ensure layout is updated before applying the gradient
        layoutIfNeeded()
        
        // Empty the label text to prevent double text issue
        self.text = ""

        // Create gradient layer
        let gradientLayer = CAGradientLayer()
        gradientLayer.colors = colors.map { $0.cgColor }
        gradientLayer.startPoint = startPoint
        gradientLayer.endPoint = endPoint
        gradientLayer.frame = bounds

        // Use CATextLayer for the text mask
        let textLayer = CATextLayer()
        textLayer.string = text
        textLayer.font = font
        textLayer.fontSize = font.pointSize
        textLayer.contentsScale = UIScreen.main.scale
        textLayer.foregroundColor = UIColor.black.cgColor
        textLayer.frame = bounds
        
        // Set text alignment based on the label's current alignment
        switch self.textAlignment {
        case .left:
            textLayer.alignmentMode = .left
        case .right:
            textLayer.alignmentMode = .right
        case .center:
            textLayer.alignmentMode = .center
        default:
            textLayer.alignmentMode = .left
        }
        
        // Apply the mask
        gradientLayer.mask = textLayer
        
        // Add gradient layer to label
        layer.addSublayer(gradientLayer)
    }
}
