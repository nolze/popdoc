#!/usr/bin/env node
'use strict';

const remark = require('remark');
const remark2rehype = require('remark-rehype');
const doc = require('rehype-document');
const format = require('rehype-format');
const html = require('rehype-stringify');
const slug = require('rehype-slug');
const report = require('vfile-reporter');
const { program } = require('commander');
const express = require('express');
const http = require('http');
const reload = require('reload');
const logger = require('morgan');
const chokidar = require('chokidar');
const vfile = require('to-vfile');
const open = require('open');
const wrap = require('rehype-wrap');
const vfileMatter = require('vfile-matter');
const mung = require('express-mung');
const pkg = require('./package.json');

function build(srcFile, dstFile) {
  vfileMatter(srcFile, { strip: true });
  const matter = srcFile.data.matter;
  let processor = remark()
    .data('settings', { footnotes: matter.footnotes === false ? false : true })
    .use(remark2rehype)
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
      // console.log(String(file));
      if (file) {
        dstFile.contents = file.contents;
        vfile.writeSync(dstFile);
      }
    });
}

function serve(dstFile) {
  const app = express();
  app.set('port', process.env.PORT || 3000);
  app.use(logger('dev'));
  const withReloadListener = mung.write((chunk, encoding, req, res) => {
    if (!res.req.url === '/' + dstFile.basename) return;
    const bodyEnd = chunk.lastIndexOf('</body>');
    if (bodyEnd != -1) {
      const fragment = '<script src="/reload/reload.js"></script>';
      const newChunk = Buffer.concat([
        chunk.slice(0, bodyEnd),
        Buffer.from(fragment),
        chunk.slice(bodyEnd),
      ]);
      return newChunk;
    }
  });
  app.use(withReloadListener);
  app.use(
    '/',
    express.static(dstFile.dirname, {
      setHeaders: (res, _path, _stat) => {
        // Ignore Content-Length
        res.set('Transfer-Encoding', 'chunked');
      },
    }),
  );

  const server = http.createServer(app);

  server.listen(app.get('port'), function() {
    const url = `http://localhost:${app.get('port')}/${dstFile.basename}`;
    console.log(`Serving at ${url}`);
    open(url);
  });

  const startReloader = async () => {
    const reloadReturned = await reload(app);
    chokidar
      .watch(dstFile.path, {
        // disableGlobbing: true,
      })
      .on('change', (_path) => {
        // console.log('change', _path);
        reloadReturned.reload();
      });
  };

  startReloader();
}

program.version(pkg.version);

program
  .arguments('<markdown_file>', 'Input filename')
  .requiredOption('-o, --output <output>', 'Output filename')
  .option('-w, --watch', 'Watch and live preview')
  .action((markdownFile, options) => {
    const output = options.output;
    if (!markdownFile || !output) {
      return;
    }

    // Convert once
    build(vfile.readSync(markdownFile), vfile(output));

    if (options.watch) {
      // Watch & build
      chokidar
        .watch(markdownFile, {
          // disableGlobbing: true,
        })
        .on('change', (_path) => {
          // console.log('change', markdownFile);
          build(vfile.readSync(markdownFile), vfile(output));
        });

      // Serve & reload
      serve(vfile(output));
    }
  });

program.parse(process.argv);
