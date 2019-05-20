import Vue from 'vue'
import Vuex from 'vuex'


import { extend, formatMoney, pathJudge, defaultAvatar, levelMark, setStore, getStore, removeStore } from "@/util/tools";

Vue.use(Vuex);
import { post, get } from '../util/common.js';
import mqttOption from "./../util/mqtt";

export default new Vuex.Store({
    state: {
        isShowLoginDialog: false, //是否显示登录弹窗
        isShowPayDialog: false, //是否显示支付弹窗
        isShowSex: false, //是否显示性别选择弹窗
        loading: false, //是否显示正在加载
        isLogin: false, //是否登录
        isBroke: false, //是否余额不足
        hostUser: null, //登陆者信息
        talkTo: null, //私聊对象信息
        // isLogin: getStore('hostUser')==null?false:true,//是否登录
        // hostUser: getStore('hostUser')==null?null:JSON.parse(getStore('hostUser')),//登陆者信息
        isShowEmoji: false, //是否显示表情包
        emojiPosition: {}, //表情包坐标
        activityUrl: '', //活动页路径表情包坐标
        videoUrl: '', //私密视频播放路径
        toast: {
            isShow: false,
            msg: ''
        },
        // 支付弹框
        payment: {
            url: '',
            price: '0.00',
            label: ''
        },
        isShowChat: false, //消息弹框

        // mqtt
        mqtt: null, //第三个参数是clientID可以为空
        mqtt_d: null, //mqtt 推送的消息
        tpoc: [], // 订阅的地址   断开后 重连 订阅用
        chat_server: null, //是否初始化了
        // 未读消息
        msgCon: 0,

    },
    getters: {},
    mutations: {
        setmsgCont(state) {
            var cont = 0;
            get("/h5/chat/index").then(r => {
                // console.log()

                var list = r.data.list;
                if (r.http_code == 200) {
                    for (let index = 0; index < list.length; index++) {
                        cont += Number(list[index].unreads);
                    }
                }
                state.msgCon = cont;
            })

        },
        // 每次订阅添加   断开重连时使用
        settopc(state, url) {
            state.tpoc.push(url || '');

            console.log(url)
        },

        setchat_server(state, data) {
            state.chat_server = data;
        },
        // mqtt
        mqttInit(state) {

            var { username, password, client_id } = state.chat_server;
            if (!username || !password || !client_id) return;
            var this_ = this;
            if (state.mqtt) {
                state.mqtt = null;
            }
            // console.log(state.mqtt )
            // state.mqtt = new Paho.MQTT.Client(mqttOption.host, mqttOption.port, mqttOption.clientId);
            state.mqtt = new Paho.MQTT.Client(mqttOption.host, mqttOption.port, client_id);

            var options = {
                timeout: 3,
                userName: username+'', //mqttOption.accessKey,
                password: password, //mqttOption.password,
                useSSL: mqttOption.useTLS,
                onSuccess: function() {
                    // console.log("onConnected");
                    if (state.tpoc.length) {
                        for (let index = 0; index < state.tpoc.length; index++) {
                            console.log("重新订阅>>>>>" + state.tpoc[index])
                            state.mqtt.subscribe(state.tpoc[index], { qos: 0 }); //订阅主题
                        }
                    }
                },
                onFailure: function(message) {
                    // console.log("onFailure");
                    // console.log(message);
                }
            };
            state.mqtt.connect(options); //连接服务器并注册连接成功处理事件
            // state.mqtt.onConnectionLost = state.onConnectionLost; //注册连接断开处理事件
            state.mqtt.onConnectionLost = function(responseObject) {
                if (responseObject.errorCode !== 0) {
                    setTimeout(() => {
                        // console.log("onConnectionLost:" + responseObject.errorMessage);
                        // console.log("连接已断开");
                        this_.commit('mqttInit'); //  重新init
                    }, 3000);

                }
            }

            state.mqtt.onMessageArrived = function(message) {
                var payload = JSON.parse(message.payloadString);
                // console.log(payload);
                state.mqtt_d = payload;
            }; //注册消息接收处理事件


        },

        // onConnect: function(state) {
        //     console.log("onConnected");
        //     var tipcObj = state.topc;
        //     for (var i = 0; i < tipcObj.length; i++) {
        //         state.mqtt.subscribe(tipcObj[i], { qos: 0 }); //订阅主题
        //     }
        // },
        // mqtt end


        //设置登录弹框状态
        set_loginDialog(state, type) {
            state.isShowLoginDialog = type || false;
        },
        //设置性别选择弹框
        set_isShowSex(state, type) {
            state.isShowSex = type || false
        },
        //设置支付弹框状态
        set_payDialog(state, type) {
            state.isShowPayDialog = type || false;
        },

        //设置余额不足弹框状态
        set_broke(state, type) {
            state.isBroke = type || false;
        },

        //设置消息弹框状态
        set_chatState(state, type) {
            state.isShowChat = type || false;
        },

        //设置加载状态
        set_loading(state, type) {
            state.loading = type || false;
        },


        //设置登录状态
        set_loginState(state, type) {
            state.isLogin = type || false;
        },
        // 设置登陆者信息
        setUser(state, data) {
            if (data === 'null' || !data) {
                state.hostUser = null;
            } else {
                state.hostUser = extend(state.hostUser, data);
                state.hostUser = levelMark(state.hostUser);
                state.hostUser.avatar = state.hostUser.avatar != '' ? pathJudge(state.hostUser.avatar) : pathJudge('assets/avatar.png');
            }
            // setStore('hostUser',state.hostUser);
        },
        // 设置私聊对象信息
        set_talkTo(state, data) {
            if (typeof data == 'object') {
                state.talkTo = data;
            } else {
                state.talkTo = null;
            }
            // setStore('hostUser',state.hostUser);
        },
        //设置支付弹框信息
        setPayment(state, data) {
            state.payment = extend(state.payment, data);
        },
        //设置Toast
        setToast(state, msg) {
            state.toast.isShow = true;
            state.toast.msg = msg;
            setTimeout(() => {
                state.toast.isShow = false;
                state.toast.msg = '';
            }, 1500);
        },

        //显示表情包
        set_showEmoji(state, type) {
            state.isShowEmoji = type || false;
        },
        //设置活动地址
        set_activityUrl(state, url) {
            state.activityUrl = url || '';
        },

        // 私密视频路径
        set_videoUrl(state, url) {
            state.videoUrl = url || '';
        },

        // 设置表情包坐标
        set_emojiPosition(state, data) {
            state.emojiPosition = extend(state.emojiPosition, data);
        },

    },
    actions: {}
})
