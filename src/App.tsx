import { Routes, Route } from 'react-router-dom';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ProtectedRoute from './ProtectedRoute';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/Profile';
import ErrorBoundary from './ErrorBoundary';
import { useEffect } from 'react';
import { socket } from './Layout';
import axios from 'axios';
import { apiUrl } from './Layout';


const App = () => {

  useEffect(() => {

    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const isUnsubscribed = await subscription.unsubscribe();
        if (isUnsubscribed) {
          console.log('Successfully unsubscribed from the push service.');
        } else {
          console.error('Failed to unsubscribe from the push service.');
        }
      } else {
        console.log('No subscription found.');
      }
    });

    function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary)
        .replace(/\+/g, '-') // Replace + with -
        .replace(/\//g, '_') // Replace / with _
        .replace(/=+$/, ''); // Remove trailing =
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('../service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    async function subscribeToPush() {
      const registration = await navigator.serviceWorker.ready;
      const response = await axios.get(`${apiUrl}/notifications/vapi`)
      const vapiPublicKey = response.data.vapiPublicKey

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Ensures notifications are visible to the user
        applicationServerKey: vapiPublicKey,
      });

      const p256dhBuffer = subscription.getKey('p256dh');
      const authBuffer = subscription.getKey('auth');

      if (!p256dhBuffer || !authBuffer) {
        throw new Error('Missing keys in subscription.');
      }

      const p256dh = arrayBufferToBase64Url(p256dhBuffer);
      const auth = arrayBufferToBase64Url(authBuffer);
      const endpoint = subscription.endpoint;

      socket.emit(`messageFromKitchen`, { p256dh, auth, endpoint })

      console.log(p256dh, auth, endpoint)
      console.log('Push subscription:', JSON.stringify(subscription));

      // Send this subscription to your server
    }

    subscribeToPush()

  }, [])


  return (
    <Routes>
      <Route
        path='/:kitchenId/signin'
        element={
          <ErrorBoundary>
            <SignInPage />
          </ErrorBoundary>

        }
      />
      <Route
        path='/:kitchenId/signup'
        element={
          <ErrorBoundary>
            <SignUpPage />
          </ErrorBoundary>
        }
      />
      <Route

        path="/:kitchenId/profile"
        element={
          <ErrorBoundary>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </ErrorBoundary>
        }

      />
      <Route
        path="/:kitchenId"
        element={
          <ErrorBoundary>
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          </ErrorBoundary>
        }
      />
      <Route
        path="/:kitchenId/cart"
        element={
          <ErrorBoundary>
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          </ErrorBoundary>
        }
      />
      <Route
        path="/:kitchenId/orders"
        element={
          <ErrorBoundary>
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          </ErrorBoundary>
        }
      />
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default App;