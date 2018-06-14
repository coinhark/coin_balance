import React, { Component } from 'react';
import { Text, TextInput, View, ScrollView, StyleSheet, Alert, AsyncStorage } from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button, Card } from 'react-native-elements'
import GlobalConstants from '../globals';
import CoinManager from '../coinmanager';
import renderIf from '../utils/renderIf.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DBHelper from '../dbhelper';

require('../shim');

export default class AddAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            address: '',
            ltcPrice: '',
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
            },
            text: 'useless',
            nameDirty: false,
            addressDirty: false,
            invalidAddress: false,
            addressExists: false
        };
        this.coinManager = new CoinManager();
        this.dbhelper = new DBHelper();
    }

    componentWillMount() {
        AsyncStorage.getItem("db").then((value) => {
            this.setState({"db": JSON.parse(value)});
        }).done();

        if (this.props.navigation.state != null && this.props.navigation.state.params != null) {
            this.setState({"address": this.props.navigation.state.params.scanned});
            console.log("Setting address state from params.scanned: " + this.props.navigation.state.params.scanned);
        }
    }

    static navigationOptions = ({navigate, navigation}) => ({
        title: 'Add Account',
        gesturesEnabled: false,
        headerLeft: <Icon name="keyboard-backspace" style={styles.leftButton} onPress={() => {
            navigation.navigate('ManageAddresses');
        }}/>,
        /*
        headerRight: <Icon name="qrcode" style={styles.rightButton} onPress={() => {
            navigation.navigate('Scanner');
        }}/>,
        */
        headerStyle: { backgroundColor: '#0C1C26' },
        headerTitleStyle: { color: '#f7f7f7' }
    })

    _checkDisabled = () => {
        return disabled = this.state.address === '' || this.state.name === '';
    }

    _submitAddress = () => {
        let address = {
            "address": this.state.address,
            "inputAddress": this.state.address,
            "name": this.state.name
        }
        if (this.state.db.balanceInfo.addresses.find(o => o.address === this.state.address)) {
            this.setState({addressExists: true});
        } else {
          this.coinManager.validateAddress(address, this);
          // Save changes from processAndValidateAddress()
          this.dbhelper.save("db", JSON.stringify(this.state.db));
        }
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView style={styles.darkBackground}>
                <FormLabel labelStyle={{color: '#4C7891'}}>Account</FormLabel>
                <FormInput
                    autoCorrect={false}
                    inputStyle={{ fontSize: 14, color: '#f7f7f7' }}
                    onBlur={() => this.setState({addressDirty: true})}
                    onChangeText={(address) => this.setState({address})}
                    value={this.state.address}/>
                {renderIf(this.state.address === '' && this.state.addressDirty, <FormValidationMessage labelStyle={{color: '#e74c3c'}}>
                    {'This field is required'}
                </FormValidationMessage>)}
                {renderIf(this.state.invalidAddress && this.state.address !== '', <FormValidationMessage labelStyle={{color: '#e74c3c'}}>
                    {'Invalid ' + this.coinManager.getCoinName() + ' Address'}
                </FormValidationMessage>)}
                {renderIf(this.state.addressExists && this.state.address !== '', <FormValidationMessage labelStyle={{color: '#e74c3c'}}>
                    {'This account already exists'}
                </FormValidationMessage>)}
                <FormLabel labelStyle={{color: '#4C7891'}}>Label</FormLabel>
                <FormInput
                    autoCorrect={false}
                    inputStyle={{ fontSize: 14, color: '#f7f7f7' }}
                    onBlur={() => this.setState({nameDirty: true})}
                    onChangeText={(name) => this.setState({name})}
                    value={this.state.name}/>
                {renderIf(this.state.name === '' && this.state.nameDirty, <FormValidationMessage labelStyle={{color: '#e74c3c'}}>
                    {'This field is required'}
                </FormValidationMessage>)}
                <Button
                    disabled={this._checkDisabled()}
                    disabledStyle={{backgroundColor: '#0E82AB50'}}
                    containerViewStyle={styles.buttonStyle}
                    onPress={this._submitAddress}
                    raised
                    backgroundColor={'#0E82AB'}
                    title='Submit Account'
                />
            </ScrollView>
        );
    }
}

const styles = {
    darkBackground: {
        paddingTop: 20,
        backgroundColor: '#0C212D'
    },
    buttonStyle: {
        marginTop: 30,
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
}
