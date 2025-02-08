import { baseURL } from "../helpers/config"

export const getSettings = async () => {
    const endpoint = `${baseURL}/settings/`
    const data = await fetch(endpoint).then(r => r.json()) || []

    return data
}

export const updateSettings = async (payload) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }
    
    const endpoint = `${baseURL}/settings/`
    
    const data = await fetch(endpoint, options)
        .then(r => r.json())
    
    return data
}

export const updateCoverLetters = async (payload) => {
    const options = {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const endpoint = `${baseURL}/settings/campaign/cover_letters`

    const data = await fetch(endpoint, options)
        .then(r => r.json())
    
    return data
}

export const updateInterviewQuestions = async (payload) => {
    const options = {
        method: 'PUT',
        body: payload
    }

    console.log(payload.get('defaultInterviewQuestions'))

    const endpoint = `${baseURL}/settings/campaign/interview_questions`

    const data = await fetch(endpoint, options)
        .then(r => r.json())
    
    return data
}

export const updateBlocklist = async (payload) => {
    const options = {
        method: 'PUT',
        body: payload
    }

    console.log(payload.get('blocklist'))

    const endpoint = `${baseURL}/settings/campaign/blocklist`

    const data = await fetch(endpoint, options)
        .then(r => r.json())
    
    return data
}