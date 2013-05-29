emvy.Router()

class Todo extends emvy.Model
Todo.init()


class TodoView extends emvy.View
  html: '<input type="checkbox" data-bind="done"><b data-bind="todo" data-dblclick="transition editing"></b>'
  tag: "li"
  constructor: ->
    super
    @is "Stateful",
      editing: -> # using a state machine is a little over the top for this, but example aims to show off as much as possible.
        html: '<span><input data-enter="transition initial" data-bind="todo"></span>'


class AppView extends emvy.View
  html: '<input data-enter="submit" data-bind="todo"><ul data-outlet="todos"></ul><b>Remaining:<span data-bind="remaining"></span></b> Double-click to edit. <u data-click="clear">clear done</u> <a data-link="to /random">Random Link</a>'
  submit: ->
    new Todo(todo: @get "todo")
    @set "todo",""
  clear: ->
    for todo in Todo.all()
      if todo.done then Todo.remove todo
  constructor: ->
    super
    @computed "remaining",->
      todos = Todo.all()
      count = todos.length
      for todo in todos
        if todo.done then count--
      return count
    , [Todo]  


app = new AppView
app.insertInto "body"

todosView = new emvy.ViewCollection(model:Todo,view:TodoView,parent:app,outlet:"todos")

window.app = app
window.Todo = Todo