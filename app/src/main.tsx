import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'
import { initFromUrl, startUrlSync } from './hooks/useUrlParams'

initFromUrl()
startUrlSync()

render(<App />, document.getElementById('app')!)
