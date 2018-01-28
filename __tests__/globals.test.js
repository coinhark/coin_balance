import GlobalConstants from '../globals';

test('GlobalConstants getAppCoin test', () => {
  expect(GlobalConstants.getAppCoin()).toBe("ltc");
});

test('GlobalConstants getAppCoin test', () => {
  expect(GlobalConstants.getAppName()).toBe("Litecoin Balance");
});
