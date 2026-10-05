import { Channel, Character, Project, CalendarEvent, RecentActivity, StudioAnalytics, Script, Asset } from '../types';

export const channels: Channel[] = [
  {
    id: 'mms_hindi',
    name: 'MINI MOTION STUDIOS HINDI',
    subtitle: 'द डार्क साइकोलॉजी • हिंदी',
    language: 'Hindi',
    subscribers: '352K',
    subscriberCount: 352000,
    totalVideos: 26,
    totalViews: '1.26M',
    viewsCount: 1260000,
    watchTime: '242.5K hrs',
    ctr: '8.72%',
    avgRetention: '64.3%',
    sparkline: [25, 38, 30, 48, 42, 60, 52, 70, 65, 82, 78, 95]
  },
  {
    id: 'mms_english',
    name: 'MINI MOTION STUDIOS',
    subtitle: 'DARK PSYCHOLOGY • ENGLISH',
    language: 'English',
    subscribers: '189K',
    subscriberCount: 189000,
    totalVideos: 18,
    totalViews: '840K',
    viewsCount: 840000,
    watchTime: '168.2K hrs',
    ctr: '7.94%',
    avgRetention: '59.8%',
    sparkline: [18, 24, 29, 35, 32, 45, 41, 55, 52, 64, 59, 72]
  }
];

export const characters: Character[] = [
  {
    id: 'peter',
    name: 'PETER',
    role: 'Protagonist',
    tagline: 'Struggling writer who unlocks limitless cognitive potential',
    avatar: '/assets/cast_peter.png',
    projectsCount: 24,
    bio: '25 years old. A struggling writer who discovers NZT-48 and unlocks his true potential, changing his life forever. Evolves from an exhausted, overwhelmed creator into a calm, hyper-perceptive master of psychology.',
    archetype: 'The NZT Awakened Prodigy',
    vocalProfile: 'Low, measured, slightly raspy cinematic baritone with intense focus and clarity',
    appearancePrompt: 'Cinematic anime portrait of a sharp 25yo male with messy dark hair, intense focused eyes, dark unbuttoned shirt against moody lighting, 8k anime art style',
    keyQuotes: [
      'They didn\'t ignore me because I was weak. They ignored me because I was available.',
      'I had to disappear so I could see who was actually looking for me.',
      'The moment you stop explaining yourself, they start respecting your silence.'
    ]
  },
  {
    id: 'lily',
    name: 'LILY',
    role: "Peter's Girlfriend",
    tagline: 'Kind, supportive and warm-hearted emotional anchor',
    avatar: '/assets/cast_lily.png',
    projectsCount: 18,
    bio: 'Early 20\'s. Kind, supportive and warm-hearted. Stands by Peter through his journey, even when everything changes and the world tries to pull them apart.',
    archetype: 'The Loyal Anchor / The Emotional Truth',
    vocalProfile: 'Soft, empathetic, expressive soprano with authentic warmth',
    appearancePrompt: 'Delicate cinematic anime portrait of a 22yo young woman with honey-brown hair in a gentle ponytail, warm casual jacket, tender empathetic gaze, golden hour lighting',
    keyQuotes: [
      'You think building walls keeps you safe, but it just keeps everyone out.',
      'Sometimes silence isn\'t wisdom, Peter. It\'s just fear dressed up as strength.'
    ]
  },
  {
    id: 'elias',
    name: 'DR. ELIAS',
    role: 'Behavioral Scientist / Narrator',
    tagline: 'Studies NZT-48 and the hidden architecture of the human mind',
    avatar: '/assets/cast_elias.png',
    projectsCount: 31,
    bio: 'Early 40\'s. Studies NZT-48 and its effects on the human mind. He becomes a key guide and observer in Peter\'s transformation, delivering philosophical gravitas and stoic mastery.',
    archetype: 'The Stoic Mentor / Shadow Analyst',
    vocalProfile: 'Authoritative, calm, measured British-tinged academic cadence with deliberate pauses',
    appearancePrompt: 'Distinguished behavioral scientist in tailored brown waistcoat, white dress shirt, wire-rim glasses, salt-and-pepper hair, warm library study ambiance, cinematic photography',
    keyQuotes: [
      'The mind is the most powerful weapon. Once calibrated, nothing external can shake it.',
      'When someone shows you indifference, observe your own reaction. That is where the lesson lies.',
      'To be reborn, you must first agree to be forgotten.'
    ]
  },
  {
    id: 'marcus',
    name: 'MARCUS',
    role: 'Institutional Guard',
    tagline: 'Strict, disciplined enforcer of facility order',
    avatar: '/assets/cast_marcus.png',
    projectsCount: 15,
    bio: 'Late 30\'s. Strict and disciplined. Enforces the rules of the facility and keeps a close watch on all subjects undergoing cognitive experiments.',
    archetype: 'The Iron Enforcer / Institutional Sentinel',
    vocalProfile: 'Deep, gravelly, commanding military baritone',
    appearancePrompt: 'Imposing late 30s military guard in olive drab tactical dress uniform with chevron patches, crossed arms, combat boots, stern angular jawline, dramatic rim lighting',
    keyQuotes: [
      'Discipline is the only thing standing between power and total chaos.',
      'In this facility, nobody leaves until the protocol is satisfied.'
    ]
  },
  {
    id: 'thomas',
    name: 'THOMAS STRAND',
    role: 'Rival / Antagonist',
    tagline: 'Jealous and manipulative colleague threatening Peter\'s rise',
    avatar: '/assets/cast_thomas.png',
    projectsCount: 12,
    bio: 'Mid 30\'s. Jealous and manipulative colleague who threatens Peter\'s rise to power. Master of social triangulation and passive aggression.',
    archetype: 'The Opportunistic Machiavellian',
    vocalProfile: 'Sharp, condescending, fast-paced corporate conversational tone',
    appearancePrompt: 'Sharp mid-30s corporate executive in charcoal suit, slicked hair, skeptical gaze, modern corporate boardroom background',
    keyQuotes: [
      'Everyone wants you to do well, just never better than them.',
      'In this game, if you aren\'t visible, you simply don\'t exist.'
    ]
  },
  {
    id: 'jenny',
    name: 'JENNY BRENNER',
    role: 'Corporate Executive',
    tagline: 'Smart, calculative and always three steps ahead',
    avatar: '/assets/cast_jenny.png',
    projectsCount: 14,
    bio: 'Early 30\'s. Smart, calculative and always three steps ahead. Works closely with Carl Van Loon to leverage cognitive breakthroughs for corporate dominance.',
    archetype: 'The Strategic Architect',
    vocalProfile: 'Precise, elegant, articulate alto with icy confidence',
    appearancePrompt: 'Elegant 30yo corporate executive woman with dark wavy hair, tailored navy blazer and silk blouse, analytical confident gaze',
    keyQuotes: [
      'Emotions are variables. Control the variables, control the outcome.'
    ]
  },
  {
    id: 'carl',
    name: 'CARL VAN LOON',
    role: 'Business Tycoon',
    tagline: 'Ambitious CEO who sees Peter as a tool for limitless success',
    avatar: '/assets/cast_carl.png',
    projectsCount: 10,
    bio: 'Late 50\'s. Ambitious CEO who sees Peter\'s potential as a tool for limitless success. Powerful, commanding, and unapologetic.',
    archetype: 'The Apex Titan',
    vocalProfile: 'Resonant, booming, raspy veteran executive tone',
    appearancePrompt: 'Distinguished 58yo tycoon with combed silver hair, tailored bespoke three-piece suit, high-rise penthouse office',
    keyQuotes: [
      'A gift like yours only matters if you have the stomach to deploy it.'
    ]
  }
];

