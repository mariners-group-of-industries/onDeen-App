//
//  LocationPermissionManager.swift
//  OnDeen
//
//  Created by Thabu MacbookPRO on 18/11/25.
//


import CoreLocation

class LocationPermissionManager: NSObject, CLLocationManagerDelegate {

    static let shared = LocationPermissionManager()
    private let locationManager = CLLocationManager()

    private var completion: ((Bool) -> Void)?

    func checkPermission(_ completion: @escaping (Bool) -> Void) {
        self.completion = completion
        locationManager.delegate = self

        let status = CLLocationManager.authorizationStatus()

        switch status {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse, .authorizedAlways:
            completion(true)
        case .restricted, .denied:
            completion(false)
        @unknown default:
            completion(false)
        }
    }

//    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
//        switch status {
//        case .authorizedAlways, .authorizedWhenInUse:
//            completion?(true)
//        case .denied, .restricted:
//            completion?(false)
//        default:
//            break
//        }
//    }
}
