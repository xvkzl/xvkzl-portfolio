import "./App.scss";
import pfp from "./assets/images/pfp.png";
import music from "./assets/music/love_hurts.mp3";
import sung_jin_woo from "./assets/images/sung_jin_woo.png";
import gsap from "gsap";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Moon, Sun, CirclePlay, CirclePause } from "lucide-react";

import { RiInstagramLine } from "react-icons/ri";
import { FaDiscord } from "react-icons/fa";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { Observer } from "gsap/Observer";
gsap.registerPlugin(
  ScrollTrigger,
  ScrambleTextPlugin,
  SplitText,
  Observer
);

function App() {
  const profileRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [darkMode, setDarkMode] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const text = "xvkzl";

  // 🎵 music toggle (FIXED STATE DESYNC)
  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setPlaying(true);
      } else {
        audioRef.current.pause();
        setPlaying(false);
      }
    } catch (err) {
      console.error(err);
      setPlaying(false);
    }
  };
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", update);

    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", update);
    };
  }, []);
  // 🔊 volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 1;
  }, []);

useLayoutEffect(() => {
  const sections = gsap.utils.toArray<HTMLElement>(".skill-section");
  const headings = gsap.utils.toArray<HTMLElement>(".skill-heading");

  if (!sections.length) return;

  let splitInstances: SplitText[] = [];

  const splitHeadings = headings.map((h) => {
    const split = new SplitText(h, { type: "chars" });
    splitInstances.push(split);
    return split;
  });

  let currentIndex = 0;
  let animating = false;

  const wrap = gsap.utils.wrap(0, sections.length);

  // 🔥 HARD RESET STATE (prevents invisible first frame bug)

  gsap.set(sections, {
  autoAlpha: 0,
  y: 40,
  display: "flex",
});

gsap.set(sections[0], {
  autoAlpha: 1,
  y: 0,
  display: "flex",
});

  function gotoSection(index: number, direction: number) {
    index = wrap(index);
    if (animating || index === currentIndex) return;

    animating = true;

    const dFactor = direction === 1 ? 1 : -1;

    const tl = gsap.timeline({
      defaults: { duration: 1, ease: "power2.inOut" },
      onComplete: () => (animating = false),
    });

    tl.to(sections[currentIndex], {
      autoAlpha: 0,
      y: -30 * dFactor,
    });

    tl.fromTo(
      sections[index],
      {
        autoAlpha: 0,
        y: 30 * dFactor,
      },
      {
        autoAlpha: 1,
        y: 0,
      },
      0
    ).fromTo(
      splitHeadings[index].chars,
      {
        autoAlpha: 0,
        y: 40,
      },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.02,
        duration: 0.8,
      },
      0.2
    );

    currentIndex = index;
  }

  const observer = Observer.create({
    type: "wheel,touch,pointer",
    wheelSpeed: -1,
    onDown: () => gotoSection(currentIndex - 1, -1),
    onUp: () => gotoSection(currentIndex + 1, 1),
    tolerance: 10,
    preventDefault: true,
  });

  return () => {
    observer.kill();
    splitInstances.forEach((s) => s.revert());
    gsap.killTweensOf(sections);
  };
}, []);
  // 🌗 theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      setDarkMode(false);
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // ✨ SplitText (FIXED MEMORY LEAK)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create(".split", {
        type: "lines, words",
        mask: "lines",
        autoSplit: true,

        onSplit(self) {
          return gsap.from(self.words, {
            duration: 1,
            y: 100,
            autoAlpha: 0,
            stagger: 0.05,
            ease: "power4.out",
          });
        },
      });

      return () => split.revert();
    });

    return () => ctx.revert();
  }, []);

  // 🎬 intro animation
  useLayoutEffect(() => {
    gsap.fromTo(
      ".container",
      {
        opacity: 0,
        y: 80,
        scale: 0.94,
        filter: "blur(24px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.8,
        ease: "power3.out",
      }
    );
  }, []);

  // sung jin woo lol
  useLayoutEffect(() => {
  gsap.fromTo(
    ".sung_jin_woo",
    {
      opacity: 0,
      x: 300,
      scale: 0.9,
      filter: "blur(20px)",
    },
    {
      opacity: 1,
      x: 280,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.8,
      ease: "power3.out",

      scrollTrigger: {
        trigger: ".sung_jin_woo",
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
}, []);

  // 🌊 floating motion
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    gsap.to(containerRef.current, {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 2,
    });
  }, []);

  // 🧲 parallax
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const move = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * 0.015;
      const y = (e.clientY - window.innerHeight / 2) * 0.015;

      gsap.to(container, {
        x,
        y,
        rotationY: x * 0.4,
        rotationX: -y * 0.4,
        transformPerspective: 1200,
        transformOrigin: "center",
        duration: 1.2,
        ease: "power3.out",
      });
    };

    const leave = () => {
      gsap.to(container, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        duration: 1.4,
        ease: "elastic.out(1, 0.5)",
      });
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  // 🖼 profile float
  useLayoutEffect(() => {
    if (!profileRef.current) return;

    gsap.to(profileRef.current, {
      y: -6,
      scale: 1.03,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  // 🍎 title reveal
  useLayoutEffect(() => {
    if (!textRef.current) return;

    const chars = textRef.current.children;

    gsap.fromTo(
      chars,
      {
        opacity: 0,
        y: 40,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        stagger: 0.08,
        ease: "power4.out",
        delay: 0.2,
      }
    );
  }, []);

  // 🌀 bio reveal
  useLayoutEffect(() => {
    gsap.fromTo(
      ".bio",
      {
        opacity: 0,
        rotateX: -90,
        y: 40,
        transformPerspective: 1000,
        transformOrigin: "top center",
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        rotateX: 0,
        y: 0,
        filter: "blur(0px)",
        duration: 1.8,
        ease: "power4.out",
        delay: 0.5,

        scrambleText: {
          text: "tech enthusiast.",
          chars: "01",
          speed: 0.5,
        },
      }
    );
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const value = Number(e.target.value);
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  return (
    <main className="hero">
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )}
      </button>

      <div className="bg-glow" />

<div
  ref={containerRef}
  className="container"
  style={{
  position: "relative",
  zIndex: 2,
  marginTop: "12vh",
}}
>
        <img
          ref={profileRef}
          src={pfp}
          className="profile"
          alt="profile"
        />

        <div className="text-block flex flex-col items-center">
          <h1 ref={textRef} className="title split">
            {text.split("").map((char, i) => (
              <span key={i} className="char">
                {char}
              </span>
            ))}
          </h1>

          <div ref={bioRef} className="bio text-center"></div>

          <div className="socials">
            <a
              href="https://instagram.com/xvkzl.exe"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiInstagramLine size={30} />
            </a>

            <a
              href="https://discord.gg/VrDBDpchk5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord size={30} />
            </a>
          </div>

          {/* 🎧 MUSIC WIDGET FIXED */}
          <div className={`music-widget ${playing ? "playing" : ""}`}>
            <img
              src={pfp}
              alt="album art"
              className={`disc ${playing ? "spin" : ""}`}
              onClick={toggleMusic}
            />

            <div className="music-info">
              <p className="song-name">Love Hurts</p>

              <div className="music-controls-row">
                <button onClick={toggleMusic} className="inline-play-btn">
                  {playing ? (
                    <CirclePause size={18} />
                  ) : (
                    <CirclePlay size={18} />
                  )}
                </button>

                <div className="slider-wrapper">
                  <div
                    className="slider-track-fill"
                    style={{
                      width: `${duration ? (progress / duration) * 100 : 0}%`,
                    }}
                  />

                  <input
                    className="music-slider"
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={progress}
                    onChange={handleSeek}
                  />
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={music}
            loop
            preload="auto"
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="whoami-container" style={{
          marginTop: "40vh",
        }}>
        <h2 className="whoami-heading">whoami?</h2>
        <div className="whoami">
          <img
  src={sung_jin_woo}
  alt="Sung Jin Woo"
  className="sung_jin_woo"
/>
        </div>
      </div>
      <div
        className="skills-container"
        style={{
          marginTop: "20vh",
        }}
      >
        <section className="skill-section">
          <h2 className="skill-heading">Game Engine Developer</h2>
          <p className="skill-text">working on HellEngine (open-sourcing it soon)</p>
        </section>
                        
        <section className="skill-section">
          <h2 className="skill-heading">Hacker</h2>
          <p className="skill-text">Web App Pentesting • Reverse Engineering • API Exploitation • Cloud Service Pentesting</p>
        </section>
                        
        <section className="skill-section">
          <h2 className="skill-heading">what's more?</h2>
          <p className="skill-text">i just make whatever i can lol.</p>
        </section>
      </div>
    </main>
  );
}

export default App;