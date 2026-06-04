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
    ".pending",
    ".story-dashboard"
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

  function setupScrollStory() {
    const story = document.querySelector(".scroll-story");
    if (!story) return;

    const steps = Array.from(story.querySelectorAll(".story-step"));
    const layers = Array.from(story.querySelectorAll(".story-layer"));
    const molecule = setupMoleculeViewer(story);
    const title = story.querySelector(".story-copy h2");
    const liveText = story.querySelector(".story-live");
    let storyScheduled = false;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function setActiveStep(index) {
      steps.forEach((step, stepIndex) => {
        step.classList.toggle("is-active", stepIndex === index);
      });

      const activeStep = steps[index];
      if (!activeStep) return;
      if (title && activeStep.dataset.storyTitle) title.textContent = activeStep.dataset.storyTitle;
      if (liveText && activeStep.dataset.storyText) liveText.textContent = activeStep.dataset.storyText;
    }

    function updateStory() {
      storyScheduled = false;
      const rect = story.getBoundingClientRect();
      const scrollRange = Math.max(story.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / scrollRange, 0, 1);
      const centeredProgress = progress - 0.5;
      const activeIndex = steps.length > 1
        ? clamp(Math.round(progress * (steps.length - 1)), 0, steps.length - 1)
        : 0;

      story.style.setProperty("--story-progress", progress.toFixed(4));
      story.style.setProperty("--story-bloom-opacity", clamp(0.9 - progress * 0.22, 0, 1).toFixed(4));
      story.style.setProperty("--story-molecule-opacity", clamp(0.25 + progress * 0.85, 0, 1).toFixed(4));
      story.style.setProperty("--story-signal-opacity", clamp((progress - 0.24) * 2.4, 0, 1).toFixed(4));
      story.style.setProperty("--story-cloud-opacity", clamp((progress - 0.42) * 2.2, 0, 1).toFixed(4));
      story.style.setProperty("--story-dashboard-opacity", clamp((progress - 0.52) * 2.3, 0, 1).toFixed(4));
      story.style.setProperty("--story-alert-opacity", clamp((progress - 0.72) * 3, 0, 1).toFixed(4));
      story.style.setProperty("--story-scale", (1 + progress * 0.035).toFixed(4));
      const moleculeEnter = smoothstep(0, 0.24, progress);
      const moleculeExit = smoothstep(0.78, 1, progress);
      const moleculeSlide = 38 * (1 - moleculeEnter) - 48 * moleculeExit;
      story.style.setProperty("--molecule-reveal", "1");
      story.style.setProperty("--molecule-scene-opacity", (1 - moleculeExit * 0.12).toFixed(4));
      story.style.setProperty("--molecule-slide-y", `${moleculeSlide.toFixed(3)}vh`);
      story.style.setProperty("--molecule-turn", smoothstep(0.18, 0.74, progress).toFixed(4));
      story.style.setProperty("--molecule-depth", moleculeEnter.toFixed(4));

      layers.forEach((layer) => {
        const depth = Number(getComputedStyle(layer).getPropertyValue("--depth")) || 1;
        layer.style.setProperty("--story-drift-x", `${(centeredProgress * depth * -5).toFixed(3)}vw`);
        layer.style.setProperty("--story-drift-y", `${(centeredProgress * depth * 5).toFixed(3)}vh`);
      });

      if (molecule) molecule.render(progress);
      setActiveStep(activeIndex);
    }

    function scheduleStoryUpdate() {
      if (!storyScheduled) {
        storyScheduled = true;
        requestAnimationFrame(updateStory);
      }
    }

    window.addEventListener("scroll", scheduleStoryUpdate, { passive: true });
    window.addEventListener("resize", scheduleStoryUpdate, { passive: true });
    updateStory();
  }

  function smoothstep(edge0, edge1, value) {
    const x = Math.max(0, Math.min(1, (value - edge0) / Math.max(edge1 - edge0, 0.0001)));
    return x * x * (3 - 2 * x);
  }

  function setupMoleculeViewer(scope) {
    const canvas = scope.querySelector(".molecule-canvas");
    if (!canvas) return null;

    const context = canvas.getContext("2d");
    if (!context) return null;

    const atomColors = {
      C: "#79e7df",
      H: "#f4f7fb",
      N: "#8fb7ff",
      O: "#ff8aa4",
      S: "#f7d875",
      P: "#d8a0ff"
    };
    const atomRadii = { H: 2.2, C: 3.8, N: 4.2, O: 4.2, S: 5, P: 5 };
    const covalent = { H: 0.31, C: 0.76, N: 0.71, O: 0.66, S: 1.05, P: 1.07 };
    const state = {
      atoms: [],
      bonds: [],
      loaded: false,
      progress: 0,
      dpr: 1,
      width: 0,
      height: 0
    };
    let dragging = false;
    let lastDrag = { x: 0, y: 0 };
    let userRotation = { yaw: 0, pitch: 0 };

    function parseElement(line) {
      const explicit = line.slice(76, 78).trim();
      if (explicit) return explicit.charAt(0).toUpperCase() + explicit.slice(1).toLowerCase();
      const inferred = line.slice(12, 16).trim().replace(/^[0-9]+/, "");
      return inferred.charAt(0).toUpperCase() || "C";
    }

    function parsePdb(text) {
      const atoms = [];
      const serialToIndex = new Map();
      const conect = new Set();

      text.split(/\r?\n/).forEach((line) => {
        const record = line.slice(0, 6).trim();
        if (record === "ATOM" || record === "HETATM") {
          const serial = Number(line.slice(6, 11));
          const atom = {
            serial,
            name: line.slice(12, 16).trim(),
            element: parseElement(line),
            x: Number(line.slice(30, 38)),
            y: Number(line.slice(38, 46)),
            z: Number(line.slice(46, 54))
          };
          if (Number.isFinite(atom.x) && Number.isFinite(atom.y) && Number.isFinite(atom.z)) {
            serialToIndex.set(serial, atoms.length);
            atoms.push(atom);
          }
        } else if (record === "CONECT") {
          const source = Number(line.slice(6, 11));
          for (let index = 11; index < line.length; index += 5) {
            const target = Number(line.slice(index, index + 5));
            if (Number.isFinite(source) && Number.isFinite(target) && source !== target) {
              const a = Math.min(source, target);
              const b = Math.max(source, target);
              conect.add(`${a}:${b}`);
            }
          }
        }
      });

      const center = atoms.reduce((sum, atom) => {
        sum.x += atom.x;
        sum.y += atom.y;
        sum.z += atom.z;
        return sum;
      }, { x: 0, y: 0, z: 0 });
      if (atoms.length) {
        center.x /= atoms.length;
        center.y /= atoms.length;
        center.z /= atoms.length;
      }
      atoms.forEach((atom) => {
        atom.x -= center.x;
        atom.y -= center.y;
        atom.z -= center.z;
      });

      const bonds = Array.from(conect).map((key) => {
        const [a, b] = key.split(":").map(Number);
        return [serialToIndex.get(a), serialToIndex.get(b)];
      }).filter(([a, b]) => Number.isInteger(a) && Number.isInteger(b));

      if (!bonds.length) {
        for (let a = 0; a < atoms.length; a += 1) {
          for (let b = a + 1; b < atoms.length; b += 1) {
            const atomA = atoms[a];
            const atomB = atoms[b];
            const dx = atomA.x - atomB.x;
            const dy = atomA.y - atomB.y;
            const dz = atomA.z - atomB.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const limit = (covalent[atomA.element] || 0.76) + (covalent[atomB.element] || 0.76) + 0.45;
            if (distance > 0.35 && distance < limit) bonds.push([a, b]);
          }
        }
      }

      return { atoms, bonds };
    }

    function fitCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      state.dpr = dpr;
      state.width = width;
      state.height = height;
    }

    function project(atom, turn, reveal) {
      const spin = turn * Math.PI * 2 + 0.35 + userRotation.yaw;
      const tilt = -0.62 + reveal * 0.42 + userRotation.pitch;
      const cosY = Math.cos(spin);
      const sinY = Math.sin(spin);
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);
      const x1 = atom.x * cosY - atom.z * sinY;
      const z1 = atom.x * sinY + atom.z * cosY;
      const y1 = atom.y * cosX - z1 * sinX;
      const z2 = atom.y * sinX + z1 * cosX;
      const scale = Math.min(state.width, state.height) / 18.5;
      const perspective = 1 / (1 + (z2 + 12) / 72);

      return {
        x: state.width / 2 + x1 * scale * perspective,
        y: state.height / 2 + y1 * scale * perspective,
        z: z2,
        size: perspective
      };
    }

    function render(progress) {
      state.progress = progress;
      fitCanvas();
      const reveal = 1;
      const turn = smoothstep(0.16, 0.72, progress);
      const ctx = context;
      ctx.clearRect(0, 0, state.width, state.height);

      if (!state.loaded || !state.atoms.length) {
        ctx.fillStyle = "rgba(103,232,216,.55)";
        ctx.font = `${14 * state.dpr}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("Loading PDB structure", state.width / 2, state.height / 2);
        return;
      }

      const projected = state.atoms.map((atom) => project(atom, turn, reveal));
      ctx.save();
      ctx.globalAlpha = Math.max(0.08, reveal);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      state.bonds
        .map(([a, b]) => ({ a, b, z: (projected[a].z + projected[b].z) / 2 }))
        .sort((bondA, bondB) => bondA.z - bondB.z)
        .forEach(({ a, b, z }) => {
          const start = projected[a];
          const end = projected[b];
          const alpha = Math.max(0.16, Math.min(0.72, 0.36 + (z + 8) / 32));
          ctx.strokeStyle = `rgba(215,252,255,${alpha})`;
          ctx.lineWidth = Math.max(1.2, 2.2 * state.dpr * ((start.size + end.size) / 2));
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        });

      state.atoms
        .map((atom, index) => ({ atom, point: projected[index] }))
        .sort((a, b) => a.point.z - b.point.z)
        .forEach(({ atom, point }) => {
          const color = atomColors[atom.element] || atomColors.C;
          const radius = (atomRadii[atom.element] || 3.8) * state.dpr * point.size;
          const glow = ctx.createRadialGradient(point.x - radius * 0.34, point.y - radius * 0.38, radius * 0.2, point.x, point.y, radius * 1.35);
          glow.addColorStop(0, "rgba(255,255,255,.96)");
          glow.addColorStop(0.22, color);
          glow.addColorStop(1, "rgba(3,20,28,.28)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      ctx.restore();
    }

    fetch(canvas.dataset.pdbSrc)
      .then((response) => response.ok ? response.text() : Promise.reject(new Error(response.statusText)))
      .then((text) => {
        const parsed = parsePdb(text);
        state.atoms = parsed.atoms;
        state.bonds = parsed.bonds;
        state.loaded = true;
        render(state.progress);
      })
      .catch(() => {
        state.loaded = true;
        render(state.progress);
      });

    window.addEventListener("resize", () => render(state.progress), { passive: true });
    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      lastDrag = { x: event.clientX, y: event.clientY };
      canvas.classList.add("is-dragging");
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dx = event.clientX - lastDrag.x;
      const dy = event.clientY - lastDrag.y;
      userRotation.yaw += dx * 0.008;
      userRotation.pitch = Math.max(-0.9, Math.min(0.9, userRotation.pitch + dy * 0.006));
      lastDrag = { x: event.clientX, y: event.clientY };
      render(state.progress);
    });
    canvas.addEventListener("pointerup", (event) => {
      dragging = false;
      canvas.classList.remove("is-dragging");
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointercancel", () => {
      dragging = false;
      canvas.classList.remove("is-dragging");
    });
    return { render };
  }

  setupScrollStory();
  update();
}());