export const projects: Project[] = [
  {
    id: 'disappear',
    title: 'Disappear. Rebuild. Return.',
    subtitle: 'Self Development • 9-12 Min',
    status: 'IN PRODUCTION',
    channelId: 'mms_hindi',
    progress: 78,
    scenesCompleted: 7,
    totalScenes: 9,
    visualsCount: 12,
    thumbnailCount: 1,
    scriptCount: 1,
    pipelineStage: 'VOICEOVER',
    coverImage: '/assets/project_disappear.png',
    characters: ['peter', 'elias'],
    theme: 'Dark Psychology • Self Transformation',
    runtime: '10:45',
    releaseDate: '2026-05-28',
    description: 'A deep psychological breakdown of why voluntary isolation and deliberate self-reconstruction yields more respect and internal mastery than begging for external validation.',
    readyForEditFrames: [
      '/assets/storyboard_1.png',
      '/assets/storyboard_2.png',
      '/assets/storyboard_3.png',
      '/assets/storyboard_4.png'
    ]
  },
  {
    id: 'chase',
    title: 'Why We Chase People Who Ignore Us',
    subtitle: 'Dark Psychology • 11 Min',
    status: 'IN PRODUCTION',
    channelId: 'mms_hindi',
    progress: 86,
    scenesCompleted: 8,
    totalScenes: 10,
    visualsCount: 15,
    thumbnailCount: 2,
    scriptCount: 1,
    pipelineStage: 'EDIT',
    coverImage: '/assets/project_chase.png',
    characters: ['peter', 'lily'],
    theme: 'Attachment Theory • Rejection Anxiety',
    runtime: '11:20',
    description: 'Exploring the dopamine loop behind intermittent reinforcement and why indifference triggers obsession in hyper-empathic individuals.'
  },
  {
    id: 'phone',
    title: "Your Phone Isn't Listening... It's Predicting",
    subtitle: 'Digital Psychology • 10 Min',
    status: 'SCRIPT READY',
    channelId: 'mms_hindi',
    progress: 63,
    scenesCompleted: 4,
    totalScenes: 8,
    visualsCount: 9,
    thumbnailCount: 1,
    scriptCount: 1,
    pipelineStage: 'SCRIPT',
    coverImage: '/assets/project_phone.png',
    characters: ['peter', 'thomas'],
    theme: 'Surveillance Capitalism • Behavioral Analytics',
    runtime: '09:50',
    description: 'The algorithmic architecture of predictive behavior models and how our micro-hesitations are sold to the highest bidder.'
  },
  {
    id: 'fault',
    title: "It's Not Your Fault",
    subtitle: 'Healing & Trauma • 12 Min',
    status: 'EDITING',
    channelId: 'mms_hindi',
    progress: 71,
    scenesCompleted: 6,
    totalScenes: 9,
    visualsCount: 11,
    thumbnailCount: 2,
    scriptCount: 1,
    pipelineStage: 'EDIT',
    coverImage: '/assets/project_fault.png',
    characters: ['lily', 'elias'],
    theme: 'Trauma Bonding • Guilt Deconstruction',
    runtime: '12:15',
    description: 'Unraveling the deep psychological knot of phantom guilt and learned helplessness carried from childhood relationship dynamics.'
  },
  {
    id: 'silence',
    title: 'Silence Is Power',
    subtitle: 'Power Dynamics • 8 Min',
    status: 'READY TO PUBLISH',
    channelId: 'mms_hindi',
    progress: 95,
    scenesCompleted: 9,
    totalScenes: 9,
    visualsCount: 14,
    thumbnailCount: 3,
    scriptCount: 1,
    pipelineStage: 'THUMBNAIL',
    coverImage: '/assets/project_silence.png',
    characters: ['peter', 'elias'],
    theme: 'Conversational Dominance • High Status',
    runtime: '08:30',
    description: 'Why high-value communicators speak 40% less and how pausing creates psychological pressure in negotiations and conflicts.'
  },
  {
    id: 'friends',
    title: 'Fake Friends Reveal Themselves In Success',
    subtitle: 'Social Dynamics • 10 Min',
    status: 'EDITING',
    channelId: 'mms_hindi',
    progress: 48,
    scenesCompleted: 4,
    totalScenes: 8,
    visualsCount: 8,
    thumbnailCount: 1,
    scriptCount: 1,
    pipelineStage: 'CHARACTERS',
    coverImage: '/assets/project_friends.png',
    characters: ['peter', 'thomas'],
    theme: 'Envy Dynamics • Social Triangulation',
    runtime: '10:05',
    description: 'Detecting passive-aggressive micro-expressions, backhanded compliments, and silent resentment when you cross social thresholds.'
  }
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Scene 05 - Voiceover',
    date: '2026-05-24',
    time: '2:30 PM',
    type: 'Production',
    channelId: 'mms_hindi',
    completed: true
  },
  {
    id: 'evt-2',
    title: 'Thumbnail - Disappear. Rebuild. Return.',
    date: '2026-05-24',
    time: '5:00 PM',
    type: 'Thumbnail',
    channelId: 'mms_hindi',
    completed: false
  },
  {
    id: 'evt-3',
    title: 'Script Review - Fake Friends Reveal...',
    date: '2026-05-24',
    time: '7:00 PM',
    type: 'Script',
    channelId: 'mms_hindi',
    completed: false
  },
  {
    id: 'evt-4',
    title: 'Audio Master & Sound Design - Disappear',
    date: '2026-05-26',
    time: '3:00 PM',
    type: 'Edit',
    channelId: 'mms_hindi',
    completed: false
  },
  {
    id: 'evt-5',
    title: 'Premiere - Disappear. Rebuild. Return.',
    date: '2026-05-28',
    time: '6:30 PM',
    type: 'Release',
    channelId: 'mms_hindi',
    completed: false
  }
];

