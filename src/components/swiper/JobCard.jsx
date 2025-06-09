const JobCard = ({
    job: {
      title,
      company,
      summary,
      pay,
      description,
    },
    loading,
    transitionClasses,
    // TODO: these should probably be context based
    swipeLeft,
    swipeRight,
    swipeUp,
    swipeDown,
    openDetails,
    skip
}) => (
  <div className={`card ${transitionClasses}`}>
    <div className='content'>
      {/* TODO: fix the keyboard event here */}
      {/* "show more" toggle */}
      {/* div, space between w buttons */}
      <h3>{title}</h3>
      <h4>{company}</h4>
      <h5>{pay}</h5>
      { summary && <p>{ summary }</p>}
      { description &&
        <button onClick={openDetails}>More...</button>
      }
    </div>
    <div className='buttons'>
      <button disabled={loading.value} onClick={swipeLeft}>Nah!</button>
      <button disabled={loading.value} onClick={skip}>Skip</button>
      <button disabled={loading.value} onClick={swipeRight}>Yeah!</button>
    </div>
  </div>
)

export default JobCard