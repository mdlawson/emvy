((root, factory) ->
  if typeof exports is "object"
    module.exports = factory(require("depot"))
  else if typeof define is "function" and define.amd
    define ["depot"], factory
  else
    root.emvy.localStore = factory(root.depot)
) this, (depot) ->
  localStore = (name,create,update,destroy) ->
    store = depot name,{idAttribute:"id"}
    return {
      create: (id,model,cb) ->
        store.save model
        cb()
      read: (id,cb) ->
        if typeof id is "function"
          id store.all()
        else
          cb store.get id
      update: (id,model,cb) ->
        store.update id,model
        cb()
      destroy: (id,model,cb) ->
        store.destroy id
        cb()
    }
  return localStore
