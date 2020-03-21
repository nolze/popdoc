#!/usr/bin/env bash

set -ev

npm unlink
npm install
npm link
popdoc tests/example.md -o /tmp/example.html
npm unlink
diff tests/example.html /tmp/example.html
