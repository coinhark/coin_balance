import React, {Component} from 'react';
import {ScrollView, RefreshControl, TouchableOpacity, Clipboard, Text, View, StyleSheet, Alert, Image, AsyncStorage, ActivityIndicator, Keyboard} from 'react-native';
import {FormLabel, FormInput, Button, Card} from 'react-native-elements';
import GlobalConstants from '../globals';
import CoinManager from '../coinmanager';
import DBHelper from '../dbhelper';
import Numbers from '../utils/numbers';
import Icon from 'react-native-vector-icons/Ionicons';

export default class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalBalance: 0.00000000,
            valueInDollars: 0.00,
            currentPrice: 0.00,
            marketCap: 0.00,
            dailyChange: 0.00,
            dailyVolume: 0.00,
            circulatingSupply: 0.00,
            loaded: false,
            refreshing: false,
            apiError: null,
            db: {
                "balanceInfo": {
                    "name": "Coinhark API",
                    "date": "1318464000",
                    "totalBalance": "0.00000000",
                    "addresses": []
                },
                "exchange": {
                    "price": 0.00,
                    "date": "1318464000",
                    "name": "CoinMarketCap API"
                }
            }
        }
        this.globals = GlobalConstants;
        this.coinManager = new CoinManager();
        this.dbhelper = new DBHelper();
    }

    componentDidMount() {
        // Hard reset of db for dev
        //AsyncStorage.removeItem("db");
        this.initView();
        Keyboard.dismiss();
     }

     initView = () => {
         this.setState({loaded: false, refresh: true});
         AsyncStorage.getItem("db").then((value) => {
             if (value == null) {
                 // init db
                 AsyncStorage.setItem("db", JSON.stringify(this.dbhelper.bareDb));
                 console.log("Creating new db of: " + JSON.stringify(this.state.db));
                 this.setState({db: this.dbhelper.bareDb})
                 console.log("db state is now bare: " + JSON.stringify(this.state.db));
                 this.getMarketData();
                 this.setState({loaded: true, refreshing: false});
             } else {
                 this.setState({db: JSON.parse(value)});
                 console.log("db state is now: " + JSON.stringify(this.state.db));
                 if (this.state.db.balanceInfo.addresses.length > 0) {
                     console.log(`HTTP: ${this.coinManager.getBlockchainApi().url + JSON.stringify(this.state.db.balanceInfo.addresses)}`);
                     Promise.all(this.state.db.balanceInfo.addresses.map(o =>
                         fetch(this.coinManager.getBlockchainApi().url + o.inputAddress).then(resp => resp.json())
                     )).then(json => {
                         json = this.coinManager.formatBlockchainApiResponse(json);
                         if (!Array.isArray(json) || json[0].balance == null) {
                             console.log(`Unexpected result from ${this.coinManager.getBlockchainApi().name} API.`);
                             this.setState({apiError: `Unexpected result from ${this.coinManager.getBlockchainApi().name} API.`});
                         }
                         let ret = json.reduce((agg, elem) => {
                             var tmpDb = this.state.db;
                             tmpDb.balanceInfo.addresses.forEach((a) => {
                                 if (a.inputAddress == elem.addrStr) {
                                     a.totalBalance = elem.balance;
                                 }
                             });
                             tmpDb.balanceInfo.name = this.coinManager.getBlockchainApi().name;
                             tmpDb.balanceInfo.date = new Date().getTime().toString();
                             this.setState({db: tmpDb});
                             AsyncStorage.setItem("db", JSON.stringify(tmpDb));
                             console.log("db state is now: " + JSON.stringify(this.state.db));
                             return agg + parseFloat(elem.balance);
                         }, 0);
                         this.setState({totalBalance: ret});
                     }).then(bal => {
                         console.log(`HTTP: ${this.coinManager.getMarketApi().url}`);
                         this.getMarketData();
                     }).catch(error => {
                         this.setState({apiError: `Error connecting to the ${this.coinManager.getBlockchainApi().name} API.`});
                         console.log(`Error connecting to the ${this.coinManager.getBlockchainApi().name} API.`);
                     });
                 } else {
                     this.getMarketData();
                     this.setState({loaded: true, refreshing: false});
                 }
             }
         }).done();
     }

     getMarketData() {
         fetch(this.coinManager.getMarketApi().url)
             .then(response => response.json())
             .then(responseJson => {
                 console.log('Coinmarketcap: ' + JSON.stringify(responseJson));
                 responseJson = this.coinManager.formatMarketApiResponse(responseJson);
                 if (!Array.isArray(responseJson) || responseJson[0].price_usd == null) {
                     console.log(`Unexpected result from ${this.coinManager.getMarketApi().name} API.`);
                     this.setState({apiError: `Unexpected result from ${this.coinManager.getMarketApi().name} API.`});
                 }
                 let exchange = {
                     "dailyChange": responseJson[0].percent_change_24h,
                     "dailyVolume": responseJson[0]['24h_volume_usd'],
                     "marketCap": responseJson[0].market_cap_usd,
                     "price": responseJson[0].price_usd,
                     "circulatingSupply": responseJson[0].available_supply,
                     "name": this.coinManager.getMarketApi().name,
                     "date": new Date().getTime().toString()
                 }
                 if (exchange.dailyChange.includes('-')) {
                     this.dailyChangeColor = '#B35B63';
                 } else {
                     this.dailyChangeColor = '#7BC087';
                     this.changeIcon = <Text style={{fontSize: 18, color: '#7BC087'}}>+</Text>;
                 }
                 let value = Numbers.formatPrice(this.state.totalBalance * exchange.price, 'US');
                 let price = exchange.price;
                 console.log('The price is ' + exchange.price);
                 let tmpDb = this.state.db;
                 tmpDb.exchange = exchange;
                 this.setState({
                     valueInDollars: value,
                     dailyChange: exchange.dailyChange,
                     dailyVolume: exchange.dailyVolume,
                     marketCap: exchange.marketCap,
                     circulatingSupply: exchange.circulatingSupply,
                     currentPrice: price,
                     loaded: true,
                     refreshing: false,
                     db: tmpDb
                 });
                 AsyncStorage.setItem("db", JSON.stringify(this.state.db));
                 console.log("db state after exchange is now: " + JSON.stringify(this.state.db));
             })
             .catch(error => {
                 this.setState({apiError: `Error connecting to the ${this.coinManager.getMarketApi().name} API.`});
                 console.log(`Error connecting to the ${this.coinManager.getMarketApi().name} API`);
             });
     }

    _onRefresh() {
        this.setState({refreshing: true});
        console.log('refreshing');
    }

    static navigationOptions = ({navigate, navigation}) => ({
        title: GlobalConstants.getAppName(),
        headerLeft: null,
        gesturesEnabled: false,
        headerStyle: { backgroundColor: '#0C1C26' },
        headerTitleStyle: { color: '#ffffff' }
    })

    render() {
        const {navigate} = this.props.navigation;

        return (
                <ScrollView style={styles.darkBackground} horizontal={false}
                            refreshControl={
                                <RefreshControl
                                    enabled={true}
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => this.initView()}
                                />
                            }>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: .9, paddingTop: 40, paddingBottom: 1}}>
                            <Text style={styles.attrTitle}>ADDRESS BALANCES</Text>
                        </View>
                    </View>
                    <View style={styles.flatWrapTop}>
                        <View style={styles.card}>
                        <View style={{flex: 0.35, flexDirection: 'row', paddingTop: 6, paddingBottom: 6}}>
                            <Image style={styles.symbol} source={this.coinManager.getAssets().symbol}/>
                            <Text style={styles.coinLabelBalance}>{this.coinManager.getCoinName()}</Text>
                        </View>
                            <View style={ !this.state.loaded ? {flex: 0.55, alignItems: 'flex-end', paddingTop: 16} : { display : 'none' }}>
                                <ActivityIndicator style={styles.viewTitleSpinner} size="small" color="#2196f3" />
                            </View>
                            <View style={ this.state.loaded ? {flex: 0.55, alignItems: 'flex-end', paddingTop: 8} : {display : 'none' }}>
                            <Text style={styles.coinType}>{Numbers.formatBalance(this.state.totalBalance, 'US')} {this.coinManager.getCoinTicker()}</Text>
                            <Text style={styles.viewTitleSM}>${this.state.valueInDollars} USD</Text>
                        </View>
                    </View>
                    </View>
                    <View style={ this.state.apiError ? { flex: 1, flexDirection: row } : { display: 'none'} }>
                        <Text style={{color: 'red'}}>An unexpected error has occurred, please try again.</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: .9, paddingBottom: 1}}>
                            <Text style={styles.attrTitle}>MANAGE ADDRESSES</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => navigate('ManageAddresses')} style={styles.flatWrapTop}>
                        <View style={styles.card}>
                            <View style={{flex: 0.45, flexDirection: 'row', alignItems: 'flex-start', paddingTop: 14, paddingBottom: 14}}>
                                <Text style={styles.viewTitleSM}>Tracking {this.state.db.balanceInfo.addresses.length} addresses</Text>
                            </View>
                            <View style={{flex: 0.4, alignItems: 'flex-end', paddingTop: 15, paddingBottom: 14}}>
                                <Text style={styles.viewTitleSM}>Edit Addresses</Text>
                            </View>
                            <View style={{flex: 0.05, alignItems: 'flex-end', paddingTop: 12, paddingBottom: 14}}>
                                <Icon style={{fontSize: 20, color: '#4C7891', paddingTop: 4}} name="ios-arrow-forward"/>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{flex: .9, paddingBottom: 1}}>
                            <Text style={styles.attrTitle}>MARKET PRICES (USD)</Text>
                        </View>
                    </View>
                    <View style={styles.flatWrapTop}>
                        <View style={styles.card}>
                            <View style={{flex: 0.45, flexDirection: 'column', paddingTop: 8, paddingBottom: 8}}>
                                <Text style={styles.coinType}>{this.coinManager.getCoinName()}</Text>
                                <Text style={styles.viewTitleSM}>{this.coinManager.getCoinTicker()}</Text>
                            </View>
                            <View style={ !this.state.loaded ? {flex: 0.45, alignItems: 'flex-end', paddingTop: 16} : { display : 'none' }}>
                                <ActivityIndicator style={styles.viewTitleSpinner} size="small" color="#2196f3" />
                            </View>
                            <View style={ this.state.loaded ? {flex: 0.45, alignItems: 'flex-end', paddingTop: 9} : { display: 'none' }}>
                                    <Text style={styles.coinType}>${this.globals.roundTwoDecimals(this.state.currentPrice)}</Text>
                                <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 14, color:this.dailyChangeColor}}>{this.changeIcon}{this.state.dailyChange}%</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.flatWrapTop}>
                        <View style={styles.pricing}>
                            <View style={{flex: 0.45, alignItems: 'flex-end'}}>
                                <Text style={styles.marketTitle}>MARKET CAP</Text>
                                <Text style={styles.marketTitle}>24H VOLUME</Text>
                                <Text style={styles.marketTitle}>CIRCULATING SUPPLY</Text>
                            </View>
                            <View style={ !this.state.loaded ? {flex: 0.45, alignItems: 'center', paddingTop: 14} : { display : 'none' }}>
                                <ActivityIndicator style={styles.viewTitleSpinner} size="small" color="#2196f3" />
                            </View>
                            <View style={ this.state.loaded ? {flex: 0.45, alignItems: 'flex-start'} : { display: 'none' }}>
                                <Text style={styles.marketData}>${Numbers.formatPriceWhole(this.state.marketCap)}</Text>
                                <Text style={styles.marketData}>${Numbers.formatPriceWhole(this.state.dailyVolume)}</Text>
                                <Text style={styles.marketData}>{Numbers.formatPriceWhole(this.state.circulatingSupply)} {this.coinManager.getCoinTicker()}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.donateContainer}>
                        <Text style={styles.donateTitle}>Donate to our {this.coinManager.getCoinName()} development</Text>
                        <Text selectable={true} style={styles.donateAddress}>{this.coinManager.getCoinDonationAddress()}</Text>
                    </View>
                </ScrollView>
            );
        }
    }

const styles = StyleSheet.create({
    darkBackground: {
        backgroundColor: '#0C212D'
    },
    card: {
        backgroundColor: '#0F2B3A',
        flex: 0.90,
        flexDirection: 'row',
        padding: 15,
        borderRadius:4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    pricing: {
        flex: 0.9,
        flexDirection: 'row'
    },
    currentPrice: {
        color: '#fff',
        fontSize: 18,
        paddingTop: 8
    },
    flatWrapTop: {
        marginTop: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    flatWrapBottom: {
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        marginTop: 28,
        marginBottom: 28,
        color: '#DC143C'
    },
    viewTitleSpinner: {

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
    coinLabelBalance : {
        paddingTop: 12,
        paddingLeft: 4,
        fontSize: 16,
        textAlign: 'left',
        color: '#ffffff',
    },
    donateContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
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
        fontSize: 12
    }
});
