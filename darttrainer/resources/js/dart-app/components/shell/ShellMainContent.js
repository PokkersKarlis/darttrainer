/** Galvenā kolonna ar router-view */
export default {
  name: 'ShellMainContent',
  template: `
    <main style="flex:1;overflow:hidden;min-width:0;min-height:0;background:#060d18;display:flex;flex-direction:column">
      <div class="shell-main-scroll" style="flex:1;min-height:0;min-width:0;overflow-y:auto;overflow-x:hidden">
        <div class="shell-main-scroll-inner" style="flex:1;min-height:0;display:flex;flex-direction:column">
          <transition name="fade" mode="out-in">
            <router-view class="shell-router-outlet" style="flex:1;min-height:0;display:flex;flex-direction:column;min-width:0"></router-view>
          </transition>
        </div>
      </div>
    </main>
  `,
};
