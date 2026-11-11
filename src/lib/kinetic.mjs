// Deterministic character substitution. Motion remains optional and the final text is never lost.
const ALPHABET = "01X#%+=<>/";

export function scrambleFrame(text, progress, frame) {
  const characters = Array.from(text);
  const glyphCount = characters.filter((character) => !/\s/u.test(character)).length;
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const resolved = Math.floor(glyphCount * clamped);
  let seen = 0;
  return characters.map((character, index) => {
    if (/\s/u.test(character)) return character;
    if (seen++ < resolved) return character;
    return ALPHABET[(index * 13 + Math.floor(frame) * 7 + characters.length) % ALPHABET.length];
  }).join("");
}
