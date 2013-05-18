// Generated by CoffeeScript 1.6.2
(function() {
  var __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(root, factory) {
    if (typeof exports === "object") {
      return module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
      return define(factory);
    } else {
      return root.emvy = factory();
    }
  })(this, function() {
    var Attributed, Base, Binding, Element, Evented, Hiding, Model, View, ViewCollection, ViewModel;

    Evented = function() {
      var callbacks;

      callbacks = {};
      return function() {
        this.on = function(action, callback) {
          var actions, _i, _len;

          actions = action.split(" ");
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            action = actions[_i];
            callbacks[action] || (callbacks[action] = []);
            callbacks[action].push(callback);
          }
          return this;
        };
        this.once = function(action, callback) {
          var cb;

          return this.on(action, cb = function() {
            this.off(action, cb);
            return callback.apply(this, arguments);
          });
        };
        this.trigger = function() {
          var action, actions, args, callback, _i, _j, _len, _len1, _ref;

          action = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          actions = action.split(" ");
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            action = actions[_i];
            if (callbacks[action]) {
              _ref = callbacks[action];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                callback = _ref[_j];
                if (callback.apply(this, args) === false) {
                  break;
                }
              }
            }
          }
          return this;
        };
        return this.off = function(action, callback) {
          var actions, cbs, i, item, _i, _j, _len, _len1;

          if (!action) {
            callbacks = {};
            return;
          }
          actions = action.split(" ");
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            action = actions[_i];
            if (!callback) {
              delete callbacks[action];
            } else {
              cbs = callbacks[action];
              if (cbs) {
                for (i = _j = 0, _len1 = cbs.length; _j < _len1; i = ++_j) {
                  item = cbs[i];
                  if (item === callback) {
                    cbs.splice(i, 1);
                  }
                }
              }
            }
          }
          return this;
        };
      };
    };
    Attributed = function(attributes) {
      if (attributes == null) {
        attributes = {};
      }
      return function() {
        this.is(Evented());
        this.get = function(key) {
          return attributes[key];
        };
        this.all = function() {
          return attributes;
        };
        return this.set = function(key, value) {
          attributes[key] = value;
          this.trigger("change:" + key, value);
          return this.trigger("change", key, value);
        };
      };
    };
    Element = function(tag, html) {
      var binds, element, outlets, rebuild;

      element = document.createElement(tag || "div");
      element.innerHTML = html || "";
      binds = {};
      outlets = {};
      rebuild = function() {
        var bindElements, el, name, _i, _j, _len, _len1, _results;

        bindElements = element.querySelectorAll("[data-bind]");
        for (_i = 0, _len = bindElements.length; _i < _len; _i++) {
          el = bindElements[_i];
          name = el.getAttribute("data-bind");
          binds[name] = el;
        }
        outlets = element.querySelectorAll("[data-outlet]");
        _results = [];
        for (_j = 0, _len1 = outlets.length; _j < _len1; _j++) {
          el = outlets[_j];
          name = el.getAttribute("data-outlet");
          _results.push(outlets[name] = el);
        }
        return _results;
      };
      rebuild();
      return function() {
        var _this = this;

        this.is(Evented());
        element.addEventListener("change", function(e) {
          var el, name;

          el = e.target;
          name = el.getAttribute("data-bind");
          if (name) {
            _this.trigger("change", name, el.value, el);
            return _this.trigger("change:" + name, el.value, el);
          }
        });
        this.set = function(name, val) {
          var el;

          el = binds[name];
          if (!el) {
            return;
          }
          tag = el.tagName.toLowerCase();
          if (tag === "input" || tag === "textarea" || tag === "select") {
            return el.value = val;
          } else {
            return el.innerHTML = val;
          }
        };
        this.get = function(name) {
          var el;

          el = binds[name];
          if (!el) {
            return void 0;
          }
          tag = el.tagName.toLowerCase();
          if (tag === "input" || tag === "textarea" || tag === "select") {
            return el.value;
          } else {
            return el.innerHTML;
          }
        };
        this.html = function(data) {
          if (!data) {
            return element.innerHTML;
          }
          element.innerHTML = data || "";
          return rebuild();
        };
        this.insertInto = function(view, outlet) {
          var el;

          if (typeof view === "string") {
            el = document.querySelector(view);
            return el.appendChild(element);
          } else {
            return view.insert(element, outlet);
          }
        };
        this.insert = function(view, outlet) {
          if (view.insertInto) {
            return this.insertInto(this, outlet);
          } else {
            return outlets[name].appendChild(view);
          }
        };
        this.remove = function() {
          if (element.parentNode) {
            return element.parentNode.removeChild(element);
          }
        };
        return this.clean = function(outlet) {
          var el, _results, _results1;

          if (!outlet) {
            _results = [];
            for (outlet in outlets) {
              el = outlets[outlet];
              _results.push(this.clean(outlet));
            }
            return _results;
          } else {
            el = outlets[outlet];
            _results1 = [];
            while (el.firstChild) {
              _results1.push(el.removeChild(el.firstChild));
            }
            return _results1;
          }
        };
      };
    };
    Binding = function(bind1, bind2) {
      var a, b, bind, updatea, updateb;

      a = b = updatea = updateb = null;
      bind = function(newa, newb) {
        if (a) {
          a.off("change", updateb);
        }
        if (b) {
          b.off("change", updatea);
        }
        a = newa;
        b = newb;
        a.on("change", updateb = function(key, val) {
          return b.set(key, val);
        });
        return b.on("change", updatea = function(key, val) {
          return a.set(key, val);
        });
      };
      bind(bind1[1], bind2[1]);
      return function() {
        this[bind1[0]] = function(newa) {
          if (newa) {
            return bind(newa, bind2[1]);
          } else {
            return a;
          }
        };
        return this[bind2[0]] = function(newb) {
          if (newb) {
            return bind(bind1[1], newb);
          } else {
            return b;
          }
        };
      };
    };
    Hiding = function(prop, set, get) {
      var value;

      value = null;
      if (!get) {
        get = function() {
          return value;
        };
      }
      if (!set) {
        set = function(newval) {
          return newval;
        };
      }
      return function() {
        return this[prop] = function(newval) {
          if (!newval) {
            return get.call(this, value);
          } else {
            value = set.call(this, value, newval);
            return this;
          }
        };
      };
    };
    Base = (function() {
      function Base() {}

      Base.is = function(type) {
        return type.call(this);
      };

      Base.prototype.is = function(type) {
        return type.call(this);
      };

      Base.prototype.mixin = function(obj, ignore) {
        var key, val, _results;

        _results = [];
        for (key in obj) {
          val = obj[key];
          if (__indexOf.call(ignore, key) < 0) {
            _results.push(this[key] = val);
          }
        }
        return _results;
      };

      return Base;

    })();
    Model = (function(_super) {
      __extends(Model, _super);

      Model.is(Evented());

      Model.models = [];

      function Model(keys) {
        var id, key, val;

        if (keys == null) {
          keys = {};
        }
        this.is(Attributed(this.constructor.models[id = this.constructor.models.length] = {}));
        this.set("id", id);
        for (key in keys) {
          val = keys[key];
          this.set(key, val);
        }
        this.constructor.trigger("add", this);
      }

      Model.all = function() {
        return this.models;
      };

      Model.remove = function(model) {
        this.trigger("remove", model);
        return this.models.splice(this.models.indexOf(model), 1);
      };

      Model.reset = function(data) {
        var item, _i, _len;

        this.models = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          new this(item);
        }
        return this.trigger("reset", this.models);
      };

      return Model;

    })(Base);
    View = (function(_super) {
      __extends(View, _super);

      function View(options) {
        if (options == null) {
          options = {};
        }
        this.is(Element(options.tag || this.tag, options.html || this.html));
        this.mixin(options, ["tag", "html"]);
      }

      return View;

    })(Base);
    ViewModel = (function(_super) {
      __extends(ViewModel, _super);

      function ViewModel(options) {
        var key, val, _ref;

        if (options == null) {
          options = {};
        }
        this.is(Binding(["model", options.model], ["view", options.view]));
        _ref = options.model.all();
        for (key in _ref) {
          val = _ref[key];
          options.view.set(key, val);
        }
        this.mixin(options, ["model", "view"]);
      }

      return ViewModel;

    })(Base);
    ViewCollection = (function(_super) {
      __extends(ViewCollection, _super);

      function ViewCollection(options) {
        var add, remove, reset, viewmodels,
          _this = this;

        if (options == null) {
          options = {};
        }
        this.mixin(options, ["model"]);
        viewmodels = {};
        add = function(model) {
          var view;

          view = new (_this.view || options.view);
          viewmodels[model.get("id")] = new ViewModel({
            model: model,
            view: view
          });
          if (_this.parent) {
            return view.insertInto(_this.parent, _this.outlet);
          }
        };
        remove = function(model) {
          var id, viewmodel;

          id = model.get("id");
          viewmodel = viewmodels[id];
          viewmodel.view().remove();
          return delete viewmodels[id];
        };
        reset = function(data) {
          var model, _i, _len, _results;

          viewmodels = [];
          _this.parent.clean(_this.outlet);
          if (data) {
            _results = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              model = data[_i];
              _results.push(add(model));
            }
            return _results;
          }
        };
        this.is(Hiding("model", function(old, model) {
          if (old) {
            old.off("add", add);
            old.off("remove", remove);
            old.off("reset", reset);
          }
          model.on("add", add);
          model.on("remove", remove);
          return model.on("reset", reset);
        }));
        this.model(options.model);
      }

      return ViewCollection;

    })(Base);
    return {
      Model: Model,
      View: View,
      ViewModel: ViewModel,
      ViewCollection: ViewCollection
    };
  });

}).call(this);
