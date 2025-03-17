import { useState, useEffect } from 'react'
import Detail from '../swiper/Detail'
import { baseURL } from '../../helpers/config'
import { getSettings } from '../../api/settings'
import { FiltersMenu } from './filters'
import { searchJobs } from '../../api/job'

const Matches = () => {
  const defaultFilters = {
    status: ['liked', 'shortlisted'],
    jobType: 'jobBoard',
  }

  const [jobs, setJobs] = useState([])
  const [campaign, setCampaign] = useState()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [filterSelections, setFilterSelections] = useState(defaultFilters)
  const [filters, setFilters] = useState(defaultFilters)
  const [exiting, setExiting] = useState(null) // rename this

  const resetFilters = () => setFilters(defaultFilters)

  const removeJob = (index) => {
    console.log('removing!')
    setExiting(index)

    setTimeout(() => {
      const nextJobs = [
        ...jobs.slice(0, index),
        ...jobs.slice(index + 1)
      ]

      setJobs(nextJobs)
      setExiting(null)
    }, 450)
  }
  
  // const rewinding

  // TODO: (for next draft)
  // optimize the state handling
  // this should ideally be in a context
  //  or something
  useEffect(() => {
    async function getData(){
      const data = await getSettings()

      const { value: settings } = data

      // TODO: (for multiple search support)
      // figure out how best to define
      //  which search is current
      const value = settings?.campaigns?.at(0)

      console.log({value})

      setCampaign(value)
    }
    getData()
  }, [])

  useEffect(() => {
    async function getData(){
      setLoading(true)
      // if (jobs.length) return

      // get filter states:
      // filter as body, or query string?
      // search

      const data = await searchJobs(filters)

      setJobs(data)

      setLoading(false)
      // TODO: catch block
    }
    getData()
  }, [filters])

  // TODO: handle a basic loading state for this
  // maybe just a shapeshifting CSS bubble of some kind?
  // a *slime* if you will...
  if (!jobs.length || loading) return (
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
  console.log(jobs.map(({value: v}) => v))

  // TODO: move this to context and remove this duplicate fn
  //  alternatively, look into handling it via React Router links
  //  *or whatever* I end up doing for the frontend...
  const handleClick = (job) => (e) => setDetail(job)
  // const handleClick = (index) => (e) => removeJob(index)

  const entries = jobs.map(({
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
    const animationClass = exiting == index ? 'vanish' : ''

    const applyLink = sources.find(s => s.redirectLink)?.redirectLink

    const searchSites = [...new Set(sources.map(s => s.name))].join(', ')

    return (
    // TODO: maybe this transform should be happening at a context level?
    <li key={id} onClick={ handleClick({ ...value, id })} className={animationClass}>
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

  const targetIndex = detail?.id && jobs.findIndex(({ id }) => id == detail.id)

  return (
    <>
      <section className='matches'>
        <FiltersMenu
          total={jobs?.length || 0}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
        <ul>
          {entries}
        </ul>
      </section>
      <Detail
        detail={detail}
        campaign={campaign}
        // setJobs={setJobs}
        updateOuterElement={() => removeJob(targetIndex)}
        setDetail={setDetail}
        displayStates={filters.status}
      />
    </>
  )
}

export default Matches