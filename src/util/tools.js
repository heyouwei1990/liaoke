import emoji from "./emoji";
// ajax host   http://2.www.liaoke.tv     http://www.liaoke.tv  https://www.liaoke.tv
// export var ajaxOptions = {
//     host: '/api'
// }
// import plupload from 'plupload'
import version from './version'
import { SOURCE_H5, SOURCE_LOCAL } from "@/util/constant"


export function uploader(id, dirName, initCb, cb, type) {
    var slef_ = this;
    var uploader;
    var accessid = "";
    var accesskey = "";
    var host = "";
    var policyBase64 = "";
    var signature = "";
    var callbackbody = "";
    var filename = "";
    var protocol = window.location.protocol;
    var key = "";
    var expire = 0;
    var g_object_name = "";
    var g_object_name_type = "local_name"; //本地name还是随机   random_name  local_name
    var now = Date.parse(new Date()) / 1000;

    function send_request() {
        var xmlhttp = null;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        if (xmlhttp != null) {
            var serverUrl = version.apiHost + "/h5/system/sts";
            xmlhttp.open("GET", serverUrl, false);
            xmlhttp.send(null);
            return xmlhttp.responseText;
        } else {
            alert("您的浏览器不支持 XMLHTTP，请更新浏览器版本");
        }
    }

    // function check_object_radio() {
    //   var tt = document.getElementsByName("myradio");
    //   for (var i = 0; i < tt.length; i++) {
    //     if (tt[i].checked) {
    //       g_object_name_type = tt[i].value;
    //       break;
    //     }
    //   }
    // }

    function get_signature() {
        //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
        now = Date.parse(new Date()) / 1000;
        if (expire < now + 3) {
            var body = send_request();
            body = JSON.parse(body);
            body = body.data;
            host = body.host.replace('http:', protocol);
            policyBase64 = body.policy;
            accessid = body.accessid;
            signature = body.signature;
            expire = parseInt(body.expire);
            // callbackbody = obj['callback']
            // key = body.dir;
            key = dirName ? body.dir + dirName + '/' : body.dir;
            return true;
        }
        return false;
    }

    function random_string(len) {
        len = len || 32;
        var chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        var maxPos = chars.length;
        var pwd = "";
        for (i = 0; i < len; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    function get_suffix(filename) {
        var pos = filename.lastIndexOf(".");
        var suffix = "";
        if (pos != -1) {
            suffix = filename.substring(pos);
        }
        return suffix;
    }

    function calculate_object_name(filename) {
        if (g_object_name_type == "local_name") {
            g_object_name += "${filename}";
        } else if (g_object_name_type == "random_name") {
            var suffix = get_suffix(filename);
            g_object_name = key + random_string(10) + suffix;
        }
        return "";
    }

    function get_uploaded_object_name(filename) {
        // console.log(filename)
        if (g_object_name_type == "local_name") {
            var tmp_name = g_object_name;
            tmp_name = tmp_name.replace("${filename}", filename);
            return tmp_name;
        } else if (g_object_name_type == "random_name") {
            return g_object_name;
        }
    }

    function set_upload_param(up, filename, ret) {
        if (ret == false) {
            ret = get_signature();
        }
        g_object_name = key;
        if (filename != "") {
            var suffix = get_suffix(filename);
            calculate_object_name(filename);
        }
        var new_multipart_params = {
            key: g_object_name,
            policy: policyBase64,
            OSSAccessKeyId: accessid,
            success_action_status: "200", //让服务端返回200,不然，默认会返回204
            callback: callbackbody,
            signature: signature
        };
        up.setOption({
            url: host,
            multipart_params: new_multipart_params
        });
        up.start();
    }

    // export var uploader = new plupload.Uploader({
    // var uploader='';
    var filtType = '';
    // avi, asf, wmv, mpeg, mpg, vob, mkv, mov, rmvb, mp4, bmp, jpg, gif, jpeg, png
    if (type == 'video') {
        filtType = 'avi,mp4,jpg,gif,png,jpeg';
    } else {
        filtType = 'jpg,gif,png,jpeg'
    }
    return new plupload.Uploader({
        runtimes: "html5,flash,silverlight,html4",
        browse_button: id,
        //multi_selection: false,
        // container: document.getElementById('container'),
        // flash_swf_url: "https://lib.liaoke.tv/lib/pc/static/Moxie.swf",
        // silverlight_xap_url: "https://lib.liaoke.tv/lib/pc/static/Moxie.xap",
        url: protocol + "//oss.aliyuncs.com",

        filters: {
            mime_types: [
                //只允许上传图片和zip,rar文件
                // { title: "Image files", extensions: "jpg,gif,png,bmp" },
                { title: "Image files", extensions: filtType },

                // { title: "video", extensions: "mp4,mp3" },
            ],
            max_file_size: "10mb", //最大只能上传10mb的文件
            prevent_duplicates: true //不允许选取重复文件
        },
        init: {
            PostInit: function() {
                // console.log("PostInPostInitPostInPostInitPostIn>>>>>>>>>ititit");
                // document.getElementById('ossfile').innerHTML = '';
                var self = this;
                // document.getElementById("postfiles").onclick = function() {
                //   // alert(111144444441);

                //   set_upload_param(self, "", false);
                //   return false;
                // };
                // initCb && initCb();
                // set_upload_param(uploader, "", false);
            },

            FilesAdded: function(up, files) {
                initCb && initCb();
                var self = this;
                set_upload_param(self, "", false);
                var str = "";
                plupload.each(files, function(file) {
                    //str +=`<div id="${file.id}">${file.name}(${plupload.formatSize(file.size)})<b></b><div class="progress"><div class="progress-bar" style="width: 0%"></div></div></div>`

                });
            },

            BeforeUpload: function(up, file) {
                set_upload_param(up, file.name, true);
            },

            UploadProgress: function(up, file) {
                // var d = document.getElementById(file.id);
                // d.getElementsByTagName("b")[0].innerHTML =
                //   "<span>" + file.percent + "%</span>";
                // var prog = d.getElementsByTagName("div")[0];
                // var progBar = prog.getElementsByTagName("div")[0];
                // progBar.style.width = 2 * file.percent + "px";
                // progBar.setAttribute("aria-valuenow", file.percent);
            },

            FileUploaded: function(up, file, info) {
                if (info.status == 200) {
                    // var self = this;
                    // set_upload_param(self, "", false);
                    let url = host + '/' + key + file.name;

                    cb && cb(url);
                    // console.log("上传成功, 文件名:" + get_uploaded_object_name(file.name));
                    // console.log("http://chatfile.oss-cn-shanghai.aliyuncs.com/" + key + file.name);
                } else {
                    console.log(info.response)
                }
            },

            Error: function(up, err) {
                if (err.code == -600) {
                    alert('选择的文件太大了')
                } else if (err.code == -601) {
                    alert('选择的文件后缀不对')
                } else if (err.code == -602) {
                    alert('这个文件已经上传过一遍了')
                } else {
                    console.log(err.response)
                }
            }
        }
    });
};


// 时间戳转时间日期  changeDate(1532590943000)
export function changeDate(str) {
    // console.log(str)
    var strTime = '';
    var date = new Date(str);
    var Y = date.getFullYear(),
        // M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
        M = (date.getMonth() + 1 < 10 ? (date.getMonth() + 1) : date.getMonth() + 1),
        D = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
    // console.log(Y + M + D + h + m + s)
    //  年 月 日 时 分 秒

    //今天的时间
    var day2 = new Date();
    var day2_m = day2.getMonth() + 1;
    var day2_d = day2.getDate();
    if (M == day2_m && D == day2_d) {
        //今天
        strTime += h + ':' + m;
    } else {
        //之前
        strTime += M + '月' + D + '日';
    }

    return strTime;
}


//  msgTime  聊天时间  转换
export function msgTime(str) {
    // console.log(str)
    str = Number(str);
    var strTime = '';
    var date = new Date(str);
    var Y = date.getFullYear(),
        // M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
        M = (date.getMonth() + 1 < 10 ? (date.getMonth() + 1) : date.getMonth() + 1),
        D = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
    // console.log(Y + M + D + h + m + s)
    //  年 月 日 时 分 秒

    //今天的时间
    var day2 = new Date();
    var day2_m = day2.getMonth() + 1;
    var day2_d = day2.getDate();
    if (M == day2_m && D == day2_d) {
        //今天
        h = h >= 10 ? h : ('0' + h);
        m = m >= 10 ? m : ('0' + m);
        strTime += h + ':' + m;
    } else {
        //之前
        h = h >= 10 ? h : ('0' + h);
        m = m >= 10 ? m : ('0' + m);
        M = M >= 10 ? M : ('0' + M);
        D = D >= 10 ? D : ('0' + D);
        strTime += M + '月' + D + '日' + ' ' + h + ':' + m;;
    }

    return strTime;
}



//拼接等级图标路径
export function levelMark(opt) {
    //主播等级图片
    if (opt.live_level >= 0) {
        let live_level_path = "assets/icon/level/zhibo_level_" + opt.live_level + ".png";
        opt['live_level_img'] = pathJudge(live_level_path); //新建一个属性存放图标路径
    }

    //富豪等级图片
    if (opt.wealth_level >= 0) {
        let wealth_level_path = "assets/icon/level/caifu_level_" + opt.wealth_level + ".png";
        opt['wealth_level_img'] = pathJudge(wealth_level_path); //新建一个属性存放图标路径
    }


    //VIP等级图片
    var vip_src = ""; //服务器icon 传反了
    if (opt.vip_data) {
        if (opt.vip_data.level != "0") {
            // https://asset.qingshu520.com/assets/icon/vip/vip_3.png
            if (Number(opt.vip_data.level) == 1) {
                vip_src = SOURCE_H5 + "assets/icon/vip/vip_2.png";
            } else if (Number(opt.vip_data.level) == 2) {
                vip_src = SOURCE_H5 + "assets/icon/vip/vip_1.png";
            } else if (Number(opt.vip_data.level) == 3) {
                vip_src = SOURCE_H5 + "assets/icon/vip/vip_3.png";
            }
            opt["vip_img"] = vip_src; //新建一个属性存放图标路径
        }
    }


    //守护等级图片
    var ward_src = ''
    if (opt.ward_data) {
        if (opt.ward_data.level > 0) {
            ward_src = `${SOURCE_LOCAL}img/center/icon-ward${opt.ward_data.level}.png`;
            opt["ward_img"] = ward_src; //新建一个属性存放图标路径
        }
    }
    return opt;
}

//处理默认头像路径
export function defaultAvatar(sex) {
    let src = '';
    if (sex == 1) {
        src = pathJudge('assets/boy.png!100x100?v=20171127');
    } else {
        src = pathJudge('assets/girl.png!100x100?v=20171127');
    }
    return src;
}
//拼接图片路径
export function pathJudge(str) {
    var path = '';
    if (typeof str != 'string') return;
    if (str.indexOf("http") == "-1") {
        path = SOURCE_H5 + str;
    } else {
        path = str;
    }
    return path;
}

// 合并对象
export function extend(target, source) {
  var obj=target||{}
  for (var key in source) {
    // obj[key] = source[key];
    if(typeof source[key] === "object" && source[key]){
      obj[key]= (source[key].constructor===Array)?[]:{};
      extend(obj[key],source[key])
    }else{
      obj[key] = source[key];
    }
  }
  return obj;
}

//获取当前url中  key=value
export function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return (r[2]);
    } else {
        return null;
    }
}

