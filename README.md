# Popdoc

[![Build Status](https://travis-ci.com/nolze/popdoc.svg?token=zvurV5eq8Ybys2mhzkvz&branch=master)](https://travis-ci.com/nolze/popdoc)
![npm](https://img.shields.io/npm/v/popdoc)

A simple Markdown to HTML converter with in-browser live preview, customizable by Node's [unified](https://github.com/unifiedjs/unified) framework.

## Features

- Generates a complete HTML document, not only for preview
- Easily customize css, title, language, ..., using YAML frontmatter
- Should be simpler than Pandoc

## Install

```
npm install -g popdoc
```

## Usage

Build, preview in browser, and watch for changes:

```
popdoc example.md -o example.html -w
```

Build only:

```
popdoc example.md -o example.html
```

## Todo

- [ ] Use open ports
- [ ] Cover necessary Pandoc features
- [ ] Split codebase
- [ ] Add options for unified (using [unified-engine](https://github.com/unifiedjs/unified-engine)?)
- [ ] Use TypeScript

## Design

- Keep every path relative to the source document
