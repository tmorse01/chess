import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Game from './pages/Game';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/g/:gameId"
            element={
              <ErrorBoundary fallbackTitle="Game Error">
                <Game />
              </ErrorBoundary>
            }
          />
        </Routes>
      </main>
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: 'frosted-glass border-violet-500/20',
            title: 'text-gray-900 dark:text-gray-100',
            description: 'text-gray-600 dark:text-gray-400',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
