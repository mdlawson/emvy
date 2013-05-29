emvy
====

A tiny MVVM framework built with CoffeeScript.

Emvy's main goals:

* Dont make a mess: not in your objects, not in your DOM. emvy stays out of all your stuff as much as it possibly can.
* Minimize magic, but still be elegent: Emvy aims to make sure your code is easy to follow, but tries to keep the common stuff short.
* No dependencies: jQuery is great, and using emvy with jQuery is probably a good idea. However, the core of emvy wont ever use jQuery. This helps keep things fast and light
* Be fast. Not using jQuery in the core should help keep emvy blazing quick.

Emvy's current features:
* Emvy contains a bubbling event system, passing events around the whole application unless propagation is stopped. This allows data changes to be observed from wherever the data is required. This is similar to Embers system but more flexible.
* Data binding! Emvy has a really simple data binding system, so the dom can be instantly and very specifically updated when necessary. Internally, its similar to changing element contents with jQuery's .val(), but cached, automatic, and fast.
* Hierarchical: Emvy is designed with layout composition in mind, making it as easy as possible to compose your application screens from independent views, all connected by the event system.
* Composed: Emvy uses a composition system to create its objects, and suggests you do to. This allows commonly used ideas and functions to easily be applied to any object, and allows emvys (and your) internal data to be hidden in closures, preventing both accidental modification and object clutter.

* Models - Models are a top level data store, designed to be connected to some persistence layer. 
* Views - Views are a representation of an element, they handle events and providing access to named elements, as well as named outlets, where other views can be inserted
* ViewModels - ViewModels provide convenience binding between a view and a model. Notably these don't actually do much - they just set up event attachments
* ViewCollection - ViewCollections manage a series of bound Views, creating and destroying them as needed in response to changes in the Model.

Check out `todos/todos.coffee` for a preview of emvy's api, (and a working example) as it develops.
A hosted (unstyled, warning, uglyness alert!) example can be seen [here](http://mdlawson.github.io/emvy/todos/)

While emvy is currently being developed in coffeescript, emvy will not be a coffeescript only or even focused library, and when things are more stable a pure js rewrite is planned. 

Emvy is still in the very early stages of construction.
