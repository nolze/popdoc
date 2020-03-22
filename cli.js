#!/usr/bin/env node
'use strict';

// Watcher
const chokidar = require('chokidar');

// Server
const express = require('express');
const http = require('http');
const logger = require('morgan');
const mung = require('express-mung');
const open = require('open');
const reload = require('reload');

// VFile
const vfile = require('to-vfile');
const vfileMatter = require('vfile-matter');

// Others
const { program } = require('commander');
const pkg = require('./package.json');
const defaultBuild = require('./builder/default');

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
  .option('-b, --builder [module]', 'Use custom builder')
  .option('-w, --watch', 'Watch and live preview')
  .action((markdownFile, options) => {
    const output = options.output;
    if (!markdownFile || !output) {
      return;
    }

    const srcFile = vfile.readSync(markdownFile);

    vfileMatter(srcFile, { strip: true });
    const matter = srcFile.data.matter;

    // Set builder
    let build = defaultBuild;
    let buildOptions = { matter };

    if (options.builder) {
      build = require(options.builder);
    }

    // Convert once
    build(srcFile, vfile(output), buildOptions);

    if (options.watch) {
      // Watch & build
      chokidar
        .watch(markdownFile, {
          // disableGlobbing: true,
        })
        .on('change', (_path) => {
          // console.log('change', markdownFile);
          build(srcFile, vfile(output), buildOptions);
        });

      // Serve & reload
      serve(vfile(output));
    }
  });

program.parse(process.argv);
