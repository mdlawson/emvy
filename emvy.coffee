((root, factory) ->
  if typeof exports is "object"
    module.exports = factory()
  else if typeof define is "function" and define.amd
    define factory
  else
    root.emvy = factory()
) this, ->

  ## Utils

  isArray = (a) -> Object::toString.call(a) is "[object Array]"

  load = (component) ->
    component.call @
    return @

  create = (obj,components...) ->
    for component in components
      component.call obj
    return obj

  array = (arr) ->
    Evented("Model").call arr
    arr.on "add", (item) -> if item.attach then item.attach arr,true,true
    orig = Array::
    arr.pop = ->
      result = orig.pop.apply @,arguments
      @trigger "remove",result
      return result
    arr.push = (items...) ->
      result = orig.push.apply @,arguments
      for item in items
        @trigger "add",item
      return result
    arr.shift = ->
      result = orig.shift.apply @,arguments
      @trigger "remove",result
      return result
    arr.unshift = (items...) ->
      result = orig.unshift.apply @,arguments
      for item in items
        @trigger "add",item,true
      return result
    arr.splice = ->
      result = orig.splice.apply @,arguments
      @trigger "reset"
      for item in @
        @trigger "add",item
      return result
    arr.all = -> arr
    arr.trigger("add", item) for item in arr
    return arr

  ## Components

  Evented = (tag) ->
    callbacks = {}
    upstream = []
    downstream = []
    all = []
    return ->
      that = @
      @attach = (something,oneway,up) ->
        unless up
          downstream.push something
          unless oneway
            something.attach @,false,true
        else
          upstream.push something
      @detach = (something,oneway,up) ->
        unless up
          index = downstream.indexOf something
          if index > -1
            downstream.splice index,1
          unless oneway
            something.detach @,false,true
        else
          index = upstream.indexOf something
          if index > -1
            upstream.splice index,1
      @on = (action, callback) ->
        if not callback and typeof action is "function"
          all.push callback
          return @
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
          if all.length 
            allArgs = [action].concat(args)
            for callback in all
              if callback.apply(that,allArgs) is true then resolved = true 
          if callbacks[action] then for callback in callbacks[action]
            if callback.apply(that, args) is true then resolved = true
          unless resolved or not (upstream.length or downstream.length)
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
        if (@validate and @validate(key,value)) or not @validate
          attributes[key] = value
          @trigger "change:#{key}",value,attributes
          @trigger "change",key,value,attributes
  
  Element = (tag,html) ->
    element = document.createElement(tag or "div")
    element.innerHTML = html or ""
    binds = {}
    attributes = {}
    classes = {}
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
        attributedElements = element.querySelectorAll "[data-attr]"
        for el in attributedElements
          attrBinding = el.getAttribute "data-attr"
          attrBinds = attrBinding.split " "
          for bind in attrBinds
            parts = bind.split "|"
            attr = parts[0]
            ternery = parts[1].split "?"
            if ternery.length is 1
              func = ((el,name) -> (val) -> 
                if typeof val isnt "undefined" then el.setAttribute(name,val)
                else return e.getAttribute(name)
              )(el,attr)
            else
              conditions = ternery[1].split ":"
              func = ((el,name,opt1,opt2) -> (val) -> 
                if typeof val isnt "undefined"
                  if opt2 then el.setAttribute(name,if val then opt1 else opt2)
                  else if val then el.setAttribute(name,opt1) else el.removeAttribute(name)
                else return el.getAttribute(name)
              )(el,attr,conditions[0],conditions[1])
            attributes[ternery[0]] ?= []
            attributes[ternery[0]].push func
        classyElements = element.querySelectorAll "[data-class]"
        for el in classyElements
          classBinding = el.getAttribute "data-class"
          classBinds = classBinding.split " "
          for bind in classBinds
            ternery = bind.split "?"
            if ternery.length is 1
              func = ((el) -> 
                currentVal = undefined
                return (val) ->
                  if currentVal
                    el.className = el.className.replace currentVal, ""
                  el.className += currentVal = " " + val
              )(el)
            else
              conditions = ternery[1].split ":"
              func = ((el,opt1,opt2) -> (val) ->
                if opt2
                  if val
                    el.className = el.className.replace " " + opt2, ""
                    el.className += " " + opt1
                  else
                    el.className = el.className.replace " " + opt1, ""
                    el.className += " " + opt2
                else
                  if val then el.className += " " + opt1 else el.className = el.className.replace " " + opt1, ""
              )(el,conditions[0],conditions[1])
            classes[ternery[0]] ?= []
            classes[ternery[0]].push func
        return

      runAction = (action,e) =>
        if action
          parts = action.split(" ")
          action = parts.shift()
          parts.push e
          if @[action] then @[action].apply(@,parts)


      for ev in ["click","dblclick","keypress","keydown","keyup","change","input","propertychange"]
        element.addEventListener ev, (e) =>
          el = e.target
          type = e.type
          switch type
            when "change", "input", "propertychange"
              name = el.getAttribute "data-bind"
              if name and el.type isnt "checkbox"
                @trigger "change",name,el.value,el
                @trigger "change:#{name}",el.value,el
            when "keydown"
              if e.keyCode is 13 then runAction el.getAttribute("data-enter"),e
              runAction el.getAttribute("data-keydown"),e
            when "click"
              if el.type is "checkbox"
                name = el.getAttribute "data-bind"
                if name
                  @trigger "change",name,el.checked,el
                  @trigger "change:#{name}",el.checked,el
              else
                link = el.getAttribute "data-link"
                if link
                  parts = link.split(" ")
                  emvy.Router.navigate[parts[0]](parts[1])
                runAction el.getAttribute("data-click"),e
            else
              runAction el.getAttribute("data-#{type}"),e
          e.stopPropagation()
      rebuild()
      @set = (name,val) ->
        els = binds[name]
        if els and els.length
          for el in els
            tag = el.tagName.toLowerCase() 
            if tag is "input" or tag is "textarea" or tag is "select"
              if el.type is "checkbox" then el.checked = val
              el.value = val
            else 
              el.innerHTML = val
        attrs = attributes[name]
        if attrs and attrs.length
          func(val) for func in attrs
        cls = classes[name]
        if cls and cls.length
          func(val) for func in cls
              
      @get = (name) -> 
        els = binds[name]
        if not (els and el = els[0]) then return undefined
        tag = el.tagName.toLowerCase() 
        if tag is "input" or tag is "textarea" or tag is "select"
          if el.type is "checkbox" then return el.checked
          return el.value
        else
          attrs = attributes[name]
          if attrs and attrs.length then return arrs[0]()
          return el.innerHTML
      @html = (data) ->
        if not data then return element.innerHTML
        element.innerHTML = data or ""
        rebuild()
        @trigger "reset",@
      @insertInto = (view,outlet,pre) ->
        if typeof view is "string"
          el = document.querySelector view
          el.appendChild element
        else
          view.insert element,outlet,pre
      @insert = (view,outlet,pre) ->
        if view.insertInto
          @insertInto @,outlet
        else
          el = outlets[outlet]
          if pre and el.firstChild
            el.insertBefore view,el.firstChild
          else
            el.appendChild view
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
          if (typeof dep is "function" and dep.type is "Model") or (typeof dep is "object" and dep.on)
            dep.on "change", change
            dep.on "change:model", change
          else  
            str += "change:#{dep} "
        @on str, change
        change()
  Stateful = (states) ->
    store = {initial:{}}
    return ->
      @transition = (state) ->
        if state = store[state]
          for key,val of state
            if @[key]
              if typeof @[key] is "function" and typeof val isnt "function"
                if not store.initial[key] then store.initial[key] = @[key]()
                @[key](val)
              else
                if not store.intitial[key] then store.initial[key] = @[key]
                @[key] = val
            else
              @[key] = val
          @trigger "state:#{state}"
          @trigger "state:#{@state}->"
          @trigger "state:#{@state}->#{state}"
          @state = state
      @addState = (name,state) ->
        store[name] = state
      for state,func of states
        @addState(state,func)

  ## Classes

  class EObject
    @is: load 
    is: load
    mixin: (obj,ignore) -> @[key] = val for key, val of obj when key not in ignore
    @extend: (childProps,childStatics) ->
      constructor = if childProps and childProps.constructor then childProps.constructor
      class Class extends @
        constructor: ->
          super
          constructor and constructor.apply @,arguments
      if childProps
        for key,value of childProps when key isnt "constructor"
          Class::[key] = value
      if childStatics
        for key,value of childStatics
          Class[key] = value

      return Class

  class Model extends EObject
    @type = "Model"
    constructor: (data={},rebuilding) ->
      @is Evented "model"
      @is Computing()
      @is Attributed(@constructor.add(data,@,rebuilding))
      @on "change:view", (key,val) =>
        @set key,val
        return true
      @on "reset:view", (view) =>
        for key,val of @all()
          view.set key,val
        return true
      @attach @constructor,true,true
      @constructor.trigger "add",@
      @constructor.trigger "change"
    @init: (func) ->
      @is Evented "Model"
      models = []
      raws = []
      masks = {}
      queues = {}
      store = undefined
      @persist = (cb) ->
        merge = []
        for key,queue of queues
          update1 = null
          if queue[0].action isnt "create"
            for item,i in queue when item.action is "create"
              if queue[0].action isnt "create" then queue.unshift(queue.splice(i,1)[0]) # creates to the front
              else 
                queue[0].model = item.model
                queue.splice(i,1) # overwrite first create then remove
          for item,i in queue
            item.key = parseInt key,10
            if item.action is "destroy"
              queue = [item]
              break 
            if item.action is "update" or item.action is "create"
              if update1 is null then update1 = item.model
              else
                update1[key] = val for key,val of item.model # latter updates overwrite earlier ones
                queue.splice(i,1)
          merge = merge.concat queue
        queues = {}
        remaining = merge.length
        for item in merge
          store[item.action](item.key,item.model,(err) ->
            if err and cb then cb err
            remaining--
            if remaining is 0 and cb then cb()
          )
        return merge
      @store = (newStore) ->
        if newStore then store = newStore
        @fetch()
        return store

      @fetch = (cb) ->
        store.read (results) =>
          @reset results,true
          if cb then cb @all()

      @on "change:model", (key,value,model) ->
        delta = {}
        delta[key] = value
        queues[model.id] ?= []
        queues[model.id].push 
          action: "update"
          model: delta

      @add = (data,model,rebuilding) ->
        temp = raws[raws.length] = {id:raws.length+1}
        models.push model
        temp[key] = val for key,val of data
        unless rebuilding
          queues[temp.id] ?= []
          queues[temp.id].push
            action: "create"
            model: temp
        return temp
      @remove = (model,raw) ->
        if raw
          index = raws.indexOf(model)
          model = models[index]
        else
          index = models.indexOf(model)
        @trigger "remove",model
        queues[id = raws[index].id] ?= []
        queues[id].push
          action: "destroy"
          model: raws[index]
        models.splice index,1
        raws.splice index,1
        @trigger "change"
      @reset = (data,rebuilding) ->
        models = []
        raws = []
        @trigger "reset"
        if data
          new @(item,rebuilding) for item in data
        @trigger "change"
      @all = -> return models.slice 0
      @raw = -> return raws.slice 0
      @find = (id) ->
        for model,i in raws when model.id is id
          return models[i]
      @mask = (name,func) ->
        if masks[name] and not func
          return masks[name]
        else
          return masks[name] = new ModelMask @,func
      if func then func.call @
      return @

  class ModelMask extends EObject
    constructor: (Model,func) ->
      @is Evented()
      Model.attach @,true,false
      @on "Model.remove Model.add", (model) ->
        return if func(model) then false else true
      @all = ->
        return (item for item in Model.all() when func(item))
      @raw = ->
        return (item for item in Model.raw() when func(item))
      @remove = -> Model.remove.apply(Model,arguments)
      @reset = -> Model.reset.apply(Model,arguments) 

  class View extends EObject
    constructor: (options={}) ->
      @is Evented "view"
      @is Element (options.tag or @tag),(options.html or @html)
      @is Computing()
      @mixin options, ["tag","html"]
      @on "change:model change:computed", (key,val) =>
        @set key,val

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
      @is Evented()
      @mixin options, ["model"]
      viewmodels = {}
      @on "add:Model",(model,pre) =>
        view = new (@view or options.view)
        viewmodels[model.get("id")] = new ViewModel({model:model,view:view})
        if @parent then view.insertInto(@parent,@outlet,pre)
      @on "remove:Model",(model) =>
        id = model.get("id")
        viewmodel = viewmodels[id]
        viewmodel.view().remove()
        delete viewmodels[id]
      @on "reset:Model", =>
        viewmodels = []
        @parent.clean @outlet
      @is Hiding "model", options.model,(old,val) ->
        old and old.detach @,true,false
        val.attach @,true,false
        @trigger "reset:Model"
        @trigger("add:Model",model) for model in val.all() 
        return val
  
  Router = (options={}) ->
    (->
      root = options.root
      oldparts = undefined
      Evented().call @
      emitEvents = =>
        path = window.location.pathname
        if options.root 
          if not path.indexOf(root) then path = path.substr root.length
        parts = path.split("/")[1..]
        # console.log "oldparts",oldparts
        # if oldparts
        #   while oldparts[0] is parts[0]
        #     oldparts.shift()
        #     parts.shift()
        # console.log path,parts
        i = 0
        while i < parts.length
          pre = parts[0...i]
          post = parts[i..]
          if pre.length
            post.unshift(pre.join("."))
          @trigger.apply(@,post)
          i++
        oldparts = parts
      @navigate = {}
      @navigate.to = (url) ->
        history.pushState {},document.title,url
        emitEvents()
      @navigate.up = ->
        path = window.location.pathname.split("/")
        path.pop()
        @to path.join("/")
      @navigate.down = (to) ->
        path = window.location.pathame.split("/")
        path.push(to)
        @trigger path[path.length-2],path[path.length-1]
        @to path.join("/")
      @navigate.across = (to) ->
        path = window.location.pathname.split("/")
        path[path.length-1] = to
        @trigger path[path.length-2],path[path.length-1]
        @to path.join("/")
      window.addEventListener "popstate", emitEvents
    ).call Router


  return {
    Object: EObject
    Router: Router
    Model: Model
    View: View
    ViewModel: ViewModel
    ViewCollection: ViewCollection

    Computing: Computing
    Hiding: Hiding
    Element: Element
    Attributed: Attributed
    Evented: Evented
    Stateful: Stateful

    create: create
    array: array
  }


###
TODO:
- Better Router
###