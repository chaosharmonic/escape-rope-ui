import { batch, useSignal } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"
import Markdown from "react-markdown"
import {
    campaign,
    setCoverLetterTemplate,
    removeCoverLetterTemplate
} from "../../contexts/settings"
import { updateCoverLetters } from "../../api/settings"

const Wrapper = ({children}) => (
    <details open name='tabs'>
        <summary>
            <h3>
            Cover Letters
            </h3>
        </summary>
        {children}
    </details>
)

const CoverLetters = () => {
    useSignals()

    const coverLetters = campaign?.value?.coverLetters
        || []

    console.log({campaign: campaign.value})

    const showingCoverLetter = useSignal(0)
    const setShowing = (bool) => {
        showingCoverLetter.value = bool
    }

    const editingCoverLetter = useSignal(false)
    const setEditing = (bool) => {
        editingCoverLetter.value = bool
    }

    const [ showing, editing ] = [
        showingCoverLetter,
        editingCoverLetter
    ].map(sig => sig.value)

    const startNewCoverLetter = () => {
        setEditing(true)
        if (coverLetters.length) setShowing(coverLetters.length)
    }

    const editCoverLetter = () => {
        setEditing(true)
    }

    const cancelEdits = (e) => {
        e.preventDefault()

        batch (() => {
            setEditing(false)
            setShowing(0)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const data = new FormData(e.target)

        const newCoverLetter = Object.fromEntries(data.entries())
        /*
        [...data.keys()]
            .reduce((obj, key) => data.get(key)
                ? ({...obj, [key]: data.get(key)})
                : obj,
            {})
        */

        const nextState = showing === coverLetters.length
        ? [...coverLetters, newCoverLetter]
        : coverLetters.toSpliced(showing, 1, newCoverLetter)

        // TODO: later... update to handle multiple campaigns
        const payload = { coverLetters: nextState }

        const res = await updateCoverLetters(payload)

        batch(() => {
            setCoverLetterTemplate(newCoverLetter, showing)
            setEditing(false)
        })
    }

    const deleteCoverLetter = async () => {
        const nextState = coverLetters.toSpliced(showing, 1)

        const payload = { coverLetters: nextState }

        const res = await updateCoverLetters(payload)

        console.log({res, showing})

        batch(() => {
            removeCoverLetterTemplate(showing)
            setEditing(false)
        })

        if (showing >= nextState.length) {
            const nextIndex = nextState.length - 1
            setShowing( nextIndex )
        }
    }

    const previous = () => setShowing(showing - 1)
    const next = () => setShowing(showing + 1)

    if (!coverLetters?.length && !editing) return (
        <Wrapper>
            <button onClick={startNewCoverLetter}>
                Add Cover Letter
            </button>
        </Wrapper>
    )

    // FIXME:
    const current = coverLetters.at(showing) || {}

    const { name = '', text } = current

    if (editing) return (
        <Wrapper>
        <form onSubmit={handleSubmit} onReset={cancelEdits}>
            <fieldset>

            <label labelfor="name">
                <span>
                    Name (optional)
                </span>
                <input
                    defaultValue={name}
                    type="text"
                    name="name"
                />
            </label>
            <label labelfor="text">
                <p>Content</p>
                <p>
                    Write using <a href='https://markdownguide.org/'>Markdown</a>
                </p>
                <p>To add template fields (title, company, etc):</p>
                <p>{`{{TEMPLATE_NAME}}`}</p>
                <textarea
                    defaultValue={text}
                    required
                    name="text"
                    rows="20"
                    cols="30"
                />
            </label>
            </fieldset>
            {/* TODO: cancel */}
            <menu>
                <li><input type="submit" value="Save" /></li>
                <li><input type="reset" value="Cancel" /></li>
            </menu>
        </form>
        <menu>
            <li><button onClick={deleteCoverLetter}>Delete</button></li>
        </menu>
        </Wrapper>
    )

    return (
        <Wrapper>
            <div>
                {name && <h3>{name}</h3>}
                <Markdown>{coverLetters.at(showing)?.text}</Markdown>
            </div>
            <menu>
                <li><button onClick={editCoverLetter}>Edit</button></li>
                <li><button onClick={startNewCoverLetter}>Add</button></li>
            </menu>
            
            { coverLetters.length > 1 && (
                <menu>
                    {showing != 0 && (
                        <li><button onClick={previous}>Previous</button></li>
                    )}
                    {showing != coverLetters.length - 1 && (
                        <li><button onClick={next}>Next</button></li>
                    )}
                </menu>
            )}
            {/* 
            <menu>
                <li>
                    <button>Extract links as footnotes</button>
                </li>
                <li>
                    <button>Copy to clipboard</button>
                </li>
            </menu>
            */}
        </Wrapper>
    )
}

export default CoverLetters