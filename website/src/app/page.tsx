import Hero from '@/components/Hero'
import Features from '@/components/Features'
import PerformanceComparison from '@/components/PerformanceComparison'
import LiveTestnet from '@/components/LiveTestnet'
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
      <LiveTestnet />
      <GettingStarted />
      <Footer />
    </main>
  )
}

