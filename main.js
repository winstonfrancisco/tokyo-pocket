/* ============================================================
   TOKYO POCKET — main.js
   Lenis smooth scroll · GSAP ScrollTrigger · data-attr system
   ============================================================ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     TOAST
     ---------------------------------------------------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 1900);
  };

  /* ----------------------------------------------------------
     LENIS SMOOTH SCROLL (synced with ScrollTrigger)
     ---------------------------------------------------------- */
  let lenis = null;
  if (!reduceMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  const scrollTo = (target) => {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.15 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      scrollTo(el);
      closeMenu();
    });
  });

  /* ----------------------------------------------------------
     NAV: progress bar, hide-on-scroll, burger, active link
     ---------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const progressBar = document.getElementById("progressBar");
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("navMenu");
  let lastY = 0;

  const closeMenu = () => {
    if (!menu || !burger) return;
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  };

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  const onScroll = (y) => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    if (nav) {
      if (y > lastY && y > 260) nav.classList.add("is-hidden");
      else nav.classList.remove("is-hidden");
    }
    lastY = y;
  };

  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  onScroll(0);

  /* active section highlighting */
  const navLinks = [...document.querySelectorAll(".nav__link")];
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          navLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ----------------------------------------------------------
     CUSTOM CURSOR
     ---------------------------------------------------------- */
  const cursor = document.querySelector(".cursor");
  if (cursor && canHover && !reduceMotion) {
    const label = cursor.querySelector(".cursor__label");
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;

    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-big");
        if (label) label.textContent = el.dataset.cursor;
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-big");
        if (label) label.textContent = "";
      });
    });
    document.querySelectorAll("a, button").forEach((el) => {
      if (el.hasAttribute("data-cursor")) return;
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ----------------------------------------------------------
     SHOJI DOORS — hover (CSS) / tap / keyboard
     ---------------------------------------------------------- */
  const doors = [...document.querySelectorAll(".door")];

  const setDoor = (door, open) => {
    door.classList.toggle("is-open", open);
    door.setAttribute("aria-expanded", String(open));
  };

  doors.forEach((door, i) => {
    door.addEventListener("click", (e) => {
      const fromKeyboard = e.detail === 0; // keyboard-issued clicks report detail 0
      if (fromKeyboard || !canHover) {
        setDoor(door, !door.classList.contains("is-open"));
      }
    });
    door.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next = doors[(i + (e.key === "ArrowRight" ? 1 : doors.length - 1)) % doors.length];
        next.focus();
      }
    });
    /* focus (keyboard tab) opens via CSS :focus-visible; mirror into aria */
    door.addEventListener("focus", () => {
      if (door.matches(":focus-visible")) door.setAttribute("aria-expanded", "true");
    });
    door.addEventListener("blur", () => {
      if (!door.classList.contains("is-open")) door.setAttribute("aria-expanded", "false");
    });
  });

  /* ----------------------------------------------------------
     SWATCH COPY-TO-CLIPBOARD
     ---------------------------------------------------------- */
  document.querySelectorAll(".swatch").forEach((sw) => {
    sw.addEventListener("click", async () => {
      const hex = sw.dataset.hex || "";
      try {
        await navigator.clipboard.writeText(hex);
        toast(`Copied! ${hex}`);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = hex;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); toast(`Copied! ${hex}`); }
        catch { toast(hex); }
        ta.remove();
      }
    });
  });

  /* ----------------------------------------------------------
     HEART / LIKE
     ---------------------------------------------------------- */
  const heart = document.getElementById("heart");
  const likeCount = document.getElementById("likeCount");
  if (heart && likeCount) {
    heart.addEventListener("click", () => {
      const pressed = heart.getAttribute("aria-pressed") === "true";
      heart.setAttribute("aria-pressed", String(!pressed));
      likeCount.textContent = String(Number(likeCount.textContent) + (pressed ? -1 : 1));
      heart.classList.remove("is-bounce");
      void heart.offsetWidth;
      heart.classList.add("is-bounce");
    });
  }

  /* ----------------------------------------------------------
     LIGHTBOX (poster)
     ---------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const posterFrame = document.getElementById("posterFrame");
  const lightboxClose = document.getElementById("lightboxClose");
  let lastFocused = null;

  const openLightbox = () => {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
    lightboxClose && lightboxClose.focus();
  };
  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    setTimeout(() => { lightbox.hidden = true; }, 320);
    lastFocused && lastFocused.focus();
  };

  posterFrame && posterFrame.addEventListener("click", openLightbox);
  lightboxClose && lightboxClose.addEventListener("click", closeLightbox);
  lightbox &&
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  /* ----------------------------------------------------------
     BRAND POST — mouse tilt
     ---------------------------------------------------------- */
  const phone = document.getElementById("phone");
  const phoneScreen = phone && phone.querySelector(".phone__screen");
  if (phone && phoneScreen && canHover && !reduceMotion && hasGSAP) {
    const rx = gsap.quickTo(phoneScreen, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(phoneScreen, "rotationY", { duration: 0.5, ease: "power3.out" });
    gsap.set(phoneScreen, { transformPerspective: 900 });
    phone.addEventListener("mousemove", (e) => {
      const r = phone.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * 14);
      ry(px * 16);
    });
    phone.addEventListener("mouseleave", () => { rx(0); ry(0); });
  }

  /* ==========================================================
     GSAP ANIMATION SYSTEM
     ========================================================== */
  if (!hasGSAP || reduceMotion) {
    /* reduced motion / no GSAP → show everything, assembled sandwich */
    document.querySelectorAll(".beat").forEach((b, i) => {
      if (i === 3) { b.style.opacity = "1"; b.style.transform = "none"; }
    });
    document.querySelectorAll(".line-typed").forEach((l) => l.classList.add("is-in"));
    document.querySelectorAll(".step").forEach((s) => s.classList.add("is-drawn"));
    return;
  }

  /* ---------- reveal / stagger / parallax / split / count ---------- */
  const reveals = gsap.utils.toArray("[data-reveal]");

  const fromVars = (el) => {
    const d = el.dataset.reveal;
    const v = { opacity: 0 };
    if (d === "up") v.y = 46;
    else if (d === "down") v.y = -46;
    else if (d === "left") v.x = -64;
    else if (d === "right") v.x = 64;
    else if (d === "scale") { v.scale = 0.9; }
    return v;
  };
  const toVars = { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.8, ease: "power3.out", clearProps: "transform" };

  reveals.forEach((el) => gsap.set(el, fromVars(el)));

  ScrollTrigger.batch(reveals, {
    start: "top 85%",
    once: true,
    onEnter: (batch) => {
      batch
        .filter((el) => el.isConnected)
        .forEach((el, i) => {
          gsap.to(el, { ...toVars, delay: i * 0.1, onComplete: () => {
            gsap.set(el, { clearProps: "transform,opacity" });
            el.style.opacity = "";
          }});
        });
    }
  });

  /* data-split — masked line reveal */
  gsap.utils.toArray("[data-split]").forEach((el) => {
    const lines = el.querySelectorAll(".line__in");
    if (!lines.length) return;
    gsap.set(lines, { yPercent: 118 });
    const play = () =>
      gsap.to(lines, {
        yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.12,
        onComplete: () => gsap.set(lines, { clearProps: "transform" })
      });

    if (el.closest(".hero")) {
      gsap.delayedCall(0.15, play);
    } else {
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
    }
  });

  /* data-parallax — scrubbed vertical drift */
  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || 0.2;
    gsap.to(el, {
      yPercent: -amt * 100,
      ease: "none",
      scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* data-parallax-bg — slow background drift */
  gsap.utils.toArray("[data-parallax-bg]").forEach((el) => {
    gsap.fromTo(el, { yPercent: -6 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* data-scrub-scale — reversible scale/rotate with scroll */
  gsap.utils.toArray("[data-scrub-scale]").forEach((el) => {
    gsap.fromTo(el, { scale: 0.9, rotation: -3.5 }, {
      scale: 1, rotation: 0, ease: "none",
      scrollTrigger: { trigger: el, start: "top 92%", end: "top 42%", scrub: true }
    });
  });

  /* data-count — count up when visible */
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target, duration: 1.4, ease: "power2.out",
          onUpdate: () => { el.textContent = String(Math.round(obj.v)); }
        })
    });
  });

  /* ==========================================================
     HERO — mouse + scroll parallax, floating sandwich
     ========================================================== */
  const hero = document.querySelector(".hero");
  if (hero) {
    /* wrap decorative drifters so GSAP transform ≠ CSS animation transform */
    hero.querySelectorAll(".hero__deco [data-depth]").forEach((el) => {
      const w = document.createElement("span");
      w.setAttribute("aria-hidden", "true");
      const cs = getComputedStyle(el);
      w.style.cssText = `position:absolute;left:${cs.left};top:${cs.top};display:block;`;
      el.parentNode.insertBefore(w, el);
      w.appendChild(el);
      el.style.left = "0";
      el.style.top = el.classList.contains("petal") ? "0" : "0";
      w.dataset.depth = el.dataset.depth;
      if (el.classList.contains("petal")) {
        w.style.width = cs.width;
        w.style.height = cs.height;
        el.style.width = "100%";
        el.style.height = "100%";
      }
    });

    if (canHover) {
      const depthEls = [...hero.querySelectorAll("[data-depth]")];
      const movers = depthEls.map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" }),
        d: parseFloat(el.dataset.depth) || 0.2
      }));
      hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        movers.forEach((m) => { m.x(nx * 70 * m.d); m.y(ny * 55 * m.d); });
      }, { passive: true });
    }

    /* floating sandwich — sine loop on the inner svg (outer handles parallax) */
    const sando = hero.querySelector(".hero__sando");
    const sandoSvg = sando && sando.querySelector("svg");
    if (sandoSvg) {
      gsap.to(sandoSvg, { y: -16, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(sandoSvg, { rotation: 3, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 60%" });
      gsap.to(sando, {
        yPercent: -18, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
    }

    /* staggered chip/CTA entrance already handled by data-stagger batch */
  }

  /* ==========================================================
     CONCEPT — words slide together + timeline draws
     ========================================================== */
  const tokyo = document.querySelector('[data-slide="left"]');
  const pocket = document.querySelector('[data-slide="right"]');
  if (tokyo && pocket) {
    gsap.fromTo(tokyo, { xPercent: -62 }, {
      xPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".name-reveal", start: "top 92%", end: "top 40%", scrub: 0.6 }
    });
    gsap.fromTo(pocket, { xPercent: 62 }, {
      xPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".name-reveal", start: "top 92%", end: "top 40%", scrub: 0.6 }
    });
  }

  const tlPath = document.getElementById("timelinePath");
  if (tlPath) {
    const len = tlPath.getTotalLength();
    gsap.set(tlPath, { strokeDasharray: len, strokeDashoffset: len, stroke: "var(--red)", strokeWidth: 4 });
    gsap.to(tlPath, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: "#timeline", start: "top 78%", end: "top 30%", scrub: 0.5 }
    });
  }
  gsap.utils.toArray(".step").forEach((step) => {
    ScrollTrigger.create({
      trigger: step, start: "top 78%", once: true,
      onEnter: () => step.classList.add("is-drawn")
    });
  });

  /* ==========================================================
     OWNERS — entrance stagger + one door peeks open
     ========================================================== */
  if (doors.length) {
    gsap.fromTo(doors, { y: 70, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".doors", start: "top 82%", once: true },
      onComplete: () => gsap.set(doors, { clearProps: "transform,opacity" })
    });

    ScrollTrigger.create({
      trigger: ".doors", start: "top 70%", once: true,
      onEnter: () => {
        if (!canHover) return;
        const first = doors[0];
        setTimeout(() => {
          setDoor(first, true);
          setTimeout(() => setDoor(first, false), 1500);
        }, 1300);
      }
    });
  }

  /* ==========================================================
     SANDWICH — scroll-scrubbed pinned assembly (fully reversible)
     ========================================================== */
  const assembly = document.getElementById("assembly");
  const sandwich = document.querySelector(".sandwich");

  if (assembly && sandwich) {
    const L = {
      bottom: sandwich.querySelector('[data-layer="bottom"]'),
      cream: sandwich.querySelector('[data-layer="cream"]'),
      fruit: sandwich.querySelector('[data-layer="fruit"]'),
      top: sandwich.querySelector('[data-layer="top"]'),
      garnish: sandwich.querySelector('[data-layer="garnish"]')
    };

    /* distance each layer must travel to collapse onto the sandwich centre
       (layers are centred with xPercent/yPercent, so visual centre == offsetTop) */
    const centerDy = (el) => sandwich.offsetHeight / 2 - el.offsetTop;

    /* take centreing off the CSS transform so GSAP owns x/y cleanly */
    const layerEls = Object.values(L).filter(Boolean);
    gsap.set(layerEls, { xPercent: -50, yPercent: -50, x: 0, y: 0, transformOrigin: "50% 50%" });

    const beats = gsap.utils.toArray(".beat");
    const hint = document.querySelector(".assembly__hint");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: assembly,
        start: "top top",
        end: "+=250%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    const layerIn = (el, pos, dur, ease) =>
      tl.fromTo(
        el,
        { y: () => centerDy(el), opacity: 0.12, scaleY: 0.28, transformOrigin: "50% 50%" },
        { y: 0, opacity: 1, scaleY: 1, duration: dur, ease: ease || "power3.out" },
        pos
      );

    /* text beats — the first is already on screen at scroll start */
    beats.forEach((b, i) => {
      if (i === 0) {
        tl.fromTo(b, { opacity: 1, y: 0 }, { opacity: 1, y: 0, duration: 0.01 }, 0);
      } else {
        tl.fromTo(b, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" }, i * 0.2 + 0.01);
      }
      if (i < beats.length - 1) {
        tl.to(b, { opacity: 0, y: -26, duration: 0.07, ease: "power2.in" }, i * 0.2 + 0.15);
      }
    });
    if (hint) tl.to(hint, { opacity: 0, duration: 0.1 }, 0.05);

    /* layers build bottom → cream → fruit → top (with squish) */
    layerIn(L.bottom, 0.02, 0.16);
    layerIn(L.cream, 0.18, 0.15);
    layerIn(L.fruit, 0.34, 0.15);
    layerIn(L.top, 0.5, 0.16, "back.out(1.6)");

    /* squish on the top bread landing */
    tl.to(L.top, { scaleY: 0.9, duration: 0.05, ease: "power2.inOut" }, 0.64)
      .to(L.top, { scaleY: 1, duration: 0.08, ease: "back.out(2)" }, 0.69);

    /* garnish drifts in faster for depth */
    tl.fromTo(
      L.garnish,
      { y: () => centerDy(L.garnish) - 90, opacity: 0, x: -40, rotation: -12 },
      { y: 0, opacity: 1, x: 0, rotation: 0, duration: 0.3, ease: "power2.out" },
      0.58
    );

    /* whole sandwich settles */
    tl.fromTo(
      sandwich,
      { scale: 0.94 },
      { scale: 1, duration: 0.2, ease: "power2.out", transformOrigin: "50% 50%" },
      0.78
    );
  }

  /* product cards + drinks stagger (batch already covers data-reveal) */

  /* ==========================================================
     LOGO — sketch draw + swatch pop
     ========================================================== */
  const sketchStep = document.querySelector(".process__step");
  if (sketchStep) {
    gsap.utils.toArray(".process__step").forEach((step) => {
      ScrollTrigger.create({
        trigger: step, start: "top 80%", once: true,
        onEnter: () => step.classList.add("is-drawn")
      });
    });
  }
  ScrollTrigger.batch(".swatch", {
    start: "top 88%", once: true,
    onEnter: (batch) =>
      gsap.fromTo(batch, { scale: 0.7, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.7)",
        stagger: 0.08, clearProps: "transform,opacity"
      })
  });

  /* ==========================================================
     BRAND POST — caption types in, mockup tilts with scroll
     ========================================================== */
  const captionLines = gsap.utils.toArray(".line-typed");
  if (captionLines.length) {
    ScrollTrigger.create({
      trigger: "#caption",
      start: "top 85%",
      once: true,
      onEnter: () =>
        captionLines.forEach((l, i) => setTimeout(() => l.classList.add("is-in"), i * 420))
    });
  }
  if (phone && !reduceMotion) {
    gsap.fromTo(phone, { rotation: -4, y: 40 }, {
      rotation: 0, y: 0, ease: "none",
      scrollTrigger: { trigger: phone, start: "top 92%", end: "top 45%", scrub: true }
    });
  }

  /* ==========================================================
     FOOTER — THANK YOU rises from behind
     ========================================================== */
  const thanks = document.querySelector(".footer__thanks");
  if (thanks) {
    gsap.fromTo(thanks, { yPercent: 55, opacity: 0.25 }, {
      yPercent: 0, opacity: 1, ease: "none",
      scrollTrigger: { trigger: ".footer", start: "top 95%", end: "top 45%", scrub: 0.6 }
    });
  }

  /* ==========================================================
     REFRESH after fonts + images
     ========================================================== */
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", refresh, { once: true });
  });
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(refresh, 180);
  });
})();
