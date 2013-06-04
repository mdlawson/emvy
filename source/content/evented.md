## Evented(tag)

Evented is emvy's event emitter. Pretty much everything uses it. 
emvy's event system is bubbling, but what does that even mean in this case?
Every event emitter has an upstream, a downstream, and an optional tag. For every event triggered, the event is applied locally, and provided no local callback returns true, (which stops propagation), the event is then then prepended with the tag, showing its origin, and then send first downstream, and provided nothing there returns true, upstream as well. This lets you control even propagation fairly easily. The tag is supplied when passing a call of `Evented` to the `is` function

When applied, Evented provides the following methods:

### object.attach(something,oneway) 

Sets up a connection between two event emitters. The optional argument oneway configures whether the attachment is bidirectional, default is yes. `object` will have `something` in its downstream after the attach, and `something` will have `object` upstream.

### object.detach(something,oneway)

Removes connections created with attach. oneway dictates if both directions should be detached, defaults to yes.

### object.on(action, callback)

Registers a callback for an action. Actions are usually in the form `type:period.separated.path` though type is not required. if only a callback is provided, that callback will be run on all actions, with the action as its first parameter. Multiple actions can be provided, space separated. 

### object.once(action, callback)

Like `on` but callback will only run once.

### object.trigger(action, args...)

Triggers an action, running all callbacks associated with it and passing it downstream and upstream. All further arguments are passed to callbacks. Multiple actions can be provided, space separated.

### object.off(action, callback)

Remove a callback on an action. If no callback is supplied, all are removed. If no action is supplied, all callbacks on all actions are removed. Multiple actions can be provided, space separated.

---