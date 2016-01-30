import { createStore, applyMiddleware } from 'redux'
import { middleware as asyncActionsMiddleware } from '../'

import reducer from './reducer'
const initialState = {}
const enhancer = applyMiddleware(asyncActionsMiddleware)

export default createStore(reducer, initialState, enhancer)
