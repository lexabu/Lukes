import { useEffect, useState } from "react";
import "./App.css";

const PASSWORD = "lukesbutt"; // Changed password as requested
const MAX_DAYS = 30;
const GROSS_THRESHOLD = 2; // Day after which grossest theme is used
const GROSSEST_LEVEL = 30; // The CSS class for the grossest state
const STORAGE_KEY = "lukes_last_shower_date";

function getDaysSince(dateString: string | null): number {
  if (!dateString) return 0;
  const last = new Date(dateString);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.min(diff, MAX_DAYS);
}

function App() {
  const [lastShower, setLastShower] = useState<string | null>(null);
  const [days, setDays] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  // Preview mode for development
  const [previewDay, setPreviewDay] = useState<number | null>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setLastShower(stored);
    setDays(getDaysSince(stored));
  }, []);

  // Update days every minute (in case tab is left open)
  useEffect(() => {
    const interval = setInterval(() => {
      setDays(getDaysSince(lastShower));
    }, 60000);
    return () => clearInterval(interval);
  }, [lastShower]);

  // Update days if lastShower changes
  useEffect(() => {
    setDays(getDaysSince(lastShower));
  }, [lastShower]);

  useEffect(() => {
    document.title = "Luke's Shower Tracker";
  }, []);

  const handleShower = () => {
    setShowPwd(true);
    setPwd("");
    setError("");
  };

  const handlePwdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      const today = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, today);
      setLastShower(today);
      setShowPwd(false);
      setPwd("");
      setError("");
    } else {
      setError("Wrong password!");
    }
  };

  // Theming logic: use grossest theme for days >= GROSS_THRESHOLD
  const realDays = previewDay !== null ? previewDay : days;
  let grossLevel = 0;
  if (realDays === 0) grossLevel = 0;
  else if (realDays === 1) grossLevel = 1;
  else if (realDays >= GROSS_THRESHOLD) grossLevel = GROSSEST_LEVEL;

  // Dynamic gross-visual glow only (keep circle size consistent)
  let grossVisualStyle = {};
  if (realDays === GROSS_THRESHOLD) {
    // Day 2: big glow, consistent circle size
    grossVisualStyle = {
      width: "120px",
      height: "120px",
      boxShadow: "0 0 160px 80px #bada55",
      zIndex: 1,
    };
  } else if (realDays === GROSS_THRESHOLD + 1) {
    // Day 3: bigger glow, consistent circle size
    grossVisualStyle = {
      width: "120px",
      height: "120px",
      boxShadow: "0 0 320px 160px #bada55",
      zIndex: 1,
    };
  } else if (realDays >= GROSS_THRESHOLD + 2) {
    // Day 4 and beyond: massive glow fills page, circle stays same size
    grossVisualStyle = {
      width: "120px",
      height: "120px",
      boxShadow: "0 0 2000px 1000px #bada55",
      zIndex: 1,
      position: "relative",
    };
  } else if (realDays === 1) {
    grossVisualStyle = {
      width: "120px",
      height: "120px",
      boxShadow: "0 0 40px 10px #bada55",
      zIndex: 1,
    };
  } else {
    grossVisualStyle = {
      width: "120px",
      height: "120px",
      boxShadow: "0 0 40px 10px #b3e6ff",
      zIndex: 1,
    };
  }

  // Render bugs based on grossness level
  const renderBugs = () => {
    if (realDays < GROSS_THRESHOLD) return null;

    const bugCount = Math.min(realDays - 1, 10); // 1-10 bugs max
    const bugs = [];
    const bugEmojis = ["🪰", "🐛", "🦗", "🕷️", "🐜"];

    for (let i = 0; i < bugCount; i++) {
      const bugEmoji = bugEmojis[i % bugEmojis.length];
      const bugClass = `bug-${(i % 5) + 1}`;
      bugs.push(
        <div
          key={i}
          className={`bug ${bugClass}`}
          style={{ animationDelay: `${i * 0.5}s` }}
        >
          {bugEmoji}
        </div>
      );
    }

    return bugs;
  };

  return (
    <div
      className={`app-bg gross-${grossLevel}`}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Render crawling bugs */}
      {renderBugs()}

      <h1 style={{ position: "relative", zIndex: 10 }}>
        Luke's Shower Tracker 🚿
      </h1>
      {/* Preview slider */}
      <div style={{ margin: "1rem 0", position: "relative", zIndex: 10 }}>
        <label htmlFor="preview-slider">Preview day: </label>
        <input
          id="preview-slider"
          type="range"
          min={0}
          max={MAX_DAYS}
          value={previewDay ?? days}
          onChange={(e) => setPreviewDay(Number(e.target.value))}
          style={{ width: 200 }}
        />
        <span style={{ marginLeft: 8 }}>{previewDay ?? days}</span>
        <button style={{ marginLeft: 16 }} onClick={() => setPreviewDay(null)}>
          Reset Preview
        </button>
      </div>
      {/* Gross visual is now behind the tracker card */}
      <div
        className={`gross-visual gross-${grossLevel}`}
        style={grossVisualStyle}
      ></div>
      <div className="tracker-card" style={{ position: "relative", zIndex: 2 }}>
        <h2>
          {realDays === 0
            ? "Luke is sparkling clean! ✨"
            : `It's been ${realDays} day${
                realDays === 1 ? "" : "s"
              } since Luke showered!`}
        </h2>
        <button
          className={`shower-btn gross-${grossLevel}`}
          onClick={handleShower}
        >
          Luke showered!
        </button>
        {showPwd && (
          <form className="pwd-form" onSubmit={handlePwdSubmit}>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
            <button type="submit">Reset</button>
            <button type="button" onClick={() => setShowPwd(false)}>
              Cancel
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        )}
        <p className="desc">
          The longer Luke goes without a shower, the grosser this site gets!
          Help him stay clean! 🧼
        </p>
      </div>
    </div>
  );
}

export default App;
