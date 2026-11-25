#import "AppDelegate.h"
#import <GoogleMaps/GoogleMaps.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [GMSServices provideAPIKey:@"AIzaSyAwhW-oxoIPQo_lbiO5Izr7m2Sal6h51os"];
  self.moduleName = @"OnDeen";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  [FIRApp configure];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  NSString *useBundledJS = [[[NSProcessInfo processInfo] environment] objectForKey:@"ONDEEN_IOS_USE_BUNDLED_JS"];
  if ([useBundledJS isEqualToString:@"1"]) {
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  }

  NSString *host = [[[NSProcessInfo processInfo] environment] objectForKey:@"RCT_METRO_HOST"];
  NSString *port = [[[NSProcessInfo processInfo] environment] objectForKey:@"RCT_METRO_PORT"];

  if (host.length == 0) {
    host = @"localhost";
  }

  if (port.length == 0) {
    port = @"8081";
  }

  NSString *bundleURL = [NSString stringWithFormat:@"http://%@:%@/index.bundle?platform=ios&dev=true&minify=false", host, port];
  return [NSURL URLWithString:bundleURL];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

@end
