# iOS Share Extension Implementation Guide

## Strategic Intent

> Umarise should feel like signing something you were already holding — not like opening a place where something begins.

The app appears in the iOS Share Sheet as an **action**, not a destination.

---

## User Experience Flow

```
📷 iOS Camera / Photos / Files
    ↓
⬆️ Tap Share
    ↓
┌─────────────────────────────┐
│  Mark as Beginning          │  ← Primary action label
│  Umarise                    │  ← Attribution (subtle)
└─────────────────────────────┘
    ↓
✨ Brief haptic + "Marked." overlay (≤2s)
    ↓
🫥 Returns to previous context
```

---

## Technical Architecture

### Components Required

1. **Share Extension** (Native iOS - Swift)
   - Receives image from Share Sheet
   - Computes SHA-256 hash
   - Stores to App Group container
   - Shows minimal "Marked" UI
   - Dismisses automatically

2. **App Group** (iOS Entitlement)
   - Shared container between extension and main app
   - Allows data sync when main app opens later

3. **Main App Sync** (Capacitor/Web)
   - On launch, checks App Group for pending items
   - Syncs to Supabase backend
   - Clears processed items

---

## Implementation Steps

### Step 1: Xcode Project Setup

After exporting to GitHub and opening in Xcode:

```bash
# In your Xcode project
1. File → New → Target → Share Extension
2. Name: "MarkAsBeginning"
3. Enable App Groups capability on both targets
4. Create shared App Group: "group.app.lovable.umarise"
```

### Step 2: Share Extension Code (Swift)

Create `ShareViewController.swift`:

```swift
import UIKit
import Social
import MobileCoreServices
import CryptoKit

class ShareViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor.black.withAlphaComponent(0.9)
        
        // Haptic feedback
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        
        // Show "Marked." label
        let label = UILabel()
        label.text = "Marked."
        label.textColor = UIColor(red: 0.85, green: 0.75, blue: 0.55, alpha: 1.0) // codex-gold
        label.font = UIFont(name: "Georgia", size: 32) ?? UIFont.systemFont(ofSize: 32, weight: .medium)
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
        
        // Process the shared image
        processSharedImage()
        
        // Auto-dismiss after 1.5 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
        }
    }
    
    private func processSharedImage() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else { return }
        
        if itemProvider.hasItemConformingToTypeIdentifier(kUTTypeImage as String) {
            itemProvider.loadItem(forTypeIdentifier: kUTTypeImage as String, options: nil) { [weak self] (item, error) in
                guard let url = item as? URL,
                      let imageData = try? Data(contentsOf: url) else { return }
                
                self?.saveToAppGroup(imageData: imageData)
            }
        }
    }
    
    private func saveToAppGroup(imageData: Data) {
        // Compute SHA-256 hash
        let hash = SHA256.hash(data: imageData)
        let hashString = hash.compactMap { String(format: "%02x", $0) }.joined()
        
        // Save to App Group
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.app.lovable.umarise"
        ) else { return }
        
        let timestamp = ISO8601DateFormatter().string(from: Date())
        let filename = "\(timestamp)_\(hashString.prefix(16)).jpg"
        let fileURL = containerURL.appendingPathComponent("pending").appendingPathComponent(filename)
        
        try? FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        
        try? imageData.write(to: fileURL)
        
        // Save metadata
        let metadata: [String: Any] = [
            "hash": hashString,
            "capturedAt": timestamp,
            "filename": filename
        ]
        
        let metadataURL = fileURL.deletingPathExtension().appendingPathExtension("json")
        if let jsonData = try? JSONSerialization.data(withJSONObject: metadata) {
            try? jsonData.write(to: metadataURL)
        }
    }
}
```

### Step 3: Info.plist for Share Extension

```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionAttributes</key>
    <dict>
        <key>NSExtensionActivationRule</key>
        <dict>
            <key>NSExtensionActivationSupportsImageWithMaxCount</key>
            <integer>10</integer>
        </dict>
    </dict>
    <key>NSExtensionMainStoryboard</key>
    <string>MainInterface</string>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.share-services</string>
</dict>
```

### Step 4: Capacitor Plugin for App Group Access

Create a custom Capacitor plugin to read pending items from App Group:

```swift
// In ios/App/App/Plugins/AppGroupPlugin.swift
import Capacitor

@objc(AppGroupPlugin)
public class AppGroupPlugin: CAPPlugin {
    
    @objc func getPendingItems(_ call: CAPPluginCall) {
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.app.lovable.umarise"
        ) else {
            call.resolve(["items": []])
            return
        }
        
        let pendingURL = containerURL.appendingPathComponent("pending")
        
        guard let files = try? FileManager.default.contentsOfDirectory(
            at: pendingURL,
            includingPropertiesForKeys: nil
        ) else {
            call.resolve(["items": []])
            return
        }
        
        var items: [[String: Any]] = []
        
        for file in files where file.pathExtension == "json" {
            if let data = try? Data(contentsOf: file),
               let metadata = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                items.append(metadata)
            }
        }
        
        call.resolve(["items": items])
    }
    
    @objc func clearPendingItem(_ call: CAPPluginCall) {
        guard let filename = call.getString("filename"),
              let containerURL = FileManager.default.containerURL(
                forSecurityApplicationGroupIdentifier: "group.app.lovable.umarise"
              ) else {
            call.reject("Invalid filename")
            return
        }
        
        let pendingURL = containerURL.appendingPathComponent("pending")
        let imageURL = pendingURL.appendingPathComponent(filename)
        let metadataURL = imageURL.deletingPathExtension().appendingPathExtension("json")
        
        try? FileManager.default.removeItem(at: imageURL)
        try? FileManager.default.removeItem(at: metadataURL)
        
        call.resolve()
    }
}
```

---

## Share Sheet Appearance

### Display Name
In Share Extension's `Info.plist`:
```xml
<key>CFBundleDisplayName</key>
<string>Mark as Beginning</string>
```

### Icon
- 60x60pt icon for Share Sheet
- Should be the "U" seal mark, minimal
- Transparent background

---

## What Lovable Can Prepare Now

1. **ProcessingView** - Already done (the "Marked" certificate UI)
2. **Sync logic** - Check for pending App Group items on app launch
3. **Backend** - Ready to receive shared items

---

## Design Rules (Binding)

| Rule | Implementation |
|------|----------------|
| No navigation after share | Extension dismisses automatically |
| No explanation | Just "Marked." — nothing else |
| No confirmation button | Auto-dismiss after 1.5s |
| No branding prominence | "Mark as Beginning" primary, "Umarise" subtle |
| Haptic feedback | Success notification on share |

---

## Success Criteria

> If the user feels they "went somewhere", Umarise failed.

The Share Extension must feel like:
- Signing something
- A stamp received
- A breath taken
- Done

Not like:
- Starting something
- Managing something  
- Saving something

---

## Next Steps

1. Export project to GitHub
2. Open in Xcode
3. Add Share Extension target
4. Configure App Groups
5. Implement ShareViewController
6. Test on physical device
