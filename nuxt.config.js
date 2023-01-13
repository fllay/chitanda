export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  // server: {
  //   host: "0.0.0.0", // default: localhost
  // },
  target: "static",
  head: {
    title: "kbai",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: ["/favicon.ico"] },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600;800&family=Sarabun:wght@200;400;600;800&display=swap",
      },
    ],
    script: [
      { src: "js/WebAudioRecorder.js", type: "text/javascript" },
      {
        src: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js",
        type: "text/javascript",
      },
    ],
  },
  css: ["~/assets/css/styles.scss"],
  plugins: [
    "~/engine/ExtensionManager.js",
    "~/engine/Helper.js",
    "~/engine/MLDesignManager.js",
    "~/plugins/VirtualScroll.js",
    "~/plugins/VuexPersist.js",
    "~/plugins/BootstrapVueDialog.js",
    "~/plugins/Baklava.js",
    "~/plugins/VueMultipleProgress.js",
    "~/plugins/ServerSocket.js",
  ],
  components: true,
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    // '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    // "@nuxtjs/tailwindcss",
  ],

  modules: [
    "bootstrap-vue/nuxt",
    "vue-toastification/nuxt",
    "vue-web-cam/nuxt",
  ],
  bootstrapVue: {
    icons: true,
    bootstrapCSS: false, // Or `css: false`
    bootstrapVueCSS: false, // Or `bvCSS: false`
  },
  toast: {
    timeout: 3000,
    closeOnClick: false,
  },
  build: {
    extend(config, { isDev, isClient }) {
      // if (isDev && isClient) {
      //   config.module.rules.push({
      //     enforce: "pre",
      //     test: /\.(js|vue)$/,
      //     loader: "eslint-loader",
      //     exclude: /(node_modules)/,
      //   });
      // }

      // // @see https://github.com/nuxt/nuxt.js/pull/3480#issuecomment-404150387
      // config.output.globalObject = "this";

      if (isClient) {
        // web workers are only available client-side
        config.module.rules.push({
          test: /\.worker\.js$/, // this will pick up all .js files that ends with ".worker.js"
          loader: "worker-loader",
          exclude: /(node_modules)/,
        });
      }
    },
  },
};
