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
let video = document.querySelector('#video');
let playBox = document.querySelector('#play-box');
let playAction = document.querySelector('#play-action');
let playBtn = document.querySelector('#play');
let uniquePlayBtn = document.querySelector('#unique-play');
let fullScreenBtn = document.querySelector('#full-screen');
let widthScreenBtn = document.querySelector('#width-screen');
let videoPlayerRight = document.querySelector('#video-player-right');
let theaterMode = document.querySelector('#theater-mode');
let videoPlayerLeft = document.querySelector('#video-player-left');

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
        width = video.clientWidth;
        height = video.clientHeight;
    }
    if (isWidthScreenMode) {
        width = video.clientWidth + vpWidth;
        height = parseInt(width / wh);
    }

    video.width = width;
    video.height = height;

    document.querySelector('#video-player').style.width = isWidthScreenMode
        ? width + 'px'
        : width + vpWidth + 'px';
    playBox.style.width = width + 'px';
    playBox.style.height = height + 'px';
    playAction.style.width = width + 'px';
};

// 监听浏览器窗口尺寸
window.addEventListener('resize', function() {
    if (!isSmallWindow) {
        initSize();
    }
});

// 监听滚动条滚动
window.addEventListener('scroll', function() {
    isSmallWindow = window.pageYOffset > video.height - 50;

    if (isSmallWindow) {
        setSmallWindow();
    } else {
        escSmallWindow();
    }
});

// 设置小窗口播放
const setSmallWindow = () => {
    if (!isSmallWindow) return;
    playBox.className = 'play-box small';
    playBox.style.width = smallWindowWidth + 'px';
    playBox.style.height = smallWindowWidth / wh + 'px';
    video.width = smallWindowWidth;
    video.height = smallWindowWidth / wh;
    playAction.style.display = 'none';
    uniquePlayBtn.className = 'unique-play small';
};

// 退出小窗口播放
const escSmallWindow = () => {
    if (isSmallWindow) return;
    playBox.className = 'play-box';
    uniquePlayBtn.className = 'unique-play';
    uniquePlayBtn.style.display = video.paused ? 'block' : 'none';
    initSize();
};

// 视频就绪
video.oncanplay = function() {
    wh = video.clientWidth / video.clientHeight;
    initSize();
};

// 监听视频区域鼠标滑入
playBox.onmousemove = function() {
    if (isSmallWindow) {
        uniquePlayBtn.className = video.paused
            ? 'unique-play small'
            : 'unique-pause small';
        uniquePlayBtn.style.display = 'block';
        return;
    }
    uniquePlayBtn.className = 'unique-play';
    playAction.style.display = 'block';
};

// 监听视频区域鼠标滑出
playBox.onmouseout = function() {
    if (isSmallWindow) {
        uniquePlayBtn.style.display = 'none';
    } else {
        uniquePlayBtn.className = 'unique-play';
    }
    playAction.style.display = 'none';
};

// 控件播放按钮播放与暂停
playBtn.onclick = function() {
    uniquePlayBtn.className = isSmallWindow
        ? 'unique-play small'
        : 'unique-play';

    if (video.paused) {
        video.play();
        playBtn.className = 'pause';
        uniquePlayBtn.style.display = 'none';
        playBtn.title = '暂停';
    } else {
        video.pause();
        playBtn.className = 'play';
        uniquePlayBtn.style.display = 'block';
        playBtn.title = '播放';
    }
};

// 全局播放按钮播放与暂停
uniquePlayBtn.onclick = function() {
    if (video.paused) {
        video.play();
        playBtn.className = 'pause';
        uniquePlayBtn.style.display = 'none';
    } else {
        video.pause();
        playBtn.className = 'play';
    }
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
fullScreenBtn.onclick = async function() {
    // 先检查是否是在宽屏模式下全屏
    isWidthScreenMode && toggleWidthScreen();

    let isFS = isFullscreen();
    if (isFS) {
        exitFullscreen();
    } else {
        await openFullscreen(playBox);
    }
    isFullScreenMode = !isFS;
    initSize();
    fullScreenBtn.title = isFS ? '全屏' : '退出全屏';
    fullScreenBtn.className = isFS ? 'full-screen in' : 'full-screen out';
    widthScreenBtn.style.display = isFS ? 'block' : 'none';
};

// 宽屏控件操作
widthScreenBtn.onclick = function() {
    toggleWidthScreen();
};

// 宽屏播放
const toggleWidthScreen = () => {
    isWidthScreenMode = !isWidthScreenMode;
    initSize();
    widthScreenBtn.title = isWidthScreenMode ? '退出宽屏' : '宽屏';
    widthScreenBtn.className = isWidthScreenMode
        ? 'width-screen out'
        : 'width-screen in';
    videoPlayerRight.style.display = isWidthScreenMode ? 'none' : 'block';
};

// 剧场模式
theaterMode.onclick = function() {
    isTheaterMode = !isTheaterMode;
    if (isTheaterMode) {
        videoPlayerLeft.className = 'video-player-left theater';
        theaterMode.title = '退出剧场模式';
    } else {
        videoPlayerLeft.className = 'video-player-left';
        theaterMode.title = '剧场模式';
    }
};
