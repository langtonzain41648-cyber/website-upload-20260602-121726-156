(function () {
  const shell = document.querySelector('[data-player-shell]');
  const video = shell ? shell.querySelector('video') : null;
  const button = document.querySelector('[data-play-button]');
  const status = document.querySelector('[data-player-status]');
  let initialized = false;
  let hlsInstance = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function hideOverlay() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function loadSource() {
    if (!video || initialized) {
      return;
    }

    const source = video.getAttribute('data-src');
    if (!source) {
      setStatus('当前影片暂未配置播放源。');
      return;
    }

    initialized = true;
    setStatus('正在加载播放源，请稍候。');

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源加载完成。');
        video.play().catch(function () {
          setStatus('播放源已就绪，请再次点击播放按钮。');
        });
      });

      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载异常，可刷新页面后重试。');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('播放源加载完成。');
        video.play().catch(function () {
          setStatus('播放源已就绪，请再次点击播放按钮。');
        });
      }, { once: true });
    } else {
      video.src = source;
      setStatus('浏览器不支持 HLS 自动解析，可尝试使用支持 HLS 的浏览器打开。');
    }
  }

  function playVideo() {
    loadSource();
    hideOverlay();
    if (video) {
      video.play().catch(function () {
        setStatus('播放器已启动，请使用视频控件继续播放。');
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      playVideo();
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
