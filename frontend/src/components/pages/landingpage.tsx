import { useEffect, useState } from "react";

const WORD = ["W", "O", "R", "D", "L", "Y"];
const TILE_COLORS = ["correct", "correct", "present", "absent", "correct", "present"];

const colorMap = {
  correct: "bg-amber-400 border-amber-400 text-black",
  present: "bg-zinc-500 border-zinc-500 text-white",
  absent: "bg-zinc-800 border-zinc-700 text-zinc-400",
  empty: "bg-transparent border-zinc-700 text-white",
};

function HeroTile({ letter, state, delay }) {
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFlipping(true), delay);
    const t2 = setTimeout(() => {
      setRevealed(true);
      setFlipping(false);
    }, delay + 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [delay]);

  return (
    <div
      className={`
        w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center
        font-mono font-bold text-xl sm:text-2xl tracking-widest select-none
        transition-all duration-300
        ${revealed ? colorMap[state] : "border-zinc-700 text-white bg-transparent"}
        ${flipping ? "scale-y-0" : "scale-y-100"}
      `}
      style={{ transitionTimingFunction: "ease-in-out" }}
    >
      {letter}
    </div>
  );
}

function SampleGrid() {
  const rows = [
    {
      letters: ["S", "T", "A", "R", "T", "S"],
      states: ["absent", "present", "absent", "correct", "absent", "absent"],
      delay: 1800,
    },
    {
      letters: ["C", "R", "A", "N", "E", "S"],
      states: ["absent", "correct", "absent", "present", "absent", "absent"],
      delay: 2600,
    },
  ];

  return (
    <div className="flex flex-col gap-1.5 items-center">
      {/* Animated hero word */}
      <div className="flex gap-1.5 mb-1.5">
        {WORD.map((l, i) => (
          <HeroTile key={i} letter={l} state={TILE_COLORS[i]} delay={400 + i * 120} />
        ))}
      </div>
      {/* Static previous guesses */}
      {rows.map((row, ri) => (
        <AnimatedRow key={ri} row={row} />
      ))}
      {/* Empty rows */}
      {[0, 1, 2].map((_, ri) => (
        <div key={ri} className="flex gap-1.5">
          {Array(6)
            .fill(null)
            .map((__, ci) => (
              <div
                key={ci}
                className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-zinc-800 bg-transparent"
              />
            ))}
        </div>
      ))}
    </div>
  );
}

function AnimatedRow({ row }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), row.delay);
    return () => clearTimeout(t);
  }, [row.delay]);

  return (
    <div
      className={`flex gap-1.5 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {row.letters.map((l, i) => (
        <div
          key={i}
          className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center font-mono font-bold text-xl sm:text-2xl ${colorMap[row.states[i]]}`}
        >
          {l}
        </div>
      ))}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold text-white font-mono">{value}</span>
      <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-zinc-800 last:border-0 group">
      <div className="mt-0.5 w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-amber-400 text-lg group-hover:border-amber-400/40 transition-colors duration-200">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
        <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function WordlyLanding() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono font-bold tracking-widest text-sm text-amber-400">
            WORDLY
          </span>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-150"
            >
              How to play
            </a>
            <a
              href="#"
              className="text-sm bg-amber-400 text-black font-semibold px-4 py-1.5 rounded hover:bg-amber-300 transition-colors duration-150"
            >
              Play free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div
            className={`transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-xs font-mono text-amber-400 tracking-[0.2em] uppercase mb-4">
              Daily word game
            </p>
            <h1 className="text-5xl sm:text-6xl font-bold leading-none tracking-tight mb-6 text-white">
              Six letters.
              <br />
              <span className="text-zinc-500">Six chances.</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-sm">
              A new puzzle drops every day. Guess the hidden word, share your result, and keep your
              streak alive.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="#"
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3 rounded transition-colors duration-150 text-sm tracking-wide"
              >
                Play today's puzzle →
              </a>
              <a
                href="#"
                className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium px-6 py-3 rounded transition-colors duration-150 text-sm"
              >
                View archive
              </a>
            </div>
          </div>

          {/* Right — live demo grid */}
          <div
            className={`flex justify-center transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <SampleGrid />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-zinc-900 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-zinc-900">
          <StatCard value="2M+" label="Players" />
          <StatCard value="847" label="Puzzles" />
          <StatCard value="14" label="Languages" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-2">
            <p className="text-xs font-mono text-zinc-600 tracking-[0.2em] uppercase mb-8">
              How it works
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tile: "🟨",
                step: "01",
                title: "Guess a word",
                desc: "Type any valid 6-letter word and hit enter to submit your guess.",
              },
              {
                tile: "🟩",
                step: "02",
                title: "Read the clues",
                desc: "Green means right letter, right spot. Yellow means right letter, wrong spot.",
              },
              {
                tile: "⬛",
                step: "03",
                title: "Solve in six",
                desc: "Use the clues to narrow it down. You have six attempts to find the word.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group p-6 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-950 hover:bg-zinc-900/50 transition-all duration-200"
              >
                <div className="text-2xl mb-4">{item.tile}</div>
                <p className="text-xs font-mono text-zinc-600 mb-2">{item.step}</p>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-mono text-zinc-600 tracking-[0.2em] uppercase mb-4">
              Features
            </p>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              Built for daily habits
            </h2>
            <p className="text-zinc-500 text-base leading-relaxed">
              One puzzle a day keeps the streak going. No ads, no accounts, no fuss.
            </p>
          </div>
          <div>
            <FeatureRow
              icon="🔥"
              title="Daily streaks"
              desc="Play every day to keep your streak. We track your longest run so you always have something to beat."
            />
            <FeatureRow
              icon="📊"
              title="Personal stats"
              desc="See your win rate, guess distribution, and how you stack up against today's average."
            />
            <FeatureRow
              icon="🌙"
              title="Dark mode"
              desc="Easy on the eyes for late-night solvers. Your eyes will thank you on puzzle 400."
            />
            <FeatureRow
              icon="📤"
              title="Share without spoiling"
              desc="The emoji grid lets you share your result everywhere without giving away the answer."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center gap-1.5 mb-8">
            {["W", "O", "R", "D", "L", "Y"].map((l, i) => (
              <div
                key={i}
                className="w-10 h-10 border-2 border-amber-400/30 flex items-center justify-center font-mono font-bold text-amber-400 text-sm"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {l}
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to play?</h2>
          <p className="text-zinc-500 mb-8 text-lg">A new puzzle is waiting. No sign-up needed.</p>
          <a
            href="#"
            className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded text-sm tracking-wide transition-colors duration-150"
          >
            Start today's puzzle →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span className="font-mono font-bold tracking-widest text-amber-400/60">WORDLY</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Contact</a>
          </div>
          <span>© 2026 Wordly. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}