(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    var yearSelects = Array.prototype.slice.call(document.querySelectorAll(".year-filter"));
    var typeSelects = Array.prototype.slice.call(document.querySelectorAll(".type-filter"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".empty-note");
    if (!inputs.length && !yearSelects.length && !typeSelects.length) {
      return;
    }
    function getValue(list) {
      return list.length ? list[0].value.trim().toLowerCase() : "";
    }
    function apply() {
      var keyword = getValue(inputs);
      var year = getValue(yearSelects);
      var type = getValue(typeSelects);
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.tags, card.dataset.year, card.dataset.type].join(" ").toLowerCase();
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passYear = !year || card.dataset.year === year;
        var passType = !type || card.dataset.type === type;
        var show = passKeyword && passYear && passType;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    inputs.concat(yearSelects).concat(typeSelects).forEach(function (el) {
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });
  }

  function initPlayer() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-overlay");
      if (!video || !button) {
        return;
      }
      var source = video.querySelector("source");
      var url = source ? source.getAttribute("src") : "";
      var attached = false;
      function attach() {
        if (attached || !url) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      function play() {
        attach();
        button.classList.add("hidden");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            button.classList.remove("hidden");
          });
        }
      }
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("hidden");
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
