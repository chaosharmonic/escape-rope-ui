import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import {
    getSettings,
    updateBasicDetails,
    updateBlocklist,
    updateCoverLetters,
    updateInterviewQuestions,
} from '../../api/settings'


// TODO: finish styling this whole thing consistently

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

    const BasicDetails = () => {
        const initialDetails = {
            roles: campaign.roles || [],
            skills: campaign.skills || [],
            salary: campaign.salary || {}
        }

        const [ editing, setEditing ] = useState(false)
        const [ details, setDetails ] = useState(initialDetails)

        const { salary, roles, skills } = details
    
        const editBasicDetails = () => setEditing(true)
    
        const saveBasicDetails = async (e) => {
            e.preventDefault()
            
            const formData = new FormData(e.target)

            const salary = {
                min: (formData.get('minSalary')),
                max: (formData.get('maxSalary'))
            }

            const nextState = { salary }

            formData.delete('minSalary')
            formData.delete('maxSalary')

            for (let key of formData.keys()) {
                const value = formData.get(key)
                    .split(';')
                    .filter(e => e)
                    .map(e => e.trim())

                formData.set(key, JSON.stringify(value))
                
                nextState[key] = value
            }

            formData.set('salary', JSON.stringify(salary))

            const res = await updateBasicDetails(formData)

            setDetails(nextState)

            setEditing(false)
        }

        if (editing) {

            const lookingFor = ['roles', 'skills']
                .map(field => {
                    const defaultValue = details[field]?.join('; ') || ''
                    const labelText = `${field.at(0).toUpperCase()}${field.slice(1)}`
                    
                    return (
                        // TODO: at least one of these should be required
                        <label labelfor={field} key={labelText}>
                            {labelText} (separated by semicolon)
                            <textarea
                                defaultValue={defaultValue}
                                name={field}
                                rows="20"
                                cols="30"
                            />
                        </label>
                    )
                })

            const payTargets = ['minSalary', 'maxSalary']
            .map(field => {
                const key = field.replace('Salary', '')
                const defaultValue = salary[key] || ''
                const labelText = `${key.at(0).toUpperCase()}${key.slice(1)}`

                return (
                    // TODO: validate: cannot have only max pay
                    <label labelfor={field} key={field}>
                        {labelText}
                        <input
                        type='number'
                        defaultValue={defaultValue}
                        name={field}
                        />
                    </label>
                )
            })

            return (
            <>
            <form onSubmit={saveBasicDetails}>
                <fieldset>
                    <legend>Jobs</legend>
                    {lookingFor}
                </fieldset>
                <fieldset>
                    {/* TODO: support hourly pay */}
                    <legend>Pay (per year)</legend>
                    {payTargets}
                </fieldset>
                <input type="submit" value="Save" />
            </form>
            {/* <menu>
                <li><button onClick={clearBlocklist}>Clear</button></li>
            </menu> */}
            </>
        )}

        let payLabel = ''
        if (salary.min) {
            payLabel = salary.max
            ? `$${salary.min}-${salary.max}/yr`
            : `$${salary.min}/yr and up`
        }
        
        return <>
        <h3>Roles</h3>
        <p>{roles.join('; ')}</p>
        <h3>Skills</h3>
        <p>{skills.join('; ')}</p>
        {payLabel && (
            <>
            <h3>Pay</h3>
            <p>{payLabel}</p>
            </>
        )}
        <button onClick={editBasicDetails}>
            Edit
        </button>
        </>
    }

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

        const cancelEdits = (e) => {
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

        if (!coverLetters?.length && !editing) return (
            <button onClick={startNewCoverLetter}>Add Cover Letter</button>
        )

        // FIXME:
        const current = coverLetters.at(showing) || {}

        const { name = '', text } = current

        if (editing) return (
            <>
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
                    <span>Text</span>
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
            </>
        )

        // add
        return (
            <>
                <menu>
                    <li><button onClick={editCoverLetter}>Edit</button></li>
                    <li><button onClick={startNewCoverLetter}>Add</button></li>
                </menu>
                {name && <h3>name</h3>}
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
                <fieldset>
                    <label labelfor="defaultInterviewQuestions">
                        <span>Questions (one per line)</span>
                        <textarea
                        defaultValue={questions}
                        required
                        name="defaultInterviewQuestions"
                        rows="20"
                        cols="30"
                        />
                    </label>
                </fieldset>
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

const Blocklist = () => {
    const {
        blocklist: initialBlocklist = {}
    } = campaign

    const [editing, setEditing] = useState(false)
    const [blocklist, setBlocklist] = useState(initialBlocklist)

    const editBlocklist = () => setEditing(true)

    const saveBlocklist = async (e) => {
        e.preventDefault()
        
        const formData = new FormData(e.target)

        const nextState = {}

        for (let key of formData.keys()) {
            const value = formData.get(key)
                .split(';')
                .filter(e => e)
                .map(e => e.trim())

            nextState[key] = value

            formData.set(key, JSON.stringify(value))
        }

        const res = await updateBlocklist(formData)

        setEditing(false)
        
        setBlocklist(nextState)
    }

    const hasBlocks = Object.entries(blocklist)
        .some(([k, v]) => Boolean(v))

    if (!hasBlocks && !editing) return (
        <button onClick={editBlocklist}>Add blocklist</button>
    )

    if (editing) {
        
        // TODO: this needs validation, so that at least
        //  one field is required
        const fields = ['company', 'title', 'description', 'global']
            .map(field => {
                const defaultValue = blocklist[field]?.join('; ') || ''
                const labelText = `${field.at(0).toUpperCase()}${field.slice(1)}`
                return (
                    <label labelfor={field} key={labelText}>
                        {labelText} (separated by semicolon)
                        <textarea
                        defaultValue={defaultValue}
                        name={field}
                        rows="20"
                        cols="30"
                        />
                    </label>
                )
            })

        return (
        <>
        <form onSubmit={saveBlocklist}>
            <fieldset>
                {fields}
            </fieldset>
            <input type="submit" value="Save" />
        </form>
        {/* <menu>
            <li><button onClick={clearBlocklist}>Clear</button></li>
        </menu> */}
        </>
    )}
    
    const lists = Object.entries(blocklist)?.map(([ k, v ]) => {
        console.log({v})
        const items = v.join('; ')
        //.map(e => `- ${e}`)
        // .join('\n')

        return (
            <>
                <h4>{k}</h4>
                <Markdown>
                    {items}
                </Markdown>
            </>
        )
        // return (
        // <>
        // <h3></h3>
        // <Markdown>
        //     {items}
        // </Markdown>
        // </>
    }) 
    
    return <>
    {lists}
    <button onClick={editBlocklist}>
        Edit
    </button>
    </>
}

    return (
        <section className='settings'>
            {/* <div> */}
                {/* <h1>Settings</h1>
                <h2>Job search name: {campaign?.name}</h2> */}
                <details open name='tabs'>
                    <summary>
                        <h3>
                        Basic Details:
                        </h3>
                    </summary>
                <BasicDetails />
                </details>
                <details name='tabs'>
                    <summary>
                        <h3>
                        Cover letters:
                        </h3>
                    </summary>
                    <CoverLetters />
                </details>
                <details name='tabs'>
                    <summary>
                        <h3>
                        Blocklist:
                        </h3>
                    </summary>
                    <Blocklist />
                </details>
                <details name='tabs'>
                    <summary>
                        <h3>
                        Default Interview Questions:
                        </h3>
                    </summary>
                    <InterviewQuestions />
                </details>
            {/* </div> */}
        </section>
    )
}

export default Settings
