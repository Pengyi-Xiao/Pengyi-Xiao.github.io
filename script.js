document.documentElement.classList.add("js");

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

if (window.lucide) {
  window.lucide.createIcons();
}

const sectionLinks = [...document.querySelectorAll(".section-nav a")];
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveLink = (id) => {
  sectionLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) revealObserver.unobserve(entry.target), entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveLink(visible.target.id);
  }, { rootMargin: "-18% 0px -66% 0px", threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => sectionObserver.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

setActiveLink(location.hash ? location.hash.slice(1) : sections[0]?.id);

// Lightweight spatial polish for desktop pointers; touch devices remain still and clean.
const canUsePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
if (canUsePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const glow = document.createElement("div");
  glow.className = "pointer-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.append(glow);
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const interactiveCards = [...document.querySelectorAll("main > section, .publication-card, .experience-item, .project-item, .study-item")];
  const paintPointer = () => {
    pointerFrame = 0;
    glow.style.left = `${pointerX}px`;
    glow.style.top = `${pointerY}px`;
    interactiveCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom) {
        card.style.setProperty("--spot-x", `${pointerX - rect.left}px`);
        card.style.setProperty("--spot-y", `${pointerY - rect.top}px`);
      }
    });
  };
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    document.body.classList.add("has-pointer");
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
  }, { passive: true });
  window.addEventListener("pointerleave", () => document.body.classList.remove("has-pointer"));
}

const updateScrollProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty("--scroll-progress", max > 0 ? `${window.scrollY / max}` : "0");
};
updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });

const qrWrapper = document.querySelector(".social-shortcuts");
const qrPopover = document.getElementById("social-qr-popover");
const qrImage = document.getElementById("social-qr-image");
const qrLink = document.getElementById("social-qr-link");
const qrName = document.getElementById("social-qr-name");
const qrTriggers = [...document.querySelectorAll(".social-trigger[data-qr]")];
const qrInfo = {
  wechat: { label: "WeChat", src: "assets/wechat-qr.jpg", alt: "WeChat QR code" },
  douyin: { label: "Douyin", src: "assets/douyin-qr.jpg", alt: "Douyin QR code" },
  bilibili: { label: "Bilibili", src: "assets/bilibili-qr.png", alt: "Bilibili QR code" },
  xiaohongshu: { label: "Xiaohongshu", src: "assets/xiaohongshu-qr.jpg", alt: "Xiaohongshu QR code" }
};
let qrCloseTimer;
let qrOpenSource = "";
const hoverCapable = window.matchMedia ? window.matchMedia("(hover: hover)").matches : true;

const closeQr = () => {
  if (!qrPopover) return;
  qrOpenSource = "";
  qrPopover.classList.remove("is-visible");
  qrPopover.hidden = true;
  qrPopover.dataset.key = "";
  qrTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
};

const openQr = (trigger, source = "click") => {
  if (!qrPopover || !qrImage || !qrLink || !qrName) return;
  const item = qrInfo[trigger.dataset.qr];
  if (!item) return;
  clearTimeout(qrCloseTimer);
  qrImage.src = item.src;
  qrImage.alt = item.alt;
  qrLink.href = item.src;
  qrName.textContent = item.label;
  qrPopover.dataset.key = trigger.dataset.qr;
  qrOpenSource = source;
  qrPopover.hidden = false;
  qrTriggers.forEach((button) => button.setAttribute("aria-expanded", button === trigger ? "true" : "false"));
  qrPopover.classList.add("is-visible");
};

const scheduleQrClose = () => {
  clearTimeout(qrCloseTimer);
  qrCloseTimer = window.setTimeout(closeQr, 180);
};

qrTriggers.forEach((trigger) => {
  if (hoverCapable) trigger.addEventListener("pointerenter", () => openQr(trigger, "hover"));
  trigger.addEventListener("focus", () => openQr(trigger, "focus"));
  if (hoverCapable) trigger.addEventListener("pointerleave", scheduleQrClose);
  trigger.addEventListener("blur", scheduleQrClose);
  trigger.addEventListener("click", () => {
    if (qrPopover?.classList.contains("is-visible") && qrPopover.dataset.key === trigger.dataset.qr) {
      if (qrOpenSource === "click") closeQr();
      else { qrOpenSource = "click"; clearTimeout(qrCloseTimer); }
    } else openQr(trigger, "click");
  });
});

if (hoverCapable) {
  qrPopover?.addEventListener("pointerenter", () => clearTimeout(qrCloseTimer));
  qrPopover?.addEventListener("pointerleave", scheduleQrClose);
}
document.addEventListener("click", (event) => {
  if (qrWrapper && !qrWrapper.contains(event.target)) closeQr();
});
