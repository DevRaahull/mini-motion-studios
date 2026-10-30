"use client";

import React, { useState } from "react";

interface FilmProject {
  id: string;
  youtubeId?: string;
  videoSrc?: string;
  title: string;
  category: "micro-drama" | "hindi-drama" | "psychology" | "anime" | "experiments" | "commercial";
  categoryLabel: string;
  dotColor: "red" | "gold" | "purple" | "blue" | "emerald";
  duration: string;
  desc: string;
  img: string;
  watchUrl: string;
}

const FILMS: FilmProject[] = [
  {
    id: "alphas-fated-mate-ep1",
    title: "The Alpha's Fated Mate: The Golden Eyes (Ep. 1)",
    category: "micro-drama",
    categoryLabel: "AI Micro-Drama Series",
    dotColor: "red",
    duration: "01:04",
    desc: "Studio-level hyper-realistic fantasy micro-drama (9:16 vertical). Ellie Rowan, a broke diner waitress hiding molten gold eyes every full moon, encounters Gideon Thorne, Alpha of Blackpine pack.",
    img: "/assets/real_thumbs/card_alphas_mate.jpg",
    videoSrc: "/videos/alphas_fated_mate_ep1.mp4",
    watchUrl: "https://www.youtube.com/@minimotionstudioss",
  },
  {
    id: "badnaam-ep1",
    title: "Badnaam De Luca: Lucas Ka Sach (Ep. 1)",
    category: "hindi-drama",
    categoryLabel: "Hindi AI Micro-Drama",
    dotColor: "red",
    duration: "01:34",
    desc: "Original Hindi AI Micro-Drama directed by Rahul Soni. Morgan ke ilzaam aur Romano pariwaar ke sach ke beech Lucas De Luca apne parivaar ke dafn raaz dhoondhta hai.",
    img: "/assets/real_thumbs/card_badnaam_ep1.jpg",
    videoSrc: "/videos/badnaam_de_luca_ep1.mp4",
    watchUrl: "https://www.youtube.com/@MiniMotionStudiosHindi",
  },
  {
    id: "badnaam-ep2",
    title: "Badnaam De Luca: 100M Secret Debt (Ep. 2)",
    category: "hindi-drama",
    categoryLabel: "Hindi AI Micro-Drama",
    dotColor: "gold",
    duration: "01:34",
    desc: "High-stakes hyper-realistic Hindi micro-drama. Alessia aur Lucas ke beech ka ghamasan shuru hota hai jab 100 million ke secret debt ka khulasa hota hai.",
    img: "/assets/real_thumbs/card_badnaam_ep2.jpg",
    videoSrc: "/videos/badnaam_de_luca_ep2.mp4",
    watchUrl: "https://www.youtube.com/@MiniMotionStudiosHindi",
  },
  {
    id: "rival-crumbles",
    youtubeId: "kDHCSV1El3A",
    title: "The Architect: I Destroyed a Corporate Rival – Then Regretted It",
    category: "anime",
    categoryLabel: "Flagship AI Series (The Architect)",
    dotColor: "gold",
    duration: "03:42",
    desc: "A flagship cinematic production exploring corporate power dynamics, ruthless tactical retaliation, and the heavy psychological void left when victory arrives.",
    img: "/assets/real_thumbs/kDHCSV1El3A.jpg",
    watchUrl: "https://www.youtube.com/watch?v=kDHCSV1El3A",
  },
  {
    id: "respect-list",
    title: "Don't Do This List for Earning Respect",
    category: "psychology",
    categoryLabel: "Dark Psychology & Respect",
    dotColor: "red",
    duration: "00:58",
    desc: "Tactical psychology rules on commanding social respect. High-value presence never begs for validation — silent boundaries, grounded vocal tone, and unshakeable posture command the room.",
    img: "/assets/real_thumbs/card_respect.jpg",
    videoSrc: "/videos/respect_list.mp4",
    watchUrl: "https://www.youtube.com/shorts/jEEmcm7SfkQ",
    youtubeId: "jEEmcm7SfkQ",
  },
  {
    id: "stay-after-said",
    title: "She Didn't Walk Away After He Said This",
    category: "anime",
    categoryLabel: "Anime Stories (Peter & Lily)",
    dotColor: "gold",
    duration: "01:06",
    desc: "An emotionally intense cinematic anime scene exploring raw authenticity, emotional tension, and magnetic presence on a high-stakes first date.",
    img: "/assets/real_thumbs/card_stay.jpg",
    videoSrc: "/videos/stay_after_said.mp4",
    watchUrl: "https://www.youtube.com/@minimotionstudioss",
  },
  {
    id: "manipulation-signs",
    title: "Signs You're Being Manipulated (And Don't Know It)",
    category: "psychology",
    categoryLabel: "Dark Psychology Defense",
    dotColor: "red",
    duration: "00:57",
    desc: "Subtle psychological covert tactics: emotional anchoring, gaslighting, and intermittent reinforcement. How to spot manipulation before it breaches your intuition.",
    img: "/assets/real_thumbs/card_manipulation.jpg",
    videoSrc: "/videos/manipulation_signs.mp4",
    watchUrl: "https://www.youtube.com/@minimotionstudioss",
  },
];

