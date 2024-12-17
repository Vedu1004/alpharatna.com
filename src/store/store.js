// store.js
import m from "mithril";

const store = {
  state: {
    isSidebar: true,
  },

  toggleSidebar() {
    this.state.isSidebar = !this.state.isSidebar;
    m.redraw();
  },

  getSidebarState() {
    return this.state.isSidebar;
  },
};

export default store;
