
document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
        var input = form.querySelector("[data-filter-input]");
        var region = form.querySelector("[data-filter-region]");
        var year = form.querySelector("[data-filter-year]");
        var scope = form.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-keywords")
                ].join(" ").toLowerCase();

                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchRegion = !regionValue || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
                var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
                card.hidden = !(matchQuery && matchRegion && matchYear);
            });
        }

        [input, region, year].forEach(function (field) {
            if (field) {
                field.addEventListener("input", applyFilter);
                field.addEventListener("change", applyFilter);
            }
        });

        form.addEventListener("reset", function () {
            window.setTimeout(applyFilter, 0);
        });
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var button = player.querySelector(".play-trigger");
        var configElement = player.querySelector(".media-config");
        var hlsInstance = null;
        var stream = "";

        try {
            stream = JSON.parse(configElement.textContent || "{}").stream || "";
        } catch (error) {
            stream = "";
        }

        function attachStream() {
            if (!video || !stream || video.getAttribute("data-ready") === "true") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute("data-ready", "true");
        }

        function playVideo() {
            attachStream();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
            video.addEventListener("emptied", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
                video.removeAttribute("data-ready");
            });
        }
    });
});
