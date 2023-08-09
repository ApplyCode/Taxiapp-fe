import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import {Actions} from 'react-native-router-flux';
import Header from '../components/Header';
import {login} from '../constants/Api';
import {showToast} from '../constants/Global';
import {strings} from '../locales/i18n';
function myiOSPromptCallback(permission) {
  // do something with permission value
}
export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      loginError: false,
      user: '',
      password: '',
      isEnabled: false,
      is_show: false,
    };
  }

  async componentDidMount() {}

  async login() {
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
    if (valid) {
      this.setState({loaded: false});
      let token = await AsyncStorage.getItem('onesignal_token');
      await login(
        this.state.user,
        this.state.password,
        this.props.type == 'client' ? 1 : 0,
        token,
      )
        .then(async (response) => {
          this.setState({loaded: true});
          if (response.data) {
            if (this.state.isEnabled) {
              await AsyncStorage.setItem('is_keep', 'on');
            }
            await AsyncStorage.setItem(
              'user_info',
              JSON.stringify(response.data),
            );
            if (this.state.user != 'admin') {
              Actions.reset('root');
            } else {
              Actions.reset('admin');
            }
          } else {
            showToast(strings('msgBox.wrongPwd'));
          }
        })
        .catch((error) => {
          this.setState({loaded: true});
          showToast();
        });
    }
  }

  toggleSwitch = () => {
    this.setState({isEnabled: !this.state.isEnabled});
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Taxiwait Driver" />
        <KeyboardAwareScrollView
          resetScrollToCoords={{x: 0, y: 0}}
          scrollEnabled={true}
          style={{flex: 1}}>
          <View style={{padding: 20}}>
            <Text style={{fontWeight: 'bold', fontSize: 20, paddingBottom: 20}}>
              {strings('login.title')}
            </Text>
            <Text style={{paddingBottom: 5}}>User</Text>
            <TextInput
              style={
                this.state.loginError
                  ? [styles.input, styles.error]
                  : styles.input
              }
              onChangeText={(user) => this.setState({user})}
              value={this.state.user}
            />
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{paddingBottom: 5}}>{strings('initial.pwd')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={this.state.isEnabled ? '#1267F6' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={this.toggleSwitch}
                  value={this.state.isEnabled}
                />
                <Text>{strings('login.kepLog')}</Text>
              </View>
            </View>
            <View>
              <TextInput
                style={
                  this.state.loginError
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
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                onPress={() => Actions.push('signup', {type: this.props.type})}>
                <Text
                  style={{
                    color: '#dab844',
                    fontSize: 16,
                    textDecorationLine: 'underline',
                    marginBottom: 10,
                  }}>
                  {strings('login.needAcc')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Actions.push('forgotpwd', {type: this.props.type})
                }>
                <Text
                  style={{
                    color: '#dab844',
                    fontSize: 16,
                    textDecorationLine: 'underline',
                    marginBottom: 10,
                  }}>
                  {strings('forgotPwd.title')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{alignItems: 'center', marginTop: 15}}
              onPress={() => this.login()}>
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
                  {strings('initial.login')}
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

Login.navigationOptions = {
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
});
