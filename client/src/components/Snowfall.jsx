import { useEffect } from 'react'
import '../styles/snowfall.css'

const Snowfall = () => {
  useEffect(() => {
    const snowContainer = document.getElementById('snow-container')

    for (let i = 0; i < 150; i++) {
      const snowball = document.createElement('div')
      snowball.className = 'snowball'

      snowball.style.left = `${Math.random() * 100}vw`
      snowball.style.top = `${Math.random() * 100}vh`
      snowball.style.animationDuration = `${Math.random() * 5 + 5}s`
      const size = `${Math.random() * 6 + 6}px`
      snowball.style.width = size
      snowball.style.height = size
      snowball.style.opacity = Math.random() * 0.8 + 0.2

      snowContainer.appendChild(snowball)
    }

    return () => {
      snowContainer.innerHTML = ''
    }
  }, [])

  return <div id='snow-container'></div>
}

export default Snowfall
