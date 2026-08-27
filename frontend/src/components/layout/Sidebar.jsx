import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Tv, 
  History, 
  ThumbsUp, 
  PlaySquare, 
  Settings, 
  UserCheck, 
  ListMusic,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { subscriptionApi } from '../../api/subscription.api';
import { playlistApi } from '../../api/playlist.api';
import { Avatar } from '../common/Avatar';
import { encodeId } from '../../utils/idEncoder';

export const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useUI();
  const { isAuthenticated, user } = useAuth();
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const isAdmin = user?.email?.toLowerCase() === 'noadtube.online@gmail.com';

  useEffect(() => {
    if (isAuthenticated) {
      subscriptionApi
        .getSubscribedChannels()
        .then((res) => {
          if (res.success && res.data) {
            setSubscribedChannels(res.data);
          }
        })
        .catch(() => {});

      playlistApi
        .getMyPlaylists()
        .then((res) => {
          if (res.success && res.data) {
            setUserPlaylists(res.data);
          }
        })
        .catch(() => {});
    } else {
      setSubscribedChannels([]);
      setUserPlaylists([]);
    }
  }, [isAuthenticated]);

  const navItemClasses = ({ isActive }) =>
    `flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#272727] text-white font-semibold'
        : 'text-[#f1f1f1] hover:bg-[#272727]/60 text-stone-200'
    }`;

  const miniNavItemClasses = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-[10px] transition-colors ${
      isActive
        ? 'bg-[#272727] text-white font-semibold'
        : 'text-[#aaaaaa] hover:bg-[#272727]/60 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Expanded Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed top-14 left-0 bottom-0 z-30 w-60 bg-[#0f0f0f] border-r border-[#272727] overflow-y-auto custom-scrollbar p-3 flex flex-col gap-4 transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Main Section */}
        <div className="flex flex-col gap-1">
          <NavLink to="/" end className={navItemClasses}>
            <Home className="w-5 h-5 flex-shrink-0" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/tweets" className={navItemClasses}>
            <MessageSquare className="w-5 h-5 flex-shrink-0 text-sky-400" />
            <span>Tweets / Posts</span>
          </NavLink>

          <NavLink to="/subscriptions" className={navItemClasses}>
            <Tv className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>Subscriptions</span>
          </NavLink>
        </div>

        <hr className="border-[#272727]" />

        {/* Library Section */}
        <div className="flex flex-col gap-1">
          <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#aaaaaa]">
            You
          </div>

          <NavLink to="/playlists" className={navItemClasses}>
            <ListMusic className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>Playlists</span>
          </NavLink>

          <NavLink to="/history" className={navItemClasses}>
            <History className="w-5 h-5 flex-shrink-0" />
            <span>History</span>
          </NavLink>

          <NavLink to="/liked" className={navItemClasses}>
            <ThumbsUp className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>Liked Videos</span>
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/my-videos" className={navItemClasses}>
                <PlaySquare className="w-5 h-5 flex-shrink-0 text-amber-400" />
                <span>Your Videos</span>
              </NavLink>

              <NavLink to={`/channel/${user?.username}`} className={navItemClasses}>
                <UserCheck className="w-5 h-5 flex-shrink-0" />
                <span>Your Channel</span>
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" className={navItemClasses}>
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
                  <span className="text-red-400 font-semibold">Admin Panel</span>
                </NavLink>
              )}
            </>
          )}

          <NavLink to="/settings" className={navItemClasses}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* User Playlists Quick List */}
        {isAuthenticated && userPlaylists.length > 0 && (
          <>
            <hr className="border-[#272727]" />
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#aaaaaa] flex items-center justify-between">
                <span>Playlists</span>
                <span className="text-[10px] text-[#717171]">{userPlaylists.length}</span>
              </div>
              {userPlaylists.map((pl) => (
                <NavLink
                  key={pl._id}
                  to={`/playlist/${encodeId(pl._id)}`}
                  className={navItemClasses}
                >
                  <ListMusic className="w-4 h-4 flex-shrink-0 text-[#aaaaaa]" />
                  <span className="truncate text-sm">{pl.name}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}

        {/* Subscriptions List */}
        {isAuthenticated && subscribedChannels.length > 0 && (
          <>
            <hr className="border-[#272727]" />
            <div className="flex flex-col gap-1">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#aaaaaa]">
                Subscriptions ({subscribedChannels.length})
              </div>
              {subscribedChannels.map((sub) => (
                <NavLink
                  key={sub._id}
                  to={`/channel/${sub.channel?.username}`}
                  className={navItemClasses}
                >
                  <Avatar
                    src={sub.channel?.avatar}
                    alt={sub.channel?.fullname || sub.channel?.username}
                    size="xs"
                  />
                  <span className="truncate text-sm">
                    {sub.channel?.fullname || sub.channel?.username}
                  </span>
                </NavLink>
              ))}
            </div>
          </>
        )}

        {/* Footer info */}
        <div className="mt-auto px-3 py-4 text-xs text-[#717171] flex flex-col gap-2">
          <p>© 2026 NoAdTube • Ad-Free Video Streaming Platform</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <span>About</span>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </aside>

      {/* Mini Collapsed Sidebar (Desktop Only when closed) */}
      {!isSidebarOpen && (
        <aside className="hidden lg:flex fixed top-14 left-0 bottom-0 z-20 w-18 bg-[#0f0f0f] border-r border-[#272727] flex-col items-center py-2 px-1 gap-2 select-none">
          <NavLink to="/" end className={miniNavItemClasses}>
            <Home className="w-5 h-5" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/tweets" className={miniNavItemClasses}>
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <span>Tweets</span>
          </NavLink>

          <NavLink to="/subscriptions" className={miniNavItemClasses}>
            <Tv className="w-5 h-5 text-red-500" />
            <span>Subs</span>
          </NavLink>

          <NavLink to="/playlists" className={miniNavItemClasses}>
            <ListMusic className="w-5 h-5 text-red-500" />
            <span>Playlists</span>
          </NavLink>

          <NavLink to="/history" className={miniNavItemClasses}>
            <History className="w-5 h-5" />
            <span>History</span>
          </NavLink>

          <NavLink to="/liked" className={miniNavItemClasses}>
            <ThumbsUp className="w-5 h-5 text-emerald-400" />
            <span>Liked</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/my-videos" className={miniNavItemClasses}>
              <PlaySquare className="w-5 h-5 text-amber-400" />
              <span>Studio</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={miniNavItemClasses}>
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span className="text-red-400">Admin</span>
            </NavLink>
          )}
        </aside>
      )}
    </>
  );
};
