## ViewCollection

ViewCollections serve to manage a load of views for a Model. Responding to events on the model, they create and destroy ViewModel instances and the respective views. ViewCollections are initialized with the Evented component.

### ViewCollection(options)

Create a new viewCollection. Options can contain values for parent, outlet, and view. Currently changing these on an viewCollection thats already been used is a really bad idea, its best to just set them in the options and be done with it. 

### viewCollection.model(newmodel)

This sets the viewColletions's Model. The old Model is detached, and the new is attached in its place. If no new Model is provided, the current model is returned.

### viewCollection.parent

Specifies the element into which created views should be inserted. 

### viewCollection.outlet

Specifies the named outlet within the parted into which created views should be inserted. 

### viewCollection.view

Specifies the view that should be used with the Model's models. 

---