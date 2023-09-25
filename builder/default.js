import report from "vfile-reporter";
import { writeSync } from "to-vfile";

import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remark2rehype from "remark-rehype";
import smartypants from "remark-smartypants";
import supersub from "remark-supersub";

import doc from "rehype-document";
import format from "rehype-format";
import html from "rehype-stringify";
import raw from "rehype-raw";
import slug from "rehype-slug";
import wrap from "rehype-wrap";

function build(srcFile, dstFile, { matter }) {
  let processor = remark()
    .data("settings", { footnotes: matter.footnotes === false ? false : true })
    .use(remarkGfm)
    .use(supersub)
    .use(smartypants)
    .use(remark2rehype, { allowDangerousHTML: true })
    .use(raw)
    .use(slug)
    .use(doc, {
      js: matter.js,
      css: matter.css,
      style: matter.style,
      title: matter.title,
      language: matter.language,
    });
  if (matter.wrapper) {
    processor = processor.use(wrap, { wrapper: matter.wrapper });
  }
  processor
    .use(format)
    .use(html)
    .process(srcFile, function(err, file) {
      console.error(report(err || file));
      if (file) {
        dstFile.value = file.value;
        writeSync(dstFile);
      }
    });
}

export default build;
