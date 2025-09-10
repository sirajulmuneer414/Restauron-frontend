import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Provider } from 'react-redux'
import store from './redux/store/store'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <Toaster position="top-right" reverseOrder={false} />
    <App />
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
