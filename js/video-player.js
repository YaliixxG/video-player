// 选择DOM
const $ = tag => {
    return document.querySelector(tag);
};

class VideoPlayer {
    constructor(dataJSON) {
        this.wh; // #video宽高比
        this.isSmallWindow = false; // 是否是小窗口模式
        this.smallWindowWidth = 300; // 小窗口模式尺寸
        this.isFullScreenMode = false; // 是否为全屏模式
        this.isWidthScreenMode = false; // 是否为宽屏模式
        this.isTheaterMode = false; // 是否为剧场模式
        this.timer = null; // 定时器
        this.progressWidth = 780; // 进度条长度
        this.volumeNum = 0.5; // 音量
        this.isSilent = false; // 是否静音
        this.isShowBarrage = true; // 是否展示弹幕
        this.barrageData = []; // 弹幕数据容器
        this.dataJSON = dataJSON; // 弹幕数据
    }

    // 格式化时间
    _formatTime(t) {
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
    }

    // 判断是否全屏
    _isFullscreen() {
        return (
            document.fullscreenElement ||
            document.msFullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            false
        );
    }

    // 进入全屏
    _openFullscreen(ele) {
        if (ele.requestFullscreen) {
            ele.requestFullscreen();
        } else if (ele.mozRequestFullScreen) {
            ele.mozRequestFullScreen();
        } else if (ele.webkitRequestFullscreen) {
            ele.webkitRequestFullscreen();
        } else if (ele.msRequestFullscreen) {
            ele.msRequestFullscreen();
        }
    }

