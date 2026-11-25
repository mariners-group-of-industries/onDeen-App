//
//  ToastBehaviorManager.swift
//  Example
//
//  Created by DongHeeKang on 04/03/2019.
//  Copyright © 2019 k-lpmg. All rights reserved.
//
import UIKit

public enum ToastBehaviorManager {
    public static var `default` = DefaultToastBehavior.shared
    public static var await = AwaitToastBehavior.shared
}
