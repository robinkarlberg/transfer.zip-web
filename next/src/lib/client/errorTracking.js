import { IS_SELFHOST } from "../isSelfHosted";
import { sendTrackError } from "./Api";

export function trackError(identifier, err, metadata) {
  try {
    console.error(identifier)
    console.error(err)
    if (IS_SELFHOST) return

    const error = buildErrorDetails(err);
    const md = sanitizeMetadata(metadata);

    sendTrackError({
      identifier,
      error,
      meta: md,
      url: getCurrentURL(),
      platform: getOSDetails()
    })
  } catch {
    // Silently ignore tracking failures
  }
}

function buildErrorDetails(err) {
  const MAX = 3000;
  const details = {};
  try {
    const toStr = (v) => truncate(typeof v === 'string' ? v : stringifySafe(v), MAX);

    // Normalize to an Error
    const e = err instanceof Error ? err : new Error(typeof err === 'string' ? err : stringifySafe(err));

    // Required fields: name, message, url, os
    const name = e.name || (err && err.constructor && err.constructor.name) || 'Error';
    const message = e.message || (typeof err === 'string' ? err : '');

    details.name = toStr(name);
    details.message = toStr(message);
    return details;
  } catch {
    try {
      return {
        name: 'Error',
        message: truncate(String(err), 3000),
      };
    } catch {
      return { name: 'Error', message: '[Unserializable]', url: '', os: 'unknown' };
    }
  }
}

function sanitizeMetadata(metadata, max = 3000) {
  const seen = new WeakSet();

  const walk = (val) => {
    try {
      if (val == null) return val;

      const t = typeof val;
      if (t === 'string') return truncate(val, max);
      if (t === 'number' || t === 'boolean' || t === 'bigint') return val;
      if (t === 'symbol' || t === 'function') return truncate(stringifySafe(val), max);

      if (t === 'object') {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);

        if (Array.isArray(val)) {
          return val.map(walk);
        }

        // If not a plain object, stringify to avoid leaking large internals
        const isPlain = Object.prototype.toString.call(val) === '[object Object]';
        if (!isPlain) return truncate(stringifySafe(val), max);

        const out = {};
        for (const [k, v] of Object.entries(val)) {
          out[k] = walk(v);
        }
        return out;
      }

      return truncate(stringifySafe(val), max);
    } catch {
      return '[Unserializable]';
    }
  };

  return walk(metadata);
}

function getCurrentURL() {
  try {
    if (typeof window !== 'undefined' && window.location && window.location.href) {
      return String(window.location.href);
    }
  } catch { }
  return '';
}

function getOSDetails() {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (!nav) return { mobile: false, os: 'unknown' };

    const isMobileUA = (uaStr) => {
      if (typeof uaStr !== 'string') return false;
      return /Mobi|Android|iPhone|iPad|iPod/i.test(uaStr);
    };
    const mapPlatform = (p) => {
      const s = String(p || '').toLowerCase();
      if (s.includes('android')) return 'Android';
      if (s.includes('ios')) return 'iOS';
      if (s.includes('cros') || s.includes('chrome os')) return 'Chrome OS';
      if (s.includes('win')) return 'Windows';
      if (s.includes('mac')) return 'macOS';
      if (s.includes('linux')) return 'Linux';
      return 'unknown';
    };

    const detectOS = (ua, platformStr) => {
      const p = String(platformStr || '');
      const u = String(ua || '');
      if (/android/i.test(u)) return 'Android';
      if (/iphone|ipad|ipod/i.test(u)) return 'iOS';
      if (p === 'MacIntel' && nav.maxTouchPoints > 1) return 'iOS'; // iPadOS
      if (/cros/i.test(u)) return 'Chrome OS';
      if (/win/i.test(u) || /windows/i.test(p)) return 'Windows';
      if (/mac/i.test(u) || /mac/i.test(p)) return 'macOS';
      if (/linux/i.test(u) || /linux/i.test(p)) return 'Linux';
      const mapped = mapPlatform(p);
      if (mapped !== 'unknown') return mapped;
      return 'unknown';
    };

    // Prefer userAgentData when available (more privacy-preserving)
    const uad = nav.userAgentData;
    if (uad && typeof uad.platform === 'string') {
      const os = mapPlatform(uad.platform);
      const mobile = typeof uad.mobile === 'boolean' ? uad.mobile : false;
      return { mobile, os };
    }

    // Fallback to userAgent/platform heuristics
    const ua = typeof nav.userAgent === 'string' ? nav.userAgent : '';
    const platform = typeof nav.platform === 'string' ? nav.platform : '';
    const os = detectOS(ua, platform);
    const mobile = isMobileUA(ua);

    return { mobile, os };
  } catch {
    return { mobile: false, os: 'unknown' };
  }
}

function truncate(str, max) {
  if (typeof str !== 'string') str = String(str);
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function stringifySafe(value) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      value,
      (key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }
        if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
        if (typeof val === 'symbol') return String(val);
        return val;
      }
    );
  } catch {
    try {
      return String(value);
    } catch {
      return '[Unserializable]';
    }
  }
}
