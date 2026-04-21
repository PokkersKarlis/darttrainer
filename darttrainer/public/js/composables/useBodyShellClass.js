/**
 * Toggle a CSS class on document.body for the component lifetime (full-viewport shells).
 * @param {string} className
 */
function useBodyShellClass(className) {
  Vue.onMounted(() => {
    document.body.classList.add(className);
  });
  Vue.onUnmounted(() => {
    document.body.classList.remove(className);
  });
}
