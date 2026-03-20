document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".hero-image-wrapper");
  const img = document.querySelector("#heroImage");
  const heroSection = document.querySelector(".hero");
  const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

  if (!wrapper || !img) return;

  // ─── Shared state ────────────────────────────────────────────────────────
  let currentX = 0, currentY = 0;     // lerped parallax tilt (-1..1)
  let targetX = 0, targetY = 0;
  let dragX = 0, dragY = 0;           // current drag offset (px)
  let dragTargetX = 0, dragTargetY = 0;
  let isDragging = false;
  let pointerStartX = 0, pointerStartY = 0;
  let dragOriginX = 0, dragOriginY = 0;
  let rafId = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  // ─── Core animation loop ─────────────────────────────────────────────────
  const tick = () => {
    currentX = lerp(currentX, targetX, 0.07);
    currentY = lerp(currentY, targetY, 0.07);
    dragX = lerp(dragX, dragTargetX, isDragging ? 0.85 : 0.08); // fast on drag, springy on release
    dragY = lerp(dragY, dragTargetY, isDragging ? 0.85 : 0.08);

    // 3D tilt + drag offset combined
    wrapper.style.transform = `
      perspective(1000px)
      rotateY(${-5 + currentX * 8}deg)
      rotateX(${2 + currentY * -5}deg)
      translate(${dragX + currentX * 22}px, ${dragY + currentY * 14}px)
    `;

    // Brightness — center = brightest
    const dist = Math.min(1, Math.sqrt(currentX * currentX + currentY * currentY));
    const brightness = 0.88 + (1 - dist) * 0.18;
    img.style.filter = `brightness(${brightness}) contrast(1.07)`;

    // Directional glow chasing the pointer
    const angle = Math.atan2(currentY, currentX);
    const glowX = Math.cos(angle) * 40 * dist;
    const glowY = Math.sin(angle) * 40 * dist;
    const borderAlpha = 0.15 + dist * 0.85;
    const glowAlpha = dist * 0.75;
    const glowSpread = 20 + dist * 40;

    wrapper.style.boxShadow = `
      0 20px 50px rgba(0,0,0,0.5),
      0 0 0 1px rgba(99, 102, 241, ${borderAlpha}),
      ${glowX}px ${glowY}px ${glowSpread}px rgba(99, 102, 241, ${glowAlpha}),
      0 0 ${dist * 70}px rgba(139, 92, 246, ${dist * 0.3})
    `;

    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => { if (!rafId) tick(); };

  // ─── Pointer helpers (shared mouse + touch logic) ─────────────────────────
  const getHeroBounds = () => heroSection ? heroSection.getBoundingClientRect() : null;

  const constrainDrag = (x, y) => {
    // Allow free movement inside the hero section with some padding
    const heroRect = getHeroBounds();
    if (!heroRect) return { x, y };
    const wRect = wrapper.getBoundingClientRect();
    const pad = 40;
    const minX = heroRect.left - wRect.left + pad;
    const maxX = heroRect.right - wRect.right - pad;
    const minY = heroRect.top - wRect.top + pad;
    const maxY = heroRect.bottom - wRect.bottom - pad;
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  const onDragStart = (clientX, clientY) => {
    isDragging = true;
    pointerStartX = clientX;
    pointerStartY = clientY;
    dragOriginX = dragX;
    dragOriginY = dragY;
    wrapper.style.cursor = "grabbing";
    wrapper.style.zIndex = "10";
    startLoop();
  };

  const onDragMove = (clientX, clientY, pointerRelX, pointerRelY) => {
    if (isDragging) {
      const raw = {
        x: dragOriginX + (clientX - pointerStartX),
        y: dragOriginY + (clientY - pointerStartY),
      };
      const constrained = constrainDrag(raw.x, raw.y);
      dragTargetX = constrained.x;
      dragTargetY = constrained.y;
    }
    // Always update tilt from pointer position relative to wrapper
    const rect = wrapper.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, (pointerRelX - rect.left - rect.width / 2) / (rect.width / 2)));
    targetY = Math.max(-1, Math.min(1, (pointerRelY - rect.top - rect.height / 2) / (rect.height / 2)));
  };

  const onDragEnd = () => {
    isDragging = false;
    dragTargetX = 0;
    dragTargetY = 0;
    targetX = 0;
    targetY = 0;
    wrapper.style.cursor = "grab";
    wrapper.style.zIndex = "";
  };

  // ─── Mouse events ─────────────────────────────────────────────────────────
  wrapper.style.cursor = "grab";

  wrapper.addEventListener("mousedown", (e) => {
    if (isMobile()) return;
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  });

  document.addEventListener("mousemove", (e) => {
    if (isMobile()) return;
    onDragMove(e.clientX, e.clientY, e.clientX, e.clientY);
    if (!isDragging) startLoop(); // keep tilt going even without drag
  });

  document.addEventListener("mouseup", () => {
    if (isMobile() || !isDragging) return;
    onDragEnd();
  });

  document.addEventListener("mouseleave", () => {
    if (!isMobile() && isDragging) onDragEnd();
    targetX = 0; targetY = 0;
  });

  // ─── Touch events (mobile) ────────────────────────────────────────────────
  wrapper.addEventListener("touchstart", (e) => {
    if (!isMobile()) return;
    const t = e.touches[0];
    onDragStart(t.clientX, t.clientY);
    startLoop();
  }, { passive: true });

  wrapper.addEventListener("touchmove", (e) => {
    if (!isMobile()) return;
    const t = e.touches[0];
    onDragMove(t.clientX, t.clientY, t.clientX, t.clientY);
  }, { passive: true });

  wrapper.addEventListener("touchend", () => {
    if (!isMobile()) return;
    onDragEnd();
  });
});
