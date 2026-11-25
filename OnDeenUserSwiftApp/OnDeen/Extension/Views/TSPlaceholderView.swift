//
//  TSPlaceholderView.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 03/01/25.
//

import UIKit
import Lottie
enum AnimationType{
    case none
    case noActiveBookings
    case noCompletedBookings
    case comingSoon
}
class TSPlaceholderView: UIView {
    @IBOutlet weak var contentView: UIView!
    @IBOutlet weak var animateView: LottieAnimationView!
    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var exploreView: UIView!

    override init(frame: CGRect) {
        super.init(frame: frame)
        initialSetup()
    }
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initialSetup()
    }
    override func layoutSubviews() {
        super.layoutSubviews()
    }
    private func initialSetup() {
        Bundle.main.loadNibNamed("TSPlaceholderView", owner: self, options: nil)
        contentView.frame = self.bounds
        contentView.autoresizingMask = [.flexibleWidth,.flexibleHeight]
        contentView.translatesAutoresizingMaskIntoConstraints = true
        addSubview(contentView)
        exploreView.addTap { r in
            if let vc = topViewController(){
                vc.setRootController(board: .main, identifier: .homeVC)
            }
        }
    }
    func setupLoadingView(type:AnimationType){
        var text = ""
        var file = ""
        if type == .noActiveBookings{
            text = "NO UPCOMING BOOKINGS".localized
            file = "no-bookings"
        }else if type == .noCompletedBookings{
            text = "NO COMPLETED BOOKINGS".localized
            file = "no-bookings"
        }else if type == .comingSoon{
            text = "Coming Soon"
            file = "coming_soon_clear"
            exploreView.isHidden = true
        }
        lblTitle.text = text
        if file.isEmpty{
            return
        }
        if let path = Bundle.main.path(forResource: file, ofType: "json"),
           let animation = LottieAnimation.filepath(path) {
            animateView.animation = animation

            // 3. Set animation content mode

            animateView!.contentMode = .scaleAspectFit

            // 4. Set animation loop mode

            animateView!.loopMode = .loop

            // 5. Adjust animation speed

            animateView!.animationSpeed = 0.5


            // 6. Play animation

            animateView!.play()

        } else {
            print("Failed to load animation from bundle.")
        }

    }
}
extension UITableView{
    func showPlaceHolder(type:AnimationType){
        let getPlaceholder = TSPlaceholderView()
        getPlaceholder.frame = CGRect(x: 0.0, y: 0.0, width: self.bounds.width, height: self.bounds.height)
        getPlaceholder.setupLoadingView(type: type)
        self.backgroundView = getPlaceholder
    }
}
extension UICollectionView{
    func showPlaceHolder(type:AnimationType){
        let getPlaceholder = TSPlaceholderView()
        getPlaceholder.frame = CGRect(x: 0.0, y: 0.0, width: self.bounds.width, height: self.bounds.height)
        getPlaceholder.setupLoadingView(type: type)
        self.backgroundView = getPlaceholder
    }
}
