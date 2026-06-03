(function () {
  const root = document.documentElement;
  const selector = [
    ".topbar",
    ".hero-copy",
    ".page-hero",
    ".card",
    ".stat",
    ".toc a",
    ".button",
    ".hero-metrics span",
    ".nav-parent",
    ".nav-menu",
    ".nav-menu a",
    ".figure",
    ".gallery figure",
    ".art-strip img",
    ".media-feature img",
    ".wide",
    ".panel-img",
    ".pending"
  ].join(",");

  const panels = Array.from(document.querySelectorAll(selector));
  panels.forEach((panel) => panel.classList.add("liquid-glass"));

  let pointer = { x: window.innerWidth * 0.68, y: window.innerHeight * 0.24 };
  let scheduled = false;

  function update() {
    scheduled = false;
    root.style.setProperty("--mx", `${pointer.x}px`);
    root.style.setProperty("--my", `${pointer.y}px`);

    for (const panel of panels) {
      const rect = panel.getBoundingClientRect();
      const localX = ((pointer.x - rect.left) / Math.max(rect.width, 1)) * 100;
      const localY = ((pointer.y - rect.top) / Math.max(rect.height, 1)) * 100;
      panel.style.setProperty("--lgx", `${Math.max(-30, Math.min(130, localX)).toFixed(2)}%`);
      panel.style.setProperty("--lgy", `${Math.max(-30, Math.min(130, localY)).toFixed(2)}%`);
      panel.style.setProperty("--lgdx", `${((localX - 50) / 50).toFixed(3)}`);
      panel.style.setProperty("--lgdy", `${((localY - 50) / 50).toFixed(3)}`);
    }
  }

  function schedule(event) {
    pointer = { x: event.clientX, y: event.clientY };
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }

  function nearestGlass(event) {
    return event.target && event.target.closest ? event.target.closest(".liquid-glass") : null;
  }

  window.addEventListener("pointermove", schedule, { passive: true });
  window.addEventListener("pointerdown", (event) => {
    const panel = nearestGlass(event);
    if (panel) panel.classList.add("is-pressing");
  }, { passive: true });
  window.addEventListener("pointerup", () => {
    document.querySelectorAll(".liquid-glass.is-pressing").forEach((panel) => {
      panel.classList.remove("is-pressing");
    });
  }, { passive: true });
  window.addEventListener("pointercancel", () => {
    document.querySelectorAll(".liquid-glass.is-pressing").forEach((panel) => {
      panel.classList.remove("is-pressing");
    });
  }, { passive: true });

  update();
}());
