/* eslint-disable no-console */

import store from './store'
import { loadUser } from './actions'

function logState(name) {
  console.log(
    name,
    'state',
    JSON.stringify(store.getState(), null, '  ')
      .split('\n')
      .reduce((a, l) => `${a}\n  ${l}`, ''),
    '\n'
  )
}

(async function example() {
  const success = store.dispatch(loadUser(0))
  logState('START 1')

  await success
  logState('SUCCESS')

  const failure = store.dispatch(loadUser(1))
  logState('START 2')

  try { await failure } catch (e) { /* ignore */ }
  logState('FAILUE')
}())
.catch(err => console.error(err.stack))
