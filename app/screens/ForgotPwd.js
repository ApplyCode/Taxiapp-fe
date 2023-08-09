import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
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
import {forgot} from '../constants/Api';
import {showToast} from '../constants/Global';
import {strings} from '../locales/i18n';
export default class ForgotPwd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      emailError: false,
      email: '',
      password: '',
      passwordError: false,
      confirmPassword: '',
      confirmPasswordError: false,
      is_show: false,
    };
  }

  async componentDidMount() {}

  async forgot() {
    let valid = true;
    if (this.state.email) {
      this.setState({emailError: false});
    } else {
      valid = false;
      this.setState({emailError: true});
    }
    if (this.state.password) {
      this.setState({passwordError: false});
    } else {
      valid = false;
      this.setState({passwordError: true});
    }
    if (this.state.confirmPassword) {
      this.setState({confirmPasswordError: false});
    } else {
      valid = false;
      this.setState({confirmPasswordError: true});
    }
    if (this.state.password != this.state.confirmPassword) {
      valid = false;
      this.setState({passwordError: true});
      this.setState({confirmPasswordError: true});
    }
    if (valid) {
      this.setState({loaded: false});
      await forgot(
        this.state.email,
        this.state.password,
        this.props.type == 'client' ? 1 : 0,
      )
        .then(async (response) => {
          this.setState({loaded: true});
          if (response.data) {
            Actions.reset('initial');
          } else {
            showToast(strings('msgBox.userIdExist'));
          }
        })
        .catch((error) => {
          this.setState({loaded: true});
          showToast();
        });
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={strings('initial.app')} />
        <KeyboardAwareScrollView
          resetScrollToCoords={{x: 0, y: 0}}
          scrollEnabled={true}
          style={{flex: 1}}>
          <View style={{padding: 20}}>
            <View style={{alignItems: 'center'}}>
              <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                {strings('forgotPwd.resetPwd')}
              </Text>
            </View>
            <View style={{marginTop: 10}}>
              <Text style={{marginBottom: 5}}>User id</Text>
              <TextInput
                style={
                  this.state.emailError
                    ? [styles.input, styles.error]
                    : styles.input
                }
                onChangeText={(email) => this.setState({email})}
                value={this.state.email}
              />
            </View>
            <Text style={{marginBottom: 5, marginTop: 10}}>
              {strings('initial.pwd')}
            </Text>
            <View>
              <TextInput
                style={
                  this.state.passwordError
                    ? [styles.input, styles.error]
                    : styles.input
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
            <Text style={{marginBottom: 5, marginTop: 10}}>
              {strings('forgotPwd.confirmPwd')}
            </Text>
            <View>
              <TextInput
                style={
                  this.state.confirmPasswordError
                    ? [styles.input, styles.error]
                    : styles.input
                }
                onChangeText={(confirmPassword) =>
                  this.setState({confirmPassword})
                }
                value={this.state.confirmPassword}
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
            <TouchableOpacity
              style={{alignItems: 'center', marginTop: 15}}
              onPress={() => this.forgot()}>
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
                  {strings('initial.reset')}
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

ForgotPwd.navigationOptions = {
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
