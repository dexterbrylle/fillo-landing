/* Fillo landing — progressive enhancement only.
   Every feature on the site works with JavaScript disabled and with
   prefers-reduced-motion enabled. This file only adds:
   1. Nav solid background after scrolling
   2. Accessible mobile menu (Escape, outside click, focus return)
   3. Gentle hero parallax layers (skipped for reduced motion)
   4. Reveal-on-scroll (content is visible by default; JS opts it in)
   5. Cost Ahead bar animation + passport road progress (skipped for reduced motion)
   6. Interactive demo tabs (roving tabindex, arrow keys)
   7. Mobile CTA appears after the hero scrolls away
*/
(function () {
  "use strict";

  var doc = document;
  doc.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Nav background after scrolling ------------------------------------ */
  var nav = doc.querySelector(".site-nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* 2. Mobile menu -------------------------------------------------------- */
  var toggle = doc.querySelector(".nav-toggle");
  if (toggle && nav) {
    var menu = doc.getElementById(toggle.getAttribute("aria-controls"));
    var closeMenu = function (returnFocus) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) closeMenu(true);
    });
    doc.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target)) closeMenu(false);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu(false);
    });
  }

  /* Shared scroll listener for parallax + road progress -------------------- */
  var parallaxItems = [];
  if (!reduceMotion) {
    parallaxItems = Array.prototype.map.call(
      doc.querySelectorAll("[data-parallax]"),
      function (el) {
        return { el: el, speed: parseFloat(el.getAttribute("data-parallax")) || 0.1 };
      }
    );
  }

  var road = doc.querySelector(".passport-road");
  var passport = doc.querySelector(".passport");

  var ticking = false;
  var update = function () {
    ticking = false;
    var y = window.scrollY;
    for (var i = 0; i < parallaxItems.length; i++) {
      var item = parallaxItems[i];
      item.el.style.transform = "translate3d(0," + (y * item.speed * -1).toFixed(1) + "px,0)";
    }
    if (road && passport) {
      var rect = passport.getBoundingClientRect();
      var vh = window.innerHeight || doc.documentElement.clientHeight;
      // 0 when the section enters, 1 when its middle passes the viewport middle.
      var progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height * 0.5)));
      var length = road.offsetHeight;
      road.style.backgroundPosition = "0 " + (length - length * progress) + "px";
      road.style.opacity = progress > 0.02 ? 0.28 : 0.1;
    }
  };
  var requestTick = function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  if (parallaxItems.length || road) {
    window.addEventListener("scroll", requestTick, { passive: true });
    update();
  }

  /* 4. Reveal on scroll (opt-in, skipped for reduced motion) --------------- */
  var revealables = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));
  if (revealables.length && "IntersectionObserver" in window && !reduceMotion) {
    revealables.forEach(function (el) { el.classList.add("reveal-pre"); });
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* 5. Cost Ahead accumulation bars ---------------------------------------- */
  var accumulation = doc.querySelector(".accumulation");
  if (accumulation && "IntersectionObserver" in window && !reduceMotion) {
    var fills = accumulation.querySelectorAll(".accum-fill");
    fills.forEach(function (f) { f.style.width = "0"; });
    var barObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fills.forEach(function (f, i) {
              setTimeout(function () {
                f.style.transition = "width 0.7s ease";
                f.style.width = f.style.getPropertyValue("--w") || "100%";
              }, i * 160);
            });
            barObserver.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    barObserver.observe(accumulation);
  }

  /* 6. Demo tabs ------------------------------------------------------------ */
  var tablist = doc.querySelector(".demo-tabs");
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll(".demo-tab"));
    var panels = tabs.map(function (t) {
      return doc.getElementById(t.getAttribute("aria-controls"));
    });

    var select = function (index, focus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next !== null) {
          e.preventDefault();
          select(next, true);
        }
      });
    });

    var initial = tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
    select(initial === -1 ? 0 : initial, false);
  }

  /* 7. Mobile CTA ---------------------------------------------------------- */
  var mobileCta = doc.querySelector(".mobile-cta");
  var hero = doc.querySelector(".hero");
  if (mobileCta && hero) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        // Show only once the hero is fully above the viewport, not merely off-screen below.
        mobileCta.classList.toggle("is-visible", entries[0].boundingClientRect.bottom < 0);
      }, { threshold: 0 }).observe(hero);
    } else {
      mobileCta.classList.add("is-visible");
    }
  }
})();
