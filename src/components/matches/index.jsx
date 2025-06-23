import {
  useSignal,
  useSignalEffect,
  useComputed,
  batch
} from '@preact/signals-react'
import { useSignals } from '@preact/signals-react/runtime'
import { useState } from 'react'
import Detail from '../swiper/Detail'
import { FiltersMenu } from './filters'
import { searchJobs } from '../../api/job'
import {
  jobs,
  filters,
  setFilters,
  setJobs,
  totalJobs
} from '../../contexts/job'

const defaultFilters = {
  status: ['liked', 'shortlisted'],
  // jobType: 'jobBoard',
}

const Matches = () => {
  useSignals()

  const targetIndex = useSignal(null)
  const setTargetIndex = (i) => {
    targetIndex.value = i
  }
  const resetModal = () => setTargetIndex(null)

  const targetJob = useComputed(() => {
    if (targetIndex.value === null) return null

    const { value: i } = targetIndex

    const { id, value: job } = jobs.value.at(i)

    return { id, ...job }
  })

  const [loading, setLoading] = useState(false)
  // const [filterSelections, setFilterSelections] = useState(defaultFilters)
  const removing = useSignal(null)
  const setRemoving = (index) => {
    removing.value = index
  }

  const resetFilters = () => setFilters(defaultFilters)

  const removeJob = (index) => {
    console.log('removing!')
    setRemoving(index)

    setTimeout(() => {
      const nextJobs = jobs.value.toSpliced(index, 1)

      batch(
        setJobs(nextJobs),
        setRemoving(null),
        setTargetIndex(null)
      )
    }, 450)
  }
  
  // const rewinding

  // TODO: (for next draft)
  // optimize the state handling
  // this should ideally be in a context
  //  or something
  // useEffect(() => {
  //   async function getData(){
  //     const data = await getSettings()

  //     const { value: settings } = data

  //     // TODO: (for multiple search support)
  //     // figure out how best to define
  //     //  which search is current
  //     const value = settings?.campaigns?.at(0)

  //     console.log({value})

  //     setCampaign(value)
  //   }
  //   getData()
  // }, [])

  useSignalEffect(async() => {
    if (!filters?.value) return
    setLoading(true)
    // console.log('hey!')
    // if (jobs.length) return

    // get filter states:
    // filter as body, or query string?
    // search

    const data = await searchJobs(filters?.value)

    setJobs(data)

    setLoading(false)
    // TODO: catch block
  })

  // TODO: handle a basic loading state for this
  // maybe just a shapeshifting CSS bubble of some kind?
  // a *slime* if you will...
  if (!totalJobs.value || loading) return (
    <section className='matches'>
      <FiltersMenu
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
      <ul className='empty'>
        <li>{loading ? <progress /> : <h4>No Matches</h4>}</li>
      </ul>
    </section>
  )
  
  const handleClick = (i) => (e) => setTargetIndex(i)
  // const handleClick = (index) => (e) => removeJob(index)

  const entries = jobs.value.map(({
    value,
    value:
    {
      title,
      company,
      pay,
      sources,
      hiringManager
    },
    id
  }, index) => {
    const isExiting = removing.value === index

    const animationClass = isExiting ? 'vanish' : ''

    const applyLink = sources.find(s => s.redirectLink)?.redirectLink

    const searchSites = [...new Set(sources.map(s => s.name))].join(', ')

    return (
    // TODO: maybe this transform should be happening at a context level?
    <li key={id} onClick={handleClick(index)} className={animationClass}>
      <div>
        <p><strong>{title}</strong></p>
        <p><em>{company}</em></p>
        {pay && <p><em>{pay}</em></p>}
      </div>
      <div>
        <p><strong>Found on: {searchSites}</strong></p>
        {applyLink && <p>Has Apply Link</p>}
        {applyLink?.includes('workday') && <p>USES WORKDAY</p>}
        {hiringManager && <p>Has Hiring Manager</p>}
      </div>
    </li>
  )})

  // const targetIndex = detail?.id && jobs.findIndex(({ id }) => id == detail.id)

  return (
    <>
      <section className='matches'>
        <FiltersMenu
          total={totalJobs || 0}
          defaultFilters={defaultFilters}
        />
        <ul>
          {entries}
        </ul>
      </section>
      <Detail
        job={targetJob.value}
        // index
        // setJobs={setJobs}
        updateOuterElement={() => removeJob(targetIndex.value)}
        resetModal={resetModal}
        displayStates={filters.value.status}
      />
    </>
  )
}

export default Matches