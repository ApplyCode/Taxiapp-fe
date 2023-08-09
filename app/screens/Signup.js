import React from 'react';
import {
  Image, PermissionsAndroid, Platform,
  SafeAreaView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as ImagePicker from 'react-native-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import RNPickerSelect from 'react-native-picker-select';
import { Actions } from 'react-native-router-flux';
import Header from '../components/Header';
import { client_signup, updateAvatar } from '../constants/Api';
import { showToast } from '../constants/Global';
import Layout from '../constants/Layout';
import { strings } from '../locales/i18n';
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
      plate_no: '',
    };
  }

  async componentDidMount() {}

  async signup() {
    let valid = true;
    if (this.state.user == '') {
      this.setState({userError: true});
      valid = false;
    } else {
      this.setState({userError: false});
    }
    if (this.state.password == '') {
      this.setState({passwordError: true});
      valid = false;
    } else {
      this.setState({passwordError: false});
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
      await client_signup(
        this.state.user,
        this.state.password,
        this.state.email,
        this.state.phone,
        this.state.country,
        this.props.type == 'client' ? 1 : 0,
        this.state.countrycode,
        this.state.kind,
        this.state.car_color,
        this.state.plate_no,
        this.state.car_picture,
        this.state.license_front,
        this.state.license_back,
      )
        .then(async (response) => {
          await updateAvatar(this.state.car_picture).then(async (res) => {});

          this.setState({loaded: true});
          if (response.data) {
            Actions.reset('initial');
          } else {
            showToast(strings('msgBox.emailExist'));
          }
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
        if (response && response.uri) {
          this._handleImagePicked(response, type);
        }
      });
    }
  };

  _handleImagePicked = async (pickerResult, type) => {
    try {
      var _self = this;
      setTimeout(async function () {
        if (type == 'car') {
          _self.setState({car_picture: pickerResult});
        } else if (type == 'license_front') {
          _self.setState({license_front: pickerResult});
        } else if (type == 'license_back') {
          _self.setState({license_back: pickerResult});
        }
      }, 300);
    } catch (e) {}
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={strings('initial.app')} />
        <KeyboardAwareScrollView
          resetScrollToCoords={{x: 0, y: 0}}
          scrollEnabled={true}
          style={{flex: 1}}>
          <View style={{padding: 20}}>
            <Text style={{fontWeight: 'bold', fontSize: 20, paddingBottom: 20}}>
              {strings('initial.signUp')}
            </Text>
            <Text style={{paddingBottom: 5}}>
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
                style={
                  this.state.passwordError
                    ? [styles.input, styles.error]
                    : [styles.input]
                }
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
                <View
                  onPress={() => this.setState({is_show: !this.state.is_show})}>
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
                        {
                          borderWidth: 0,
                          borderRadius: 0,
                          marginBottom: 0,
                          flex: 1,
                          borderRadius: 10,
                        },
                      ]
                    : [
                        styles.input,
                        {
                          borderWidth: 0,
                          borderRadius: 0,
                          marginBottom: 0,
                          flex: 1,
                          borderRadius: 10,
                        },
                      ]
                }
                onChangeText={(phone) => this.setState({phone})}
                value={this.state.phone}
                keyboardType="phone-pad"
              />
            </View>

            {this.props.type == 'driver' ? (
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
            ) : null}

            <Text style={{paddingBottom: 5}}>
              {strings('signUp.countryCity')}
            </Text>
            <RNPickerSelect
              onValueChange={(value) => this.setState({country: value})}
              items={Layout.Country_City}
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

            <Text style={{paddingVertical: 5}}>
              {strings('signUp.description')}
            </Text>

            {this.props.type == 'driver' ? (
              <View>
                <TouchableOpacity
                  style={[styles.loginBtn]}
                  onPress={() => this._pickImage('car')}>
                  <Text style={{color: 'white'}}>
                    {strings('driver.facePic')}
                  </Text>
                </TouchableOpacity>
                {this.state.car_picture ? (
                  <Image
                    source={{uri: this.state.car_picture.uri}}
                    style={{width: 150, height: 150, marginTop: 5}}
                    resizeMode="contain"
                  />
                ) : null}
                <TouchableOpacity
                  style={[styles.loginBtn]}
                  onPress={() => this._pickImage('license_front')}>
                  <Text style={{color: 'white'}}>
                    {strings('driver.liceFront')}
                  </Text>
                </TouchableOpacity>
                {this.state.license_front ? (
                  <Image
                    source={{uri: this.state.license_front.uri}}
                    style={{width: 150, height: 150, marginTop: 5}}
                    resizeMode="contain"
                  />
                ) : null}
                <TouchableOpacity
                  style={[styles.loginBtn]}
                  onPress={() => this._pickImage('license_back')}>
                  <Text style={{color: 'white'}}>
                    {strings('driver.liceBack')}
                  </Text>
                </TouchableOpacity>
                {this.state.license_back ? (
                  <Image
                    source={{uri: this.state.license_back.uri}}
                    style={{width: 150, height: 150, marginTop: 5}}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity
              style={{alignItems: 'center', marginTop: 15}}
              onPress={() => this.signup()}>
              <View
                style={{
                  backgroundColor: '#dab844',
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  minWidth: 150,
                  alignItems: 'center',
                  flex: 1,
                }}>
                <Text
                  style={{color: 'white', textAlign: 'center', fontSize: 20}}>
                  {strings('initial.signUp')}
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

Signup.navigationOptions = {
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
    color: 'black',
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
    color: 'black',
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
