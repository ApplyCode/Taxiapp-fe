import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  TextInput,
  PermissionsAndroid,
} from 'react-native';
import {showToast} from '../constants/Global';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import MainHeader from '../components/MainHeader';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RNPickerSelect from 'react-native-picker-select';
import Layout from '../constants/Layout';
import {get_user_info, update_profile, client_signup} from '../constants/Api';
import * as ImagePicker from 'react-native-image-picker';
import {Icon} from 'react-native-elements';
import {strings} from '../locales/i18n';

export default class EditDriver extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      userError: false,
      passwordError: false,
      emailError: false,
      countryError: false,
      phoneError: false,
      user: '',
      password: '',
      email: '',
      country: '',
      phone: '',
      car_picture: '',
      license_front: '',
      license_back: '',
      is_show: false,
      countrycode: '',
      kind: '',
      car_color: '',
      type: '',
      plate_no: '',
    };
  }

  async componentDidMount() {
    if (this.props.driver_id) {
      this.setState({loaded: false});
      await get_user_info(this.props.driver_id)
        .then(async (response) => {
          this.setState({loaded: true});
          if (response.data) {
            console.log(response.data);
            this.setState({user: response.data.user});
            this.setState({email: response.data.email});
            this.setState({country: response.data.country});
            this.setState({phone: response.data.phone});
            this.setState({countrycode: response.data.phone_code});
            this.setState({type: response.data.type});
            this.setState({kind: response.data.kind});
            this.setState({car_color: response.data.car_color});
            this.setState({plate_no: response.data.plate_no});
            this.setState({car_picture: response.data.car_picture});
            this.setState({license_front: response.data.license_front});
            this.setState({license_back: response.data.license_back});
          }
        })
        .catch((error) => {
          this.setState({loaded: true});
          showToast();
        });
    }
  }

  async signup() {
    let valid = true;
    if (this.state.user == '') {
      this.setState({userError: true});
      valid = false;
    } else {
      this.setState({userError: false});
    }
    if (this.state.email == '') {
      this.setState({emailError: true});
      valid = false;
    } else {
      this.setState({emailError: false});
    }
    if (this.state.phone == '') {
      this.setState({phoneError: true});
      valid = false;
    } else {
      this.setState({phoneError: false});
    }
    if (this.state.country == '') {
      this.setState({countryError: true});
      valid = false;
    } else {
      this.setState({countryError: false});
    }
    if (valid) {
      this.setState({loaded: false});
      if (this.props.driver_id)
        await update_profile(
          this.props.driver_id,
          this.state.user,
          this.state.password,
          this.state.email,
          this.state.phone,
          this.state.country,
          this.state.countrycode,
          this.state.kind,
          this.state.car_color,
          this.state.plate_no,
          this.state.car_picture,
          this.state.license_front,
          this.state.license_back,
        )
          .then(async (response) => {
            this.setState({loaded: true});
            await AsyncStorage.setItem(
              'user_info',
              JSON.stringify(response.data),
            );
            Actions.reset('admin');
          })
          .catch((error) => {
            this.setState({loaded: true});
            // showToast();
          });
      else
        await client_signup(
          this.state.user,
          this.state.password,
          this.state.email,
          this.state.phone,
          this.state.country,
          0,
          this.state.countrycode,
          this.state.kind,
          this.state.car_color,
          this.state.plate_no,
          this.state.car_picture,
          this.state.license_front,
          this.state.license_back,
        )
          .then(async (response) => {
            this.setState({loaded: true});
            if (response.data) Actions.reset('admin');
            else showToast(strings('msgBox.emailExist'));
          })
          .catch((error) => {
            this.setState({loaded: true});
            showToast();
          });
    }
  }

  _pickImage = async (type) => {
    const granted1 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'App needs camera permission',
      },
    );

    const granted2 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'External Storage Write Permission',
        message: 'App needs write permission',
      },
    );

    if (granted1 == 'granted' && granted2 == 'granted') {
      let options = {
        mediaType: 'photo',
        quality: 0.1,
        includeBase64: true,
      };

      ImagePicker.launchCamera(options, (response) => {
        if (response && response.uri) this._handleImagePicked(response, type);
      });
    }
  };

  _handleImagePicked = async (pickerResult, type) => {
    try {
      var _self = this;
      setTimeout(async function () {
        if (type == 'car') _self.setState({car_picture: pickerResult});
        else if (type == 'license_front')
          _self.setState({license_front: pickerResult});
        else if (type == 'license_back')
          _self.setState({license_back: pickerResult});
      }, 300);
    } catch (e) {}
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <MainHeader isAdmin={true} />
        <KeyboardAwareScrollView
          resetScrollToCoords={{x: 0, y: 0}}
          scrollEnabled={true}
          style={{flex: 1}}>
          <View style={{padding: 20}}>
            <Text style={{fontWeight: 'bold', fontSize: 20, paddingBottom: 20}}>
              {strings('editDriver.driverProfile')}
            </Text>
            <Text style={{paddingBottom: 5}}>
              {' '}
              {strings('initial.name_user')}
            </Text>
            <TextInput
              style={
                this.state.userError
                  ? [styles.input, styles.error]
                  : styles.input
              }
              onChangeText={(user) => this.setState({user})}
              value={this.state.user}
            />

            <Text style={{paddingBottom: 5}}>{strings('initial.pwd')}</Text>
            <View>
              <TextInput
                style={styles.input}
                onChangeText={(password) => this.setState({password})}
                value={this.state.password}
                secureTextEntry={this.state.is_show ? false : true}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 0,
                  backgroundColor: '#E0E0E0',
                  height: 50,
                  width: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => this.setState({is_show: !this.state.is_show})}>
                <View>
                  <Icon
                    type="entypo"
                    name={this.state.is_show ? 'eye' : 'eye-with-line'}
                    size={20}
                    color="black"
                  />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={{paddingBottom: 5}}>{strings('initial.email')}</Text>
            <TextInput
              style={
                this.state.emailError
                  ? [styles.input, styles.error]
                  : [styles.input]
              }
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
              keyboardType="email-address"
            />

            <Text style={{paddingBottom: 5}}>{strings('initial.phone')}</Text>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                borderColor: '#ABAAAC',
                borderWidth: 1,
                borderRadius: 6,
                marginBottom: 20,
                backgroundColor: '#F7F8F9',
              }}>
              <View>
                <RNPickerSelect
                  onValueChange={(value) => {
                    this.setState({countrycode: value});
                  }}
                  items={Layout.PhoneList}
                  style={{
                    ...pickerSelectCode,
                    iconContainer: {
                      top: 15,
                      right: 5,
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
                  value={this.state.countrycode}
                  useNativeAndroidPickerStyle={false}
                />
              </View>
              <TextInput
                style={
                  this.state.phoneError
                    ? [
                        styles.input,
                        styles.error,
                        {borderWidth: 0, borderRadius: 0, marginBottom: 0},
                      ]
                    : [
                        styles.input,
                        {borderWidth: 0, borderRadius: 0, marginBottom: 0},
                      ]
                }
                onChangeText={(phone) => this.setState({phone})}
                value={this.state.phone}
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text style={{paddingBottom: 5}}>
                {strings('driver.carTyoe')}
              </Text>
              <TextInput
                style={[styles.input]}
                onChangeText={(kind) => this.setState({kind})}
                value={this.state.kind}
              />

              <Text style={{paddingBottom: 5}}>
                {strings('driver.carColor')}
              </Text>
              <TextInput
                style={[styles.input]}
                onChangeText={(car_color) => this.setState({car_color})}
                value={this.state.car_color}
              />

              <Text style={{paddingBottom: 5}}>
                {strings('driver.license')}
              </Text>
              <TextInput
                style={[styles.input]}
                onChangeText={(plate_no) => this.setState({plate_no})}
                value={this.state.plate_no}
              />
            </View>

            <Text style={{paddingBottom: 5}}>
              {strings('signUp.countryCity')}
            </Text>
            <RNPickerSelect
              onValueChange={(value) => this.setState({country: value})}
              items={Layout.Country_City}
              value={this.state.country.toString()}
              style={
                this.state.countryError
                  ? {
                      ...pickerSelectStylesError,
                      iconContainer: {
                        top: 27,
                        right: 16,
                      },
                    }
                  : {
                      ...pickerSelectStyles,
                      iconContainer: {
                        top: 27,
                        right: 16,
                      },
                    }
              }
              placeholder={{value: '', label: 'Select Country & City'}}
              useNativeAndroidPickerStyle={false}
            />
            <View>
              <TouchableOpacity
                style={[styles.loginBtn]}
                onPress={() => this._pickImage('car')}>
                <Text style={{color: 'white'}}>
                  {strings('driver.facePic')}
                </Text>
              </TouchableOpacity>
              {this.state.car_picture && this.state.car_picture.uri ? (
                <Image
                  source={{uri: this.state.car_picture.uri}}
                  style={{width: 150, height: 150, marginTop: 5}}
                  resizeMode="contain"
                />
              ) : this.state.car_picture ? (
                <Image
                  source={{
                    uri: 'http://149.28.78.240:5010/' + this.state.car_picture,
                  }}
                  style={{width: 150, height: 150, marginTop: 5}}
                  resizeMode="center"
                  resizeMethod="resize"
                />
              ) : null}
              <TouchableOpacity
                style={[styles.loginBtn]}
                onPress={() => this._pickImage('license_front')}>
                <Text style={{color: 'white'}}>
                  {strings('driver.liceFront')}
                </Text>
              </TouchableOpacity>
              {this.state.license_front && this.state.license_front.uri ? (
                <Image
                  source={{uri: this.state.license_front.uri}}
                  style={{width: 150, height: 150, marginTop: 5}}
                  resizeMode="contain"
                />
              ) : this.state.license_front ? (
                <Image
                  source={{
                    uri:
                      'http://149.28.78.240:5010/' + this.state.license_front,
                  }}
                  style={{width: 150, height: 150, marginTop: 5}}
                  resizeMode="center"
                  resizeMethod="resize"
                />
              ) : null}
              <TouchableOpacity
                style={[styles.loginBtn]}
                onPress={() => this._pickImage('license_back')}>
                <Text style={{color: 'white'}}>
                  {strings('driver.liceBack')}
                </Text>
              </TouchableOpacity>
              {this.state.license_back && this.state.license_back.uri ? (
                <Image
                  source={{uri: this.state.license_back.uri}}
                  style={{width: 150, height: 150, marginTop: 5}}
                  resizeMode="contain"
                />
              ) : this.state.license_back ? (
                <Image
                  source={{
                    uri: 'http://149.28.78.240:5010/' + this.state.license_back,
                  }}
                  style={{width: 150, height: 150, marginTop: 5}}
                  resizeMode="center"
                  resizeMethod="resize"
                />
              ) : null}
            </View>

            <TouchableOpacity
              style={{alignItems: 'center', marginTop: 15}}
              onPress={() => this.signup()}>
              <View
                style={{
                  backgroundColor: '#dab844',
                  paddingVertical: 10,
                  width: 150,
                  borderRadius: 5,
                  alignItems: 'center',
                  flex: 1,
                }}>
                <Text
                  style={{color: 'white', textAlign: 'center', fontSize: 20}}>
                  {this.props.driver_id ? 'Update' : 'Add driver'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>

        <Spinner_bar
          color={'#27cccd'}
          visible={!this.state.loaded}
          textContent={''}
          overlayColor={'rgba(0, 0, 0, 0.5)'}
        />
      </SafeAreaView>
    );
  }
}

EditDriver.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  input: {
    height: 50,
    fontSize: 14,
    paddingHorizontal: 12,
    borderColor: '#737373',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#F7F8F9',
    marginBottom: 20,
    flex: 1,
  },
  error: {
    borderWidth: 1,
    borderColor: '#EA3223',
  },
  loginBtn: {
    paddingVertical: Platform.OS == 'ios' ? 17 : 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#dab844',
    width: 150,
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
    backgroundColor: '#F7F8F9',
  },
  inputAndroid: {
    width: '100%',
    height: 50,
    color: '#707070',
    fontSize: 14,
    paddingRight: 20,
    borderColor: '#ABAAAC',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    backgroundColor: '#F7F8F9',
  },
});
export const pickerSelectStylesError = StyleSheet.create({
  inputIOS: {
    width: '100%',
    height: 50,
    borderColor: '#EA3223',
    paddingLeft: 10,
    paddingRight: 20,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 14,
  },
  inputAndroid: {
    width: '100%',
    height: 50,
    borderColor: '#EA3223',
    fontSize: 14,
    paddingRight: 20,
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
  },
});

export const pickerSelectCode = StyleSheet.create({
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
    backgroundColor: '#F7F8F9',
  },
  inputAndroid: {
    width: 160,
    height: 50,
    color: 'black',
    fontSize: 14,
    borderColor: '#ABAAAC',
    borderRightWidth: 1,
    paddingLeft: 10,
  },
});
