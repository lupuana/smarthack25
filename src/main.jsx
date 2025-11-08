import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'


ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<BrowserRouter>
<AuthProvider>
<DataProvider>
<App />
</DataProvider>
</AuthProvider>
</BrowserRouter>
</React.StrictMode>
)