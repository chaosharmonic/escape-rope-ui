import { batch, useSignal } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"
import { saveCoverLetter } from "../../api/job"
import { campaign } from "../../contexts/settings"
import Markdown from "react-markdown"

const CoverLetter = ({ job }) => {
    useSignals()

    const { id, title, company } = job

    const {
      coverLetters: templates = []
    } =  campaign.value

    const {
      coverLetter: initialCoverLetter = ''
    } = job
    
    const editingCoverLetter = useSignal(false)
    const setEditingCoverLetter = (bool) => {
      editingCoverLetter.value = bool
    }

    const showingCoverLetter = useSignal(0)
    const setShowingCoverLetter = (index) => {
      showingCoverLetter.value = index
    }

    const tailoredCoverLetter = useSignal(initialCoverLetter)
    const setTailoredCoverLetter = (coverLetter) => {
      tailoredCoverLetter.value = coverLetter
    }
    
    const coverLetters = [
      tailoredCoverLetter.value,
      ...templates
    ].filter(e => e)

    const editCoverLetter = () => {
      setEditingCoverLetter(true)
    }

    const empty = !coverLetters.length

    const startNewCoverLetter = () => {
      setEditingCoverLetter(true)
      !empty && setShowingCoverLetter(coverLetters.length)
    }

    // TODO: (on setting up validations)
    // handle duplicated cover letter
    const handleSubmit = async (e) => {
      e.preventDefault()

      const payload = new FormData(e.target)

      const res = await saveCoverLetter(payload, id)

      const nextState = payload.get('coverLetter')

      setTailoredCoverLetter(nextState)

      batch(() => {
        setEditingCoverLetter(false)
        setShowingCoverLetter(0)
      })
    }

    const cancelEdits = (e) => {
      e.preventDefault()

      batch(() => {
        setEditingCoverLetter(false)
        setShowingCoverLetter(0)
      })
  }

    if (empty && !editingCoverLetter.value) return (
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

    const currentLetter = 
      coverLetters[showingCoverLetter.value]
    const isTemplate = Boolean(currentLetter?.text)

    const text = isTemplate
      ? currentLetter.text
      : tailoredCoverLetter.value

    // TODO: dynamic detection and replacement for handlebars
    const letter = text
      ?.replaceAll('{{TITLE}}', title)
      ?.replaceAll('{{COMPANY}}', company.name || company)
      // TODO: company logging not fully baked yet

    if (editingCoverLetter.value) return (
      <details name='tabs' open>
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
      
      const targetIndex = showingCoverLetter.value
      const { name: tail } = coverLetters[targetIndex]
      
      templateLabel = `${head}${tail && `: ${tail}`}`
    }

    let letterLabel = templateLabel || 'Tailored'

    const editLabel = isTemplate ? 'Customize' : 'Edit'

    const showing = showingCoverLetter.value

    const previous = () => setShowingCoverLetter(showing - 1)
    const next = () => setShowingCoverLetter(showing + 1)

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
          {showingCoverLetter.value != 0 && (
            <li><button onClick={previous}>Previous</button></li>
          )}
          {showingCoverLetter.value != coverLetters.length - 1
          && (
            <li><button onClick={next}>Next</button></li>
          )}
        </menu>
      </details>
    )
}

export default CoverLetter