import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { showToast } from '../constants/Global';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import usFlag from '../assets/images/flag/en.jpg';
import { Actions } from 'react-native-router-flux';
import Layout from '../constants/Layout';
import I18n, { getCntFlage, setLanguage, strings } from '../locales/i18n';

import OneSignal from 'react-native-onesignal';
function myiOSPromptCallback(permission) { }
export default class Initial extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      visible: false,
      onesignal_token: '',
      crrlanguage: '0',
      visible_dropdown: false,
      dropdown_position: {
        x: 0,
        y: 0,
      },
      flagSource: usFlag,
    };
    OneSignal.inFocusDisplaying(2);
    OneSignal.init('c167fc9d-d6ff-41e0-bd84-05a10c074219', {
      kOSSettingsKeyAutoPrompt: true,
      kOSSettingsKeyInAppLaunchURL: false,
      kOSSettingsKeyInFocusDisplayOption: 2,
    });
    //OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.setSubscription(true);
  }

  async onReceived(notification) {
    if (
      notification.payload.additionalData &&
      notification.payload.additionalData.type == 'driver accept'
    ) {
      await AsyncStorage.setItem(
        'client_driver_id',
        notification.payload.additionalData.driver_id.toString(),
      );
      await AsyncStorage.setItem(
        'client_booking_id',
        notification.payload.additionalData.booking_id.toString(),
      );
      await AsyncStorage.setItem(
        'client_driver_phone',
        notification.payload.additionalData.phone.toString(),
      );
      await AsyncStorage.setItem(
        'client_driver_name',
        notification.payload.additionalData.user_name.toString(),
      );
      if (Actions.currentScene != 'reservation') Actions.reset('root');
    } else if (
      notification.payload.additionalData &&
      notification.payload.additionalData.type == 'finish'
    ) {
      let driver_id = await AsyncStorage.getItem('client_driver_id');
      console.log("FNISH RESERVATION", driver_id);

      let info = await AsyncStorage.getItem('user_info');
      if (info) {
        info = JSON.parse(info);
      }
      if (info.type == '1') {
        await AsyncStorage.removeItem('client_driver_id');
        await AsyncStorage.removeItem('client_booking_id');
        await AsyncStorage.removeItem('client_driver_phone');
        await AsyncStorage.removeItem('client_driver_name');
        await AsyncStorage.removeItem('is_booked');
        // Note Set Rate driver_id after finished
        console.log("IFNISH RESERVATION", driver_id)
        await AsyncStorage.setItem('rate_driver_id', driver_id);

        Actions.push('rating', { driver_id: driver_id });
      }

      showToast(strings('msgBox.finishReservation'), 'success');
    } else if (
      notification.payload.additionalData &&
      notification.payload.additionalData.type == 'request'
    ) {
      if (Actions.currentScene == 'booking' || Actions.currentScene == 'home')
        Actions.refresh();
    } else if (
      notification.payload.additionalData &&
      notification.payload.additionalData.type == 'reservation cancel'
    ) {
      if (Actions.currentScene == 'booking' || Actions.currentScene == 'home')
        Actions.refresh();
      else Actions.reset('root');
    } else if (
      notification.payload.additionalData &&
      notification.payload.additionalData.action == 'chat'
    ) {
      if (Actions.currentScene != 'chat')
        Actions.push('chat', {
          booking_id: notification.payload.additionalData.booking_id,
          type: notification.payload.additionalData.type,
        });
    }
  }

  async onOpened(openResult) {
    if (
      openResult.notification.payload.additionalData &&
      openResult.notification.payload.additionalData.type == 'request'
    ) {
      if (Actions.currentScene == 'booking' || Actions.currentScene == 'home')
        Actions.refresh();
      Actions.push('reservation', {
        id: openResult.notification.payload.additionalData.booking_id,
        type: 'request',
      });
    } else if (
      openResult.notification.payload.additionalData &&
      openResult.notification.payload.additionalData.type == 'driver accept'
    ) {
      await AsyncStorage.setItem(
        'client_driver_id',
        openResult.notification.payload.additionalData.driver_id.toString(),
      );
      await AsyncStorage.setItem(
        'client_booking_id',
        openResult.notification.payload.additionalData.booking_id.toString(),
      );
      await AsyncStorage.setItem(
        'client_driver_phone',
        openResult.notification.payload.additionalData.phone.toString(),
      );
      await AsyncStorage.setItem(
        'client_driver_name',
        notification.payload.additionalData.user_name.toString(),
      );
      Actions.push('home', {
        booking_id: openResult.notification.payload.additionalData.booking_id,
        driver_id: openResult.notification.payload.additionalData.driver_id,
        phone: openResult.notification.payload.additionalData.phone,
      });
      //showToast("Driver Request Sent", "success")
    } else if (
      openResult.notification.payload.additionalData &&
      openResult.notification.payload.additionalData.type == 'driver arrived'
    ) {
      showToast(strings('msgBox.driverArrived'), 'success');
    } else if (
      openResult.notification.payload.additionalData &&
      openResult.notification.payload.additionalData.type == 'finish'
    ) {
      let driver_id = await AsyncStorage.getItem('client_driver_id');
      let info = await AsyncStorage.getItem('user_info');
      if (info) {
        info = JSON.parse(info);
      }
      if (info.type == '1') {
        await AsyncStorage.removeItem('client_driver_id');
        await AsyncStorage.removeItem('client_booking_id');
        await AsyncStorage.removeItem('client_driver_phone');
        await AsyncStorage.removeItem('client_driver_name');
        await AsyncStorage.removeItem('is_booked');
        // Note Set Rate driver_id after finished
        console.log("IFNISH RESERVATION", driver_id)
        await AsyncStorage.setItem('rate_driver_id', driver_id);

        Actions.push('rating', { driver_id: driver_id });
      }

      showToast(strings('msgBox.finishReservation'), 'success');
    } else if (
      openResult.notification.payload.additionalData &&
      openResult.notification.payload.additionalData.type ==
      'reservation cancel'
    ) {
      if (Actions.currentScene == 'booking' || Actions.currentScene == 'home')
        Actions.refresh();
      else Actions.reset('root');
    } else if (
      openResult.notification.payload.additionalData &&
      openResult.notification.payload.additionalData.action == 'chat'
    ) {
      if (Actions.currentScene != 'chat')
        Actions.push('chat', {
          booking_id: openResult.notification.payload.additionalData.booking_id,
          type: openResult.notification.payload.additionalData.type,
        });
    }
  }

  async onIds(device) {
    if (device && device.userId)
      await AsyncStorage.setItem('onesignal_token', device.userId);
  }

  async componentDidMount() {
    let user_info = await AsyncStorage.getItem('user_info');
    let is_keep = await AsyncStorage.getItem('is_keep');
    if (user_info && is_keep) Actions.reset('root');
    let flagUrl = getCntFlage(I18n.locale);
    this.setState({ flagSource: flagUrl });
  }

  openDropDown() {
    this.setState({ visible_dropdown: true });
  }

  hideDropDown() {
    this.setState({ visible_dropdown: false });
  }

  onLayout({ nativeEvent }) {
    this.setState({
      dropdown_position: nativeEvent.layout,
    });
  }

  async onFlagPress(code) {
    setLanguage(code);
    let flagUrl = getCntFlage(code);
    this.setState({ visible_dropdown: false, flagSource: flagUrl });
  }

  render() {
    const { visible_dropdown, dropdown_position } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.section, {}]}>
          <View style={styles.relative_layout}>
            <TouchableOpacity
              style={{
                width: 50,
                height: 45,
                position: 'absolute',
                right: 0,
                top: 0,
                borderRadius: 50,
                overflow: 'hidden',
                borderWidth: 3,
                borderColor: '#444',
                marginRight: 5,
              }}
              onLayout={this.onLayout.bind(this)}
              onPress={this.openDropDown.bind(this)}>
              <Image
                source={this.state.flagSource}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  right: 0,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>{strings('initial.guest')}</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => Actions.push('login', { type: 'client' })}>
              <Text>{strings('initial.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => Actions.push('signup', { type: 'client' })}>
              <Text>{strings('initial.signUp')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, width: '100%' }}>
            <Image
              source={require('../assets/images/taxi.jpg')}
              style={{ height: '100%', width: '100%', marginTop: 10 }}
              resizeMode="stretch"
            />
          </View>
        </View>
        <View style={styles.section}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>{strings('initial.driver')}</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => Actions.push('login', { type: 'driver' })}>
              <Text>{strings('initial.login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => Actions.push('signup', { type: 'driver' })}>
              <Text>{strings('initial.signUp')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, width: '100%' }}>
            <Image
              source={require('../assets/images/processed2.jpeg')}
              style={{ height: '100%', width: '100%', marginTop: 10 }}
              resizeMode="stretch"
            />
          </View>
        </View>

        <Spinner_bar
          color={'#27cccd'}
          visible={!this.state.loaded}
          textContent={''}
          overlayColor={'rgba(0, 0, 0, 0.5)'}
        />
        {visible_dropdown && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={this.hideDropDown.bind(this)}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              backgroundColor: '#00000088',
            }}>
            <View
              style={{
                position: 'absolute',
                top: dropdown_position.y + 70,
                // left: dropdown_position.x,
                right: 0,
                width: 150,
                backgroundColor: '#fff',
                marginRight: 5,
                marginTop: 5,
                // marginRight: 60,
                // marginTop: -25,
              }}>
              {Layout.Countries.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={this.onFlagPress.bind(this, item.code)}
                  style={{ width: '100%' }}>
                  <View style={styles.dropdownText}>
                    <Image
                      source={getCntFlage(item.code)}
                      style={{
                        width: 30,
                        height: 30,
                      }}
                    />
                    <Text style={{ paddingLeft: 15 }}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }
}

Initial.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 30,
  },
  section: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#ffc500',
    paddingVertical: 10,
    width: 200,
    alignItems: 'center',
    marginTop: 15,
    borderRadius: 5,
  },
  buttonText: {
    padding: 0,
    margin: 0,
  },
  dropdownText: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
  },
  relative_layout: {
    position: 'relative',
    alignSelf: 'stretch',
  },
});
