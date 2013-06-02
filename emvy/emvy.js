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
    var Attributed, Computing, EObject, Element, Evented, Hiding, Model, ModelMask, Router, Stateful, View, ViewCollection, ViewModel, components, load;

    Evented = function(tag) {
      var all, callbacks, downstream, upstream;

      callbacks = {};
      upstream = [];
      downstream = [];
      all = [];
      return function() {
        var that;

        that = this;
        this.attach = function(something, oneway, up) {
          if (!up) {
            downstream.push(something);
            if (!oneway) {
              return something.attach(this, false, true);
            }
          } else {
            return upstream.push(something);
          }
        };
        this.detach = function(something, oneway, up) {
          var index;

          if (!up) {
            index = downstream.indexOf(something);
            if (index > -1) {
              downstream.splice(index, 1);
            }
            if (!oneway) {
              return something.detach(this, false, true);
            }
          } else {
            index = upstream.indexOf(something);
            if (index > -1) {
              return upstream.splice(index, 1);
            }
          }
        };
        this.on = function(action, callback) {
          var actions, _i, _len;

          if (!callback && typeof action === "function") {
            all.push(callback);
            return this;
          }
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
          var action, actions, allArgs, args, callback, item, parts, path, resolved, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2;

          action = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          actions = action.split(" ");
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            action = actions[_i];
            resolved = false;
            if (all.length) {
              allArgs = [action].concat(args);
              for (_j = 0, _len1 = all.length; _j < _len1; _j++) {
                callback = all[_j];
                if (callback.apply(that, allArgs) === true) {
                  resolved = true;
                }
              }
            }
            if (callbacks[action]) {
              _ref = callbacks[action];
              for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
                callback = _ref[_k];
                if (callback.apply(that, args) === true) {
                  resolved = true;
                }
              }
            }
            if (!(resolved || !(upstream.length || downstream.length))) {
              if (tag) {
                parts = action.split(":");
                if (parts.length > 1) {
                  path = parts[1].split(".");
                  if (path[0] !== tag) {
                    parts[1] = tag + "." + parts[1];
                  }
                } else {
                  parts[1] = tag;
                }
                action = parts.join(":");
              }
              for (_l = 0, _len3 = downstream.length; _l < _len3; _l++) {
                item = downstream[_l];
                if (item !== this) {
                  if ((_ref1 = item.trigger).call.apply(_ref1, [that, action].concat(__slice.call(args))) === true) {
                    return true;
                  }
                }
              }
              for (_m = 0, _len4 = upstream.length; _m < _len4; _m++) {
                item = upstream[_m];
                if (item !== this) {
                  if ((_ref2 = item.trigger).call.apply(_ref2, [that, action].concat(__slice.call(args))) === true) {
                    return true;
                  }
                }
              }
            }
          }
          return resolved;
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
        this.get = function(key) {
          return attributes[key];
        };
        this.all = function() {
          return attributes;
        };
        return this.set = function(key, value) {
          if ((this.validate && this.validate(key, value)) || !this.validate) {
            attributes[key] = value;
            this.trigger("change:" + key, value, attributes);
            return this.trigger("change", key, value, attributes);
          }
        };
      };
    };
    Element = function(tag, html) {
      var attributes, binds, classes, element, outlets;

      element = document.createElement(tag || "div");
      element.innerHTML = html || "";
      binds = {};
      attributes = {};
      classes = {};
      outlets = {};
      return function() {
        var ev, rebuild, runAction, _i, _len, _ref,
          _this = this;

        rebuild = function() {
          var attr, attrBinding, attrBinds, attributedElements, bind, bindElements, classBinding, classBinds, classyElements, conditions, el, func, name, outletElements, parts, ternery, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _name, _name1, _ref, _ref1, _ref2;

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
          for (_j = 0, _len1 = outletElements.length; _j < _len1; _j++) {
            el = outletElements[_j];
            name = el.getAttribute("data-outlet");
            outlets[name] = el;
          }
          attributedElements = element.querySelectorAll("[data-attr]");
          for (_k = 0, _len2 = attributedElements.length; _k < _len2; _k++) {
            el = attributedElements[_k];
            attrBinding = el.getAttribute("data-attr");
            attrBinds = attrBinding.split(" ");
            for (_l = 0, _len3 = attrBinds.length; _l < _len3; _l++) {
              bind = attrBinds[_l];
              parts = bind.split("|");
              attr = parts[0];
              ternery = parts[1].split("?");
              if (ternery.length === 1) {
                func = (function(el, name) {
                  return function(val) {
                    if (typeof val !== "undefined") {
                      return el.setAttribute(name, val);
                    } else {
                      return e.getAttribute(name);
                    }
                  };
                })(el, attr);
              } else {
                conditions = ternery[1].split(":");
                func = (function(el, name, opt1, opt2) {
                  return function(val) {
                    if (typeof val !== "undefined") {
                      if (opt2) {
                        return el.setAttribute(name, val ? opt1 : opt2);
                      } else if (val) {
                        return el.setAttribute(name, opt1);
                      } else {
                        return el.removeAttribute(name);
                      }
                    } else {
                      return el.getAttribute(name);
                    }
                  };
                })(el, attr, conditions[0], conditions[1]);
              }
              if ((_ref1 = attributes[_name = ternery[0]]) == null) {
                attributes[_name] = [];
              }
              attributes[ternery[0]].push(func);
            }
          }
          classyElements = element.querySelectorAll("[data-class]");
          for (_m = 0, _len4 = classyElements.length; _m < _len4; _m++) {
            el = classyElements[_m];
            classBinding = el.getAttribute("data-class");
            classBinds = classBinding.split(" ");
            for (_n = 0, _len5 = classBinds.length; _n < _len5; _n++) {
              bind = classBinds[_n];
              ternery = bind.split("?");
              if (ternery.length === 1) {
                func = (function(el) {
                  var currentVal;

                  currentVal = void 0;
                  return function(val) {
                    if (currentVal) {
                      el.className = el.className.replace(currentVal, "");
                    }
                    return el.className += currentVal = " " + val;
                  };
                })(el);
              } else {
                conditions = ternery[1].split(":");
                func = (function(el, opt1, opt2) {
                  return function(val) {
                    if (opt2) {
                      if (val) {
                        el.className = el.className.replace(" " + opt2, "");
                        return el.className += " " + opt1;
                      } else {
                        el.className = el.className.replace(" " + opt1, "");
                        return el.className += " " + opt2;
                      }
                    } else {
                      if (val) {
                        return el.className += " " + opt1;
                      } else {
                        return el.className = el.className.replace(" " + opt1, "");
                      }
                    }
                  };
                })(el, conditions[0], conditions[1]);
              }
              if ((_ref2 = classes[_name1 = ternery[0]]) == null) {
                classes[_name1] = [];
              }
              classes[ternery[0]].push(func);
            }
          }
        };
        runAction = function(action, e) {
          var parts;

          if (action) {
            parts = action.split(" ");
            action = parts.shift();
            parts.push(e);
            if (_this[action]) {
              return _this[action].apply(_this, parts);
            }
          }
        };
        _ref = ["click", "dblclick", "keypress", "keydown", "keyup", "change"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ev = _ref[_i];
          element.addEventListener(ev, function(e) {
            var el, link, name, parts, type;

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
                if (e.keyCode === 13) {
                  runAction(el.getAttribute("data-enter"), e);
                }
                runAction(el.getAttribute("data-keydown"), e);
                break;
              case "click":
                if (el.type === "checkbox") {
                  name = el.getAttribute("data-bind");
                  if (name) {
                    _this.trigger("change", name, el.checked, el);
                    _this.trigger("change:" + name, el.checked, el);
                  }
                } else {
                  link = el.getAttribute("data-link");
                  if (link) {
                    parts = link.split(" ");
                    emvy.Router.navigate[parts[0]](parts[1]);
                  }
                  runAction(el.getAttribute("data-click"), e);
                }
                break;
              default:
                runAction(el.getAttribute("data-" + type), e);
            }
            return e.stopPropagation();
          });
        }
        rebuild();
        this.set = function(name, val) {
          var attrs, cls, el, els, func, _j, _k, _l, _len1, _len2, _len3, _results;

          els = binds[name];
          if (els && els.length) {
            for (_j = 0, _len1 = els.length; _j < _len1; _j++) {
              el = els[_j];
              tag = el.tagName.toLowerCase();
              if (tag === "input" || tag === "textarea" || tag === "select") {
                if (el.type === "checkbox") {
                  el.checked = val;
                }
                el.value = val;
              } else {
                el.innerHTML = val;
              }
            }
          }
          attrs = attributes[name];
          if (attrs && attrs.length) {
            for (_k = 0, _len2 = attrs.length; _k < _len2; _k++) {
              func = attrs[_k];
              func(val);
            }
          }
          cls = classes[name];
          if (cls && cls.length) {
            _results = [];
            for (_l = 0, _len3 = cls.length; _l < _len3; _l++) {
              func = cls[_l];
              _results.push(func(val));
            }
            return _results;
          }
        };
        this.get = function(name) {
          var attrs, el, els;

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
            attrs = attributes[name];
            if (attrs && attrs.length) {
              return arrs[0]();
            }
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
    Computing = function() {
      return function() {
        return this.computed = function(name, func, deps) {
          var change, dep, str, _i, _len,
            _this = this;

          this[name] = func;
          str = "";
          change = function() {
            var value;

            value = _this[name]();
            _this.trigger("change change:computed", name, value);
            return _this.trigger("change:" + name + " change:computed." + name, value);
          };
          for (_i = 0, _len = deps.length; _i < _len; _i++) {
            dep = deps[_i];
            if ((typeof dep === "function" && dep.type === "Model") || (typeof dep === "object" && dep.on)) {
              dep.on("change", change);
              dep.on("change:model", change);
            } else {
              str += "change:" + dep + " ";
            }
          }
          this.on(str, change);
          return change();
        };
      };
    };
    Stateful = function(states) {
      var store;

      store = {
        initial: {}
      };
      return function() {
        var func, state, _results;

        this.transition = function(state) {
          var key, val;

          if (state = store[state]) {
            for (key in state) {
              val = state[key];
              if (this[key]) {
                if (typeof this[key] === "function" && typeof val !== "function") {
                  if (!store.initial[key]) {
                    store.initial[key] = this[key]();
                  }
                  this[key](val);
                } else {
                  if (!store.intitial[key]) {
                    store.initial[key] = this[key];
                  }
                  this[key] = val;
                }
              } else {
                this[key] = val;
              }
            }
            this.trigger("state:" + state);
            this.trigger("state:" + this.state + "->");
            this.trigger("state:" + this.state + "->" + state);
            return this.state = state;
          }
        };
        this.addState = function(name, state) {
          return store[name] = state;
        };
        _results = [];
        for (state in states) {
          func = states[state];
          _results.push(this.addState(state, func));
        }
        return _results;
      };
    };
    components = {
      Computing: Computing,
      Hiding: Hiding,
      Element: Element,
      Attributed: Attributed,
      Evented: Evented,
      Stateful: Stateful
    };
    load = function() {
      var args, component;

      component = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (typeof component === "string") {
        components[component].apply(components, args).call(this);
      } else {
        component.call(this);
      }
      return this;
    };
    EObject = (function() {
      function EObject() {}

      EObject.is = load;

      EObject.prototype.is = load;

      EObject.prototype.mixin = function(obj, ignore) {
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

      EObject.extend = function(childProps, childStatics) {
        var Class, constructor, key, value;

        constructor = childProps && childProps.constructor ? childProps.constructor : void 0;
        Class = (function(_super) {
          __extends(Class, _super);

          function Class() {
            Class.__super__.constructor.apply(this, arguments);
            constructor && constructor.apply(this, arguments);
          }

          return Class;

        })(this);
        if (childProps) {
          for (key in childProps) {
            value = childProps[key];
            if (key !== "constructor") {
              Class.prototype[key] = value;
            }
          }
        }
        if (childStatics) {
          for (key in childStatics) {
            value = childStatics[key];
            Class[key] = value;
          }
        }
        return Class;
      };

      return EObject;

    })();
    Model = (function(_super) {
      __extends(Model, _super);

      Model.type = "Model";

      function Model(data, rebuilding) {
        var _this = this;

        if (data == null) {
          data = {};
        }
        this.is(Evented("model"));
        this.is(Computing());
        this.is(Attributed(this.constructor.add(data, this, rebuilding)));
        this.on("change:view", function(key, val) {
          _this.set(key, val);
          return true;
        });
        this.on("reset:view", function(view) {
          var key, val, _ref;

          _ref = _this.all();
          for (key in _ref) {
            val = _ref[key];
            view.set(key, val);
          }
          return true;
        });
        this.attach(this.constructor, true, true);
        this.constructor.trigger("add", this);
        this.constructor.trigger("change");
      }

      Model.init = function(func) {
        var masks, models, queues, raws, store;

        this.is(Evented("Model"));
        models = [];
        raws = [];
        masks = {};
        queues = {};
        store = void 0;
        this.persist = function(cb) {
          var i, item, key, merge, queue, remaining, update1, val, _i, _j, _k, _len, _len1, _len2, _ref;

          merge = [];
          for (key in queues) {
            queue = queues[key];
            update1 = null;
            if (queue[0].action !== "create") {
              for (i = _i = 0, _len = queue.length; _i < _len; i = ++_i) {
                item = queue[i];
                if (item.action === "create") {
                  if (queue[0].action !== "create") {
                    queue.unshift(queue.splice(i, 1)[0]);
                  } else {
                    queue[0].model = item.model;
                    queue.splice(i, 1);
                  }
                }
              }
            }
            for (i = _j = 0, _len1 = queue.length; _j < _len1; i = ++_j) {
              item = queue[i];
              item.key = parseInt(key, 10);
              if (item.action === "destroy") {
                queue = [item];
                break;
              }
              if (item.action === "update" || item.action === "create") {
                if (update1 === null) {
                  update1 = item.model;
                } else {
                  _ref = item.model;
                  for (key in _ref) {
                    val = _ref[key];
                    update1[key] = val;
                  }
                  queue.splice(i, 1);
                }
              }
            }
            merge = merge.concat(queue);
          }
          queues = {};
          remaining = merge.length;
          for (_k = 0, _len2 = merge.length; _k < _len2; _k++) {
            item = merge[_k];
            store[item.action](item.key, item.model, function(err) {
              if (err && cb) {
                cb(err);
              }
              remaining--;
              if (remaining === 0 && cb) {
                return cb();
              }
            });
          }
          return merge;
        };
        this.store = function(newStore) {
          if (newStore) {
            store = newStore;
          }
          this.fetch();
          return store;
        };
        this.fetch = function(cb) {
          var _this = this;

          return store.read(function(results) {
            _this.reset(results, true);
            if (cb) {
              return cb(_this.all());
            }
          });
        };
        this.on("change:model", function(key, value, model) {
          var delta, _name, _ref;

          delta = {};
          delta[key] = value;
          if ((_ref = queues[_name = model.id]) == null) {
            queues[_name] = [];
          }
          return queues[model.id].push({
            action: "update",
            model: delta
          });
        });
        this.add = function(data, model, rebuilding) {
          var key, temp, val, _name, _ref;

          temp = raws[raws.length] = {
            id: raws.length + 1
          };
          models.push(model);
          for (key in data) {
            val = data[key];
            temp[key] = val;
          }
          if (!rebuilding) {
            if ((_ref = queues[_name = temp.id]) == null) {
              queues[_name] = [];
            }
            queues[temp.id].push({
              action: "create",
              model: temp
            });
          }
          return temp;
        };
        this.remove = function(model, raw) {
          var id, index, _name, _ref;

          if (raw) {
            index = raws.indexOf(model);
            model = models[index];
          } else {
            index = models.indexOf(model);
          }
          this.trigger("remove", model);
          if ((_ref = queues[_name = id = raws[index].id]) == null) {
            queues[_name] = [];
          }
          queues[id].push({
            action: "destroy",
            model: raws[index]
          });
          models.splice(index, 1);
          raws.splice(index, 1);
          return this.trigger("change");
        };
        this.reset = function(data, rebuilding) {
          var item, _i, _len;

          models = [];
          raws = [];
          this.trigger("reset");
          if (data) {
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              item = data[_i];
              new this(item, rebuilding);
            }
          }
          return this.trigger("change");
        };
        this.all = function() {
          return models.slice(0);
        };
        this.raw = function() {
          return raws.slice(0);
        };
        this.find = function(id) {
          var i, model, _i, _len;

          for (i = _i = 0, _len = raws.length; _i < _len; i = ++_i) {
            model = raws[i];
            if (model.id === id) {
              return models[i];
            }
          }
        };
        this.mask = function(name, func) {
          if (masks[name] && !func) {
            return masks[name];
          } else {
            return masks[name] = new ModelMask(this, func);
          }
        };
        if (func) {
          func.call(this);
        }
        return this;
      };

      return Model;

    })(EObject);
    ModelMask = (function(_super) {
      __extends(ModelMask, _super);

      function ModelMask(Model, func) {
        this.is(Evented());
        Model.attach(this, true, false);
        this.on("Model.remove Model.add", function(model) {
          if (func(model)) {
            return false;
          } else {
            return true;
          }
        });
        this.all = function() {
          var item;

          return (function() {
            var _i, _len, _ref, _results;

            _ref = Model.all();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              if (func(item)) {
                _results.push(item);
              }
            }
            return _results;
          })();
        };
        this.raw = function() {
          var item;

          return (function() {
            var _i, _len, _ref, _results;

            _ref = Model.raw();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              if (func(item)) {
                _results.push(item);
              }
            }
            return _results;
          })();
        };
        this.remove = function() {
          return Model.remove.apply(Model, arguments);
        };
        this.reset = function() {
          return Model.reset.apply(Model, arguments);
        };
      }

      return ModelMask;

    })(EObject);
    View = (function(_super) {
      __extends(View, _super);

      function View(options) {
        var _this = this;

        if (options == null) {
          options = {};
        }
        this.is(Evented("view"));
        this.is(Element(options.tag || this.tag, options.html || this.html));
        this.is(Computing());
        this.mixin(options, ["tag", "html"]);
        this.on("change:model change:computed", function(key, val) {
          return _this.set(key, val);
        });
      }

      return View;

    })(EObject);
    ViewModel = (function(_super) {
      __extends(ViewModel, _super);

      function ViewModel(options) {
        var setter;

        if (options == null) {
          options = {};
        }
        this.is(Evented());
        this.is(Computing());
        setter = function(old, val) {
          old && old.detach(this);
          val.attach(this);
          return val;
        };
        this.is(Hiding("model", options.model, setter));
        this.is(Hiding("view", options.view, setter));
        options.view.trigger("reset", options.view);
        this.mixin(options, ["model", "view"]);
      }

      return ViewModel;

    })(EObject);
    ViewCollection = (function(_super) {
      __extends(ViewCollection, _super);

      function ViewCollection(options) {
        var viewmodels,
          _this = this;

        if (options == null) {
          options = {};
        }
        this.is(Evented());
        this.mixin(options, ["model"]);
        viewmodels = {};
        this.on("add:Model", function(model) {
          var view;

          view = new (_this.view || options.view);
          viewmodels[model.get("id")] = new ViewModel({
            model: model,
            view: view
          });
          if (_this.parent) {
            return view.insertInto(_this.parent, _this.outlet);
          }
        });
        this.on("remove:Model", function(model) {
          var id, viewmodel;

          id = model.get("id");
          viewmodel = viewmodels[id];
          viewmodel.view().remove();
          return delete viewmodels[id];
        });
        this.on("reset:Model", function() {
          viewmodels = [];
          return _this.parent.clean(_this.outlet);
        });
        this.is(Hiding("model", options.model, function(old, val) {
          var model, _i, _len, _ref;

          old && old.detach(this, true, false);
          val.attach(this, true, false);
          this.trigger("reset:Model");
          _ref = val.all();
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            this.trigger("add:Model", model);
          }
          return val;
        }));
      }

      return ViewCollection;

    })(EObject);
    Router = function(options) {
      if (options == null) {
        options = {};
      }
      return (function() {
        var emitEvents, oldparts, root,
          _this = this;

        root = options.root;
        oldparts = void 0;
        Evented().call(this);
        emitEvents = function() {
          var i, parts, path, post, pre;

          path = window.location.pathname;
          if (options.root) {
            if (!path.indexOf(root)) {
              path = path.substr(root.length);
            }
          }
          parts = path.split("/").slice(1);
          i = 0;
          while (i < parts.length) {
            pre = parts.slice(0, i);
            post = parts.slice(i);
            if (pre.length) {
              post.unshift(pre.join("."));
            }
            _this.trigger.apply(_this, post);
            i++;
          }
          return oldparts = parts;
        };
        this.navigate = {};
        this.navigate.to = function(url) {
          history.pushState({}, document.title, url);
          return emitEvents();
        };
        this.navigate.up = function() {
          var path;

          path = window.location.pathname.split("/");
          path.pop();
          return this.to(path.join("/"));
        };
        this.navigate.down = function(to) {
          var path;

          path = window.location.pathame.split("/");
          path.push(to);
          this.trigger(path[path.length - 2], path[path.length - 1]);
          return this.to(path.join("/"));
        };
        this.navigate.across = function(to) {
          var path;

          path = window.location.pathname.split("/");
          path[path.length - 1] = to;
          this.trigger(path[path.length - 2], path[path.length - 1]);
          return this.to(path.join("/"));
        };
        return window.addEventListener("popstate", emitEvents);
      }).call(Router);
    };
    return {
      Object: EObject,
      Router: Router,
      Model: Model,
      View: View,
      ViewModel: ViewModel,
      ViewCollection: ViewCollection
    };
  });

  /*
  TODO:
  - Better Router
  */


}).call(this);
