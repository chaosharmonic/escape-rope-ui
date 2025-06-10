import { useSignal } from "@preact/signals-react"
import { useSignals } from "@preact/signals-react/runtime"
import Markdown from "react-markdown"
import {
    campaign,
    setBlocklist
} from "../../contexts/settings"
import { updateBlocklist } from "../../api/settings"

const Wrapper = ({children}) => (
    <details open name='tabs'>
        <summary>
            <h3>
            Blocklist:
            </h3>
        </summary>
        {children}
    </details>
)

const Blocklist = () => {
    useSignals()

    const blocklist = campaign?.value?.blocklist || {}

    const editingBlocklist = useSignal(false)
    const setEditing = (bool) => {
        editingBlocklist.value = bool
    }

    const editing = editingBlocklist.value

    const editBlocklist = () => setEditing(true)

    const cancelEdits = () => setEditing(false)

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
        <Wrapper>
            <button onClick={editBlocklist}>Add blocklist</button>
        </Wrapper>
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
        <Wrapper>
            <form onSubmit={saveBlocklist} onReset={cancelEdits}>
                <fieldset>
                    {fields}
                </fieldset>
                <menu>
                    <input type="submit" value="Save" />
                    <input type="reset" value="Cancel" />
                </menu>
            </form>
            {/* <menu>
                <li><button onClick={clearBlocklist}>Clear</button></li>
            </menu> */}
        </Wrapper>
    )}
    
    const lists = Object.entries(blocklist)?.map(([ k, v ]) => {
        const items = v//.join('; ')
        .map(e => `- ${e}`)
        .join('\n')

        return (
            <div>
                <h3>{k}</h3>
                <Markdown>
                    {items}
                </Markdown>
            </div>
        )
        // return (
        // <>
        // <h3></h3>
        // <Markdown>
        //     {items}
        // </Markdown>
        // </>
    }) 
    
    return (
        <Wrapper>
            {lists}
            <menu>
                <button onClick={editBlocklist}>
                    Edit
                </button>
            </menu>
        </Wrapper>
    )
}


export default Blocklist