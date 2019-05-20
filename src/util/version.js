var apiHost = window.location.protocol + "//" + location.host
let dev = {
  introduction: '本地环境',
  baseURL: 'http://2.www.liaoke.tv/raw/test/index.html#/',
  apiHost: '/api',//http://2.www.liaoke.tv/       /api
  videoPlay: false,//本地 false 测试目录 true #############################################
  console: function () {

  }
}
let test = {
  introduction: '测试环境',
  baseURL: 'http://2.www.liaoke.tv/raw/test/index.html#/',
  // apiHost: 'http://2.www.liaoke.tv',//http://2.www.liaoke.tv/   https://www.liaoke.tv
  apiHost: '/api',
  videoPlay: true,
  console: function () {
  }
}
let testdev = {
  introduction: '本地测试环境',
  baseURL: 'http://2.www.liaoke.tv/raw/test/index.html#/',
  apiHost: 'http://2.www.liaoke.tv',//http://2.www.liaoke.tv/   https://www.liaoke.tv
  videoPlay: false,
  console: function () {

  }
}

let online = {
  introduction: '正式环境',
  // baseURL: 'https://www.liaoke.tv/mobile/room/#/',
  apiHost: apiHost,
  videoPlay: true,
  console: function () {
    window.console.log = function () { };
  }
}
let obj = dev;
// let obj = online;
// let obj = test;
// let obj = testdev;
// export default true ? online : dev;
export default obj;
