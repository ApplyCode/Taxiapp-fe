import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import {Actions} from 'react-native-router-flux';
import MainHeader from '../components/MainHeader';
import {get_booking_list} from '../constants/Api';
import {showToast} from '../constants/Global';
import {strings} from '../locales/i18n';

const positionLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export default class Booking extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      loaded: true,
      email: '',
      title: '',
      description: '',
      list: [],
    };
  }

  async componentDidMount() {
    this.refresh();
  }

  UNSAFE_componentWillReceiveProps() {
    this.refresh();
  }

  async refresh() {
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
    }

    this.setState({loaded: false});
    await get_booking_list(info['id'])
      .then(async (response) => {
        this.setState({loaded: true});
        if (response.data) {
          let decline_list = await AsyncStorage.getItem('decline_list');
          if (decline_list) decline_list = decline_list.split(',');
          let temp = [];
          for (var i = 0; i < response.data.length; i++) {
            let exist = 0;
            if (decline_list) {
              for (var j = 0; j < decline_list.length; j++) {
                if (response.data[i].id == decline_list[j]) {
                  exist = 1;
                  break;
                }
              }
            }

            if (exist == 0) {
              temp.push(response.data[i]);
            }
          }
          this.setState({list: temp});
        } else {
          this.setState({list: []});
        }
      })
      .catch((error) => {
        this.setState({loaded: true});
        // showToast();
      });
  }

  renderPlace(locations) {
    return locations.map((item, index) => {
      return (
        <View key={index} style={{flexDirection: 'row', paddingTop: 10}}>
          <Text style={{color: '#da4444', paddingRight: 20, fontSize: 16}}>
            {positionLabel[index]}
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              flexWrap: 'wrap',
              paddingRight: 10,
            }}>
            {item.place}
          </Text>
        </View>
      );
    });
  }

  renderList() {
    return this.state.list.map((item, index) => {
      return (
        <TouchableOpacity
          key={index}
          style={styles.section}
          onPress={() => Actions.push('reservation', {id: item.id})}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text>{strings('booking.taxiEconomy')}</Text>
            <Text>
              {item.price} {item.currency}
            </Text>
          </View>
          <View>
            {item.locations ? this.renderPlace(item.locations) : null}
          </View>
        </TouchableOpacity>
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <MainHeader isDriver={true} />
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            paddingHorizontal: 20,
            paddingVertical: 10,
            justifyContent: 'space-between',
          }}></View>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{backgroundColor: 'white'}}>
          {this.state.list.length > 0 ? this.renderList() : null}
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

Booking.navigationOptions = {
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
    marginBottom: 4,
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
});
