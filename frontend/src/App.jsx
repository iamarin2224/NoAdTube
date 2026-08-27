import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { SearchPage } from './pages/SearchPage';
import { TweetsPage } from './pages/TweetsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { ChannelPage } from './pages/ChannelPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { LikedVideosPage } from './pages/LikedVideosPage';
import { MyVideosPage } from './pages/MyVideosPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OTPVerificationPage } from './pages/OTPVerificationPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Auth routes (Only accessible when signed out or unverified) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicOnlyRoute>
            <OTPVerificationPage />
          </PublicOnlyRoute>
        }
      />

      {/* Main app layout wrapper */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<HomePage />} />
        <Route path="/watch/:videoId" element={<WatchPage />} />
        <Route path="/results" element={<SearchPage />} />
        <Route path="/tweets" element={<TweetsPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/channel/:username" element={<ChannelPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />

        {/* Protected routes strictly requiring verified authentication */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked"
          element={
            <ProtectedRoute>
              <LikedVideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-videos"
          element={
            <ProtectedRoute>
              <MyVideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <MyVideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
