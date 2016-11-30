# Ionic2 two way infinite scroll component example

### Description

This is a custom infinite scroll component implementation that works in two ways and replaces data instead of adding to it, to prevent DOM stuffing. Basically it's a duplication of the original Ionic2 infinite scroll component (http://ionicframework.com/docs/v2/api/components/infinite-scroll/InfiniteScroll/). After reloading the new data, the content scrolls automatically the the first visible list item before loading. For testing purposes there is a node server that mocks data from a json file.

### How to run demo

* Download the repo and run npm install to install dependencies
* change directory into 'mock-backend' and run 'node server.js'
* try to open 'http://localhost:3333/clients' to test the server
* run 'ionic serve' to run the ionic application 

### Problems

* If the infinite is loaded twice, maybe the browser height is to high.
* Maybe adjust the constants in content.utils.js 