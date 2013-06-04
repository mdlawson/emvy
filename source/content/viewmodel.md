## ViewModel

ViewModels serve as a simple connection point for views and models (duh!). View Models are initialized with the Evented and Computing components. ViewModels are really just a convenience class, theres nothing here that couldn't be achieved by manually `attach`ing views and models together. Viewmodels are initialized with the Evented and Computing components

### ViewModel(options)

Create a new viewModel. options can contain values for view and model, and this will be used. 

### viewModel.model(newmodel)

This sets the viewmodel's model. The old model is detached, and the new is attached in its place. If no new model is provided, the current model is returned.

### viewModel.view(newview)

Basically the above but with the view.

---