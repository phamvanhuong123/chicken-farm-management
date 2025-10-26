
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import { store } from './reduxStore/store'

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename='/' >
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
