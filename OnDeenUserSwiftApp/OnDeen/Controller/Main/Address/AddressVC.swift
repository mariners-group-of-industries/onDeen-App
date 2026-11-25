//
//  AddressVC.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 26/12/24.
//

import UIKit
import MapKit
class AddressVC: UIViewController {
    @IBOutlet weak var saveView: GlobalGradientView!
    @IBOutlet weak var lblAddress: UILabel!
    @IBOutlet weak var mapView: MKMapView!
    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var backView: UIStackView!
    let geocoder = CLGeocoder()

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
        // Do any additional setup after loading the view.
    }
    func config(){
        mapView.delegate = self  // Set the delegate
        backView.addTap { r in
            self.dismissVC()
        }
        saveView.addTap { r in
            customLocationPicked = true
            locationData = CLLocation.init(latitude: self.mapView.centerCoordinate.latitude, longitude: self.mapView.centerCoordinate.longitude)
            self.setRootController(board: .main, identifier: .homeVC)
        }
        searchView.addTap { r in
            if let vc: LocationSearchViewController = self.getController(from: .main) {
                vc.itemTapped = { map in
                    self.searchForSelectedLocation(completion: map)
                }
                self.presentVC(vc: vc)
            }
        }
        let coordinate = CLLocationCoordinate2D(latitude: locationData.coordinate.latitude, longitude: locationData.coordinate.longitude)
        let region = MKCoordinateRegion(
            center: coordinate,
            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
        )
        self.mapView.setRegion(region, animated: true)
        LocationHelper.shared.getCurrentLocation { location, error in
            if error != nil{
                self.showUKRegion()
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        searchView.config(isRoundCorner: true)
        mapView.setCornerRadius(24.0)
    }
    func setCurrentLocation() {
        let coordinate = CLLocationCoordinate2D(latitude: locationData.coordinate.latitude, longitude: locationData.coordinate.longitude)
        let region = MKCoordinateRegion(
            center: coordinate,
            span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
        )
        mapView.setRegion(region, animated: true)
        fetchAddress(for: coordinate)
    }
}
extension AddressVC:MKMapViewDelegate{
    func searchForSelectedLocation(completion: MKLocalSearchCompletion) {
        let searchRequest = MKLocalSearch.Request()
        searchRequest.naturalLanguageQuery = completion.title
        let search = MKLocalSearch(request: searchRequest)
        search.start { [weak self] (response, error) in
            guard let self = self else { return }
            guard let coordinate = response?.mapItems.first?.placemark.coordinate else {
                print("Location not found")
                return
            }
            // Update map
            self.mapView.setRegion(MKCoordinateRegion(
                center: coordinate,
                span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
            ), animated: true)
        }
    }

    func mapView(_ mapView: MKMapView, regionDidChangeAnimated animated: Bool) {
        let centerCoordinate = mapView.centerCoordinate
        fetchAddress(for: centerCoordinate)
    }
    // Fetch address for the given coordinate
    func fetchAddress(for coordinate: CLLocationCoordinate2D) {
        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        geocoder.reverseGeocodeLocation(location) { [weak self] (placemarks, error) in
            guard let self = self else { return }
            if let error = error {
                print("Reverse geocoding failed: \(error.localizedDescription)")
                return
            }
            if let placemark = placemarks?.first {
                let address = [
                    placemark.name,
                    placemark.locality,
                    placemark.administrativeArea,
                    placemark.country
                ].compactMap { $0 }.joined(separator: ", ")

                self.lblAddress.text = address
                print("Address: \(address)")
            }
        }
    }
    private func showUKRegion() {
        delay(1.0) { [self] in
            // Coordinates for the center of the UK
            let ukCenter = CLLocationCoordinate2D(latitude: 54.0, longitude: -2.0)
            
            // Approximate region span to include the UK
            let regionSpan = MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
            
            // Set the map region
            let ukRegion = MKCoordinateRegion(center: ukCenter, span: regionSpan)
            mapView.setRegion(ukRegion, animated: true)
        }
    }
}
