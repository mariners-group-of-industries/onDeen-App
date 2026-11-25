# OnDeen User Swift App

## First-time setup on a Mac

Install the full **Xcode** app from the Mac App Store first. Open Xcode once,
accept Apple's license, and let Xcode finish installing its components.

Then open Terminal and run:

```bash
cd /path/to/onDeenApp/OnDeenUserSwiftApp
chmod +x setup.sh run-ios.sh
./setup.sh
```

The setup script installs and checks:

- Xcode's active developer tools
- Homebrew
- CocoaPods
- an iOS Simulator runtime
- an iPhone simulator
- this project's locked CocoaPods dependencies

It does not build the app or open the Simulator. Keep Terminal open and follow
any password, license, installation, or macOS approval prompt. If a dialog
finishes after the script stops, run `./setup.sh` again.

Running `./setup.sh` again is safe and reuses dependencies that are already
installed. When setup finishes, run:

```bash
./run-ios.sh
```

## Normal daily run

```bash
./run-ios.sh
```

Choose `d` to launch the installed app directly or `r` to rebuild and reinstall
it. The script uses `iPhone 17 Pro` when available and automatically falls back
to another available iPhone simulator.

The normal terminal output is intentionally short. Full Xcode/CocoaPods output
is saved under `.ios-run/`; it is shown only when a build or dependency step
fails.
