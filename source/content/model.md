## Model

Models are centralized data stores, which can be persisted to a backend. a Model represents not just a class for making models, but a top level store for all models of that type. 

### Model.init(func)

Initializes the Model, adding the Evented component and doing a load of other setup. optional `func` is called after init is done, useful for further setting up the Model.
After extending model, say to a class `Todos`, `Todos.init()` *must* be called immediately afterwards.

### Model(data)

Constructor function that makes new model instances from given objects of data.
Models are initialized with Evented, Computing, and Attributed components, and contain all the methods of those components. Models are attached initially to their constructor, so all model events appear on the constructor under the "model" prefix.

### Model.all()

Returns an array containing all of the model instances created from this Model. 

### Model.raw()

Returns an array containing all of the model instances *data* created from this Model. Due to the way data is stored in emvy, this isn't any additional work, so `raw()` is a good choice provided you don't modify any model data.

### Model.reset()

Resets the Model, removing all data and instances.

### Model.remove(model)

Deletes a single model. Queues up a delete in the persist queue. 

### Model.store(newStore)

Sets/gets the store of this model. Calling `store()` with no args returns the current one, otherwise the store is changed, and a `fetch()` is done using the new store.
See the reference localStore implementation for how to roll a store.

### Model.fetch(cb) 

Populates this model with models from the store. Calls `reset` with the new models, and finally runs cb with an array of the new models.

### Model.persist(cb)

Persists changes in all models to the store. All changes are queued up as they are made, (this could allow for incremental rollbacks in the future). `persist` pushes queued changes to the store, first compacting the queue to a minimal number of store calls. 

### Model.find(id)

Find and return the model with the given id. 

### Model.mask(name,func)

Makes a new model mask. Masks function as an event filter, allowing you to receive a subset of a models events. When a model emits an event, the model is passed to `func`. If `func` returns true, then the mask also emits that event. Otherwise, the event is suppressed. 

Calling `Model.mask(name)` retrieved a previously defined mask for use.

---