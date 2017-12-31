{
  "name": "litecoin_balance",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "node node_modules/react-native/local-cli/cli.js start",
    "postinstall": "./node_modules/.bin/rn-nodeify --install buffer,events,process,stream,util,inherits,fs,path --hack",
    "android-linux": "react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res && react-native run-android",
    "test": "jest",
    "bundle-ios": "react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/app/src/main/assets/index.android.bundle --assets-dest ios/app/src/main/res"
  },
  "dependencies": {
    "assert": "1.4.1",
    "asyncstorage-down": "^3.0.0",
    "bitcoinjs-lib": "^3.3.1",
    "bs58check": "^2.1.1",
    "buffer": "5.0.8",
    "events": "^1.1.1",
    "path-browserify": "0.0.0",
    "process": "^0.11.10",
    "prop-types": "^15.6.0",
    "react": "16.0.0",
    "react-native": "0.51.0",
    "react-native-camera": "git+https://github.com/lwansbrough/react-native-camera.git#b263bef2892c8c98ec81820dc87dc7ecd61ea5a4",
    "react-native-elements": "^0.18.5",
    "react-native-level-fs": "^3.0.0",
    "react-native-pull-refresh": "^1.0.0",
    "react-native-swipe-list-view": "^0.4.7",
    "react-native-swipeout": "^2.3.3",
    "react-native-vector-icons": "^4.4.3",
    "react-navigation": "^1.0.0-beta.22",
    "readable-stream": "^1.0.33",
    "rn-nodeify": "8.2.0",
    "stream": "0.0.2",
    "stream-browserify": "^1.0.0",
    "util": "^0.10.3",
    "wallet-address-validator": "^0.1.1"
  },
  "devDependencies": {
    "babel-jest": "22.0.4",
    "babel-preset-react-native": "4.0.0",
    "jest": "22.0.4",
    "react-test-renderer": "16.0.0"
  },
  "react-native": {
    "path": "path-browserify",
    "fs": "react-native-level-fs",
    "_stream_transform": "readable-stream/transform",
    "_stream_readable": "readable-stream/readable",
    "_stream_writable": "readable-stream/writable",
    "_stream_duplex": "readable-stream/duplex",
    "_stream_passthrough": "readable-stream/passthrough",
    "stream": "stream-browserify"
  },
  "browser": {
    "path": "path-browserify",
    "fs": "react-native-level-fs",
    "_stream_transform": "readable-stream/transform",
    "_stream_readable": "readable-stream/readable",
    "_stream_writable": "readable-stream/writable",
    "_stream_duplex": "readable-stream/duplex",
    "_stream_passthrough": "readable-stream/passthrough",
    "stream": "stream-browserify"
  },
  "jest": {
    "preset": "react-native"
  }
}
