import { LocationProvider, Router, Route } from 'preact-iso'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { OfflineBanner } from './components/OfflineBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SpeciesList } from './pages/SpeciesList'
import { SpeciesDetail } from './pages/SpeciesDetail'
import { DiveSites } from './pages/DiveSites'
import { DiveLog } from './pages/DiveLog'
import { NewDiveSession } from './pages/NewDiveSession'
import { DiveSessionDetail } from './pages/DiveSessionDetail'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <ErrorBoundary>
      <LocationProvider>
        <div class="min-h-screen flex flex-col bg-ocean-50">
          <Header />
          <OfflineBanner />
          <main class="flex-1 max-w-2xl mx-auto w-full">
            <Router>
              <Route path="/" component={SpeciesList} />
              <Route path="/species/:id" component={SpeciesDetail} />
              <Route path="/log" component={DiveLog} />
              <Route path="/log/new" component={NewDiveSession} />
              <Route path="/log/:id" component={DiveSessionDetail} />
              <Route path="/sites" component={DiveSites} />
              <Route default component={NotFound} />
            </Router>
          </main>
          <BottomNav />
        </div>
      </LocationProvider>
    </ErrorBoundary>
  )
}
