export function getLuminance(color) {
  // Remove the hash if present
  color = color.replace(/^#/, '');

  // Parse r, g, b values
  let r = parseInt(color.substring(0, 2), 16) / 255;
  let g = parseInt(color.substring(2, 4), 16) / 255;
  let b = parseInt(color.substring(4, 6), 16) / 255;

  // Apply sRGB gamma correction
  r = (r <= 0.03928) ? r / 12.92 : Math.pow(((r + 0.055) / 1.055), 2.4);
  g = (g <= 0.03928) ? g / 12.92 : Math.pow(((g + 0.055) / 1.055), 2.4);
  b = (b <= 0.03928) ? b / 12.92 : Math.pow(((b + 0.055) / 1.055), 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function generateUUID() {
  return (typeof crypto?.randomUUID === "function")
    ? crypto.randomUUID()
    : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
}