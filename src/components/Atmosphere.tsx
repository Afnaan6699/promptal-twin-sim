import { useEffect, useRef } from "react";

/**
 * Cinematic ambient background:
 * - moving neural particles
 * - drifting grid
 * - parallax orbs
 * - mouse-follow light
 * Fixed, behind everything.
 */
export function Atmosphere() {
  const lightRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!lightRef.current) return;
      lightRef.current.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 70;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      // links
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const a = 1 - Math.sqrt(d2) / 140;
            ctx.strokeStyle = `rgba(140, 180, 255, ${a * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      // dots
      for (const p of pts) {
        ctx.fillStyle = "rgba(180, 200, 255, 0.55)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* grid */}
      <div className="absolute inset-0 grid-bg animate-grid-drift opacity-60" />
      {/* canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
      {/* floating orbs */}
      <div className="absolute top-[10%] left-[8%] h-72 w-72 rounded-full bg-electric/30 blur-3xl animate-float-orb" />
      <div className="absolute bottom-[12%] right-[6%] h-96 w-96 rounded-full bg-neon/30 blur-3xl animate-float-orb [animation-delay:-3s]" />
      <div className="absolute top-[40%] right-[30%] h-60 w-60 rounded-full bg-cyan-glow/20 blur-3xl animate-float-orb [animation-delay:-6s]" />
      {/* mouse light */}
      <div
        ref={lightRef}
        className="absolute h-[600px] w-[600px] rounded-full opacity-40 transition-transform duration-300 ease-out"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.22 260 / 0.35), transparent 60%)",
        }}
      />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0.08_0.02_270)_100%)]" />
    </div>
  );
}
