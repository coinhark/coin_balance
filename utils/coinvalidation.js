'use strict'
import WAValidator from 'wallet-address-validator';

class CoinValidation {

    constructor() {
        this.bitcoin = require('bitcoinjs-lib');
        this.ethereum = require('ethereum-address');
    }

    isLegacySegwitOrMultisig(address, coin) {
      if (address.startsWith('3')) {
          const decoded = this.bitcoin.address.fromBase58Check(address);
          let version = decoded.version;
          if (version === 5) {
              return true;
          } else {
              console.log(`Warning: This address version ${version} is not known`);
              return false;
          }
      }
      return false;
    }

    isSegwit(address, coin) {
      if (address.startsWith('M')) {
          const decoded = this.bitcoin.address.fromBase58Check(address);
          let version = decoded.version;
          if (version === 50) {
              return true;
          } else {
              console.log(`Warning: This address version ${version} is not known`);
              return false;
          }
      }
      return false;
    }

    isBech(address, coin) {
      console.log(`Warning: bech support not implemented`);
      return false;
    }

    convertFromLegacySegwitOrMultisig(address, coin) {
      if(this.isLegacySegwitOrMultisig(address, coin)) {
        const decoded = this.bitcoin.address.fromBase58Check(address);
        let version = decoded.version;
        if (version === 5) {
            version = 50;
        }
        return this.bitcoin.address.toBase58Check(decoded['hash'], version);
      } else {
        return address;
      }
    }

    convertToLegacySegwitOrMultisig(address, coin) {
      if(this.isSegwit(address, coin)) {
        const decoded = this.bitcoin.address.fromBase58Check(address);
        let version = decoded.version;
        if (version === 50) {
            version = 5;
        }
        return this.bitcoin.address.toBase58Check(decoded['hash'], version);
      } else {
        return address;
      }
    }

    processAndValidateBitcoinBasedCoin(addressObj, coin, component) {
      let validationAddress = component.state.address;
      if(this.isLegacySegwitOrMultisig(validationAddress, coin)) {
          addressObj.inputAddress = this.convertFromLegacySegwitOrMultisig(validationAddress, coin);
      }
      if(this.isSegwit(validationAddress, coin)) {
          validationAddress = this.convertToLegacySegwitOrMultisig(validationAddress, coin)
      }
      console.log(`Validating ${coin.toUpperCase()} address ${validationAddress}`);
      let valid = WAValidator.validate(validationAddress, coin.toUpperCase());
      if (valid) {
          let tmpDb = component.state.db;
          tmpDb.balanceInfo.addresses.push(addressObj);
          component.setState({db: tmpDb});
          component.props.navigation.navigate('ManageAddresses');
          return true;
      } else {
          component.setState({invalidAddress: true});
          return false;
      }
    }

    isEthereumAddressValid(address) {
      return this.ethereum.isChecksumAddress(address);
    }

    processAndValidateEthereum(addressObj, coin, component) {
      let validationAddress = component.state.address;
      console.log(`Validating ${coin} address ${validationAddress}`);
      if(this.isEthereumAddressValid(validationAddress)) {
          let tmpDb = component.state.db;
          tmpDb.balanceInfo.addresses.push(addressObj);
          component.setState({db: tmpDb});
          component.props.navigation.navigate('ManageAddresses');
          return true;
      } else {
          component.setState({invalidAddress: true});
          return false;
      }
    }

    processAndValidateEOS(addressObj, coin, component) {
      let validationAddress = component.state.address;
      console.log(`Validating ${coin} address ${validationAddress}`);
      if(true) {
          let tmpDb = component.state.db;
          tmpDb.balanceInfo.addresses.push(addressObj);
          component.setState({db: tmpDb});
          component.props.navigation.navigate('ManageAddresses');
          return true;
      } else {
          component.setState({invalidAddress: true});
          return false;
      }
    }

    processAndValidateAddress(addressObj, coin, component) {
      if(coin.toLowerCase() == 'ltc'.toLowerCase()) {
        return this.processAndValidateBitcoinBasedCoin(addressObj, coin, component);
      } else if(coin.toLowerCase() == 'eth'.toLowerCase()) {
        return this.processAndValidateEthereum(addressObj, coin, component);
      } else if(coin.toLowerCase() == 'xlm'.toLowerCase()) {
          component.setState({invalidAddress: true});
          return false;
      } else {
          console.log(`Error: Unknown coin: ${coin}`);
          return false;
      }
    }
}

export default CoinValidation;
