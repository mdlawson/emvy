emvy.Router()

class Todo extends emvy.Model
Todo.init ->
  @store emvy.localStore "todos"
  @on "change:model", => @persist()
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
        <u data-click="clear">clear done</u> <u data-link="to /all">show all</u> <u data-link="to /active">show active</u> <u data-link="to /complete">show completed</u> 
        """
  submit: ->
    new Todo(todo: @get "todo")
    Todo.persist()
    @set "todo",""
  clear: ->
    for todo in Todo.all()
      if todo.get("done") then Todo.remove todo
    Todo.persist()
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

emvy.Router.on "active", -> todosView.model(Todo.mask "active")
emvy.Router.on "complete", -> todosView.model(Todo.mask "complete")
emvy.Router.on "all", -> todosView.model(Todo)

window.app = app # these are exposed for debugging purposes
window.todosView = todosView
window.Todo = Todo