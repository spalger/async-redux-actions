/* eslint func-names: 0 */
/* eslint-env mocha */
/* global should */

import { middleware, asyncHandlers } from '../'
import { handleActions } from 'redux-actions'
import Bluebird from 'bluebird'
import { createStore, applyMiddleware } from 'redux'

function setup(type, opts) {
  const store = createStore(
    handleActions(asyncHandlers(type, opts)), {}, applyMiddleware(middleware)
  )

  return { store }
}

describe('asyncHandlers', function () {
  context('with no opts', function () {
    context('with resolving promise', function () {
      it('sets the result to state.result', async function () {
        const type = 'ACTION'
        const { store } = setup(type)
        const result = {}
        const promise = store.dispatch({ type, payload: Bluebird.resolve(result) })

        // "start" was dispatched
        store.getState().ready.should.equal(false)
        should.not.exist(store.getState().result)
        should.not.exist(store.getState().error)

        await promise

        // "success" was dispatched
        store.getState().ready.should.equal(true)
        store.getState().result.should.equal(result)
        should.not.exist(store.getState().error)
      })
    })

    context('with rejecting promise', function () {
      it('sets the error to state.error', async function () {
        const type = 'ACTION'
        const { store } = setup(type)
        const error = new Error('hi')
        const promise = store.dispatch({ type, payload: Bluebird.reject(error) })

        // "start" was dispatched
        store.getState().ready.should.equal(false)
        should.not.exist(store.getState().error)
        should.not.exist(store.getState().result)

        try {
          await promise
        } catch (e) {
          // ignore
        }

        // "success" was dispatched
        store.getState().ready.should.equal(true)
        store.getState().error.should.equal(error)
        should.not.exist(store.getState().result)
      })
    })
  })

  context('with custom handlers', function () {
    const type = 'FETCH_USER'
    const handlers = {
      start() {
        return { waiting: true }
      },
      success(state, user) {
        return { user }
      },
      failure(state, error) {
        return { oops: error }
      },
    }

    context('with resolving promise', function () {
      it('sets the result in a custom way', async function () {
        const { store } = setup(type, handlers)

        const user = {}
        const promise = store.dispatch({ type, payload: Bluebird.resolve(user) })

        // "start" was dispatched
        store.getState().ready.should.equal(false)
        store.getState().waiting.should.equal(true)
        should.not.exist(store.getState().user)
        should.not.exist(store.getState().oops)

        await promise

        // "success" was dispatched
        store.getState().ready.should.equal(true)
        should.not.exist(store.getState().waiting)
        should.not.exist(store.getState().result)
        store.getState().user.should.equal(user)
        should.not.exist(store.getState().oops)
      })
    })

    context('with rejecting promise', function () {
      it('sets the error to state.error', async function () {
        const { store } = setup(type, handlers)

        const error = new Error()
        const promise = store.dispatch({ type, payload: Bluebird.reject(error) })

        // "start" was dispatched
        store.getState().ready.should.equal(false)
        store.getState().waiting.should.equal(true)
        should.not.exist(store.getState().user)
        should.not.exist(store.getState().oops)

        try {
          await promise
        } catch (e) {
          // ignore
        }

        // "success" was dispatched
        store.getState().ready.should.equal(true)
        should.not.exist(store.getState().waiting)
        should.not.exist(store.getState().result)
        should.not.exist(store.getState().user)
        store.getState().oops.should.equal(error)
      })
    })
  })

  context('when passed meta', function () {
    const type = 'ACTION'
    const meta = {}

    context('and promise resolves', function () {
      it('gets set at state.meta at all phases', async function () {
        const { store } = setup(type)
        const promise = store.dispatch({ type, payload: Bluebird.resolve(true), meta })
        store.getState().meta.should.equal(meta)
        await promise
        store.getState().meta.should.equal(meta)
      })
    })

    context('and promise rejects', function () {
      it('gets set at state.meta at all phases', async function () {
        const { store } = setup(type)
        const promise = store.dispatch({ type, payload: Bluebird.reject(new Error()), meta })
        store.getState().meta.should.equal(meta)

        try { await promise } catch (e) { /* ignore */ }

        store.getState().meta.should.equal(meta)
      })
    })
  })
})
