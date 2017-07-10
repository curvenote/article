.PHONY: install dist

install:
	npm install -g polymer-cli
	npm install -g polymer-bundler

dist:
	mkdir -p dist # make a dist folder
	polymer-bundler bundle.html > dist/ink.html

watch: dist
	watchman-make -p '*.html' -t dist \
		-p 'bundle.html' -t dist

serve: dist
	python -m http.server 8082
