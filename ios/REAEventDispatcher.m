#import <RNReanimated/REAEventDispatcher.h>
#import <RNReanimated/REAModule.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTDefines.h>

@implementation REAEventDispatcher

- (void)sendEvent:(id<RCTEvent>)event
{
  __weak static REAModule *reaModule;
  __weak static RCTBridge *lastBridge;
  RCTBridge *bridge = [self bridge];
  if (bridge != lastBridge) {
    reaModule = [bridge moduleForName:@"ReanimatedModule"];
    lastBridge = bridge;
  }
  [reaModule eventDispatcherWillDispatchEvent:event];
  [super sendEvent:event];
}

+ (NSString *)moduleName
{
  return NSStringFromClass([RCTEventDispatcher class]);
}

@end
