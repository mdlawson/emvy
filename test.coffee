class Todos extends emvy.Model
Todos.init()


class TodoView extends emvy.View
  html: '<input type="checkbox" data-bind="done"><b data-bind="todo" data-dblclick="edit"></b>'
  tag: "li"
  edit: ->
    @original = @html()
    @html '<span><input data-enter="commit" data-bind="todo"></span>'
  commit: ->
    @html(@original)

class AppView extends emvy.View
  html: '<input data-enter="submit" data-bind="todo"><ul data-outlet="todos"></ul>Double-click to edit'
  submit: ->
    new Todos(todo: @get "todo")
    @set "todo",""

app = new AppView
app.insertInto "body"

todos = new emvy.ViewCollection(model:Todos,view:TodoView,parent:app,outlet:"todos")

window.app = app
window.Todos = Todos