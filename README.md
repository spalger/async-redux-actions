# @spalger/redux-async-actions

A simple wrapper around async redux actions.

## Install:

```sh
npm install --save @spalger/async-redux-actions
```

## Setup:


Start off by writing some async actions; FSAs with a `Promise` as their payload. Then add some `asyncHandlers`, which combined with `handleActions` (from `redux-actions`) and `combineReducers` (from `redux`) will make up your reducer. Finally tie it all together with with the `asyncActionsMiddleware` when you create your store.


**actions.js**
```js
export const LOAD_USER = 'LOAD_USER'

function loadUser(id) {
  return {
    type: LOAD_USER,
    payload: api.users.load()
  }
}
```

**reducer.js**
```js
import { combineReducers } from 'redux'
import { handleActions } from 'redux-actions'
import { asyncHandlers } from '@spalger/redux-async-actions'

import { LOAD_USER } from './actions'

export default combineReducers({
  user: handleActions(asyncHandlers(LOAD_USER))
})
```

**store.js**
```js
import { createStore, applyMiddleware } from 'redux'
import { middleware as asyncActionsMiddleware } from '@spalger/redux-async-actions'

import reducer from './reducer'
const initialState = {}
const enhancer = applyMiddleware(reduxAsyncActionsMiddleware)

export default createStore(reducer, initialState, enhancer)
```

When dispatched, the payload of the `LOAD_USER` action will cause the following actions to dispatch, and cause the following state updates:

| step | action | state |
| --- | --- | --- |
| 1 | `{ type: '@@async/START/LOAD_USER' }` | `{ user: { ready: false} }` |
| 2a | `{ type: '@@async/SUCCESS/LOAD_USER' }` | `{ user: { ready: true, result: User } }` |
| 2b | `{ type: '@@async/FAILURE/LOAD_USER' }` | `{ user: { ready: true, error } }` |

To modify the resulting states you can supply handlers to `handleActions(ACTION, handlers)`:

```js
const reducers = combineReducers({
  user: handleActions(asyncHandlers(LOAD_USER, {
    start: () => ({ fetching: true }),               
    success: (state, payload) => ({ user: payload }),
    error: (state, payload) => ({ reason: payload })
  }))
})

// states produced:
//  on start:    { user: { ready: false, fetching: true } }
//  on success:  { user: { ready: true, user: User } }
//  on failure:  { user: { ready: true, reason: error } }
```

You can simplify the handlers by just supplying a function, which will simply be used for the success handler:

```js
const reducers = combineReducers({
  user: handleActions(asyncHandlers(LOAD_USER, (state, payload) => ({ user: payload })))
})

// states produced:
//  on start:    { user: { ready: false } }
//  on success:  { user: { ready: true, user: User } }
//  on failure:  { user: { ready: true, error: error } }
```