export const recentActivities: RecentActivity[] = [
  {
    id: 'act-1',
    type: 'Script',
    title: 'Script updated for "It\'s Not Your Fault"',
    project: "It's Not Your Fault",
    timeAgo: '2 minutes ago'
  },
  {
    id: 'act-2',
    type: 'Thumbnail',
    title: 'Thumbnail approved for "Silence Is Power"',
    project: 'Silence Is Power',
    timeAgo: '15 minutes ago'
  },
  {
    id: 'act-3',
    type: 'Production',
    title: 'Scene 06 completed for "Disappear. Rebuild. Return."',
    project: 'Disappear. Rebuild. Return.',
    timeAgo: '32 minutes ago'
  },
  {
    id: 'act-4',
    type: 'Published',
    title: 'Video published: "Why We Chase People Who Ignore Us"',
    project: 'Why We Chase People Who Ignore Us',
    timeAgo: '1 day ago'
  }
];

export const studioAnalytics: StudioAnalytics = {
  views: '1.26M',
  viewsChange: '+18.5%',
  viewsPositive: true,
  watchTime: '242.5K hrs',
  watchTimeChange: '+14.2%',
  watchTimePositive: true,
  ctr: '8.72%',
  ctrChange: '+6.1%',
  ctrPositive: true,
  avgRetention: '64.3%',
  retentionChange: '+8.4%',
  retentionPositive: true,
  subscribers: '+18.7K',
  subscribersChange: '+12.9%',
  subscribersPositive: true,
  publishedVideos: 23,
  publishedVideosChange: '+21.0%',
  publishedVideosPositive: true,
  activeProjects: 12,
  chartData: [
    { date: '1 May', views: 32000, watchTime: 6200 },
    { date: '5 May', views: 48000, watchTime: 9100 },
    { date: '8 May', views: 41000, watchTime: 7800 },
    { date: '12 May', views: 67000, watchTime: 12400 },
    { date: '15 May', views: 55000, watchTime: 10800 },
    { date: '19 May', views: 79000, watchTime: 15300 },
    { date: '22 May', views: 72000, watchTime: 13900 },
    { date: '26 May', views: 98000, watchTime: 19100 },
    { date: '29 May', views: 112000, watchTime: 22400 }
  ]
};

