import Feature from '../components/Feature'
import Footer from '../components/Footer'
import Header from '../components/Header'
import '../styles/home.css'

const Home = () => {
  return (
    <div className='home-container'>
      <div className='home-content'>
        <Header />
        <Feature />
        <Footer />
      </div>
    </div>
  )
}

export default Home
