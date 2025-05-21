import { useState } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useSignal, useComputed, useSignalEffect, batch } from '@preact/signals-react'
import JobCard from './JobCard'
import Detail from './Detail'
import { FiltersMenu } from '../matches/filters'
import { searchJobs, updateStatus } from '../../api/job'

const Swiper = () => {
  useSignals()
  const defaultFilters = {
    status: ['queued']
  }
  
  const jobs = useSignal([])
  const setJobs = (nextJobs) => {
    jobs.value = [...nextJobs]
  }

  const remaining = useComputed(() => jobs?.value?.length)
  const targetJob = useComputed(() => {
    if (!remaining.value) return null
    return jobs?.value?.at(0)
  })
  
  // const [lastSwiped, setLastSwiped] = useState(null)
  const transitionClasses = useSignal('')
  const setTransitionClasses = (transitionClass) => {
    transitionClasses.value = transitionClass
  }

  const loading = useSignal(false)
  const setLoading = (bool) => {
    loading.value = bool
  }

  const [detail, setDetail] = useState(null)
  
  const filters = useSignal(defaultFilters)
  const setFilters = (nextFilters) => {
    filters.value = nextFilters
  }

  const resetFilters = () => setFilters(defaultFilters)

  // const rewinding

  useSignalEffect(async () => {
    if (jobs?.value?.length) return
    setLoading(true)

    // TODO: maybe throw these try blocks into `/api`
    try {
      const data = await searchJobs(filters.value) || []

      const nextJobs = filters.value.status == 'ignored'
      ? data.reverse()
      : data

      batch(() => {
        setJobs(nextJobs)
        setLoading(false)
      })
    } catch ({ message }) {
      console.error(message)
      setLoading(false)
    }
  })

  // TODO: figure out stacking useSignalEffect
  //  (there was an article somewhere about stacking elements w CSS Grid...)

  // TODO: handle rewind
  //  should take lastSwiped, an obj representing a job,
  //  and put it at the beginning of the last array
  //  the catch blocks should probably *also* call this
  
  const current = targetJob.value

  useSignalEffect(() => {
    if (!remaining.value) return
    
    console.log({
      current,
      loading: loading.value,
      sources: current?.sources?.length,
      remaining: remaining.value
    })
  })

  if (!remaining.value) {
    return (
    <section className='cards'>
      <FiltersMenu
        view='queue'
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
      <div className='card empty'>
        {loading.value ? <progress /> : <h4>batch is empty</h4>}
      </div>
    </section>
  )}

  if (loading.value && !transitionClasses.value) return (
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

  const { value: job, id } = current

  const openDetails = () => setDetail({...job, id})

  const animate = async (transitionClass) => {
    setTransitionClasses(transitionClass)

    console.log(transitionClass)

    // TODO: replace this with @std/async delay
    await new Promise(r => setTimeout(() => r(), 450))
    const nextJobs = jobs.value.slice(1)
    
    setJobs(nextJobs)
    // await new Promise(r => setTimeout(() => r(), 25))

    setTransitionClasses('')
  }

  const swipe = async (id, direction) => {
    // setLastSwipe
    const existingJobs = [...jobs.value]
    
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

  const skip = async () => {
    setLoading(true)
    await animate('vanish')
    setLoading(false)
  }

  const swipeLeft = async () => await swipe(id, 'left')
  //  async () => await swipe(id, 'left')
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
  // const undoSwipe = something...
  
  return (
    <section className='cards'>
      <FiltersMenu
        view='queue'
        total={remaining || 0}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
      />
      <JobCard 
        job={job}
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
        job={{...job, id}}
        detail={detail}
        setDetail={setDetail}
        updateOuterElement={animate}
        swiping
      />
    </section>
  )
}

export default Swiper