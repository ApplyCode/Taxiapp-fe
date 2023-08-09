import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  View,
} from 'react-native';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import {Actions} from 'react-native-router-flux';
import Header from '../components/Header';
import {get_driver_list_admin, remove_driver, setOnOff} from '../constants/Api';
import {showToast} from '../constants/Global';
import Layout from '../constants/Layout';
import moment from 'moment';
export default class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      loaded: true,
      email: '',
      title: '',
      description: '',
      list: null,
      showList: null,
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  async componentDidMount() {
    this.refresh();
  }

  UNSAFE_componentWillReceiveProps() {
    this.refresh();
  }

  handleSearch(val) {
    let _list = [];
    this.state.list.map((item) => {
      if (
        item.user.includes(val) ||
        item.email.includes(val) ||
        `${item.phone_code} ${item.phone}`.includes(val)
      )
        _list.push(item);
    });
    this.setState({showList: _list});
  }

  async refresh() {
    let info = await AsyncStorage.getItem('user_info');
    if (info) {
      info = JSON.parse(info);
    }
    this.setState({loaded: false});
    await get_driver_list_admin()
      .then(async (response) => {
        this.setState({loaded: true});
        if (response.data) {
          this.setState({list: response.data, showList: response.data});
        }
      })
      .catch((error) => {
        this.setState({loaded: true});
        showToast();
      });
  }

  async removeDriver(driver_id) {
    Alert.alert(
      'Remove',
      'Do you want to remove driver?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.remove(driver_id)},
      ],
      {cancelable: false},
    );
  }

  async remove(driver_id) {
    this.setState({loaded: false});
    await remove_driver(driver_id)
      .then(async (response) => {
        this.refresh();
      })
      .catch((error) => {
        this.setState({loaded: true});
        showToast();
      });
  }

  async setOnOff(item) {
    if (
      (item.is_online == 1 || item.is_online == 3) &&
      moment(item.pay_date).unix() - moment().unix() > 0
    ) {
      var on_off = 4;
    } else {
      var on_off = 3;
    }
    driver_id = item.id;
    // this.setState({loaded: false});
    await setOnOff(driver_id, on_off)
      .then(async (response) => {
        this.setState({loaded: true});
        this.refresh();
      })
      .catch((error) => {
        this.setState({loaded: true});
        showToast();
      });
  }

  editDriver(driver_id) {
    Actions.push('edit_driver', {driver_id: driver_id});
  }

  renderList() {
    return this.state.showList.map((item, index) => {
      let country = item.country;
      let countryName = '';
      if (Layout.Country_City && Layout.Country_City.length > 0) {
        Layout.Country_City.map((item, index) => {
          if (country == item.value) countryName = item.label;
        });
      }
      return (
        <View key={index} style={styles.section}>
          <View style={{width: '100%', flexDirection: 'row'}}>
            <Switch
              trackColor={{false: '#767577', true: '#767577'}}
              thumbColor={
                (item.is_online == 1 || item.is_online == 3) &&
                moment(item.pay_date).unix() - moment().unix() > 0
                  ? '#81c94c'
                  : '#ff1313'
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => this.setOnOff(item)}
              style={{transform: [{scaleX: 1.5}, {scaleY: 1.5}]}}
              value={
                (item.is_online == 1 || item.is_online == 3) &&
                moment(item.pay_date).unix() - moment().unix() > 0
              }
            />
            {(item.is_online == 1 || item.is_online == 3) &&
            moment(item.pay_date).unix() - moment().unix() > 0 ? (
              <Text style={{marginLeft: 10, fontSize: 18}}>Online</Text>
            ) : (
              <Text style={{marginLeft: 10, fontSize: 18}}>Offline</Text>
            )}
          </View>
          <View style={{alignItems: 'center', flexDirection: 'row'}}>
            {item.car_picture ? (
              <Image
                source={{uri: 'http://149.28.78.240:5010/' + item.car_picture}}
                resizeMode="contain"
                resizeMethod="resize"
                style={{height: 100, width: 100}}
              />
            ) : (
              <View style={{height: 100, width: 100}}></View>
            )}

            <View style={{flex: 1, marginLeft: 20}}>
              <Text style={styles.label}>Name & surname : {item.user}</Text>
              <Text style={styles.label}>Mail: {item.email}</Text>
              <Text style={styles.label}>
                Phone: {item.phone_code} {item.phone}
              </Text>
              <Text style={[styles.label, {flexWrap: 'wrap'}]}>
                Country & city : {countryName}
              </Text>
              <Text style={styles.label}>Car Color: {item.car_color}</Text>
              <Text style={styles.label}>Plate Number: {item.plate_no}</Text>

              <Text style={styles.label}>Car model: {item.kind}</Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-start',
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
            }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: '#FFCF00',
              }}
              onPress={() => this.editDriver(item.id)}>
              <Text>Modify</Text>
            </TouchableOpacity>

            {moment(item.pay_date).unix() - moment().unix() > 0 ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: '#7EC54A',
                }}>
                <Text style={{color: 'white'}}>{moment(item.pay_date).format('MM/DD/YYYY')}</Text>
              </View>
            ) : (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  backgroundColor: '#CE1A12',
                }}>
                <Text style={{color: 'white'}}>Not paid</Text>
              </View>
            )}

            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: '#FFCF00',
              }}
              onPress={() => Actions.push('edit_driver')}>
              <Text>Add driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: '#FA0100',
              }}
              onPress={() => this.removeDriver(item.id)}>
              <Text style={{color: 'white'}}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Header isAdmin={true} onSearch={this.handleSearch} />
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{backgroundColor: '#e2e2e2'}}>
          {this.state.list && this.state.list.length > 0
            ? this.renderList()
            : null}
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

Admin.navigationOptions = {
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

    alignItems: 'center',
  },
  label: {
    marginBottom: 5,
  },
});
