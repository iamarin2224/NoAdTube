/**
 * Utility to encode and decode MongoDB ObjectIds in frontend URLs
 * Prevents direct exposure of database ObjectIds in browser address bar.
 */

// Simple XOR mask table for URL-safe obfuscation
const XOR_KEY = 0x5a;

export const encodeId = (id) => {
  if (!id || typeof id !== 'string') return id;
  // If not a standard 24-character hex ObjectId, return as-is
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return id;

  try {
    const bytes = [];
    for (let i = 0; i < id.length; i += 2) {
      bytes.push(parseInt(id.substr(i, 2), 16) ^ XOR_KEY);
    }
    const binary = String.fromCharCode(...bytes);
    const base64 = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `v_${base64}`;
  } catch (e) {
    return id;
  }
};

export const decodeId = (slug) => {
  if (!slug || typeof slug !== 'string') return slug;

  // If already a valid 24-char ObjectId, return directly
  if (/^[0-9a-fA-F]{24}$/.test(slug)) return slug;

  if (slug.startsWith('v_')) {
    try {
      let base64 = slug.slice(2).replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const binary = atob(base64);
      const hexParts = [];
      for (let i = 0; i < binary.length; i++) {
        const byte = binary.charCodeAt(i) ^ XOR_KEY;
        hexParts.push(byte.toString(16).padStart(2, '0'));
      }
      const hex = hexParts.join('');
      if (/^[0-9a-fA-F]{24}$/.test(hex)) {
        return hex;
      }
    } catch (e) {
      return slug;
    }
  }

  return slug;
};
