let videoWidth = 780; // #video宽度
let videoWidthMax = 1400; // #video最大宽度
let videoWidthMin = 500; // #video最小宽度
let vpWidth = 300; // .video-player-right宽度
let wh; // #video宽高比
let isSmallWindow = false; // 是否是小窗口模式
let smallWindowWidth = 300; // 小窗口模式尺寸
let isFullScreenMode = false; // 是否为全屏模式
let isWidthScreenMode = false; // 是否为宽屏模式
let isTheaterMode = false; // 是否为剧场模式
let timer; // 定时器
let progressWidth = 780; // 进度条长度
let volumeNum = 0.5; // 音量
let isSilent = false; // 是否静音
let isShowBarrage = true; // 是否展示弹幕
let barrageData = []; // 弹幕数据

// 选择DOM
const $ = tag => {
    return document.querySelector(tag);
};

// 初始化尺寸
const initSize = () => {
    let windowGap = 300;
    let width = document.body.clientWidth - windowGap - vpWidth;

    if (width > videoWidthMax) {
        width = videoWidthMax;
    } else if (width < videoWidthMin) {
        width = videoWidthMin;
    }

    let height = parseInt(width / wh);

    if (isFullScreenMode) {
        width = $('#video').clientWidth;
        height = $('#video').clientHeight;
    }
    if (isWidthScreenMode) {
        width = $('#video').clientWidth + vpWidth;
        height = parseInt(width / wh);
    }

    $('#video').width = width;
    $('#video').height = height;
    progressWidth = width - 16;

    $('#video-player').style.width = isWidthScreenMode
        ? width + 'px'
        : width + vpWidth + 'px';
    $('#play-box').style.width = width + 'px';
    $('#play-box').style.height = height + 'px';
    $('#play-action').style.width = width + 'px';
    $('.barrage-box').style.width = width + 'px';
    $('.barrage-box').style.height = height - 50 + 'px';

    loadingBarrageList();
    setBarrageByTime();
};

// 监听浏览器窗口尺寸
window.addEventListener('resize', function() {
    if (!isSmallWindow) {
        initSize();
    }
});

// 监听滚动条滚动
window.addEventListener('scroll', function() {
    isSmallWindow = window.pageYOffset > $('#video').height - 50;

    if (isSmallWindow) {
        setSmallWindow();
    } else {
        escSmallWindow();
    }
});

// 设置小窗口播放
const setSmallWindow = () => {
    if (!isSmallWindow) return;
    $('#play-box').className = 'play-box small';
    $('#play-box').style.width = smallWindowWidth + 'px';
    $('#play-box').style.height = smallWindowWidth / wh + 'px';
    $('#video').width = smallWindowWidth;
    $('#video').height = smallWindowWidth / wh;
    $('#play-action').style.display = 'none';
    $('#unique-play').className = 'unique-play small';
    $('#video-player-right').style.display = 'none';
};

// 退出小窗口播放
const escSmallWindow = () => {
    if (isSmallWindow) return;
    $('#play-box').className = 'play-box';
    $('#unique-play').className = 'unique-play';
    $('#unique-play').style.display = $('#video').paused ? 'block' : 'none';
    $('#video-player-right').style.display = 'block';
    initSize();
};

// 格式化时间
const formatTime = t => {
    let h = parseInt(t / 3600);
    let t1 = t - h * 3600;
    let m = parseInt(t1 / 60);
    let s = Math.round(t1 - m * 60);
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    if (!!h) {
        h = h < 10 ? '0' + h : h;
        return h + ':' + m + ':' + s;
    }
    return m + ':' + s;
};

// 获取时间
const getVideoTime = () => {
    let allTime = formatTime($('#video').duration);
    $('.time-all').innerText = allTime;
};

// 获取当前时间
const getCurrentTime = () => {
    let currentTime = formatTime($('#video').currentTime);
    $('.time-now').innerText = currentTime;
};

// 视频就绪
$('#video').oncanplay = function() {
    wh = $('#video').clientWidth / $('#video').clientHeight;
    getVideoTime();
    getCurrentTime();
    initSize();
};

// 监听视频区域鼠标滑入
$('#play-box').onmousemove = function() {
    if (isSmallWindow) {
        $('#unique-play').className = $('#video').paused
            ? 'unique-play small'
            : 'unique-pause small';
        $('#unique-play').style.display = 'block';
        return;
    }
    $('#unique-play').className = 'unique-play';
    $('#play-action').style.display = 'block';
};

// 监听视频区域鼠标滑出
$('#play-box').onmouseout = function() {
    if (isSmallWindow) {
        $('#unique-play').style.display = 'none';
    } else {
        $('#unique-play').className = 'unique-play';
    }
    $('#play-action').style.display = 'none';
};

