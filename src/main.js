import {
    createApp
} from 'vue'
import 'normalize.css/normalize.css'
import App from './App.vue'
import "./style/index.less"

import {
    setupRouter
} from '@/router'
import { setupStore } from '@/store';

const app = createApp(App)

async function setupApp() {

    setupRouter(app)
    setupStore(app)
    app.mount('#app')

}
void setupApp();
// createApp(App).mount('#app')