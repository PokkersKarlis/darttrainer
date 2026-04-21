/** Sānjoslas sadaļas virsraksts (uppercase) */
export default {
  name: 'ShellSidebarSectionLabel',
  props: {
    text: { type: String, required: true },
  },
  setup(props) {
    return { props };
  },
  template: `
    <div style="margin:8px 0 4px 12px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#334155">{{ props.text }}</div>
  `,
};
