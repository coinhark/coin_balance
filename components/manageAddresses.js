import React, { Component } from 'react';
import { RefreshControl, Clipboard, Text, View,  ScrollView, StyleSheet, Alert, AsyncStorage, ActivityIndicator, Keyboard } from 'react-native';
import { FormLabel, FormInput, Button, Card } from 'react-native-elements'
import GlobalConstants from '../globals';
import CoinManager from '../coinmanager';
import renderIf from '../utils/renderIf.js';
import Swipeout from 'react-native-swipeout';
import Numbers from '../utils/numbers';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class ManageAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addressBalance: '',
            valueInDollars: '',
            loading: true,
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
        this.wallets = [];
        this.coinManager = new CoinManager();
    }

    componentDidMount() {
        Keyboard.dismiss();
        this.initView();
    }

    static navigationOptions = ({ navigate, navigation }) => ({
        title: 'Manage Accounts',
        gesturesEnabled: false,
        headerLeft: <Icon name="home" style={styles.leftButton} onPress={() =>{ navigation.navigate('Home'); }} />,
        headerRight: <Icon name="add" style={styles.rightButton} onPress={() =>{ navigation.navigate('AddAddress')}}/>,
        headerStyle: { backgroundColor: '#0C1C26' },
        headerTitleStyle: { color: '#f7f7f7' }
    })

    initView = () => {
        this.setState({loaded: false});
        AsyncStorage.getItem("db").then((value) => {
            this.setState({"db": JSON.parse(value)});
            console.log("db state is now: " + value);
            let tmpDb = this.state.db;
            fetch(this.coinManager.getMarketApi().url)
                .then(response => response.json())
                .then(responseJson => {
                    tmpDb.exchange.price = responseJson[0].price_usd;
            })
            Promise.all(this.state.db.balanceInfo.addresses.map(o =>
                fetch(this.coinManager.getBlockchainApi().url + o.inputAddress).then(resp => resp.json())
            )).then(json => {
                    if(!Array.isArray(json) || json[0].balance == null) {
                        console.log(`Unexpected result from ${this.coinManager.getBlockchainApi().name} API.`);
                        this.setState({ apiError: `Unexpected result from ${this.coinManager.getBlockchainApi().name} API.`});
                    }
                json.forEach((element, index) => {
                    const path = tmpDb.balanceInfo.addresses[index];
                    path.totalBalance = Numbers.formatBalance(element.balance, 'US');
                    path.valueInDollars = Numbers.formatPrice(tmpDb.exchange.price * element.balance, 'US');
                })
                this.setState({ db: tmpDb});
                AsyncStorage.setItem("db", JSON.stringify(tmpDb));
                console.log("db state is now: " + JSON.stringify(this.state.db));
            }).catch(error => {
                this.setState({ apiError: `Error connecting to the ${this.coinManager.getBlockchainApi().name} API.`});
                console.log(`Error connecting to the ${this.coinManager.getBlockchainApi().name} API.`);
            });
            this.setState({loading: false, refreshing: false});
        }).done()
    }

    refreshState = () => {
        this.setState({ loading: true });
        this.initView();
    }

    copyToClipboard = async (address) => {
        Clipboard.setString(address);
        alert(address + ' copied to clipboard.');
    }

    deleteAddress = (address) => {
        let copy = this.state.db;
        let lotto = copy.balanceInfo.addresses.filter(wallet => {
            return wallet.address !== address;
        });
        copy.balanceInfo.addresses = lotto;
        this.setState({db: copy})
        AsyncStorage.setItem("db", JSON.stringify(this.state.db));
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView style={styles.darkBackground} horizontal={false}
                        refreshControl={
                            <RefreshControl
                                enabled={true}
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.initView()}
                            />
                        }>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingTop: 10,
                        paddingBottom: 10
                    }}>
                    </View>
                    {renderIf(this.state.db.balanceInfo.addresses.length == 0, <View>
                        <Icon name="add-alert" style={styles.addressIcon} fadeDuration={100} />
                        <Text style={styles.noAddress}>It looks like you don't have any accounts yet.</Text>
                        <Text style={styles.noAddress}>You can add one below.</Text>
                    </View>)}
                    {
                        this.state.db.balanceInfo.addresses.map((w, i) => {
                            let swipeoutBtns = [
                                {
                                    text: 'Copy',
                                    backgroundColor: '#2196f3',
                                    underlayColor: '#2196f3',
                                    onPress: () => {this.copyToClipboard(w.address)},
                                },
                                {
                                    text: 'Delete',
                                    backgroundColor: '#FC3D38',
                                    underlayColor: '#FC3D38',
                                    onPress: () => {this.deleteAddress(w.address)},
                                }
                            ]
                            return (
                                    <View key={i} style={styles.card}>
                                        <Swipeout
                                            autoClose={true}
                                            backgroundColor={'#0F2B3A'}
                                            right={swipeoutBtns}
                                            buttonWidth={80}
                                        >
                                        <Text key={i + '-text'} numberOfLines={1} ellipsizeMode='tail' style={styles.addressName}>{w.name}</Text>
                                            <Text style={styles.addressBalance}>{Numbers.formatLongBalance(w.totalBalance)}
                                                <Text style={{fontWeight: '100'}}> {this.coinManager.getCoinTicker()}</Text>
                                            </Text>
                                            <Text style={styles.addressBalance}>${w.valueInDollars}
                                                <Text style={{fontWeight: '100'}}> USD</Text>
                                            </Text>
                                        <Text selectable={true} style={styles.addressText}>{w.address}</Text>
                                        </Swipeout>
                                    </View>
                            );
                        })
                    }
                    <Button
                        containerViewStyle={styles.buttonStyle}
                        onPress={() => navigate('AddAddress', {ltcPrice: this.state.ltcPrice})}
                        raised
                        backgroundColor={'#0E82AB'}
                        title='Add Account'
                    />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    darkBackground: {
        backgroundColor: '#0C212D'
    },
    address: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#4C7891',
        borderTopWidth: 1,
        borderTopColor: '#4C7891',
        marginLeft: 14
    },
    card: {
        backgroundColor: '#0F2B3A',
        borderRadius:4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        paddingLeft: 18,
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 6
    },
    cardTitle: {
        color: '#4C7891',
        fontWeight: '700',
        fontSize: 14,
        marginTop: 15,
        textAlign: 'center'
    },
    addressName: {
        fontSize: 16,
        marginTop: 8,
        marginBottom: 1,
        fontWeight: 'bold',
        color: '#ffffff'
    },
    addressBalance: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 1,
        color: '#ffffff'
    },
    addressText: {
        fontSize: 12,
        marginBottom: 8,
        color: '#ffffff'
    },
    addressIcon: {
        fontSize: 50,
        color: '#f7f7f7',
        textAlign: 'center',
        marginBottom: 14,
        marginTop: 20
    },
    noAddress: {
        fontSize: 12,
        textAlign: 'center',
        alignItems: 'center',
        color: '#f7f7f7'
    },
    buttonStyle: {
        marginTop: 20,
    },
    refreshButton: {
        fontSize: 24,
        color: '#f7f7f7',
        textAlign: 'right',
    },
    spinner: {
        marginLeft: 50
    },
    rightButton: {
        marginRight: 16,
        fontSize: 26,
        color: '#4C7891',
    },
    leftButton: {
        marginLeft: 16,
        fontSize: 26,
        color: '#4C7891',
    },
});
