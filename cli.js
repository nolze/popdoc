#!/usr/bin/env node

import { resolve } from 'path';
import getPort, { portNumbers } from 'get-port';

// Watcher
import { watch } from 'chokidar';

// Server
import express from 'express';
import { createServer } from 'http';
import logger from 'morgan';
import mung from 'express-mung';
import open from 'open';
import reload from 'reload';

// VFile
import { toVFile, readSync } from 'to-vfile';
import { matter as vfileMatter } from 'vfile-matter';

// Others
import { program } from 'commander';
import pkg from './package.json' assert { type: "json" };
import defaultBuild from './builder/default.js';

async function serve(dstFile) {
  const app = express();
  const port = await getPort({ port: portNumbers(3000, 3100) });
  app.set('port', port);
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

  const server = createServer(app);

  server.listen(app.get('port'), function() {
    const url = `http://localhost:${app.get('port')}/${dstFile.basename}`;
    console.log(`Serving at ${url}`);
    open(url);
  });

  const startReloader = async () => {
    const reloadPort = await getPort({ port: portNumbers(9856, 9956) });
    const reloadReturned = await reload(app, { port: reloadPort });
    watch(dstFile.path, {
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
  .action(async (markdownFile, options) => {
    const output = options.output;
    if (!markdownFile || !output) {
      return;
    }

    // Set builder
    let build = defaultBuild;

    if (options.builder) {
      build = (await import(resolve(options.builder))).default;
    }

    const toBuild = (markdownFile, output, buildOptions = {}) => {
      const srcFile = readSync(markdownFile);
      vfileMatter(srcFile, { strip: true });
      const matter = srcFile.data.matter;
      Object.assign(buildOptions, { matter });
      build(srcFile, toVFile(output), buildOptions);
    };

    // Convert once
    toBuild(markdownFile, output, {});

    if (options.watch) {
      // Watch & build
      watch(markdownFile, {
          // disableGlobbing: true,
        })
        .on('change', (_path) => {
          // console.log('change', markdownFile);
          toBuild(markdownFile, output, {});
        });

      // Serve & reload
      serve(toVFile(output));
    }
  });

program.parse(process.argv);
