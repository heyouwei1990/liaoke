// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import VueLazyload from 'vue-lazyload'
import router from './router'
import store from './store'
import {get, post } from '@/util/common'
import 'element-ui/lib/theme-chalk/index.css'
import { MessageBox } from 'element-ui'
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;


// Vue.use(Toast);

//图片懒加载
var userAgent = window.navigator.userAgent;
if (userAgent.indexOf('NET') != -1) {
    //ie浏览器不兼容懒加载组件处理
    Vue.directive('lazy', function(el, binding) {
        el.src = binding.value
    })
} else {
    //实现图片懒加载
    Vue.use(VueLazyload, {
        // preLoad: 0.8,
        attempt: 3,
        error: '',
        loading: 'https://lib.liaoke.tv/lib/pc/static/img/preload.png',
        listenEvents: ["scroll"],
        lazyComponent: true
    });
}
Vue.config.productionTip = false
Vue.prototype.$get = get;
Vue.prototype.$post = post;
/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
    mounted() {
        // You'll need this for renderAfterDocumentEvent.
        document.dispatchEvent(new Event('render-event'))
    }
});
