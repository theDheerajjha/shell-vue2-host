# Shell Vue2 Host App

**A modular frontend platform where a Vue 2 shell dynamically loads Vue 3 remote applications using Module Federation.**

## Local Setup

```bash
# Install dependencies for the shell app
cd shell-vue2-host && npm install

# Run the shell app (Vue 2)
cd shell-vue2-host && npm run serve
```

## What's Built

- **shell-vue2-host**: Vue 2 host app with global store, i18n, and routing
- Dynamically loads remote Vue 3 apps (users-app-vue3, edit-user-app-vue3) via Module Federation and iframe

## How It Works

The Vue 2 shell owns the global state and i18n. Vue 3 remote apps are loaded dynamically and communicate with the shell through events. Remote apps don't have their own state or i18n - they consume everything from the parent shell.

## Access Points

- Shell app (local): http://localhost:3000
- Users app (remote): http://localhost:3001
- Edit user app (remote): http://localhost:3002

When deployed, the shell loads the remote apps from their Vercel URLs.

Navigate to `/users` in the shell to see the user list, or `/edit-user?id=1` to edit a specific user. 