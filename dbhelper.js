'use strict'

import { AsyncStorage } from 'react-native';

class DBHelper {
    constructor() {
        this.bareDb = {
            "balanceInfo": {
                "name": "Coinhark API",
                "date": "1318464000",
                "totalBalance": "0.00000000",
                "addresses": []
            },
            "exchange": {
                "price": 0.00,
                "date": "1318464000",
                "name": "CoinMarketCap API",
            }
        }
    }

    save(key, value) {
      console.log(`DB - saving key:${key} value: ${value}`);
      AsyncStorage.setItem(key, value);
    }
}

export default DBHelper;

/*
Example db:
{
    "balanceInfo": {
        "name": "chain.so/api",
        "date": "1513701489945",
        "totalBalance": "345.33420002",
        "addresses": [
            {
              "address":"LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj",
              "inputAddress":"LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj",
              "name":"Donations",
              "totalBalance":"0.05769462",
              "valueInDollars":"10.43"
            },
            {
              "address":"LZM4ztEMzk9MY9ikC8jE52nTeBHhcL9viW",
              "inputAddress":"LZM4ztEMzk9MY9ikC8jE52nTeBHhcL9viW",
              "name":"Random Address",
              "totalBalance":"5.9",
              "valueInDollars":"1,067.02"
            },
            {
              "address":"3CuMqrgosjygLtVA4oF7RTzRiUNKvRznkF",
              "inputAddress":"MK7W9k6mprq79Pm4AgETF7Eq3AxmwahBCT",
              "name":"Segwit Address Convert",
              "totalBalance":0,
              "valueInDollars":"0.00"
            }
        ]
    },
    "exchange": {
        "price":"354.402",
        "name":"CoinMarketCap",
        "date":"1513701489945"
    }
}
*/