export const sampleScript: Script = {
  id: 'scr-disappear',
  projectId: 'disappear',
  projectTitle: 'Disappear. Rebuild. Return.',
  channelId: 'mms_hindi',
  status: 'In Production',
  wordCount: 2150,
  estimatedDuration: '10:45',
  lastModified: 'Today at 4:15 PM',
  scenes: [
    {
      id: 'sc-1',
      sceneNumber: 1,
      heading: 'SCENE 01: THE CITY AT TWILIGHT - SILENT REJECTION',
      character: 'DR. ELIAS',
      dialogue: 'We spend our youth believing that if we scream loud enough, the world will finally notice our existence. But psychology teaches us the cruelest paradox: the more desperately you chase recognition, the less valuable your presence becomes.',
      visualPrompt: 'Wide panoramic sunset over dystopian cityscape. Dark-haired young man in dark hoodie stands alone at rooftop railing, neon lights beginning to flicker.',
      audioCues: 'Low cinematic sub-bass drone, faint distant siren, ambient wind flutter.',
      durationSec: 35,
      status: 'approved'
    },
    {
      id: 'sc-2',
      sceneNumber: 2,
      heading: 'SCENE 02: THE PHONE SCREEN - THE INTERMITTENT LOOP',
      character: 'PETER',
      dialogue: 'Every notification felt like oxygen. And when they stopped coming, I suffocated in my own silence. I realized they didn\'t cut me off because they hated me... they cut me off because they knew I would always wait.',
      visualPrompt: 'Extreme close up on smartphone lock screen illuminated in dark bedroom. Zero incoming messages. Peter\'s reflection in black glass.',
      audioCues: 'Ticking clock Foley, muted heartbeat, sudden telephone disconnect beep.',
      durationSec: 42,
      status: 'approved'
    },
    {
      id: 'sc-3',
      sceneNumber: 3,
      heading: 'SCENE 03: THE DECISION - THE MONK PROTOCOL',
      character: 'DR. ELIAS',
      dialogue: 'To be reborn, you must first agree to be forgotten. The modern ego cannot bear 30 days without external feedback. But if you survive the withdrawal of attention, you reclaim the one thing society took from you: sovereignty.',
      visualPrompt: 'Peter deleting apps, packing a minimalist black duffel bag, walking out into rainy city night with steady, deliberate steps.',
      audioCues: 'Deep orchestral cello swell, heavy rain on asphalt, clean acoustic guitar motif.',
      durationSec: 50,
      status: 'approved'
    },
    {
      id: 'sc-4',
      sceneNumber: 4,
      heading: 'SCENE 04: THE LAB - SHADOW ARCHITECTURE',
      character: 'DR. ELIAS',
      dialogue: 'Phase two of the rebuild is not physical; it is cognitive calibration. You must dismantle the internal narrative that relies on other people\'s approval to measure your self-worth.',
      visualPrompt: 'Dark study room filled with psychology journals, handwritten whiteboard diagrams of cognitive biases, dim warm desk lamp.',
      audioCues: 'Pencil scratching on paper, mechanical metronome cadence.',
      durationSec: 48,
      status: 'approved'
    },
    {
      id: 'sc-5',
      sceneNumber: 5,
      heading: 'SCENE 05: THE VOICEOVER REVELATION - THE POWER OF ABSENCE',
      character: 'PETER',
      dialogue: 'I stopped texting back. I stopped posting updates. At first, they thought I was angry. Then they thought I failed. But true silence is neither anger nor failure. It is the quiet construction of an unstoppable force.',
      visualPrompt: 'Peter training in an empty dimly lit gym before sunrise, cold breath condensing in morning air, silhouette against dawn light.',
      audioCues: 'Rhythmic heavy breathing, iron barbell clank, rising atmospheric synth pad.',
      durationSec: 55,
      status: 'pending'
    }
  ]
};

