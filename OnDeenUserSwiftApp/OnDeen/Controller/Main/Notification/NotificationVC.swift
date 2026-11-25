//
//  NotificationVC.swift
//  OnDeen
//
//  Created by Thabu's Mac on 09/04/25.
//

import UIKit

class NotificationVC: UIViewController {

    // MARK: - IBOutlets
    @IBOutlet weak var clearAllLabel: SFProLabel!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var backStack: UIStackView!

    // MARK: - Properties
    var refreshControl = UIRefreshControl()
    
    /// Stores all notifications fetched from API
    var allNotifications = [NotificationItem]()
    
    /// Stores filtered notifications to display in the table
    var notifications = [NotificationItem]() {
        didSet {
            refreshControl.endRefreshing()
            tableView.refreshTable()
        }
    }
    
    /// Header options for filtering (All / Unread)
    var notificationHeaders: [NotificationHeader] = [
        NotificationHeader(id: 0, title: "All", isSelected: true),
        NotificationHeader(id: 1, title: "Unread", isSelected: false),
        NotificationHeader(id: 2, title: "Delete All", isSelected: false),
        NotificationHeader(id: 3, title: "Mark as Seen All", isSelected: false)
    ]
    var isViewLoads = false
    var wishlistTapped : (() -> Void)?
    var notificationTapped : ((Int) -> Void)?

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        configUI()
    }

    // MARK: - UI Setup
    func configUI() {
        collectionView.registerAutoLayout()
        if let layout = collectionView.collectionViewLayout as? UICollectionViewFlowLayout {
            layout.estimatedItemSize = UICollectionViewFlowLayout.automaticSize
            layout.itemSize = UICollectionViewFlowLayout.automaticSize
            layout.minimumInteritemSpacing = 8 // Adjust spacing if needed
            layout.minimumLineSpacing = 8
            layout.scrollDirection = .horizontal // If items should be in a single row
        }

        // Back tap gesture
        clearAllLabel.addTap { r in
            self.showYesnoAlertWithClosure(title: "Are you sure you want to clear all notification?", type: 0, vc: self) { status in
                if status{
                    NotificationRequest.instance.triggerSeenNotification(param: ["delete_all" : 1]) { data, status in
                        self.triggerGetNotifications()
                        self.notificationTapped?(0)
                    }
                }
            }
        }
        backStack.addTap { _ in self.popVC() }

        // TableView setup
        tableView.registerNIBs(NotificationListCell.self,CalanderNoEventCell.self)

        // CollectionView setup
        collectionView.registerNIBs(NotificationHeaderCell.self)

        // Pull-to-refresh setup
        refreshControl.tintColor = .gray
        refreshControl.addTarget(self, action: #selector(handleRefresh), for: .valueChanged)
        tableView.refreshControl = refreshControl

        // Initial data fetch
        triggerGetNotifications()
        
        collectionView.refreshCollection()
    }

    // MARK: - Pull to Refresh
    @objc func handleRefresh() {
        triggerGetNotifications()
    }

    // MARK: - API Call
    func triggerGetNotifications() {
        NotificationRequest.instance.triggerNotificationLists { items, _ in
            self.isViewLoads = true
            self.allNotifications = items
            self.filterNotifications()
        }
    }

    // MARK: - Filter Logic
    func filterNotifications() {
        if let selected = notificationHeaders.first(where: { $0.isSelected }) {
            notifications = selected.id == 0 ? allNotifications : allNotifications.filter { $0.seen == 0 }
        }
    }
}
// MARK: - UITableViewDataSource / UITableViewDelegate
extension NotificationVC: UITableViewDataSource, UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if notifications.count == 0 && isViewLoads{
            return 1
        }
        return notifications.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if notifications.count == 0 && isViewLoads{
            let cell = tableView.configureCell(CalanderNoEventCell.self, at: indexPath)
            cell.lblTitle.text = "NO RESULTS FOUND".localized
            cell.lblSubtitle.text = ""
            cell.exploreView.isHidden = true
            return cell
        }
        let cell = tableView.configureCell(NotificationListCell.self, at: indexPath)
        cell.config(data: notifications[indexPath.row])
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if self.notifications.count > indexPath.row{
            let itemToNotification = self.notifications[indexPath.row]
            if itemToNotification.seen != 1{
                NotificationRequest.instance.triggerSeenNotification(param: ["id" : itemToNotification.id]) { data, status in
                    self.notifications[indexPath.row].seen = 1
                    if let indexInAll = self.allNotifications.firstIndex(where: { $0.id == itemToNotification.id }) {
                        self.allNotifications[indexInAll].seen = 1
                    }
                    let selected = self.allNotifications.filter { $0.seen == 0 }
                    self.filterNotifications()
                    self.collectionView.refreshCollection()
                    self.notificationTapped?(selected.count)
                }
            }
            if itemToNotification.type == 2 {
                if let vc: EventDetailController = self.getController(from: .main) {
                    vc.eventData = HomePageEvent.init(fromDictionary: ["id" : itemToNotification.eventID])
                    vc.wishlistTapped = {
                        self.wishlistTapped?()
                    }
                    vc.wishlistUpdated = { data in
                        self.wishlistTapped?()
                    }
                    self.pushVC(vc: vc)
                }
            }else if itemToNotification.type == 3 || itemToNotification.type == 5 || itemToNotification.type == 6 || itemToNotification.type == 7  || itemToNotification.type == 8  || itemToNotification.type == 9 {
                if let vc: BookingDetailVC = self.getController(from: .main) {
                    vc.eventData = HomePageEvent.init(fromDictionary: ["id" : itemToNotification.eventID])
                    vc.isCompletedBooking = itemToNotification.type == 8
                    #if DEBUG
                        vc.isQATabSelected = true
                    #else
                        vc.isQATabSelected = itemToNotification.type == 9
                    #endif
                    self.pushVC(vc: vc)
                }
            }else if itemToNotification.type == 4 {
                if let vc: OneSessionVC = self.getController(from: .main) {
                    vc.sessionId = itemToNotification.eventID
                    self.pushVC(vc: vc)
                }
            }
        }
    }
    // Swipe to delete support
    func tableView(_ tableView: UITableView,
                   trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath
    ) -> UISwipeActionsConfiguration? {
        if notifications.count == 0 && isViewLoads{
            return nil
        }
        let deleteAction = UIContextualAction(style: .destructive, title: "Delete") { _, _, completionHandler in
            self.deleteNotification(indexPath: indexPath)
            completionHandler(true)
        }
        deleteAction.backgroundColor = .systemRed
        return UISwipeActionsConfiguration(actions: [deleteAction])
    }
    func deleteNotification(indexPath:IndexPath){
        self.showYesnoAlertWithClosure(title: "Are you sure want to delete this notification?", type: 0, vc: self) { status in
            if status{
                let itemToRemove = self.notifications[indexPath.row]
//                #if DEBUG
//                    self.notifications.remove(at: indexPath.row)
//                    if let indexInAll = self.allNotifications.firstIndex(where: { $0.id == itemToRemove.id }) {
//                        self.allNotifications.remove(at: indexInAll)
//                    }
//                    self.tableView.deleteRows(at: [indexPath], with: .automatic)
//                #else
                NotificationRequest.instance.triggerDeleteNotification(param: ["id" :itemToRemove.id]) { data, status in
                        let itemToRemove = self.notifications[indexPath.row]
                        self.notifications.remove(at: indexPath.row)
                        if let indexInAll = self.allNotifications.firstIndex(where: { $0.id == itemToRemove.id }) {
                            self.allNotifications.remove(at: indexInAll)
                        }
                        self.tableView.deleteRows(at: [indexPath], with: .automatic)
                    }
//                #endif
            }
        }
    }
}

