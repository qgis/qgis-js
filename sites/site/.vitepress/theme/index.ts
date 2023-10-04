import DefaultTheme from "vitepress/theme";

import "./fonts.css";
import "./custom.css";

import Layout from "./Layout.vue";

/*
export default {
  //...DefaultTheme,
  ...{
    extends: DefaultTheme,
    //Layout,

  },
};
*/

export default {
  ...DefaultTheme,
  Layout: Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
};
