export const introTemplates = [
  "It began on {date}. A new repository was initialized, and with it, a new journey.",
  "The story starts on {date}. The first lines of code were written, laying the foundation for what was to come.",
  "On {date}, the screen flickered to life. A project was born.",
  "The history books open on {date}, marking the inception of this codebase.",
  "{date}: Use this date as your anchor. This is when the first commit was pushed, and the idea became code.",
  "Every great project starts somewhere. For this one, it was {date}.",
  "In the beginning ({date}), there was an empty folder. Then, `git init` ran, and the rest is history.",
  "The earliest record dates back to {date}. Let's trace the path from there.",
  "Fast forward from {date}, the day this repository took its first breath."
];

export const chapterTitles = {
  feat: [
    "The Era of Expansion", "Building Blocks", "New Horizons", "Feature Frenzy",
    "Innovation Spree", "Functionality Explosion", "The Builder's Age", "Rapid Development"
  ],
  fix: [
    "The Great Clean-up", "Squashing Bugs", "Stability First", "The Refinement",
    "Patchwork Phase", "Hardening the Core", "Bug Hunt", "Reliability Focus"
  ],
  refactor: [
    "Restructuring the Core", "Paying Technical Debt", "Architectural Shift", "Polishing the Gem",
    "Code Makeover", "Under the Hood", "Optimization Sprint", "Structural Integrity"
  ],
  docs: [
    "Writing the Manual", "Documenting the Journey", "The Scribe's Work", "Clarity & Context",
    "Knowledge Transfer", "Readme Revamp"
  ],
  chore: [
    "Housekeeping", "Keeping the Lights On", "Maintenance Mode", "Behind the Scenes",
    "Dependency Dance", "Config Tweaks"
  ],
  mixed: [
    "Steady Progress", "The Grind", "Ebb and Flow", "Moving Forward",
    "A Bit of Everything", "Balanced Iteration", "The Daily Rhythm"
  ]
};

export const moodDescriptors = {
  high_impact: [
    "It was a pivotal month. The changes made here would define the project's trajectory.",
    "Major strides were taken. The codebase evolved significantly.",
    "This period saw foundational shifts that echoed through the history.",
    "High-impact work dominated the timeline."
  ],
  high_activity: [
    "It was a time of frantic activity. Commits were flying in.",
    "The keyboard clatter was deafening. Activity levels were at an all-time high.",
    "A surge of productivity. The commit graph spiked.",
    "Development accelerated. The pace was relentless."
  ],
  low_activity: [
    "Things were quiet for a while. Perhaps a time of planning?",
    "A lull in the action. The calm before the next storm.",
    "Activity slowed down. Maintenance mode engaged.",
    "A peaceful month with sporadic updates."
  ],
  consistent: [
    "Progress continued at a steady, reliable pace.",
    "The team found their rhythm. One commit after another.",
    "Development marched on. Nothing flashy, just good work.",
    "A standard month of shipping code."
  ],
  collaborative: [
    "Collaboration was key. Multiple authors pushed code together.",
    "The team was firing on all cylinders, merging PRs left and right.",
    "A true group effort. The contributor list grew.",
    "This was a team sport. Everyone chipped in."
  ]
};

export const milestoneTemplates = {
  inception: "The project sparked into existence.",
  release: "And thus, version {title} was released to the world.",
  refactor: "The code underwent a massive transformation with {title}.",
  contributor: "A new adventurer, **{name}**, joined the party!",
  hotfix: "A critical fix was deployed. Crisis averted.",
  merge_spree: "A wave of branches were merged back into the mainline."
};

export const contributorBiographies = {
  hero: [
    "**{name}** emerged as a key player, leading the charge with {count} commits.",
    "The MVP for this chapter was undoubtedly **{name}**, who pushed {count} updates.",
    "**{name}** was on fire, contributing significantly to the codebase.",
    "Spearheading the effort this month was **{name}**."
  ],
  newcomer: [
    "A new face appeared: **{name}** made their first commit.",
    "The team grew as **{name}** joined the fray.",
    "Welcome to **{name}**, who started contributing during this period."
  ]
};

export const epilogues = [
  "The journey continues. With {count} commits behind us, the future remains unwritten.",
  "As the latest commit settles, the repository stands ready for what's next.",
  "This is where we stand today. {count} steps taken, many more to go.",
  "The story pauses here, but the code effectively lives on forever.",
  "End of log. But certainly not the end of the road for this project."
];

export const transitions = [
  "Moving on to the next chapter...",
  "As the calendar turned, focus shifted.",
  "With that phase complete, new challenges arose.",
  "The momentum carried into the next month.",
  "However, the work was far from over.",
  "But software is never truly finished.",
  "The story unfolds further in the following weeks."
];

export function getRandom(array) {
  if (!array || array.length === 0) return "";
  return array[Math.floor(Math.random() * array.length)];
}
