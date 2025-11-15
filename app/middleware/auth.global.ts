import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  if (process.client) { // hanya jalan di browser
    const token = localStorage.getItem('token')
    console.log('Auth Middleware: token=', token)

    if (!token && to.path !== '/login') {
      return navigateTo('/login')
    }
  }
})
