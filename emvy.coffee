((root, factory) ->
  if typeof exports is "object"
    module.exports = factory()
  else if typeof define is "function" and define.amd
    define factory
  else
    root.emvy = factory()
) this, ->
  
  Evented = ->
    callbacks = {}
    #pipes = []
    return ->
      @on = (action, callback) ->
        actions = action.split " "
        for action in actions
          callbacks[action] or= []
          callbacks[action].push callback
        return @
      @once = (action, callback) ->
        @on action, cb = ->
          @off action, cb
          callback.apply @, arguments
      @trigger = (action, args...) ->
        # for pipe in pipes
        #   pipe.trigger.apply pipe,arguments
        actions = action.split " "
        for action in actions
          if callbacks[action] then for callback in callbacks[action]
            if callback.apply(@, args) is false then break
        return @
      @off = (action, callback) ->
        if not action 
          callbacks = {}
          return
        actions = action.split " "
        for action in actions
          unless callback
            delete callbacks[action]
          else
            cbs = callbacks[action]
            if cbs
              for item, i in cbs when item is callback
                cbs.splice i, 1
        return @
      # @pipe = (to,remove) ->
      #   unless remove
      #     pipes.push to
      #   else
      #     pipes.splice pipes.indexOf(to),1

  
  Attributed = (attributes={}) ->
    return ->
      @is Evented()
      @get = (key) -> attributes[key]
      @all = -> attributes
      @set = (key,value) ->
        attributes[key] = value
        @trigger "change:#{key}",value
        @trigger "change",key,value
  
  Element = (tag,html) ->
    element = document.createElement(tag or "div")
    element.innerHTML = html or ""
    binds = {}
    outlets = {}
    return ->
      @is Evented()
      rebuild = =>
        bindElements = element.querySelectorAll "[data-bind]"
        for el in bindElements
          name = el.getAttribute "data-bind"
          binds[name] = el
        outletElements = element.querySelectorAll "[data-outlet]"
        for el in outletElements
          name = el.getAttribute "data-outlet"
          outlets[name] = el
          
      for ev in ["click","dblclick","keypress","keydown","keyup","change"]
        element.addEventListener ev, (e) =>
          el = e.target
          type = e.type
          switch type
            when "change"
              name = el.getAttribute "data-bind"
              if name and el.type isnt "checkbox"
                @trigger "change",name,el.value,el
                @trigger "change:#{name}",el.value,el
            when "keydown"
              action = el.getAttribute "data-enter"
              if e.keyCode is 13 and action and @[action] then @[action](e)
              action = el.getAttribute "data-keydown"
              if @[action] then @[action](e)
            when "click"
              if el.type is "checkbox"
                name = el.getAttribute "data-bind"
                if name
                  @trigger "change",name,el.checked,el
                  @trigger "change:#{name}",el.checked,el
              else
                action = el.getAttribute "data-click"
                if @[action] then @[action](e)
            else
              action = el.getAttribute "data-#{type}"
              if @[action] then @[action](e)
          e.stopPropagation()
      rebuild()
      @set = (name,val) ->
        el = binds[name]
        if not el then return
        tag = el.tagName.toLowerCase() 
        if tag is "input" or tag is "textarea" or tag is "select"
          if el.type is "checkbox" then el.checked = val
          el.value = val
        else 
          el.innerHTML = val
      @get = (name) -> 
        el = binds[name]
        if not el then return undefined
        tag = el.tagName.toLowerCase() 
        if tag is "input" or tag is "textarea" or tag is "select"
          if el.type is "checkbox" then return el.checked
          return el.value
        else
          return el.innerHTML
      @html = (data) ->
        if not data then return element.innerHTML
        element.innerHTML = data or ""
        rebuild()
        @trigger "reset"
      @insertInto = (view,outlet) ->
        if typeof view is "string"
          el = document.querySelector view
          el.appendChild element
        else
          view.insert element,outlet
      @insert = (view,outlet) ->
        if view.insertInto
          @insertInto @,outlet
        else
          outlets[outlet].appendChild view
      @remove = ->
        if element.parentNode
          element.parentNode.removeChild element
      @clean = (outlet) ->
        unless outlet then @clean(outlet) for outlet,el of outlets
        else
          el = outlets[outlet]
          while el.firstChild
            el.removeChild el.firstChild

  Binding = (bind1,bind2) ->
    a = b = updatea = updateb = resetb = null  
    bind = (newa,newb) ->
      if a then a.off "change",updateb
      if b then b.off "change",updatea
      if b then b.off "reset",resetb
      a = newa
      b = newb
      if a and b
        a.on "change",updateb = (key,val) -> b.set key,val
        b.on "change",updatea = (key,val) -> a.set key,val
        b.on "reset",resetb = -> 
          for key,val of a.all()
            b.set key,val
    bind bind1[1],bind2[1] 
    return ->
      @[bind1[0]] = (newa) -> 
        if newa
          bind newa,bind2[1]
        else return a
      @[bind2[0]] = (newb) -> 
        if newb 
          bind bind1[1],newb
        else return b
  
  Hiding = (prop,set,get) ->
    value = null
    if not get then get = -> value
    if not set then set = (newval) -> newval
    return ->
      @[prop] = (newval) ->
        unless newval then return get.call(@,value)
        else 
          value = set.call(@,value,newval)
          return @

  class Base
    @is: (type) -> type.call @ 
    is: (type) -> type.call @
    mixin: (obj,ignore) -> @[key] = val for key, val of obj when key not in ignore

  class Model extends Base
    constructor: (data={}) ->
      @is Attributed(@constructor.add(data))
      @constructor.trigger "add",@
    @init: ->
      @is Evented()
      models = []
      @add = (data) ->
        model = models[models.length] = {id:models.length}
        model[key] = val for key,val of data
        return model
      @remove = (model) ->
        @trigger "remove",model
        models.splice models.indexOf(model),1
      @reset = (data) ->
        models = []
        new @(item) for item in data
        @trigger "reset",models
      @all = -> return models.slice 0
      return @

  class View extends Base
    constructor: (options={}) ->
      @is Element (options.tag or @tag),(options.html or @html)
      @mixin options, ["tag","html"]

  class ViewModel extends Base
    constructor: (options={}) ->
      @is Binding(["model",options.model],["view",options.view])
      if options.model
        options.view.set(key,val) for key,val of options.model.all()
      @mixin options, ["model","view"]
  
  class ViewCollection extends Base
    constructor: (options={}) ->
      @mixin options, ["model"]
      viewmodels = {}
      add = (model) =>
        view = new (@view or options.view)
        viewmodels[model.get("id")] = new ViewModel({model:model,view:view})
        if @parent then view.insertInto(@parent,@outlet)
      remove = (model) =>
        id = model.id
        viewmodel = viewmodels[id]
        viewmodel.view().remove()
        delete viewmodels[id]
      reset = (data) =>
        viewmodels = []
        @parent.clean @outlet
        if data
          add(model) for model in data
      @is Hiding "model", (old,model) ->
        if old 
          old.off "add",add
          old.off "remove",remove
          old.off "reset",reset
        model.on "add",add
        model.on "remove",remove
        model.on "reset",reset
      @model options.model


  return {
    Model: Model
    View: View
    ViewModel: ViewModel
    ViewCollection: ViewCollection
  }


