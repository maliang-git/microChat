module.exports = {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: "蜜语",
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
  plugins: ["@/plugins/mint-ui","@/plugins/compatible",{
    src: '@/plugins/axios',
    ssr: true
  }],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios'
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    proxy: true,
  },

  proxy: {
    '/api': { 
      target: 'http://localhost:3002/',//这个网站是开源的可以请求到数据的
      pathRewrite: {
         '^/api': ''
      }    
    }
  },
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
