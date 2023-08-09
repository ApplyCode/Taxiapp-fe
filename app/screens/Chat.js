import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, Platform, ScrollView, Keyboard, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { showToast } from '../constants/Global';
import Spinner_bar from 'react-native-loading-spinner-overlay';
import MainHeader from '../components/MainHeader';
import AsyncStorage from '@react-native-community/async-storage';
import { TextInput } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';
import moment from 'moment';
import firebase from '../../Fire'
import Layout  from '../constants/Layout'
import { send_chat } from '../constants/Api';
export const chatsRef = firebase.database().ref()

let chat = null
export default class Chat extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loaded: true,
            type: '',
            chatList: [],
            chat: '',
        };
        this._keyboardDidShow = (e) => {
            this.scrollView.scrollToEnd()
        }
        this._keyboardDidHide = (e) => {
            this.scrollView.scrollToEnd()
        }
    }

    async componentDidMount(){
        let userInfo = await AsyncStorage.getItem("user_info")
        //this.setState({ loaded: false })
        var _self = this;
        let chatList = []
        if(userInfo) {
            userInfo = JSON.parse(userInfo)
            this.setState({type: userInfo.type})
            chat = chatsRef.child('Chats/' + this.props.booking_id);
            
            if (chat != null) {
                chat.on("child_added", function (snapshot) {
                    let chatInfo = snapshot.val()
                    chatList.push(chatInfo)
                    _self.setState({ chatList })
                })
            }
        }
        /*setTimeout(function () {
            console.log(chatList)
            _self.setState({ chatList })
            _self.setState({ loaded: true })
        }, 3000)*/
    }

    UNSAFE_componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount() {
        chat = null;
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    renderChat() {
        if (this.state.chatList && this.state.chatList.length > 0)
            return this.state.chatList.map((chat, index) => {
                return <View key={index} style={styles.chatSection}>
                    {
                        chat.type == '0' ?
                            <View style={[{flexDirection: 'row', flex: 1, alignItems: 'flex-end' }]}>

                                <View style={[styles.chatText, {marginLeft: 0}]}>
                                    <Text >{chat.message}</Text>
                                </View>
                                <Text style={[{ color: '#B5B5B5', marginLeft: 10 }]}>
                                    {moment(chat.created_at).format("YYYY/M/D") == moment().format("YYYY/M/D") ? moment(chat.created_at).format("H:mm") : moment(chat.created_at).format("M/D H:mm")}
                                </Text>

                            </View>
                            :
                            <View style={[ {flexDirection: 'row', flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }]}>
                                <Text style={[{ color: '#B5B5B5' }]}>
                                    {moment(chat.created_at).format("YYYY/M/D") == moment().format("YYYY/M/D") ? moment(chat.created_at).format("H:mm") : moment(chat.created_at).format("M/D H:mm")}
                                </Text>
                                <View style={[styles.chatText, { backgroundColor: '#81c94c'}]}>
                                    <Text style={[{ color: 'white' }]}>{chat.message}</Text>
                                </View>
                            </View>
                    }

                </View>
            })
    }

    sendChat() {
        if(this.state.chat) {
            let time = Date.now();
            console.log(this.state.type, this.props.booking_id)
            send_chat(this.state.chat, this.state.type, this.props.booking_id)
            .then(async (response) => {
            })
            .catch((error) => {
            });
            chatsRef.child('Chats/'+this.props.booking_id).push({
                message: this.state.chat,
                type: this.state.type,
                is_read: 0,
                created_at: time
            })
            this.setState({ chat: '' })
        }
    }

    render(){
        return (
            <View style={styles.container}>
                <MainHeader title={this.props.type == 'driver' ? "Taxiwait Driver Chat Room" : "Taxiwait Chat Room"} isOnline={true} />
                <SafeAreaView style={{ flex: 1 }}>
                    <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS == 'ios' ? 0 : 70}>
                        <View style={{ flex: 1, backgroundColor: 'white' }}>

                            <ScrollView style={{ flex: 1, backgroundColor: '#f2f2f2' }}
                                ref={ref => this.scrollView = ref}
                                onContentSizeChange={(contentWidth, contentHeight) => {
                                    this.scrollView.scrollToEnd({ animated: true })
                                }}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            >
                                {
                                    this.renderChat()
                                }
                            </ScrollView>
                            <View style={[ {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'white', justifyContent: 'center' }]}>
                                
                                <TextInput
                                    value={this.state.chat}
                                    placeholder="Message..."
                                    style={[styles.input, {fontSize: 18, flex: 1}]}
                                    multiline
                                    onChangeText={(text) => this.setState({ chat: text })}
                                    placeholderTextColor='#9da8bf'
                                />
                                
                                <TouchableOpacity onPress={() => this.sendChat()}>
                                    <Icon type="fontawesome" name="send" size={30} color="black" />
                                </TouchableOpacity>
                            </View>

                        </View>
                    </KeyboardAvoidingView>
                    <Spinner_bar color={'#27cccd'} visible={!this.state.loaded} textContent={""} overlayColor={"rgba(0, 0, 0, 0.5)"} />
                </SafeAreaView>
            </View>
        );
    }
    
}

Chat.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    chatText: {
        maxWidth: Layout.window.width - 160, backgroundColor: 'white', borderRadius: 10, paddingVertical: 10,
        paddingHorizontal: 15,
        marginLeft: 10
    },
    chatSection: {
        borderBottomColor: '#f2f2f2',
        borderBottomWidth: 1,
        paddingTop: 15,
        marginLeft: 20,
        paddingRight: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        lineHeight: 24,
        textAlignVertical: 'top',
        justifyContent: 'center',
        height: Platform.OS == 'ios' ? 40 : 50
    },
});