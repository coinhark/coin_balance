import React, {Component} from 'react';
import {ScrollView, RefreshControl, Clipboard, Text, View, StyleSheet, Alert, Image, AsyncStorage, ActivityIndicator, Keyboard} from 'react-native';
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
                     "name": this.coinManager.getMarketApi().name,
                     "date": new Date().getTime().toString()
                 }
                 if (exchange.dailyChange.includes('-')) {
                     this.dailyChangeColor = '#e74c3c';
                     this.changeIcon = <Icon style={{fontSize: 20, color: '#e74c3c'}} name="ios-arrow-round-down"/>;
                 } else {
                     this.dailyChangeColor = '#27ae60';
                     this.changeIcon = <Icon style={{fontSize: 18, color: '#27ae60'}} name="ios-arrow-round-up"/>;
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
        headerStyle: { backgroundColor: '#39679A' },
        headerTitleStyle: { color: '#ffffff' }
    })

    render() {
        const {navigate} = this.props.navigation;

        let visibletext = null;
        if(this.state.loaded) {
            visibletext = (
                <ScrollView style={styles.darkBackground}>
                    <View style={styles.flatWrapTop}>
                        <Image style={styles.symbol} source={this.coinManager.getAssets().symbol}/>
                        <Text style={styles.subTitle}>TOTAL BALANCE:</Text>
                        <Text style={styles.coinType}>{Numbers.formatBalance(this.state.totalBalance, 'US')} {this.coinManager.getCoinTicker()}</Text>
                        <Text style={styles.viewTitleL}>${this.state.valueInDollars} USD</Text>
                    </View>
                    <View style={styles.currentPrice}>
                        <Text style={{color: '#0c0c0c'}}>Market Price: ${this.globals.roundTwoDecimals(this.state.currentPrice)}</Text>
                    </View>
                    <View style={styles.priceInfo}>
                        <View style={styles.price}>
                            <Text style={{color: '#0c0c0c'}}>24H Volume</Text>
                            <Text style={{color: '#0c0c0c', fontWeight: 'bold'}}>{this.state.dailyVolume}</Text>
                        </View>
                        <View style={styles.price}>
                            <Text style={{color: '#0c0c0c', fontSize: 12}}>24H Change</Text>
                            <Text style={{color: '#0c0c0c', fontWeight: 'bold', fontSize: 16, color:this.dailyChangeColor}}>{this.changeIcon} {this.state.dailyChange}%</Text>
                        </View>
                        <View style={styles.price}>
                            <Text style={{color: '#0c0c0c'}}>Market Cap</Text>
                            <Text style={{color: '#0c0c0c', fontWeight: 'bold'}}>{(this.state.marketCap)}</Text>
                        </View>
                    </View>
                    <View>
                        <Button
                            raised
                            onPress={() => navigate('ManageAddresses')}
                            backgroundColor={'#2196f3'}
                            title='Manage Addresses'
                        />
                    </View>
                </ScrollView>
                /*<ScrollView>
                    <View style={styles.flatWrapTop}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Image style={styles.symbol} source={this.coinManager.getAssets().symbol}/>
                            <Text style={styles.viewTitleL}>Current Price: {this.state.currentPrice}</Text>
                        </View>
                        <Text style={styles.viewTitleL}>Total Balance: {Numbers.formatBalance(this.state.totalBalance, 'US')} {this.coinManager.getCoinTicker()}</Text>
                        <Text wrapperStyle={styles.card} style={styles.viewTitleSM}>${this.state.valueInDollars} USD</Text>
                    </View>
                    <View style={styles.flatWrapBottom}>
                        <Button
                            raised
                            onPress={() => navigate('ManageAddresses')}
                            backgroundColor={'#2196f3'}
                            title='Manage Addresses'
                        />
                    </View>
                </ScrollView>*/
            );
        } else {
            visibletext = (
                <Card wrapperStyle={styles.card} title="Welcome">
                    <Image style={styles.symbol} source={this.coinManager.getAssets().symbol}/>
                    <Text style={styles.viewTitleL}>Total Balance</Text>
                    <ActivityIndicator style={styles.viewTitleSpinner} size="small" color="#2196f3" />
                    <Button
                        raised
                        onPress={() => navigate('ManageAddresses')}
                        backgroundColor={'#2196f3'}
                        title='Manage Addresses'
                    />
                </Card>
            );
        }

        if(this.state.apiError != null) {
            visibletext = (
                <Card wrapperStyle={styles.card} title="Welcome">
                    <Image style={styles.symbol} source={this.coinManager.getAssets().symbol}/>
                    <Text style={styles.viewTitleL}>Total Balance</Text>
                    <Text style={styles.error} size="small">{this.state.apiError}</Text>
                    <Text style={styles.refresh} size="small" onPress={() => this.initView()}>Refresh Now</Text>
                    <Button
                        raised
                        onPress={() => navigate('ManageAddresses')}
                        backgroundColor={'#2196f3'}
                        title='Manage Addresses'
                    />
                </Card>
            );
        }

        return (
            <ScrollView style={styles.darkBackground} horizontal={false}
                        refreshControl={
                            <RefreshControl
                                enabled={true}
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.initView()}
                            />
                        }>
                { visibletext }
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
        backgroundColor: '#3A5A86'
    },
    card: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0
    },
    priceInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7',
        borderWidth: 1,
        borderTopColor: '#cccccc',
        paddingTop: 12,
        paddingBottom: 12,
        marginBottom: 28
    },
    price: {
        flex: .3,
        alignItems: 'center',
    },
    currentPrice: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        paddingTop: 16,
        paddingBottom: 16
    },
    flatWrapTop: {
        backgroundColor: '#3A5A86',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        zIndex: 99
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
        marginTop: 28,
        marginBottom: 28
    },
    subTitle: {
        color: '#ffffff',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 14
    },
    coinType: {
        color: '#fff',
        fontSize: 18
    },
    viewTitleL: {
        marginTop: 3,
        marginBottom: 10,
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
        fontSize: 14,
        textAlign: 'left',
        color: '#ffffff',
    },
    donateContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 36,
        backgroundColor: '#f7f7f7'
    },
    donateTitle: {
        margin: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#ffffff',
        marginBottom: 4
    },
    donateAddress: {
        margin: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#ffffff',
        marginBottom: 8,
    },
    rightButton: {
        marginRight: 16,
        fontSize: 26,
        color: '#555555',
    },
    symbol: {
        marginTop: 30,
        marginBottom: 10,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    }
    /*<Text style={styles.viewTitleSM}>Total Balance: {Numbers.formatBalance(this.state.totalBalance, 'US')} {this.coinManager.getCoinTicker()}</Text>
                            <Text style={styles.viewTitleSM}>${this.state.valueInDollars} USD</Text>*/
});
