import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import 'virtual:uno.css';
import App from './App.vue';
import { setupPermissionDirective } from './directives/permission';
import router from './router';
import { setupStore } from './store';

const app = createApp(App);

app.use(ArcoVue);
app.use(router);
setupStore(app);
setupPermissionDirective(app);

app.mount('#app');
