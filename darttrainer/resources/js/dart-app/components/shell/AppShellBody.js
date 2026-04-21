/** Vidus: sānjosla + saturs + labās reklāmas */
export default {
  name: 'AppShellBody',
  template: `
    <div style="flex:1;display:flex;overflow:hidden;min-height:0">
      <shell-sidebar />
      <shell-main-content />
      <shell-right-ads />
    </div>
  `,
};
