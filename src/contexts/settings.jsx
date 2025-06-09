import { createContext } from "react";
import { computed, signal } from "@preact/signals-react";

const defaultCampaign = {
    name: 'default'
    // ...and so on
}

const defaultSettings = {
    campaigns: [ defaultCampaign ]
}

const settings = signal(defaultSettings)

const SettingsContext = createContext({settings})

const campaigns = computed(() => {
    if (!settings?.value?.campaigns) return {}

    return settings?.value?.campaigns
})

// TODO: support multiple concurrent searches
export const campaign = computed(() => {
    if (!campaigns?.value) return {}

    return settings?.value?.campaigns?.at(0)
})

const state = {
    settings,
}

const derived = {
    campaign
}

// actions

export const storeSettings = (nextSettings) => {
    settings.value = nextSettings
}

export const setCoverLetterTemplate = (
    coverLetter,
    index,
    campaign = 0,
) => {
    // TODO: if campaign = 'global'...

    const { campaigns = [] } = settings?.value

    const { length: totalCampaigns } = campaigns

    let targetCampaignIndex = Math
        .min(campaign, totalCampaigns - 1)

    const targetCampaign = campaigns
        ?.at(targetCampaignIndex)

    const { coverLetters = [] } = targetCampaign

    const { length: totalCoverLetters } = coverLetters

    const targetCoverLetterIndex = Math
        .max(index, totalCoverLetters - 1)

    targetCampaign.coverLetters = coverLetters
        .toSpliced(targetCoverLetterIndex, 1, coverLetter)

    const nextCampaigns = campaigns
        .toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const removeCoverLetterTemplate = (
    index,
    campaign = 0,
) => {
    // TODO: if campaign = 'global'...

    const { campaigns = [] } = settings?.value

    const { length: totalCampaigns } = campaigns

    let targetCampaignIndex = Math
        .min(campaign, totalCampaigns - 1)

    const targetCampaign = campaigns
        ?.at(targetCampaignIndex)

    const { coverLetters = [] } = targetCampaign

    targetCampaign.coverLetters = coverLetters
        .toSpliced(index)

    console.log({coverLetters, index})
    
    const nextCampaigns = campaigns
        .toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const setBlocklist = (
    blocklist,
    campaign = 0,
) => {
    // TODO: if campaign = 'global'...

    const { campaigns = [] } = settings?.value

    const { length: totalCampaigns } = campaigns

    let targetCampaignIndex = Math
        .min(campaign, totalCampaigns - 1)

    const targetCampaign = campaigns
        ?.at(targetCampaignIndex)

    targetCampaign.blocklist = blocklist

    const nextCampaigns = campaigns
        .toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const setBasicDetails = (
    details,
    campaign = 0
) => {
    // TODO: if campaign = 'global'...
    const { campaigns = [] } = settings?.value

    const { length: totalCampaigns } = campaigns

    let targetCampaignIndex = Math
        .min(campaign, totalCampaigns - 1)

    const targetCampaign = campaigns
        ?.at(targetCampaignIndex)

    for (let [k, v] of Object.entries(details)) {
        targetCampaign[k] = v
    }

    const nextCampaigns = campaigns
        .toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const setDefaultInterviewQuestions = (
    entries,
    campaign = 0
) => {
    // TODO: if campaign = 'global'...

    const { campaigns = [] } = settings?.value

    const { length: totalCampaigns } = campaigns

    let targetCampaignIndex = Math
        .min(campaign, totalCampaigns - 1)

    const targetCampaign = campaigns
        ?.at(targetCampaignIndex)

    targetCampaign.defaultInterviewQuestions = entries

    const nextCampaigns = campaigns
        .toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

// basic details
// default interview questions

const actions = {}

const providerValue = {
    ...state,
    ...derived,
    ...actions
}


const SettingsProvider = ({ children }) => {
    <SettingsContext.Provider value={providerValue}>
        {children}
    </SettingsContext.Provider>
}

export default SettingsProvider