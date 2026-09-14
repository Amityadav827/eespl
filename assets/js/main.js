(() => {
  "use strict";

  const menuButton = document.querySelector(".eespl-menu-toggle");
  const mobileMenu = document.querySelector("#mobile-navigation");
  const mainHeader = document.querySelector(".eespl-main-header");
  const menuIcon = menuButton?.querySelector("i");
  const pendingSocialLinks = document.querySelectorAll(".eespl-social-link--pending");

  if (!menuButton || !mobileMenu) {
    return;
  }

  const closeMenu = (returnFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuIcon?.classList.replace("fa-xmark", "fa-bars");
    mobileMenu.hidden = true;

    if (returnFocus) {
      menuButton.focus();
    }
  };

  const openMenu = () => {
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation menu");
    menuIcon?.classList.replace("fa-bars", "fa-xmark");
    mobileMenu.hidden = false;
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1150) {
      closeMenu();
    }
  });

  pendingSocialLinks.forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  const updateHeaderState = () => {
    mainHeader?.classList.toggle("is-scrolled", window.scrollY > 4);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
})();

/* Client Testimonials */
(() => {
  "use strict";

  const slider = document.querySelector("[data-testimonial-slider]");
  const slides = Array.from(slider?.querySelectorAll("[data-testimonial-slide]") || []);
  const previousButton = slider?.querySelector(".eespl-testimonial__prev");
  const nextButton = slider?.querySelector(".eespl-testimonial__next");

  if (!slider || slides.length < 2 || !previousButton || !nextButton) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const autoplayInterval = 6000;
  let activeIndex = 0;
  let autoplayTimer;
  let isHovered = false;
  let hasFocus = false;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  };

  const startAutoplay = () => {
    stopAutoplay();

    if (reducedMotion.matches || isHovered || hasFocus || document.hidden) {
      return;
    }

    autoplayTimer = window.setInterval(() => showSlide(activeIndex + 1), autoplayInterval);
  };

  previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => showSlide(activeIndex + 1));

  slider.addEventListener("mouseenter", () => {
    isHovered = true;
    stopAutoplay();
  });

  slider.addEventListener("mouseleave", () => {
    isHovered = false;
    startAutoplay();
  });

  slider.addEventListener("focusin", () => {
    hasFocus = true;
    stopAutoplay();
  });

  slider.addEventListener("focusout", () => {
    window.setTimeout(() => {
      hasFocus = slider.contains(document.activeElement);
      startAutoplay();
    }, 0);
  });

  reducedMotion.addEventListener("change", startAutoplay);
  document.addEventListener("visibilitychange", startAutoplay);

  showSlide(0);
  startAutoplay();
})();

/* About Inline Video */
(() => {
  "use strict";

  const media = document.querySelector(".eespl-about__media");
  const trigger = media?.querySelector("[data-about-video-trigger]");
  const video = media?.querySelector("[data-about-video]");
  const fallback = media?.querySelector(".eespl-about__video-fallback");

  if (!media || !trigger || !video || !fallback) {
    return;
  }

  let sourceLoaded = false;

  const restorePoster = () => {
    media.classList.remove("is-playing");
    video.pause();

    try {
      video.currentTime = 0;
    } catch {}

    window.requestAnimationFrame(() => trigger.focus());
  };

  const showVideoError = () => {
    restorePoster();
    fallback.hidden = false;
  };

  const playInlineVideo = () => {
    fallback.hidden = true;

    if (!sourceLoaded) {
      video.src = video.dataset.src;
      sourceLoaded = true;
      video.load();
    }

    media.classList.add("is-playing");
    window.requestAnimationFrame(() => video.focus());

    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(() => {});
    }
  };

  trigger.addEventListener("click", playInlineVideo);
  video.addEventListener("ended", restorePoster);
  video.addEventListener("loadeddata", () => {
    fallback.hidden = true;
  });
  video.addEventListener("error", showVideoError);
})();

