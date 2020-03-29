# Popdoc

[![Build Status](https://travis-ci.com/nolze/popdoc.svg?token=zvurV5eq8Ybys2mhzkvz&branch=master)](https://travis-ci.com/nolze/popdoc)
[![npm version](https://img.shields.io/npm/v/popdoc.svg)](https://www.npmjs.com/package/popdoc)
[![npm downloads](https://img.shields.io/npm/dm/popdoc.svg)](https://www.npmjs.com/package/popdoc)

A simple Pandoc-like Markdown to HTML converter with in-browser live preview, customizable by Node's [unified](https://github.com/unifiedjs/unified) framework.

## Features

- Generates a complete HTML document, not only for preview
- Easily customize css, title, language, ..., using YAML frontmatter
- Should be simpler than Pandoc

## Install

```
npm install -g popdoc
```

## Usage

Build:

```
popdoc example.md -o example.html
```

Build, preview in browser, and watch for changes:

```
popdoc example.md -o example.html --watch
```

See [tests/example.md](https://raw.githubusercontent.com/nolze/popdoc/master/tests/example.md) for writing a frontmatter (set title, styles, ...)

## Todo

- [x] Use open ports
- [ ] Support glob pattern
- [ ] Cover necessary Pandoc features
- [ ] Design options for unified
- [ ] Provide good docs
- [ ] Use TypeScript
- [ ] Refactor

## Design

- Keep every path relative to the source document
