((root, factory) ->
  if typeof exports is "EObject"
    module.exports = factory()
  else if typeof define is "function" and define.amd
    define factory
  else
    root.emvy = factory()
) this, ->
  
  Evented = (tag) ->
    callbacks = {}
    upstream = []
    downstream = []
    return ->
      that = @
      @attach = (something,up,oneway) ->
        unless up
          downstream.push something
          unless oneway
            something.attach @,true
        else
          upstream.push something
      @detach = (something,up,oneway) ->
        unless up
          index = downstream.indexOf something
          downstream.splice index,1
          unless oneway
            something.detach @,true
        else
          index = upstream.indexOf something
          upstream.splice index,1
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
        #console.log action,args,"called on",that,"by",this
        actions = action.split " "
        for action in actions
          resolved = false
          if callbacks[action] then for callback in callbacks[action]
            if callback.apply(that, args) is true then resolved = true
          unless resolved
            if tag 
              parts = action.split ":"
              if parts.length > 1
                path = parts[1].split "."
                if path[0] isnt tag 
                  parts[1] = tag + "." + parts[1]
              else
                parts[1] = tag
              action = parts.join ":"
            for item in downstream when item isnt @
              if item.trigger.call(that,action,args...) is true then return true
            for item in upstream when item isnt @
              if item.trigger.call(that,action,args...) is true then return true
        return resolved
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

  
  Attributed = (attributes={}) ->
    return ->
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

  Computing = ->
    return ->
      @computed = (name,func,deps) ->
        @[name] = func
        str = ""
        change = =>
          value = @[name]()
          @trigger "change change:computed",name,value
          @trigger "change:#{name} change:computed.#{name}",value

        for dep in deps        
          if (typeof dep is "function" and dep.type is "Model") or (typeof dep is "EObject" and dep.on)
            dep.on "change", change
            dep.on "change:model", change
          else  
            str += "change:#{dep} "
        @on str, change
        change()

  components = {
    Computing: Computing
    Hiding: Hiding
    Element: Element
    Attributed: Attributed
    Evented: Evented
  }

  load = (component,args...) ->
    if typeof component is "string"
      components[component](args...).call @
    else
      component.call @
    return @

  class EObject
    @is: load 
    is: load
    mixin: (obj,ignore) -> @[key] = val for key, val of obj when key not in ignore

  class Model extends EObject
    @type = "Model"
    constructor: (data={}) ->
      @is Evented "model"
      @is Computing()
      @is Attributed(@constructor.add(data))
      @on "change:view", (key,val) =>
        @set key,val
        return true
      @on "reset:view", (view) =>
        for key,val of @all()
          view.set key,val
        return true
      @attach @constructor,true
      @constructor.trigger "add",@
      @constructor.trigger "change"
    @init: ->
      @is Evented "Model"
      models = []
      @add = (data) ->
        model = models[models.length] = {id:models.length}
        model[key] = val for key,val of data
        return model
      @remove = (model) ->
        @trigger "remove",model
        models.splice models.indexOf(model),1
        @trigger "change"
      @reset = (data) ->
        models = []
        new @(item) for item in data
        @trigger "reset",models
        @trigger "change"
      @all = -> return models.slice 0
      return @

  class View extends EObject
    constructor: (options={}) ->
      @is Evented "view"
      @is Element (options.tag or @tag),(options.html or @html)
      @is Computing()
      @mixin options, ["tag","html"]
      @on "change:model change:computed", (key,val) =>
        @set key,val
        return true

  class ViewModel extends EObject
    constructor: (options={}) ->
      @is Evented()
      @is Computing()
      setter = (old,val) -> 
        old and old.detach @
        val.attach @
        return val
      @is Hiding("model",options.model,setter)
      @is Hiding("view",options.view,setter)
      options.view.trigger "reset",options.view
      @mixin options, ["model","view"]
  
  class ViewCollection extends EObject
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
    Object: EObject
    Model: Model
    View: View
    ViewModel: ViewModel
    ViewCollection: ViewCollection
  }


