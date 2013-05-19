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
    var Attributed, Base, Bubbling, Element, Evented, Hiding, Model, View, ViewCollection, ViewModel;

    Evented = function() {
      var callbacks, subscribers;

      callbacks = {};
      subscribers = [];
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
          var action, actions, args, callback, sub, _i, _j, _k, _len, _len1, _len2, _ref;

          action = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          actions = action.split(" ");
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            action = actions[_i];
            for (_j = 0, _len1 = subscribers.length; _j < _len1; _j++) {
              sub = subscribers[_j];
              sub.apply(null, [action].concat(__slice.call(args)));
            }
            if (callbacks[action]) {
              _ref = callbacks[action];
              for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
                callback = _ref[_k];
                if (callback.apply(this, args) === false) {
                  break;
                }
              }
            }
          }
          return this;
        };
        this.off = function(action, callback) {
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
        this.subscribe = function(me) {
          return subscribers.push(me);
        };
        return this.unsubscribe = function(me) {
          var index;

          index = subscribers.indexOf(me);
          if (index) {
            return subscribers.splice(index, 1);
          }
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
      var binds, element, outlets;

      element = document.createElement(tag || "div");
      element.innerHTML = html || "";
      binds = {};
      outlets = {};
      return function() {
        var ev, rebuild, _i, _len, _ref,
          _this = this;

        this.is(Evented());
        rebuild = function() {
          var bindElements, el, name, outletElements, _i, _j, _len, _len1, _ref, _results;

          bindElements = element.querySelectorAll("[data-bind]");
          for (_i = 0, _len = bindElements.length; _i < _len; _i++) {
            el = bindElements[_i];
            name = el.getAttribute("data-bind");
            if ((_ref = binds[name]) == null) {
              binds[name] = [];
            }
            binds[name].push(el);
          }
          outletElements = element.querySelectorAll("[data-outlet]");
          _results = [];
          for (_j = 0, _len1 = outletElements.length; _j < _len1; _j++) {
            el = outletElements[_j];
            name = el.getAttribute("data-outlet");
            _results.push(outlets[name] = el);
          }
          return _results;
        };
        _ref = ["click", "dblclick", "keypress", "keydown", "keyup", "change"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ev = _ref[_i];
          element.addEventListener(ev, function(e) {
            var action, el, name, type;

            el = e.target;
            type = e.type;
            switch (type) {
              case "change":
                name = el.getAttribute("data-bind");
                if (name && el.type !== "checkbox") {
                  _this.trigger("change", name, el.value, el);
                  _this.trigger("change:" + name, el.value, el);
                }
                break;
              case "keydown":
                action = el.getAttribute("data-enter");
                if (e.keyCode === 13 && action && _this[action]) {
                  _this[action](e);
                }
                action = el.getAttribute("data-keydown");
                if (_this[action]) {
                  _this[action](e);
                }
                break;
              case "click":
                if (el.type === "checkbox") {
                  name = el.getAttribute("data-bind");
                  if (name) {
                    _this.trigger("change", name, el.checked, el);
                    _this.trigger("change:" + name, el.checked, el);
                  }
                } else {
                  action = el.getAttribute("data-click");
                  if (_this[action]) {
                    _this[action](e);
                  }
                }
                break;
              default:
                action = el.getAttribute("data-" + type);
                if (_this[action]) {
                  _this[action](e);
                }
            }
            return e.stopPropagation();
          });
        }
        rebuild();
        this.set = function(name, val) {
          var el, els, _j, _len1, _results;

          els = binds[name];
          if (!(els && els.length)) {
            return;
          }
          _results = [];
          for (_j = 0, _len1 = els.length; _j < _len1; _j++) {
            el = els[_j];
            tag = el.tagName.toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select") {
              if (el.type === "checkbox") {
                el.checked = val;
              }
              _results.push(el.value = val);
            } else {
              _results.push(el.innerHTML = val);
            }
          }
          return _results;
        };
        this.get = function(name) {
          var el, els;

          els = binds[name];
          if (!(els && (el = els[0]))) {
            return void 0;
          }
          tag = el.tagName.toLowerCase();
          if (tag === "input" || tag === "textarea" || tag === "select") {
            if (el.type === "checkbox") {
              return el.checked;
            }
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
          rebuild();
          return this.trigger("reset", this);
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
            return outlets[outlet].appendChild(view);
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
    Hiding = function(prop, val, set, get) {
      var value;

      value = null;
      return function() {
        this[prop] = function(newval) {
          if (!newval) {
            if (get) {
              return get.call(this, value);
            } else {
              return value;
            }
          } else {
            value = set ? set.call(this, value, newval) : newval;
            return this;
          }
        };
        return this[prop](val);
      };
    };
    Bubbling = function(uptype, downtype, up) {
      var computeds, deps;

      computeds = {};
      deps = {};
      return function() {
        var down, that;

        that = this;
        down = function() {
          var args, ev, parts;

          ev = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          parts = ev.split(".");
          if (parts[0] === downtype) {
            return that.trigger.apply(that, [ev].concat(__slice.call(args)));
          }
        };
        this.up = function(newup) {
          if (newup) {
            if (up) {
              up.unsubscribe(down);
            }
            up = newup;
            return up.subscribe(down);
          } else {
            return up;
          }
        };
        this.up(up);
        return this.subscribe(function() {
          var args, ev, parts;

          ev = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (up) {
            parts = ev.split(".");
            if (parts[0] !== downtype) {
              return up.trigger.apply(up, ["" + uptype + "." + ev].concat(__slice.call(args)));
            }
          }
        });
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

      function Model(data) {
        var _this = this;

        if (data == null) {
          data = {};
        }
        this.is(Attributed(this.constructor.add(data)));
        this.is(Bubbling("model", "view"));
        this.on("view.change", function(key, val) {
          return _this.set(key, val);
        });
        this.on("view.reset", function(view) {
          var key, val, _ref, _results;

          _ref = _this.all();
          _results = [];
          for (key in _ref) {
            val = _ref[key];
            _results.push(view.set(key, val));
          }
          return _results;
        });
        this.constructor.trigger("add", this);
      }

      Model.init = function() {
        var models;

        this.is(Evented());
        models = [];
        this.add = function(data) {
          var key, model, val;

          model = models[models.length] = {
            id: models.length
          };
          for (key in data) {
            val = data[key];
            model[key] = val;
          }
          return model;
        };
        this.remove = function(model) {
          this.trigger("remove", model);
          return models.splice(models.indexOf(model), 1);
        };
        this.reset = function(data) {
          var item, _i, _len;

          models = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            new this(item);
          }
          return this.trigger("reset", models);
        };
        this.all = function() {
          return models.slice(0);
        };
        return this;
      };

      return Model;

    })(Base);
    View = (function(_super) {
      __extends(View, _super);

      function View(options) {
        var _this = this;

        if (options == null) {
          options = {};
        }
        this.is(Element(options.tag || this.tag, options.html || this.html));
        this.is(Bubbling("view", "model"));
        this.mixin(options, ["tag", "html"]);
        this.on("model.change computed.change", function(key, val) {
          return _this.set(key, val);
        });
      }

      return View;

    })(Base);
    ViewModel = (function(_super) {
      __extends(ViewModel, _super);

      function ViewModel(options) {
        var setter;

        if (options == null) {
          options = {};
        }
        this.is(Evented());
        setter = function(old, val) {
          old && old.up(null);
          val.up(this);
          return val;
        };
        this.is(Hiding("model", options.model, setter));
        this.is(Hiding("view", options.view, setter));
        options.view.trigger("reset", options.view);
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

          id = model.id;
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
        this.is(Hiding("model", options.model, function(old, model) {
          if (old) {
            old.off("add", add);
            old.off("remove", remove);
            old.off("reset", reset);
          }
          model.on("add", add);
          model.on("remove", remove);
          model.on("reset", reset);
          return model;
        }));
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
