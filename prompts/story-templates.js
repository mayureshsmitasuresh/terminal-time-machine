export const introTemplates = [
  "It began on {date}. A new repository was initialized, and with it, a new journey.",
  "The story starts on {date}. The first lines of code were written, laying the foundation for what was to come.",
  "On {date}, the screen flickered to life. A project was born."
];

export const chapterTitles = {
  feat: ["The Era of Expansion", "Building Blocks", "New Horizons", "Feature Frenzy"],
  fix: ["The Great Clean-up", "Squashing Bugs", "Stability First", "The Refinement"],
  refactor: ["Restructuring the Core", "Paying Technical Debt", "Architectural Shift", "Polishing the Gem"],
  mixed: ["Steady Progress", "The Grind", "Ebb and Flow", "Moving Forward"]
};

export const moodDescriptors = {
  high_activity: "It was a time of frantic activity.",
  low_activity: "Things were quiet for a while.",
  consistent: "Progress continued at a steady pace.",
  collaborative: "The team was firing on all cylinders."
};

export const milestoneTemplates = {
  inception: "The project sparked into existence.",
  release: "And thus, version {title} was released to the world.",
  refactor: "The code underwent a massive transformation.",
  contributor: "A new challenger approached! {name} made their first contribution."
};

export function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
