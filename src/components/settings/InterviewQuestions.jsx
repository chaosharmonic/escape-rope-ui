import { batch, useSignal } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"
import Markdown from "react-markdown"
import {
    campaign,
    setDefaultInterviewQuestions,
} from "../../contexts/settings"
import { updateInterviewQuestions } from "../../api/settings"


const Wrapper = ({children}) => (
    <details name='tabs'>
        <summary>
            <h3>
                Default Interview Questions:
            </h3>
        </summary>
        {children}
    </details>
)

// TODO:
// This should function more like the blocklist,
//  and include specific stages
const InterviewQuestions = () => {
    useSignals()
    const {
        defaultInterviewQuestions = []
    } = campaign.value
    
    const editingQuestions = useSignal(false)
    const setEditing = (bool) => {
        editingQuestions.value = bool
    }

    const editing = editingQuestions.value

    const editInterviewQuestions = () => setEditing(true)

    const saveInterviewQuestions = async (e) => {
        e.preventDefault()
        
        const data = new FormData(e.target)

        const nextState = data.get('defaultInterviewQuestions')
            .split('\n')
            .filter(e => Boolean(e))

        data.set('defaultInterviewQuestions', JSON.stringify(nextState))

        const res = await updateInterviewQuestions(data)

        // TODO: FIXME: 
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

    if (editing) {
        
        const questions = defaultInterviewQuestions.join('\n\n')
        return (
            <Wrapper>
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
        </Wrapper>
    )}

    const questions = defaultInterviewQuestions
        .map(q => `- ${q}`)
        .join('\n')
    
    return (
        <Wrapper>
            <fieldset>
                <Markdown>{questions}</Markdown>
            </fieldset>
            <menu>
                <button onClick={editInterviewQuestions}>
                    Edit
                </button>
            </menu>
        </Wrapper>
    )
}

export default InterviewQuestions