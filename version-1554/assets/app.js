(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalizeText(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initNavigation() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("nav-open");
    });
  }

  function initGlobalSearch() {
    var forms = document.querySelectorAll("[data-global-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var previous = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });
    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function initCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-text]"));
    var empty = document.querySelector("[data-empty-result]");
    var queryInput = document.querySelector("[data-query-input]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (queryInput && initial) {
      input.value = initial;
    }

    function applyFilter() {
      var query = normalizeText(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute("data-card-text"));
        var match = !query || text.indexOf(query) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("active", visible === 0);
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  }

  function bindPlayer(streamUrl) {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var hls = null;
    var prepared = false;

    if (!video || !streamUrl) {
      return;
    }

    function playVideo() {
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      }
    }

    function start() {
      player.classList.add("playing");
      video.controls = true;
      prepare();
      playVideo();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = bindPlayer;

  ready(function () {
    initNavigation();
    initGlobalSearch();
    initHeroCarousel();
    initCardFilter();
  });
})();
