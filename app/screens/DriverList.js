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
import AsyncStorage from '@react-native-community/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Actions} from 'react-native-router-flux';
import StarRating from 'react-native-star-rating';
import {get_driver_list} from '../constants/Api';
import { strings } from '../locales/i18n';
const positionLabel = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export default class DriverList extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      loaded: true,
      email: '',
      title: '',
      description: '',
      list: null,
    };

    this.refresh = this.refresh.bind(this);
    this.renderList = this.renderList.bind(this);
  }

  async componentDidMount() {
    this.refresh();
  }

  async refresh() {
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
      this.setState({loaded: false});
      await get_driver_list(info['id'])
        .then(async (response) => {
          this.setState({loaded: true});
          if (response.data) {
            this.setState({list: response.data});
          }
        })
        .catch((error) => {
          this.setState({loaded: true});
          showToast();
        });
    }
  }

  renderList() {
    return (this.state.list ?? []).map((item, index) => {
      if (item.client_id || item.is_favorite)
        return (
          <View key={index} style={styles.section}>
            <View style={{alignItems: 'center'}}>
              {item.is_favorite && (
                <View style={{position: 'absolute', zIndex: 99, right: 0}}>
                  <Image
                    source={require('../assets/images/heart.png')}
                    resizeMode="contain"
                    style={{height: 20, width: 20}}
                  />
                </View>
              )}
              <Image
                source={require('../assets/images/logo.jpg')}
                resizeMode="contain"
                style={{height: 60, width: 60}}
              />
              {item.car_color && (
                <Text style={{textAlign: 'center'}}>{item.car_color}</Text>
              )}
              {item.kind && (
                <Text style={{textAlign: 'center'}}>{item.kind}</Text>
              )}
              {item.plate_no && (
                <Text style={{textAlign: 'center'}}>{item.plate_no}</Text>
              )}
            </View>
            <View style={{paddingLeft: 20}}>
              <Text style={{fontSize: 20}}>{item.user}</Text>
              {item.rating && (
                <StarRating
                  disabled={true}
                  maxStars={5}
                  buttonStyle={{marginHorizontal: 2, marginVertical: 10}}
                  fullStarColor={'#ffc500'}
                  emptyStarColor={'#d3d3d3'}
                  containerStyle={{justifyContent: 'center'}}
                  rating={item.rating}
                  starSize={30}
                />
              )}
              <Text style={{fontSize: 20}}>
                {item.cnt > 1 ? item.cnt + ' votes' : item.cnt + ' vote'}
              </Text>
            </View>
          </View>
        );
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <MainHeader title={strings('extra.favoriteDriver')} />
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{backgroundColor: '#e2e2e2'}}>
          {this.renderList()}
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

DriverList.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2e2e2',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
