emvy.Router();

var Todo = emvy.Model.extend();
Todo.init(function(){
  this.mask("active",function(todo){
    if (!todo.get("done")) return true;
  });
  this.mask("complete",function(todo){
    if (todo.get("done")) return true;
  });
});

var TodoView = emvy.View.extend({
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

var AppView = emvy.View.extend({
  html: '<input data-enter="submit" data-bind="todo"><ul data-outlet="todos"></ul><b>Remaining:<span data-bind="remaining"></span></b> Double-click to edit. <u data-click="clear">clear done</u> <u data-link="to /all">show all</u> <u data-link="to /active">show active</u> <u data-link="to /complete">show completed</u>',
  submit: function(){
    new Todo({todo: this.get("todo")});
    this.set("todo","");
  },
  clear: function(){
    var todos = Todo.all();
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].get("done")) {
        Todo.remove(todos[i]);
      }
    }
  },
  constructor: function() {
    this.computed("remaining",function(){
      var todos = Todo.raw();
      var count = todos.length;
      for (var i = 0; i < todos.length; i++) {
        if (todos[i].done) count--;
      }
      return count;
    },[Todo]);
  }
});

var app = new AppView();
app.insertInto("body");

var todosView = new emvy.ViewCollection({model:Todo,view:TodoView,parent:app,outlet:"todos"});

emvy.Router.on("active", function(){ todosView.model(Todo.mask("active"));});
emvy.Router.on("complete", function(){ todosView.model(Todo.mask("complete"));});
emvy.Router.on("all", function(){ todosView.model(Todo);});


window.app = app; // debugging stuff
window.Todo = Todo;