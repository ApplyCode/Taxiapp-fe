/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  LogBox,
} from 'react-native';
import { Root } from 'native-base';
import { Drawer, Router, Scene, Stack } from 'react-native-router-flux';

import Home from './app/screens/Home';
import Initial from './app/screens/Initial';
import Login from './app/screens/Login';
import ForgotPwd from './app/screens/ForgotPwd';
import SplashScreen from 'react-native-splash-screen';
import Signup from './app/screens/Signup';
import DrawerLayout from './app/components/DrawerLayout';
import Privacy from './app/screens/Privacy';
import ContactUs from './app/screens/ContactUs';
import MyProfile from './app/screens/MyProfile';
import Pay from './app/screens/Pay';
import Support from './app/screens/Support';
import Booking from './app/screens/Booking';
import Rating from './app/screens/Rating';
import Reservation from './app/screens/Reservation';
import DriverPay from './app/screens/DriverPay';
import DriverList from './app/screens/DriverList';
import Chat from './app/screens/Chat';
import Admin from './app/screens/Admin';
import EditDriver from './app/screens/EditDriver';
LogBox.ignoreAllLogs();
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: true,
    };
  }

  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Root>
          <Router>
            <Scene hideNavBar key="hidenav">
              <Scene key="root" hideNavBar>
                <Drawer
                  open={false}
                  type="overlay"
                  key="drawer"
                  contentComponent={DrawerLayout}
                  drawerWidth={320}>
                  <Scene key="rootScene" hideNavBar>
                    <Scene key="home" component={Home} initial />
                    <Scene key="privacy" component={Privacy} />
                    <Scene key="contactus" component={ContactUs} />
                    <Scene key="myprofile" component={MyProfile} />
                    <Scene key="pay" component={Pay} />
                    <Scene key="support" component={Support} />
                    <Scene key="booking" component={Booking} />
                    <Scene key="rating" component={Rating} />
                    <Scene key="reservation" component={Reservation} />
                    <Scene key="driverpay" component={DriverPay} />
                    <Scene key="driverlist" component={DriverList} />
                    <Scene key="chat" component={Chat} />
                  </Scene>
                </Drawer>
              </Scene>
              <Scene key="initial" component={Initial} initial />
              <Scene key="login" component={Login} />
              <Scene key="forgotpwd" component={ForgotPwd} />
              <Scene key="signup" component={Signup} />
              <Scene key="home" component={Home} />
              <Scene key="admin" component={Admin} />
              <Scene key="edit_driver" component={EditDriver} />
            </Scene>
          </Router>
        </Root>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarStyle: {
    backgroundColor: 'white',
    height: Platform.OS == 'ios' ? 40 : 60,
    paddingBottom: 8,
  },
});

export default App;
