import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Onboard from './pages/Onboard'
import Enroll from './pages/Enroll'
import Verify from './pages/Verify'
import GroupStatus from './pages/GroupStatus'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/onboard', element: <Onboard /> },
  { path: '/enroll', element: <Enroll /> },
  { path: '/verify', element: <Verify /> },
  { path: '/group', element: <GroupStatus /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
