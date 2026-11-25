//
//  LocationHelper.swift
//  OnDeen
//
//  Created by Imcrinox Technologies Pvt Ltd on 26/12/24.
//


import Foundation
import CoreLocation
var locationData = CLLocation.init(latitude: 0.0, longitude: 0.0)
var customLocationPicked = false

class LocationHelper: NSObject, CLLocationManagerDelegate {
    
    static let shared = LocationHelper() // Singleton instance
    
    private let locationManager = CLLocationManager()
    private var locationCompletion: ((CLLocation?, Error?) -> Void)?
    private var addressCompletion: ((String?, Error?) -> Void)?
    
    private override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    // MARK: - Request Location Permissions
    func requestLocationPermission() {
        let status = CLLocationManager.authorizationStatus()
        
        switch status {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .restricted, .denied:
            print("Location permissions are restricted/denied. Update settings.")
        case .authorizedWhenInUse, .authorizedAlways:
            print("Location permissions already granted.")
        @unknown default:
            break
        }
    }
    
    // MARK: - Fetch Current Location
    func getCurrentLocation(completion: @escaping (CLLocation?, Error?) -> Void) {
        locationCompletion = completion
        locationManager.startUpdatingLocation()
    }
    
    // MARK: - Fetch Address from Location
    func getAddress(from location: CLLocation, completion: @escaping (String?, Error?) -> Void) {
        addressCompletion = completion
        let geocoder = CLGeocoder()
        
        geocoder.reverseGeocodeLocation(location) { placemarks, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let placemark = placemarks?.first else {
                completion(nil, NSError(domain: "LocationHelper", code: 0, userInfo: [NSLocalizedDescriptionKey: "No address found."]))
                return
            }
            
            let address = [
//                placemark.name,
                placemark.locality
//                placemark.administrativeArea
//                placemark.country,
//                placemark.postalCode
            ].compactMap { $0 }.joined(separator: ", ")
            
            completion(address, nil)
        }
    }
    
    // MARK: - CLLocationManagerDelegate Methods
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.first else {
            locationCompletion?(nil, NSError(domain: "LocationHelper", code: 1, userInfo: [NSLocalizedDescriptionKey: "No location found."]))
            return
        }
        locationData = location
        locationCompletion?(location, nil)
        locationManager.stopUpdatingLocation()
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        locationCompletion?(nil, error)
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        if #available(iOS 14.0, *) {
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                print("Location permissions granted.")
            case .denied, .restricted:
                print("Location permissions denied/restricted.")
            case .notDetermined:
                print("Location permissions not determined yet.")
            @unknown default:
                break
            }
        } else {
            // Fallback on earlier versions
        }
    }
}
