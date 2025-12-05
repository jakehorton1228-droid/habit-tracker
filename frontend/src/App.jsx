import Nav from './components/Nav'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Journal from './pages/Journal'

function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </main>
    </>
  )
}

export default App
