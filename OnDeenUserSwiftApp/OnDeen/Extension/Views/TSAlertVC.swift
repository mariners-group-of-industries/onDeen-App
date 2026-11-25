//
//  TSAlertVC.swift
//  Bloss
//
//  Created by IMCRINOX on 10/06/22.
//

import UIKit

class TSAlertVC: UIViewController {
    @IBOutlet weak var bgView: UIView!
    @IBOutlet weak var btnCancel: UIButton!
    @IBOutlet weak var btnSubmit: UIButton!
    @IBOutlet weak var lblMessage: UILabel!
    var itemTapped : ((Bool,Int) -> Void)?
    typealias tsAlertCompletionBlock  = (_ isCancelled: Bool, _ tag:Int) -> Void
    var pickerCompletion: tsAlertCompletionBlock?

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.init(red: 31.0/255.0, green: 31.0/255.0, blue: 31.0/255.0, alpha: 0.5)
    }
    func configView(_ title:String,_ yesTitle:String,_ noTitle:String,_ tag:Int){
        mainThread { [self] in
            lblMessage.text = title.localized
            btnSubmit.setTitle(yesTitle.localized, for: .normal)
            btnCancel.setTitle(noTitle.localized, for: .normal)
            self.view.tag = tag
            if noTitle.isEmpty{
                btnCancel.isHidden = true
            }
            btnSubmit.onTap {
                self.pickerCompletion?(false,self.view.tag)
                if tag != 50{
                    self.dismiss(animated: true)
                }
            }
            btnCancel.onTap {
                self.pickerCompletion?(true,self.view.tag)
                self.dismiss(animated: true)
            }
        }
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        btnCancel.config(borderColor: .DB_3171, borderWidth: 1.0, isRoundCorner: true)
        btnSubmit.config(borderColor: .clear, borderWidth: 0.0, isRoundCorner: true)
        bgView.setCornerRadius([.topLeft,.topRight], radius: 20.0)
    }
}
extension UIViewController{
    
    func showTSAlert(_ title:String,_ yesTitle:String,_ noTitle:String,_ tag:Int, result: @escaping (_ isCancelled: Bool, _ tag:Int) -> ()){
        mainThread {
            let vc = TSAlertVC(nibName: "TSAlertVC", bundle: nil)
            vc.view.bounds = self.view.bounds
            vc.configView(title, yesTitle, noTitle, tag)
            vc.modalPresentationStyle = .overFullScreen
            vc.pickerCompletion = { (isCancel,tag) in
                result(isCancel,tag)
            }
            self.present(vc, animated: true, completion: nil)
        }
    }
    
    func showYesnoAlertWithClosure(title:String,type:Int,vc:UIViewController,completionHandler: @escaping (Bool) -> Void){
//        DispatchQueue.main.async {
            self.showTSAlert(title, "Yes", "No", type) { isCancelled, tag in
                completionHandler(!isCancelled)
            }
    }
    func showForceAlert(link:String,msg:String){
        DispatchQueue.main.async {
            self.showTSAlert(msg, "OK", "", 0) { isCancelled, tag in
                if !isCancelled{
                    self.openBrowser(urlString: link)
                }
            }
        }
    }
    func showSimpleAlert(withTitle title: String,vc:UIViewController,type:Int) {
//        if isSessionExpired && type == 15{
//            return
//        }
//        if type == 15{
//            isSessionExpired = true
//        }
//        DispatchQueue.main.async {
            self.showTSAlert(title, "Ok", "", type) { isCancelled, tag in
                if !isCancelled{
                    if tag == 5{
                        self.dismissVC()
                    }else if tag == 10{
//                        self.setRootController(identifier: NavigationHelper.homeVC)
                    }else if tag == 15{
                        let lastVersion = UserDefaults.standard.string(forKey: AppVersionManager.lastVersionKey)
                        let val = UserDefaults.standard.object(forKey: "langg") as? String ?? ""
//                        isSessionExpired = false
                        UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)
                        UserDefaults.standard.synchronize()
                        UserDefaults.standard.set(lastVersion, forKey: AppVersionManager.lastVersionKey)
                        UserDefaults.standard.synchronize()
                        LoginRequest.instance.registerInitToken { status in
                            self.setRootController(board: .authentication, identifier: .loginVC)
                        }
//                        self.setRootController(board: .authentication, identifier: .loginVC)
                    }else if tag == 50{
                        if let vc = topViewController(){
                            vc.openBrowser(urlString: APIURLType.storeURL.rawValue)
                        }
                    }
                }
            }
    }
}
