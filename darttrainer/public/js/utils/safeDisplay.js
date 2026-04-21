/**
 * Normalize values for text UI (toasts, alerts). Always bind with {{ }}, never v-html.
 * Strips NULs and caps length so runaway API payloads cannot spam the DOM.
 */
function dartSafeDisplayMessage(input) {
  if (input == null) return '';
  if (typeof input === 'string') {
    return input.replace(/\0/g, '').trim().slice(0, 4000);
  }
  if (typeof input === 'number' || typeof input === 'boolean') {
    return String(input).slice(0, 4000);
  }
  if (typeof input === 'object') {
    try {
      const m = input.message ?? input.error;
      if (m != null) return dartSafeDisplayMessage(m);
    } catch (_) {}
  }
  return '';
}
