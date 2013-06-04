## Stateful(states)

Stateful is emvys implementation of a Finite State Machine. States can be initially defined by an object `states` that maps keys of state names to objects of properties that should be changed for that state. Setter/getter properties, such as those created by Hiding, are taken into account. Stateful objects emit events on state change, one event simply showing the new state `state:newstate` one showing the transition that occurred `state:initial->newstate` and one just showing the exit of the old state `state:initial->`

The initial state of the object is stored in the special state initial.

### object.transition(name)

Transition to state `name`

### object.addState(name,state)

Add the state described by `state` as `name`

---