import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import {showToast} from '../constants/Global';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import MainHeader from '../components/MainHeader';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Actions} from 'react-native-router-flux';
import {contactus} from '../constants/Api';
import {strings} from '../locales/i18n';
export default class ContactUs extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      loaded: true,
      email: '',
      title: '',
      description: '',
    };
  }

  async componentDidMount() {}

  async send() {
    this.setState({loaded: false});
    await contactus(this.state.email, this.state.title, this.state.description)
      .then(async (response) => {
        this.setState({loaded: true});
        if (response.data) {
          Actions.reset('root');
        }
      })
      .catch((error) => {
        this.setState({loaded: true});
        // showToast();
      });
    Actions.reset('root');
  }

  render() {
    return (
      <View style={styles.container}>
        <MainHeader />
        <KeyboardAwareScrollView
          resetScrollToCoords={{x: 0, y: 0}}
          scrollEnabled={true}
          style={{flex: 1}}>
          <View style={{padding: 20}}>
            <Text style={{fontWeight: 'bold', fontSize: 20, paddingBottom: 20}}>
              {strings('support.contactUs')}
            </Text>
            <Text style={{paddingBottom: 5}}>{strings('initial.email')}</Text>
            <TextInput
              style={
                this.state.loginError
                  ? [styles.input, styles.error]
                  : styles.input
              }
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
              keyboardType="email-address"
            />
            <Text style={{paddingBottom: 5}}>{strings('initial.app')}</Text>
            <TextInput
              style={
                this.state.loginError
                  ? [styles.input, styles.error]
                  : [styles.input]
              }
              onChangeText={(title) => this.setState({title})}
              value={this.state.title}
            />
            <Text style={{paddingBottom: 5}}>
              {strings('initial.description')}
            </Text>
            <TextInput
              style={
                this.state.loginError
                  ? [styles.input, styles.error]
                  : [styles.input, {height: 130, textAlignVertical: 'top'}]
              }
              onChangeText={(description) => this.setState({description})}
              value={this.state.description}
              multiline={true}
              numberOfLines={6}
            />

            <TouchableOpacity
              style={{alignItems: 'center', marginTop: 15}}
              onPress={() => this.send()}>
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
                  {strings('initial.send')}
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
      </View>
    );
  }
}

ContactUs.navigationOptions = {
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
});
