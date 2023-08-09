import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { showToast } from '../constants/Global';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import { Actions } from 'react-native-router-flux';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import RNPickerSelect from 'react-native-picker-select';
import { Icon } from 'react-native-elements';
import MapViewDirections from 'react-native-maps-directions';
import Layout from '../constants/Layout';
import { getDistance, getPreciseDistance } from 'geolib';
import {
  get_currency,
  add_booking,
  cancel_booking,
  get_booking_info,
  get_booking_user,
  get_user_info,
} from '../constants/Api';
import MainHeader from '../components/MainHeader';
import GetLocation from 'react-native-get-location';
import Booking from './Booking';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import { strings } from '../locales/i18n';

const currencyList = [
  { label: 'Euro', value: '€', rate: 'euro' },
  { label: 'U.S. Dollar', value: '$', rate: 'USD' },
  { label: 'Pound Sterling (GBP)', value: '£', rate: 'GBP' },
  { label: 'Bulgarian Lev (BGN)', value: 'lv', rate: 'BGN' },
  { label: 'Russian Ruble (RUB)', value: '₽', rate: 'RUB' },
  { label: 'Turkish Lira (TRY)', value: '₺', rate: 'TRY' },
  { label: 'Philippines Peso (PHP)', value: '₱', rate: 'PHP' },
  { label: 'Malaysian Ringgit (MYR)', value: 'RM', rate: 'MYR' },
  { label: 'Thailand Baht (THB)', value: '฿', rate: 'THB' },
  // {label: 'Indian Rupee (IDR)', value: '₹', rate: 'IDR'},
  // {label: 'Canadian Dollar (CAD)', value: 'CAD', rate: 'CAD'},
  // {label: 'Australian Dollar (AUD)', value: 'AUD', rate: 'AUD'},
];
const positionLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.googleputRef1 = null;
    this.googleputRef2 = null;
    this.state = {
      loaded: true,
      visible: false,
      onesignal_token: '',
      currency: '€',
      marker: null,
      markerAddress: '',
      locationList: [[], []],
      region: null,
      isCalc: false,
      isCalcAccepted: false,
      isCalcOrg: null,
      isCalcDest: null,
      wayPoints: [],
      currencyRates: null,
      totalDistance: 0,
      totalMoney: 0,
      totalTime: 0,
      is_full: false,
      isEnabled: false,
      user_info: null,
      isAccepted: false,
      is_booked: false,
      booking_id: '',
      driver_id: '',
    };
  }
  async componentDidMount() {
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
      this.setState({ user_info: info });
    }
    this.refresh();
    this.show_user_booking();
  }
  async UNSAFE_componentWillReceiveProps() {
    this.refresh();
  }
  async refresh() {
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
      this.setState({ user_info: info });
    }
    if (this.props.driver_id) {
      console.log('THIS_PROPS', this.props);
      // this.setState({isEnabled: true});
      await AsyncStorage.setItem(
        'client_driver_id',
        this.props.driver_id.toString(),
      );
      await AsyncStorage.setItem(
        'client_booking_id',
        this.props.booking_id.toString(),
      );
      await AsyncStorage.setItem(
        'client_driver_phone',
        this.props.phone.toString(),
      );
      this.show_user_booking();
    } else {
      let temp = await AsyncStorage.getItem('client_booking_id');
      if (temp) {
        this.show_user_booking();
      }
    }

    get_currency()
      .then(async (response) => {
        this.setState({ currencyRates: response.rates });
      })
      .catch((error) => { });
  }
  renderLocation() {
    return this.state.locationList.map((item, index) => {
      return (
        <View style={{ position: 'relative' }} key={index}>
          {this.state.isCalc ? (
            <View style={{ position: 'absolute', left: -15 }}>
              <Text
                style={{
                  color: '#da4444',
                  fontWeight: 'bold',
                  top: 25,
                  fontSize: 18,
                }}>
                {positionLabel[index]}
              </Text>
            </View>
          ) : null}

          <GooglePlacesAutocomplete
            placeholder={strings('msgBox.location')}
            numberOfLines={3}
            ref={(ref) => {
              index == 0
                ? (this.googleputRef1 = ref)
                : index == 1
                  ? (this.googleputRef2 = ref)
                  : null;
            }}
            onPress={(data, details = null) => {
              let temp = this.state.locationList;
              if (details && details.geometry && details.geometry.location) {
                temp[index] = [
                  details.geometry.location.lat,
                  details.geometry.location.lng,
                  details.formatted_address,
                ];
                this.setState({
                  marker: {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                  },
                });
                this.setState({
                  region: {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  },
                });
                this.setState({ markerAddress: details.formatted_address });
              }
              this.setState({ locationList: temp });
            }}
            currentLocation={true}
            currentLocationLabel="Current location"
            fetchDetails={true}
            enablePoweredByContainer={false}
            styles={{
              textInput: {
                borderWidth: 1,
                borderColor: '#ABAAAC',
                marginTop: 5,
                height: 60,
              },
            }}
            query={{ key: Layout.GoogleMapKey, language: 'en' }}
          />
          {index > 1 ? (
            <TouchableOpacity
              style={{ right: -20, top: 25, position: 'absolute' }}
              onPress={() => this.removeLocation(index)}>
              <Icon type="fontawesome" name="close" size={20} color="#337ab7" />
            </TouchableOpacity>
          ) : null}
        </View>
      );
    });
  }
  removeLocation(index) {
    let temp = this.state.locationList;
    temp.splice(index, 1);
    this.setState({ locationList: temp });
  }
  addLocation() {
    this.setState({ isCalc: false });
    if (this.state.locationList.length < 10) {
      let temp = this.state.locationList;
      temp.push([]);
      this.setState({ locationList: temp });
    }
  }
  reset() {
    let temp = [[], []];
    if (this.googleputRef1) this.googleputRef1.clear();
    if (this.googleputRef2) this.googleputRef2.clear();
    this.setState({ marker: null });
    this.setState({ markerAddress: '' });
    this.setState({ isCalcOrg: null });
    this.setState({ isCalcDest: null });
    this.setState({ wayPoints: [] });
    this.setState({ totalDistance: 0 });
    this.setState({ totalMoney: 0 });
    this.setState({ totalTime: 0 });
    this.setState({ isCalc: false });
    this.setState({ isCalcAccepted: false });
    this.setState({ locationList: temp });
  }
  async show_user_booking() {
    this.setState({ loaded: false });
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
      await get_booking_user(info.id)
        .then(async (response) => {
          this.setState({ loaded: true });
          let data = response?.data;
          if (data) {
            if (data[0].locations && data[0].locations.length > 0) {
              let farPoint = null;
              var max = 0;
              for (var i = 1; i < response.data[0].locations.length; i++) {
                var pdis = getPreciseDistance(
                  {
                    latitude: parseFloat(response.data[0].locations[0].lat),
                    longitude: parseFloat(response.data[0].locations[0].lng),
                  },
                  {
                    latitude: parseFloat(response.data[0].locations[i].lat),
                    longitude: parseFloat(response.data[0].locations[i].lng),
                  },
                );
                if (max < pdis)
                  farPoint = [
                    parseFloat(response.data[0].locations[i].lat),
                    parseFloat(response.data[0].locations[i].lng),
                  ];
              }
              this.setState({
                marker: {
                  latitude:
                    (parseFloat(response.data[0].locations[0].lat) +
                      parseFloat(farPoint[0])) /
                    2,
                  longitude:
                    (parseFloat(response.data[0].locations[0].lng) +
                      parseFloat(farPoint[1])) /
                    2,
                },
                markerAddress: response.data[0].locations[0].place,
              });
              this.setState({
                region: {
                  latitude:
                    (parseFloat(response.data[0].locations[0].lat) +
                      parseFloat(farPoint[0])) /
                    2,
                  longitude:
                    (parseFloat(response.data[0].locations[0].lng) +
                      parseFloat(farPoint[1])) /
                    2,
                  latitudeDelta:
                    Math.abs(
                      parseFloat(response.data[0].locations[0].lat) -
                      parseFloat(farPoint[0]),
                    ) + 0.3,
                  longitudeDelta:
                    Math.abs(
                      parseFloat(response.data[0].locations[0].lng) -
                      parseFloat(farPoint[1]),
                    ) + 0.3,
                },
                isCalcOrg: {
                  latitude: parseFloat(response.data[0].locations[0].lat),
                  longitude: parseFloat(response.data[0].locations[0].lng),
                },
                isCalcDest: {
                  latitude: parseFloat(
                    response.data[0].locations[
                      response.data[0].locations.length - 1
                    ].lat,
                  ),
                  longitude: parseFloat(
                    response.data[0].locations[
                      response.data[0].locations.length - 1
                    ].lng,
                  ),
                },
              });

              let templocation = [];
              let tempWay = [];

              for (var i = 0; i < response.data[0].locations.length; i++) {
                templocation.push(
                  Object.values(response.data[0].locations[i]).slice(1, 4),
                );
                tempWay.push({
                  latitude: parseFloat(response.data[0].locations[i].lat),
                  longitude: parseFloat(response.data[0].locations[i].lng),
                });
              }
              this.setState({
                locationList: templocation,
                wayPoints: tempWay,
                driver_id: response.data[0].driver_id,
                isEnabled: response?.data[0].driver_id ? true : false,
              });
              this.setState({ wayPoints: tempWay });
            }

            this.setState((prev) => ({
              ...prev,
              loaded: true,
              currency: data[0].currency,
              totalDistance: data[0].distance,
              totalMoney: data[0].price,
              totalTime: data[0].total_time,
              isAccepted: data[0].status == '1',
              is_booked: true,
              booking_id: data[0].id,
              isCalc: true,
              isCalcAccepted: true,
            }));
          } else {
            this.setState({
              region: {
                latitude: 41.9028,
                longitude: 12.4964,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              },
            });
          }
        })
        .catch((error) => {
          this.setState({ loaded: true });
        });
    }
  }

  async cancel() {
    this.setState({ loaded: false });
    let booking_id = await AsyncStorage.getItem('client_booking_id');
    await AsyncStorage.removeItem('client_driver_id');
    await AsyncStorage.removeItem('client_booking_id');
    await AsyncStorage.removeItem('client_driver_phone');
    await AsyncStorage.removeItem('client_driver_name');
    await AsyncStorage.removeItem('is_booked');

    this.setState({ is_booked: false });

    console.log(booking_id ?? this.state.booking_id);

    await cancel_booking(booking_id ?? this.state.booking_id)
      .then(async (response) => {
        this.setState({ loaded: true });
        Actions.reset('root');
      })
      .catch((error) => {
        this.setState({ loaded: true });
        // showToast();
      });
  }
  calc() {
    let valid = true;
    for (var i = 0; i < this.state.locationList.length; i++) {
      if (this.state.locationList[i].length == 0) valid = false;
    }
    if (valid) {
      this.setState({ isCalc: true });
      this.setState({
        isCalcOrg: {
          latitude: this.state.locationList[0][0],
          longitude: this.state.locationList[0][1],
        },
        isCalcDest: {
          latitude:
            this.state.locationList[this.state.locationList.length - 1][0],
          longitude:
            this.state.locationList[this.state.locationList.length - 1][1],
        },
      });
      let temp = [];
      for (var i = 1; i < this.state.locationList.length - 1; i++) {
        temp.push({
          latitude: this.state.locationList[i][0],
          longitude: this.state.locationList[i][1],
        });
      }
      this.setState({ wayPoints: temp });
      var max = 0;
      let farPoint = null;
      for (var i = 1; i < this.state.locationList.length; i++) {
        var pdis = getPreciseDistance(
          {
            latitude: this.state.locationList[0][0],
            longitude: this.state.locationList[0][1],
          },
          {
            latitude: this.state.locationList[i][0],
            longitude: this.state.locationList[i][1],
          },
        );
        if (max < pdis)
          farPoint = [
            this.state.locationList[i][0],
            this.state.locationList[i][1],
          ];
      }
      let total = 0;
      for (var i = 0; i < this.state.locationList.length - 1; i++) {
        var pdis = getPreciseDistance(
          {
            latitude: this.state.locationList[i][0],
            longitude: this.state.locationList[i][1],
          },
          {
            latitude: this.state.locationList[i + 1][0],
            longitude: this.state.locationList[i + 1][1],
          },
        );
        total += pdis;
      }

      this.setState({ totalDistance: total });
      if (this.state.currency == '€' || this.state.currency == 'lv')
        this.setState({ totalMoney: (total / 1000) * 0.85 });
      else {
        if (this.state.currencyRates) {
          let selectedCurrency = currencyList.find(
            (item) => item.value === this.state.currency,
          );
          let selectedRate = 1;
          if (selectedCurrency)
            selectedRate = this.state.currencyRates[selectedCurrency.rate];
          this.setState({ totalMoney: (total / 1000) * 0.85 * selectedRate });
        }
      }
      this.setState({
        totalTime: (total / 1000) * 5.34,
        region: {
          latitude:
            (parseFloat(this.state.locationList[0][0]) +
              parseFloat(farPoint[0])) /
            2,
          longitude:
            (parseFloat(this.state.locationList[0][1]) +
              parseFloat(farPoint[1])) /
            2,
          latitudeDelta:
            Math.abs(
              parseFloat(this.state.locationList[0][0]) -
              parseFloat(farPoint[0]),
            ) + 0.3,
          longitudeDelta:
            Math.abs(
              parseFloat(this.state.locationList[0][1]) -
              parseFloat(farPoint[1]),
            ) + 0.3,
        },
      });
    } else {
      showToast(strings('msgBox.enterLocation'));
    }
  }
  renderMaker() {
    return this.state.locationList.map((item, index) => {
      if (item && item[0] && item[1]) {
        return (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(item[0]),
              longitude: parseFloat(item[1]),
            }}
            title={item[2]}
            identifier={'mk' + parseInt(index + 1)}
          />
        );
      } else
        return (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(item[0]),
              longitude: parseFloat(item[1]),
            }}
            title={item[2]}
            identifier={'mk' + parseInt(index + 1)}
          />
        );
    });
  }
  toggleSwitch = () => {
    if (this.state.isEnabled) this.setState({ isEnabled: true });
    else this.setState({ isEnabled: false });
  };
  async addBooking() {
    if (this.state.isAccepted || this.state.is_booked) {
      showToast(strings('msgBox.notSend'));
    } else {
      if (this.state.isCalc && this.state.locationList.length >= 2) {
        this.setState({ loaded: false });
        let user_id = this.state.user_info.id;

        await add_booking(
          user_id,
          this.state.totalDistance,
          this.state.totalMoney,
          this.state.currency,
          this.state.totalTime,
          this.state.locationList,
        )
          .then(async (response) => {
            this.setState({ loaded: true });
            await AsyncStorage.setItem('is_booked', '1');
            this.setState({ is_booked: true });
            this.show_user_booking();
            showToast(strings('msgBox.sent'), 'success');
          })
          .catch((error) => {
            this.setState({ loaded: true });
            // showToast();
          });
      } else {
        showToast(strings('msgBox.enterLocation'));
      }
    }
  }

  async callPhone() {
    let driver;
    if (this?.state?.driver_id ?? false) {
      driver = await get_user_info(this.state.driver_id ?? '');
    }
    console.log(driver?.data?.phone, 'THIS');
    if (driver?.data?.phone ?? false) {
      Linking.openURL('tel:' + driver?.data?.phone);
    } else {
      showToast(strings('msgBox.callNotAccept'));
    }
  }

  async gotoChat() {
    let booking_id = await AsyncStorage.getItem('client_booking_id');
    if (this.state.driver_id) {
      Actions.push('chat', {
        booking_id: booking_id ?? this.state.booking_id,
        type: 'client',
      });
    } else {
      if (this.state.booking_id) {
        showToast(strings('msgBox.requestNotAccept'));
      } else {
        showToast(strings('msgBox.bookFirst'));
      }
    }
  }
  render() {
    return (
      <View style={styles.container}>
        {this.state.user_info && this.state.user_info.type == 1 ? (
          <View style={{ flex: 1 }}>
            <MainHeader />
            <TouchableOpacity
              onPress={() => this.setState({ is_full: !this.state.is_full })}
              style={{
                right: 20,
                top: 70,
                zIndex: 99999,
                position: 'absolute',
                backgroundColor: '#F7F8F9',
              }}>
              <Icon
                type="materialcommunityicons"
                name="fullscreen"
                size={40}
                color="black"
              />
            </TouchableOpacity>
            <View
              style={{
                alignItems: 'center',
                height: this.state.is_full ? '100%' : '25%',
              }}>
              {this.state.region ? (
                <MapView
                  style={styles.map}
                  initialRegion={this.state.region}
                  region={this.state.region}
                  ref={(map) => {
                    this.mapRef = map;
                  }}>
                  {this.state.isCalc || this.state.isCalcAccepted ? (
                    this.renderMaker()
                  ) : this.state.marker ? (
                    <Marker
                      coordinate={this.state.marker}
                      title={this.state.markerAddress}
                    />
                  ) : null}
                  {this.state.isCalc || this.state.isCalcAccepted ? (
                    <MapViewDirections
                      origin={this.state.isCalcOrg}
                      waypoints={this.state.wayPoints}
                      destination={this.state.isCalcDest}
                      apikey={Layout.GoogleMapKey}
                      strokeWidth={3}
                      resetOnChange={true}
                      strokeColor={'#6DB0E9'}
                    />
                  ) : null}
                </MapView>
              ) : (
                <View style={[styles.map, { backgroundColor: '#e2e2e2' }]}></View>
              )}
            </View>
            <ScrollView
              contentContainerStyle={{
                paddingVertical: 10,
                paddingLeft: 30,
                paddingRight: 30,
              }}
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="always">
              {this.state.isCalc || this.state.is_booked ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 40,
                      color: '#68ae34',
                      textAlign: 'center',
                    }}>
                    {this.state.currency == 'CAD' ||
                      this.state.currency == 'AUD'
                      ? '$'
                      : this.state.currency}{' '}
                    {this.state?.totalMoney?.toFixed(2)}{' '}
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 25,
                      color: '#757575',
                      textAlign: 'center',
                    }}>
                    {strings('home.inCash')}
                  </Text>
                </View>
              ) : null}

              {this.state.isCalc ? (
                <View style={{ marginBottom: 10, flexDirection: 'row', flex: 1 }}>
                  <View
                    style={{
                      flex: 1,
                      borderRightColor: 'black',
                      borderRightWidth: 1,
                    }}>
                    <Text style={{ textAlign: 'center' }}>
                      {(this.state.totalDistance / 1000).toFixed(2)}
                      &nbsp;&nbsp;&nbsp;KM
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ textAlign: 'center' }}>
                      {parseInt(this.state?.totalTime ?? 0)}
                      &nbsp;&nbsp;&nbsp;Minutes
                    </Text>
                  </View>
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <RNPickerSelect
                  onValueChange={(value) => {
                    this.setState({ currency: value });
                    this.setState({ isCalc: false });
                  }}
                  items={currencyList}
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 10,
                      right: 10,
                    },
                  }}
                  Icon={() => {
                    return (
                      <Icon
                        type="entypo"
                        name="triangle-down"
                        size={20}
                        color="#757575"
                      />
                    );
                  }}
                  placeholder={{}}
                  value={this.state.currency}
                  useNativeAndroidPickerStyle={false}
                />
              </View>
              <View style={{ flex: 1, marginVertical: 10, flexDirection: 'row' }}>
                <TouchableOpacity
                  style={
                    this.state.locationList.length >= 10
                      ? {
                        backgroundColor: '#5cb85c',
                        flex: 1,
                        borderRadius: 5,
                        paddingVertical: 10,
                        marginRight: 10,
                        opacity: 0.6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                      : {
                        backgroundColor: '#5cb85c',
                        flex: 1,
                        borderRadius: 5,
                        paddingVertical: 10,
                        marginRight: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                  }
                  onPress={() => this.addLocation()}
                  disabled={
                    this.state.locationList.length >= 10 ? true : false
                  }>
                  <Icon
                    type="antdesign"
                    name="pluscircle"
                    size={20}
                    color="white"
                  />

                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      paddingLeft: 10,
                    }}>
                    {strings('home.addLocation')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#d9534f',
                    flex: 1,
                    borderRadius: 5,
                    paddingVertical: 10,
                    marginLeft: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => this.reset()}>
                  <Icon
                    type="antdesign"
                    name="closecircle"
                    size={20}
                    color="white"
                  />
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      paddingLeft: 10,
                    }}>
                    {strings('initial.reset')}
                  </Text>
                </TouchableOpacity>
              </View>
              {this.state.locationList.length > 0
                ? this.renderLocation()
                : null}
              <View style={{ flexDirection: 'row', flex: 1 }}>
                {this.state.is_booked ? (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#ffc500',
                      width: '60%',
                      borderRadius: 5,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 10,
                    }}
                    onPress={() => this.cancel()}>
                    <Text style={{ textAlign: 'center', paddingLeft: 10 }}>
                      {strings('home.cancelReservation')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#337ab7',
                      width: '60%',
                      borderRadius: 5,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 10,
                    }}
                    onPress={() => this.calc()}>
                    <Icon
                      type="antdesign"
                      name="checkcircle"
                      size={20}
                      color="white"
                      style={{
                        paddingLeft: 3,
                      }}
                    />
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        paddingLeft: 5,
                        flexShrink: 1,
                      }}>
                      {strings('home.calFare')}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => this.addBooking()}
                  style={{ flex: 1, marginLeft: '5%', alignItems: 'center' }}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      marginTop: 10,
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: 25,
                      backgroundColor: 'green',
                    }}>
                    <Icon type="ionicons" name="send" size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text>{strings('home.requestDriver')}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  paddingTop: 20,
                  borderTopWidth: 2,
                  borderTopColor: 'black',
                  marginTop: 20,
                }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => this.callPhone()}>
                  <Icon type="antdesign" name="phone" size={30} color="green" />
                  <Text style={{ marginTop: 6 }}>{strings('initial.call')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => Actions.drawerOpen()}>
                  <Icon type="antdesign" name="home" size={30} color="green" />
                  <Text style={{ marginTop: 6 }}>{strings('initial.home')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => this.gotoChat()}>
                  <Icon
                    type="fontisto"
                    name="hipchat"
                    size={30}
                    color="green"
                  />
                  <Text style={{ marginTop: 6 }}>{strings('initial.chat')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Switch
                    trackColor={{ false: '#767577', true: '#48b549' }}
                    thumbColor={this.state.isEnabled ? 'green' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={this.toggleSwitch}
                    value={this.state.isEnabled}
                  />
                  <Text style={{ textAlign: 'center' }}>
                    {strings('home.availableDriver')}
                  </Text>
                </TouchableOpacity>
              </View>

              {this.state.isAccepted ? (
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    paddingVertical: 15,
                    backgroundColor: '#5cb85c',
                    marginTop: 20,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                    {strings('home.requestAccepted')}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        ) : this.state.user_info && this.state.user_info.type == 0 ? (
          <Booking />
        ) : null}
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

Home.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  desc: {
    textAlign: 'center',
    marginTop: 20,
    color: '#FF8400',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 23,
    marginBottom: 20,
  },
  start: {
    marginTop: 30,
  },
  start1: {
    paddingHorizontal: 50,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#FF8400',
    marginTop: 30,
  },
  btnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 50,
    paddingTop: Platform.OS == 'ios' ? 20 : 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: '100%',
    height: 50,
    color: '#707070',
    paddingLeft: 10,
    paddingRight: 20,
    borderColor: '#ABAAAC',
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#F7F8F9',
  },
  inputAndroid: {
    width: '100%',
    height: 40,
    color: '#707070',
    fontSize: 14,
    paddingRight: 20,
    borderColor: '#ABAAAC',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    marginBottom: 10,
    backgroundColor: '#F7F8F9',
  },
});
