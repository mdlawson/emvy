## Hiding(key,initialVal,set,get)

This component lets you specify attributes to be "hidden" behind a setter/getter. it is used internally quite a bit, for example in the ViewModel for running changes to the model and the view through a setter first.

Hiding is called supplying a key, the name of the resulting function on the object, an initial value, which is first run through the setter, a setter function, and a getter function. It create a function in the form: `object.key(newval)` where newval is not supplied to get the current val, which you should recognize from the rest of emvy. 

If newval is supplied, the setter function is called like so `set(currentValue,newValue)` and its return value is taken to be the final new value. Otherwise the getter is called with the current value, and the value returned by the getter is returned as the final current value.

---

