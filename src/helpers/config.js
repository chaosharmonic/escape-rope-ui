// assign default values if env variables are empty
const protocol = import.meta.env.VITE_SERVER_PROTOCOL || 'http'
const domain = import.meta.env.VITE_SERVER_URL || 'localhost'
const port = import.meta.env.VITE_SERVER_PORT || '3030'

const host = `${protocol}://${domain}`

// include port only if it's a number
export const baseURL = Number(port) ? `${host}:${port}` : host