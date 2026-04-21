/**
 * Toggle a CSS class on document.body for the component lifetime (full-viewport shells).
 * @param {string} className
 */
import { onMounted, onUnmounted } from 'vue';
export function useBodyShellClass(className) {
  onMounted(() => {
    document.body.classList.add(className);
  });
  onUnmounted(() => {
    document.body.classList.remove(className);
  });
}
