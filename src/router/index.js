// Router configuration with dynamic imports for Module Federation
async function createRouter() {
  const Vue = await import('vue')
  const VueRouter = await import('vue-router')
  const Home = await import('../views/Home.vue')

  Vue.default.use(VueRouter.default)

  const routes = [
    {
      path: '/',
      name: 'Home',
      component: Home.default
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/RemoteApp.vue'),
      props: { appName: 'usersApp' },
      meta: { componentKey: 'users' }
    },
    {
      path: '/edit-user',
      name: 'EditUser',
      component: () => import('../views/RemoteApp.vue'),
      props: { appName: 'editUserApp' },
      meta: { componentKey: 'edit-user' }
    }
  ]

  return new VueRouter.default({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })
}

export default createRouter 