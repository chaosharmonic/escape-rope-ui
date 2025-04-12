import { useState, useEffect } from 'react'
import JobCard from './JobCard'
import Detail from './Detail'
import { FiltersMenu } from '../matches/filters'
import { searchJobs, updateStatus } from '../../api/job'

const Swiper = () => {
  const defaultFilters = {
    status: ['queued']
  }
  
  const [jobs, setJobs] = useState([])
  const [jobsIndex, setJobsIndex] = useState(0)
  // const [lastSwiped, setLastSwiped] = useState(null)
  const [transitionClasses, setTransitionClasses] = useState('')
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)

  const resetFilters = () => setFilters(defaultFilters)

  // const rewinding

  useEffect(() => {
    async function getData(){
      setLoading(true)
      // if (jobs.length) return

      // TODO: maybe throw these try blocks into `/api`
      try {
        const data = await searchJobs(filters) || []

        const next = filters.status == 'ignored' && data?.length
        ? data.reverse()
        : data

        setJobs(next)
      } catch ({message}) {
        console.error(message)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [ filters ])

  // TODO: figure out stacking effect
  //  (there was an article somewhere about stacking elements w CSS Grid...)

  // TODO: handle rewind
  //  should take lastSwiped, an obj representing a job,
  //  and put it at the beginning of the last array
  //  the catch blocks should probably *also* call this
  
  useEffect(() => {
    if (!jobs.length) return
    const current = jobs.at(0).value
    
    console.log({
      current,
      sources: current.sources.length,
      remaining: jobs.length, 
    })
  }, [jobs.length])

  if (!jobs.length) return (
    <section className='cards'>
      <FiltersMenu
        view='queue'
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
      <div className='card empty'>
        {loading ? <progress /> : <h4>batch is empty</h4>}
      </div>
    </section>
  )

  if (loading && !transitionClasses) return (
    <section className='cards'>
      <FiltersMenu
        view='queue'
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
      <div className='card empty'>
        <progress />
      </div>
    </section>
  )
  
  const { status } = filters
  
  const targetJob = jobs.at(0)
  // const nextJob = jobs.at(1)

  const { value, id } = targetJob


  const openDetails = () => setDetail({...value, id})

  const animate = async (transitionClass) => {
    setTransitionClasses(transitionClass)

    // TODO: replace this with @std/async delay
    await new Promise(r => setTimeout(() => r(), 450))
    const nextJobs = jobs.slice(1)
    
    setJobs(nextJobs)
    // await new Promise(r => setTimeout(() => r(), 25))

    setTransitionClasses('')
  }

  const swipe = async (id, direction) => {
    // setLastSwipe
    const existingJobs = [...jobs]
    
    // eager actions:
    //  animate action out
    //  remove from UI
    //  set loader
    //  animate in next entry
    setLoading(true)

    const route = () => {
      const isRightSwiped = ['shortlisted', 'liked'].includes(status)
      
      if (isRightSwiped && direction == 'left') return 'applied'
      if (isRightSwiped && direction == 'right') return 'unmatched'

      if (direction == 'left') return 'ignore'
      if (direction == 'right') return 'like'
      // if (direction == 'up') return ''
      // if (direction == 'down') return ''
      
      return ''
    }

    try {
      // TODO: move this out
      
      const [ data ] = await Promise.all([
        updateStatus(route(), id),
        animate(`swiping ${direction}`)
      ])
    }
    catch {
      // TODO: actually flash error
      console.log('failed!')
      
      // TODO: replace this with @std/async delay
      await new Promise(r => setTimeout(() => r(), 450))

      setJobs(existingJobs)
    }
    finally {
      setLoading(false)
    }
  }

  // FIXME: this is still breaking on Firefox
  const skip = async () => {
    // setLoading(true)
    await animate('vanish')
    // setLoading(false)
  }

  const swipeLeft = async () => await swipe(id, 'left')
  const swipeRight = async () => await swipe(id, 'right')
  // const swipeUp = async () => await swipe(id, 'up')
  // const swipeDown = async () => await swipe(id, 'down')

  // TODO: this isn't actually getting called on keypresses below
  // see below
  // const handleKeyPress = async (e) => {
  //   console.log(e)
  //   if (e.key.includes('Arrow')){
  //     const direction = e.key.toLowerCase().replace('arrow', '')
  //     if (['left', 'right'].includes(direction)) await(id, direction)
  //   }
  // }
  
  // TODO: handle this later
  // need to store previous ID, and clear it if you use undo
  // const undoSwipe = async (id) => await swipe(id)
  // }

  return (
    <section className='cards'>
      <FiltersMenu
        view='queue'
        total={jobs?.length || 0}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
      <JobCard 
        job={value}
        loading={loading}
        openDetails={openDetails}
        swipeLeft={swipeLeft}
        swipeRight={swipeRight}
        skip={skip}
        // swipeUp={swipeUp}
        // swipeDown={swipeDown}
        transitionClasses={transitionClasses}
      />
      {/* <JobCard 
        job={nextJob.value}
        // disabled
        // openDetails={openDetails}
        // swipeLeft={swipeLeft}
        // swipeRight={swipeRight}
        // skip={skip}
        // swipeUp={swipeUp}
        // swipeDown={swipeDown}
        transitionClasses={transitionClasses}
      /> */}
      <Detail
        detail={detail}
        setDetail={setDetail}
        updateOuterElement={animate}
        swiping
      />
    </section>
  )
}

export default Swiper