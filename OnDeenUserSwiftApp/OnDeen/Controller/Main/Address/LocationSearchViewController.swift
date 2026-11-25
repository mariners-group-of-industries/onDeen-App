//
//  LocationSearchViewController.swift
//  AppleLocationSearch
//
//  Created by Imcrinox Technologies Pvt Ltd on 25/12/24.
//


import UIKit
import MapKit

class LocationSearchViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, MKLocalSearchCompleterDelegate {
    @IBOutlet weak var tableHeight: NSLayoutConstraint!
    var itemTapped : ((MKLocalSearchCompletion) -> Void)?
    @IBOutlet weak var tableView: UITableView!

    let searchCompleter = MKLocalSearchCompleter()
    var searchResults: [MKLocalSearchCompletion] = []
    @IBOutlet weak var fieldSearch: UITextField!
    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var backView: UIStackView!

    override func viewDidLoad() {
        super.viewDidLoad()
        config()
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        searchView.config(isRoundCorner: true)
    }
    func config(){
        fieldSearch.delegate = self
        fieldSearch.becomeFirstResponder()
        searchCompleter.delegate = self
        tableView.registerNIBs(LocationSearchCell.self)
        
        backView.addTap { r in
            self.dismissVC()
        }
        tableHeight = fieldSearch.heightAnchor.constraint(equalToConstant: 40)
        tableHeight.isActive = true
    }
    
    // MKLocalSearchCompleterDelegate
    func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        searchResults = completer.results
        tableView.reloadData()
    }

    func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
        print("Error: \(error.localizedDescription)")
    }

    // UITableViewDataSource
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return searchResults.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "LocationSearchCell", for: indexPath) as! LocationSearchCell
        let result = searchResults[indexPath.row]
        cell.lblTitle.text = result.title
        cell.lblSubtitle.text = result.subtitle
        return cell
    }

    // UITableViewDelegate
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let selectedResult = searchResults[indexPath.row]
        itemTapped?(selectedResult)
        print("Selected location: \(selectedResult.title), \(selectedResult.subtitle)")
        fieldSearch.text = selectedResult.title
        tableView.isHidden = true
        self.dismiss(animated: true)
    }
}
extension LocationSearchViewController:UITextFieldDelegate{
    // UITextFieldDelegate - Trigger when text changes
       func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
           // Combine existing text with the new text
           let updatedText = (textField.text as NSString?)?.replacingCharacters(in: range, with: string) ?? string
           self.searchCompleter.queryFragment = updatedText

           // Adjust height based on content
           adjustTextFieldHeight(for: updatedText)
           return true
       }

       private func adjustTextFieldHeight(for text: String) {
           let maxWidth = fieldSearch.frame.width
           let font = Fonts.SFProRegular(14.0)
           let textAttributes = [NSAttributedString.Key.font: font]
           let textSize = (text as NSString).boundingRect(
               with: CGSize(width: maxWidth, height: CGFloat.greatestFiniteMagnitude),
               options: .usesLineFragmentOrigin,
               attributes: textAttributes,
               context: nil
           )
           // Adjust height with padding
           let newHeight = max(40, ceil(textSize.height) + 10) // Minimum height is 40
           tableHeight.constant = newHeight
           view.layoutIfNeeded()
       }
}
