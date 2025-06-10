import { computed, effect, signal } from "@preact/signals-react";
import { getSettings } from "../api/settings";

const defaultCampaign = {
    name: 'default'
    // ...and so on
}

const defaultSettings = {
    campaigns: [ defaultCampaign ]
}

export const settings = signal(defaultSettings)
const storeSettings = (nextSettings) => {
    settings.value = nextSettings
}

effect(async () => {
    const data = await getSettings()

    storeSettings(data)
})

// derived values

const campaigns = computed(() => 
    settings?.value?.value?.campaigns || []
)

// TODO: support multiple concurrent searches
export const campaign = computed(() => {
    if (!campaigns?.value) return {}
    
    return campaigns?.value?.at(0)
})

const getTargetCampaign = (index) => {
    const {
        length: totalCampaigns = 0
    } = campaigns?.value

    let targetCampaignIndex = Math.min(
        Math.max(index, 0),
        totalCampaigns - 1
    )
    
    const campaign = campaigns?.value
        ?.at(index)
    
    return {
        targetCampaign: campaign,
        index: targetCampaignIndex
    }
}

// actions

export const setCoverLetterTemplate = (
    coverLetter,
    index,
    campaignIndex = 0,
) => {
    // TODO: if campaign = 'global'...
    console.log(campaigns?.value)

    const {
        targetCampaign,
        index: targetCampaignIndex
    } = getTargetCampaign(campaignIndex)

    const { coverLetters = [] } = targetCampaign

    const { length: totalCoverLetters } = coverLetters

    const targetCoverLetterIndex = Math.min(
        Math.max(index, 0),
        totalCoverLetters - 1
    )
    

    targetCampaign.coverLetters = coverLetters
        ?.toSpliced(targetCoverLetterIndex, 1, coverLetter)


    const nextCampaigns = campaigns?.value
        ?.toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const removeCoverLetterTemplate = (
    index,
    campaignIndex = 0,
) => {
    // TODO: if campaign = 'global'...

    const {
        targetCampaign,
        index: targetCampaignIndex
    } = getTargetCampaign(campaignIndex)

    const { coverLetters = [] } = targetCampaign

    targetCampaign.coverLetters = coverLetters
        .toSpliced(index)

    console.log({coverLetters, index})
    
    const nextCampaigns = campaigns?.value
        ?.toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const setBlocklist = (
    blocklist,
    campaignIndex = 0,
) => {
    // TODO: if campaign = 'global'...

    const {
        targetCampaign,
        index: targetCampaignIndex
    } = getTargetCampaign(campaignIndex)

    targetCampaign.blocklist = blocklist

    const nextCampaigns = campaigns?.value
        ?.toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const setBasicDetails = (
    details,
    campaignIndex = 0
) => {
    // TODO: if campaign = 'global'..

    const {
        targetCampaign,
        index: targetCampaignIndex
    } = getTargetCampaign(campaignIndex)

    for (let [k, v] of Object.entries(details)) {
        targetCampaign[k] = v
    }

    const nextCampaigns = campaigns?.value
        ?.toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}

export const setDefaultInterviewQuestions = (
    entries,
    campaignIndex = 0
) => {
    // TODO: if campaign = 'global'...

    const {
        targetCampaign,
        index: targetCampaignIndex
    } = getTargetCampaign(campaignIndex)

    targetCampaign.defaultInterviewQuestions = entries

    const nextCampaigns = campaigns?.value
        ?.toSpliced(targetCampaignIndex, 1, targetCampaign)

    const nextSettings = {
        ...settings.value,
        campaigns: nextCampaigns
    }

    storeSettings(nextSettings)
}
