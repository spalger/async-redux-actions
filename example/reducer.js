import { combineReducers } from 'redux'
import { handleActions } from 'redux-actions'
import { asyncHandlers } from '../'

import { LOAD_USER } from './actions'

export default combineReducers({
  user: handleActions(asyncHandlers(LOAD_USER), {}),
})