/* Watch Our Story Video Modal */
(() => {
  "use strict";

  const triggers = document.querySelectorAll("[data-video-trigger]");
  const modal = document.querySelector("#eespl-video-modal");
  const closeButton = modal?.querySelector(".eespl-video-modal__close");
  const closeControls = modal?.querySelectorAll("[data-video-close]");
  const video = modal?.querySelector("video");
  const source = video?.querySelector("source[data-src]");
  const fallback = modal?.querySelector(".eespl-video-modal__fallback");

  if (triggers.length === 0 || !modal || !closeButton || !video || !source || !fallback) {
    return;
  }

  let activeTrigger = triggers[0];
  let sourceLoaded = false;
  let closeTimer;
  let previousBodyPadding = "";

  const showVideoError = () => {
    video.classList.add("is-unavailable");
    fallback.hidden = false;
  };

  const clearVideoError = () => {
    video.classList.remove("is-unavailable");
    fallback.hidden = true;
  };

  const loadVideo = () => {
    if (sourceLoaded) {
      return;
    }

    source.src = source.dataset.src;
    sourceLoaded = true;
    video.load();
  };

  const lockPageScroll = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    previousBodyPadding = document.body.style.paddingRight;

    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    document.body.classList.add("eespl-modal-open");
  };

  const unlockPageScroll = () => {
    document.body.classList.remove("eespl-modal-open");
    document.body.style.paddingRight = previousBodyPadding;
  };

  const openModal = (event) => {
    activeTrigger = event.currentTarget;
    window.clearTimeout(closeTimer);
    modal.hidden = false;
    lockPageScroll();

    window.requestAnimationFrame(() => {
      modal.classList.add("is-active");
      closeButton.focus();
    });
    window.setTimeout(() => {
      if (modal.classList.contains("is-active")) {
        closeButton.focus();
      }
    }, 80);
    clearVideoError();
    loadVideo();

    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(() => {});
    }
  };

  const closeModal = () => {
    if (modal.hidden) {
      return;
    }

    modal.classList.remove("is-active");
    video.pause();

    try {
      video.currentTime = 0;
    } catch {}

    unlockPageScroll();
    activeTrigger.focus();

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240;
    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
    }, delay);
  };

  const trapFocus = (event) => {
    if (event.key !== "Tab" || modal.hidden) {
      return;
    }

    const focusable = Array.from(
      modal.querySelectorAll("button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex='-1'])")
    ).filter((element) => !element.hidden);

    if (focusable.length === 0) {
      event.preventDefault();
      closeButton.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!modal.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", openModal));
  closeControls.forEach((control) => control.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    trapFocus(event);
  });

  video.addEventListener("loadeddata", clearVideoError);
  video.addEventListener("canplay", clearVideoError);
  video.addEventListener("error", showVideoError);
  source.addEventListener("error", showVideoError);
})();

/* Proposal Form UI */
(() => {
  "use strict";

  const proposalForm = document.querySelector(".eespl-proposal__form");

  proposalForm?.addEventListener("submit", (event) => {
    event.preventDefault();
  });
})();

/* Back to Top */
(() => {
  "use strict";

  const scrollTopButton = document.querySelector(".eespl-scroll-top");
  const mainContent = document.querySelector("#main-content");

  if (!scrollTopButton) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let updatePending = false;

  const updateVisibility = () => {
    const isVisible = window.scrollY > 400;
    scrollTopButton.classList.toggle("is-visible", isVisible);
    scrollTopButton.setAttribute("aria-hidden", String(!isVisible));
    scrollTopButton.tabIndex = isVisible ? 0 : -1;
    updatePending = false;
  };

  window.addEventListener("scroll", () => {
    if (!updatePending) {
      updatePending = true;
      window.requestAnimationFrame(updateVisibility);
    }
  }, { passive: true });

  scrollTopButton.addEventListener("click", () => {
    mainContent?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  });

  updateVisibility();
})();
