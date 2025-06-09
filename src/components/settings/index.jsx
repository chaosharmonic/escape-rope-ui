import { useState } from 'react'
import Markdown from 'react-markdown'
import {
    updateInterviewQuestions,
} from '../../api/settings'
import { campaign } from '../../contexts/settings'
import BasicDetails from './BasicDetails'
import Blocklist from './Blocklist'
import CoverLetters from './CoverLetters'
import InterviewQuestions from './InterviewQuestions'
import { useSignals } from '@preact/signals-react/runtime'

// TODO: finish styling this whole thing consistently

const Settings = () => {

    return (
        <section className='settings'>
            {/* <div> */}
                {/* <h1>Settings</h1>
                <h2>Job search name: {campaign?.name}</h2> */}
                <BasicDetails />
                <CoverLetters />
                <InterviewQuestions />
                <Blocklist />
            {/* </div> */}
        </section>
    )
}

export default Settings
