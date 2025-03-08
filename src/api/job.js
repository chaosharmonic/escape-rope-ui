import { baseURL } from "../helpers/config"

const basePath = `${baseURL}/jobs`

export const searchJobs = async (filters) => {
  const payload = new FormData()
  payload.set('filters', JSON.stringify({ ...filters }))


  const target = `${baseURL}/jobs/search`
  const options = {
    method: 'POST',
    body: payload
  }
  const data = await fetch(target, options).then(r => r.json()) || []

  return data
}

// WIP

// export const uploadJobs = async () => {

// }

// formdata
export const saveCoverLetter = async (payload, jobId) => {
    const options = {
        method: 'PUT',
        body: payload,
    }

    const endpoint = `${basePath}/${jobId}/cover_letter`

    const data = await fetch(endpoint, options)
        .then(r => r.json())

    return data
}

// setInterviews
export const updateInterview = async (payload, jobId, round) => {
    const options = {
        method: 'PUT',
        body: JSON.stringify(payload)
    }

    const endpoint = `${basePath}/${jobId}/interviews/${round}`

    const data = await fetch(endpoint, options)
        .then(r => r.json())
    
    return data
}