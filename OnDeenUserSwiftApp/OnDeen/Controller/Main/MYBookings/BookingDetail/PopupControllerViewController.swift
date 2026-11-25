//
//  PopupControllerViewController.swift
//  PopoverPresentationExample
//

/*import UIKit

final class PopupControllerViewController: UIViewController {

    @IBOutlet weak var descLable: UILabel!
    @IBOutlet weak var closeAction: UIImageView!

    override func viewDidLoad() {
        super.viewDidLoad()

        // Enable tap on the close image
        closeAction.isUserInteractionEnabled = true
        let tap = UITapGestureRecognizer(target: self, action: #selector(didTapClose))
        closeAction.addGestureRecognizer(tap)

        // Label setup
        descLable.numberOfLines = 0
        descLable.lineBreakMode = .byWordWrapping

        // Set text early
        descLable.text = "* You can check in 10 minutes before the start time.\n* Check-in will be disabled 30 minutes after the end time.\n* Make sure to check in within this time window to be marked present."
    }

    @objc func didTapClose() {
        self.dismiss(animated: true)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        // 👇 Set preferredMaxLayoutWidth based on final label frame width
        descLable.preferredMaxLayoutWidth = descLable.bounds.width

        // 👇 Force size calculation after layout
        self.preferredContentSize = CGSize(width: view.bounds.width - 60, height: calculatePreferredHeight())
    }

    override var preferredContentSize: CGSize {
        get {
            let width = view.bounds.width - 60
            return CGSize(width: width, height: calculatePreferredHeight())
        }
        set { super.preferredContentSize = newValue }
    }

    private func calculatePreferredHeight() -> CGFloat {
        view.layoutIfNeeded()
        let contentHeight = view.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height
        return contentHeight
    }
}*/
import UIKit

final class PopupControllerViewController: UIViewController {

    // UI Elements
    private let titleLabel = UILabel()
    private let descLabel = UILabel()
    private let closeAction = UIImageView()
    var textInfo = ""
    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = .white
        view.layer.cornerRadius = 16
        view.layer.masksToBounds = true

        setupUI()
        setupConstraints()
    }

    private func setupUI() {
        // Close Button
        closeAction.image = UIImage(systemName: "xmark.circle.fill")
        closeAction.tintColor = .darkGray
        closeAction.isUserInteractionEnabled = true
        let tap = UITapGestureRecognizer(target: self, action: #selector(didTapClose))
        closeAction.addGestureRecognizer(tap)
        view.addSubview(closeAction)

        // Title Label
        titleLabel.text = "Check-In Rules"
        titleLabel.font = UIFont.boldSystemFont(ofSize: 18)
        titleLabel.textAlignment = .center
        view.addSubview(titleLabel)

        // Description Label
        descLabel.text = """
        • You can check in 15 minutes before the start time.\n
        • Check-in will be disabled 30 minutes after the end time.\n
        • Make sure to check in within this time window to be marked present.\n
        • Make sure you're within 200 meters of the location to check in.\n
        """
        if !textInfo.isEmpty{
            descLabel.text = textInfo
        }
        descLabel.numberOfLines = 0
        descLabel.lineBreakMode = .byWordWrapping
        descLabel.font = UIFont.systemFont(ofSize: 16)
        descLabel.textColor = .darkGray
        view.addSubview(descLabel)
    }

    private func setupConstraints() {
        closeAction.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        descLabel.translatesAutoresizingMaskIntoConstraints = false

        NSLayoutConstraint.activate([
            // Close icon top-right
            closeAction.topAnchor.constraint(equalTo: view.topAnchor, constant: 16),
            closeAction.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            closeAction.widthAnchor.constraint(equalToConstant: 24),
            closeAction.heightAnchor.constraint(equalToConstant: 24),

            // Title label top-left
            titleLabel.topAnchor.constraint(equalTo: view.topAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: closeAction.leadingAnchor, constant: -8),

            // Description label below title
            descLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 12),
            descLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            descLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            descLabel.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -16)
        ])
    }

    @objc private func didTapClose() {
        self.dismiss(animated: true)
    }

    // Auto-fit popup height
    override var preferredContentSize: CGSize {
        get {
            let width = UIScreen.main.bounds.width - 60
            let height = calculatePreferredHeight(forWidth: width)
            return CGSize(width: width, height: height)
        }
        set { super.preferredContentSize = newValue }
    }

    private func calculatePreferredHeight(forWidth width: CGFloat) -> CGFloat {
        // Force layout with target width
        let targetSize = CGSize(width: width, height: UIView.layoutFittingCompressedSize.height)
        let size = view.systemLayoutSizeFitting(targetSize,
                                                withHorizontalFittingPriority: .required,
                                                verticalFittingPriority: .fittingSizeLevel)
        return size.height
    }
}
