import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "qgis-js",
  description: "QGIS ported to WebAssembly to run it on the web platform",
  themeConfig: {
    nav: [
      {
        text: "Guide",
        items: [
          { text: "Item A", link: "/item-1" },
          { text: "Item B", link: "/item-2" },
          { text: "Item C", link: "/item-3" },
        ],
      },
      { text: "Documentation", link: "/docs/" },
      {
        text: "0.0.1",
        items: [
          { text: "API", link: "/item-1" },
          { text: "Item B", link: "/item-2" },
          { text: "Item C", link: "/item-3" },
        ],
      },
      { text: "App", link: "/app" },

      // {
      //   text: 'Dropdown Menu',
      //   items: [
      //     { text: 'Item A', link: '/item-1' },
      //     { text: 'Item B', link: '/item-2' },
      //     { text: 'Item C', link: '/item-3' },
      //   ],
      // },

      // ...
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          collapsible: true,
          items: [
            { text: "Introduction", link: "/guide/index.html#introduction" },
            {
              text: "Minimal Example",
              link: "/guide/index.html#minimal-example",
            },
            { text: "Vue Example", link: "/guide/index.html#vue-vite-example" },
          ],
        },
      ],
      "/docs/": [
        {
          text: "GeoWasm",
          collapsible: true,
          items: [
            { text: "Introduction", link: "/docs/qgiswasm/introduction" },
            { text: "Getting Started", link: "/docs/qgiswasm/getting-started" },
            { text: "Compatibility", link: "/docs/qgiswasm/compatibility" },
            { text: "Configuration", link: "/docs/qgiswasm/configuration" },
            { text: "HTTP Headers", link: "/docs/qgiswasm/headers" },
          ],
        },
        {
          text: "Build",
          collapsible: true,
          items: [
            { text: "Architecture", link: "/docs/build/architecture" },
            { text: "Setup", link: "/docs/build/setup" },
            { text: "Workflow", link: "/docs/build/workflow" },
          ],
        },
        {
          text: "Community",
          collapsible: true,
          items: [
            { text: "Contribution", link: "/docs/community/contribution" },
            { text: "Support", link: "/docs/community/support" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API",
          collapsible: true,
          items: [{ text: "API Reference ", link: "/api/index.html" }],
        },
      ],
    },
    footer: {
      message: "Released under the GPL-2.0 license.",
      copyright: "Copyright © 2023 QGIS.ORG Association",
    },
    editLink: {
      pattern: "https://github.com/qgis/qgis-js/edit/main/sites/site/:path",
      text: "Edit this page on GitHub",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/qgis/qgis-js" }],
  },
});
