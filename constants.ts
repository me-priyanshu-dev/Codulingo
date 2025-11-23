
import { Unit, QuestionType, ShopItem, Achievement, UserStats } from "./types";

export const RANK_THRESHOLDS = [
    { name: "Newbie", minXp: 0, icon: "🥚" },
    { name: "Rookie", minXp: 100, icon: "🐣" },
    { name: "Coder", minXp: 300, icon: "💻" },
    { name: "Hacker", minXp: 600, icon: "⌨️" },
    { name: "Engineer", minXp: 1000, icon: "⚙️" },
    { name: "Master", minXp: 2000, icon: "🚀" },
    { name: "Legend", minXp: 5000, icon: "👑" }
];

export const INITIAL_STATS: UserStats = {
  name: 'Coder',
  hearts: 5,
  gems: 100,
  xp: 0,
  streak: 1,
  joinedDate: new Date().toISOString(),
  lastActiveDate: new Date().toISOString(),
  lastHeartRefill: new Date().toISOString(),
  isPro: false,
  theme: 'light',
  rank: 'Newbie',
  wagerActive: false,
  achievements: [],
  dailyQuests: []
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'heart_refill',
    name: 'Heart Refill',
    description: 'Get full health so you can keep worrying less and coding more.',
    cost: 50,
    icon: '❤️',
    effect: 'HEART_REFILL'
  },
  {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    description: 'Streak Freeze allows your streak to remain in place for one full day of inactivity.',
    cost: 200,
    icon: '❄️',
    effect: 'STREAK_FREEZE'
  },
  {
    id: 'double_wager',
    name: 'Double or Nothing',
    description: 'Double your 50 gem wager by maintaining a 7 day streak.',
    cost: 50,
    icon: '🎰',
    effect: 'WAGER'
  },
  {
    id: 'skin_dark',
    name: 'Dark Mode',
    description: 'Switch to the dark side. Good for late night coding.',
    cost: 0,
    icon: '🌙',
    effect: 'SKIN_DARK'
  },
  {
    id: 'streak_repair',
    name: 'Streak Repair',
    description: 'Missed a day? Fix your streak history.',
    cost: 300,
    icon: '🩹',
    effect: 'STREAK_REPAIR'
  },
  {
    id: 'pro_plan',
    name: 'Super Duo',
    description: 'Infinite Hearts, No Ads, and Legendary Status.',
    cost: 1000,
    icon: '🦸',
    effect: 'PRO_PLAN'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_step',
        title: 'Hello World',
        description: 'Complete the first lesson.',
        icon: '👋',
        unlocked: false,
        condition: (stats) => stats.xp >= 15
    },
    {
        id: 'wildfire',
        title: 'Wildfire',
        description: 'Reach a 3 day streak.',
        icon: '🔥',
        unlocked: false,
        condition: (stats) => stats.streak >= 3
    },
    {
        id: 'sage',
        title: 'Sage',
        description: 'Earn 100 XP.',
        icon: '🔮',
        unlocked: false,
        condition: (stats) => stats.xp >= 100
    },
    {
        id: 'big_spender',
        title: 'Big Spender',
        description: 'Spend 200 Gems in the shop.',
        icon: '💸',
        unlocked: false,
        condition: (stats) => false // Handled manually in logic
    },
    {
        id: 'strategist',
        title: 'Strategist',
        description: 'Read a Unit Guidebook.',
        icon: '📖',
        unlocked: false,
        condition: (stats) => false // Handled manually
    },
    {
        id: 'champion',
        title: 'Champion',
        description: 'Unlock the Engineer Rank.',
        icon: '🏆',
        unlocked: false,
        condition: (stats) => stats.xp >= 1000
    }
];

