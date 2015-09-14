#GIS with javascript

This is a tutorial series about how to use javascript for [GIS](https://en.wikipedia.org/wiki/Geographic_information_system).

It is intended as much for GIS professionals, to see how you can use javascript in your work process, as well as it is directed to javascript developpers who want to use geodata in their applications. If you are neither and just want to make maps for the web, it is for you too.

##Prerequisites

We will use [nodeJS](https://nodejs.org/en/) a lot, you need to have that installed on your machine before starting.

You also need a good and recent browser (I recommend [Firefox](https://www.firefox.com)) and a text editor, there will be one already on your machine.

That is all you need in terms of software. The only other prerequisites are that you do not mind using the command line terminal and have a decent understanding of HTML and javascript.

##Why javascript?

Atwoods law states that


> Any application that can be written in JavaScript, will eventually be written in JavaScript

This, as we will see, also applies to GIS. 

You might wonder why. There are plenty of open source tools to do GIS. The rational here is the same as for using javascript on the server (we will also do that): the end product, your map or application, will most likely be viewed in a browser. Browsers understand javascript. We will use it anyway at some point. So we might as well use the same language all the way.

##nodeJS

The wikipedia entry about node starts with:

> Node.js is an open-source, cross-platform runtime environment for developing server-side web applications. Node.js applications are written in JavaScript and can be run within the Node.js runtime on OS X, Microsoft Windows, Linux, FreeBSD, NonStop, IBM AIX, IBM System z and IBM i.

That sums it up rather neatly. What it means for us is that we can execute javascript from the command line and write a server.

##npm

###install libraries
One of the best features of node is the package manager: [npm](https://www.npmjs.com/). It comes automatically when you install node and lets us download most javascript libraries with a single command that looks like this

```
$ npm install <package name> --save
```

###initialise npm
We could use it without ```--save``` at the end but that helps us keep track of which packages, and their version, that we use, if we have initialised npm with

```
$ npm init
```

You will be asked a few questions. If you can not be bothered answering them, just press enter until you are back at the console. A file called ```package.json``` will be created in the directory where all the dependencies will be listed if you install them with ```--save```

###install globally

Some libraries can be installed globally with ```-g```. On most machines you will have to be super user to do that

```
$ sudo npm install <package name> -g
```

###install dependencies for an existing project

If we pick up an existing project we can install the dependecies with

```
npm install
```

It will download all the libraries declared in ```package.json```

###require a dependency

When you use a dependency in your code you ```require``` it like this if it has been downloaded with npm

```
var dependency = require('dependency')
```

If it is a piece of code that you have written yourself you require it relative to the script you want to run in the file system. If it is a file called ```myScript.js``` that is in a folder called ```lib``` in the same place as the code you want to run, it looks like this:

```
var myScript = require('./lib/myScript')
``` 

##Chapters

1. [Geodata in javascript](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_1_geodata)
2. [Draw a map for print](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_2_print_map)
3. [Animation and interaction](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_3_animation_interaction)
4. [Zoomable maps](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_4_zoomable)
5. [Server backend for zoomable maps](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_5_server_backend)
6. [Geolocation and fleet tracking](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_6_geolocation)

<br/>
<br/>
<br/>
<br/>
<br/>
![Idris maps](readmeImage1.png)