//取一个区间的随机整数
export function randomFrom(lowerValue, upperValue) {
    return Math.floor(
        Math.random() * (upperValue - lowerValue + 1) + lowerValue
    );
}


export function audioPlay(el) {
    var audio = document.getElementById(el);
    if (audio !== null) {
        audio.currentTime = 0;
        audio.play();
        //检测播放是否已暂停.audio.paused 在播放器播放时返回false.
        // if (audio.paused) {
        //     audio.play();//audio.play();// 这个就是播放
        // } else {

        //     audio.pause();// 这个就是暂停
        // }
    }
}


export function emojiList() {
    let list = [];
    for (let k in emoji) {
        let item = {}
        item['code'] = k;
        item['pic'] = `<img class='emojiImg' src='${SOURCE_LOCAL}img/emoji/${emoji[k]}' />`;
        list.push(item);
    }
    return list
}


// 匹配emoji
export function replaceEmmoji(str) {
    var arr = [];
    var code = '';
    var type = false;
    for (var i = 0; i < str.length; i++) {
        if (str[i] == '[') {
            type = true;
        }
        if (type) {
            code += str[i]
        }
        if (str[i] == ']') {
            type = false;
            arr.push(code);
            code = '';
        }
    }
    for (var j = 0; j < arr.length; j++) {
        var url = emoji[arr[j]];
        var img_ = `<img class='emojiImg' src='${SOURCE_LOCAL}img/emoji/${url}' />`
        str = str.replace(arr[j], img_)
    }
    return str;
}

