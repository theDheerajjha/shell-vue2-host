<template>
  <div class="remote-app" :key="appName">
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <p>{{ i18n.t('common.loading') }}</p>
    </div>

    <div class="error-container" v-else-if="error">
      <h3>{{ i18n.t('common.error') }}</h3>
      <p>{{ error }}</p>
      <button @click="retryLoad" class="btn-retry">Retry</button>
    </div>

    <div v-else class="remote-component-wrapper">
      <!-- Use iframe to load Vue 3 app -->
      <iframe v-if="iframeUrl" :key="iframeKey" :src="iframeUrl" class="remote-iframe" frameborder="0"
        @load="onIframeLoad" @error="onIframeError"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RemoteApp',
  props: {
    appName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      iframeUrl: null,
      iframeKey: 0,
      iframeLoaded: false,
      lastSentData: null,
      updateTimeout: null
    }
  },
  computed: {
    store() {
      return this.$store
    },
    actions() {
      return this.$actions
    },
    i18n() {
      return this.$i18n
    },
    eventBus() {
      return this.$eventBus
    },
    eventHelpers() {
      return this.$eventHelpers
    },
    // Create a stable key for the iframe to prevent unnecessary reloads
    currentRouteKey() {
      const query = this.$route.query
      const queryString = Object.keys(query).length > 0
        ? '?' + new URLSearchParams(query).toString()
        : ''
      return `${this.appName}${queryString}`
    }
  },
  async mounted() {
    await this.loadRemoteApp()
  },
  beforeDestroy() {
    // Clean up timeout to prevent memory leaks
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
    }
  },
  watch: {
    // Watch for changes in appName prop - only reload if app actually changes
    appName: {
      handler(newAppName, oldAppName) {
        if (newAppName !== oldAppName) {
          console.log(`App name changed from ${oldAppName} to ${newAppName}`)
          this.loadRemoteApp()
        }
      },
      immediate: true
    },
    // Watch for route changes (query parameters) - only reload if route actually changes
    currentRouteKey: {
      handler(newKey, oldKey) {
        if (newKey !== oldKey) {
          console.log('Route key changed:', { oldKey, newKey })
          this.loadRemoteApp()
        }
      },
      immediate: true
    },
    // Watch for store changes to sync with iframe - but don't reload iframe
    'store.users': {
      handler(newUsers) {
        if (this.iframeLoaded) {
          this.sendStoreUpdateToIframe()
        }
      },
      deep: true
    },
    'store.loading': {
      handler(newLoading) {
        if (this.iframeLoaded) {
          this.sendStoreUpdateToIframe()
        }
      }
    },
    'store.error': {
      handler(newError) {
        if (this.iframeLoaded) {
          this.sendStoreUpdateToIframe()
        }
      }
    }
  },
  methods: {
    async loadRemoteApp() {
      this.loading = true
      this.error = null
      this.iframeLoaded = false
      this.lastSentData = null

      try {
        console.log(`[RemoteApp] loadRemoteApp called for appName: ${this.appName}`)
        // Get current route query parameters
        const queryParams = this.$route.query
        const queryString = Object.keys(queryParams).length > 0
          ? '?' + new URLSearchParams(queryParams).toString()
          : ''

        // Set the iframe URL based on the app name
        const usersAppUrl = process.env.VUE_APP_USERSAPP_URL || 'http://localhost:3001';
        const editUserAppUrl = process.env.VUE_APP_EDITUSERAPP_URL || 'http://localhost:3002';
        if (process.env.NODE_ENV === 'production') {
          if (!process.env.VUE_APP_USERSAPP_URL || !process.env.VUE_APP_EDITUSERAPP_URL) {
            console.warn('[RemoteApp] WARNING: Production build is missing VUE_APP_USERSAPP_URL or VUE_APP_EDITUSERAPP_URL. Falling back to localhost.');
          }
        }
        console.log("usersAppUrl", usersAppUrl)
        console.log("editUserAppUrl", editUserAppUrl)
        if (this.appName === 'usersApp') {
          this.iframeUrl = `${usersAppUrl}${queryString}`;
          console.log(`[RemoteApp] Loading users app in iframe: ${this.iframeUrl}`);
        } else if (this.appName === 'editUserApp') {
          this.iframeUrl = `${editUserAppUrl}${queryString}`;
          console.log(`[RemoteApp] Loading edit user app in iframe: ${this.iframeUrl}`);
        } else {
          throw new Error(`Unknown app: ${this.appName}`)
        }

        // Increment iframe key to force reload only when necessary
        this.iframeKey++

        this.loading = false
      } catch (err) {
        console.error('[RemoteApp] Failed to load remote app:', err)
        this.error = `Failed to load ${this.appName}: ${err.message}`
        this.loading = false
      }
    },

    onIframeLoad() {
      console.log('[RemoteApp] Iframe loaded successfully')
      this.iframeLoaded = true
      // Set up communication after iframe is loaded
      this.setupIframeCommunication()
    },

    onIframeError() {
      console.error('Iframe failed to load')
      this.error = `Failed to load ${this.appName} in iframe`
      this.iframeLoaded = false
    },

    setupIframeCommunication() {
      // Set up communication between Vue 2 shell and Vue 3 iframe
      const iframe = this.$el.querySelector('iframe')
      if (iframe && iframe.contentWindow) {
        // Send initial data to iframe after it loads
        setTimeout(() => {
          try {
            // Send store data to iframe
            const message = {
              type: 'INIT_DATA',
              store: {
                users: this.store.users || [],
                loading: this.store.loading || false,
                error: this.store.error || null,
                selectedUser: this.store.selectedUser || null
              },
              translations: {
                'users.title': this.i18n.t('users.title'),
                'common.loading': this.i18n.t('common.loading'),
                'messages.loadingUsers': this.i18n.t('messages.loadingUsers'),
                'messages.noUsers': this.i18n.t('messages.noUsers'),
                'users.table.name': this.i18n.t('users.table.name'),
                'users.table.email': this.i18n.t('users.table.email'),
                'users.table.role': this.i18n.t('users.table.role'),
                'users.table.actions': this.i18n.t('users.table.actions'),
                'users.roles.admin': this.i18n.t('users.roles.admin'),
                'users.roles.user': this.i18n.t('users.roles.user'),
                'users.actions.edit': this.i18n.t('users.actions.edit'),
                'users.actions.delete': this.i18n.t('users.actions.delete'),
                'messages.confirmDelete': this.i18n.t('messages.confirmDelete'),
                'editUser.title': this.i18n.t('editUser.title'),
                'editUser.createTitle': this.i18n.t('editUser.createTitle'),
                'editUser.form.name': this.i18n.t('editUser.form.name'),
                'editUser.form.email': this.i18n.t('editUser.form.email'),
                'editUser.form.role': this.i18n.t('editUser.form.role'),
                'editUser.form.submit': this.i18n.t('editUser.form.submit'),
                'editUser.form.create': this.i18n.t('editUser.form.create'),
                'editUser.form.cancel': this.i18n.t('editUser.form.cancel'),
                'editUser.validation.nameRequired': this.i18n.t('editUser.validation.nameRequired'),
                'editUser.validation.emailRequired': this.i18n.t('editUser.validation.emailRequired'),
                'editUser.validation.emailInvalid': this.i18n.t('editUser.validation.emailInvalid'),
                'editUser.validation.roleRequired': this.i18n.t('editUser.validation.roleRequired')
              }
            }

            iframe.contentWindow.postMessage(message, '*')
            this.lastSentData = JSON.stringify(message)
            console.log('[RemoteApp] Sent INIT_DATA to iframe:', message)
          } catch (err) {
            console.error('[RemoteApp] Failed to send data to iframe:', err)
          }
        }, 1000)

        // Listen for messages from iframe
        window.addEventListener('message', (event) => {
          if (event.source === iframe.contentWindow) {
            console.log('[RemoteApp] Message from iframe:', event.data)
            this.handleIframeMessage(event.data)
          }
        })

        console.log('[RemoteApp] Iframe communication setup complete')
      }
    },

    handleIframeMessage(data) {
      // Handle messages from the Vue 3 iframe
      switch (data.type) {
        case 'FETCH_USERS':
          // Call the function directly instead of passing it
          if (this.eventHelpers && this.eventHelpers.requestFetchUsers) {
            this.eventHelpers.requestFetchUsers()
          }
          break
        case 'DELETE_USER':
          // Call the function directly instead of passing it
          if (this.eventHelpers && this.eventHelpers.requestUserDeletion) {
            this.eventHelpers.requestUserDeletion(data.userId)
          }
          break
        case 'UPDATE_USER':
          // Handle user update requests from iframe
          if (this.eventHelpers && this.eventHelpers.requestUserUpdate) {
            this.eventHelpers.requestUserUpdate(data.userId, data.userData)
          }
          break
        case 'CREATE_USER':
          // Handle user creation requests from iframe
          if (this.eventHelpers && this.eventHelpers.requestUserCreation) {
            this.eventHelpers.requestUserCreation(data.userData)
          }
          break
        case 'NAVIGATE':
          // Handle navigation requests from iframe
          if (data.route) {
            this.$router.push(data.route)
          }
          break
        case 'UPDATE_STORE':
          // Handle store updates from iframe
          if (data.storeData && this.store) {
            // Update store with new data
            Object.assign(this.store, data.storeData)
          }
          break
        default:
          console.log('Unknown message type from iframe:', data.type)
      }
    },

    sendStoreUpdateToIframe() {
      // Clear any existing timeout
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout)
      }

      // Debounce the update to prevent rapid successive calls
      this.updateTimeout = setTimeout(() => {
        const iframe = this.$el.querySelector('iframe')
        if (iframe && iframe.contentWindow && this.iframeLoaded) {
          try {
            const message = {
              type: 'STORE_UPDATE',
              store: {
                users: this.store.users || [],
                loading: this.store.loading || false,
                error: this.store.error || null,
                selectedUser: this.store.selectedUser || null
              }
            }

            // Only send if data has actually changed to prevent unnecessary updates
            const messageString = JSON.stringify(message)
            if (messageString !== this.lastSentData) {
              iframe.contentWindow.postMessage(message, '*')
              this.lastSentData = messageString
              console.log('Sent store update to iframe:', message)
            }
          } catch (err) {
            console.error('Failed to send store update to iframe:', err)
          }
        }
      }, 100) // 100ms debounce
    },

    retryLoad() {
      this.loadRemoteApp()
    }
  }
}
</script>

<style scoped>
.remote-app {
  min-height: 100vh;
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  text-align: center;
  padding: 40px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  color: #721c24;
}

.btn-retry {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}

.btn-retry:hover {
  background: #c82333;
}

.remote-component-wrapper {
  width: 100%;
  height: 100vh;
}

.remote-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>