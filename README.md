# Coin Balance

Coin Balance is a react-native app designed for iOS and Android.

## Getting started
This project requires a coinmainager.js file to be in the root.  This file often contains private data so must be managed on a per-project basis.  We provide a sample file to get your project building, however endpoints will need to be supplied:  

```javascript
'use strict'
import WAValidator from 'wallet-address-validator';
import { AsyncStorage } from 'react-native';
import CoinValidation from './utils/coinvalidation';
import GlobalConstants from './globals';

class CoinManager {

    constructor() {
        this.bitcoin = require('bitcoinjs-lib');
        this.ethereum = require('ethereum-address');
        this.validation = new CoinValidation();

        this.coin = GlobalConstants.getAppCoin();

        this.coinInfo = {
            "ltc": {
                "name": "Litecoin",
                "ticker": "LTC",
                "donation": "LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj"
            },
            "btc": {
                "name": "Bitcoin",
                "ticker": "BTC",
                "donation": "1B2efQ6jikK7MnAGimZb77JgvCBVJQziLS"
            }
        };

        this.marketApi = {
            "ltc": {
                "name": "Market-LTC",
                "url": 'https://api.someLTCMarketAPI.example'
            },
            "btc": {
                "name": "Market-BTC",
                "url": 'https://api.someBTCMarketAPI.example'
            }
        };

        this.blockchainApi = {
            "ltc": {
                "name": "Coinhark-LTC",
                "url": 'https://api.someLTCBlockchainAPI.example/addr/'
            },
            "btc": {
                "name": "Coinhark-BTC",
                "url": 'https://api.someBTCBlockchainAPI.example/addr/'
            }
        };

        // Until require can handle non-literal strings, we do this. =/
        this.assets = {
          "ltc": {
            "symbol": require("./assets/images/litecoin_symbol.png")
          },
          "btc": {
            "symbol": require("./assets/images/litecoin_symbol.png")
          }
        }
    }

    getCoinName() {
        return this.coinInfo[this.coin].name;
    }

    getCoinTicker() {
        return this.coinInfo[this.coin].ticker;
    }

    getCoinDonationAddress() {
        return this.coinInfo[this.coin].donation;
    }

    getMarketApi() {
        return this.marketApi[this.coin];
    }

    getBlockchainApi() {
        return this.blockchainApi[this.coin];
    }

    getAssets() {
        return this.assets[this.coin];
    }

    formatMarketApiResponse(json) {
      if(this.coin == 'ltc') {
        return json;
      } else if(this.coin == 'btc') {
        return json;
      } else {
        console.log("error: unknown coin: " + this.coin);
        return {};
      }
    }

    formatBlockchainApiResponse(json) {
      if(this.coin == 'ltc') {
        return json;
      } else if(this.coin == 'btc') {
        return json;
      } else {
        console.log("error: unknown coin: " + this.coin);
        return {};
      }
    }

    validateAddress(addressObj, component) {
      if(this.coin == 'ltc') {
        return this.validation.processAndValidateBitcoinBasedCoin(addressObj, this.coin, component);
      } else if(this.coin == 'btc') {
        return this.validation.processAndValidateBitcoinBasedCoin(addressObj, this.coin, component);
      } else {
          console.log(`Error: Unknown coin: ${coin}`);
          return false;
      }
    }
}

export default CoinManager;
```

## How to run with Android Studio
Simply open the android project found in litecoin_balance/android

## How to run with Linux (Ubuntu tested)

```bash
npm install
npm run run-android-linux
```
For some reason, I sometimes have to run ```npm run run-android-linux``` twice

Also, on occasion I will get an error of "Error: Watchman error: A non-recoverable condition has triggered.  Watchman needs your help!"

In that case I just run:

```bash
./scripts/reset_watchman.sh
```


## How to run with mac
Coming soon

## How to run tests
```bash
npm run test
```

## Purpose
The app is meant to simply aggregate the balances of cryptocurrency addresses, and is designed to be flexible for any cryptocurrency.

## To Do

A list of additions and improvements:

* [x] Add README.md
* [ ] Use BigDecimal library and handle decimal precision issues better
* [ ] Correct bug where app crashes when invalid address is entered
* [ ] display market price on main view
* [ ] add different fiat prices
* [ ] add locale feature for different target languages
* [ ] add option to manually enter balance apart from a specific address
