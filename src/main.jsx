import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Provider } from 'react-redux'
import store, {persistor} from './redux/store/store'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { PersistGate } from 'redux-persist/integration/react'
import CommonLoadingSpinner from './components/loadingAnimations/CommonLoading'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<CommonLoadingSpinner/>} persistor={persistor}>
    <BrowserRouter>
    <Toaster position="top-right" reverseOrder={false} />
    <App />
    </BrowserRouter>
    </PersistGate>
    </Provider>
  </StrictMode>,
)
