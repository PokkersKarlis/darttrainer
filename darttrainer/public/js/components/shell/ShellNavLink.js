/** Sānjoslas / navigācijas saite ar ikonu */
const ShellNavLink = {
  name: 'ShellNavLink',
  props: {
    href: { type: String, required: true },
    icon: { type: String, default: '' },
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    return { props };
  },
  template: `
    <a :href="props.href" class="nav-link" :class="{ 'nav-link--disabled': props.disabled }">
      <span class="icon">{{ props.icon }}</span>{{ props.label }}
    </a>
  `,
};
