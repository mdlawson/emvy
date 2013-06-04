## Element(tag,html)

Element is the core component that powers a view. Element takes input html, builds a dom node from it, scans the dom node for attributes it understands, then builds cached data structures for fast access to and modification of the data. element also sets up events on the element and listens to them, executing the local methods you specify. 

When you add the element component, you can supply an optional tag (defaults to div) and the html the element starts with. 

First, lets look at all the data attributes Element recognizes and how to use them.

### data-bind

The data-bind attribute lets you specify the property (or computed), whose value you want to be the innerHtml of this element. Unless the element is an input, a textarea, or a select element, in which case data-bind sets the value. eg, an element with the attribute `data-bind="todo"` would apply apply any incoming events of type `change:model.todo` to that element

### data-outlet

This attribute lets you create named outlets, where other views can insert elements. `data-outlet="todos"` will create an outlet named todos. See insert and insertInto below for more details on outlets. 

### data-class

This lets you set up bindings for class names. In its most simple usage, `data-class="myClass"` would bind the value of myClass on the model or a computed as a class on the element. This isn't normally useful, so in addition emvy supports a ternary syntax for describing toggleable classes depending on boolean attributes. `data-class="done?strike"` means the element will have the class strike when done is true, and the class will be removed if its false. `class="done?strike:red"` would mean the class would be replaced with `red` when done is false. 

### data-attr

This lets you set up bindings to attribute values. It works nearly identically to class bindings as described above, except the name of the attribute is specified at the start, separated with a `|`. eg, `data-attr="src|img"`. The ternary syntax described above is fully supported here as well. 

### data-link

This functions as a helper for calling router navigate actions. The action is provided as the first option, followed by the url. eg `data-link="to /test"`

### data-(click|dblclick|keypress|keydown|keyup|enter)

Binds to all the common input events. (plus one more, enter, for getting enter key presses) These all work in exactly the same way. A function is specified, and if the view has the function, it is executed when the event takes place. The last argument to the function is the actual event, and all other arguments are any additional, space separated values given in the attribute. eg, `data-click="myFunc hi there!"` calls `myFunc("hi", "there!",e)`


---

Element provides the following methods when it is applied:

### object.set(key, val)

Sets the value of any data-bindings on key.

### object.get(key)

*Sort of* gets the value of data bindings on key. In reality it gets the first value it finds, and hopes they're all the same (they should be). Also tries to grab attributes bound with data-attr if relevant, but will never grab class values bound with data-class.

### object.html(newhtml)

Replaces the elements html with newhtml, rebuilding all caches, and triggering a reset event that should get data applied to it again. Calling this method without newhtml returns the current html

### object.insertInto(view,outlet)

Inserts this element into a named outlet on another view, or if view is a string, uses `document.querySelector` and `appendChild` to insert it into a dom node described by the string.

### object.insert(view,outlet)

Inserts another view into a named outlet on this element.

### object.remove()

Removes this element from the dom

### object.clean(outlet)

Removes all elements from the given outlet. If no outlet is provided, removes all elements from all outlets. 

---