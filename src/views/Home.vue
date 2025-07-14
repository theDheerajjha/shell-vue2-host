<template>
  <div class="home">
    <div class="container">
      <div class="navigation-cards">
        <div class="card" @click="navigateToUsers">
          <h3>{{ i18n.t('nav.users') }}</h3>
          <p>View and manage users with the Vue 3 Users App</p>
          <button class="btn-primary">Go to Users</button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  computed: {
    i18n() {
      return this.$i18n
    }
  },
  methods: {
    navigateToUsers() {
      this.$router.push('/users')
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  color: #333;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.welcome-section p {
  font-size: 1.1rem;
  margin: 10px 0;
}

.navigation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card h3 {
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.card p {
  margin-bottom: 20px;
  opacity: 0.9;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #45a049;
}

.features {
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.features h2 {
  margin-bottom: 20px;
  text-align: center;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  padding-left: 25px;
}

.features li:before {
  position: absolute;
  left: 0;
  color: #4CAF50;
  font-weight: bold;
}

.features li:last-child {
  border-bottom: none;
}
</style> 