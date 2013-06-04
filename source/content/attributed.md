## Attributed(attributes)

This component powers models, and anything else whose data changes should me monitored. an object can be supplied with the call to `Attributed()`, providing initial data. In addition, this object also becomes the store for all attributes. This means the actual data can be stored in an object external to the model.

When applied, Attributed provides the following methods:

### object.get(key)

Returns the value of key

### object.set(key,val)

Sets the value of key to val, first calling `validate(key,val)` if provided, and not doing anything if validate returns false. Triggers events of type "change" eg `"change:text"` with `val` as an argument, and also the generic event "change" with `key` and `val` as arguments.

### object.all()

returns all the data stored.

---