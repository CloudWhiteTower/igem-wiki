(function () {
  const root = document.documentElement;
  const savedTheme = window.localStorage ? localStorage.getItem("igem-theme") : null;
  const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  root.dataset.theme = initialTheme;

  const topbar = document.querySelector(".topbar");
  if (topbar && !topbar.querySelector(".theme-toggle")) {
    const button = document.createElement("button");
    button.className = "theme-toggle";
    button.type = "button";
    button.setAttribute("aria-label", "Switch color theme");
    button.setAttribute("aria-pressed", String(initialTheme === "dark"));
    button.innerHTML = '<span class="theme-toggle-icon" aria-hidden="true"></span><span class="theme-toggle-text"></span>';
    topbar.appendChild(button);

    function syncThemeButton() {
      const isDark = root.dataset.theme !== "light";
      button.setAttribute("aria-pressed", String(isDark));
      button.querySelector(".theme-toggle-text").textContent = isDark ? "Dark" : "Light";
      button.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    }

    button.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      if (window.localStorage) localStorage.setItem("igem-theme", next);
      syncThemeButton();
    });

    syncThemeButton();
  }

  const selector = [
    ".topbar",
    ".theme-toggle",
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
