(function() {
    // 配置
    var envir = 'online';
    var configMap = {
        dev: {
            appkey: 'b0d8754e06bc139fd6e24572f5f302db',
            url:'https://apptest.netease.im'
        },
        test: {
            appkey: 'b0d8754e06bc139fd6e24572f5f302db',
            url:'https://apptest.netease.im'
        },
        pre:{
    		appkey: 'b0d8754e06bc139fd6e24572f5f302db',
    		url:'http://preapp.netease.im:8184'
        },
        online: {
           appkey: 'b0d8754e06bc139fd6e24572f5f302db',
           url:'https://192.168.198.161'
        }
    };
    window.CONFIG = configMap[envir];
    // 是否开启订阅服务
    window.CONFIG.openSubscription = true
}())
