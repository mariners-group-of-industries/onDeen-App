//
//  Toast.swift
//  AwaitToast
//
//  Created by DongHeeKang on 28/02/2019.
//  Copyright © 2019 k-lpmg. All rights reserved.
//
import UIKit

public class Toast: ToastCompatiable {
    
    // MARK: - Properties
    
    static var operationQueue: OperationQueue = {
        let queue = OperationQueue()
        queue.name = "com.k-lpmg.Toast.operationQueue"
        return queue
    }()
    
    // MARK: - Class methods
    
    public class func latestDismiss() {
        operationQueue.operations.last?.cancel()
    }
    
    public class func dismissAll() {
        operationQueue.cancelAllOperations()
    }
    
    // MARK: - Public methods
    
    public func show() {
        toastAbstractMethod()
    }
    
    public func dismiss() {
        toastAbstractMethod()
    }
    
}
