export const START = '@@async/START/'
export const SUCCESS = '@@async/SUCCESS/'
export const FAILURE = '@@async/FAILURE/'

export function middleware({ dispatch }) {
  return next => action => {
    if (!action || !action.payload || typeof action.payload.then !== 'function') {
      return next(action)
    }

    const { type, meta } = action
    function notify(stage, payload, error) {
      dispatch({
        type: `${stage}${type}`,
        error: !!error,
        payload,
        meta,
      })
    }


    notify(START)

    return action.payload.then(
      result => {
        notify(SUCCESS, result)
        return result
      },
      err => {
        notify(FAILURE, err, true)
        throw err
      }
    )
  }
}

export function asyncHandlers(type, handlersOrSuccess = {}) {
  const { start, success, failure } =
    typeof handlersOrSuccess === 'function'
      ? { success: handlersOrSuccess }
      : handlersOrSuccess

  if (!type) {
    throw new TypeError(`asyncHandlers requires an action "type" as it's first argument`)
  }

  return {
    [`${START}${type}`](state, { payload, meta }) {
      const ready = false
      return start ? { ready, ...start(state, payload, meta) } : { ready, meta }
    },

    [`${SUCCESS}${type}`](state, { payload: result, meta }) {
      const ready = true
      return success ? { ready, ...success(state, result, meta) } : { ready, meta, result }
    },

    [`${FAILURE}${type}`](state, { payload: error, meta }) {
      const ready = true
      return failure ? { ready, ...failure(state, error, meta) } : { ready, meta, error }
    },
  }
}
