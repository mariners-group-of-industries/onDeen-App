//
//  TSImagePickerVC.swift
//  Brandatna
//
//  Created by IMCRINOX on 30/12/20.
//  Copyright © 2020 Imcrinox. All rights reserved.
//

import UIKit
import MobileCoreServices
import Photos
import AssetsLibrary

class TSImagePickerVC: UIViewController {
    var imageName = ""
    
    @IBOutlet weak var backView: UIView!
    @IBOutlet weak var lblTitle: UILabel!
    var imagePicked : ((UIImage,Bool,String) -> Void)?
    var videoPicked : ((URL,String) -> Void)?

    var itemPicked : ((Int,Bool) -> Void)?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        backView.setCornerRadius(15.0)
        self.view.setAlphaBackground()
        self.lblTitle.text = "Upload Picture"
    }
    @IBAction func clickedCamera(_ sender: Any) {
        self.showCamera(type: .camera) { (img,name) in
            self.imagePicked?(img,false,name)
        }
    }
    @IBAction func clickedGallery(_ sender: Any) {
        self.showCamera(type: .photoLibrary) { (img,name) in
            self.imagePicked?(img,true,name)
        }
    }
    @IBAction func clickedBack(_ sender: Any) {
        self.dismissVC()
    }   
    func showVideoCamera(type:UIImagePickerController.SourceType, result: @escaping (_ videoURL: URL,_ fileName:String) -> ()){
        let pickerController = UIImagePickerController()
        pickerController.sourceType = type
        pickerController.mediaTypes = ["public.movie"]
        pickerController.allowsEditing = true
        pickerController.videoMaximumDuration = 30.0
        pickerController.didFinishPickingMedia { [weak self] info in
            var videourl = URL(string: "")
            var selectedFileName = ""
            if #available(iOS 11.0, *) {
                if let imageUrl = info[.mediaURL] as? URL {
                    videourl = imageUrl
                    selectedFileName = imageUrl.lastPathComponent
                }
            } else {
                if let imageURL = info[.referenceURL] as? URL {
                    videourl = imageURL
                    let result = PHAsset.fetchAssets(withALAssetURLs: [imageURL], options: nil)
                    if let firstObject = result.firstObject {
                        let assetResources = PHAssetResource.assetResources(for: firstObject)
                        selectedFileName = assetResources.first?.originalFilename ?? ""
                    }
                }
            }
            print(selectedFileName)
            if type == .camera{
                if let getURL = videourl{
                    self?.saveVideToPhotoLibrary(videoPath: getURL)
                    self?.callVideoFunction(videoURL: getURL, result: { urll, fileName in
                        result(urll,self?.imageName ?? "")
                        self?.dismiss(animated: true)
                    })
                }else{
                    self?.dismiss(animated: true)
                }
            }else{
                if let getURL = videourl{
                    result(getURL,selectedFileName)
                }
                self?.dismiss(animated: true)
            }
        }.didCancel { [weak self] in
            self?.dismiss(animated: true)
        }
        self.present(pickerController, animated: true)
    }

    func showCamera(type:UIImagePickerController.SourceType, result: @escaping (_ image: UIImage,_ fileName:String) -> ()){
        let pickerController = UIImagePickerController()
        pickerController.sourceType = type
        pickerController.mediaTypes = [kUTTypeImage as String]
        pickerController.allowsEditing = true
        pickerController.didFinishPickingMedia { [weak self] info in
            var selectedFileName = ""
            if #available(iOS 11.0, *) {
                if let imageUrl = info[.imageURL] as? URL {
                    selectedFileName = imageUrl.lastPathComponent
                }
            } else {
                if let imageURL = info[.referenceURL] as? URL {
                    let result = PHAsset.fetchAssets(withALAssetURLs: [imageURL], options: nil)
                    if let firstObject = result.firstObject {
                        let assetResources = PHAssetResource.assetResources(for: firstObject)
                        selectedFileName = assetResources.first?.originalFilename ?? ""
                    }
                }
            }
            print(selectedFileName)
            if let photo = info[.phAsset] as? PHAsset{
                let filename = photo.value(forKey: "filename") as? String ?? ""
                print(filename)
            }
            var profileImage = UIImage()
            if let editedImage = info[UIImagePickerController.InfoKey.editedImage] as? UIImage{
                profileImage = editedImage
            }else if let originalImage = info[UIImagePickerController.InfoKey.originalImage] as? UIImage{
                profileImage = originalImage
            }
            if type == .camera{
                self?.saveImageToPhotoLibrary(image: profileImage)
                self?.callFunction(image: profileImage, result: { image, fileName in
                    result(profileImage,self?.imageName ?? "")
                })
            }else{
                result(profileImage,selectedFileName)
                self?.dismiss(animated: true)
            }
        }.didCancel { [weak self] in
            self?.dismiss(animated: true)
        }
        self.present(pickerController, animated: true)
    }
    func callFunction(image:UIImage,result: @escaping (_ image: UIImage,_ fileName:String) -> ()){
        delay(1.0, function: {
            if self.imageName.isEmpty{
                self.imageName = "IMG_2935.MOV"
            }
            result(image,self.imageName)
        })
    }
    func callVideoFunction(videoURL:URL,result: @escaping (_ urll: URL,_ fileName:String) -> ()){
        delay(1.0, function: {
            if self.imageName.isEmpty{
                self.imageName = "VIDEO_2935.MOV"
            }
            result(videoURL,self.imageName)
        })
    }
    func saveVideToPhotoLibrary(videoPath: URL) {
        PHPhotoLibrary.shared().performChanges({
            PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: videoPath)
        }) { saved, error in
            if saved {
                self.fetchAssetInfo()
            }
        }
    }

    func saveImageToPhotoLibrary(image: UIImage) {
           UIImageWriteToSavedPhotosAlbum(image, self, #selector(image(_:didFinishSavingWithError:contextInfo:)), nil)
       }

       @objc func image(_ image: UIImage, didFinishSavingWithError error: NSError?, contextInfo: UnsafeRawPointer) {
           if let error = error {
               // Handle the save error
               print("Error saving image to photo library: \(error.localizedDescription)")
           } else {
               // Image saved successfully, fetch the asset information
               fetchAssetInfo()
           }
       }

       func fetchAssetInfo() {
           let fetchOptions = PHFetchOptions()
           fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]

           let fetchResult = PHAsset.fetchAssets(with: .video, options: fetchOptions)

           if let lastAsset = fetchResult.firstObject {
               // Get the filename from the asset
               let assetResources = PHAssetResource.assetResources(for: lastAsset)
               if let filename = assetResources.first?.originalFilename {
                   print("Image saved with filename: \(filename)")
                   self.imageName = filename
               }
           }
       }
    func saveImage(image: UIImage, fileName: String) {
        guard let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            // Handle the case where the documents directory couldn't be retrieved
            return
        }
        // Append the filename to the documents directory
        let fileURL = documentsDirectory.appendingPathComponent(fileName)
        // Convert the image to data
        if let imageData = image.jpegData(compressionQuality: 1.0) {
            do {
                try imageData.write(to: fileURL)
                print("Image saved at \(fileURL.absoluteString)")
            } catch {
                print("Error saving image: \(error.localizedDescription)")
            }
        }
    }
}
extension UIViewController{
    func showImagePicker(result: @escaping (_ image: UIImage, _ isGallery : Bool,_ name:String) -> ()){
        let vc = TSImagePickerVC(nibName: "TSImagePickerVC", bundle: nil)
        vc.imagePicked = { (image,isGallery,name) in
            result(image,isGallery,name)
            self.dismiss(animated: true, completion: nil)
        }
        vc.modalPresentationStyle = .overFullScreen
        self.present(vc, animated: true, completion: nil)
    }
    func showVideoPicker(result: @escaping (_ url: URL,_ name:String) -> ()){
        let vc = TSImagePickerVC(nibName: "TSImagePickerVC", bundle: nil)
        vc.videoPicked = { (url,name) in
            result(url,name)
            self.dismiss(animated: true, completion: nil)
        }
        vc.modalPresentationStyle = .overFullScreen
        self.present(vc, animated: true, completion: nil)
    }
    func showImageOptionPicker(result: @escaping (_ image: UIImage, _ type: Int, _ isGallery : Bool,_ name:String) -> ()){
        let vc = TSImagePickerVC(nibName: "TSImagePickerVC", bundle: nil)
        vc.imagePicked = { (image,isGallery,name) in
            result(image,1,isGallery,name)
            self.dismiss(animated: true, completion: nil)
        }
        vc.itemPicked = { item,isGallery in
            result(UIImage(),item,isGallery, "")
            self.dismiss(animated: true, completion: nil)
        }
        vc.modalPresentationStyle = .overFullScreen
        self.present(vc, animated: true, completion: nil)
    }
}
