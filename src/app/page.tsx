"use client";

import React, { useState } from "react";

interface FilmProject {
  id: string;
  youtubeId?: string;
  videoSrc?: string;
  title: string;
  category: "psychology" | "anime" | "experiments" | "commercial";
  categoryLabel: string;
  dotColor: "red" | "gold" | "purple" | "blue";
  duration: string;
  desc: string;
  img: string;
  watchUrl: string;
}

const FILMS: FilmProject[] = [
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
    id: "attractive-struggle",
    title: "The Hidden Struggle of Being Too Attractive",
    category: "psychology",
    categoryLabel: "Social Dynamics & Halo Effect",
    dotColor: "purple",
    duration: "00:54",
    desc: "The psychological isolation behind extreme visual appeal. Exploring the halo effect, projected insecurities from peers, and how genuine connection gets masked by superficial perception.",
    img: "/assets/real_thumbs/card_attractive.jpg",
    videoSrc: "/videos/attractive_struggle.mp4",
    watchUrl: "https://www.youtube.com/@minimotionstudioss",
  },
  {
    id: "success-losing",
    title: "Why Success Felt Like Losing Myself",
    category: "anime",
    categoryLabel: "Cinematic Anime Story",
    dotColor: "gold",
    duration: "00:56",
    desc: "A cinematic anime story about relentless ambition, the cost of personal identity, and the haunting hollow silence waiting at the peak of victory.",
    img: "/assets/real_thumbs/card_success.jpg",
    videoSrc: "/videos/success_losing_myself.mp4",
    watchUrl: "https://www.youtube.com/@minimotionstudioss",
  },
  {
    id: "stranger-secret",
    title: "I Made a Stranger Tell Me Their Deepest Secret",
    category: "experiments",
    categoryLabel: "Psychological Rapport Experiment",
    dotColor: "blue",
    duration: "00:55",
    desc: "The vulnerability loop in social psychology. How calibrated silence, active micro-listening, and mirrored honesty break emotional guards in minutes.",
    img: "/assets/real_thumbs/card_stranger.jpg",
    videoSrc: "/videos/stranger_secret.mp4",
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
  {
    id: "rival-crumbles",
    youtubeId: "kDHCSV1El3A",
    title: "The Architect: I Destroyed a Corporate Rival – Then Regretted It",
    category: "commercial",
    categoryLabel: "Flagship AI Series (The Architect)",
    dotColor: "red",
    duration: "03:42",
    desc: "A flagship cinematic production exploring corporate power dynamics, ruthless tactical retaliation, and the heavy psychological void left when victory arrives.",
    img: "/assets/real_thumbs/kDHCSV1El3A.jpg",
    watchUrl: "https://www.youtube.com/watch?v=kDHCSV1El3A",
  },
  {
    id: "dont-explain",
    youtubeId: "8OvyByu0VKU",
    title: "Why Powerful People Stop Explaining Themselves",
    category: "experiments",
    categoryLabel: "Tactical Presence Experiment",
    dotColor: "blue",
    duration: "00:54",
    desc: "The psychological science of tactical silence. Why high-status individuals state facts, embrace discomfort, and never justify their decisions to the room.",
    img: "/assets/real_thumbs/8OvyByu0VKU.jpg",
    watchUrl: "https://www.youtube.com/shorts/8OvyByu0VKU",
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
  { name: "Google Flow", icon: "FD" },
  { name: "ChatGPT", icon: "🧠" },
  { name: "Gemini", icon: "✦" },
  { name: "Claude", icon: "☀️" },
  { name: "ElevenLabs", icon: "II" },
  { name: "DaVinci", icon: "⚙️" },
  { name: "CapCut", icon: "✂️" },
  { name: "Photoshop", icon: "Ps" },
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
      : FILMS.filter((f) => f.category === activeFilter);

  return (
    <>
      <div className="ambient-crimson-fog" />
      <div className="subtle-grid-bg" />

      {/* TOP HEADER */}
      <header className="site-header">
        <a href="#hero" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-full bg-[#e50914] flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.6)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-cinematic text-sm font-extrabold tracking-[2px] text-white">
              MINI MOTION STUDIOS
            </span>
            <span className="hidden sm:inline font-mono-tag text-[9px] tracking-[1.5px] text-[#5c6677]">
              AI FILMS / ANIME / STORYTELLING / VISUAL EXPERIMENTS
            </span>
          </div>
        </a>

        <div className="flex items-center gap-3">
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
            <span className="hero-category-tag">AI CREATIVE STUDIO</span>
            <h1 className="hero-headline">
              Mini Motion
              <br />
              <span className="crimson-italic">Studios</span>
            </h1>
            <div className="hero-tagline">IMAGINATION × AI × CINEMA</div>
            <p className="hero-desc">
              A creative studio by Rahul Soni exploring AI-powered cinematic
              visuals, anime storytelling, dark psychology, and emotionally
              compelling narratives.
            </p>
            <div className="hero-actions-row">
              <a href="#films" className="btn-crimson">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                <span>Explore My Films</span>
              </a>
              <a href="#process" className="btn-glass">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>See the Process</span>
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
                { id: "psychology", label: "Dark Psychology" },
                { id: "anime", label: "Anime Stories" },
                { id: "experiments", label: "AI Experiments" },
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

            <a
              href="https://www.youtube.com/@minimotionstudioss"
              target="_blank"
              rel="noopener noreferrer"
              className="creator-link"
            >
              <span>Visit English Channel</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
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
                  <div className="tool-icon-img">{t.icon}</div>
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
                  STUDIO BY
                </span>
                <h4 className="text-xl font-serif-title font-bold text-white mb-1">
                  Rahul Soni
                </h4>
                <span className="creator-title">
                  AI Video Creator · Storyteller · Editor
                </span>
                <p>
                  I create AI-powered cinematic stories, anime narratives, and
                  thought-provoking visuals that explore human psychology,
                  power, and behavior.
                </p>
                <button
                  onClick={() => setIsCollabOpen(true)}
                  className="creator-link cursor-pointer bg-transparent border-none p-0"
                >
                  <span>Know More About Me</span>
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
            <span>AI Storytelling &amp; Visual Experiments</span>
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
                <span className="stat-pill-label">YouTube Subscribers</span>
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

            <div className="stat-pill-item">
              <div className="stat-pill-icon text-lg">🎬</div>
              <div className="stat-pill-text">
                <span className="stat-pill-number">50+</span>
                <span className="stat-pill-label">Video Projects</span>
              </div>
            </div>

            <div className="stat-pill-item">
              <div className="stat-pill-icon text-lg">📚</div>
              <div className="stat-pill-text">
                <span className="stat-pill-number">4+</span>
                <span className="stat-pill-label">Content Series</span>
              </div>
            </div>
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
              Have a commercial project, dark psychology anime series, or AI video campaign in mind? Reach out directly.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="mailto:raahulsoni.2112@gmail.com?subject=Collaboration%20with%20Mini%20Motion%20Studios"
                className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white no-underline hover:border-[#e50914] hover:bg-[#e50914]/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">✉️</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#94a3b8] font-mono-tag">EMAIL</span>
                    <span className="text-sm font-semibold">raahulsoni.2112@gmail.com</span>
                  </div>
                </div>
                <span className="text-xs text-[#ff2a3b] font-medium">Send Email ↗</span>
              </a>

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

              <a
                href="https://www.youtube.com/@minimotionstudioss"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white no-underline hover:border-[#e50914] hover:bg-[#e50914]/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">▶</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#94a3b8] font-mono-tag">YOUTUBE (ENGLISH)</span>
                    <span className="text-sm font-semibold">Mini Motion Studios</span>
                  </div>
                </div>
                <span className="text-xs text-[#ff2a3b] font-medium">Subscribe ↗</span>
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
