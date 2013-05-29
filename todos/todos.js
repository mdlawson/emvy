// Generated by CoffeeScript 1.6.2
(function() {
  var AppView, Todo, TodoView, app, todosView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  emvy.Router();

  Todo = (function(_super) {
    __extends(Todo, _super);

    function Todo() {
      _ref = Todo.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return Todo;

  })(emvy.Model);

  Todo.init(function() {
    this.mask("active", function(todo) {
      if (!todo.get("done")) {
        return true;
      }
    });
    return this.mask("complete", function(todo) {
      if (todo.get("done")) {
        return true;
      }
    });
  });

  TodoView = (function(_super) {
    __extends(TodoView, _super);

    TodoView.prototype.html = '<input type="checkbox" data-bind="done"><b data-bind="todo" data-dblclick="transition editing"></b>';

    TodoView.prototype.tag = "li";

    function TodoView() {
      TodoView.__super__.constructor.apply(this, arguments);
      this.is("Stateful", {
        editing: function() {
          return {
            html: '<span><input data-enter="transition initial" data-bind="todo"></span>'
          };
        }
      });
    }

    return TodoView;

  })(emvy.View);

  AppView = (function(_super) {
    __extends(AppView, _super);

    AppView.prototype.html = "<input data-enter=\"submit\" data-bind=\"todo\">\n<ul data-outlet=\"todos\"></ul>\n<b>Remaining:<span data-bind=\"remaining\"></span></b> Double-click to edit. \n<u data-click=\"clear\">clear done</u> <u data-click=\"all\">show all</u> <u data-click=\"active\">show active</u> <u data-click=\"complete\">show completed</u> ";

    AppView.prototype.submit = function() {
      new Todo({
        todo: this.get("todo")
      });
      return this.set("todo", "");
    };

    AppView.prototype.clear = function() {
      var todo, _i, _len, _ref1, _results;

      _ref1 = Todo.all();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        todo = _ref1[_i];
        if (todo.get("done")) {
          _results.push(Todo.remove(todo));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    AppView.prototype.all = function() {
      return todosView.model(Todo);
    };

    AppView.prototype.active = function() {
      return todosView.model(Todo.mask("active"));
    };

    AppView.prototype.complete = function() {
      return todosView.model(Todo.mask("complete"));
    };

    function AppView() {
      AppView.__super__.constructor.apply(this, arguments);
      this.computed("remaining", function() {
        var count, todo, todos, _i, _len;

        todos = Todo.raw();
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

  window.todosView = todosView;

  window.Todo = Todo;

}).call(this);
