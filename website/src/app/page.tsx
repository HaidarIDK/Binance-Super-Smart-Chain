import Hero from '@/components/Hero'
import Features from '@/components/Features'
import PerformanceComparison from '@/components/PerformanceComparison'
import TechArchitecture from '@/components/TechArchitecture'
import DeveloperTools from '@/components/DeveloperTools'
import GettingStarted from '@/components/GettingStarted'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <PerformanceComparison />
      <TechArchitecture />
      <DeveloperTools />
      <GettingStarted />
      <Footer />
    </main>
  )
}
