(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  /* Fit the big headline words to the screen, whatever font is loaded */
  function fitAll() {
    [[".intro-big", 0.92], [".thanks-h", 0.94]].forEach(function (p) {
      var el = $(p[0]); if (!el) return;
      el.style.fontSize = "";
      var base = parseFloat(getComputedStyle(el).fontSize);
      var w = el.getBoundingClientRect().width, max = window.innerWidth * p[1];
      if (w > max) el.style.fontSize = (base * max / w) + "px";
    });
  }
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener("resize", fitAll);

  /* Theme switch: dark = plain black, light = the background video */
  var themeBtn = $("#themeBtn"), bv = $(".bgvideo video");
  function setTheme(light) {
    root.setAttribute("data-theme", light ? "light" : "dark");
    themeBtn.setAttribute("aria-checked", String(!light));
    themeBtn.setAttribute("aria-label", light ? "Light mode. Switch to dark mode" : "Dark mode. Switch to light mode");
    if (bv) {
      if (light && !calm) { var p = bv.play(); if (p && p.catch) p.catch(function () {}); }
      else bv.pause();
    }
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  setTheme(savedTheme === "light");
  themeBtn.addEventListener("click", function () {
    var light = themeBtn.getAttribute("aria-checked") === "true";
    setTheme(light);
    try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
  });

  /* Mobile menu */
  var menuBtn = $("#menuBtn"), nav = $("#nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* Intro: "This Is My Portfolio", first visit in a session */
  var intro = $("#intro"), introDone = false;
  function endIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add("done");
    root.classList.add("go");
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 900);
  }
  var seen = false;
  try { seen = sessionStorage.getItem("introSeen") === "1"; } catch (e) {}
  if (calm || seen) { intro.parentNode.removeChild(intro); introDone = true; root.classList.add("go"); }
  else { setTimeout(endIntro, 4900); $("#skipIntro").addEventListener("click", endIntro); }

  /* Highlight the nav link of the section in view */
  var map = [["home", "home"], ["about", "about"], ["skills", "skills"], ["projects", "projects"], ["education", "education"], ["certificates", "education"], ["contact", "contact"]];
  var links = {};
  $$("#nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.35, cur = "home";
    map.forEach(function (m) { var el = document.getElementById(m[0]); if (el && el.offsetTop <= y) cur = m[1]; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = "contact";
    Object.keys(links).forEach(function (k) { links[k].classList.toggle("active", k === cur); });
  }
  window.addEventListener("scroll", spy, { passive: true }); window.addEventListener("resize", spy); spy();

  /* Page controls: back to top, next section */
  $("#toTop").addEventListener("click", function () { window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }); });
  $("#toNext").addEventListener("click", function () {
    var screens = $$(".screen"), y = window.scrollY + 20, next = null;
    for (var i = 0; i < screens.length; i++) { if (screens[i].offsetTop > y) { next = screens[i]; break; } }
    if (next) next.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
  });

  /* Rotating words in the hero card */
  var rot = $("#rot"), words = ["networks", "Linux servers", "Python apps", "websites", "BGP routing"];
  if (rot && !calm) {
    var n = 0;
    setInterval(function () {
      rot.classList.add("out");
      setTimeout(function () { n = (n + 1) % words.length; rot.textContent = words[n]; rot.classList.remove("out"); }, 320);
    }, 2400);
  }

  /* Projects: filter and carousel arrows */
  var filters = $$(".filter"), cards = $$(".pcard"), grid = $(".track-p");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.classList.toggle("active", b === btn); });
      cards.forEach(function (c) { c.hidden = !(f === "all" || c.getAttribute("data-cat") === f); });
      grid.scrollTo({ left: 0 });
    });
  });
  function slide(dir) { grid.scrollBy({ left: dir * grid.clientWidth * 0.7, behavior: calm ? "auto" : "smooth" }); }
  $(".car-btn.prev").addEventListener("click", function () { slide(-1); });
  $(".car-btn.next").addEventListener("click", function () { slide(1); });

  /* Certificate viewer */
  var dlg = $("#certDialog"), certImg = $("#certImg");
  $$(".cert-view").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var t = btn.getAttribute("data-title");
      certImg.src = btn.getAttribute("data-img");
      certImg.alt = "Certificate: " + t + ", awarded to Sonam Wangchuk";
      $("#certDlgTitle").textContent = t;
      dlg.showModal();
    });
  });
  $("#certClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  /* Copy email */
  var copyBtn = $("#copyBtn");
  copyBtn.addEventListener("click", function () {
    function done(ok) { copyBtn.textContent = ok ? "Copied" : "Press Ctrl+C"; setTimeout(function () { copyBtn.textContent = "Copy"; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText("05250194.jnec@rub.edu.bt").then(function () { done(true); }, function () { done(false); });
    else done(false);
  });

  /* Fade-up reveal on scroll */
  if (!calm && "IntersectionObserver" in window) {
    var targets = $$(".screen:not(.hero) h2, .about-grid > *, .skill-cols article, .marquee, .filters, .edu-top, .edu-body, .cert-list li, .cert-thumbs, .contact-grid > div, .thanks-h");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el); el.classList.add("in");
        setTimeout(function () { el.classList.remove("reveal", "in"); }, 1100);
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--rd", Math.min(i, 5) * 0.08 + "s");
      el.classList.add("reveal"); io.observe(el);
    });
  }

  /* Background music: plays only after the visitor presses the button (browsers block autoplay with sound) */
  var musicBtn = document.getElementById("musicBtn"), bgm = document.getElementById("bgMusic"), fadeT = null, wasOn = false;
  function fadeTo(v, ms, done) {
    clearInterval(fadeT);
    var step = (v - bgm.volume) / (ms / 40);
    fadeT = setInterval(function () {
      var nv = bgm.volume + step;
      if ((step > 0 && nv >= v) || (step < 0 && nv <= v) || step === 0) { bgm.volume = v; clearInterval(fadeT); if (done) done(); }
      else bgm.volume = Math.max(0, Math.min(1, nv));
    }, 40);
  }
  function setMusic(on) {
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "Pause background music" : "Play background music");
  }
  if (musicBtn && bgm) {
    musicBtn.addEventListener("click", function () {
      if (bgm.paused) {
        bgm.volume = 0;
        var pr = bgm.play();
        (pr && pr.then ? pr : Promise.resolve()).then(function () { setMusic(true); fadeTo(0.55, 900); }).catch(function () { setMusic(false); });
      } else {
        setMusic(false); fadeTo(0, 500, function () { bgm.pause(); });
      }
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { wasOn = !bgm.paused; if (wasOn) bgm.pause(); }
      else if (wasOn) { wasOn = false; bgm.play().catch(function () {}); }
    });
  }

  $("#year").textContent = new Date().getFullYear();
})();
