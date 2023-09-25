#!/usr/bin/env bash

set -ev

npm uninstall --global && npm link
popdoc tests/example.md -o /tmp/example.html
npm uninstall --global
diff tests/example.html /tmp/example.html
