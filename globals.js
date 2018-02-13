'use strict'

class GlobalConstants {

    constructor() {

    }

    // Edit this for cointype (Ex: ltc, btc, etc)
    static getAppCoin() {
      return 'eth';
    }

    static getAppName() {
      switch(GlobalConstants.getAppCoin()) {
        case 'ltc':
          return "Litecoin Balance";
        case 'btc':
          return "Bitcoin Balance";
        case 'eth':
          return "Ethereum Balance";
        case 'xlm':
          return "Stellar Balance";
      }
    }
}

export default GlobalConstants;
