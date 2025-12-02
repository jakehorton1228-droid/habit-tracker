import './App.css'
import Nav from './components/Nav'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Goals from './pages/Goals'

function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/goals" element={<Goals />} />
        </Routes>
      </main>
    </>
  )
}

export default App
