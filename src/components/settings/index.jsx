import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import {
    getSettings,
    updateCoverLetters,
    updateInterviewQuestions,
} from '../../api/settings'

const Settings = () => {
    const initialSettings = {
        campaigns: [
            {
                name: 'default'
            }
        ]
    }
    const [ userSettings, setUserSettings ] = useState(initialSettings)
    
    useEffect(() => {
        async function getData(){
          const data = await getSettings()

          console.log(data.value)

          setUserSettings(data.value)
          // TODO: catch block
        }
        getData()
    }, [])

    // useEffect(() => console.log({userSettings}), [userSettings])
    
    /*
    this is local-first, so there is no concept of "user"
    but one user might be running more than one job search
    and even a single one would have persistent settings
     for things like templated cover letters, 
    for now, this will only cover one search at a time,
    butthe backend supports more
    */
    const campaign = userSettings?.campaigns?.at(0)

    // {
    //     name: 'dev',
    //     titles: [],
    //     skills: ['JavaScript', 'Ruby'],
    //     forbiddenTerms: {
    //         // these may vary by industry
    //         levels: [],
    //         titles: [],
    //         descriptions: [],
    //         companies: [] // this *should* be a user level setting
    //     },
    //     coverLetters: [
    //         {
    //             name: '', // optional,
    //             content: '' // not
    //         }
    //     ] 
    // }

    const CoverLetters = () => {
        const {
            coverLetters: initialCoverLetters = []
        } = campaign

        const [ showing, setShowing ] = useState(0)
        const [ editing, setEditing ] = useState(false)
        const [
            coverLetters,
            setCoverLetters
        ] = useState(initialCoverLetters)

        const startNewCoverLetter = () => {
            setEditing(true)
            if (coverLetters.length) setShowing(coverLetters.length)
        }

        const editCoverLetter = () => {
            setEditing(true)
        }

        cancelEdits = (e) => {
            e.preventDefault()

            setEditing(false)
            setShowing(0)
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

            console.log({res})

            setEditing(false)

            setCoverLetters(nextState)
        }

        const deleteCoverLetter = async () => {
            const nextState = coverLetters.toSpliced(showing, 1)

            const payload = { coverLetters: nextState }

            const res = await updateCoverLetters(payload)

            console.log({res})

            setCoverLetters(nextState)

            setEditing(false)

            if (showing >= nextState.length) {
                const nextIndex = nextState.length - 1
                setShowing( nextIndex )
            }
        }

        const previous = () => setShowing(showing - 1)
        const next = () => setShowing(showing + 1)

        const text = coverLetters.at(showing)?.text || ''
        
        if (!coverLetters?.length && !editing) return (
            <button onClick={startNewCoverLetter}>Add Cover Letter</button>
        )

        if (editing) return (
            <>
            <form onSubmit={handleSubmit} onReset={cancelEdits}>
                <label labelfor="name">
                    <span>
                        Name (optional)
                        </span>
                    <input type="text" name="name" />
                </label>
                <label labelfor="text">
                    <span>
                        Text
                        </span>
                    <textarea
                    defaultValue={text}
                    required
                    name="text"
                    rows="20"
                    cols="45"
                    />
                </label>
                {/* TODO: cancel */}
            <menu>
                <li><input type="submit" value="Save" /></li>
                <li><input type="reset" value="Cancel" /></li>
            </menu>
            </form>
            <menu>
                <li><button onClick={deleteCoverLetter}>Delete</button></li>
            </menu>
            </>
        )

        // add
        return (
            <>
                <menu>
                    <li><button onClick={editCoverLetter}>Edit</button></li>
                    <li><button onClick={startNewCoverLetter}>Add</button></li>
                </menu>
                <Markdown>{coverLetters.at(showing)?.text}</Markdown>
                <menu>
                    {showing != 0 && (
                        <li><button onClick={previous}>Previous</button></li>
                    )}
                    {showing != coverLetters.length - 1 && (
                        <li><button onClick={next}>Next</button></li>
                    )}
                </menu>
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
            </>
        )
    }

    const InterviewQuestions = () => {
        const {
            defaultInterviewQuestions: 
            initialDefaultInterviewQuestions = []
        } = campaign
        const [ editing, setEditing ] = useState(false)
        const [
            defaultInterviewQuestions,
            setDefaultInterviewQuestions
        ] = useState(initialDefaultInterviewQuestions)

        const questions = defaultInterviewQuestions.join('\n\n')

        const editInterviewQuestions = () => setEditing(true)

        const saveInterviewQuestions = async (e) => {
            e.preventDefault()
            
            const data = new FormData(e.target)

            const nextState = data.get('defaultInterviewQuestions')
                .split('\n')
                .filter(e => Boolean(e))

            data.set('defaultInterviewQuestions', JSON.stringify(nextState))

            const res = await updateInterviewQuestions(data)

            setDefaultInterviewQuestions(nextState)

            setEditing(false)
        }

        const cancelEdits = (e) => {
            e.preventDefault()

            setEditing(false)
        }

        if (!defaultInterviewQuestions?.length && !editing) return (
            <button onClick={editInterviewQuestions}>
                Add Interview Questions
            </button>
        )

        if (editing) return (
            <>
            <form onSubmit={saveInterviewQuestions} onReset={cancelEdits}>
                <label labelfor="defaultInterviewQuestions">
                    <span>
                        Questions (one per line)
                        </span>
                    <textarea
                    defaultValue={questions}
                    required
                    name="defaultInterviewQuestions"
                    rows="20"
                    cols="45"
                    />
                </label>
                <menu>
                    <li><input type="submit" value="Save" /></li>
                    <li><input type="reset" value="Cancel" /></li>
                </menu>
            </form>
            {/* <menu>
                <li><button onClick={deleteCoverLetter}>Delete</button></li>
            </menu> */}
            </>
        )
        
        return <>
        <Markdown>{questions}</Markdown>
        <button onClick={editInterviewQuestions}>
            Edit
        </button>
        </>
    }


    return (
        <section className='settings'>
            {/* <div> */}
                {/* <h1>Settings</h1>
                <h2>Job search name: {campaign?.name}</h2> */}
                <h3>Cover letters:</h3>
                <CoverLetters />
                <h3>Default Interview Questions:</h3>
                <InterviewQuestions />
            {/* </div> */}
        </section>
    )
}

export default Settings
