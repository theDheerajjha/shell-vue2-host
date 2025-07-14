// Store configuration with dynamic imports for Module Federation
async function createStore() {
  const Vue = await import('vue')

  // Mock API functions
  const mockUsers = [
    { id: 1, name: 'test1', email: 'test1@example.com', role: 'admin' },
    { id: 2, name: 'test2', email: 'test2@example.com', role: 'user' },
    { id: 3, name: 'test3', email: 'test3@example.com', role: 'admin' },
    { id: 4, name: 'test4', email: 'test4@example.com', role: 'user' },
    { id: 5, name: 'test5', email: 'test5@example.com', role: 'admin' }
  ]

  const api = {
    async getUsers() {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return [...mockUsers]
    },

    async updateUser(userId, userData) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const userIndex = mockUsers.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData }
        return mockUsers[userIndex]
      }
      throw new Error('User not found')
    },

    async createUser(userData) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const newUser = {
        id: Math.max(...mockUsers.map(u => u.id)) + 1,
        ...userData
      }
      mockUsers.push(newUser)
      return newUser
    },

    async deleteUser(userId) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const userIndex = mockUsers.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1)
        return true
      }
      throw new Error('User not found')
    }
  }

  // Create reactive store
  const store = Vue.default.observable({
    users: [],
    selectedUser: null,
    loading: false,
    error: null
  })

  // Store mutations
  const mutations = {
    setUsers(users) {
      // Only update if the users array has actually changed
      const currentUsersString = JSON.stringify(store.users)
      const newUsersString = JSON.stringify(users)
      if (currentUsersString !== newUsersString) {
        store.users = users
      }
    },

    setSelectedUser(user) {
      // Only update if the selected user has actually changed
      const currentUserString = JSON.stringify(store.selectedUser)
      const newUserString = JSON.stringify(user)
      if (currentUserString !== newUserString) {
        store.selectedUser = user
      }
    },

    updateUserInList(updatedUser) {
      const index = store.users.findIndex(u => u.id === updatedUser.id)
      if (index !== -1) {
        // Only update if the user data has actually changed
        const currentUserString = JSON.stringify(store.users[index])
        const newUserString = JSON.stringify(updatedUser)
        if (currentUserString !== newUserString) {
          Vue.default.set(store.users, index, updatedUser)
        }
      }
    },

    addUserToList(user) {
      // Check if user already exists
      const existingIndex = store.users.findIndex(u => u.id === user.id)
      if (existingIndex === -1) {
        store.users.push(user)
      } else {
        // Update existing user
        Vue.default.set(store.users, existingIndex, user)
      }
    },

    removeUserFromList(userId) {
      const index = store.users.findIndex(u => u.id === userId)
      if (index !== -1) {
        store.users.splice(index, 1)
      }
    },

    setLoading(loading) {
      if (store.loading !== loading) {
        store.loading = loading
      }
    },

    setError(error) {
      if (store.error !== error) {
        store.error = error
      }
    }
  }

  // Store actions
  const actions = {
    async fetchUsers() {
      mutations.setLoading(true)
      mutations.setError(null)
      try {
        const users = await api.getUsers()
        mutations.setUsers(users)
      } catch (error) {
        mutations.setError(error.message)
      } finally {
        mutations.setLoading(false)
      }
    },

    async updateUser(userId, userData) {
      mutations.setLoading(true)
      mutations.setError(null)
      try {
        const updatedUser = await api.updateUser(userId, userData)
        mutations.updateUserInList(updatedUser)
        if (store.selectedUser && store.selectedUser.id === userId) {
          mutations.setSelectedUser(updatedUser)
        }
        return updatedUser
      } catch (error) {
        mutations.setError(error.message)
        throw error
      } finally {
        mutations.setLoading(false)
      }
    },

    async createUser(userData) {
      mutations.setLoading(true)
      mutations.setError(null)
      try {
        const newUser = await api.createUser(userData)
        mutations.addUserToList(newUser)
        return newUser
      } catch (error) {
        mutations.setError(error.message)
        throw error
      } finally {
        mutations.setLoading(false)
      }
    },

    async deleteUser(userId) {
      mutations.setLoading(true)
      mutations.setError(null)
      try {
        await api.deleteUser(userId)
        mutations.removeUserFromList(userId)
        if (store.selectedUser && store.selectedUser.id === userId) {
          mutations.setSelectedUser(null)
        }
      } catch (error) {
        mutations.setError(error.message)
        throw error
      } finally {
        mutations.setLoading(false)
      }
    }
  }

  return { store, mutations, actions }
}

export default createStore 