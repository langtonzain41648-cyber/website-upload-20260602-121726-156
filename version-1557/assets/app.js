(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function cardTemplate(item) {
        var tags = [item.category, item.region, item.year].filter(Boolean).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + item.url + "\">" +
            "<span class=\"poster-wrap\">" +
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-gradient\"></span>" +
            "<span class=\"rating-pill\">★ " + escapeHtml(item.rating) + "</span>" +
            "<span class=\"duration-pill\">" + escapeHtml(item.duration) + "</span>" +
            "</span>" +
            "<span class=\"card-body\">" +
            "<span class=\"card-category\">" + escapeHtml(item.category) + "</span>" +
            "<h3>" + escapeHtml(item.title) + "</h3>" +
            "<span class=\"card-desc\">" + escapeHtml(item.oneLine) + "</span>" +
            "<span class=\"tag-strip\">" + tags + "</span>" +
            "</span>" +
            "</a>";
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            start();
        });

        document.querySelectorAll("[data-scroll-dir]").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = document.querySelector("[data-scroll-row='" + button.getAttribute("data-scroll-target") + "']");
                if (!target) {
                    return;
                }
                var dir = button.getAttribute("data-scroll-dir") === "left" ? -1 : 1;
                target.scrollBy({ left: dir * 420, behavior: "smooth" });
            });
        });

        document.querySelectorAll("[data-page-filter]").forEach(function (input) {
            var area = input.closest("section").querySelector("[data-filter-area]");
            if (!area) {
                return;
            }
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
            input.addEventListener("input", function () {
                var term = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
                    card.style.display = !term || haystack.indexOf(term) !== -1 ? "" : "none";
                });
            });
        });

        document.querySelectorAll("[data-player]").forEach(function (frame) {
            var video = frame.querySelector("video");
            var button = frame.querySelector(".play-layer");
            var stream = frame.getAttribute("data-stream");
            var hlsInstance = null;
            var initialized = false;

            function begin() {
                if (!video || !stream) {
                    return;
                }
                frame.classList.add("is-playing");
                if (initialized) {
                    video.play().catch(function () {});
                    return;
                }
                initialized = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", function () {
                        video.play().catch(function () {});
                    }, { once: true });
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    video.play().catch(function () {});
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", begin);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!initialized || video.paused) {
                        begin();
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });

        var searchPage = document.querySelector("[data-search-page]");
        if (searchPage && Array.isArray(window.SEARCH_INDEX)) {
            var params = new URLSearchParams(window.location.search);
            var input = searchPage.querySelector("[data-search-input]");
            var regionSelect = searchPage.querySelector("[data-search-region]");
            var yearSelect = searchPage.querySelector("[data-search-year]");
            var typeSelect = searchPage.querySelector("[data-search-type]");
            var results = searchPage.querySelector("[data-search-results]");

            function fillSelect(select, values) {
                values.forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            }

            fillSelect(regionSelect, Array.from(new Set(window.SEARCH_INDEX.map(function (item) { return item.region; }).filter(Boolean))).sort());
            fillSelect(yearSelect, Array.from(new Set(window.SEARCH_INDEX.map(function (item) { return item.year; }).filter(Boolean))).sort().reverse());
            fillSelect(typeSelect, Array.from(new Set(window.SEARCH_INDEX.map(function (item) { return item.type; }).filter(Boolean))).sort());

            input.value = params.get("q") || "";

            function render() {
                var keyword = normalize(input.value);
                var region = regionSelect.value;
                var year = yearSelect.value;
                var type = typeSelect.value;
                var list = window.SEARCH_INDEX.filter(function (item) {
                    var haystack = normalize([item.title, item.category, item.region, item.year, item.type, item.genre, (item.tags || []).join(" "), item.oneLine].join(" "));
                    return (!keyword || haystack.indexOf(keyword) !== -1) &&
                        (!region || item.region === region) &&
                        (!year || item.year === year) &&
                        (!type || item.type === type);
                }).slice(0, 96);

                if (!list.length) {
                    results.innerHTML = "<div class=\"empty-state\">没有找到匹配影片，可以尝试更换关键词或进入分类总览浏览。</div>";
                    return;
                }
                results.innerHTML = list.map(cardTemplate).join("");
            }

            [input, regionSelect, yearSelect, typeSelect].forEach(function (el) {
                el.addEventListener("input", render);
                el.addEventListener("change", render);
            });
            render();
        }
    });
})();