// MARK: - UICollectionViewDataSource / Delegate / FlowLayout
extension NotificationVC: UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }

    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return notificationHeaders.count
    }

    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.configureCell(NotificationHeaderCell.self, at: indexPath)
        let header = notificationHeaders[indexPath.item]
        cell.lblTitle.text = header.title
        cell.lblTitle.textColor = header.isSelected ? .white : .black
        cell.bgview.backgroundColor = header.isSelected ? .DB_3171 : .clear
        cell.bgview.config(
            borderColor: header.isSelected ? .DB_3171 : .black,
            borderWidth: 1.0,
            isRoundCorner: true
        )
        if header.id == 2 || header.id == 3{
            cell.bgview.backgroundColor = .black
            cell.lblTitle.textColor = .white
        }
        return cell
    }

    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        // Update selection state
        if indexPath.item == 2{
            self.showYesnoAlertWithClosure(title: "Are you sure you want to delete all notification?", type: 0, vc: self) { status in
                if status{
                    NotificationRequest.instance.triggerDeleteNotification(param: ["delete_all" : 1]) { data, status in
                        self.triggerGetNotifications()
                        self.notificationTapped?(0)
                    }
                }
            }
            return
        }else if indexPath.item == 3{
            self.showYesnoAlertWithClosure(title: "Are you sure you want to Mark as Seen All notification?", type: 0, vc: self) { status in
                if status{
                    NotificationRequest.instance.triggerSeenNotification(param: [String:Any]()) { data, status in
                        self.triggerGetNotifications()
                        self.notificationTapped?(0)
                    }
                }
            }
            return
        }
        notificationHeaders.enumerated().forEach { index, item in
            item.isSelected = (index == indexPath.item)
        }
        filterNotifications()
        collectionView.refreshCollection()
    }

    func collectionView(_ collectionView: UICollectionView,
                        layout collectionViewLayout: UICollectionViewLayout,
                        sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: 1, height: collectionView.bounds.height)
    }
}

// MARK: - Model
class NotificationHeader {
    var id: Int
    var title: String
    var isSelected: Bool

    init(id: Int, title: String, isSelected: Bool) {
        self.id = id
        self.title = title
        self.isSelected = isSelected
    }
}
