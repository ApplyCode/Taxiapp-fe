import React, {useState, useEffect} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import {StripeProvider} from '@stripe/stripe-react-native';
import {fetchKey} from '../constants/Api';
import MainHeader from '../components/MainHeader';
import PaymentScreen from './Payment';
import {strings} from '../locales/i18n';

const DriverPay = (props) => {
  const [currState, setCurrState] = useState({
    loaded: true,
    publishableKey: '',
    flag: false
  });
  useEffect(() => {
    fetchPublishableKey();
  }, []);
  const fetchPublishableKey = async () => {
    setCurrState({loaded: false});
    const tmpKey = await fetchKey();
    setCurrState({publishableKey: tmpKey.data, loaded: true, flag: true});
  };
  return (
    <View style={styles.container}>
      <MainHeader />
      <ScrollView style={{flex: 1}}>
        <View style={{alignItems: 'center'}}>
          <Image
            source={require('../assets/images/stripe.png')}
            resizeMode="contain"
            style={{height: 100}}
          />
        </View>
        <View style={{paddingTop: 30, padding: 20}}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: 'bold',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
            50 Euro
          </Text>
          <Text style={{textAlign: 'center', fontSize: 20, paddingTop: 20}}>
            {strings('driverPay.monthPay')}
          </Text>
          <View
            style={{
              backgroundColor: 'grey',
              height: 2,
              marginVertical: 20,
            }}></View>
          <StripeProvider
            publishableKey={currState.publishableKey}
            merchantIdentifier="merchant.identifier"
            threeDSecureParams={{
              timeout: 5,
              navigationBar: {
                headerText: '3d secure',
              },
              submitButton: {
                cornerRadius: 12,
                textFontSize: 14,
              },
            }}
          >
            <PaymentScreen flag={currState.flag}/>
          </StripeProvider>
        </View>
      </ScrollView>
      <Spinner_bar
        color={'#27cccd'}
        visible={!currState.loaded}
        textContent={''}
        overlayColor={'rgba(0, 0, 0, 0.5)'}
      />
    </View>
  );
};

DriverPay.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  formInput: {
    width: '100%',
    height: 50,
    borderRadius: 5,
    borderColor: '#ABAAAC',
    borderWidth: 1,
    paddingHorizontal: 12,
    color: 'black',
  },
});

export default DriverPay;
