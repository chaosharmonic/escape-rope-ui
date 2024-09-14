const protocol = import.meta.env.SERVER_PROTOCOL || 'http'
const domain = import.meta.env.SERVER_URL || 'localhost'
const port = import.meta.env.SERVER_PORT || '3030'

export const baseURL = `${protocol}://${domain}:${port}`