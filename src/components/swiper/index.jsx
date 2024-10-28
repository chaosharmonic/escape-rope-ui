import { useState, useEffect } from 'react'
import JobCard from './JobCard'
import Detail from './Detail'
import { baseURL } from '../../helpers/config'

const Swiper = ({ secondLook = false }) => {
  const [jobs, setJobs] = useState([])
  const [jobsIndex, setJobsIndex] = useState(0)
  const [lastSwiped, setLastSwiped] = useState(null)
  const [swipeDirection, setSwipeDirection] = useState('')
  const [transitionClasses, setTransitionClasses] = useState('')
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  // TODO: filters...

  // const rewinding
  
  const route = secondLook ? 'second_look' : 'batch'

  useEffect(() => {
    async function getData(){
      setLoading(true)
      // if (jobs.length) return

      // TODO: 
      // also cover second look entries
      //  delete/'delete' on second left
      const target = `${baseURL}/jobs/${route}`
      // TODO: fix the cors handling
      // const fetchOptions = {
      //   mode: 'cors',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // }
      try {
        const data = await fetch(target).then(r => r.json()) || []
  
        setJobs(secondLook ? data.reverse() : data)
        if (data.length) setJobsIndex(0)
      } catch ({message}) {
        console.error(message)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [secondLook])
  // TODO: rename this prop
  //  enable swiping at multiple stages
  //  swiped-right: unmatched, shortlist
  //  shortlist: unmatched, applied

  // TODO: figure out stacking effect
  //  (there was an article somewhere about stacking elements w CSS Grid...)

  // TODO: handle rewind
  //  should take lastSwiped, an obj representing a job,
  //  and put it at the beginning of the last array
  //  the catch blocks should probably *also* call this
  // 
  // useEffect(() => {
    
  // }, [swipeDirection])


  if (!jobs.length) return (
    <section className='cards'>
      <div className='card empty'>
          {loading ? <progress /> : <h4>batch is empty</h4>}
      </div>
    </section>
  )
  
  const targetJob = jobs[jobsIndex]
  const nextJob = jobs[jobsIndex + 1]

  const { value, id } = targetJob


  const openDetails = () => setDetail({...value, id})

  // am I even gonna need that for something I'm designing for local use?
  const animate = (transitionClass) => {
    setTransitionClasses(transitionClass)

    setTimeout(() => {
      const nextJobs = jobs.slice(1)
      
      setJobs(nextJobs)
      setTransitionClasses('')
    }, 450)
  }

  const swipe = async (id, direction) => {
    // setLastSwipe
    const existingJobs = [...jobs]
    
    // eager actions:
    //  animate action out
    //  remove from UI
    //  set loader
    //  animate in next entry
    animate(`swiping ${direction}`)
    // setSwipeDirection(direction)
    // setLoading(true)

    const route = () => {
      if (direction == 'left') return 'ignore'
      if (direction == 'right') return 'like'
      // if (direction == 'up') return ''
      // if (direction == 'down') return ''
      
      return ''
    }
    
    const endpoint = `${baseURL}/jobs/${id}/${route()}`

    try {
      const data = await fetch(endpoint, { method: 'POST' }).then(r => r.json())
    }
    catch {
      // setTransitionClasses
        // reverse out animation
      // rewind to previous state
      // don't worry about skipping last swiped,
      //  bc that's a confirm action
      // how to handle reverse animation vs default entry animation?
      //  (this is also an undo question)
      //  *probably* use classes for the initial entry too
      setJobs(existingJobs)
    }
    finally {
      // setTransitionClasses('')
      // setLoading(false)
    }
  }

  const skip = () => animate('vanish', true)

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

    /*
    async function getData(){
      if (jobs.length) return

      const target = 'http://localhost:3030/jobs'
      const fetchOptions = {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      }
      const data = await fetch(target).then(r => r.json()) || []

      setJobs(data)
      if (data.length) setJobsIndex(0)
    }
    */
  // }

  return (
    <section className='cards'>
      <JobCard 
        job={value}
        // loading={loading}
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
        job={{...value, id}}
        detail={detail}
        setDetail={setDetail}
        updateOuterElement={animate}
      />
    </section>
  )
}

export default Swiper