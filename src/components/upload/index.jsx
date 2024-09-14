import { baseURL } from "../../helpers/config"

const Upload = () => {
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // TODO: this should also cover companies
            const route = 'jobs/upload'
            const endpoint = `${baseURL}/${route}`

            // TODO: set loading

            const payload = new FormData(e.target)
            
            // TODO: this could also be a CSV
            
            const options = {
                method: 'POST',
                body: payload
            }

            const data = await fetch(endpoint, options).then(r => r.json())

            // clear loading; set other status based on data returned

            e.target.reset()
        }
        catch ({message: m}) {
            console.error(m)
        }
    }

    // TODO: any kind of styling or other structure
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
                    <input type="submit" value="Upload" />
                    {/* TODO: submission status */}
                {/* </div> */}
            </form>
        </section>
    )
}
    

export default Upload