import { createApp } from 'vue';
import './css/global.css';
import './css/date-picker.css';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
/* import specific icons */
import { faClipboard, faRotateRight } from '@fortawesome/free-solid-svg-icons';
// @ts-ignore
import { Modal, modalPlugin } from '@kouts/vue-modal';
import Notifications from '@kyvg/vue3-notification';
// @ts-ignore
import router from './router/index.js';

import '@kouts/vue-modal/dist/vue-modal.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'animate.css';

/* add icons to the library */
library.add(faClipboard);
library.add(faRotateRight);

const app = createApp(App);
app.use(modalPlugin);
app.component('Modal', Modal);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
});
app.use(Notifications);
app.use(router);
app.mount('#app');