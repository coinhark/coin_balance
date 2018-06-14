'use strict'
import {
    StyleSheet
} from 'react-native';

class CoinStyles {

    getStyle(coin) {
        switch (coin) {
            case 'ltc':
                return this.defaultStyle;
            case 'btc':
                return this.defaultStyle;
            case 'eth':
                return this.defaultStyle;
            case 'xlm':
                return this.defaultStyle;
            case 'eos':
                return this.eosStyle;
        }
    }

    constructor() {

        this.defaultStyle = StyleSheet.create({
            darkBackground: {
                backgroundColor: '#0C212D'
            },
            card: {
                backgroundColor: '#0F2B3A',
                flex: 0.90,
                flexDirection: 'row',
                justifyContent: 'center',
                padding: 15,
                borderRadius: 4,
                shadowOffset: {
                    width: 0,
                    height: 2
                },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            pricing: {
                flex: .75,
                justifyContent: 'center',
                flexDirection: 'row'
            },
            currentPrice: {
                color: '#fff',
                fontSize: 18,
                paddingTop: 8
            },
            error: {
                marginTop: 28,
                marginBottom: 28,
                color: '#DC143C'
            },
            subTitle: {
                textAlign: 'left',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: 14
            },
            coinType: {
                color: '#fff',
                fontSize: 16,
            },
            viewTitleL: {
                fontSize: 18,
                fontWeight: '200',
                textAlign: 'left',
                color: '#ffffff',
            },
            viewTitle: {
                margin: 5,
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'left',
                color: '#ffffff',
            },
            viewTitleSM: {
                paddingTop: 3,
                fontSize: 14,
                textAlign: 'left',
                color: '#ffffff',
            },
            coinLabelBalance: {
                paddingTop: 12,
                paddingLeft: 4,
                fontSize: 16,
                textAlign: 'left',
                color: '#ffffff',
            },
            donateContainer: {
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#0C212D'
            },
            donateTitle: {
                margin: 5,
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#f7f7f7',
                marginBottom: 1
            },
            donateAddress: {
                margin: 5,
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#f7f7f7',
                marginBottom: 8,
            },
            symbol: {
                width: 40,
                height: 40,
                alignItems: 'flex-start',
            },
            marketData: {
                paddingLeft: 4,
                paddingBottom: 3,
                color: '#ffffff',
                fontSize: 12
            },
            marketTitle: {
                paddingRight: 4,
                paddingBottom: 3,
                color: '#4C7891',
                fontWeight: '700',
                fontSize: 12
            },
            attrTitle: {
                color: '#4C7891',
                fontWeight: '700',
                fontSize: 12,
                paddingBottom: 6
            }
        });

        this.eosStyle = StyleSheet.create({
            darkBackground: {
                backgroundColor: '#0C212D'
            },
            card: {
                backgroundColor: '#4C7891',
                flex: 0.90,
                flexDirection: 'row',
                justifyContent: 'center',
                padding: 15,
                borderRadius: 4,
                shadowOffset: {
                    width: 0,
                    height: 2
                },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            pricing: {
                flex: .75,
                justifyContent: 'center',
                flexDirection: 'row'
            },
            currentPrice: {
                color: '#fff',
                fontSize: 18,
                paddingTop: 8
            },
            error: {
                marginTop: 28,
                marginBottom: 28,
                color: '#DC143C'
            },
            subTitle: {
                textAlign: 'left',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: 14
            },
            coinType: {
                color: '#fff',
                fontSize: 16,
            },
            viewTitleL: {
                fontSize: 18,
                fontWeight: '200',
                textAlign: 'left',
                color: '#ffffff',
            },
            viewTitle: {
                margin: 5,
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'left',
                color: '#ffffff',
            },
            viewTitleSM: {
                paddingTop: 3,
                fontSize: 14,
                textAlign: 'left',
                color: '#ffffff',
            },
            coinLabelBalance: {
                paddingTop: 12,
                paddingLeft: 4,
                fontSize: 16,
                textAlign: 'left',
                color: '#ffffff',
            },
            donateContainer: {
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#0C212D'
            },
            donateTitle: {
                margin: 5,
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#f7f7f7',
                marginBottom: 1
            },
            donateAddress: {
                margin: 5,
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#f7f7f7',
                marginBottom: 8,
            },
            symbol: {
                width: 40,
                height: 40,
                alignItems: 'flex-start',
            },
            marketData: {
                paddingLeft: 4,
                paddingBottom: 3,
                color: '#ffffff',
                fontSize: 12
            },
            marketTitle: {
                paddingRight: 4,
                paddingBottom: 3,
                color: '#4C7891',
                fontWeight: '700',
                fontSize: 12
            },
            attrTitle: {
                color: '#4C7891',
                fontWeight: '700',
                fontSize: 12,
                paddingBottom: 6
            }
        });
    }
}

export default CoinStyles;