//分割数组
export function sliceArray(array, size) {
    let result = [];
    for (let i = 0; i < Math.ceil(array.length / size); i++) {
        let start = i * size;
        let end = start + size;
        result.push(array.slice(start, end));
    }
    return result;
}

//规范时间
export function formatTime(timeStr) {
    let _time = new Date(timeStr * 1000);
    let year = _time.getFullYear();
    let month = _time.getMonth() + 1;
    let day = _time.getDate();
    let hours = _time.getHours();
    let minutes = _time.getMinutes();
    let seconds = _time.getSeconds();
    let timeString = `${year}-${ plus(month) }-${ plus(day) }  ${ plus(hours) }:${ plus(minutes )}:${ plus(seconds) }`
    return timeString;
}

function plus(value) {
    let val = ''
    if (value < 10) {
        val = '0' + value;
    } else {
        val = value;
    }
    return val;
}

//滚动方向
var scrollAction = { x: 'undefined', y: 'undefined' },
    direction;
export function scrollDirection(el) {
    if (el.nodeName.indexOf('document') == 1) {
        el = el.documentElement;
    }
    if (typeof scrollAction.x == 'undefined') {
        scrollAction.x = el.scrollLeft;
        scrollAction.y = el.scrollTop;
    }
    var diffX = scrollAction.x - el.scrollLeft;
    var diffY = scrollAction.y - el.scrollTop;
    if (diffX < 0) {
        // Scroll right
        direction = 'right';
    } else if (diffX > 0) {
        // Scroll left
        direction = 'left';
    } else if (diffY < 0) {
        // Scroll down
        direction = 'down';
    } else if (diffY > 0) {
        // Scroll up
        direction = 'up';
    } else {
        // First scroll event
    }
    scrollAction.x = el.scrollLeft;
    scrollAction.y = el.scrollTop;
    return direction;
}