// 播放
const play = () => {
    $('#video').play();
    let stepWidth = progressWidth / $('#video').duration;
    timer = setInterval(_ => {
        getCurrentTime();
        getCurrentStep(stepWidth);
    }, 100);
    $('#play').className = 'pause';
    $('#unique-play').style.display = 'none';
    $('#play').title = '暂停';
};

// 暂停
const pause = () => {
    $('#video').pause();
    clearInterval(timer);
    $('#play').className = 'play';
    $('#unique-play').style.display = 'block';
    $('#play').title = '播放';
};

// 播放按钮控件播放与暂停
$('#play').onclick = function() {
    $('#unique-play').className = isSmallWindow
        ? 'unique-play small'
        : 'unique-play';

    $('#video').paused ? play() : pause();
};

// 全局播放按钮播放与暂停
$('#unique-play').onclick = function() {
    $('#video').paused ? play() : pause();
};

// 判断是否全屏
const isFullscreen = () => {
    return (
        document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        false
    );
};

// 进入全屏
const openFullscreen = ele => {
    if (ele.requestFullscreen) {
        ele.requestFullscreen();
    } else if (ele.mozRequestFullScreen) {
        ele.mozRequestFullScreen();
    } else if (ele.webkitRequestFullscreen) {
        ele.webkitRequestFullscreen();
    } else if (ele.msRequestFullscreen) {
        ele.msRequestFullscreen();
    }
};

