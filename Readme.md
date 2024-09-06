# Repo description
This repo shall provide tooling for generating a website in the `out` directory. There are two main objectives:

## 1. Set up CSS to have a responsive modern single page application 
Some NodeJS project can be used for asset management and generation. Compiled CSS + HTML shall be copied into the `out` directory
## 2. Provide tooling to copy compiled node files into a website

The directory `compiled` contains three files which serve testing purposes. These files will originate from compilation of the warthog node for webassembly. These files need to be copied into the website's root directory (`out` directory).
```
wart-node.worker.js 
wart-node.js
wart-node.wasm
```

# Directory description:
* `demo`: The `out` directory shall look similarly with modified, nicer-looking UI (modify HTML+CSS) and wart-node.* files shall be copied from `compiled` directory (create tooling with NodeJS).
* `compiled`: This directory will be filled with compiled output files from node compilation for webassembly.
* `src`: This directory contains raw files to be processed by NodeJS tasks/tooling.
* `out`: This directory shall contain only necessary files that will be hosted.

# Testing
* Use the command `python3 server.py` in the project root to run a local HTTP server that provides necessary headers to test the website.
* For demo, open `http://localhost:8000/demo/wart-node.html` in the browser.  The goal is to generate a better output directory website `http://localhost:8000/out/wart-node.html`.

**NOTE**: Use `localhost` instead of `127.0.0.1` or `0.0.0.0`. The `python3 server.py` message is a bit misleading ("`Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...`"). Without `localhost` it won't work.



