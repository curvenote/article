.PHONY: install dist

install:
	npm install -g polymer-cli
	npm install -g polymer-bundler

dist:
	mkdir -p dist # make a dist folder
	polymer-bundler bundle.html > dist/ink.html

publish: dist # right now to my other folder..
	cp dist/ink.html ../row1ca/website/static/html/ink.html
	cp bower_components/webcomponentsjs/webcomponents-lite.js ../row1ca/website/static/js/webcomponents-lite.js
	cp node_modules/bibtex-parse-js/bibtexParse.js ../row1ca/website/static/js/bibtexParse.js

watch: publish
	watchman-make -p '*.html' -t publish \
		-p 'bundle.html' -t publish

serve: dist
	python -m http.server 8082
