(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "×";
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function bindSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function bindPageFilter() {
    var form = document.querySelector(".page-filter");
    if (!form) {
      return;
    }
    var input = form.querySelector("input");
    var select = form.querySelector("select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".page-movie-grid .movie-card"));

    function applyFilter() {
      var query = text(input ? input.value : "");
      var year = select ? select.value : "";
      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var cardYear = card.getAttribute("data-year") || "";
        var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year);
        card.style.display = matched ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applyFilter);
    }
  }

  function renderSearch() {
    var container = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    if (!container || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }

    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join("");
      return '<article class="movie-card">' +
        '<a class="poster" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">' +
        '</a>' +
        '<div class="movie-info">' +
        '<div class="meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
        '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p>' + escapeHtml(item.oneLine || "") + '</p>' +
        '<div class="card-tags">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function apply() {
      var value = input ? input.value.trim() : query;
      var lower = text(value);
      var list = window.SEARCH_DATA.filter(function (item) {
        var haystack = text([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.oneLine,
          (item.tags || []).join(" ")
        ].join(" "));
        return !lower || haystack.indexOf(lower) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = value ? "搜索结果：" + value : "热门推荐";
      }
      container.innerHTML = list.map(card).join("") || '<p class="empty-result">没有找到匹配内容</p>';
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    apply();
  }

  window.initMoviePlayer = function (src) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var error = document.getElementById("playError");
    if (!video || !src) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function showError() {
      if (error) {
        error.hidden = false;
      }
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else {
        video.src = src;
      }
    }

    function start() {
      load();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("error", showError);

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    bindMenu();
    bindHero();
    bindSearchForms();
    bindPageFilter();
    renderSearch();
  });
})();
