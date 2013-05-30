express = require "express"
path = require "path"
app = express()

app.use express.static __dirname
app.use express.bodyParser()
app.use app.router

app.get "/emvy.js", (req, res) ->
  res.sendfile path.join __dirname,"../emvy.js"
app.get "/emvy.localstore.js", (req, res) ->
  res.sendfile path.join __dirname,"../emvy.localstore.js"
app.get "/depot.js", (req, res) ->
  res.sendfile path.join __dirname,"../vendor/depot.js"
app.get "*", (req, res) ->
  res.sendfile path.join __dirname,"todos.html"

app.listen 3000