import { jobs } from '../test_data.json' with { type: 'json' }

import { baseURL } from "../helpers/config"

const basePath = `${baseURL}/jobs`

export const searchJobs = async (filters) => {
  // API mock for demo 
  // console.log(jobs, filters)

  const results = jobs
    ?.filter(j => filters.status.includes(j.value.lifecycle))
    ?.toSorted(() => Math.random() > 0.5)
    ?.toSorted(() => Math.random() > 0.5)
  
  return results

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
  await new Promise (r => setTimeout(() => r(), 450))
  return true

  // TODO: this should also cover companies
  const endpoint = `${basePath}/upload`

  // TODO: this could also be a CSV

  const options = {
    method: 'POST',
    body: payload
  }

  return await fetch(endpoint, options).then(r => r.json())
}

export const updateStatus = async (route, jobId) => {
  return true
  
  const endpoint = `${basePath}/${jobId}/${route}`

  return await fetch(endpoint, { method: 'POST' }).then(r => r.json())
}

// formdata
export const saveCoverLetter = async (payload, jobId) => {
  return true

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
  return true

  const options = {
    method: 'PUT',
    body: JSON.stringify(payload)
  }

  const endpoint = `${basePath}/${jobId}/interviews/${round}`

  return await fetch(endpoint, options)
    .then(r => r.json())
}