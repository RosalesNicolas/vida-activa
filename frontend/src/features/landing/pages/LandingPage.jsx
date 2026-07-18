import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Method from '../components/Method'
import Plans from '../components/Plans'
import Testimonials from '../components/Testimonials'
import Faq from '../components/Faq'
import Contact from '../components/Contact'

function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Services />
        <Method />
        <Plans />
        <Testimonials />
        <Faq />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

export default LandingPage
