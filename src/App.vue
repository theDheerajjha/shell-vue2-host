<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          Federation setup with Vue2 </router-link>

        <div class="nav-links">
          <router-link to="/" class="nav-link" exact>
            Home
          </router-link>
          <router-link to="/users" class="nav-link">
            Users
          </router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <!-- Notification System -->
    <div class="notifications" v-if="notifications.length > 0">
      <div v-for="notification in notifications" :key="notification.id"
        :class="['notification', `notification-${notification.type}`]">
        <span class="notification-message">{{ notification.message }}</span>
        <button @click="removeNotification(notification.id)" class="notification-close">×</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      notifications: [],
      notificationId: 0
    }
  },
  mounted() {
    // Listen for notification events
    this.$eventBus.$on('show-notification', this.showNotification)
  },
  beforeDestroy() {
    this.$eventBus.$off('show-notification', this.showNotification)
  },
  methods: {
    showNotification({ message, type = 'info' }) {
      const id = ++this.notificationId
      const notification = { id, message, type }

      this.notifications.push(notification)

      // Auto-remove after 5 seconds
      setTimeout(() => {
        this.removeNotification(id)
      }, 5000)
    },

    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-brand {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.nav-brand:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
  border: 2px solid transparent;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.main-content {
  flex: 1;
}

/* Notification Styles */
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-radius: 5px;
  color: white;
  min-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.notification-info {
  background-color: #3498db;
}

.notification-success {
  background-color: #27ae60;
}

.notification-error {
  background-color: #e74c3c;
}

.notification-warning {
  background-color: #f39c12;
}

.notification-message {
  flex: 1;
  margin-right: 10px;
}

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  opacity: 0.8;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }

  .nav-brand {
    font-size: 1.5rem;
  }

  .nav-links {
    gap: 10px;
  }

  .nav-link {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
