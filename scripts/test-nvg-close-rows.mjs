/**
 * Tests for .claude/hooks/nvg-close.mjs's buildRows() — specifically the
 * LRNB-DELIVERABLES-OBJECT-TOSTRING-0925 fix (object/array deliverables must render as
 * readable text, never "[object Object]"). Pure-logic only. Run with:
 *   node --test scripts/test-nvg-close-rows.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRows } from '../.claude/hooks/nvg-close.mjs';

const BASE = {
  agent: 'BUILD', workspace_type: 'build', task: 'fix the thing',
  deliverables: [], done_proof: [], worked: [], broke: [], why: [], fix: [],
  tries: {}, regressed: [], instruction_change: [], carry_forward: [],
};

test('LRNB-DELIVERABLES-OBJECT-TOSTRING-0925: an object deliverable renders as "title — proof", never "[object Object]"', () => {
  const rows = buildRows({ ...BASE, deliverables: [{ title: 'PR merged', proof: 'https://example.com/pr/1' }] });
  assert.ok(rows.apartment.raw_note.includes('DELIVERABLES: PR merged — https://example.com/pr/1'));
  assert.ok(!rows.apartment.raw_note.includes('[object Object]'));
});

test('LRNB-DELIVERABLES-OBJECT-TOSTRING-0925: a mix of strings and objects all render as readable text, joined by " | "', () => {
  const rows = buildRows({ ...BASE, deliverables: ['plain string deliverable', { title: 'fixed the bug', proof: 'commit abc123' }] });
  assert.ok(rows.apartment.raw_note.includes('DELIVERABLES: plain string deliverable | fixed the bug — commit abc123'));
});

test('LRNB-DELIVERABLES-OBJECT-TOSTRING-0925: a nested array deliverable flattens to readable text', () => {
  const rows = buildRows({ ...BASE, deliverables: [['sub-item A', 'sub-item B']] });
  assert.ok(rows.apartment.raw_note.includes('DELIVERABLES: sub-item A, sub-item B'));
});

test('LRNB-DELIVERABLES-OBJECT-TOSTRING-0925: an object with no title/proof shape falls back to its own values, never "[object Object]"', () => {
  const rows = buildRows({ ...BASE, deliverables: [{ what: 'weird shape', status: 'done' }] });
  assert.ok(!rows.apartment.raw_note.includes('[object Object]'));
  assert.ok(rows.apartment.raw_note.includes('weird shape'));
});
