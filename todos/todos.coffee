emvy.Router()

class Todo extends emvy.Model
Todo.init ->
  @mask "active", (todo) ->
    if not todo.get("done") then return true
  @mask "complete", (todo) ->
    if todo.get("done") then return true

class TodoView extends emvy.View
  html: '<input type="checkbox" data-bind="done"><b data-bind="todo" data-dblclick="transition editing"></b>'
  tag: "li"
  constructor: ->
    super
    @is "Stateful",
      editing: -> # using a state machine is a little over the top for this, but example aims to show off as much as possible.
        html: '<span><input data-enter="transition initial" data-bind="todo"></span>'


class AppView extends emvy.View
  html: """
        <input data-enter="submit" data-bind="todo">
        <ul data-outlet="todos"></ul>
        <b>Remaining:<span data-bind="remaining"></span></b> Double-click to edit. 
        <u data-click="clear">clear done</u> <u data-click="all">show all</u> <u data-click="active">show active</u> <u data-click="complete">show completed</u> 
        """
  submit: ->
    new Todo(todo: @get "todo")
    @set "todo",""
  clear: ->
    for todo in Todo.all()
      if todo.get("done") then Todo.remove todo
  all: ->
    todosView.model Todo
  active: ->
    todosView.model Todo.mask "active"
  complete: ->
    todosView.model Todo.mask "complete"
  constructor: ->
    super
    @computed "remaining",->
      todos = Todo.raw()
      count = todos.length
      for todo in todos
        if todo.done then count--
      return count
    , [Todo]  


app = new AppView
app.insertInto "body"

todosView = new emvy.ViewCollection(model:Todo,view:TodoView,parent:app,outlet:"todos")

window.app = app # these are exposed for debugging purposes
window.todosView = todosView
window.Todo = Todo