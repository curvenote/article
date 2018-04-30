.PHONY: install build publish watch serve

install:
	npm install -g polymer-cli
	npm install -g polymer-bundler

build:
	mkdir -p build # make a build folder
	polymer build --preset="es6-bundled" --entrypoint="ink-article.html"
	polymer analyze > analysis.json

publish: build # right now to my other folder..
	cp build/es6-bundled/ink-article.html ../row1ca/website/static/html/ink.html
	cp bower_components/webcomponentsjs/webcomponents-lite.js ../row1ca/website/static/js/webcomponents-lite.js
	cp node_modules/bibtex-parse-js/bibtexParse.js ../row1ca/website/static/js/bibtexParse.js

watch: publish
	watchman-make -p '*.html' -t publish

serve: build
	polymer serve
