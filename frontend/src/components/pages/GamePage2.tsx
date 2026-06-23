import { useState, useEffect, useCallback, useRef } from "react";

const WORDS = [
  "crane","slate","audio","flint","grope","plumb","stoic","trove","blaze","choir",
  "frown","glare","hinge","knack","lyric","mason","oxide","quirk","rivet","shunt",
  "tiger","ulcer","vigor","waltz","axiom","brisk","clamp","depot","ember","fjord",
  "gauze","haven","ideal","joust","kneel","lusty","motif","nymph","ovoid","pixel",
  "quart","risky","snide","tepid","ultra","vivid","winch","xenon","yacht","zonal",
  "abide","blunt","cigar","evoke","gloom","husky","irony","jaunt","knave","lithe",
  "mocha","optic","prism","quota","rainy","savor","venom","weary","acute","braid",
  "comet","derby","elfin","froze","guile","handy","jokey","lingo","magic","nerve",
  "olive","plank","quest","rebel","spunk","tacit","viola","wrist","brood","chasm",
];

const getRandomTarget = () => WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"], 
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

type LetterState = "correct" | "present" | "absent";
type RowAnimation = "flip" | "shake" | "pop" | "reset" | null;

const COLOR: Record<LetterState, { bg: string; text: string; border: string }> = {
  correct: { bg: "#006039", text: "#ffffff", border: "#3a3a3a" },
  present: { bg: "#c8b653", text: "#ffffff", border: "#271414" },
  absent:  { bg: "#1a1a1a", text: "#555555", border: "#1a1a1a" },
};

const PRIORITY: Record<LetterState, number> = { correct: 3, present: 2, absent: 1 };

function getColors(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(5).fill("absent");
  const pool: (string | null)[] = [...target];
  
  guess.split("").forEach((l, i) => {
    if (l === target[i]) { 
      result[i] = "correct"; 
      pool[i] = null; 
    }
  });
  
  guess.split("").forEach((l, i) => {
    if (result[i] === "correct") return;
    const p = pool.indexOf(l);
    if (p > -1) { 
      result[i] = "present"; 
      pool[p] = null; 
    }
  });
  return result;
}

// ── Tile ────────────────────────────────────────────────────────────────────
function Tile({ letter, state, animState, delay = 0 }: {
  letter: string;
  state?: LetterState;
  animState?: "flip" | "pop" | "reset";
  delay?: number;
}) {
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (animState === "flip" && state) {
      const t = setTimeout(() => {
        setFlipping(true);
        setTimeout(() => { 
          setFlipping(false); 
          setRevealed(true); 
        }, 250);
      }, delay);
      return () => clearTimeout(t);
    }
    if (animState === "reset") { 
      setRevealed(false); 
      setFlipping(false); 
    }
  }, [animState, state, delay]);

  // FIX 1: Safely evaluating valid keys on COLOR dictionary map
  const colors = revealed && state && COLOR[state] ? COLOR[state] : null;

  return (
    <div
      style={{
        width: 52,
        height: 52,
        border: `2px solid ${colors ? colors.border : "var(--color-border-secondary, #444)"}`,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        fontWeight: 700,
        textTransform: "uppercase",
        color: colors ? colors.text : "#ffffff",
        background: colors ? colors.bg : "transparent",
        transform: flipping ? "rotateX(90deg)" : "rotateX(0deg)",
        animation: animState === "pop" && letter ? "pop 0.1s ease-in-out" : undefined,
        transition: "transform 0.25s ease-in, background 0.1s, border-color 0.1s",
        userSelect: "none",
      }}
    >
      {letter}
    </div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────
function Row({ letters, colors, animState, bouncing }: {
  letters: string[];
  colors: LetterState[] | null;
  animState?: RowAnimation;
  bouncing: boolean;
}) {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (animState === "shake") {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [animState]);

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        animation: shaking ? "shake 0.5s ease-in-out" : undefined,
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            animation: bouncing
              ? `bounce 0.5s ease-in-out ${i * 0.07}s both`
              : undefined,
          }}
        >
          <Tile
            letter={letters[i] || ""}
            state={colors?.[i]}
            animState={animState === "flip" ? "flip" : animState === "pop" && letters[i] ? "pop" : undefined}
            delay={i * 200}
          />
        </div>
      ))}
    </div>
  );
}

