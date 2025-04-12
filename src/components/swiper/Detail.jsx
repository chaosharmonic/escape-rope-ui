import { useState, useEffect, useRef } from "react"
import Markdown from 'react-markdown'
// import { X } from 'npm:react-feather'
import { baseURL } from "../../helpers/config"
import { saveCoverLetter, updateInterview, updateStatus } from "../../api/job"

// TODO: maybe break this out into layers
// - modal
// - job post
// - job post -- swiped
// - job post -- applied
// TODO: rename this
const JobDetail = ({
  detail,
  setDetail,
  swiping = false,
  displayStates = ['queued'],
  updateOuterElement,
  campaign = {} // this should be context
}) => {
  const dialogRef = useRef(null)
  const [closing, setClosing] = useState(false)
  
  // TODO: this should be an array
  // const [ editing, setEditing ] = useState([])
  // title
  // description
  // 
  
  useEffect(() => {
    if (detail && !dialogRef?.current?.open) {
      dialogRef?.current?.showModal()
    }
  }, [ detail ])

  useEffect(() => {
    dialogRef?.current?.close()
    if (closing) setTimeout(() => {
      setDetail(null)
      setClosing(false)
    }, 300)
  }, [ closing ])

  if (!detail) return null

  console.log({ detail })

  const {
    id,
    title,
    company,
    pay,
    description,
    lifecycle,
    sources,
    hiringManager
  } = detail

  // TODO: handle retrieval source for forum posts
  // link different data types?

  const applyLink = detail.applyLink
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

  const hasInterviews = [
    'interview',
    'offer',
    'hire'
  ].some(status => lifecycle == status)

  const setStatus = async (nextStatus, outerAnimation = '') => {
    try {
      const data = await updateStatus(nextStatus, id)

      // TODO: this needs a success/failure indicator
      // TODO: should this come back with an actual value
      if (!data.ok) throw new Error('request failed!')
      
      const shouldKeepDisplaying = displayStates
        .some(status => nextStatus == status)
        
      const nextJob = { ...detail, lifecycle: nextStatus }
        
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
    } catch {
      console.log('failed!')
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
    if (detail.forumPost && !(title && company)) return (
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

  const CoverLetter = () => {
    const templates = campaign.coverLetters || []

    const {
      coverLetter: initialCoverLetter = ''
    } = detail
    
    const [editing, setEditing] = useState(false)
    const [showing, setShowing] = useState(0)
    const [
      tailoredCoverLetter,
      setTailoredCoverLetter
    ] =  useState(initialCoverLetter)
    
    const coverLetters = [
      tailoredCoverLetter,
      ...templates
    ].filter(e => e)

    const editCoverLetter = () => {
      setEditing(true)
    }

    // TODO: there might be more than one template
    // buttons:
    // - customize (copy from template)
    // - next
    // - previous
    
    const empty = !coverLetters.length

    const startNewCoverLetter = () => {
      setEditing(true)
      !empty && setShowing(coverLetters.length)
    }

    // TODO: (on setting up validations)
    // handle duplicated cover letter
    const handleSubmit =  async (e) => {
      e.preventDefault()

      const payload = new FormData(e.target)

      console.log(payload)

      const res = await saveCoverLetter(payload, id)

      const nextState = payload.get('coverLetter')

      setTailoredCoverLetter(nextState)

      setEditing(false)
      setShowing(0)
    }

    const cancelEdits = (e) => {
      e.preventDefault()

      setEditing(false)
      setShowing(0)
  }

    if (empty && !editing) return (
      <details name='tabs'>
        <summary>
          <h3>
            Cover Letter
          </h3>
        </summary>
        <button onClick={(startNewCoverLetter)}>
          New
        </button>
      </details>
    )

    const isTemplate = Boolean(coverLetters[showing]?.text)

    const currentLetter = coverLetters[showing]
    const text = isTemplate
      ? currentLetter.text
      : tailoredCoverLetter

    // console.log({text, coverLetter: tailoredCoverLetter})
    
    // TODO: dynamic detection and replacement for handlebars
    const letter = text
      ?.replaceAll('{{TITLE}}', title)
      ?.replaceAll('{{COMPANY}}', company.name || company)
      // TODO: company logging not fully baked yet

    if (editing) return (
      <details name='tabs'>
        <summary>
          <h3>
            Cover Letter
          </h3>
        </summary>
        <form onSubmit={handleSubmit} onReset={cancelEdits}>
          <textarea
            defaultValue={letter}
            required
            name="coverLetter"
            rows="20"
            cols="45"
          />
          <menu>
            <li><input type="submit" value="Save" /></li>
            <li><input type="reset" value="Cancel" /></li>
          </menu>
        </form>
        {/* TODO: add delete button for saved cover letter */}
      </details>
    )

    let templateLabel = ''
    if (isTemplate) {
      const head = 'From Template'
      
      const { name: tail } = coverLetters[showing]
      
      templateLabel = `${head}${tail && `: ${tail}`}`
    }

    let letterLabel = templateLabel || 'Tailored'

    const editLabel = isTemplate ? 'Customize' : 'Edit'

    const previous = () => setShowing(showing - 1)
    const next = () => setShowing(showing + 1)

    return (
      // TODO: text align left
      // setup editing here
      <details name='tabs'>
        <summary>
          <h3>
            Cover Letter
          </h3>
        </summary>
        <menu>
          {isTemplate && (
            <li>
              <button onClick={startNewCoverLetter}>New</button>
            </li>
          )}
          <li>
            <button onClick={editCoverLetter}>{editLabel}</button>
          </li>
          {/* copy to clipboard */}
        </menu>
        <fieldset>
          <h4>{letterLabel}</h4>
          <Markdown>
            {letter}
          </Markdown>
        </fieldset>
        <menu>
          {showing != 0 && (
            <li><button onClick={previous}>Previous</button></li>
          )}
          {showing != coverLetters.length - 1 && (
            <li><button onClick={next}>Next</button></li>
          )}
        </menu>
      </details>
    )
  }

  const Interviews = () => {
    if (!hasInterviews) return null

    const {
      interviews: storedInterviews = [...mockInterviews]
    } = detail

    // if (!storedInterviews.length) {
    //   storedInterviews.push(...mockInterviews)
    // }

    const empty = !storedInterviews.length

    const [ editTarget, setEditTarget ] = useState(null)
    // const [ showing, setShowing ] = useState(0)
    // TODO: deal with this later
    // const [
    //   interviewerFields,
    //   setInterviewerFields
    // ] = useState([])
    const [
      questionFields,
      setQuestionFields
    ] = useState([])
    const [
      interviews,
      setInterviews
    ] = useState(storedInterviews)

    const addNew = () => setEditTarget(interviews.length)

    const isEditing = editTarget !== null

    useEffect(() => {
      if (editTarget === null) return

      if (editTarget === interviews.length) {

        const existingInterviewQuestions = interviews
          .flatMap(({ questions }) => questions)
          .map(({ question: q }) => q)
        
        // TODO: defaults should filter
        //  by interview type
        const questionsToAsk = defaultInterviewQuestions
          .filter(q => {
            if (empty) return true
  
            console.log({q, existingInterviewQuestions})

            const existingQuestion = existingInterviewQuestions
              .find((question) => question == q)
            
            return !existingQuestion
          })
          .map(question => ({ question }))

        console.log({questionsToAsk})
        
        setQuestionFields(questionsToAsk)

        return
      }

      const {
        // interviewer, TODO:
        questions
      } = interviews[editTarget]

      setQuestionFields(questions)

    }, [editTarget])

    const {
      defaultInterviewQuestions = []
    } = campaign

    const handleSubmit = async (e) => {
      e.preventDefault()
      
      const formData = new FormData(e.target)

      const questionValues = formData.getAll('question')
      const answerValues = formData.getAll('answer')

      const isMineValues = [
        ...document.querySelectorAll('input[name="isMine"]')
      ].map(i => i.checked)
      
      const questionPayload = questionValues
        .map((q, i) => ({
          question: q,
          answer: answerValues[i],
          isMine: isMineValues[i]
        }))

      const payload = {
        interviewer: {
          name: formData.get('interviewerName'),
          title: formData.get('interviewerTitle'),
          email: formData.get('interviewerEmail'),
          linkedIn: formData.get('interviewerLinkedIn'),
        },
        questions: questionPayload,
        notes: formData.get('notes')
      }

      console.log({ questionValues, answerValues })

      const data = await updateInterview(payload, id, editTarget)
        // .then(r => r.json())

      const next = interviews.toSpliced(editTarget, 1, payload)

      setInterviews(next)
      setEditTarget(null)
    }

    const cancelEdits = (e) => {
      e.preventDefault()

      setEditTarget(null) // TODO: should be null
    }

    const addQuestion = () => {
      const blank = { question: '' }

      const next = [ ...questionFields, blank ]
      
      setQuestionFields(next)
    }

    const deleteQuestion = (index) => {
      const next = questionFields
        .filter((e, i) => i != index)
      
      setQuestionFields(next)
    }


    const InterviewQuestionForm = (({
      question = '',
      answer = '',
      isMine = true, // default
      index
    }) => {
      return (
        // do I want a fieldset here?
        <>
          <label htmlFor="question">
            Question
            <input
              type="text"
              name="question"
              defaultValue={question}
            />
          </label>
          <label htmlFor="answer">
            Answer
            <input
              type="text"
              name="answer"
              defaultValue={answer}
            />
          </label>
          <label htmlFor="isMine">
            Mine?
            <input
              type="checkbox"
              name="isMine"
              defaultChecked={isMine}
            />
          </label>
          <label htmlFor="delete">
            {/* TODO: color, confirm prompt */}
            <input
              type="button"
              name="delete"
              value="🗑️"
              onClick={(() => deleteQuestion(index))}
              // TODO: stop mocking this
            />
          </label>
        </>
      )
    })

    if (empty && !isEditing) return (
      <details name='tabs'>
        <summary>
          <h3>
            Interviews
          </h3>
        </summary>
        <button onClick={addNew}>Add Interview</button>
      </details>
    )

    // something something interviewQuestions here

    // something something map other fields here

    /* TODO: interview type
      should be configurable,
        with different default questions

      basic examples:
      - recon (optional as its own initial step)
      - HR screen
      - hiring manager
      - ...others (could vary by industry)
    */

    if (isEditing) {
      const interview = interviews[editTarget] || {}

      const {
        // type, TODO:
        interviewer
      } = interview

      const questionInputs = questionFields
        .map(({
          question,
          answer = '',
          // isMine = true // TODO: deal w this later
        }, index) => (
          // TODO: fieldset?
          <div key={index}>
            <InterviewQuestionForm
              question={question}
              answer={answer}
              index={index}
            />
          </div>
        ))

      return (
        <details name='tabs'>
          <summary>
            <h3>
              Interviews
            </h3>
          </summary>
          <form onSubmit={handleSubmit} onReset={cancelEdits}>
            <fieldset>
              {/* TODO: figure out panels later */}
              <legend>Interviewer(s)</legend>
              <label htmlFor="interviewerName">
                Name
                <input
                  type="text"
                  name="interviewerName"
                  defaultValue={interviewer?.name || ''}
                />
              </label>

              <label htmlFor="interviewerTitle">
                Title
                <input
                  type="text"
                  name="interviewerTitle"
                  defaultValue={interviewer?.title || ''}
                />
              </label>

              <label htmlFor="interviewerEmail">
                Email
                <input
                  type="email"
                  name="interviewerEmail"
                  defaultValue={interviewer?.email || ''}
                />
              </label>
              <label htmlFor="interviewerLinkedIn">
                LinkedIn
                <input
                  type="url"
                  name="interviewerLinkedIn"
                  defaultValue={interviewer?.linkedIn || ''}
                />
              </label>
              <label htmlFor="interviewerNotes">
                Notes
                <textarea
                  type="text"
                  name="interviewerNotes"
                  defaultValue={interviewer?.notes || ''}
                />
              </label>
              {/* <input
                type="button"
                name="delete"
                value="🗑️"
                onClick={() => console.log(`deleting`)}
                // TODO: stop mocking this
              />
              <input
                type="button"
                name="add"
                value="+"
                onClick={() => console.log(`adding`)}
                // TODO: stop mocking this
              /> */}
            </fieldset>

            <fieldset>
              <legend>Questions</legend>
              {questionInputs}
              <input
                type='button'
                onClick={addQuestion}
                value='➕'
              />
            </fieldset>

            <fieldset>
              <legend>Notes</legend>
              {/* TODO: multiple? */}
              <textarea type="text" name="notes" />
            </fieldset>

            <menu>
              <li><input type="submit" value="Save" /></li>
              <li><input type="reset" value="Cancel" /></li>
            </menu>
          </form>
        </details>
      )
    }

    const interviewLogs = interviews.map((e, i) => {
      const { type, interviewer, questions, notes } = e

      // map questions
      // map notes

      // let interviewerLabel
      // TODO: support multiple
      // it should also include links etc
      // if (interviewers.length) interviewerLabel = interviewers
      //   .reduce((a, b) => {
      //     const { name, title } = b
      //     return [...a, `${name}, ${title}`]
      //   }, []).join('; ')

      const questionsDisplay = questions.map(q => (
        // TODO: CSS classes based on `isMine` value
        
        <div>
          <p><em>{q.question}</em></p>
          <p>{q.answer}</p>
        </div>
      ))

      return (
        <fieldset key={i}>
          <h4>Interview {i + 1} -- {type}</h4>
          {interviewer && <h4>{interviewer.name}</h4>}
          <strong>questions</strong>
          {questionsDisplay}
          {/* TODO: find some way to describe
            "questions" for technical interviews
          */}
          {/* <h4>Notes</h4> */}
          {/* add note */}
          <input
            type="button"
            onClick={() => setEditTarget(i)}
            name="edit"
            value="✍️"
          />
        </fieldset>
    )})

    return (
      <details name='tabs'>
        <summary>
          <h3>
            Interviews
          </h3>
        </summary>
        {interviewLogs}
        <button onClick={addNew}>Add Interview</button>
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
        <CoverLetter />
        <Interviews />
      </div>
    </dialog>
  )
}

export default JobDetail
