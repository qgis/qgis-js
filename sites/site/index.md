---
layout: home
home: true

title: false
titleTemplate: false

hero:
  name: qgs-js
  tagline: QGIS ported to WebAssembly in order to run it in the browser, or any other modern JavaScript runtime.
  actions:
    - theme: brand
      text: Get Started
      link: /guide
    - theme: brand
      text: Documentation
      link: /docs
    - theme: brand
      text: API
      link: /api
    - theme: alt
      text: View on GitHub
      link: https://github.com/qgis/qgis-js
  image:
    src: /qgis-js-logo.svg
    alt: qgis-js Logo

features:
  - icon: 🚀
    title: No server involved
    details: Running QGIS on the clients WebAssembly sandbox, means no bills for servers and great scalability of your application.
  - icon: 📑
    title: Fully typed API
    details: Instant server start, lightning fast hot updates, and leverage Vite ecosystem plugins.
  - icon: 🗺️
    title: Batteries included
    details: qgis-js comes with an integration for OpenLayers
  - icon: <svg xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 256 220.8"><path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z"/><path fill="#41B883" d="m0 0 128 220.8L256 0h-51.2L128 132.48 50.56 0H0Z"/><path fill="#35495E" d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z"/></svg>
    title: Customize with Vue
    details: Use Vue syntax and components directly in markdown, or build custom themes with Vue.
---

<style>
:root {
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #f0e64a 50%, #589632 50%);
  --vp-home-hero-image-filter: blur(40px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(72px);
  }
}
</style>
