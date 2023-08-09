import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Actions} from 'react-native-router-flux';
import {strings} from '../locales/i18n';
export default class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.header}>
        {this.props.isAdmin ? (
          <View
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TouchableOpacity onPress={() => Actions.pop()}>
              <Icon type="feather" name="arrow-left" size={30} color="black" />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TouchableOpacity onPress={() => Actions.drawerOpen()}>
              <Icon type="entypo" name="menu" size={30} color="black" />
            </TouchableOpacity>
            <Text style={{color: 'black', paddingLeft: 10, fontSize: 16}}>
              {this.props.title ? this.props.title : strings('initial.app')}
            </Text>
          </View>
        )}

        {this.props.isOnline ? (
          <Text
            style={{
              color: 'black',
              paddingLeft: 10,
              fontSize: 16,
              paddingRight: 20,
            }}>
            {strings('initial.online')}
          </Text>
        ) : null}
        {this.props.isDriver ? (
          <Text style={{fontSize: 16, fontWeight: 'bold', paddingRight: 20}}>
            {strings('booking.incmingJob')}
          </Text>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#ffc500',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
  },
});
