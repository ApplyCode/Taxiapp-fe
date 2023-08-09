import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {
  Image,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';
import {Actions} from 'react-native-router-flux';
import StarRating from 'react-native-star-rating';
import {
  get_driver_pay_state,
  get_driver_ratings,
  set_online,
} from '../constants/Api';
import {showToast} from '../constants/Global';
import {strings} from '../locales/i18n';
export default class DrawerLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      noticeNotify: false,
      info: null,
      is_online: true,
      vote_count: 0,
      rating: 0,
      is_paied: false,
      driver_id: '',
    };
  }

  async componentDidMount() {
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
      this.setState({info});
      this.get_rating(info['id']);
      let confirmPaied = await get_driver_pay_state(info['id']);
      this.setState({is_paied: confirmPaied?.data});
      if (
        (info['is_online'] == 1 || info['is_online'] == 3) &&
        confirmPaied?.data
      )
        this.setState({is_online: true});
      else {
        this.setState({is_online: false});
      }
    }
  }

  async get_rating(id) {
    if (id !== 1) {
      this.setState({loaded: false});
      await get_driver_ratings(id)
        .then(async (response) => {
          this.setState({loaded: true});
          if (response.data) {
            this.setState({vote_count: response.data[0].count});
            this.setState({rating: response.data[0].rating});
          }
        })
        .catch((error) => {
          this.setState({loaded: true});
          showToast();
        });
    }
  }

  async UNSAFE_componentWillReceiveProps() {
    if (this.state.info && this.state.info['id'])
      this.get_rating(this.state.info['id']);
    let tmp_driver_id = await AsyncStorage.getItem('rate_driver_id');
    if (tmp_driver_id) {
      this.setState({driver_id: tmp_driver_id});
    } else {
      this.setState({driver_id: ''});
    }
    let is_paid = await AsyncStorage.getItem('is_paid');
    if (is_paid === '1') {
      this.setState({
        is_online: true,
        is_paied: true,
      });
    }
  }

  async logout() {
    // await AsyncStorage.clear();
    await AsyncStorage.removeItem('client_booking_id');
    await AsyncStorage.removeItem('client_driver_phone');
    await AsyncStorage.removeItem('client_driver_name');
    await AsyncStorage.removeItem('is_paid');
    await AsyncStorage.removeItem('user_info');
    Actions.reset('initial');
  }

  share() {
    Share.share({
      message: 'Taxiwait Driver',
    });
  }

  onStarRating(rating) {}

  toggleSwitch = async () => {
    if (this.state.info.is_online != 4) {
      this.setState({is_online: !this.state.is_online});
      let info = await AsyncStorage.getItem('user_info');
      if (info) {
        info = JSON.parse(info);
        this.setState({loaded: false});
        await set_online(info['id'], this.state.is_online)
          .then(async (response) => {
            this.setState({loaded: true});
          })
          .catch((error) => {
            this.setState({loaded: true});
            showToast();
          });
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.info && this.state.info.type == '1' ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
              backgroundColor: 'white',
            }}>
            <Image
              source={require('../assets/images/logo.jpg')}
              style={{width: 100, height: 100}}
              resizeMode={'contain'}
            />
          </View>
        ) : this.state.info && this.state.info.type == '0' ? (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              paddingVertical: 10,
              backgroundColor: 'white',
            }}>
            <View style={{flex: 1, alignItems: 'center'}}>
              <StarRating
                disabled={true}
                maxStars={5}
                buttonStyle={{marginHorizontal: 2}}
                fullStarColor={'#F3CC02'}
                emptyStarColor={'#d3d3d3'}
                rating={this.state.rating}
                starSize={20}
                selectedStar={(rating) => this.onStarRating(rating)}
              />
              <Text style={{marginTop: 15}}>
                {this.state.vote_count > 1
                  ? this.state.vote_count + ' votes'
                  : this.state.vote_count + ' vote'}
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'center'}}>
              {this.state.info.car_picture ? (
                <Image
                  source={{
                    uri:
                      'http://149.28.78.240:5010/' +
                      this.state.info.car_picture,
                  }}
                  style={{width: 80, height: 80}}
                  resizeMode={'contain'}
                />
              ) : (
                <Image
                  source={require('../assets/images/logo.jpg')}
                  style={{width: 100, height: 100}}
                  resizeMode={'contain'}
                />
              )}

              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                {this.state.info.car_color}
              </Text>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                {this.state.info.kind}
              </Text>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                {this.state.info.plate_no}
              </Text>
            </View>
          </View>
        ) : null}

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{backgroundColor: '#ffc500', flex: 1}}>
          <View style={{flex: 1}}>
            <View>
              <View style={styles.profile}>
                <TouchableOpacity
                  style={[
                    styles.menuSection,
                    {
                      flexDirection: 'row',
                      paddingLeft:
                        this.state.info && this.state.info.type == '0'
                          ? 25
                          : 50,
                    },
                  ]}
                  onPress={() => Actions.push('myprofile')}>
                  <Text>{strings('profile')}</Text>
                </TouchableOpacity>

                <View>
                  {this.state.info && this.state.info.type == '0' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingRight: 50,
                      }}>
                      <Switch
                        trackColor={{false: '#767577', true: '#767577'}}
                        thumbColor={
                          this.state?.is_online ? '#81c94c' : '#ff1313'
                        }
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={this.toggleSwitch}
                        style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
                        value={this.state?.is_online}
                        disabled={!this.state.is_paied}
                      />
                      {this.state?.is_online ? (
                        <Text style={{marginLeft: 10, fontSize: 18}}>
                          {strings('initial.online')}
                        </Text>
                      ) : (
                        <Text style={{marginLeft: 10, fontSize: 18}}>
                          {strings('initial.offline')}
                        </Text>
                      )}
                    </View>
                  ) : null}
                </View>
              </View>
              {this.state.info && this.state.info.type == '1' ? (
                <TouchableOpacity
                  style={styles.menuSection}
                  onPress={() => Actions.reset('root')}>
                  <Text>{strings('extra.destinatino')}</Text>
                </TouchableOpacity>
              ) : this.state.info && this.state.info.type == '0' ? (
                <TouchableOpacity
                  style={[styles.menuSection, {paddingLeft: 25}]}
                  onPress={() => Actions.push('booking')}>
                  <Text>{strings('extra.booking')}</Text>
                </TouchableOpacity>
              ) : null}
              {this.state.info && this.state.info.type == '1' ? (
                <View>
                  <TouchableOpacity
                    style={styles.menuSection}
                    onPress={() =>
                      this.state.driver_id
                        ? Actions.push('rating', {
                            driver_id: this.state.driver_id,
                          })
                        : Actions.push('driverlist')
                    }>
                    <Text>{strings('extra.rateFavouriteDriver')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuSection}
                    onPress={() => Actions.push('privacy')}>
                    <Text>{strings('extra.privacyPolicyCondition')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuSection}
                    onPress={() => Actions.push('contactus')}>
                    <Text>{strings('extra.support')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuSection}>
                    <View style={{position: 'absolute', top: 15, left: 13}}>
                      <Image
                        source={require('../assets/images/cash.jpeg')}
                        style={{width: 30, height: 30}}
                        resizeMode="contain"
                      />
                    </View>
                    <Text>{strings('extra.payInCash')}</Text>
                    <Text>{strings('extra.ridePayDriver')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuSection}
                    onPress={() => Actions.push('pay')}>
                    <View style={{position: 'absolute', top: 15, left: 13}}>
                      <Image
                        source={require('../assets/images/pay.png')}
                        style={{width: 30, height: 30}}
                        resizeMode="contain"
                      />
                    </View>
                    <Text>{strings('extra.paypal')}</Text>
                    <Text>{strings('extra.linkPaypal')}</Text>
                  </TouchableOpacity>
                </View>
              ) : this.state.info && this.state.info.type == '0' ? (
                <View>
                  <TouchableOpacity
                    style={[styles.menuSection, {paddingLeft: 25}]}
                    onPress={() => Actions.push('driverpay')}>
                    <Text>{strings('extra.yourMonthlyPaymentActive')}</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        paddingRight: 30,
                        paddingBottom: 0,
                        paddingTop: 5,
                      }}>
                      <View style={{flex: 1}}></View>
                      <Image
                        source={require('../assets/images/visa.png')}
                        style={{
                          flex: 1,
                          height: 15,
                          width: '100%',
                          marginRight: 3,
                        }}
                        resizeMode="stretch"
                      />
                      <Image
                        source={require('../assets/images/master.png')}
                        style={{
                          flex: 1,
                          height: 15,
                          width: '100%',
                          marginRight: 3,
                        }}
                        resizeMode="stretch"
                      />
                      <Image
                        source={require('../assets/images/maestro.png')}
                        style={{
                          flex: 1,
                          height: 15,
                          width: '100%',
                          marginRight: 3,
                        }}
                        resizeMode="stretch"
                      />
                      <Image
                        source={require('../assets/images/express.png')}
                        style={{
                          flex: 1,
                          height: 15,
                          width: '100%',
                          marginRight: 3,
                        }}
                        resizeMode="stretch"
                      />
                      <View style={{flex: 1}}></View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuSection, {paddingLeft: 25}]}
                    onPress={() => Actions.push('privacy')}>
                    <Text>{strings('extra.privacyPolicyCondition')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuSection, {paddingLeft: 25}]}
                    onPress={() => Actions.push('support')}>
                    <Text>{strings('extra.support')}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
            {
              <View style={{paddingBottom: 20, flexDirection: 'row'}}>
                <View>
                  <TouchableOpacity
                    style={[
                      styles.menuSection,
                      {
                        paddingLeft:
                          this.state.info && this.state.info.type == '0'
                            ? 25
                            : 50,
                      },
                    ]}
                    onPress={() => this.logout()}>
                    <Text style={{paddingBottom: 10}}>
                      {strings('initial.logout')}
                    </Text>
                    <Icon
                      type="antdesign"
                      name="logout"
                      style={{alignItems: 'flex-start'}}
                      size={30}
                      color="black"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.menuSection,
                      {
                        paddingLeft:
                          this.state.info && this.state.info.type == '0'
                            ? 25
                            : 50,
                      },
                    ]}
                    onPress={() => this.share()}>
                    <Text style={{paddingBottom: 10}}>Share</Text>
                    <Icon
                      type="entypo"
                      name="share"
                      style={{alignItems: 'flex-start', paddingRight: 8}}
                      size={30}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                  onPress={() => Actions.drawerClose()}>
                  <Image
                    source={require('../assets/images/processed4.png')}
                    style={{width: 60, height: 60}}
                  />
                </TouchableOpacity>
              </View>
            }
          </View>
          <View style={{width: '100%', height: 100}}>
            <Image
              source={require('../assets/images/taxi1.jpg')}
              style={{width: '100%', height: 120}}
              resizeMode="stretch"
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flex: 1,
    backgroundColor: '#ffc500',
  },
  menuSection: {
    paddingLeft: 50,
    paddingVertical: 10,
  },
  profile: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
