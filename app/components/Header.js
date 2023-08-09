import React, {Component} from 'react';
import {
  Platform,
  TextInput,
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import {Icon} from 'react-native-elements';
export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {}

  handleChange(val) {
    this.setState({search: val});
    this.props.onSearch(val);
  }

  async logout() {
    // await AsyncStorage.clear();
    Actions.reset('initial');
  }

  render() {
    return (
      <>
        {this.props.isAdmin ? (
          <View style={[styles.header, styles.adminHeader]}>
            <TextInput
              style={styles.input}
              onChangeText={this.handleChange}
              value={this.state.search}
            />
            <TouchableOpacity
              style={[styles.menuSection, {paddingRight: 20}]}
              onPress={() => this.logout()}>
              <Icon type="antdesign" name="logout" size={30} color="black" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header}>
            <Text style={{color: 'black', paddingLeft: 20, fontSize: 16}}>
              {this.props.title}
            </Text>
          </View>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#ffc500',
    justifyContent: 'center',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
  },
  menuSection: {
    paddingLeft: 50,
    paddingVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    width: 200,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    borderColor: '#737373',
    backgroundColor: '#F7F8F9',
  },
});
