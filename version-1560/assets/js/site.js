(function () {
    "use strict";

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function toggleMobileMenu() {
        var button = $("[data-menu-toggle]");
        var nav = $("[data-main-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var sliders = $all("[data-hero-slider]");

        sliders.forEach(function (slider) {
            var slides = $all(".hero-slide", slider);
            var dots = $all(".hero-dot", slider);
            var index = 0;

            if (slides.length <= 1) {
                return;
            }

            function setActive(nextIndex) {
                index = nextIndex % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    setActive(dotIndex);
                });
            });

            setInterval(function () {
                setActive(index + 1);
            }, 5200);
        });
    }

    function initLocalFilter() {
        var inputs = $all("[data-local-filter]");

        inputs.forEach(function (input) {
            var targetSelector = input.getAttribute("data-local-filter");
            var counterSelector = input.getAttribute("data-filter-counter");
            var cards = $all(targetSelector);
            var counter = counterSelector ? $(counterSelector) : null;

            function update() {
                var query = input.value.trim().toLowerCase();
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-category") || ""
                    ].join(" ").toLowerCase();

                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";

                    if (matched) {
                        shown += 1;
                    }
                });

                if (counter) {
                    counter.textContent = String(shown);
                }
            }

            input.addEventListener("input", update);
            update();
        });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector("script[src='" + src + "']");

            if (existing) {
                existing.addEventListener("load", resolve);
                existing.addEventListener("error", reject);
                if (window.Hls) {
                    resolve();
                }
                return;
            }

            var script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function initPlayers() {
        var panels = $all("[data-player-panel]");
        var hlsLoader = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";

        panels.forEach(function (panel) {
            var button = $(".play-button", panel);
            var video = $("video", panel);
            var hlsSource = panel.getAttribute("data-hls-src");
            var mp4Source = panel.getAttribute("data-mp4-src");

            if (!button || !video) {
                return;
            }

            function playMp4() {
                video.src = mp4Source;
                panel.classList.add("is-playing");
                video.controls = true;
                video.play().catch(function () {});
            }

            function playHls() {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = hlsSource;
                    panel.classList.add("is-playing");
                    video.controls = true;
                    video.play().catch(playMp4);
                    return;
                }

                loadScript(hlsLoader).then(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true
                        });

                        hls.loadSource(hlsSource);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            panel.classList.add("is-playing");
                            video.controls = true;
                            video.play().catch(playMp4);
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                hls.destroy();
                                playMp4();
                            }
                        });
                    } else {
                        playMp4();
                    }
                }).catch(playMp4);
            }

            button.addEventListener("click", playHls);
        });
    }

    function initSearchPage() {
        var input = $("[data-search-input]");
        var results = $("[data-search-results]");

        if (!input || !results || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        function render(items) {
            if (!items.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配影片，请换一个关键词。</div>';
                return;
            }

            results.innerHTML = items.slice(0, 80).map(function (item) {
                return [
                    '<a class="search-result" href="' + item.url + '">',
                    '    <strong>' + item.title + '</strong>',
                    '    <span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span>',
                    '    <em>进入详情</em>',
                    '</a>'
                ].join("");
            }).join("");
        }

        function update() {
            var query = input.value.trim().toLowerCase();

            if (!query) {
                render(window.MOVIE_SEARCH_DATA.slice(0, 30));
                return;
            }

            var found = window.MOVIE_SEARCH_DATA.filter(function (item) {
                return [
                    item.title,
                    item.year,
                    item.region,
                    item.genre,
                    item.type,
                    item.category,
                    item.tags
                ].join(" ").toLowerCase().indexOf(query) !== -1;
            });

            render(found);
        }

        input.addEventListener("input", update);
        update();
    }

    function initHeroSearch() {
        var forms = $all("[data-hero-search]");

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = $("input", form);
                var query = input ? input.value.trim() : "";
                var prefix = form.getAttribute("data-search-prefix") || "";
                var target = prefix + "search.html";

                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }

                window.location.href = target;
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        var searchInput = $("[data-search-input]");

        if (q && searchInput) {
            searchInput.value = q;
            searchInput.dispatchEvent(new Event("input"));
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        toggleMobileMenu();
        initHeroSlider();
        initLocalFilter();
        initPlayers();
        initSearchPage();
        initHeroSearch();
    });
})();
