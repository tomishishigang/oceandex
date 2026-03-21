import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'
import { initFromUrl, startUrlSync } from './hooks/useUrlParams'
import { initAuth } from './auth/useAuth'

initFromUrl()
startUrlSync()
initAuth()

render(<App />, document.getElementById('app')!)
