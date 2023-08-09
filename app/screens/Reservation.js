import AsyncStorage from '@react-native-community/async-storage';
import {getPreciseDistance} from 'geolib';
import moment from 'moment';
import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Modal from 'react-native-modal';
import {Actions} from 'react-native-router-flux';
import {accept, finish, get_booking_info, notify} from '../constants/Api';
import {showToast} from '../constants/Global';
import Layout from '../constants/Layout';
import {strings} from '../locales/i18n';
const positionLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export default class Reservation extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      loaded: true,
      email: '',
      title: '',
      description: '',
      details: null,
      region: null,
      isCalcOrg: null,
      isCalcDest: null,
      wayPoints: [],
      isVisible: false,
      client_name: '',
    };
  }

  async refresh() {
    this.setState({loaded: false});
    await get_booking_info(this.props.id)
      .then(async (response) => {
        this.setState({loaded: true});
        if (response.data) {
          this.setState({details: response.data[0]});
          if (
            response.data[0].locations &&
            response.data[0].locations.length > 0
          ) {
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
              if (max < pdis) {
                farPoint = [
                  parseFloat(response.data[0].locations[i].lat),
                  parseFloat(response.data[0].locations[i].lng),
                ];
              }
            }
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
            });

            this.setState({
              isCalcOrg: {
                latitude: parseFloat(response.data[0].locations[0].lat),
                longitude: parseFloat(response.data[0].locations[0].lng),
              },
            });
            let temp = [];
            this.setState({
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

            for (var i = 1; i < response.data[0].locations.length - 1; i++) {
              temp.push({
                latitude: parseFloat(response.data[0].locations[i].lat),
                longitude: parseFloat(response.data[0].locations[i].lng),
              });
            }
            this.setState({wayPoints: temp});
          }
        }
      })
      .catch((error) => {
        this.setState({loaded: true});
        // showToast();
      });
  }

  async componentDidMount() {
    this.refresh();
  }

  renderPlace(locations) {
    if (locations && locations.length > 0) {
      return locations.map((item, index) => {
        return (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              paddingLeft: 20,
              paddingBottom: 10,
              paddingRight: 60,
            }}>
            <Text style={{color: '#da4444', paddingRight: 20, fontSize: 16}}>
              {positionLabel[index]}
            </Text>
            <Text style={{fontWeight: 'bold', fontSize: 16, flexWrap: 'wrap'}}>
              {item.place}
            </Text>
          </View>
        );
      });
    } else {
      return null;
    }
  }

  callPhone() {
    if (this.state.details && this.state.details.status == '1') {
      Linking.openURL(
        'tel:' + this.state.details.phone_code + this.state.details.phone,
      );
    }
  }

  renderMaker() {
    return this.state.details.locations.map((item, index) => {
      return (
        <Marker
          key={index}
          coordinate={{
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lng),
          }}
          title={item[2]}
          identifier={'mk' + parseInt(index + 1)}
        />
      );
    });
  }

  async decline(id) {
    let temp = await AsyncStorage.getItem('decline_list');
    if (temp) {
      temp += ',' + id;
    } else {
      temp = id;
    }
    await AsyncStorage.setItem('decline_list', temp.toString());

    Actions.pop();
    setTimeout(function () {
      Actions.refresh();
    }, 10);
  }

  async accept() {
    this.setState({loaded: false});
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
    }

    await accept(this.props.id, info.id)
      .then(async (response) => {
        this.setState({loaded: true});
        if (response.data) {
          this.refresh();
        } else {
          showToast(strings('msgBox.anotherDriverAccept'));
          this.refresh();
        }
      })
      .catch((error) => {
        this.setState({loaded: true});
        // showToast();
      });
  }

  async finish(id) {
    this.setState({loaded: false});
    await finish(id)
      .then(async (response) => {
        this.setState({loaded: true});
        Actions.pop();
        setTimeout(function () {
          Actions.refresh();
        }, 10);
      })
      .catch((error) => {
        this.setState({loaded: true});
        showToast();
      });
  }

  async notify(id) {
    this.setState({loaded: false});
    await notify(id)
      .then(async (response) => {
        this.setState({loaded: true});
        showToast(strings('msgBox.notifySent'));
      })
      .catch((error) => {
        this.setState({loaded: true});
        showToast();
      });
  }
  async gotoChat() {
    if (this.state.details && this.state.details.status == '1') {
      Actions.push('chat', {booking_id: this.props.id, type: 'driver'});
    } else {
      showToast(strings('msgBox.notChat'));
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            alignItems: 'center',
            backgroundColor: 'black',
            opacity: 0.8,
            paddingVertical: 10,
          }}>
          <View>
            <Icon
              type="materialicons"
              name="phone-android"
              size={40}
              color="white"
            />
            <Text style={{color: 'white'}}>
              {strings('reservation.pickUp')}
            </Text>
          </View>
          <Text style={{fontSize: 20, color: 'white'}}>
            {strings('booking.incmingJob')}
          </Text>
          <View>
            <Icon type="entypo" name="man" size={40} color="white" />
            <Text style={{color: 'white'}}>
              {this.state.details
                ? moment(this.state.details.create_time).format('HH:mm')
                : null}
            </Text>
          </View>
        </View>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{paddingBottom: 40}}>
          <View>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 40,
                color: '#68ae34',
                paddingTop: 10,
              }}>
              {this.state.details ? this.state.details.currency : null}{' '}
              {this.state.details ? this.state.details.price : null}
            </Text>
          </View>
          <View style={{paddingTop: 10, flexDirection: 'row'}}>
            <View
              style={{flex: 1, borderRightColor: 'black', borderRightWidth: 1}}>
              <Text style={{textAlign: 'center'}}>
                {this.state.details
                  ? (this.state.details.distance / 1000).toFixed(2)
                  : null}
                &nbsp;&nbsp;&nbsp;KM
              </Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={{textAlign: 'center'}}>
                {this.state.details
                  ? parseFloat(this.state.details.total_time).toFixed(0)
                  : null}
                &nbsp;&nbsp;&nbsp;Minutes
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 20,
            }}>
            <View style={{flex: 1}}>
              {this.state.details
                ? this.renderPlace(this.state.details.locations)
                : null}
            </View>
            <TouchableOpacity
              style={{paddingRight: 20}}
              onPress={() => this.setState({isVisible: true})}>
              <Image
                source={require('../assets/images/map.jpg')}
                style={{width: 50, height: 90}}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingTop: 20,
              borderTopWidth: 2,
              borderTopColor: 'black',
              marginTop: 20,
            }}>
            <TouchableOpacity
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
              onPress={() => this.callPhone()}>
              <Icon type="antdesign" name="phone" size={30} color="green" />
              <Text style={{marginTop: 6}}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
              onPress={() => Actions.drawerOpen()}>
              <Icon type="antdesign" name="home" size={30} color="green" />
              <Text style={{marginTop: 6}}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
              onPress={() => this.gotoChat()}>
              <Icon type="fontisto" name="hipchat" size={30} color="green" />
              <Text style={{marginTop: 6}}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Switch
                trackColor={{false: '#767577', true: '#48b549'}}
                thumbColor={'green'}
                ios_backgroundColor="#3e3e3e"
                value={
                  !this.state.details ||
                  (this.state.details && this.state.details.status == '0')
                    ? false
                    : true
                }
              />
              <Text style={{textAlign: 'center'}}>Available Driver</Text>
            </TouchableOpacity>
          </View>
          <Modal
            isVisible={this.state.isVisible}
            onBackButtonPress={() => this.setState({isVisible: false})}
            onBackdropPress={() => this.setState({isVisible: false})}
            style={{flex: 1, width: '100%', margin: 0}}>
            <TouchableOpacity
              onPress={() => this.setState({isVisible: false})}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 999999,
              }}>
              <Icon
                type="antdesign"
                name="closecircleo"
                size={30}
                color="black"
              />
            </TouchableOpacity>
            <View style={{flex: 1, backgroundColor: 'white'}}>
              {this.state.region ? (
                <MapView
                  style={styles.map}
                  initialRegion={this.state.region}
                  region={this.state.region}
                  ref={(map) => {
                    this.mapRef = map;
                  }}>
                  {this.state.details && this.state.details.locations.length > 0
                    ? this.renderMaker()
                    : null}
                  {this.state.details &&
                  this.state.details.locations.length > 0 ? (
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
              ) : null}
            </View>
          </Modal>
          {this.props.type ||
          (this.state.details && this.state.details.status == '0') ? (
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                marginHorizontal: 20,
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#643A36',
                  alignItems: 'center',
                  paddingVertical: 15,
                }}
                onPress={() => this.decline(this.state.details.id)}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                  {strings('initial.decline')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#395130',
                  alignItems: 'center',
                  paddingVertical: 15,
                }}
                onPress={() => this.accept()}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                  {strings('initial.accept')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : this.state.details && this.state.details.status == '1' ? (
            <View style={{marginTop: 20, marginHorizontal: 20}}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignItems: 'center',
                }}>
                {strings('initial.name')}: {this.state.details.user}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignItems: 'center',
                }}>
                {strings('reservation.time')}
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                  backgroundColor: '#FEC200',
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
                onPress={() => this.notify(this.state.details.id)}>
                <View style={{flex: 1, backgroundColor: '#FEC200'}}>
                  <Text style={{textAlign: 'center'}}>
                    {strings('reservation.clickNotify')}
                  </Text>
                </View>
                <View>
                  <Image
                    source={require('../assets/images/notify.png')}
                    style={{width: 100, height: 100}}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FEC200',
                  paddingVertical: 15,
                  borderRadius: 6,
                }}
                onPress={() => this.finish(this.state.details.id)}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: 16,
                  }}>
                  {strings('reservation.finishJob')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={() => Actions.push('booking')}>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>
              {strings('reservation.backReservation')}
            </Text>
            <Image
              source={require('../assets/images/processed4.png')}
              style={{width: 80, height: 40}}
              resizeMode="contain"
            />
          </TouchableOpacity>
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

Reservation.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#e2e2e2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
