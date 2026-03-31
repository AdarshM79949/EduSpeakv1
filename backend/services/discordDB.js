const { getChannel } = require('../config/discord');
const { v4: uuidv4 } = require('uuid');

// Simple in-memory cache: channelId -> { data: [], expiry: timestamp }
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

// Simple request queue to respect Discord rate limits (~5 req/s)
let lastRequest = 0;
async function throttle() {
  const now = Date.now();
  const diff = now - lastRequest;
  if (diff < 220) { // ~4.5 req/s to be safe
    await new Promise((r) => setTimeout(r, 220 - diff));
  }
  lastRequest = Date.now();
}

/**
 * Create a record in a Discord channel.
 * Sends data as a JSON code block inside a message.
 * Returns the created record (with id and messageId).
 */
async function create(channelId, data) {
  await throttle();
  const record = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
  const channel = await getChannel(channelId);
  const content = '```json\n' + JSON.stringify(record, null, 2) + '\n```';
  const msg = await channel.send(content);
  record._messageId = msg.id;
  // Invalidate cache for this channel
  cache.delete(channelId);
  return record;
}

/**
 * Fetch all records from a Discord channel.
 * Parses JSON from code blocks in message content.
 * Uses simple TTL cache to reduce API calls.
 */
async function findAll(channelId) {
  // Check cache first
  const cached = cache.get(channelId);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  await throttle();
  const channel = await getChannel(channelId);
  const records = [];
  let lastId;

  // Paginate through all messages (100 at a time)
  while (true) {
    await throttle();
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const messages = await channel.messages.fetch(options);
    if (messages.size === 0) break;

    for (const msg of messages.values()) {
      const parsed = parseJsonFromMessage(msg.content);
      if (parsed) {
        parsed._messageId = msg.id;
        records.push(parsed);
      }
    }
    lastId = messages.last().id;
    if (messages.size < 100) break;
  }

  // Cache the results
  cache.set(channelId, { data: records, expiry: Date.now() + CACHE_TTL });
  return records;
}

/**
 * Find a single record by its UUID `id` field.
 */
async function findOne(channelId, id) {
  const all = await findAll(channelId);
  return all.find((r) => r.id === id) || null;
}

/**
 * Find records matching a filter function.
 */
async function findWhere(channelId, filterFn) {
  const all = await findAll(channelId);
  return all.filter(filterFn);
}

/**
 * Update a record by editing the original Discord message.
 */
async function update(channelId, id, newData) {
  await throttle();
  const channel = await getChannel(channelId);
  const record = await findOne(channelId, id);
  if (!record) return null;

  const updated = { ...record, ...newData, updatedAt: new Date().toISOString() };
  delete updated._messageId;

  const content = '```json\n' + JSON.stringify(updated, null, 2) + '\n```';
  const msg = await channel.messages.fetch(record._messageId);
  await msg.edit(content);

  cache.delete(channelId);
  return updated;
}

/**
 * Delete a record by deleting the Discord message.
 */
async function remove(channelId, id) {
  await throttle();
  const channel = await getChannel(channelId);
  const record = await findOne(channelId, id);
  if (!record) return false;

  const msg = await channel.messages.fetch(record._messageId);
  await msg.delete();
  cache.delete(channelId);
  return true;
}

/**
 * Parse JSON from a Discord message that wraps it in a code block.
 */
function parseJsonFromMessage(content) {
  try {
    // Match ```json ... ``` or ``` ... ```
    const match = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    }
    // Try parsing raw content
    return JSON.parse(content);
  } catch {
    return null;
  }
}

module.exports = { create, findAll, findOne, findWhere, update, remove };
