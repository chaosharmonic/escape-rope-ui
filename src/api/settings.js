import { settings } from '../test_data.json' with { type: 'json' }
import { baseURL } from "../helpers/config"

export const getSettings = async () => {
    return settings
    
    const endpoint = `${baseURL}/settings/`
    const data = await fetch(endpoint).then(r => r.json()) || []

    return data
}

export const updateSettings = async (payload) => {
    return true
    
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

export const updateBasicDetails = async (payload) => {
    return true
    
    const options = {
        method: 'PUT',
        body: payload
    }

    const endpoint = `${baseURL}/settings/campaign/basic_details`

    const data = await fetch(endpoint, options)
        .then(r => r.json())
    
    return data
}

export const updateCoverLetters = async (payload) => {
    return true
    
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
    return true
    
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
    return true
    
    const blocklist = payload.entries()
        .map(([k, v]) => ({[k]: JSON.parse(v)}))
        .reduce((a, b) => ({ ...a, ...b }))

    const body = new FormData()

    body.set('blocklist', JSON.stringify(blocklist))

    console.log(body.get('blocklist'))

    const options = {
        method: 'PUT',
        body
    }

    const endpoint = `${baseURL}/settings/campaign/blocklist`

    const data = await fetch(endpoint, options)
        .then(r => r.json())
    
    return data
}