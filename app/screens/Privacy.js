import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import MainHeader from '../components/MainHeader';
import {strings} from '../locales/i18n';

export default class Privacy extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      loaded: true,
      type: '',
    };
  }

  async componentDidMount() {
    let userInfo = await AsyncStorage.getItem('user_info');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
      this.setState({type: userInfo.type});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <MainHeader />
        <ScrollView style={{flex: 1, padding: 20, marginBottom: 20}}>
          <Text style={{lineHeight: 20}}>
            {strings('privacy')[0]}
            {'\n'}
            {'\n'}
            {strings('privacy')[1]}
            {'\n'}
            {'\n'}
            {strings('privacy')[2]}
            {'\n'}
            {'\n'}
            {strings('privacy')[3]}
            {'\n'}
            {'\n'}
            {strings('privacy')[4]}
            {'\n'}
            {'\n'}
            {strings('privacy')[5]}
            {'\n'}
            {'\n'}
            {strings('privacy')[6]}
            {'\n'}
            {'\n'}
            {strings('privacy')[7]}
            {'\n'}
            {'\n'}
            {strings('privacy')[8]}
            {'\n'}
            {'\n'}
            {strings('privacy')[9]}
            {'\n'}
            {'\n'}
            {strings('privacy')[10]}
            {'\n'}
            {'\n'}
            {strings('privacy')[11]}
            {'\n'}
            {'\n'}
            {strings('privacy')[12]}
            {'\n'}
            {'\n'}
            {strings('privacy')[13]}
            {'\n'}
            {'\n'}
            {strings('privacy')[14]}
            {'\n'}
            {'\n'}
            {strings('privacy')[15]}
            {'\n'}
            {'\n'}
          </Text>

          <Text style={{marginBottom: 30, textAlign: 'center'}}>
            Copyright©taxiwait Since 2020
          </Text>
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

Privacy.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
