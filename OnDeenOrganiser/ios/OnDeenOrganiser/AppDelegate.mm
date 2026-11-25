#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"OnDeenOrganiser";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
  BOOL useBundledJS = [[[[NSProcessInfo processInfo] environment] objectForKey:@"ONDEEN_IOS_USE_BUNDLED_JS"] boolValue];
#if DEBUG
  if (!useBundledJS) {
  NSString *host = [[[NSProcessInfo processInfo] environment] objectForKey:@"RCT_METRO_HOST"];
  NSString *port = [[[NSProcessInfo processInfo] environment] objectForKey:@"RCT_METRO_PORT"];

  if (host.length == 0) {
    host = @"localhost";
  }

  if (port.length == 0) {
    port = @"8082";
  }

  NSString *bundleURL = [NSString stringWithFormat:@"http://%@:%@/index.bundle?platform=ios&dev=true&minify=false", host, port];
  return [NSURL URLWithString:bundleURL];
  }
#endif
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
}

@end
