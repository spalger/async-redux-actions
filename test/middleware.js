/* eslint func-names: 0 */
/* eslint-env mocha */

import { middleware, START, SUCCESS, FAILURE } from '../'
import Bluebird from 'bluebird'
import { createStore, applyMiddleware } from 'redux'
import sinon from 'sinon'

function setup() {
  const reducer = sinon.stub().returnsArg(0)
  const store = createStore(
    reducer, {}, applyMiddleware(middleware)
  )

  function getReducedActions() {
    // the first action is always @@redux/INIT, so drop it
    return reducer.args.map(args => args[1]).slice(1)
  }

  return { reducer, store, getReducedActions }
}

describe('middleware', function () {
  context('action payload is not a promise', function () {
    it('passes the action along', function () {
      const action = {
        type: 'A_SYNC_THING',
        payload: 1,
      }

      const { store, getReducedActions } = setup()
      store.dispatch(action)

      const actions = getReducedActions()
      actions.length.should.eql(1)
      actions[0].should.equal(action)
    })
  })

  context('action payload is a promise', function () {
    it('dispatches a start action and a success action when resolved', async function () {
      const type = 'ASYNC_THING'
      const result = {}
      const payload = Bluebird.delay(50).return(result)
      const action = { type, payload }

      const { store, getReducedActions } = setup()
      await store.dispatch(action)

      const [action1, action2] = getReducedActions()
      action1.type.should.equal(`${START}${type}`)
      action2.type.should.equal(`${SUCCESS}${type}`)
      action2.payload.should.equal(result)
    })

    it('dispatches a start and failure action when rejected', async function () {
      const type = 'ASYNC_THING'
      const error = new Error('failure?')
      const payload = Bluebird.delay(50).throw(error)
      const action = { type, payload }


      const { store, getReducedActions } = setup()
      await store.dispatch(action).catch(() => {})

      const [action1, action2] = getReducedActions()
      action1.type.should.equal(`${START}${type}`)
      action2.type.should.equal(`${FAILURE}${type}`)
      action2.payload.should.equal(error)
    })

    it('responds to the dispatch with a promise that forwards errors', async function () {
      const type = 'ASYNC_THING'
      const error = new Error('failure?')
      const payload = Bluebird.delay(50).throw(error)

      const { store } = setup()

      let output
      try {
        await store.dispatch({ type, payload })
        output = false
      } catch (e) {
        output = e
      }

      output.should.equal(error)
    })

    it('responds to the dispatch with a promise that forwards resolution value', async function () {
      const type = 'ASYNC_THING'
      const result = {}
      const payload = Bluebird.delay(50).return(result)

      const { store } = setup()
      const output = await store.dispatch({ type, payload })
      output.should.equal(result)
    })
  })
})
