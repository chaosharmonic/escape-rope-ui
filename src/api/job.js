import { baseURL } from "../helpers/config"

const basePath = `${baseURL}/jobs`

// WIP

// export const getJobs = async () => {
//     // const endpoint = `${baseURL}/settings/`
//     const data = await fetch(endpoint).then(r => r.json()) || []

//     return data
// }

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