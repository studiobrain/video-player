import { useEffect } from 'react'
import VideoPlayer from '../../components/VideoPlayer'
import frames from '../../data/frames'
import styles from './styles.module.scss'

const videoUrl = 'https://video.thechosen.tv/downloads/trailers/CWTC_60S_TRAILER_EVERGREEN_PRORESHQ.mp4'
const videoData = { frames, videoUrl }

const Home = () => {
  useEffect(() => {
    console.log(videoData)
  }, [])

  return (
    <div className={styles.container}>
      {!!videoData && <VideoPlayer data={videoData} />}
    </div>
  )
}

export default Home
