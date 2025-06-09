import { useContext } from "react"
import { JobsContext, setFilters } from "../../contexts/job"

export const FiltersMenu = ({
  total = 0,
  view = 'matches',
  defaultFilters
}) => {
  const { filters } = useContext(JobsContext)

  const resetFilters = () => setFilters(defaultFilters)

  const updateStatus = (status) => {
    // TODO: actually close detail pane from here
    // TODO: also take arrays
    setFilters({ status: [status] })
  }

  const setIgnored = () => updateStatus('ignored')

  const setQueued = () => updateStatus('queued')

  const setLiked = () => {
    setFilters({ status: ['liked', 'shortlisted'] })
  }

  const setShortlist = () => updateStatus('shortlisted')

  const setStashed = () => updateStatus('stashed')

  const setApplied = () => updateStatus('applied')

  const setInterview = () => updateStatus('interview')

  const queuedListShortcut = view == 'queue'
  ? <button onClick={resetFilters}>Queue (Reset)</button>
  : <button onClick={setQueued}>Queue</button>


  const swipedRightListShortcut = view == 'matches'
  ? <button onClick={resetFilters}>Swiped right (Reset)</button>
  : <button onClick={setLiked}>Swiped right</button>

  const Shortcuts = () => (
    <div className="shortcuts">
      {queuedListShortcut}
      <button onClick={setIgnored}>Second Look</button>
      {swipedRightListShortcut}
      <button onClick={setShortlist}>Shortlisted only</button>
      {view == 'matches' && <>
        <button onClick={setStashed}>Stashed</button>
        <button onClick={setApplied}>Applied</button>
        <button onClick={setInterview}>Interviewing</button>
      </>}
    </div>
  )

{/*
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

 // TODO: this entire thing
  const DetailedFilters = () => (
  <form id='options' onSubmit={handleSubmit}>
  // search param
  <fieldset>
    <label htmlFor='title'>
    Title
    <input name='title' type='search' />
    </label>
    <label htmlFor='company'>
    {/* datalist/search route !!!
    Company
    <input name='company' type='search' />
    </label>
  </fieldset>
   // TODO: check if I can name these
  <fieldset>
    <legend>Pay</legend>
    <label htmlFor='hasPayRanges'>
    Has Pay Ranges?
    <input name='hasPayRanges' type='checkbox' />
    </label>
    
    <label htmlFor='minimumPay'>Minimum
    <input name='minimumPay' type='number' />
    </label>
    <label htmlFor='minimumPay'>Maximum 
    <input name='maximumPay' type='number' />
    </label>

    <p>Per:</p>
    <div>
    <label htmlFor='hour'>
      Hour
      <input name='payMeasurement' type='radio' value='hour' />
    </label>
    <label htmlFor='year'>
      Year
      <input name='payMeasurement' type='radio' value='year' />
    </label>
    </div>
    
  </fieldset>
  // TODO:
  //  verify this: I'd track if there's *any* overlap
  //  within those bounds, right?
  
  // <input name='dateFound' /> 
  // <input name='dateSwiped' /> am I actually tracking this?
  // <input name='datePosted' /> if known...?

  <fieldset>
    <legend>Contact</legend>
    <label htmlFor='hasApplyLink'>
    Has Apply Link?
    <input name='hasApplyLink' type='checkbox' />
    </label>
    <label htmlFor='hasEmail'>
    Has Email?
    <input name='hasEmail' type='checkbox' />
    </label>
  </fieldset>

  <fieldset>
    <legend>Job type</legend>
    <label htmlFor='forumPost'>
    Forum Post
    <input name='jobType' type='radio' value='forumPost' />
    </label>
    <label htmlFor='jobBoard'>
    Job Board
    <input name='jobType' type='radio' value='jobBoard' />
    </label>
    <label htmlFor='network'>
    Network
    <input name='jobType' type='radio' value='network' />
    </label>
  </fieldset>

  <fieldset>
    <legend>Status</legend>
    <label htmlFor='liked'>
    Liked
    <input name='status' type='checkbox' value='liked' />
    </label>
    <label htmlFor='shortlisted'>
    Shortlisted
    <input name='status' type='checkbox' value='shortlisted' />
    </label>
    <label htmlFor='stashed'>
    Stashed
    <input name='status' type='checkbox' value='stashed' />
    </label>
    <label htmlFor='applied'>
    Applied
    <input name='status' type='checkbox' value='applied' />
    </label>
    <label htmlFor='interview'>
    Interview
    <input name='status' type='checkbox' value='interview' />
    </label>
    <label htmlFor='offer'>
    Offer
    <input name='status' type='checkbox' value='offer' />
    </label>
  </fieldset>
  <input type='submit' value="Save changes" />
  </form>
  )
*/}

  const getFilterLabel = () => {
    const {
      status: lifecycleStages = [ 'liked', 'shortlisted' ]
    } = filters.value

    // TODO: this whole thing will have to change later
    //  whenever I get to finishing detailed filters
    if (lifecycleStages?.length == 1) {
      const status = lifecycleStages.at(0)

      if (status == 'ignored') return 'Second Look'
      if (status == 'interview') return 'Interviewing'

      const cap = status.at(0).toUpperCase()
      const lower = status.slice(1)
      return `${cap}${lower}`
    }

    return 'Swiped Right'
  }

  return (
    <details>
      <summary>
        <h3>Options</h3>
      </summary>
      <Shortcuts />
      <div>
        <span>Viewing: {getFilterLabel()}</span>
        {total ? <span>{total} entries</span> : ''}
      </div>
    </details>
  )
}