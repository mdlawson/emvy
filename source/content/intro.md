emvy is a framework for creating web-apps that tries to strike a balance between flexibility and structure, aiming to speed up development while still being clear, avoiding "magic" and retaining control. Emvy's main goals are as follows:

* Don't make a mess: Not in your objects, not in your DOM. emvy makes heavy use of closures to store its internal state, rather than sprinkling it everywhere.
* Minimize magic, but still be concise and elegant. emvy aims to make code execution reasonably transparent and easy to follow, even to someone unfamiliar with emvy's structure and concepts.
* Don't decide your stack for you: emvy doesn't care what templating engine you use. emvy pays attention to your data attributes so it can seamlessly swap in new data, but no further. emvy doesn't care if you use jQuery, Zepto, underscore, lodash, whatever. Using a few other utilities is probably a good idea, but emvy has no dependencies.
* emvy has no default store implementation. Thats right, you'll have to make your own. emvy provides a trivial API to interact with, and a reference localstorage implementation that uses depot.js

emvy does however, encourage a few design ideas:

* MVVM: Standing for Model, View, ViewModel, MVVM is similar to MVC but uses data binding to connect models with views. emvy's ViewModel (and ViewCollection) are very thin, merely ferrying events around.
* Hierarchical views. emvy helps build hierarchical view systems, and then passes events up and down the chain easily. emvy's view system is quite similar to the DOM it represents, but abstracts it into data.
* Composition over inheritance: emvy's design is focused around components: functions that extend objects with further functionality. emvy suggests that recurring ideas be expressed in this way in your applications as well. This helps encapsulate functionality away from data. 
* Thin routing - The router isn't at the top in emvy's design. Its just another source of events. 