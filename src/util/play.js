import { extend } from './tools';
import router from '@/router/index'; //引入路由

export default {
    options: {
        x5_player: true,
        x5_type: 'h5',
        controls: 'none',
        rtmp: 'rtmp://zhibo.qingshu520.com/live/e4crypkyxsvqwmq7',
        flv: 'https://5496.liveplay.myqcloud.com/live/rrc3e7sz4n.flv',
        m3u8: 'https://zhibo.qingshu520.com/live/e4crypkyxsvqwmq7.m3u8',
        // rtmp: rtmp,
        // flv: flv,
        // m3u8: m3u8,
        mp4: true,
        coverpic: '{"style": "cover", "src":"https://asset.qingshu520.com/user/7271117/png_31_9a3596ae2f223f140bcf9ac828cbddde"}',
        autoplay: true, //true
        live: true,
        width: '100%',
        height: 'auto',
        volume: 0.3,
        flash: true,
        h5_flv: true,
        x5_fullscreen: true, //H5 全屏
        // systemFullscreen: true,//webkitEnterFullScreen 方法进行全屏，
        wording: {
            2032: '请求视频失败，请检查网络',
            2048: '请求m3u8文件失败，可能是网络错误或者跨域问题'
        },
        listener: function(msg) {
            // console.log(msg)

            if (msg.type == 'play') {
                window.tcplayer.volume(0.3)
                    // $('#icon-play').addClass('hide');
                flvjs.LoggingControl.enableVerbose = false
                flvjs.LoggingControl.enableAll = false
                    // videoWH();
            } else if (msg.type == 'error') {
                window.setTimeout(function() {
                    tcplayer.load(); //进行重连
                }, 1000);
            } else if (msg.type == 'pause') {
                // var btnplaywp = document.getElementsByClassName("btn-play-wp")[0];
                // btnplaywp.style.display = "block";

            } else if (msg.type == 'ended') {
                // alert("直播已结束了")
                    // var len = window.location.href.indexOf("?");
                    // if (len > 0) {
                    //     window.location.href =
                    //         window.location.href.substring(0, len) + "?" + Math.random();
                    // } else {
                    //     window.location.href = window.location.href + "?" + Math.random();
                    // }
                router.replace({
                        path: 'list'
                    })
                    // window.location.reload();
                    // window.location.href =window.location.href.substring(0, len);
            } else {
                // console.log("环境检测：" + (inWechat() || inQQ()))
            }

            // var _video = document.getElementsByTagName("video");
            // _video.setAttribute("x5­-video­-player­-fullscreen","true")

        }
    },
    init: function(data) {
        if (data) {
            this.options = extend(this.options, data);
        }

        if (window.tcplayer) {
            window.tcplayer.destroy();
        }
        var btnplaywp = document.getElementsByClassName("btn-play-wp")[0];
        /*if (inWechat() || inQQ()) {
          btnplaywp.style.display = "block";
          this.options.autoplay = false;
        } else {
          this.options.autoplay = true;
          btnplaywp.style.display = "none";
        }*/
        // btnplaywp.style.display = "block";

        window.tcplayer = new TcPlayer('liveMedia_wrapper', this.options);
        // console.log(this.options)
        // window.tcplayer.play();
        window.onresize = function() {
                // videoWH();
            }
            // videoWH();


    },

    // 系统环境判断
    inWechat: function() {
        // 判断是不是微信浏览器
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        }
        return false;
    },
    // 判断是不是QQ浏览器
    inQQ: function() {
        return navigator.userAgent.indexOf('MQQBrowser') !== -1 ? true : false;
    },
    isIos: function() {
        if (navigator.userAgent.indexOf('iOS') !== -1 ||
            navigator.userAgent.indexOf('iPhone') !== -1 ||
            navigator.userAgent.indexOf('iPad') !== -1) {
            return true;
        }
        return false;
    }



}
