import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Layout from './Layout.tsx'
import { BrowserRouter } from 'react-router-dom'
import AppTheme from './pages/shared-theme/AppTheme.tsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store.ts'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppTheme>
              <Layout>
                <App />
              </Layout>
            </AppTheme>
          </PersistGate>
        </Provider>
    </BrowserRouter>
  </StrictMode>,
)
