Obiettivo: aggiungere il modulo nativo iOS "DisplayZoom" per esporre `getDisplayZoomFactor()`.

Prerequisiti
- Esegui: `npx expo prebuild -p ios` per generare il progetto Xcode.
- Usa un Dev Client o EAS Build (Expo Go non carica moduli nativi custom).

File da aggiungere in Xcode (nel target dell'app)

1) ios/DisplayZoom/DisplayZoom.m
---------------------------------
```
#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

@interface DisplayZoom : NSObject <RCTBridgeModule>
@end

@implementation DisplayZoom

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(getDisplayZoomFactor,
                 getDisplayZoomFactorWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    UIScreen *screen = [UIScreen mainScreen];
    CGFloat pointsCurrent = MIN(screen.bounds.size.width, screen.bounds.size.height);
    CGFloat pointsBase = (MIN(screen.nativeBounds.size.width, screen.nativeBounds.size.height)) / screen.scale;
    CGFloat factor = 1.0;
    if (pointsCurrent > 0.0 && pointsBase > 0.0) {
      factor = pointsBase / pointsCurrent; // 1.0 = Norm, >1.0 = Display Zoom
    }
    resolve(@(factor));
  } @catch (NSException *exception) {
    resolve(@(1.0));
  }
}

@end
```

2) Se usi Swift, alternativa (facoltativa): ios/DisplayZoom/DisplayZoom.swift
--------------------------------------------------------------------------
```
import Foundation
import UIKit

@objc(DisplayZoom)
class DisplayZoom: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }
}

extension DisplayZoom: RCTBridgeModule {
  static func moduleName() -> String! { "DisplayZoom" }

  @objc(getDisplayZoomFactor:rejecter:)
  func getDisplayZoomFactor(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    do {
      let screen = UIScreen.main
      let pointsCurrent = min(screen.bounds.size.width, screen.bounds.size.height)
      let pointsBase = min(screen.nativeBounds.size.width, screen.nativeBounds.size.height) / screen.scale
      let factor = (pointsCurrent > 0 && pointsBase > 0) ? (pointsBase / pointsCurrent) : 1.0
      resolve(factor)
    } catch {
      resolve(1.0)
    }
  }
}
```

3) Bridging Header (solo Swift)
- Se richiesto, aggiungi un bridging header e importa `#import <React/RCTBridgeModule.h>`.

Registrazione
- Non serve ulteriore registrazione manuale: il nome modulo `DisplayZoom` è esposto e può essere richiamato da JS via `NativeModules.DisplayZoom.getDisplayZoomFactor()`.

Verifica
- Ricostruisci il Dev Client iOS.
- Avvia l'app, verifica nei log la riga "DisplayZoom initialized" con `nativeAvailable: true` e `displayZoomFactor` > 1.0 quando il Display Zoom è attivo.

