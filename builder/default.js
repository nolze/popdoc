'use strict';

const report = require('vfile-reporter');
const vfile = require('to-vfile');

const remark = require('remark');
const remark2rehype = require('remark-rehype');

const doc = require('rehype-document');
const format = require('rehype-format');
const html = require('rehype-stringify');
const raw = require('rehype-raw');
const slug = require('rehype-slug');
const wrap = require('rehype-wrap');

function build(srcFile, dstFile, { matter }) {
  let processor = remark()
    .data('settings', { footnotes: matter.footnotes === false ? false : true })
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
        dstFile.contents = file.contents;
        vfile.writeSync(dstFile);
      }
    });
}

module.exports = build;
