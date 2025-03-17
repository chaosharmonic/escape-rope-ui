const protocol = import.meta.env.VITE_SERVER_PROTOCOL || 'http'
const domain = import.meta.env.VITE_SERVER_URL || 'localhost'
const port = import.meta.env.VITE_SERVER_PORT || '3030'

export const baseURL = `${protocol}://${domain}:${port}`