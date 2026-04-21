/** Sānjoslas / navigācijas saite ar ikonu */
export default {
  name: 'ShellNavLink',
  props: {
    href: { type: String, required: true },
    icon: { type: String, default: '' },
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    title: { type: String, default: '' },
  },
  setup(props) {
    return { props };
  },
  template: `
    <router-link
      v-if="!props.disabled"
      :to="props.href"
      class="nav-link"
      active-class="nav-link--active"
      :title="props.title || undefined"
    >
      <span class="icon">{{ props.icon }}</span>{{ props.label }}
    </router-link>
    <span
      v-else
      class="nav-link nav-link--disabled"
      :title="props.title || undefined"
      aria-disabled="true"
    >
      <span class="icon">{{ props.icon }}</span>{{ props.label }}
    </span>
  `,
};
