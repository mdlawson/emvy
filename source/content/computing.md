## Computing()

Computing adds the computed function to the object, which allows the creation of computed values that depend on other values.

### object.computed(name, func, deps)

Creates a new computed value. `name` is the name of the value, when its changes are broadcast in events. `func` is the function called to compute the value, and `deps` is an array of properties whose changes this computed depends on. `deps` can also contain Models, in which case all changes on the model will cause recalculation of the computed. When a change in any of its dependencies occurs, `func` is called, and the value returned from func is emitted. 

---