export const assetLibraryItems: Asset[] = [
  {
    id: 'ast-guide-elias',
    name: 'Dr_Elias_Character_Style_Guide_Full.jpg',
    type: 'image',
    size: '1.4 MB',
    url: '/assets/elias_style_guide.jpg',
    category: 'Style Guides',
    dateAdded: '2026-10-06'
  },
  {
    id: 'ast-guide-boss',
    name: 'The_Boss_Turnaround_Expressions_Sheet.jpg',
    type: 'image',
    size: '1.2 MB',
    url: '/assets/boss_style_guide.jpg',
    category: 'Style Guides',
    dateAdded: '2026-10-06'
  },
  {
    id: 'ast-master-roster',
    name: 'Master_Character_Roster_NZT48.jpg',
    type: 'image',
    size: '1.8 MB',
    url: '/assets/master_character_roster.jpg',
    category: 'Character Art',
    dateAdded: '2026-10-06'
  },
  {
    id: 'ast-peter-full',
    name: 'Peter_Pre_Transformation_FullBody.jpg',
    type: 'image',
    size: '950 KB',
    url: '/assets/peter_fullbody.jpg',
    category: 'Character Art',
    dateAdded: '2026-10-06'
  },
  {
    id: 'ast-marcus-full',
    name: 'Marcus_Guard_Tactical_FullBody.jpg',
    type: 'image',
    size: '1.1 MB',
    url: '/assets/marcus_fullbody.jpg',
    category: 'Character Art',
    dateAdded: '2026-10-06'
  },
  {
    id: 'ast-1',
    name: 'Disappear_Rebuild_Hero_4K.png',
    type: 'image',
    size: '18.4 MB',
    url: '/assets/hero_banner_full.png',
    category: 'Key Art',
    dateAdded: '2026-05-20'
  },
  {
    id: 'ast-2',
    name: 'Peter_Character_Sheet_V3.png',
    type: 'image',
    size: '12.1 MB',
    url: '/assets/cast_peter.png',
    category: 'Character Art',
    dateAdded: '2026-05-18'
  },
  {
    id: 'ast-3',
    name: 'Dr_Elias_Golf_Reference.png',
    type: 'image',
    size: '14.8 MB',
    url: '/assets/cast_elias.png',
    category: 'Character Art',
    dateAdded: '2026-05-18'
  },
  {
    id: 'ast-4',
    name: 'Storyboard_Sequence_01_04.png',
    type: 'image',
    size: '8.6 MB',
    url: '/assets/storyboard_1.png',
    category: 'Storyboards',
    dateAdded: '2026-05-22'
  },
  {
    id: 'ast-5',
    name: 'Dark_Psychology_Theme_Orchestral.wav',
    type: 'audio',
    size: '42.8 MB',
    url: '#',
    category: 'Soundtrack',
    dateAdded: '2026-05-19'
  },
  {
    id: 'ast-6',
    name: 'Elias_Voiceover_Take_05.wav',
    type: 'audio',
    size: '22.3 MB',
    url: '#',
    category: 'Voiceover',
    dateAdded: '2026-05-23'
  }
];
