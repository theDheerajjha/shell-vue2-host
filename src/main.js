// Bootstrap function for Module Federation
async function bootstrap() {
  console.log('Starting shell app bootstrap...')
  
  const Vue = await import('vue')
  console.log('Vue imported successfully')
  
  const App = await import('./App.vue')
  console.log('App component imported successfully')
  
  const createRouter = await import('./router')
  console.log('Router imported successfully')
  
  const createI18n = await import('./i18n')
  console.log('I18n imported successfully')
  
  const createStore = await import('./store')
  console.log('Store imported successfully')
  
  const createEventBus = await import('./utils/eventBus')
  console.log('EventBus imported successfully')

  Vue.default.config.productionTip = false

  // Create store instance
  const { store, actions } = await createStore.default()
  console.log('Store created successfully')

  // Create event bus instance
  const { eventBus, EVENTS, eventHelpers } = await createEventBus.default()
  console.log('EventBus created successfully')

  // Make store and actions globally available
  Vue.default.prototype.$store = store
  Vue.default.prototype.$actions = actions
  Vue.default.prototype.$eventBus = eventBus
  Vue.default.prototype.$eventHelpers = eventHelpers
  console.log('Global properties set successfully')

  // Create i18n instance
  const i18n = await createI18n.default()
  console.log('I18n created successfully')

  // Set up event listeners for remote app communication
  eventBus.$on(EVENTS.UPDATE_USER_REQUEST, async ({ userId, userData }) => {
    try {
      await actions.updateUser(userId, userData)
      eventBus.$emit(EVENTS.USER_UPDATED, { userId, userData })
      eventBus.$emit(EVENTS.SHOW_NOTIFICATION, { 
        message: i18n.t('messages.userUpdated'), 
        type: 'success' 
      })
    } catch (error) {
      eventBus.$emit(EVENTS.SHOW_NOTIFICATION, { 
        message: error.message, 
        type: 'error' 
      })
    }
  })

  eventBus.$on(EVENTS.CREATE_USER_REQUEST, async (userData) => {
    try {
      const newUser = await actions.createUser(userData)
      eventBus.$emit(EVENTS.USER_CREATED, newUser)
      eventBus.$emit(EVENTS.SHOW_NOTIFICATION, { 
        message: i18n.t('messages.userCreated'), 
        type: 'success' 
      })
    } catch (error) {
      eventBus.$emit(EVENTS.SHOW_NOTIFICATION, { 
        message: error.message, 
        type: 'error' 
      })
    }
  })

  eventBus.$on(EVENTS.DELETE_USER_REQUEST, async (userId) => {
    try {
      await actions.deleteUser(userId)
      eventBus.$emit(EVENTS.USER_DELETED, { userId })
      eventBus.$emit(EVENTS.SHOW_NOTIFICATION, { 
        message: i18n.t('messages.userDeleted'), 
        type: 'success' 
      })
    } catch (error) {
      eventBus.$emit(EVENTS.SHOW_NOTIFICATION, { 
        message: error.message, 
        type: 'error' 
      })
    }
  })

  eventBus.$on(EVENTS.FETCH_USERS_REQUEST, async () => {
    await actions.fetchUsers()
    eventBus.$emit(EVENTS.USERS_LOADED, store.users)
  })

  // Load initial data
  console.log('Loading initial data...')
  await actions.fetchUsers()
  console.log('Initial data loaded successfully')

  // Create router instance
  const router = await createRouter.default()
  console.log('Router created successfully')

  const vueApp = new Vue.default({
    router,
    i18n,
    render: h => h(App.default)
  })
  
  console.log('Vue app created successfully, mounting...')
  vueApp.$mount('#app')
  console.log('Shell app mounted successfully')
}

// Start the application
bootstrap().catch(error => {
  console.error('Failed to bootstrap shell app:', error)
})
