import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import { OhVueIcon, addIcons } from "oh-vue-icons";
import { CoSortAscending, CoSortDescending, FcPrevious, FcNext } from "oh-vue-icons/icons";

addIcons(CoSortAscending, CoSortDescending, FcPrevious, FcNext);

const app = createApp(App);
app.component("v-icon", OhVueIcon);
app.mount("#app");
