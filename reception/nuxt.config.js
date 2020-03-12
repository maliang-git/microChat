module.exports = {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: "微聊",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1,minimum-scale=1,maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    script: [
      {
        src: "/js/auto-size.js",
        ssr: false,
        type: "text/javascript",
        charset: "utf-8"
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: ["mint-ui/lib/style.css", "~assets/css/reset.css","~assets/font/iconfont/honey-icon.css"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ["@/plugins/mint-ui"],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [],
  /*
   ** Nuxt.js modules
   */
  modules: [],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
};