    // 退出全屏
    _exitFullscreen(ele) {
        if (document.exitFullScreen) {
            document.exitFullScreen();
        } else if (document.mozCancelFullScreen) {
            ele.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // 设置视频总时长
    _setVideoTime() {
        let allTime = this._formatTime($('#video').duration);
        $('.time-all').innerText = allTime;
    }

    // 设置当期时间
    _setCurrentTime() {
        let currentTime = this._formatTime($('#video').currentTime);
        $('.time-now').innerText = currentTime;
    }

    // 设置当前进度条动态宽度
    _setCurrentStep(stepWidth) {
        $('.step').style.width = stepWidth * $('#video').currentTime + 'px';
    }

    // 设置弹幕按视频时间排序
    _setBarrageByTime() {
        this.barrageData = JSON.parse(JSON.stringify(this.dataJSON));
        this.barrageData.sort((a, b) => a.time - b.time);
    }

    // 设置音量
    _setVolume(num) {
        $('#video').volume = num;
        this.volumeNum = num || this.volumeNum;
        this.isSilent = num <= 0;
        $('.volume-now').style.height = num * 100 + 'px';
        $('.volume-text').innerText = parseInt(num * 100);
        $('.volume-on').className = this.isSilent
            ? 'volume-on muted'
            : 'volume-on';
    }

    // 装载弹幕列表数据
    _loadingBarrageList() {
        $('.comment-list-wrap ul').innerHTML = '';
        if (!this.dataJSON.length) {
            $('.comment-list-wrap').className = 'comment-list-wrap no-comment';
            $('.no-comment-tips').style.display = 'block';
            return;
        }
        this.dataJSON.forEach((item, i) => {
            let commentLi = document.createElement('li');
            commentLi.innerText = item.content;
            commentLi.title = item.content;
            $('.comment-list-wrap ul').appendChild(commentLi);
        });
    }

    // 播放
    _play() {
        $('#video').play();
        let stepWidth = this.progressWidth / $('#video').duration;
        this.timer = setInterval(_ => {
            this._setCurrentTime();
            this._setCurrentStep(stepWidth);
        }, 100);
        $('#play').className = 'pause';
        $('#unique-play').style.display = 'none';
        $('#play').title = '暂停';
    }

    // 暂停
    _pause() {
        $('#video').pause();
        clearInterval(this.timer);
        $('#play').className = 'play';
        $('#unique-play').style.display = 'block';
        $('#play').title = '播放';
    }

    // 设置小窗口播放
    setSmallWindow() {
        if (!this.isSmallWindow) return;
        $('#play-box').className = 'play-box small';
        $('#play-box').style.width = this.smallWindowWidth + 'px';
        $('#play-box').style.height = this.smallWindowWidth / this.wh + 'px';
        $('#video').width = this.smallWindowWidth;
        $('#video').height = this.smallWindowWidth / this.wh;
        $('#play-action').style.display = 'none';
        $('#unique-play').className = 'unique-play small';
        $('#video-player-right').style.display = 'none';
    }

    // 退出小窗口播放
    escSmallWindow() {
        if (this.isSmallWindow) return;
        $('#play-box').className = 'play-box';
        $('#unique-play').className = 'unique-play';
        $('#unique-play').style.display = $('#video').paused ? 'block' : 'none';
        $('#video-player-right').style.display = 'block';
        this.initSize();
    }

    // 播放按钮控件播放与暂停
    playAction() {
        $('#unique-play').className = this.isSmallWindow
            ? 'unique-play small'
            : 'unique-play';

        $('#video').paused ? this._play() : this._pause();
    }

    // 全局播放按钮播放与暂停
    uniquePlay() {
        $('#video').paused ? this._play() : this._pause();
    }

    // 全屏播放控件
    async fullScreenPlay() {
        // 先检查是否是在宽屏模式下全屏
        this.isWidthScreenMode && this.toggleWidthScreen();

        let isFS = this._isFullscreen();
        if (isFS) {
            this._exitFullscreen();
        } else {
            await this._openFullscreen($('#play-box'));
        }
        this.isFullScreenMode = !isFS;
        this.initSize();
        $('#full-screen').title = isFS ? '全屏' : '退出全屏';
        $('#full-screen').className = isFS
            ? 'full-screen in'
            : 'full-screen out';
        $('#width-screen').style.display = isFS ? 'block' : 'none';
    }

    // 宽屏播放
    toggleWidthScreen() {
        this.isWidthScreenMode = !this.isWidthScreenMode;
        this.initSize();
        $('#width-screen').title = this.isWidthScreenMode ? '退出宽屏' : '宽屏';
        $('#width-screen').className = this.isWidthScreenMode
            ? 'width-screen out'
            : 'width-screen in';
        $('#video-player-right').style.display = this.isWidthScreenMode
            ? 'none'
            : 'block';
    }

    // 剧场模式
    setTheaterMode() {
        this.isTheaterMode = !this.isTheaterMode;
        $('#video-player-left').className = this.isTheaterMode
            ? 'video-player-left theater'
            : 'video-player-left';
        $('.theater-mode').title = this.isTheaterMode
            ? '退出剧场模式'
            : '剧场模式';
    }

    // 选择倍速
    selectSpeedPlay(e) {
        let dataValue = e.target.getAttribute('data-value');

        $('#video').playbackRate = Number(dataValue);
        $('.speed-play-title').innerText =
            dataValue === '1.0' ? '倍速' : dataValue + 'x';
        this.toggleVisible($('.speed-play-menu'), false);
    }

    clickProgress(e) {
        if (e.offsetX < 0) return;
        $('.step').style.width = e.offsetX + 'px';
        $('#video').currentTime =
            (e.offsetX / this.progressWidth) * $('#video').duration;
    }

    dragProgress(event, stepFlagLeft) {
        let e = event || window.event;
        let progressX = e.clientX - stepFlagLeft;
        if (progressX <= 0) {
            progressX = 0;
        }
        if (progressX >= this.progressWidth) {
            progressX = this.progressWidth;
        }
        $('.step').style.width = progressX + 'px';
        $('#video').currentTime =
            (progressX / this.progressWidth) * $('#video').duration;
    }

    setVolumeSilent() {
        this.isSilent = !this.isSilent;
        $('#video').volume = this.isSilent ? 0 : this.volumeNum;
        this._setVolume($('#video').volume);
    }

    dragVolume(event, volumeAllTop) {
        let e = event || window.event;
        let progressY = volumeAllTop - e.clientY;
        if (progressY <= 0) {
            progressY = 0;
        }
        if (progressY >= 100) {
            progressY = 100;
        }
        $('.volume-text').innerText = progressY;
        this._setVolume(progressY / 100);
    }

    toggleVisible(d, isVisible) {
        d.style.visibility = isVisible ? 'visible' : 'hidden';
    }

    sendBarrage() {
        if (!this.dataJSON.length) {
            $('.comment-list-wrap').className = 'comment-list-wrap';
            $('.no-comment-tips').style.display = 'none';
        }

        // 前端数据（视频弹幕数据按视频时间）
        this.barrageData.unshift({
            content: $('.comment-value').value,
            time: $('#video').currentTime
        });

        // 后台数据（弹幕列表按发送时间）
        this.dataJSON.push({
            content: $('.comment-value').value,
            time: $('#video').currentTime
        });

        let commentLi = document.createElement('li');
        commentLi.innerText = $('.comment-value').value;
        commentLi.title = $('.comment-value').value;
        $('.comment-list-wrap ul').appendChild(commentLi);
        $('.comment-list-wrap').scrollTop = $(
            '.comment-list-wrap'
        ).scrollHeight;
        $('.comment-value').value = '';
    }

    // 显示屏幕弹幕
    showScreenBarrage() {
        if (
            !this.barrageData.length ||
            this.isSmallWindow ||
            $('#video').currentTime < this.barrageData[0].time
        )
            return;

        if ($('#video').currentTime - this.barrageData[0].time > 2) {
            this.barrageData.shift();
            return;
        }
        let barrageBoxItem = document.createElement('div');
        barrageBoxItem.innerText = this.barrageData[0].content;
        barrageBoxItem.style.top =
            parseInt($('.barrage-box').style.height) * Math.random() -
            10 +
            'px';
        $('.barrage-box').appendChild(barrageBoxItem);
        this.barrageData.shift();
    }

    toggleBarrageBtn() {
        this.isShowBarrage = !this.isShowBarrage;
        $('.barrage-box').style.opacity = this.isShowBarrage ? 1 : 0;
        $('.barrage-btn').title = this.isShowBarrage ? '关弹幕' : '开弹幕';
        $('.barrage-btn').className = this.isShowBarrage
            ? 'barrage-btn barrage-off'
            : 'barrage-btn barrage-on';
    }

    // 初始化尺寸
    initSize() {
        const WINDOW_GAP = 300; // 整个播放器两侧空隙
        const VIDEO_WIDTH_MAX = 1400; // #video最大宽度
        const VIDEO_WIDTH_MIN = 500; // #video最小宽度
        const VP_WIDTH = 300; // .video-player-right宽度
        let width = document.body.clientWidth - WINDOW_GAP - VP_WIDTH;

        if (width > VIDEO_WIDTH_MAX) {
            width = VIDEO_WIDTH_MAX;
        } else if (width < VIDEO_WIDTH_MIN) {
            width = VIDEO_WIDTH_MIN;
        }

        let height = parseInt(width / this.wh);

        if (this.isFullScreenMode) {
            width = $('#video').clientWidth;
            height = $('#video').clientHeight;
        }
        if (this.isWidthScreenMode) {
            width = $('#video').clientWidth + VP_WIDTH;
            height = parseInt(width / this.wh);
        }

        $('#video').width = width;
        $('#video').height = height;
        this.progressWidth = width - 16;

        $('#video-player').style.width = this.isWidthScreenMode
            ? width + 'px'
            : width + VP_WIDTH + 'px';
        $('#play-box').style.width = width + 'px';
        $('#play-box').style.height = height + 'px';
        $('#play-action').style.width = width + 'px';
        $('.barrage-box').style.width = width + 'px';
        $('.barrage-box').style.height = height - 50 + 'px';

        this._loadingBarrageList();
        this._setBarrageByTime();
    }

    // 初始化
    init() {
        this.wh = $('#video').clientWidth / $('#video').clientHeight;
        this._setVideoTime();
        this._setCurrentTime();
        this.initSize();
    }
}

let vp = new VideoPlayer(barrageJSON);

// 监听浏览器窗口尺寸
window.addEventListener('resize', function() {
    !vp.isSmallWindow && vp.initSize();
});

// 监听滚动条滚动
window.addEventListener('scroll', function() {
    vp.isSmallWindow = window.pageYOffset > $('#video').height - 50;

    if (vp.isSmallWindow) {
        vp.setSmallWindow();
    } else {
        vp.escSmallWindow();
    }
});

// 视频就绪
$('#video').oncanplay = function() {
    vp.init();
};

// 监听视频区域鼠标滑入
$('#video-player-left').onmousemove = function() {
    if (vp.isSmallWindow) {
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
$('#video-player-left').onmouseout = function() {
    if (vp.isSmallWindow) {
        $('#unique-play').style.display = 'none';
    } else {
        $('#unique-play').className = 'unique-play';
    }
    $('#play-action').style.display = 'none';
};

// 播放按钮控件播放与暂停
$('#play').onclick = function() {
    vp.playAction();
};

// 全局播放按钮播放与暂停
$('#unique-play').onclick = function() {
    vp.uniquePlay();
};

// 全屏播放
$('#full-screen').onclick = function() {
    vp.fullScreenPlay();
};

// 宽屏控件操作
$('#width-screen').onclick = function() {
    vp.toggleWidthScreen();
};

// 剧场模式
$('.theater-mode').onclick = function() {
    vp.setTheaterMode();
};

// 倍速控件
$('.speed-play').onmousemove = function() {
    vp.toggleVisible($('.speed-play-menu'), true);
};

$('.speed-play').onmouseout = function() {
    vp.toggleVisible($('.speed-play-menu'), false);
};

// 选择倍速
$('.speed-play-menu').addEventListener('click', function(e) {
    vp.selectSpeedPlay(e);
});

// 单击进度条控制快进，快退
$('#progress').onclick = function(e) {
    vp.clickProgress(e);
};

// 拖动进度条控制快进，快退
$('#step-flag').onmousedown = function(event) {
    let e = event || window.event;
    let stepFlagLeft = e.clientX - this.offsetLeft;

    document.onmousemove = function(event) {
        vp.dragProgress(event, stepFlagLeft);
    };

    document.onmouseup = function() {
        document.onmousemove = null;
        document.onmousedown = null;
    };

    return false;
};

// 音量控件
$('.volume-ctrl').onmousedown = function() {
    vp.toggleVisible($('.volume-adjustment'), true);
};

$('.volume-ctrl').onmousemove = function() {
    vp.toggleVisible($('.volume-adjustment'), true);
};

$('.volume-ctrl').onmouseout = function() {
    vp.toggleVisible($('.volume-adjustment'), false);
};

// 静音设置
$('.volume-on').onclick = function() {
    vp.setVolumeSilent();
};

// 拖动音量块控制音量
$('#volume-flag').onmousedown = function(event) {
    let e = event || window.event;
    let volumeAllTop = $('.volume-all').getBoundingClientRect().bottom - 10;

    document.onmousemove = function(event) {
        vp.dragVolume(event, volumeAllTop);
    };

    document.onmouseup = function() {
        document.onmousemove = null;
        document.onmousedown = null;
    };

    return false;
};

// 监听视频播放时间
$('#video').addEventListener('timeupdate', function() {
    vp.showScreenBarrage();
});

// 视频结束
$('#video').addEventListener('ended', function() {
    vp.pause();
});

// 发送弹幕
$('.submit-btn').onclick = function() {
    vp.sendBarrage();
};

$('body').addEventListener('keydown', function(event) {
    if (event.keyCode == 13) {
        vp.sendBarrage();
    }
});

// 弹幕开关控件
$('.barrage-btn').onclick = function() {
    vp.toggleBarrageBtn();
};
