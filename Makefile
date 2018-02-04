.PHONY: install build

install:
	npm install -g polymer-cli
	npm install -g polymer-bundler

build:
	mkdir -p build # make a build folder
	polymer-bundler bundle.html > build/ink.html
	polymer analyze > analysis.json

publish: build # right now to my other folder..
	cp build/ink.html ../row1ca/website/static/html/ink.html
	cp bower_components/webcomponentsjs/webcomponents-lite.js ../row1ca/website/static/js/webcomponents-lite.js
	cp node_modules/bibtex-parse-js/bibtexParse.js ../row1ca/website/static/js/bibtexParse.js

watch: publish
	watchman-make -p '*.html' -t publish

serve: build
	polymer serve
