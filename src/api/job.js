import { baseURL } from "../helpers/config"

const basePath = `${baseURL}/jobs`

export const searchJobs = async (filters) => {
  const payload = new FormData()
  payload.set('filters', JSON.stringify({ ...filters }))

  const target = `${basePath}/search`
  const options = {
    method: 'POST',
    body: payload
  }
  
  return await fetch(target, options).then(r => r.json()) || []
}

export const uploadJobs = async (payload) => {
  // TODO: this should also cover companies
  const route = 'jobs/upload'
  const endpoint = `${basePath}/${route}`

  // TODO: this could also be a CSV

  const options = {
    method: 'POST',
    body: payload
  }

  return await fetch(endpoint, options).then(r => r.json())
}

export const updateStatus = async (route, jobId) => {
  const endpoint = `${basePath}/${jobId}/${route}`

  return await fetch(endpoint, { method: 'POST' }).then(r => r.json())
}

// formdata
export const saveCoverLetter = async (payload, jobId) => {
  const options = {
    method: 'PUT',
    body: payload,
  }

  const endpoint = `${basePath}/${jobId}/cover_letter`

  return await fetch(endpoint, options)
    .then(r => r.json())
}

// setInterviews
export const updateInterview = async (payload, jobId, round) => {
  const options = {
    method: 'PUT',
    body: JSON.stringify(payload)
  }

  const endpoint = `${basePath}/${jobId}/interviews/${round}`

  return await fetch(endpoint, options)
    .then(r => r.json())
}