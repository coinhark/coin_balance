import CoinValidation from '../utils/coinvalidation';
import DBHelper from '../dbhelper';

const validation = new CoinValidation();
const dbhelper = new DBHelper();

test('Verify isSegwit', () => {
  expect(validation.isSegwit('LXzhwSyYhTxZt4piVs7KvYPAWKDdXvMTNo', 'ltc')).toBe(false);
  expect(validation.isSegwit('3KvR7SFUaERoraUQeC2Hv2Zct47T271BB9', 'ltc')).toBe(false);
  expect(validation.isSegwit('34rGEjZDogQWG6jJ8cXcQykLGh8BcUsMaq', 'ltc')).toBe(false);
  expect(validation.isSegwit('MC4K5c2x6rcVohDBLrLNQRsqL5atuzztot', 'ltc')).toBe(true);
  expect(validation.isSegwit('M9rnNAQFvFFnRaccSGM3Y7EQfBgZssW3BD', 'ltc')).toBe(true);
  expect(validation.isSegwit('4a', 'ltc')).toBe(false);
});

test('Verify isLegacySegwit', () => {
  expect(validation.isLegacySegwitOrMultisig('LXzhwSyYhTxZt4piVs7KvYPAWKDdXvMTNo', 'ltc')).toBe(false);
  expect(validation.isLegacySegwitOrMultisig('3KvR7SFUaERoraUQeC2Hv2Zct47T271BB9', 'ltc')).toBe(true);
  expect(validation.isLegacySegwitOrMultisig('34rGEjZDogQWG6jJ8cXcQykLGh8BcUsMaq', 'ltc')).toBe(true);
  expect(validation.isLegacySegwitOrMultisig('MC4K5c2x6rcVohDBLrLNQRsqL5atuzztot', 'ltc')).toBe(false);
  expect(validation.isLegacySegwitOrMultisig('M9rnNAQFvFFnRaccSGM3Y7EQfBgZssW3BD', 'ltc')).toBe(false);
});

test('Verify convertFromLegacySegwitOrMultisig', () => {
  expect(validation.isSegwit(validation.convertFromLegacySegwitOrMultisig('3KvR7SFUaERoraUQeC2Hv2Zct47T271BB9', 'ltc'))).toBe(true);
  // true even though not converted
  expect(validation.isSegwit(validation.convertFromLegacySegwitOrMultisig('MC4K5c2x6rcVohDBLrLNQRsqL5atuzztot', 'ltc'))).toBe(true);
  expect(validation.isSegwit(validation.convertFromLegacySegwitOrMultisig('34rGEjZDogQWG6jJ8cXcQykLGh8BcUsMaq', 'ltc'))).toBe(true);
  expect(validation.isSegwit(validation.convertFromLegacySegwitOrMultisig('LXzhwSyYhTxZt4piVs7KvYPAWKDdXvMTNo', 'ltc'))).toBe(false);
});

test('Verify convertToLegacySegwitOrMultisig', () => {
  // true even though not converted
  expect(validation.isLegacySegwitOrMultisig(validation.convertToLegacySegwitOrMultisig('3KvR7SFUaERoraUQeC2Hv2Zct47T271BB9', 'ltc'))).toBe(true);
  expect(validation.isLegacySegwitOrMultisig(validation.convertToLegacySegwitOrMultisig('MC4K5c2x6rcVohDBLrLNQRsqL5atuzztot', 'ltc'))).toBe(true);
  expect(validation.isLegacySegwitOrMultisig(validation.convertToLegacySegwitOrMultisig('M9rnNAQFvFFnRaccSGM3Y7EQfBgZssW3BD', 'ltc'))).toBe(true);
  expect(validation.isLegacySegwitOrMultisig(validation.convertToLegacySegwitOrMultisig('LXzhwSyYhTxZt4piVs7KvYPAWKDdXvMTNo', 'ltc'))).toBe(false);
});

test('Verify validateAddress', () => {
  let component = {};
  component['state'] = {};
  component['props'] = {};
  component.props['navigation'] = {};
  component.props.navigation['navigate'] = function(object) {};
  component['setState'] = function(object) {};
  component.state['db'] = dbhelper.bareDb;
  var addressObj = {
    "address":"",
    "inputAddress":"",
    "name":"Donations",
    "totalBalance":"0.05769462",
    "valueInDollars":"10.43"
  }

  component.state['address'] = "MC4K5c2x6rcVohDBLrLNQRsqL5atuzztot";
  expect(validation.processAndValidateAddress(addressObj, 'ltc', component)).toBe(true);

  component.state['address'] = "3KvR7SFUaERoraUQeC2Hv2Zct47T271BB9";
  expect(validation.processAndValidateAddress(addressObj, 'ltc', component)).toBe(true);

  component.state['address'] = "M9rnNAQFvFFnRaccSGM3Y7EQfBgZssW3BD";
  expect(validation.processAndValidateAddress(addressObj, 'ltc', component)).toBe(true);

  component.state['address'] = "LXzhwSyYhTxZt4piVs7KvYPAWKDdXvMTNo";
  expect(validation.processAndValidateAddress(addressObj, 'ltc', component)).toBe(true);

  component.state['address'] = "LXzhwSyYhTxZt4piVs7KvYPAWKDdXvMTN2";
  expect(validation.processAndValidateAddress(addressObj, 'ltc', component)).toBe(false);
});

test('Verify isEthereumAddressValid', () => {
  expect(validation.isEthereumAddressValid('0x8617E340B3D01FA5F11F306F4090FD50E238070D')).toBe(true);
  expect(validation.isEthereumAddressValid('0xbcA1D1ee93827d26bD3e5CCb4E193C792489a172')).toBe(true);
  expect(validation.isEthereumAddressValid('bcA1D1ee93827d26bD3e5CCb4E193C792489a172')).toBe(true);
  expect(validation.isEthereumAddressValid('8617E340B3D01FA5F11F306F4090FD50E238070D')).toBe(true);
  expect(validation.isEthereumAddressValid('0xAF')).toBe(false);
  expect(validation.isEthereumAddressValid('LXzhwSyYhTxZt4piVs7KvYPAWKDdXvMTN2')).toBe(false);
});
