// I18n configuration with dynamic imports for Module Federation
async function createI18n() {
  const Vue = await import('vue')
  const VueI18n = await import('vue-i18n')

  Vue.default.use(VueI18n.default)

  const messages = {
    en: {
      // Navigation
      nav: {
        home: 'Home',
        users: 'Users',
        editUser: 'Edit User'
      },

      // User management
      users: {
        title: 'User Management',
        table: {
          name: 'Name',
          email: 'Email',
          role: 'Role',
          actions: 'Actions'
        },
        actions: {
          edit: 'Edit',
          delete: 'Delete',
          create: 'Create User'
        },
        roles: {
          admin: 'Administrator',
          user: 'User'
        }
      },

      // Edit user form
      editUser: {
        title: 'Edit User',
        createTitle: 'Create User',
        form: {
          name: 'Name',
          email: 'Email',
          role: 'Role',
          submit: 'Save Changes',
          create: 'Create User',
          cancel: 'Cancel'
        },
        validation: {
          nameRequired: 'Name is required',
          emailRequired: 'Email is required',
          emailInvalid: 'Please enter a valid email address',
          roleRequired: 'Role is required'
        }
      },

      // Common
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Operation completed successfully',
        confirm: 'Are you sure?',
        yes: 'Yes',
        no: 'No',
        back: 'Back'
      },

      // Messages
      messages: {
        userUpdated: 'User updated successfully',
        userCreated: 'User created successfully',
        userDeleted: 'User deleted successfully',
        confirmDelete: 'Are you sure you want to delete this user?',
        noUsers: 'No users found',
        loadingUsers: 'Loading users...'
      }
    }
  }

  return new VueI18n.default({
    locale: 'en',
    fallbackLocale: 'en',
    messages
  })
}

export default createI18n 