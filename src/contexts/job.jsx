import { signal, computed } from "@preact/signals-react";

const defaultFilters = {
    status: ['queued']
}

export const jobs = signal([])

export const filters = signal(defaultFilters)

// derived values

export const totalJobs = computed(() => jobs?.value?.length)

// actions
export const setJobs = (nextJobs) => {
    jobs.value = [...nextJobs]
}

export const setFilters = (nextFilters) => {
    filters.value = nextFilters
}
