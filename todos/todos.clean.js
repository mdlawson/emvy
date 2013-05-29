emvy.Router();

Todo = emvy.Model.extend();
Todo.init();

TodoView = emvy.View.extend({
  html: '<input type="checkbox" data-bind="done"><b data-bind="todo" data-dblclick="transition editing"></b>',
  tag: 'li',
  constructor: function(){
    this.is("Stateful",{
      editing: function(){
        return {
          html: '<span><input data-enter="transition initial" data-bind="todo"></span>'
        };
      }
    });
  }
});

AppView = emvy.View.extend({
  html: '<input data-enter="submit" data-bind="todo"><ul data-outlet="todos"></ul><b>Remaining:<span data-bind="remaining"></span></b> Double-click to edit. <u data-click="clear">clear done</u> <a data-link="to /random">Random Link</a>',
  submit: function(){
    new Todo({todo: this.get("todo")});
    this.set("todo","");
  },
  clear: function(){
    var todos = Todo.all();
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].done) {
        Todo.remove(todos[i]);
      }
    }
  },
  constructor: function() {
    this.computed("remaining",function(){
      var todos = Todo.all();
      var count = todos.length;
      for (var i = 0; i < todos.length; i++) {
        if (todos[i].done) count--;
      }
      return count;
    },[Todo]);
  }
});

app = new AppView();
app.insertInto("body");

todosView = new emvy.ViewCollection({model:Todo,view:TodoView,parent:app,outlet:"todos"});

window.app = app;
window.Todo = Todo;