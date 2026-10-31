import { content } from '../src/content.js';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.ok(content.name && content.from);
assert.ok(content.vibes.length >= 12, 'At least 12 good-vibe messages required');
assert.equal(new Set(content.vibes).size, content.vibes.length, 'Messages must be unique');
for (const photo of content.photos) {
  assert.ok(photo.src.startsWith('/photos/'), 'Use a local photo asset');
  assert.ok(existsSync(`public${photo.src}`), `Missing asset: ${photo.src}`);
  assert.ok(photo.alt && photo.note && photo.caption);
}
for (const character of content.characters) assert.ok(content.photos[character.photo]);
assert.equal(content.adventures.length, 3);
assert.equal(content.quiz.length, 3);
console.log(`Content checks passed: ${content.photos.length} local assets, ${content.vibes.length} unique messages, valid character photos and side quests.`);
