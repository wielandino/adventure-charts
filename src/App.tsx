import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import GraphEditor from './pages/GraphEditor'
import { ThemeProvider } from './theme/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/graph/:id" element={<GraphEditor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
