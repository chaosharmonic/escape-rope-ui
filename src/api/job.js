import { baseURL } from "../helpers/config"

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

    const endpoint = `${baseURL}/jobs/${jobId}/cover_letter`

    const data = await fetch(endpoint, options)
        .then(r => r.json())

    return data
}

// setInterviews
// export const updateInterviewQuestions = async (payload) => {
//     const options = {
//         method: 'PUT',
//         body: payload
//     }

//     console.log(payload.get('defaultInterviewQuestions'))

//     const endpoint = `${baseURL}/job/${jobId}/interviews/${}`

//     const data = await fetch(endpoint, options)
//         .then(r => r.json())
    
//     return data
// }