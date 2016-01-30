import { users } from './api'

export const LOAD_USER = 'LOAD_USER'

export function loadUser(id) {
  return {
    type: LOAD_USER,
    payload: users.load(id),
  }
}
