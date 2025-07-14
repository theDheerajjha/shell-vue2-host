const { defineConfig } = require('@vue/cli-service')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

// Get remote URLs from environment variables or use localhost for development
const getRemoteUrl = (appName, defaultPort) => {
  const envVar = process.env[`${appName.toUpperCase()}_URL`]
  if (envVar) {
    return `${envVar}/remoteEntry.js`
  }
  return `http://localhost:${defaultPort}/remoteEntry.js`
}

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new ModuleFederationPlugin({
        name: 'shell',
        filename: 'remoteEntry.js',
        remotes: {
          usersApp: `usersApp@${getRemoteUrl('usersApp', 3001)}`,
          editUserApp: `editUserApp@${getRemoteUrl('editUserApp', 3002)}`
        },
        exposes: {
          './store': './src/store/index.js',
          './i18n': './src/i18n/index.js',
          './eventBus': './src/utils/eventBus.js',
          './eventHelpers': './src/utils/eventBus.js'
        },
        shared: {
          vue: {
            singleton: true,
            requiredVersion: '^2.6.14'
          },
          'vue-i18n': {
            singleton: true,
            requiredVersion: '^8.28.2'
          }
        }
      })
    ]
  },
  devServer: {
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