// COMPLETE HTML CURRICULUM A-Z
export const INITIAL_UNITS: Unit[] = [
  {
    id: 'unit_1',
    title: 'Unit 1',
    description: 'The Basics',
    guidebookContent: "Welcome to HTML! \n\nIn this unit, you'll learn that every web page is made of **Tags**. \n\nTags look like `<this>`. \nMost tags come in pairs: an opening tag `<p>` and a closing tag `</p>`.\n\nThink of them like containers!",
    color: 'green',
    levels: [
      {
        id: 'u1_l1',
        title: 'Intro to HTML',
        description: 'What is a tag?',
        icon: 'Terminal',
        isUnlocked: true,
        isCompleted: false,
        stars: 0,
        segments: [
          {
            id: 's1_1',
            type: 'EXPLANATION',
            title: 'Welcome!',
            content: "Hi! I'm **Duo-Code**. 👋\n\nI'm here to teach you **HTML**.\n\nHTML is the code that builds every website on the internet!",
            character: 'owl'
          },
          {
            id: 's1_2',
            type: 'EXPLANATION',
            title: 'Tags',
            content: "I am **Byte_Bot**. 🤖\n\n• HTML uses **tags**.\n• Tags look like this: `<button>`.\n• They tell the computer what to show.",
            character: 'robot'
          },
          {
            id: 's1_3',
            type: 'CHALLENGE',
            question: {
              id: 'q1_1',
              type: QuestionType.MULTIPLE_CHOICE,
              prompt: 'What does a tag look like?',
              options: ['(tag)', '<tag>', '{tag}'],
              correctAnswer: '<tag>',
              explanation: 'Tags always use angle brackets < >.'
            }
          },
          {
            id: 's1_4',
            type: 'EXPLANATION',
            title: 'Opening & Closing',
            content: "Tags usually come in pairs! 👯\n\n• **Start**: `<h1>`\n• **End**: `</h1>`\n• Notice the `/` in the end tag!",
            character: 'owl'
          },
          {
            id: 's1_5',
            type: 'CHALLENGE',
            question: {
                id: 'q1_2',
                type: QuestionType.FILL_BLANK,
                prompt: 'Close the heading tag.',
                codeSnippet: '<h1>My Website___',
                options: ['</h1>', '<h1/>', '>'],
                correctAnswer: '</h1>',
                explanation: 'Closing tags always start with </.'
            }
          },
          {
              id: 's1_7',
              type: 'CHALLENGE',
              question: {
                  id: 'q1_3',
                  type: QuestionType.MATCHING,
                  prompt: 'Match the elements.',
                  pairs: [
                      { id: 'm1', left: '<h1>', right: 'Heading' },
                      { id: 'm2', left: '<p>', right: 'Paragraph' },
                      { id: 'm3', left: '<button>', right: 'Button' }
                  ],
                  explanation: 'h1 is for titles, p is for text, button is for clicking.'
              }
          }
        ]
      },
      { id: 'u1_l2', title: 'Elements', description: 'Nesting and structure.', icon: 'Layers', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u1_l3', title: 'Page Body', description: 'The <body> tag.', icon: 'Layout', isUnlocked: false, isCompleted: false, stars: 0, segments: [] }
    ]
  },
  {
    id: 'unit_2',
    title: 'Unit 2',
    description: 'Text Styling',
    guidebookContent: "Make it pop! 💥\n\nIn this unit, we learn how to format text.\n\n• `<h1>` to `<h6>` are headings (Big to Small).\n• `<p>` is for normal paragraphs.\n• `<b>` makes things **bold**.\n• `<i>` makes things *italic*.",
    color: 'blue',
    levels: [
      { id: 'u2_l1', title: 'Headings', description: 'h1, h2, h3...', icon: 'Heading', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u2_l2', title: 'Paragraphs', description: 'Writing text.', icon: 'AlignLeft', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u2_l3', title: 'Style Tags', description: 'Bold and Italic.', icon: 'Bold', isUnlocked: false, isCompleted: false, stars: 0, segments: [] }
    ]
  },
  {
    id: 'unit_3',
    title: 'Unit 3',
    description: 'Links & Media',
    guidebookContent: "Connecting the web! 🌐\n\n• `<a>` stands for Anchor. It creates links.\n• It uses `href` to say WHERE to go.\n\n• `<img>` shows images.\n• It uses `src` to find the picture file.",
    color: 'red',
    levels: [
      { id: 'u3_l1', title: 'Links', description: 'The <a> tag.', icon: 'Link', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u3_l2', title: 'Images', description: 'The <img> tag.', icon: 'Image', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u3_l3', title: 'Attributes', description: 'href and src.', icon: 'Settings', isUnlocked: false, isCompleted: false, stars: 0, segments: [] }
    ]
  },
  {
    id: 'unit_4',
    title: 'Unit 4',
    description: 'Lists & Tables',
    guidebookContent: "Organizing data. \n\n• `<ul>` = Unordered List (Bullets)\n• `<ol>` = Ordered List (Numbers)\n• `<li>` = List Item\n\nTables use `<table>`, `<tr>` (row), and `<td>` (data).",
    color: 'yellow',
    levels: [
      { id: 'u4_l1', title: 'Bullet Points', description: 'Unordered Lists.', icon: 'List', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u4_l2', title: 'Numbers', description: 'Ordered Lists.', icon: 'ListOrdered', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u4_l3', title: 'Tables', description: 'Rows and Cells.', icon: 'Grid', isUnlocked: false, isCompleted: false, stars: 0, segments: [] }
    ]
  },
  {
    id: 'unit_5',
    title: 'Unit 5',
    description: 'Forms',
    guidebookContent: "Getting user input.\n\nUse the `<input>` tag!\n\nTypes include:\n• text\n• password\n• email\n• checkbox",
    color: 'teal',
    levels: [
      { id: 'u5_l1', title: 'Inputs', description: 'Typing text.', icon: 'Type', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u5_l2', title: 'Buttons', description: 'Click me!', icon: 'MousePointer', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u5_l3', title: 'Checkboxes', description: 'Yes or No?', icon: 'CheckSquare', isUnlocked: false, isCompleted: false, stars: 0, segments: [] }
    ]
  },
  {
    id: 'unit_6',
    title: 'Unit 6',
    description: 'Semantics',
    guidebookContent: "Meaningful code.\n\nInstead of just `<div>`, use tags that mean something:\n• `<header>`\n• `<main>`\n• `<footer>`\n\nThis helps accessibility and SEO!",
    color: 'purple',
    levels: [
      { id: 'u6_l1', title: 'Divs', description: 'The generic box.', icon: 'Square', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u6_l2', title: 'Layout', description: 'Header and Footer.', icon: 'LayoutTemplate', isUnlocked: false, isCompleted: false, stars: 0, segments: [] },
      { id: 'u6_l3', title: 'Nav', description: 'Navigation bars.', icon: 'Compass', isUnlocked: false, isCompleted: false, stars: 0, segments: [] }
    ]
  }
];
