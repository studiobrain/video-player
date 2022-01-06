import React, { useEffect, useState, useRef } from 'react'
import ReactSlider from 'react-slider'
import {
  MdPlayArrow,
  MdPause,
  MdSkipNext,
  MdSkipPrevious,
  MdForward5,
  MdReplay5,
  MdOutlineFullscreen,
} from 'react-icons/md'
import styles from './styles.module.scss'

const VideoPlayer = (props) => {
  const {
    data: { frames, videoUrl },
  } = props
  const videoRef = useRef()
  const [videoPercentage, setVideoPercentage] = useState('')
  const [activeFrame, setActiveFrame] = useState(null)
  const [detectionIndex, setDetectionIndex] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [activeFrameStatus, setActiveFrameStatus] = useState(null)

  useEffect(() => {
    let mounted = true

    // if (!!videoRef.current) {
    //   videoRef.current.onloadedmetadata = () => {
    //     if (mounted) {
    //       setVideoReady(true)
    //       videoRef.current.playbackRate = 2.0
    //     }
    //   }
    // }

    if (!!videoRef.current) {
      console.log(videoRef)
      setVideoReady(true)
      videoRef.current.playbackRate = 1.0
      // videoRef.current.volume = 0.5
      // videoRef.current.requestFullscreen()
    }

    return () => {
      setVideoReady(false)
      mounted = false
    }
  }, [videoRef, videoUrl, frames])

  const toggleFullScreen = () => {
    videoRef.current.requestFullscreen()
  }

  const handleMarkerClick = (marker) => {
    const { timestamp } = marker
    const index = frames.indexOf(marker)
    videoRef.current.pause()
    setVideoPercentage((timestamp / videoRef.current.duration) * 100)
    setActiveFrame(marker)
    setFrameButtonState(marker)
    setDetectionIndex(index)
    videoRef.current.currentTime = timestamp
  }

  const setFrameButtonState = (frame) => {
    setActiveFrameStatus(!!frame ? frame.nft : null)
  }

  const togglePlayback = () => {
    if (!videoRef.current.paused) {
      videoRef.current.pause()
      setVideoPlaying(false)
    } else {
      videoRef.current.play()
      setVideoPlaying(true)
      setTimeout(() => {
        setActiveFrame(null)
      }, 1000)
    }
  }

  const renderVideoControls = () => {
    return frames.map((item, i) => {
      let active =
        !!activeFrame &&
        Number(item.timestamp) >= Number(activeFrame.timestamp) - 1 &&
        Number(item.timestamp) <= Number(activeFrame.timestamp) + 1
      return (
        <div
          className={`${styles.marker} ${active && styles.active}`}
          key={`${i}-${item.timestamp}`}
          style={{
            left: `${(item.timestamp / videoRef.current.duration) * 100}%`,
          }}
          onClick={() => handleMarkerClick(item)}
        />
      )
    })
  }

  const handleVideoSeek = (time) => {
    let timestamp = (videoRef.current.duration / 100) * time
    setVideoPercentage(time)
    videoRef.current.currentTime = timestamp
  }

  const scrubPlayer = (direction) => {
    videoRef.current.currentTime =
      direction === 'forward'
        ? videoRef.current.currentTime + 5
        : videoRef.current.currentTime - 5
  }

  const handleTimeUpdated = () => {
    if (videoRef.current.paused) return
    setVideoPercentage(
      (videoRef.current.currentTime / videoRef.current.duration) * 100
    )

    frames.forEach((item, i) => {
      if (
        videoRef.current.currentTime >= Number(item.timestamp) - 1 &&
        videoRef.current.currentTime <= Number(item.timestamp) + 1
      ) {
        setActiveFrame(item)
        setDetectionIndex(i)
        setFrameButtonState(item)

        if (!videoRef.current.paused) {
          setTimeout(() => {
            setActiveFrame(null)
          }, 3000)
        }
      }
    })
  }

  const jumpToFrame = (dir) => {
    let index = dir === 'next' ? detectionIndex + 1 : detectionIndex - 1
    if (index <= 0) index = 0
    if (index >= frames.length) return
    handleMarkerClick(frames[index])
    setVideoPlaying(false)
  }

  return (
    <div className={styles.videoContainer}>
      <div className={styles.video}>
        <video
          src={videoUrl}
          ref={videoRef}
          // autoPlay
          onTimeUpdate={handleTimeUpdated}
        />
        {!videoReady && (
          <div className={styles.loading}>loading the video content...</div>
        )}
      </div>
      <div className={styles.videoControls}>
        {!!videoReady && (
          <>
            <div className={styles.videoPlayerActions}>
              {!!videoReady && !videoPlaying ? (
                <MdPlayArrow size={30} onClick={() => togglePlayback()} />
              ) : (
                <MdPause size={30} onClick={() => togglePlayback()} />
              )}
            </div>
            <div className={styles.videoControlContainer}>
              <div
                className={styles.videoSeek}
                style={{ width: `${videoPercentage}%` }}
              >
                {!!videoReady && renderVideoControls()}
              </div>
              {!!videoRef.current && (
                <ReactSlider
                  value={
                    (videoRef.current.currentTime / videoRef.current.duration) *
                    100
                  }
                  onChange={(change) => handleVideoSeek(change)}
                  renderThumb={(props, state) => {
                    let time = new Date(videoRef.current.currentTime * 1000)
                      .toISOString()
                      .substr(11, 8)

                    return (
                      <div className={styles.playHead} {...props}>
                        {time}
                      </div>
                    )
                  }}
                />
              )}
            </div>
            <div className={styles.scrubbers}>
              <MdReplay5 size={25} onClick={() => scrubPlayer('reverse')} />
              <MdForward5 size={25} onClick={() => scrubPlayer('forward')} />
              <MdOutlineFullscreen size={25} onClick={() => toggleFullScreen()} />
            </div>
          </>
        )}
      </div>
      <div className={styles.detections}>
        <div className={styles.buttonGroup}>
          <button
            className={styles.control}
            onClick={() => jumpToFrame('prev')}
          >
            <MdSkipPrevious size={20} />
          </button>
          <button
            className={styles.control}
            onClick={() => jumpToFrame('next')}
          >
            <MdSkipNext size={20} />
          </button>
        </div>
        {!!activeFrame && !!videoReady ? (
          <div>
            <p><span>{activeFrame?.nft?.title}</span> | {activeFrame?.nft?.description}</p>
            <p>owned by: {activeFrame?.nft?.owner}</p>
          </div>
        ) : (
          <button className={styles.buy}>buy now</button>
        )}
      </div>
    </div>
  )
}

export default VideoPlayer
