// Generated by CoffeeScript 1.6.2
(function() {
  var AppView, Todo, TodoView, app, todosView, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Todo = (function(_super) {
    __extends(Todo, _super);

    function Todo() {
      _ref = Todo.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return Todo;

  })(emvy.Model);

  Todo.init();

  TodoView = (function(_super) {
    __extends(TodoView, _super);

    function TodoView() {
      _ref1 = TodoView.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    TodoView.prototype.html = '<input type="checkbox" data-bind="done"><b data-bind="todo" data-dblclick="edit"></b>';

    TodoView.prototype.tag = "li";

    TodoView.prototype.edit = function() {
      this.original = this.html();
      return this.html('<span><input data-enter="commit" data-bind="todo"></span>');
    };

    TodoView.prototype.commit = function() {
      return this.html(this.original);
    };

    return TodoView;

  })(emvy.View);

  AppView = (function(_super) {
    __extends(AppView, _super);

    AppView.prototype.html = '<input data-enter="submit" data-bind="todo"><ul data-outlet="todos"></ul><b>Remaining:<span data-bind="remaining"></span></b> Double-click to edit. <u data-click="clear">clear done</u>';

    AppView.prototype.submit = function() {
      new Todo({
        todo: this.get("todo")
      });
      return this.set("todo", "");
    };

    AppView.prototype.clear = function() {
      var todo, _i, _len, _ref2, _results;

      _ref2 = Todo.all();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        todo = _ref2[_i];
        if (todo.done) {
          _results.push(Todo.remove(todo));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    function AppView() {
      AppView.__super__.constructor.apply(this, arguments);
      this.computed("remaining", function() {
        var count, todo, todos, _i, _len;

        todos = Todo.all();
        count = todos.length;
        for (_i = 0, _len = todos.length; _i < _len; _i++) {
          todo = todos[_i];
          if (todo.done) {
            count--;
          }
        }
        return count;
      }, [Todo]);
    }

    return AppView;

  })(emvy.View);

  app = new AppView;

  app.insertInto("body");

  todosView = new emvy.ViewCollection({
    model: Todo,
    view: TodoView,
    parent: app,
    outlet: "todos"
  });

  window.app = app;

  window.Todo = Todo;

}).call(this);