// ── Keyboard ─────────────────────────────────────────────────────────────────
function Key({ label, keyState, onPress }: {
  label: string;
  keyState?: LetterState;
  onPress: (k: string) => void;
}) {
  const isWide = label === "ENTER" || label === "⌫";
  // FIX 2: Safeguarded to match LetterState index bounds
  const colors = keyState && COLOR[keyState] ? COLOR[keyState] : null;

  return (
    <button
      onClick={() => onPress(label)}
      style={{
        minWidth: isWide ? 56 : 34,
        height: 52,
        padding: "0 4px",
        border: "none",
        borderRadius: 4,
        background: colors ? colors.bg : "#818384",
        color: "#ffffff",
        fontFamily: "inherit",
        fontSize: isWide ? 12 : 14,
        fontWeight: 700,
        cursor: "pointer",
        textTransform: "uppercase",
        transition: "background 0.2s ease, transform 0.05s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
      onMouseDown={e => { e.currentTarget.style.transform = "scale(0.92)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {label}
    </button>
  );
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const pieces = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 6 + 4,
      color: ["#c8c8c8","#888","#444","#e0e0e0","#fff","#666","#bbb"][Math.floor(Math.random() * 7)],
      rot: Math.random() * 360,
      drot: (Math.random() - 0.5) * 6,
      alpha: 1,
    }));

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.drot;
        if (p.y > canvas.height) p.alpha -= 0.08;
        if (p.alpha <= 0) return;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      if (alive) rafRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 10,
      }}
    />
  );
}

