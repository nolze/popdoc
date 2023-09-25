import { defaultTheme } from "vuepress";

export default {
  title: "Popdoc",
  description: "Simple Markdown document converter in Node.js",
  base: "/popdoc/",
  theme: defaultTheme({
    colorMode: "light",
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "Reference", link: "/api/" },
    ],
    // sidebar: 'auto',
    search: false,
    repo: "nolze/popdoc",
    editLinks: true,
    editLinkText: "Edit this page on GitHub",
    docsDir: "docs",
    docsBranch: "master",
    serviceWorker: true,
  }),
};