// 播放flash
export function playFlash(flash_path, time, width, height, auto_show) {
    width = 1010;
    if (auto_show === false) return;
    var random_number = parseInt(Math.random() * 10000000);

    if (flash_path.indexOf("king") > 0) {
        $('#live_main').append('<div class="swf_huangdi_area" style="padding-bottom: 100px;" id="play_flash_' + random_number + '">' + '<div style="pointer-events:none;position: absolute; width: ' + width + 'px; height: 655px; margin:0 auto;z-index: 999; top: -100px;overflow:hidden;><table border="0" cellspacing="0" cellpadding="0" width="950"><tr><td vlign="bottom"><div id="flash_' + random_number + '"></div></td></tr></table></div>' + "</div>").show();
    } else {
        var flash_html = '<div id="play_flash_' + random_number + '" style="pointer-events:none;position: absolute; width: ' + width + 'px; height: 655px; margin:0 auto;z-index: 999; top: 50px;overflow:hidden;><table border="0" cellspacing="0" cellpadding="0" width="1100"><tr><td vlign="bottom"><div id="flash_' + random_number + '"></div></td></tr></table></div>';
        $('#gift_animate_area').append(flash_html).show();
        //			console.log(flash_html);
    }
    swfobject.embedSWF(flash_path, "flash_" + random_number, width, height, "10", "", {}, {
        allowFullScreen: true,
        wmode: 'transparent',
        allowScriptAccess: 'always'
    }, {
        id: "flash" + random_number,
        name: "flash" + random_number
    });

    var flash_play_timeout = setTimeout(function() {
        $('#play_flash_' + random_number).remove();
        if ($('#gift_animate_area').children().length == 0) {
            $('#gift_animate_area').hide();
        }
        clearTimeout(flash_play_timeout);
    }, time);

}





