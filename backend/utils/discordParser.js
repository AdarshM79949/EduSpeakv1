/**
 * Parse a JSON record from a Discord message content string.
 */
function parseRecord(content) {
  try {
    const match = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (match && match[1]) return JSON.parse(match[1].trim());
    return JSON.parse(content);
  } catch {
    return null;
  }
}

module.exports = { parseRecord };
