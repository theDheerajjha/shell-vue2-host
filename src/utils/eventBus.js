// Event bus configuration with dynamic imports for Module Federation
async function createEventBus() {
  const Vue = await import('vue')

  // Create a global event bus for communication between shell and remote apps
  const eventBus = new Vue.default()

  // Event types
  const EVENTS = {
    USER_UPDATED: 'user-updated',
    USER_CREATED: 'user-created',
    USER_DELETED: 'user-deleted',
    USERS_LOADED: 'users-loaded',
    UPDATE_USER_REQUEST: 'update-user-request',
    CREATE_USER_REQUEST: 'create-user-request',
    DELETE_USER_REQUEST: 'delete-user-request',
    FETCH_USERS_REQUEST: 'fetch-users-request',
    SHOW_NOTIFICATION: 'show-notification'
  }

  // Helper methods for common event patterns
  const eventHelpers = {
    // Emit user update request
    requestUserUpdate(userId, userData) {
      eventBus.$emit(EVENTS.UPDATE_USER_REQUEST, { userId, userData })
    },
    
    // Emit user creation request
    requestUserCreation(userData) {
      eventBus.$emit(EVENTS.CREATE_USER_REQUEST, userData)
    },
    
    // Emit user deletion request
    requestUserDeletion(userId) {
      eventBus.$emit(EVENTS.DELETE_USER_REQUEST, userId)
    },
    
    // Emit fetch users request
    requestFetchUsers() {
      eventBus.$emit(EVENTS.FETCH_USERS_REQUEST)
    },
    
    // Show notification
    showNotification(message, type = 'info') {
      eventBus.$emit(EVENTS.SHOW_NOTIFICATION, { message, type })
    }
  }

  return { eventBus, EVENTS, eventHelpers }
}

export default createEventBus 