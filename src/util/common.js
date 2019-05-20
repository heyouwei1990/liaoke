import axios from 'axios';
import store from '@/store'; //引入vuex
import version from './version'; //引入vuex
import { setStore } from "./tools";
import Router from '../router/index';
import { P, V, C } from './constant'


// ajax host   http://2.www.liaoke.tv     http://www.liaoke.tv  https://www.liaoke.tv


axios.defaults.timeout = 5000; //响应时间
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'; //配置请求头
//axios.defaults.baseURL = 'https://www.liaoke.tv';   //配置接口地址   /api
//axios.defaults.baseURL = '/api';   //配置接口地址   /api
axios.defaults.baseURL = version.apiHost; //配置接口地址   /api

export let baseUrl = axios.defaults.baseURL;
// 请求时的拦截
axios.interceptors.request.use(function(config) {
    var data = config.params;
    try {
        data.c = C;
        data.p = P;
        data.v = V;
        // console.log(data)
    } catch (error) {
        console.log('未找到cpv》》》》》')
    }
    config.params = data;
    /*if(config.method=='post'){
      config.headers["Content-Type"] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }*/
    // 发送请求之前做一些处理   不需要loading的  域名设置 /h5/gift/send  /h5/user/info
    // var arr = ['/h5/live/heart', '/h5/gift/send','/h5/user/info']
    if (
        config.url.indexOf('/h5/live/heart') == '-1' ||
        config.url.indexOf('/h5/gift/send') == '-1' ||
        config.url.indexOf('/h5/user/info') == '-1' ||
        config.url.indexOf('/site/captcha') == '-1' ||
        config.url.indexOf('/h5/dynamic/like') == '-1'
    ) {

    } else {
        store.commit("set_loading", true);
    }
    return config;
}, function(error) {
    // 当请求异常时做一些处理
    //store.commit("set_loading", false);
    return Promise.reject(error);
});

// 响应时拦截
axios.interceptors.response.use(function(response) {
    // 返回响应时做一些处理
    var code = response.data.http_code;
    store.commit("set_loading", false);
    if (code && code != "200") {
        if (code == "4001") {
            // store.commit("setToast", "未登录或超时，请重新登录");
            store.commit("set_loginState", false);
            // store.commit("set_loginDialog", true);
            store.commit("setUser", 'null');
        } else if (code == "4002") {
            //金币不足
            store.commit('set_broke', true);
        } else {
            store.commit("setToast", response.data.msg);
            console.log(response.data.msg)
        }
    }
    //store.commit("set_loading", false);
    return response;
}, function(error) {
    // 当响应异常时做一些处理
    // store.commit("set_loading", false);

    return Promise.reject(error);
});


/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

export function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
                params: params
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(err => {
                reject(err)
            })
    })
}


/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, data)
            .then(response => {
                resolve(response.data);
            }, err => {
                reject(err)
            })
    })
}

export var a = 1;