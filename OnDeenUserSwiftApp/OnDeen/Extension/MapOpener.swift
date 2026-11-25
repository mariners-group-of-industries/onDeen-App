//
//  MapOpener.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 31/12/24.
//


import UIKit
import MapKit

class MapOpener {
    
    /// Opens the specified location in either Google Maps or Apple Maps.
    /// - Parameters:
    ///   - latitude: Latitude of the location.
    ///   - longitude: Longitude of the location.
    ///   - placeName: Optional name of the place to display (Apple Maps only).
    static func openMap(latitude: Double, longitude: Double, placeName: String? = nil) {
        let googleMapsURL = URL(string: "comgooglemaps://?q=\(latitude),\(longitude)")!
        let appleMapsURL = URL(string: "http://maps.apple.com/?ll=\(latitude),\(longitude)")!
        
        if UIApplication.shared.canOpenURL(googleMapsURL) {
            UIApplication.shared.open(googleMapsURL, options: [:], completionHandler: nil)
        } else {
            openAppleMaps(latitude: latitude, longitude: longitude, placeName: placeName)
        }
    }
    
    /// Opens the location in Apple Maps.
    /// - Parameters:
    ///   - latitude: Latitude of the location.
    ///   - longitude: Longitude of the location.
    ///   - placeName: Optional name of the place to display.
    private static func openAppleMaps(latitude: Double, longitude: Double, placeName: String?) {
        let coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        let mapItem = MKMapItem(placemark: MKPlacemark(coordinate: coordinate))
        mapItem.name = placeName
        mapItem.openInMaps(launchOptions: nil)
    }
}
