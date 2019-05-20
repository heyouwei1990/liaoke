    var topic = 'liaoke2/room/9451807'; //+ ID; //需要操作的Topic
    var time = new Date().getTime();
    var groupId = 'GID-room';
    var secretKey = '3rjEoQs9n5pJk266DGHx40wYZXdHaF'; //账号的的SecretKey，在阿里云控制台查看
    var password = CryptoJS.HmacSHA1(groupId, secretKey).toString(CryptoJS.enc.Base64);
    export default {
        host: 'ws.liaoke.tv',
        port: 443,
        useTLS: true,
        topic: topic,
        accessKey: 'LTAIFHOeGmbjn4Yp', // name  账号的AccessKey，在阿里云控制台查看
        secretKey: secretKey, //账号的的SecretKey，在阿里云控制台查看
        cleansession: true,
        groupId: 'GID-room',
        clientId: groupId + '@@@' + time + Math.random(), //GroupId@@@DeviceId，由控制台申请的Group ID和自己指定的Device ID组合构成
        reconnectTimeout: 2000,
        password: password,
        timer: null
    }


    //          client: new Paho.MQTT.Client(mqttPZ.host, mqttPZ.port, mqttPZ.clientId), //第三个参数是clientID可以为空

    //   onConnectionLost: function(responseObject) {
    //                 if (responseObject.errorCode !== 0) {
    //                 console.log("onConnectionLost:" + responseObject.errorMessage);
    //             console.log("连接已断开");
    //         }
    //     },
    //             onMessageArrived: function(message) {
    //                 var payload = JSON.parse(message.payloadString);
    //             this.$emit("onmessageArrived", payload);
    //         },
    //             onConnect: function() {
    //                 console.log("onConnected");
    //             var tipcObj = this.topicArr;
    //                 for (var i = 0; i < tipcObj.length; i++) {
    //                 this.client.subscribe(tipcObj[i], { qos: 0 }); //订阅主题
    //                 }
    //     } 


    //             var options = {
    //             timeout: 3,
    //         userName: mqttPZ.accessKey,
    //         password: mqttPZ.password,
    //         useSSL: mqttPZ.useTLS,
    //         onSuccess: this.onConnect,
    //                 onFailure: function(message) {
    //             console.log("onFailure");
    //                     console.log(message);
    //     }
    // };
    // this.client.connect(options); //连接服务器并注册连接成功处理事件
    // this.client.onConnectionLost = this.onConnectionLost; //注册连接断开处理事件
    // this.client.onMessageArrived = this.onMessageArrived; //注册消息接收处理事件