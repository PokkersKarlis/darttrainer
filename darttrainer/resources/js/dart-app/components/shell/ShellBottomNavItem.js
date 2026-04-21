/** Viena apakšējās navigācijas saite (mobilā) */
import * as Vue from 'vue';
export default {
  name: 'ShellBottomNavItem',
  props: {
    href: { type: String, required: true },
    icon: { type: String, default: '' },
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    emphasis: { type: Boolean, default: false },
    flexFill: { type: Boolean, default: false },
    /** Viesu «Reģistrēt» — zeltaina saite */
    guestAccent: { type: Boolean, default: false },
  },
  setup(props) {
    const labelStyle = Vue.computed(() => {
      if (props.emphasis) return 'font-weight:800;color:#fbbf24';
      if (props.flexFill) {
        const base = 'text-align:center;line-height:1.2';
        return props.guestAccent ? `${base};font-weight:800` : base;
      }
      return '';
    });
    const anchorStyle = Vue.computed(() => {
      const parts = [];
      if (props.flexFill) parts.push('flex:1;min-width:0');
      if (props.guestAccent || props.emphasis) parts.push('color:#fbbf24');
      return parts.join(';');
    });
    const anchorClass = Vue.computed(() => [
      'bnav-item',
      { 'bnav-item--disabled': props.disabled },
    ]);
    return { props, labelStyle, anchorStyle, anchorClass };
  },
  template: `
    <a :href="props.href" :class="anchorClass" :style="anchorStyle || undefined">
      <span class="bicon">{{ props.icon }}</span>
      <span :style="labelStyle || undefined">{{ props.label }}</span>
    </a>
  `,
};
