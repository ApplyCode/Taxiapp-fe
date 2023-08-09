import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {
  Image, Linking, ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import { Actions } from 'react-native-router-flux';
import RadioForm from 'react-native-simple-radio-button';
import MainHeader from '../components/MainHeader';
import { update_payment } from '../constants/Api';
import { showToast } from '../constants/Global';
import { strings } from '../locales/i18n';

export default class Pay extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      loaded: true,
      payments: [
        {label: 'Cash', value: '0'},
        {label: 'Paypal', value: '1'},
      ],
      pay: '',
    };
  }

  async componentDidMount() {
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
      if (info.payment) {
        this.setState({pay: parseInt(info.payment)});
      } else {
        this.setState({pay: -1});
      }
    }
  }

  async update() {
    this.setState({loaded: false});
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
    }
    await update_payment(info.id, this.state.pay)
      .then(async (response) => {
        this.setState({loaded: true});
        info.payment = this.state.pay;
        await AsyncStorage.setItem('user_info', JSON.stringify(info));
        Actions.reset('root');
      })
      .catch((error) => {
        this.setState({loaded: true});
        showToast();
      });
  }

  openPaypal() {
    Linking.openURL('https://paypal.com/login');
  }

  render() {
    return (
      <View style={styles.container}>
        <MainHeader />
        <ScrollView style={{flex: 1, padding: 20}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', paddingBottom: 20}}>
            {strings('pay')}
          </Text>
          <View>
            {this.state.pay != '' ? (
              <RadioForm
                radio_props={this.state.payments}
                initial={this.state.pay}
                buttonColor={'#E2E2E2'}
                onPress={(value) => {
                  this.setState({pay: value});
                }}
              />
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => this.openPaypal()}
            style={{alignItems: 'center'}}>
            <Image
              source={require('../assets/images/pay1.jpeg')}
              style={{width: '100%', height: 150}}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.openPaypal()}
            style={{alignItems: 'flex-start'}}>
            <Image
              source={require('../assets/images/arrow.jpg')}
              style={{height: 140, width: 140}}
              resizeMode="stretch"
            />
          </TouchableOpacity>
          {/*<TouchableOpacity style={{alignItems: 'center', marginTop: 25}} onPress={() => this.update()}>
                            <View style={{backgroundColor: '#dab844', paddingVertical: 10, width: 150, borderRadius: 5, alignItems: 'center', flex: 1}}>
                                <Text style={{color: 'white', textAlign: 'center', fontSize: 20}}>Update</Text>
                            </View>
                        </TouchableOpacity>*/}
        </ScrollView>
        <Spinner_bar
          color={'#27cccd'}
          visible={!this.state.loaded}
          textContent={''}
          overlayColor={'rgba(0, 0, 0, 0.5)'}
        />
      </View>
    );
  }
}

Pay.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
