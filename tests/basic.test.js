import assert from 'assert';
import { analyzeCommits } from '../src/analyzers/commit-analyzer.js';
import { detectMilestones } from '../src/analyzers/milestone-detector.js';

// Mock Data
const mockCommits = [
  { hash: 'abc1234', date: '2024-01-01T10:00:00Z', message: 'feat: initial commit', author_name: 'Dev', author_email: 'dev@test.com' },
  { hash: 'def5678', date: '2024-01-02T10:00:00Z', message: 'fix: critical bug', author_name: 'Dev', author_email: 'dev@test.com' },
  { hash: 'ghi9012', date: '2024-01-03T10:00:00Z', message: 'docs: update readme', author_name: 'Dev', author_email: 'dev@test.com' }
];

const mockTags = {
  all: ['v1.0.0']
};

console.log('Running Tests...\n');

// Test 1: Commit Analysis
try {
  const analysis = analyzeCommits(mockCommits);
  assert.strictEqual(analysis.commits.length, 3);
  assert.strictEqual(analysis.categories.feat, 1);
  assert.strictEqual(analysis.categories.fix, 1);
  console.log('✔ analyzeCommits passed');
} catch (e) {
  console.error('✖ analyzeCommits failed', e);
}

// Test 2: Milestone Detection
try {
  // Mock ref for tag match
  mockCommits[2].refs = 'tag: v1.0.0';
  const milestones = detectMilestones(mockCommits, mockTags);
  
  assert.strictEqual(milestones.length, 2); // Inception + Release
  assert.strictEqual(milestones[0].type, 'inception');
  assert.strictEqual(milestones[1].type, 'release');
  console.log('✔ detectMilestones passed');
} catch (e) {
  console.error('✖ detectMilestones failed', e);
}

console.log('\nTests Completed.');
