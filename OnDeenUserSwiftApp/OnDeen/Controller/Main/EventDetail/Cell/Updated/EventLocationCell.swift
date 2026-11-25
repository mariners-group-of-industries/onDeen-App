//
//  EventLocationCell.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 10/03/25.
//

import UIKit
import MapKit

class EventLocationCell: UITableViewCell {
    @IBOutlet weak var eventView: UIView!
    @IBOutlet weak var imgShare: UIImageView!
    @IBOutlet weak var lblAddress: SFProLabel!
    @IBOutlet weak var mapView: MKMapView!
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    override func layoutSubviews() {
        super.layoutSubviews()
        self.eventView.setCornerRadius(32.0)
        self.mapView.setCornerRadius(24.0)
    }
    func config(data: EventDetailResponse) {
        eventView.isHidden = (data.locationType != 1)
        lblAddress.text = data.location
        mapView.removeAnnotations(mapView.annotations)
        guard let lat = data.latitude?.toDouble(), let lon = data.longitude?.toDouble() else { return }
        let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
        let annotation = MKPointAnnotation()
        annotation.coordinate = coordinate
        mapView.addAnnotation(annotation)
        let region = MKCoordinateRegion(center: coordinate, latitudinalMeters: 1000, longitudinalMeters: 1000)
        mapView.setRegion(region, animated: true)
    }
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        // Configure the view for the selected state
    }
}
