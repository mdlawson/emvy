## Router

emvy's router is currently a kind of stand-in for a future router closer to my ideals, once I find out what they are. Nonetheless, it functions, and is pretty versatile. The router is a top level singleton, its not a class. (yep, I know this is the classes section but it would feel lonely on its own!) The router emits events based on the path as soon as it is started by calling `emvy.Router()`.

The events it emits are pretty simple. For each segment of the path, it will emit the segment, with all previous segments as a prefix, and all further segments as arguments. For example, given the path `/user/michael/todos/1` the router will emit 4 events as follows:

```
"user", (michael,todos,1)
"user.michael", (todos,1)
"user.michael.todos", (1)
"user.michael.todos.1" ()
```

### Router.navigate.to(url)

Pushes the url into the history, them emits events as above.

### Router.navigate.up()

Pops the last part segment off the path, then calls `to()` on the new path.

### Router.navigate.down(to)

Pushes the given segment onto the path, then calls `to()` on the new path.

### Router.navigate.across(to)

Swaps out the last segment of the path with the given one, then calls `to()` on the new path.

---