## Object

emvy's core object class, from which all other classes inherit, doesn't do much. It merely provides the basis for emvys composition structure, and an extend method for non coffeescripters.

### (Object|object).is(component)

`is` is used to compose objects, adding in your own components or just the ones emvy provides. component can either be a straight component (see components section) or a string referencing one of emvy's components, eg `this.is("Stated")` will add state machine behavior to an object. In this case additional arguments are passed to the component function. is exists both of the Object class itself for composing static methods, and on all instances.

### Object.extend(childProps,childStatics)

Extend is used to implement classical inheritance if you don't use coffeescript. childProps are mixed in to the new classes prototype, childStatics are mixed in directly to the child class. if `childProps.constructor` is present, it will be used as the constructor.

When using extend, super is automatically called first thing. You don't need to call super in your JS. 

### object.mixin(obj,ignore)

Directly mixin the property of an object to this one. Kinda like components, but less cool. Ignore lets you specify an array of keys you don't want to mixin.


---
