import { useMemo, useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import data from "../data/snapshots.json";

// React reference implementation of the motion language in CLAUDE.md,
// consuming the same states/items schema as template.html and the
// daily pipeline. Only movers move: framer-motion's `layout` prop
// does correct FLIP automatically — unchanged rows hold still.

const springRow = { type: "spring", stiffness: 130, damping: 22 };

function CountUp({ value, duration = 650 }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const reduced = useReducedMotion();
  const [dir, setDir] = useState(null);

  useEffect(() => {
    if (reduced || prev.current === value) {
      setDisplay(value); prev.current = value; return;
    }
    const from = prev.current;
    setDir(value > from ? "up" : "down");
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else { prev.current = value; setTimeout(() => setDir(null), 900); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <span className={`num ${dir || ""}`}>{display.toFixed(1)}%</span>;
}

export default function MarketBoard() {
  const [idx, setIdx] = useState(data.states.length - 1);
  const snap = data.states[idx];
  const base = data.states[0];

  const rows = useMemo(() => {
    const sorted = [...snap.items].sort((a, b) => b.value - a.value);
    const max = Math.max(sorted[0].value, 0.001);
    return sorted.map((t, i) => {
      const opener = base.items.find((b) => b.name === t.name);
      return {
        ...t,
        lead: i === 0,
        width: (t.value / max) * 100,
        delta: opener ? t.value - opener.value : 0,
      };
    });
  }, [snap, base]);

  const dense = data.states.some((s) => s.items.length >= 8);

  return (
    <section className={`board ${dense ? "dense" : ""}`}>
      <header>
        <p className="eyebrow">{data.eyebrow}</p>
        <h1>{data.headline}</h1>
        <div className="scrubber" role="tablist">
          {data.states.map((s, i) => (
            <button
              key={s.event + i}
              role="tab"
              aria-selected={i === idx}
              className={i === idx ? "seg active" : "seg"}
              onClick={() => setIdx(i)}
            >
              {s.event}
            </button>
          ))}
        </div>
      </header>

      <div className="rows">
        {rows.map((r) => (
          <motion.div layout transition={springRow} key={r.name}
            className={`row ${r.lead ? "lead" : ""}`}>
            <div className="row-top">
              <span className="team">{r.name}</span>
              <span className="right">
                {Math.abs(r.delta) >= 0.05 && idx > 0 && (
                  <motion.span
                    className={`chip ${r.delta > 0 ? "chip-rise" : "chip-fall"}`}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.45 }}
                  >
                    {r.delta > 0 ? "▲ " : "▼ "}{Math.abs(r.delta).toFixed(1)}
                  </motion.span>
                )}
                <CountUp value={r.value} />
              </span>
            </div>
            <div className="track">
              <motion.div className="fill"
                animate={{ width: `${r.width}%` }}
                transition={{ type: "spring", stiffness: 85, damping: 20 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
