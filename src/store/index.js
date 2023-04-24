import { createPinia, defineStore } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const store = createPinia();

store.use(piniaPluginPersistedstate);

export const globalStore = defineStore({
  id: "globalState",
  state: () => {
    return {
      isShowChart: true,
      isLoading:false
    };
  },
  getters: {},
  actions: {},
  persist: true,
});

export function setupStore(app) {
  app.use(store);
}

export { store };
