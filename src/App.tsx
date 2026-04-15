import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TokenGate } from './components/TokenGate'
import { ToastContainer } from './components/ToastContainer'
import { DashboardPage } from './pages/DashboardPage'
import { MarketsPage } from './pages/MarketsPage'
import { TradingPage } from './pages/TradingPage'
import { RiskPage } from './pages/RiskPage'
import { AccountsPage } from './pages/AccountsPage'
import { StrategiesPage } from './pages/StrategiesPage'

function App() {
  return (
    <TokenGate>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="markets" element={<MarketsPage />} />
            <Route path="trading" element={<TradingPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="strategies" element={<StrategiesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TokenGate>
  )
}

export default App
