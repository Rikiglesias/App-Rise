const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function ensureIosFile(modConfig, relPath, contents) {
  const iosRoot = modConfig.modRequest.platformProjectRoot;
  const filePath = path.join(iosRoot, relPath);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, contents);
}

const OBJC_IMPL = `#import <React/RCTBridgeModule.h>\n#import <UIKit/UIKit.h>\n\n@interface DisplayZoom : NSObject <RCTBridgeModule>\n@end\n\n@implementation DisplayZoom\n\nRCT_EXPORT_MODULE();\n\nRCT_REMAP_METHOD(getDisplayZoomFactor,\n                 getDisplayZoomFactorWithResolver:(RCTPromiseResolveBlock)resolve\n                 rejecter:(RCTPromiseRejectBlock)reject)\n{\n  @try {\n    UIScreen *screen = [UIScreen mainScreen];\n    CGFloat pointsCurrent = MIN(screen.bounds.size.width, screen.bounds.size.height);\n    CGFloat pointsBase = (MIN(screen.nativeBounds.size.width, screen.nativeBounds.size.height)) / screen.scale;\n    CGFloat factor = 1.0;\n    if (pointsCurrent > 0.0 && pointsBase > 0.0) {\n      factor = pointsBase / pointsCurrent;\n    }\n    resolve(@(factor));\n  } @catch (NSException *exception) {\n    resolve(@(1.0));\n  }\n}\n\n@end\n`;

module.exports = function withDisplayZoom(config) {
  config = withDangerousMod(config, ['ios', modConfig => {
    // Scrivi file sorgente
    ensureIosFile(modConfig, 'DisplayZoom/DisplayZoom.m', OBJC_IMPL);
    return modConfig;
  }]);

  config = withXcodeProject(config, modConfig => {
    try {
      const proj = modConfig.modResults;
      const file = 'DisplayZoom/DisplayZoom.m';
      // Evita duplicati
      const already = proj.hasFile(file);
      if (!already) {
        proj.addSourceFile(file, { target: proj.getFirstTarget().uuid });
      }
    } catch (e) {
      // best-effort
    }
    return modConfig;
  });

  return config;
};
