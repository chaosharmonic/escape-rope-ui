import { useSignal } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"
import { campaign, setBasicDetails } from "../../contexts/settings"
import { updateBasicDetails } from "../../api/settings"

const Wrapper = ({children}) => (
    <details open name='tabs'>
        <summary>
            <h3>
                Basic Details:
            </h3>
        </summary>
        {children}
    </details>
)

const BasicDetails = () => {
    useSignals()
    
    const {
        pay,
        roles,
        skills
    } = campaign?.value

    const details = {
        pay,
        roles,
        skills
    }

    const editingDetails = useSignal(false)
    const setEditing = (bool) => {
        editingDetails.value = bool
    }

    const editing = editingDetails.value

    const editBasicDetails = () => setEditing(true)
    // TODO: FIXME: needs cancel button

    const saveBasicDetails = async (e) => {
        e.preventDefault()
        
        const formData = new FormData(e.target)

        const salary = {
            min: (formData.get('minSalary')),
            max: (formData.get('maxSalary'))
        }

        const nextState = { pay: salary }

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

        console.log({nextState})
        setBasicDetails(nextState)

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
            const defaultValue = pay && pay[key] || ''
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
            <Wrapper>
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
                    <li><button onClick={clearDetails}>Clear</button></li>
                </menu> */}
            </Wrapper>
    )}

    let payLabel = ''
    if (pay?.min) {
        payLabel = pay?.max
        ? `$${pay?.min}-${pay?.max}/yr`
        : `$${pay?.min}/yr and up`
    }
    
    return (
        <Wrapper>
            <div>
                <h3>Roles</h3>
                <p>{roles?.join('; ')}</p>
                <h3>Skills</h3>
                <p>{skills?.join('; ')}</p>
                {payLabel && (
                    <>
                    <h3>Pay</h3>
                    <p>{payLabel}</p>
                    </>
                )}
            </div>
            <menu>
                <button onClick={editBasicDetails}>
                    Edit
                </button>
            </menu>
        </Wrapper>
    )
}

export default BasicDetails