/*
 * formatMoney(s,type)
 * 功能：金额按千位逗号分割
 * 参数：s，需要格式化的金额数值.
 * 参数：type,判断格式化后的金额是否需要小数位.
 * 返回：返回格式化后的数值字符串.
 */
export function formatMoney(s, type) {
    if (/[^0-9\.]/.test(s))
        return "0";
    if (s == null || s == "")
        return "0";
    s = s.toString().replace(/^(\d*)$/, "$1.");
    s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
    s = s.replace(".", ",");
    var re = /(\d)(\d{3},)/;
    while (re.test(s))
        s = s.replace(re, "$1,$2");
    s = s.replace(/,(\d\d)$/, ".$1");
    if (type == 0) { // 不带小数位(默认是有小数位)
        var a = s.split(".");
        if (a[1] == "00") {
            s = a[0];
        }
    }
    return s;
}



/*//存储localStorage
export function setStore(name, content) {
  if(!localStorage){return;}
  if (!name) return;
  let cacheExpireDate=new Date().getTime()+24*60*60*1000; //缓存时间24小时
  /!*if (typeof content !== 'string') {
    content = JSON.stringify(content);
  }*!/
  let item={val:content,exp:cacheExpireDate};
  item = JSON.stringify(item);
  window.localStorage.setItem(name, item);
}

//获取localStorage
export function getStore (name){
  if(!localStorage){return;}
  if (!name) return;
  let item=window.localStorage.getItem(name);
  let now=new Date().getTime();
  if(item){
    item=JSON.parse(item);
    if( now>item.exp){
      removeStore(name);
      return "";
    }else{
      return item.val;
    }
  }
}*/
//存储localStorage
export function setStore(name, content) {
    if (!localStorage) { return; }
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.localStorage.setItem(name, content);
}

//获取localStorage
export function getStore(name) {
    if (!localStorage) { return; }
    if (!name) return;
    return window.localStorage.getItem(name);
}

//删除localStorage
export function removeStore(name) {
    if (!localStorage) { return; }
    if (!name) return;
    window.localStorage.removeItem(name);
}

//图片上传
export function uploadImg(e, callback, limitedSize) {
    e = event ? event : window.event;
    var el = e.target ? e.target : e.srcElement;
    if (!el.files) {
        alert('您的浏览器版本太低，请升级浏览器');
        return;
    }
    var file = el.files[0];
    if (!file) {
        return;
    }
    let uploadImg = null; //图片数据清零
    var limited = limitedSize ? limitedSize : 1; //默认限制上传大小为1MB
    var result = file.name.split('.');
    var suffix = result[result.length - 1];
    if (!/(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(suffix)) {
        this.$store.commit('setToast', '图片格式不正确!请上传gif|jpg|jpeg|png格式');
        return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
        var size = Math.floor(file.size / 1024 / 1024 * 100) / 100; //单位MB
        if (size < limited) {
            uploadImg = this.result;
            callback(uploadImg, suffix);
        } else {
            var Img = new Image();
            Img.src = e.target.result;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            Img.onload = function() {
                // 图片原始尺寸
                var originWidth = this.width;
                var originHeight = this.height;
                //对图片宽高等比缩放
                var targetWidth = Math.ceil(originWidth * limited / size),
                    targetHeight = Math.ceil(originHeight * limited / size);
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                // 清除画布
                context.clearRect(0, 0, targetWidth, targetHeight);
                // 图片压缩
                context.drawImage(Img, 0, 0, targetWidth, targetHeight);
                var base64 = canvas.toDataURL("image/jpeg", 0.8); //压缩图片
                uploadImg = base64;
                callback(uploadImg, suffix);
            }
        }
    }

}

export function getBase64Image(url, cb) {
    var img = new Image();
    img.src = url;
    img.crossOrigin = ""; //"*";
    img.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
        var dataURL = canvas.toDataURL("image/" + ext);
        cb && cb(dataURL)
    }
}
