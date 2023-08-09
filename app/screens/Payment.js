import AsyncStorage from '@react-native-community/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { certainOrder, checkout } from '../constants/Api';
import { showToast } from '../constants/Global';
import { strings } from '../locales/i18n';

export default PaymentScreen = (flag = false, ...props) => {
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const fetchPaymentSheetParams = async () => {
    const response = await checkout();

    const {paymentIntent, ephemeralKey, customer} = response;
    console.log(
      'fetchPaymentSheetParams',
      paymentIntent,
      ephemeralKey,
      customer,
    );

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };
  const initializePaymentSheet = async () => {
    const {paymentIntent, ephemeralKey, customer} =
      await fetchPaymentSheetParams();

    const {error} = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
    });
    if (!error) {
      if (paymentIntent && flag.flag) {
        openPaymentSheet(paymentIntent);
      }
    } else {
      showToast('Sorry! Something went wrong.', 'warning');
    }
  };
  const openPaymentSheet = async (clientSecret) => {
    const {error} = await presentPaymentSheet({clientSecret});
    if (error) {
      // Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      let info = await AsyncStorage.getItem('user_info');
      if (info) {
        info = JSON.parse(info);
        let res = await certainOrder(info.id);
        if (res) {
          showToast(strings('msgBox.paymentConfirm'), 'success');
          await AsyncStorage.setItem('is_paid', '1');
        }
      }
    }
  };

  useEffect(() => {
    console.log('Payment');
    initializePaymentSheet();
  }, [props.flag]);

  return <View />;
};
