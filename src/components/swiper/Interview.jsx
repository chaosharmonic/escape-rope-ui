import { batch, useSignal } from "@preact/signals-react"
import { useComputed, useSignalEffect, useSignals } from "@preact/signals-react/runtime"
import { campaign } from "../../contexts/settings"
import { updateInterview } from "../../api/job"

const mockInterviews = [
    {
        type: "HR Screen",
        interviewer: {
            name: "Hermes Conrad",
            title: "Chief Bureaucrat"
        },
        questions: [
            { question: "How dare you?" }
        ]
    }
]

export const Interviews = ({ job }) => {
    useSignals()

    const hasInterviews = [
        'interview',
        'offer',
        'hire'
    ].some(status => job.lifecycle == status)
    
    if (!hasInterviews) return null

    const {
        id,
        interviews: storedInterviews = [...mockInterviews]
    } = job

    // if (!storedInterviews.length) {
    //   storedInterviews.push(...mockInterviews)
    // }

    const empty = !storedInterviews.length

    const editTarget = useSignal(null)
    
    const setEditTarget = (index) => {
        editTarget.value = index
    }

    // TODO: deal with these later
    // const [ showing, setShowing ] = useState(0)
    // const [
    //   interviewerFields,
    //   setInterviewerFields
    // ] = useState([])

    const questionFields = useSignal([])
    const setQuestionFields = (questions) => {
        questionFields.value = questions
    }

    const interviews = useSignal(storedInterviews)
    const setInterviews = (questions) => {
        interviews.value = questions
    }

    const addNew = () =>
        setEditTarget(interviews.value.length)

    const isEditing = useComputed(() => editTarget.value !== null)
    
    useSignalEffect(() => {
        if (!isEditing.value) return

        if (editTarget.value === interviews.value.length) {

            const existingInterviewQuestions = interviews.value
                .flatMap(({ questions }) => questions)
                .map(({ question: q }) => q)
            
            // TODO: defaults should filter
            //  by interview type
            const questionsToAsk = defaultInterviewQuestions
                .filter(q => {
                    if (empty) return true

                    const existingQuestion = existingInterviewQuestions
                        .find((question) => question == q)
                        
                    return !existingQuestion
                    // && question isn't every stage and/or repeat
                })
                .map(question => ({ question }))

            setQuestionFields(questionsToAsk)

            return
        }

        const {
        // interviewer, TODO:
        questions
        } = interviews.value[editTarget.value]

        setQuestionFields(questions)

    })

    const {
        defaultInterviewQuestions = []
    } = campaign.value

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

        const data = await updateInterview(payload, id, editTarget)
        // .then(r => r.json())

        const next = interviews.value
            .toSpliced(editTarget, 1, payload)

        batch (() => {
            setInterviews(next)
            setEditTarget(null)
        })
    }

    const cancelEdits = (e) => {
        e.preventDefault()

        setEditTarget(null)
    }

    const addQuestion = () => {
        const blank = { question: '' }

        const next = [ ...questionFields.value, blank ]
        
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

    if (empty && !isEditing.value) return (
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

    if (isEditing.value) {
        const interview = interviews.value[editTarget] || {}

        const {
        // type, TODO:
        interviewer
        } = interview

        const questionInputs = questionFields.value
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

    const interviewLogs = interviews.value.map((e, i) => {
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

export default Interviews