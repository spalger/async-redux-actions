export const users = {
  load(id) {
    switch (id) {
      case 0:
        return Promise.resolve({ id, username: 'spalger', name: 'Spencer Alger' })
      default:
        return Promise.reject(new Error('user not found'))
    }
  },
}