// ── Main Game ─────────────────────────────────────────────────────────────────
export function GamePage2() {
  // FIX 3: Explicitly typed matrix definition prevents assignment conflicts
  const [targetWord, setTargetWord] = useState(getRandomTarget);
  const [grid, setGrid] = useState<string[][]>(Array.from({ length: 6 }, () => []));
  const [colors, setColors] = useState<LetterState[][] | null[]>(Array(6).fill(null));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [rowAnim, setRowAnim] = useState<RowAnimation[]>(Array(6).fill(null));
  const [bouncingRow, setBouncingRow] = useState<number | null>(null);
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flipping, setFlipping] = useState(false);

  // Log target word for debugging
  useEffect(() => {
    console.log("Target Word:", targetWord);
  }, [targetWord]);

  const showMsg = useCallback((m: string, dur = 1800) => {
    setMessage(m);
    if (dur > 0) setTimeout(() => setMessage(m2 => m2 === m ? "" : m2), dur);
  }, []);

  const triggerAnim = useCallback((row: number, type: RowAnimation, cb?: () => void) => {
    setRowAnim(a => { const n = [...a]; n[row] = type; return n; });
    const delay = type === "flip" ? 5 * 200 + 250 : 150;
    setTimeout(() => {
      setRowAnim(a => { const n = [...a]; n[row] = null; return n; });
      cb?.();
    }, delay);
  }, []);

  const submitGuess = useCallback(() => {
    if (flipping) return;
    if (currentLetters.length < 5) {
      triggerAnim(currentRow, "shake");
      showMsg("Not enough letters");
      return;
    }
    const guess = currentLetters.join("");
    const guessColors = getColors(guess, targetWord);

    setGrid(g => { const n = [...g]; n[currentRow] = [...currentLetters]; return n; });
    
    // FIX 4: Aligned array spread updates with new type definition
    setColors(c => { const n = [...c]; n[currentRow] = guessColors; return n; });
    setFlipping(true);

    triggerAnim(currentRow, "flip", () => {
      setFlipping(false);
      setKeyStates(ks => {
        const next = { ...ks };
        currentLetters.forEach((l, i) => {
          const existingState = next[l];
          // FIX 5: Fallback validation for prior keys prevents passing undefined into PRIORITY
          const cur = existingState ? PRIORITY[existingState] : 0;
          if (PRIORITY[guessColors[i]] > cur) next[l] = guessColors[i];
        });
        return next;
      });

      const nextRow = currentRow + 1;
      if (guess === targetWord) {
        setGameOver(true); setWon(true);
        setTimeout(() => setBouncingRow(currentRow), 100);
        setTimeout(() => showMsg("Brilliant! 🎉", -1), 400);
      } else if (nextRow === 6) {
        setGameOver(true);
        showMsg(`The word was: ${targetWord}`, -1);
      } else {
        setCurrentRow(nextRow);
        setCurrentLetters([]);
      }
    });
  }, [currentLetters, currentRow, flipping, showMsg, triggerAnim, targetWord]);

  const handleKey = useCallback((k: string) => {
    if (gameOver || flipping) return;
    if (k === "⌫" || k === "BACKSPACE") {
      setCurrentLetters(cl => cl.slice(0, -1));
    } else if (k === "ENTER") {
      submitGuess();
    } else if (/^[A-Z]$/.test(k) && currentLetters.length < 5) {
      setCurrentLetters(cl => [...cl, k]);
      triggerAnim(currentRow, "pop");
    }
  }, [gameOver, flipping, currentLetters, currentRow, submitGuess, triggerAnim]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (k === "ENTER" || k === "BACKSPACE" || /^[A-Z]$/.test(k)) {
        e.preventDefault();
        handleKey(k);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  // Handle Play Again state reset
  const handlePlayAgain = () => {
    setTargetWord(getRandomTarget());
    setGrid(Array.from({ length: 6 }, () => []));
    setColors(Array(6).fill(null));
    setCurrentRow(0);
    setCurrentLetters([]);
    setRowAnim(Array(6).fill(null));
    setBouncingRow(null);
    setKeyStates({});
    setMessage("");
    setGameOver(false);
    setWon(false);
    setFlipping(false);
  };

  const getRowLetters = (row: number) =>
    row === currentRow ? currentLetters : (grid[row] || []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); border-color: #666; }
          100% { transform: scale(1); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
      `}</style>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#121213",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Confetti active={won} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.15em", color: "#f0f0f0" }}>
            WORDLY
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", color: "#f0f0f0" }}>
            (THANK YOU!)
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 350, height: "1px", background: "#3a3a3c", marginBottom: "1.5rem" }} />

        {/* Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1rem" }}>
          {Array.from({ length: 6 }).map((_, r) => (
            <Row
              key={r}
              letters={getRowLetters(r)}
              colors={colors[r]}
              animState={rowAnim[r]}
              bouncing={bouncingRow === r}
            />
          ))}
        </div>

        {/* Message and Play Again Section */}
        <div style={{ height: 48, display: "flex", alignItems: "center", gap: 16, marginBottom: "1rem" }}>
          {message && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#ffffff",
                background: "#3a3a3c",
                padding: "6px 12px",
                borderRadius: 4,
                letterSpacing: "0.04em",
              }}
            >
              {message}
            </div>
          )}
          
          {/* PLAY AGAIN BUTTON */}
          {gameOver && (
            <button
              onClick={handlePlayAgain}
              style={{
                padding: "8px 16px",
                background: "#006039",
                color: "#ffffff",
                border: "none",
                borderRadius: 4,
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#007a49"}
              onMouseLeave={e => e.currentTarget.style.background = "#006039"}
            >
              Play Again 🔄
            </button>
          )}
        </div>

        {/* Keyboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", padding: "0 4px" }}>
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 6 }}>
              {row.map(k => (
                <Key key={k} label={k} keyState={keyStates[k]} onPress={handleKey} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default GamePage2;