import { createContext } from "react";
import { signal, computed } from "@preact/signals-react";

const defaultFilters = {
    status: ['queued']
}

const jobs = signal([])

const filters = signal(defaultFilters)

const defaultState = { jobs, filters }

export const JobsContext = createContext(defaultState)


// derived values

export const totalJobs = computed(() => jobs?.value?.length)

// const targetJob = computed(() => {
//     if (!totalJobs.value) return null
    
//     const { id, value: job } = jobs?.value?.at(0)

//     return { id, ...job }
// })


// actions
export const setJobs = (nextJobs) => {
    jobs.value = [...nextJobs]
}

export const setFilters = (nextFilters) => {
    filters.value = nextFilters
}

const state = {
    jobs,
    filters
}

export const derived = {
    totalJobs
    // targetJob
}

// const actions = { setJobs, setFilters }

const providerValue = {
    ...state
    // ...actions
}

const JobsProvider = ({ children }) => {
    <JobsContext.Provider value={providerValue}>
        {children}
    </JobsContext.Provider>
}

export default JobsProvider