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
    subscribers = []
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
        actions = action.split " "
        for action in actions
          for sub in subscribers
            sub action, args...
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
      @subscribe = (me) ->
        subscribers.push me
      @unsubscribe = (me) ->
        index = subscribers.indexOf(me)
        if index then subscribers.splice index,1

  
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
          binds[name] ?= []
          binds[name].push el
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
        els = binds[name]
        if not (els and els.length) then return
        for el in els
          tag = el.tagName.toLowerCase() 
          if tag is "input" or tag is "textarea" or tag is "select"
            if el.type is "checkbox" then el.checked = val
            el.value = val
          else 
            el.innerHTML = val
      @get = (name) -> 
        els = binds[name]
        if not (els and el = els[0]) then return undefined
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
        @trigger "reset",@
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

  Hiding = (prop,val,set,get) ->
    value = null
    return ->
      @[prop] = (newval) ->
        #console.log value,newval
        unless newval 
          return if get then get.call(@,value) else value
        else 
          value = if set then set.call(@,value,newval) else newval
          return @
      @[prop](val)

  Bubbling = (uptype,downtype,up) ->
    computeds = {}
    deps = {}
    return ->
      that = @
      down = (ev, args...) ->
        parts = ev.split "."
        if parts[0] is downtype
          #console.log "Going down!",ev, args...
          that.trigger ev,args...
      @up = (newup) -> 
        if newup
          if up then up.unsubscribe down
          up = newup
          up.subscribe down 
        else return up
      @up up  
      @subscribe (ev, args...) ->
        if up
          parts = ev.split "." 
          if parts[0] isnt downtype
            #console.log "Going up!",ev, args...
            up.trigger "#{uptype}.#{ev}",args...
      # @computed = (name,func,deps) ->
      #   if func
      #     computeds[name] = func
      #     for dep in depts
      #       @on "change", ->
      #         @trigger "computed.change",name,computeds[name].call @
      #   else if computeds[name]
      #     return computeds[name].call @  
      #   else if up and up.computed
      #     return up.computed(name)
      #   else
      #     return undefined


  class Base
    @is: (type) -> type.call @ 
    is: (type) -> type.call @
    mixin: (obj,ignore) -> @[key] = val for key, val of obj when key not in ignore

  class Model extends Base
    constructor: (data={}) ->
      @is Attributed(@constructor.add(data))
      @is Bubbling "model","view"
      @on "view.change", (key,val) =>
        @set key,val
      @on "view.reset", (view) =>
        for key,val of @all()
          view.set key,val
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
      @is Bubbling "view","model"
      @mixin options, ["tag","html"]
      @on "model.change computed.change", (key,val) =>
        @set key,val

  class ViewModel extends Base
    constructor: (options={}) ->
      @is Evented()
      setter = (old,val) -> 
        old and old.up null
        val.up @
        return val
      @is Hiding("model",options.model,setter)
      @is Hiding("view",options.view,setter)
      options.view.trigger "reset",options.view
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
      @is Hiding "model", options.model,(old,model) ->
        if old 
          old.off "add",add
          old.off "remove",remove
          old.off "reset",reset
        model.on "add",add
        model.on "remove",remove
        model.on "reset",reset
        return model


  return {
    Model: Model
    View: View
    ViewModel: ViewModel
    ViewCollection: ViewCollection
  }


