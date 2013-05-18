#class Todos extends emvy.Model

class TodoView extends emvy.View
  html: '<b data-bind="title"></b><span data-bind="content"></span>'

app = new emvy.ViewCollection(model:emvy.Model,view:TodoView,parent:"body")

window.app = app
#window.Todos = Todos
window.TodoView = TodoView