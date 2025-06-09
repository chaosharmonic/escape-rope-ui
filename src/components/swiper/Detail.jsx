import { useState, useEffect, useRef } from "react"
import Markdown from 'react-markdown'
// import { X } from 'npm:react-feather'
import { updateInterview, updateStatus } from "../../api/job"
import CoverLetter from "./CoverLetter"
import Interviews from "./Interview"
import { campaign } from "../../contexts/settings"
// import { batch, useSignal, useSignalEffect } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"

// TODO: maybe break this out into layers
// - modal
// - job post
// - job post -- swiped
// - job post -- applied
// TODO: rename this
const JobDetail = ({
  job,
  // targetIndex = 0
  resetModal = () => {},
  swiping = false,
  displayStates = ['queued'],
  updateOuterElement,
}) => {
  useSignals()

  const dialogRef = useRef(null)
  const [closing, setClosing] = useState(false)

  // TODO: this should be an array
  // const [ editing, setEditing ] = useState([])
  // title
  // description
  // 
  
  useEffect(() => {
    if (job && !dialogRef?.current?.open) {
      dialogRef?.current?.showModal()
    }
  }, [ job ])

  useEffect(() => {
    dialogRef?.current?.close()
    if (closing) setTimeout(() => {
      setClosing(false)
      resetModal()
    }, 300)
  }, [ closing ])

  if (!job) return null

  console.log({ job, campaign: campaign.value })

  const {
    id,
    title,
    company,
    pay,
    description,
    lifecycle,
    sources,
    hiringManager
  } = job

  // TODO: handle retrieval source for forum posts
  // link different data types?

  const applyLink = job.applyLink
  || sources.find(({ redirectLink: link }) => link)
      ?.redirectLink
  const retrievalSources = [...new Set(sources.map(s => s.retrievalLink || null ))]
    .filter(e => Boolean(e))
    .map((href, index) => {
      const { name } = sources.find(({ retrievalLink: l }) => l == href)
      
      return <p key={`${name}${index}`}><a href={href}>{name}</a></p>
    })

  // check against filters
  
  // TODO: rename this... checkStatus?
  // l is 'lifecycle' but can be *a* lifecycle
  const checkMatch = (l) => ['queued', 'ignored', 'unmatched', 'expired']
    .every(status => l != status)
  
  const isMatch = checkMatch(lifecycle)

  // TODO: should these maybe be derived somewhere higher level?
  const isActive = isMatch && ['rejected', 'hire']
    .every(status => lifecycle != status)
  
  const hasApplied = [
    'applied',
    'rejected',
    'ghosted',
    'rescinded',
    'withdrawn',
    'interview',
    'offer',
    'hire'
  ].some(status => lifecycle == status)

  const setStatus = async (nextStatus, outerAnimation = '') => {
    try {
      const data = await updateStatus(nextStatus, id)

      // TODO: this needs a success/failure indicator
      // TODO: should this come back with an actual value
      // NOTE: this also sisn't going to return on the demo branch
      // if (!data.ok) throw new Error('request failed!')
      
      const shouldKeepDisplaying = displayStates
        .some(status => nextStatus == status)
        
      const nextJob = { ...job, lifecycle: nextStatus }
        
      // TODO: handle jobs and targetJob in context
      //  and/or with routes
        
      if (shouldKeepDisplaying) {
        // update job in modal and outer list:
        // setDetail nextJob
        // updateJob(target, nextJob)
        return
      }
        
        // else, this is handled by any op passed in from outside
      outerAnimation ? handleClosure(outerAnimation) : handleClosure()
    } catch ({message: m}) {
      console.error(m)
    }
  }

  const StatusMenu = () => {
    const skip = () => handleClosure('vanish')
    
    const stash = () => swiping
      ? setStatus('stashed', 'swiping right')
      : setStatus('stashed')
    const shortlist = () => swiping
      ? setStatus('shortlisted', 'swiping right')
      : setStatus('shortlisted')

    const markExpired = () => swiping
      ? setStatus('expired', 'swiping left')
      : setStatus('expired')
    
    
    const getRejected = () => setStatus('rejected')
    const getGhosted = () => setStatus('ghosted')

    if (lifecycle == 'queued' || lifecycle == 'ignored') {
      const swipeLeft = () => swiping
        ? setStatus('ignore', 'swiping left')
        : setStatus('ignore')
      const swipeRight = () => swiping
        ? setStatus('like', 'swiping right')
        : setStatus('like')

      return (
        <>
          <div className='buttons'>
            <button onClick={swipeLeft}>Nah!</button>
            {swiping && <button onClick={skip}>Skip</button>}
            <button onClick={swipeRight}>Yeah!</button>
          </div>
          <details className='moreButtons'>
            <summary>More options</summary>
            <div className='buttons'>
              <button onClick={markExpired}>Expired</button>
              <button onClick={stash}>Save for later</button>
              <button onClick={shortlist}>Shortlist</button>
            </div>
          </details>
        </>
      )
    }

    if (lifecycle == 'offer') {
      const decline = () => setStatus('declined')
      const accept = () => setStatus('hire')
      const getRescinded = () => setStatus('rescinded')
      
      return (
        <>
          <div className='buttons'>
            {/* TODO: handle loading/disable buttons */}
            <button onClick={decline}>...Nevermind.</button>
            <button onClick={accept}>Accepted!</button>
          </div>
          <details className='moreButtons'>
            <summary>More...</summary>
            <button onClick={getRescinded}>Rescinded...</button>
          </details>
        </>
      )
    }

    if (lifecycle == 'interview') {
      const withdraw = () => setStatus('withdrawn')
      const getOffer = () => setStatus('offer')
      
      return (
        <>
          <div className='buttons'>
            {/* TODO: handle loading/disable buttons */}
            <button onClick={getRejected}>Rejected</button>
            <button onClick={getOffer}>Offer!</button>
          </div>
          <details className='moreButtons'>
            <summary>More...</summary>
            <div className='buttons'>
              <button onClick={withdraw}>...Nevermind.</button>
              <button onClick={getGhosted}>Ghosted...</button>
            </div>
          </details>
        </>
      )
    }

    if (lifecycle == 'applied') {
      const withdraw = () => setStatus('withdrawn')
      const getInterview = () => setStatus('interview')
      
      return (
        <>
          <div className='buttons'>
            {/* TODO: handle loading/disable buttons */}
            <button onClick={getRejected}>Rejected</button>
            <button onClick={getInterview}>Interview!</button>
          </div>
          <details className='moreButtons'>
            <summary>More...</summary>
            <div className='buttons'>
              <button onClick={withdraw}>...Nevermind.</button>
              <button onClick={getGhosted}>Ghosted...</button>
            </div>
          </details>
        </>
      )
    }

    if (isMatch) {
      // TODO: confirm prompt for this, optionally with reason
      const unmatch = () => swiping
      ? setStatus('unmatched', 'swiping left')
      : setStatus('unmatched')

      const apply = () => swiping
      ? setStatus('applied', 'swiping right')
      : setStatus('applied')


      return (
        <>
          <div className='buttons'>
            {/* TODO: handle loading/disable buttons */}
            <button onClick={unmatch}>...Nevermind.</button>
            {swiping && <button onClick={skip}>Skip</button>}
            <button onClick={apply}>Applied!</button>
          </div>
          <details className='moreButtons'>
            <summary>More...</summary>
            <div className='buttons'>
              <button onClick={markExpired}>Expired</button>
              <button onClick={stash}>Stash for later</button>
              {lifecycle != 'shortlisted' && 
                <button onClick={shortlist}>Shortlist</button>}
            </div>
          </details>
        </>
      )
    }

    return null
    // TODO: add "reset status"
  }

  const HiringContact = () => {
    if (!hiringManager) return null
    
    const { name, title, email, linkedIn, notes } = hiringManager

    const displayName = linkedIn ? (<a href={linkedIn}>{name}</a>) : name

    // TODO: so far, only getting this via LinkedIn, and will only have
    //  one entry. This will change.
    const [tagline] = notes

    return (
      <>
        <h4>Hiring Manager: {displayName}</h4>  
        {tagline && <p>{tagline}</p>}
        {title && <p>{title}</p>}
        {title && <p>{email}</p>}
      </>
    )}

  
  // TODO: include 'more' option to further advance lifecycle stages
  // display conditionally
  //  if queued, this could be swipes
  //  if left-swiped, this could be "unmatched"
  //  if applied or later, this should just be a dropdown  

  const RetrievalLinks = () => {
    if (!retrievalSources.length) return null

    return (
      <>
        <h4>Retrieved from:</h4>
        <div className='sources'>
          {retrievalSources}
        </div>
      </>
    )
  }
    
  // TODO: this needs a confirm prompt if editing
  const handleClose = (e) => {
    e?.preventDefault()
    setClosing(true)
  }

  // lol
  const handleClosure = (outerArg) => {
    handleClose()

    setTimeout(() => {
      outerArg ? updateOuterElement(outerArg) : updateOuterElement()
    }, 200)
  }

  // This can go deeper, and be editable...
  // The sections can be collapsible and include stuff like:
  //  Description
  //  Sourcing details (specifically retrievalLinks, but also any other stuff)
  //  Company details
  //  Application status
  //  "DM"s (Written conversations, including any outgoing cover letter
  //   and initial contact method/any particular recipients)
  //  Interview Notes
  // .....all of this is *if* I've right-swiped it anyway

  const DetailHeader = () => {
    if (job.forumPost && !(title && company)) return (
      <>
        <h2>Forum Post from {forum}</h2>
        <h3>{threadTitle}</h3>
      </>
    )
    return (
      <>
        <h2>{title}</h2>
        <h3>{company.name || company}</h3>
        {/* TODO:
          get actual upper/lower bounds out of descriptions, where available
        */}
        {pay && <h4>{pay}</h4>}
      </>
    )
  }

  const Description = () => {
    // TODO: edit handlers for this
    // if (!description) return (  
    //   <details name='tabs'>
    //     <summary>
    //       <h3>
    //         + Add Job Description
    //       </h3>
    //     </summary>
    //     <textarea></textarea>
    //   </details>
    // )

    return (
      <details name='tabs' open>
        <summary>
          <h3>
            Job Description
          </h3>
        </summary>
        <Markdown>
          {description}
        </Markdown>
      </details>
    )
  }

  return (
    <dialog
      ref={dialogRef}
      tabIndex={0}
      onCancel={handleClose}
    >
      <form method="dialog">
        <button id='modalClose'>X</button>
      </form>
      <div>
        <DetailHeader />
        <StatusMenu />
        { applyLink && <h4><a href={applyLink}>Apply</a></h4> }
        <RetrievalLinks />
        <HiringContact />
        <Description />
        <CoverLetter job={job} />
        <Interviews job={job} />
      </div>
    </dialog>
  )
}

export default JobDetail
