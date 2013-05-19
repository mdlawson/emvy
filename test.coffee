class Todo extends emvy.Model
Todo.init()


class TodoView extends emvy.View
  html: '<input type="checkbox" data-bind="done"><b data-bind="todo" data-dblclick="edit"></b>'
  tag: "li"
  edit: ->
    @original = @html()
    @html '<span><input data-enter="commit" data-bind="todo"></span>'
  commit: ->
    @html(@original)

class AppView extends emvy.View
  html: '<input data-enter="submit" data-bind="todo"><ul data-outlet="todos"></ul>Double-click to edit. <u data-click="clear">clear done</u>'
  submit: ->
    new Todo(todo: @get "todo")
    @set "todo",""
  clear: ->
    console.log Todo.all()
    for todo in Todo.all()
      if todo.done then Todo.remove todo


app = new AppView
app.insertInto "body"

todosView = new emvy.ViewCollection(model:Todo,view:TodoView,parent:app,outlet:"todos")

window.app = app
window.Todo = Todo