const PROCESS_STEPS = [
  { icon: "💡", title: "Idea &\nConcept" },
  { icon: "📋", title: "Script &\nStoryboarding" },
  { icon: "🎬", title: "AI Visual\nGeneration" },
  { icon: "🎙️", title: "Voice &\nSound Design" },
  { icon: "🎛️", title: "Editing &\nFinal Cut" },
];

const TOOLS = [
  { name: "Google Flow", icon: "FD", color: "#ef4444" },
  { name: "Nano Banana", icon: "🍌", color: "#fbbf24" },
  { name: "NotebookLM", icon: "📓", color: "#a78bfa" },
  { name: "Gemini", icon: "✦", color: "#38bdf8" },
  { name: "ChatGPT", icon: "🧠", color: "#10b981" },
  { name: "Claude", icon: "☀️", color: "#f59e0b" },
  { name: "Runway", icon: "R3", color: "#f43f5e" },
  { name: "Kling AI", icon: "KL", color: "#ec4899" },
  { name: "ElevenLabs", icon: "II", color: "#ffffff" },
  { name: "DaVinci", icon: "⚙️", color: "#ffffff" },
  { name: "CapCut", icon: "✂️", color: "#ffffff" },
  { name: "Photoshop", icon: "Ps", color: "#38bdf8" },
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedFilm, setSelectedFilm] = useState<FilmProject | null>(null);
  const [isCollabOpen, setIsCollabOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("raahulsoni.2112@gmail.com");
    showToast("✓ Studio email copied to clipboard!");
  };

    const filteredFilms =
    activeFilter === "all"
      ? FILMS
      : activeFilter === "micro-drama"
      ? FILMS.filter((f) => f.category === "micro-drama" || f.category === "hindi-drama")
      : FILMS.filter((f) => f.category === activeFilter);

  return (
    <>
      <div className="ambient-crimson-fog" />
      <div className="subtle-grid-bg" />

      {/* TOP HEADER */}
      <header className="site-header">
        <a href="#hero" className="flex items-center gap-3 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/mms_logo_emblem.png"
            alt="Mini Motion Studios Emblem"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105 flex-shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-cinematic text-sm font-extrabold tracking-[2px] text-white">
                MINI MOTION STUDIOS
              </span>
              <span className="hidden md:inline-flex text-[9px] font-mono-tag font-bold px-1.5 py-0.5 rounded bg-[#e50914]/20 text-[#ff2a3b] border border-[#e50914]/40">
                BY RAHUL SONI
              </span>
            </div>
            <span className="hidden sm:inline font-mono-tag text-[9px] tracking-[1.5px] text-[#5c6677]">
              AI FILMS / ANIME / STORYTELLING / VISUAL EXPERIMENTS
            </span>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="/Rahul_Soni_AI_Video_Creator_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all no-underline"
            title="Download AI Video Creator Resume"
          >
            <span>📄 Resume</span>
          </a>

          <div className="hidden md:flex items-center gap-2 bg-[rgba(15,17,24,0.8)] border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-[#94a3b8]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span>Available for Collaborations</span>
          </div>

          <button onClick={() => setIsCollabOpen(true)} className="btn-crimson">
            <span>Let&apos;s Create</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
        </div>
      </header>

      {/* LEFT DOCK NAVIGATION */}
      <nav className="vertical-dock" aria-label="Section Navigation">
        <a href="#hero" className="dock-item active" title="Home">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span>Home</span>
        </a>
        <a href="#films" className="dock-item" title="Films">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
          </svg>
          <span>Films</span>
        </a>
        <a href="#process" className="dock-item" title="Process">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Process</span>
        </a>
        <a href="#tools" className="dock-item" title="Tools">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span>Tools</span>
        </a>
        <a href="#about" className="dock-item" title="About">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>About</span>
        </a>
        <button
          onClick={() => setIsCollabOpen(true)}
          className="dock-item cursor-pointer text-left w-full"
          title="Contact"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>Contact</span>
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="main-wrapper">
        {/* HERO SECTION */}
        <section id="hero">
          <div className="hero-content">
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/mms_logo_emblem.png"
                alt="Mini Motion Studios Emblem"
                className="h-6 w-auto object-contain flex-shrink-0"
              />
              <span className="hero-category-tag mb-0">AI CREATIVE STUDIO</span>
              <span className="text-white/20">|</span>
              <span className="font-mono-tag text-[10px] tracking-[1.5px] text-[#ff2a3b] font-bold uppercase">
                DIRECTED BY RAHUL SONI
              </span>
            </div>

            <h1 className="hero-headline">
              Mini Motion
              <br />
              <span className="crimson-italic">Studios</span>
            </h1>
            <div className="hero-tagline">IMAGINATION × AI × CINEMA</div>
            <p className="hero-desc">
              Cinematic AI visual storytelling, studio-grade vertical micro-dramas (The Alpha's Fated Mate, Badnaam De Luca), and emotionally compelling anime narratives directed by <strong className="text-white font-bold underline decoration-[#ff2a3b] decoration-2 underline-offset-4">Rahul Soni</strong>.
            </p>
            <div className="hero-actions-row flex items-center gap-3 flex-wrap">
              <a href="#films" className="btn-crimson">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                <span>Explore My Films</span>
              </a>
              <a
                href="/Rahul_Soni_AI_Video_Creator_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-resume"
              >
                <span>📄 View AI Resume</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
              <button
                onClick={() => setIsCollabOpen(true)}
                className="btn-glass"
              >
                <span>📞 Contact &amp; Collab</span>
              </button>
            </div>

            {/* QUICK CHANNELS & PHONE BAR */}
            <div className="flex items-center gap-2.5 mt-5 pt-3.5 border-t border-white/10 flex-wrap">
              <span className="text-[10.5px] text-[#94a3b8] font-mono-tag uppercase tracking-wider">CHANNELS:</span>
              <a
                href="https://www.youtube.com/@minimotionstudioss"
                target="_blank"
                rel="noopener noreferrer"
                className="channel-pill-tag"
                title="Mini Motion Studios (English Channel)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a3b]"></span>
                <span>English Channel ↗</span>
              </a>
              <a
                href="https://www.youtube.com/@MiniMotionStudiosHindi"
                target="_blank"
                rel="noopener noreferrer"
                className="channel-pill-tag"
                title="Mini Motion Studios (Hindi Channel)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Hindi Channel ↗</span>
              </a>
              <a
                href="tel:+917073660571"
                className="channel-pill-tag text-white hover:text-[#ff2a3b]"
                title="Call Rahul Soni Directly"
              >
                <span>📞 +91 70736 60571</span>
              </a>
            </div>
          </div>

          <div className="hero-anime-composition">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/hero_anime_blended.png"
              alt="Anime Protagonist overlooking moonlit fortress with cinema clapperboard"
            />
          </div>
        </section>

                {/* STUDIO UNIVERSE & BRAND IDENTITY SHOWCASE */}
        <section id="studio" className="pt-14 pb-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d0f15] shadow-[0_15px_50px_rgba(0,0,0,0.85)] group">
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/mms_brand_universe.jpg"
                alt="Mini Motion Studios Official Cinema Universe & Dark Psychology Artwork"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 pointer-events-none" />

              {/* Top Studio Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                <span className="w-2 h-2 rounded-full bg-[#ff2a3b] shadow-[0_0_10px_#ff2a3b] animate-pulse"></span>
                <span className="font-mono-tag text-[10px] md:text-[11px] tracking-[1.5px] text-white font-extrabold uppercase">
                  OFFICIAL STUDIO UNIVERSE &bull; MINI MOTION STUDIOS
                </span>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between flex-wrap gap-3">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono-tag uppercase tracking-[2px] text-[#ff2a3b] font-bold">
                      THE PHILOSOPHY
                    </span>
                  </div>
                  <h3 className="font-cinematic text-lg md:text-2xl font-black text-white tracking-[2px] uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                    Stories That Stay With You
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1 hidden sm:block leading-relaxed">
                    Dark Psychology &bull; Crime &bull; Mystery &bull; Reality &bull; Human Mind &bull; High-Retention Vertical Micro-Dramas
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href="https://www.youtube.com/@minimotionstudioss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-crimson text-xs py-2 px-3.5 whitespace-nowrap"
                  >
                    <span>Visit Studio Channel</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED FILMS SECTION */}
        <section id="films" className="pt-20">
          <div className="section-header-bar">
            <div className="section-title-wrap">
              <div className="section-crimson-bar" />
              <h2 className="section-heading">Featured Films</h2>
            </div>

                        <div className="filter-tabs-capsule">
              {[
                { id: "all", label: "All Work" },
                { id: "micro-drama", label: "AI Micro-Dramas" },
                { id: "hindi-drama", label: "Hindi Micro-Drama" },
                { id: "psychology", label: "Dark Psychology" },
                { id: "anime", label: "Anime Stories" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`film-tab-btn ${
                    activeFilter === tab.id ? "active" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://www.youtube.com/@MiniMotionStudiosHindi"
                target="_blank"
                rel="noopener noreferrer"
                className="creator-link text-[#f59e0b] hover:text-white"
              >
                <span>Hindi Channel ↗</span>
              </a>
              <span className="text-white/20">|</span>
              <a
                href="https://www.youtube.com/@minimotionstudioss"
                target="_blank"
                rel="noopener noreferrer"
                className="creator-link"
              >
                <span>English Channel ↗</span>
              </a>
            </div>
          </div>

          <div className="films-grid">
            {filteredFilms.map((film) => (
              <article
                key={film.id}
                onClick={() => setSelectedFilm(film)}
                className="film-card group"
              >
                <div className="film-thumb-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={film.img} alt={film.title} loading="lazy" />
                  <div className="film-duration-badge">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    <span>{film.duration}</span>
                  </div>
                  <div className="film-play-overlay">
                    <div className="play-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
                        <polygon points="6,3 20,12 6,21" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="film-body">
                  <h3 className="film-title">{film.title}</h3>
                  <div className="film-bottom-meta">
                    <div className="film-category-meta">
                      <span className={`cat-dot ${film.dotColor}`} />
                      <span>{film.categoryLabel}</span>
                    </div>
                    <span className="text-[11px] text-[#ff2a3b] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Play ↗
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* THREE-COLUMN STUDIO DASHBOARD */}
        <div className="dashboard-trio-grid">
          {/* 1. The Creative Process */}
          <div className="dash-panel" id="process">
            <div className="dash-panel-header">
              <div className="section-crimson-bar" />
              <h3 className="dash-panel-title">The Creative Process</h3>
            </div>
            <p className="dash-panel-sub">
              From idea to cinematic reality — powered by AI.
            </p>

            <div className="process-flow-track">
              {PROCESS_STEPS.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="process-step-node">
                    <div className="process-icon-box">{step.icon}</div>
                    <span className="process-step-title whitespace-pre-line">
                      {step.title}
                    </span>
                  </div>
                  {idx < PROCESS_STEPS.length - 1 && (
                    <span className="process-arrow">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 2. Tools & Workflow */}
          <div className="dash-panel" id="tools">
            <div className="dash-panel-header">
              <div className="section-crimson-bar" />
              <h3 className="dash-panel-title">Tools &amp; Workflow</h3>
            </div>
            <p className="dash-panel-sub">
              Proprietary AI pipelines and industry post-production suites.
            </p>

            <div className="tools-grid-icons">
              {TOOLS.map((t, idx) => (
                <div key={idx} className="tool-tile">
                  <div className="tool-icon-img" style={{ color: t.color }}>{t.icon}</div>
                  <span className="tool-tile-name">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Studio Profile */}
          <div className="dash-panel" id="about">
            <div className="creator-card-content">
              <div className="creator-avatar-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/creator_rahul.png" alt="Rahul Soni" />
              </div>
              <div className="creator-info flex-1">
                <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#94a3b8] block mb-1">
                  STUDIO FOUNDER &amp; LEAD DIRECTOR
                </span>
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                  <h4 className="text-2xl font-serif-title font-extrabold text-white tracking-tight">
                    <span className="name-gradient">Rahul Soni</span>
                  </h4>
                  <span className="creator-highlight-badge">AI FILMMAKER</span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 border border-[#ff2a3b]/40 text-[10.5px] font-mono-tag text-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/mms_logo_emblem.png" alt="MMS" className="w-3.5 h-3.5 object-cover rounded-sm" />
                    <span>MINI MOTION ORIGINALS</span>
                  </div>
                </div>
                <span className="creator-title">
                  AI Filmmaker · Micro-Drama Showrunner · Lead Director
                </span>
                <p>
                  Creator and Director of studio-level vertical micro-dramas (The Alpha's Fated Mate, Badnaam De Luca) and 50+ cinematic AI productions. Specializing in character consistency, prompt direction, and high-retention episodic storytelling.
                </p>

                {/* Direct Contact & Resume links */}
                <div className="flex items-center gap-2.5 mt-3 mb-4 flex-wrap">
                  <a
                    href="tel:+917073660571"
                    className="text-xs text-white/90 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:border-[#e50914] transition-all no-underline"
                    title="Direct Phone Call"
                  >
                    <span>📞 +91 70736 60571</span>
                  </a>
                  <a
                    href="/Rahul_Soni_AI_Video_Creator_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#ff2a3b] bg-[#e50914]/10 border border-[#e50914]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#e50914]/20 transition-all font-semibold no-underline"
                    title="Download Rahul Soni AI Video Creator Resume"
                  >
                    <span>📄 AI Creator Resume (PDF) ↗</span>
                  </a>
                </div>

                <button
                  onClick={() => setIsCollabOpen(true)}
                  className="creator-link cursor-pointer bg-transparent border-none p-0"
                >
                  <span>Connect With Rahul Soni Directly</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM METRICS STRIP */}
        <div className="stats-footer-strip">
          <div className="laurel-stat-badge">
            <span className="text-xl">🏆</span>
            <span>Mini Motion Studios by Rahul Soni</span>
          </div>

          <div className="stats-items-cluster">
            <a
              href="https://www.youtube.com/@minimotionstudioss"
              target="_blank"
              rel="noopener noreferrer"
              className="stat-pill-item"
            >
              <div className="stat-pill-icon text-lg">▶</div>
              <div className="stat-pill-text">
                <span className="stat-pill-number">200+</span>
                <span className="stat-pill-label">English Channel Subs</span>
              </div>
            </a>

            <a
              href="https://www.youtube.com/@MiniMotionStudiosHindi"
              target="_blank"
              rel="noopener noreferrer"
              className="stat-pill-item"
            >
              <div className="stat-pill-icon text-lg text-amber-400">🎬</div>
              <div className="stat-pill-text">
                <span className="stat-pill-number">Hindi Studio</span>
                <span className="stat-pill-label">@MiniMotionStudiosHindi</span>
              </div>
            </a>

            <a
              href="tel:+917073660571"
              className="stat-pill-item"
              title="Call Rahul Soni"
            >
              <div className="stat-pill-icon text-lg text-emerald-400">📞</div>
              <div className="stat-pill-text">
                <span className="stat-pill-number">+91 70736 60571</span>
                <span className="stat-pill-label">Direct Contact / WhatsApp</span>
              </div>
            </a>

            <a
              href="https://instagram.com/reality._exe"
              target="_blank"
              rel="noopener noreferrer"
              className="stat-pill-item"
            >
              <div className="stat-pill-icon text-lg">📸</div>
              <div className="stat-pill-text">
                <span className="stat-pill-number">@reality._exe</span>
                <span className="stat-pill-label">Instagram Channel</span>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* VIDEO PREVIEW MODAL WITH EMBEDDED REAL PLAYABLE PLAYER */}
      {selectedFilm && (
        <div
          className="video-modal"
          onClick={() => setSelectedFilm(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="video-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="video-modal-header">
              <span className="font-serif-title text-base font-bold text-white">
                {selectedFilm.title} ({selectedFilm.duration})
              </span>
              <button
                onClick={() => setSelectedFilm(null)}
                className="bg-transparent border-none text-white cursor-pointer hover:text-[#ff2a3b] transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* REAL PLAYABLE VIDEO PLAYER */}
            <div className="video-player-frame flex items-center justify-center bg-black relative">
              {selectedFilm.videoSrc ? (
                <video
                  src={selectedFilm.videoSrc}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[60vh] object-contain bg-black"
                />
              ) : selectedFilm.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedFilm.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedFilm.title}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : null}
            </div>

            <div className="video-info-strip">
              <div>
                <span className="text-[11px] font-mono-tag text-[#ff2a3b] uppercase tracking-wider block mb-1">
                  {selectedFilm.categoryLabel}
                </span>
                <p className="text-[#94a3b8] text-[13.5px] max-w-[540px]">
                  {selectedFilm.desc}
                </p>
              </div>
              <a
                href={selectedFilm.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-crimson whitespace-nowrap"
              >
                <span>Watch on YouTube</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* COLLABORATION MODAL */}
      {isCollabOpen && (
        <div
          className="collab-modal"
          onClick={() => setIsCollabOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="collab-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCollabOpen(false)}
              className="absolute top-5 right-5 bg-transparent border-none text-white cursor-pointer hover:text-[#ff2a3b] transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="font-serif-title text-2xl font-bold text-white mb-2">
              Let&apos;s Create Cinema
            </h3>
            <p className="text-[#94a3b8] text-[13.5px] leading-relaxed mb-6">
              Connect with <strong className="text-white">Rahul Soni</strong> for AI film directing, vertical micro-drama showrunning, prompt engineering, or commercial storytelling.
            </p>

            <div className="flex flex-col gap-3">
              {/* RESUME CARD */}
              <a
                href="/Rahul_Soni_AI_Video_Creator_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#e50914]/20 via-[#e50914]/10 to-transparent border border-[#e50914]/50 rounded-xl text-white no-underline hover:border-[#ff2a3b] transition-all"
                title="Download Official AI Video Creator Resume"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#ff2a3b] font-mono-tag font-bold tracking-wider">OFFICIAL CURRICULUM VITAE</span>
                    <span className="text-sm font-bold">Rahul Soni – AI Video Creator Resume</span>
                  </div>
                </div>
                <span className="text-xs text-white bg-[#e50914] px-3 py-1.5 rounded-lg font-semibold shadow-[0_0_12px_rgba(229,9,20,0.5)]">Download PDF ↗</span>
              </a>

              {/* DIRECT CALL / WHATSAPP */}
              <a
                href="tel:+917073660571"
                className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white no-underline hover:border-[#e50914] hover:bg-[#e50914]/10 transition-all"
                title="Call or WhatsApp Rahul Soni"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#94a3b8] font-mono-tag">DIRECT PHONE / WHATSAPP</span>
                    <span className="text-sm font-semibold">+91 70736 60571</span>
                  </div>
                </div>
                <span className="text-xs text-[#ff2a3b] font-medium">Call / Chat ↗</span>
              </a>

              {/* EMAIL */}
              <a
                href="mailto:raahulsoni.2112@gmail.com?subject=Collaboration%20with%20Mini%20Motion%20Studios%20-%20Rahul%20Soni"
                className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white no-underline hover:border-[#e50914] hover:bg-[#e50914]/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">✉️</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#94a3b8] font-mono-tag">STUDIO EMAIL</span>
                    <span className="text-sm font-semibold">raahulsoni.2112@gmail.com</span>
                  </div>
                </div>
                <span className="text-xs text-[#ff2a3b] font-medium">Send Email ↗</span>
              </a>

              {/* HINDI YOUTUBE CHANNEL */}
              <a
                href="https://www.youtube.com/@MiniMotionStudiosHindi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white no-underline hover:border-[#e50914] hover:bg-[#e50914]/10 transition-all"
                title="Mini Motion Studios Hindi Channel"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎬</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-amber-400 font-mono-tag font-bold">YOUTUBE (HINDI CHANNEL)</span>
                    <span className="text-sm font-semibold">@MiniMotionStudiosHindi</span>
                  </div>
                </div>
                <span className="text-xs text-[#ff2a3b] font-medium">Subscribe ↗</span>
              </a>

              {/* ENGLISH YOUTUBE CHANNEL */}
              <a
                href="https://www.youtube.com/@minimotionstudioss"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white no-underline hover:border-[#e50914] hover:bg-[#e50914]/10 transition-all"
                title="Mini Motion Studios English Channel"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">▶</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#ff2a3b] font-mono-tag font-bold">YOUTUBE (ENGLISH CHANNEL)</span>
                    <span className="text-sm font-semibold">Mini Motion Studios (200+ Subs)</span>
                  </div>
                </div>
                <span className="text-xs text-[#ff2a3b] font-medium">Subscribe ↗</span>
              </a>

              {/* INSTAGRAM */}
              <a
                href="https://instagram.com/reality._exe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white no-underline hover:border-[#e50914] hover:bg-[#e50914]/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📸</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#94a3b8] font-mono-tag">INSTAGRAM DM</span>
                    <span className="text-sm font-semibold">@reality._exe</span>
                  </div>
                </div>
                <span className="text-xs text-[#ff2a3b] font-medium">Message ↗</span>
              </a>

              <button
                onClick={copyEmail}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 hover:bg-white/10 cursor-pointer transition-all"
              >
                <span>📋 Copy Email Address</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="copy-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </>
  );
}
