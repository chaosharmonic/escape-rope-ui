import { useState, useEffect } from 'react'
import Detail from '../swiper/Detail'
import { baseURL } from '../../helpers/config'

const Matches = () => {
  const defaultFilters = {
    status: ['liked', 'shortlisted'],
    jobType: 'jobBoard',

  }

  const [jobs, setJobs] = useState([])
  // const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [filterSelections, setFilterSelections] = useState(defaultFilters)
  const [filters, setFilters] = useState(defaultFilters)
  const [exiting, setExiting] = useState(null) // rename this

  const resetFilters = () => setFilters(defaultFilters)

  // TODO: remove these later and actually use the forms
  const setShortlist = () => setFilters({
    status: ['shortlisted']
  })

  const setApplied = () => setFilters({
    status: ['applied']
  })

  const setInterview = () => setFilters({
    status: ['interview']
  })

  // existing filter state? 
  // TODO: I'm pretty sure this is wrong
  const updateFilterSelections = (details) => {
    setFilterSelections({ ...filterSelections, ...details })
  }

  const confirmFilters = () => {
    const storedFilters = { ...filters }
    
    setFilters({ ...filterSelections })

    // fetch with filterSelections
    // setData

    // catch {
      // flash error
      // setFilters(storedFilters)
      // setFilterSelections(storedFilters)
    // }
  }

  const handleChange = (e) => {
    // get target values... is this the same on multi-selects?
    // updateFilterSelections(selections)
    // updateFilters(details)
  }

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

  useEffect(() => {
    async function getData(){
      // if (jobs.length) return

      // get filter states:
      // filter as body, or query string?
      // search

      const payload = new FormData()
      payload.set('filters', JSON.stringify({...filters}))

      const target = `${baseURL}/jobs/search`
      const options = {
        method: 'POST',
        body: payload
        // TODO: fix the cors handling
        // mode: 'cors'
      }
      const data = await fetch(target, options).then(r => r.json()) || []

      setJobs(data)
      // TODO: catch block
    }
    getData()
  }, [filters])

  const handleSubmit = (e) => {
    e.preventDefault()

    const form = document.querySelector('form#options')
    const data = new FormData(form)
    
    const payload = {}
    for (let k of data.keys()) {
      const value = k == 'status' ? data.getAll(k) : data.get(k)
      payload[k] = value == 'on' ? Boolean(value) : value
    }

    console.log({payload})
    
    // deal with the state handling logic here
  }


  const Menu = () => (
    <details>
      <summary>Options</summary>
      {/* TODO:
        these are all stubs for now
        this all *could* also be a modal...
      */}
      <div>
        <button onClick={resetFilters}>Swiped right (Reset)</button>
        <button onClick={setShortlist}>Shortlisted only</button>
        <button onClick={setApplied}>Applied</button>
        <button onClick={setInterview}>Interviewing</button>
      </div>
    </details>
  )

  // TODO: handle a basic loading state for this
  // maybe just a shapeshifting CSS bubble of some kind?
  // a *slime* if you will...
  if (!jobs.length) return (
    <section className='matches'>
      <Menu />
      No Matches
    </section>
  )
  console.log(jobs.map(({value: v}) => v))

  // TODO: move this to context and remove this duplicate fn
  //  alternatively, look into handling it via React Router links
  //  *or whatever* I end up doing for the frontend...
  const handleClick = (job) => (e) => setDetail(job)
  // const handleClick = (index) => (e) => removeJob(index)

  const entries = jobs.map(({ value, value: { title, company }, id }, index) => {
    const animationClass = exiting == index ? 'vanish' : ''

    return (
    // TODO: maybe this transform should be happening at a context level?
    <li key={id} onClick={ handleClick({ ...value, id })} className={animationClass}>
      <p><strong>{title}</strong></p>
      <p><em>{company}</em></p>
    </li>
  )})
  
  const targetIndex = detail?.id && jobs.findIndex(({ id }) => id == detail.id)

  return (
    <>
      <section className='matches'>
        <Menu />
        <ul>
          {entries}
        </ul>
      </section>
      <Detail
        detail={detail}
        // setJobs={setJobs}
        updateOuterElement={() => removeJob(targetIndex)}
        setDetail={setDetail}
        displayStates={filters.status}
      />
    </>
  )
}

export default Matches