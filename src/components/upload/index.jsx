import { useState } from 'react'
import { baseURL } from "../../helpers/config"

const Upload = () => {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // TODO: this should also cover companies
            const route = 'jobs/upload'
            const endpoint = `${baseURL}/${route}`

            const payload = new FormData(e.target)
            
            // TODO: this could also be a CSV
            
            const options = {
                method: 'POST',
                body: payload
            }

            const data = await fetch(endpoint, options).then(r => r.json())

            // TODO: set other status based on data returned

            e.target.reset()
        }
        catch ({message: m}) {
            console.error(m)
        }
        finally {
            setLoading(false)
        }
    }

    // TODO: some kind of explanation of the schema for this
    return (
        <section className='upload'>
            <form onSubmit={handleSubmit}>
                {/* <div> */}
                    <label labelfor="file">
                        <div>
                            <p>Select a file...</p>
                            <input name="file" type="file" accept="application/json" />
                        </div>
                    </label>
                    <div>
                        <input type="submit" value="Upload" disabled={loading} />
                        {loading && <progress />}
                    </div>
                    {/* TODO: submission status */}
                {/* </div> */}
            </form>
        </section>
    )
}
    

export default Upload