// 退出全屏
const exitFullscreen = () => {
    if (document.exitFullScreen) {
        document.exitFullScreen();
    } else if (document.mozCancelFullScreen) {
        ele.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
};

// 全屏播放
$('#full-screen').onclick = async function() {
    // 先检查是否是在宽屏模式下全屏
    isWidthScreenMode && toggleWidthScreen();

    let isFS = isFullscreen();
    if (isFS) {
        exitFullscreen();
    } else {
        await openFullscreen($('#play-box'));
    }
    isFullScreenMode = !isFS;
    initSize();
    $('#full-screen').title = isFS ? '全屏' : '退出全屏';
    $('#full-screen').className = isFS ? 'full-screen in' : 'full-screen out';
    $('#width-screen').style.display = isFS ? 'block' : 'none';
};

// 宽屏控件操作
$('#width-screen').onclick = function() {
    toggleWidthScreen();
};

// 宽屏播放
const toggleWidthScreen = () => {
    isWidthScreenMode = !isWidthScreenMode;
    initSize();
    $('#width-screen').title = isWidthScreenMode ? '退出宽屏' : '宽屏';
    $('#width-screen').className = isWidthScreenMode
        ? 'width-screen out'
        : 'width-screen in';
    $('#video-player-right').style.display = isWidthScreenMode
        ? 'none'
        : 'block';
};

// 剧场模式
$('.theater-mode').onclick = function() {
    isTheaterMode = !isTheaterMode;
    $('#video-player-left').className = isTheaterMode
        ? 'video-player-left theater'
        : 'video-player-left';
    $('.theater-mode').title = isTheaterMode ? '退出剧场模式' : '剧场模式';
};

// 倍速控件
$('.speed-play').onmousemove = function() {
    $('.speed-play-menu').style.visibility = 'visible';
};

$('.speed-play').onmouseout = function() {
    $('.speed-play-menu').style.visibility = 'hidden';
};

$('.speed-play-menu').addEventListener('click', function(e) {
    let dataValue = e.target.getAttribute('data-value');

    $('#video').playbackRate = Number(dataValue);
    $('.speed-play-title').innerText =
        dataValue === '1.0' ? '倍速' : dataValue + 'x';
    $('.speed-play-menu').style.visibility = 'hidden';
});

// 进度条
const getCurrentStep = stepWidth => {
    $('.step').style.width = stepWidth * $('#video').currentTime + 'px';
};

// 单击进度条控制快进，快退
$('#progress').onclick = function(e) {
    if (e.offsetX < 0) return;
    $('.step').style.width = e.offsetX + 'px';
    $('#video').currentTime =
        (e.offsetX / progressWidth) * $('#video').duration;
};

// 拖动进度条控制快进，快退
$('#step-flag').onmousedown = function(event) {
    let e = event || window.event;
    let stepFlagLeft = e.clientX - this.offsetLeft;

    document.onmousemove = function(event) {
        let e = event || window.event;
        let progressX = e.clientX - stepFlagLeft;
        if (progressX <= 0) {
            progressX = 0;
        }
        if (progressX >= progressWidth) {
            progressX = progressWidth;
        }
        $('.step').style.width = progressX + 'px';
        $('#video').currentTime =
            (progressX / progressWidth) * $('#video').duration;
    };

    document.onmouseup = function() {
        document.onmousemove = null;
        document.onmousedown = null;
    };

    return false;
};

// 音量控件
$('.volume-ctrl').onmousemove = function() {
    $('.volume-adjustment').style.visibility = 'visible';
};

$('.volume-ctrl').onmouseout = function() {
    $('.volume-adjustment').style.visibility = 'hidden';
};

const setVolume = function(num) {
    $('#video').volume = num;
    volumeNum = num || volumeNum;
    isSilent = num <= 0;
    $('.volume-now').style.height = num * 100 + 'px';
    $('.volume-text').innerText = parseInt(num * 100);
    $('.volume-on').className = isSilent ? 'volume-on muted' : 'volume-on';
};

// 静音设置

$('.volume-on').onclick = function() {
    isSilent = !isSilent;
    $('#video').volume = isSilent ? 0 : volumeNum;
    setVolume($('#video').volume);
};

// 拖动音量块控制音量
$('#volume-flag').onmousedown = function(event) {
    let e = event || window.event;
    let volumeAllTop = $('.volume-all').getBoundingClientRect().bottom - 10;

    document.onmousemove = function(event) {
        let e = event || window.event;
        let progressY = volumeAllTop - e.clientY;
        if (progressY <= 0) {
            progressY = 0;
        }
        if (progressY >= 100) {
            progressY = 100;
        }
        $('.volume-text').innerText = progressY;
        setVolume(progressY / 100);
    };

    document.onmouseup = function() {
        document.onmousemove = null;
        document.onmousedown = null;
    };

    return false;
};

// 监听视频播放时间
$('#video').addEventListener('timeupdate', function() {
    showScreenBarrage();
});

// 视频结束
$('#video').addEventListener('ended', function() {
    pause();
});

// 发送弹幕
$('.submit-btn').onclick = function() {
    if (!barrageJSON.length) {
        $('.comment-list-wrap').className = 'comment-list-wrap';
        $('.no-comment-tips').style.display = 'none';
    }

    // 前端数据（视频弹幕数据按视频时间）
    barrageData.unshift({
        content: $('.comment-value').value,
        time: $('#video').currentTime
    });

    // 后台数据（弹幕列表按发送时间）
    barrageJSON.push({
        content: $('.comment-value').value,
        time: $('#video').currentTime
    });

    let commentLi = document.createElement('li');
    commentLi.innerText = $('.comment-value').value;
    commentLi.title = $('.comment-value').value;
    $('.comment-list-wrap ul').appendChild(commentLi);
    $('.comment-list-wrap').scrollTop = $('.comment-list-wrap').scrollHeight;
    $('.comment-value').value = '';
};

// 装载弹幕列表数据
const loadingBarrageList = () => {
    $('.comment-list-wrap ul').innerHTML = '';
    if (!barrageJSON.length) {
        $('.comment-list-wrap').className = 'comment-list-wrap no-comment';
        $('.no-comment-tips').style.display = 'block';
        return;
    }
    barrageJSON.forEach((item, i) => {
        let commentLi = document.createElement('li');
        commentLi.innerText = item.content;
        commentLi.title = item.content;
        $('.comment-list-wrap ul').appendChild(commentLi);
    });
};

// 弹幕按视频时间排序
const setBarrageByTime = () => {
    barrageData = JSON.parse(JSON.stringify(barrageJSON));
    barrageData.sort((a, b) => a.time - b.time);
};

// 显示屏幕弹幕
const showScreenBarrage = () => {
    if (
        !barrageData.length ||
        isSmallWindow ||
        $('#video').currentTime < barrageData[0].time
    )
        return;

    if ($('#video').currentTime - barrageData[0].time > 2) {
        barrageData.shift();
        return;
    }
    let barrageBoxItem = document.createElement('div');
    barrageBoxItem.innerText = barrageData[0].content;
    barrageBoxItem.style.top =
        parseInt($('.barrage-box').style.height) * Math.random() - 10 + 'px';
    $('.barrage-box').appendChild(barrageBoxItem);
    barrageData.shift();
};

// 弹幕开关控件
$('.barrage-btn').onclick = function() {
    isShowBarrage = !isShowBarrage;
    $('.barrage-box').style.opacity = isShowBarrage ? 1 : 0;
    $('.barrage-btn').title = isShowBarrage ? '关弹幕' : '开弹幕';
    $('.barrage-btn').className = isShowBarrage
        ? 'barrage-btn barrage-off'
        : 'barrage-btn barrage-on';
};
