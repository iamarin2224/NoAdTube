import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Video, 
  Plus, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  PlaySquare, 
  History, 
  ThumbsUp, 
  X,
  Tv,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { videoApi } from '../../api/video.api';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleSidebar, openUploadModal } = useUI();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search_query') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('search_query') || '');
  }, [searchParams]);

  // Debounced search suggestions query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      videoApi.getAllVideos({ query: searchQuery.trim(), limit: 5 })
        .then((res) => {
          if (res.success && res.data) {
            setSuggestions(res.data);
          }
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/results?search_query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSelectSuggestion = (title) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    navigate(`/results?search_query=${encodeURIComponent(title)}`);
  };

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#272727]">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 text-[#f1f1f1] hover:bg-[#272727] rounded-full transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-1.5 group select-none">
          <div className="relative flex items-center justify-center w-8 h-7 bg-red-600 rounded-lg shadow-md group-hover:scale-105 transition-transform">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            NoAd<span className="text-red-500 font-extrabold">Tube</span>
          </span>
        </Link>
      </div>

      {/* Middle Debounced Search Section */}
      <div className="flex-1 max-w-2xl mx-4 hidden sm:block relative" ref={searchContainerRef}>
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search title, creator, or keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#121212] text-[#f1f1f1] placeholder-[#717171] text-sm px-4 py-2 border border-[#303030] rounded-l-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 p-1 text-[#aaaaaa] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            aria-label="Search"
            className="px-6 py-2 bg-[#222222] hover:bg-[#272727] text-[#f1f1f1] border border-l-0 border-[#303030] rounded-r-full transition-colors flex items-center justify-center"
          >
            <Search className="w-4 h-4 text-[#aaaaaa]" />
          </button>
        </form>

        {/* Debounced Search Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-14 top-full mt-1 bg-[#222222] border border-[#303030] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-100">
            {suggestions.map((item) => (
              <div
                key={item._id}
                onClick={() => handleSelectSuggestion(item.title)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#2e2e2e] cursor-pointer text-sm text-[#f1f1f1] transition-colors"
              >
                <Search className="w-4 h-4 text-[#717171] flex-shrink-0" />
                <span className="truncate">{item.title}</span>
                {item.owner?.username && (
                  <span className="text-xs text-[#717171] ml-auto">@{item.owner.username}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mobile search button */}
        <button
          onClick={() => {
            const query = prompt('Search NoAdTube:');
            if (query) navigate(`/results?search_query=${encodeURIComponent(query)}`);
          }}
          className="sm:hidden p-2 text-[#f1f1f1] hover:bg-[#272727] rounded-full"
        >
          <Search className="w-5 h-5" />
        </button>

        {isAuthenticated ? (
          <>
            {/* Create / Upload button */}
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={openUploadModal}
              className="hidden md:inline-flex bg-[#272727] hover:bg-[#3f3f3f] text-[#f1f1f1] font-medium"
            >
              Create
            </Button>

            <button
              onClick={openUploadModal}
              title="Upload video"
              className="md:hidden p-2 text-[#f1f1f1] hover:bg-[#272727] rounded-full transition-colors"
            >
              <Video className="w-5 h-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-red-500 transition-all focus:outline-none"
              >
                <Avatar
                  src={user?.avatar}
                  alt={user?.fullname || user?.username}
                  size="sm"
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#282828] border border-[#3f3f3f] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-[#3f3f3f] flex items-center gap-3">
                    <Avatar
                      src={user?.avatar}
                      alt={user?.fullname}
                      size="md"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-white truncate">
                        {user?.fullname}
                      </span>
                      <span className="text-xs text-[#aaaaaa] truncate">
                        @{user?.username}
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-2">
                    <Link
                      to={`/channel/${user?.username}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <Tv className="w-4 h-4 text-[#aaaaaa]" />
                      Your Channel
                    </Link>

                    <Link
                      to="/my-videos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <PlaySquare className="w-4 h-4 text-[#aaaaaa]" />
                      NoAdTube Studio (My Videos)
                    </Link>

                    <Link
                      to="/tweets"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-[#aaaaaa]" />
                      Community Tweets
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <History className="w-4 h-4 text-[#aaaaaa]" />
                      Watch History
                    </Link>

                    <Link
                      to="/liked"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4 text-[#aaaaaa]" />
                      Liked Videos
                    </Link>

                    {user?.email?.toLowerCase() === 'noadtube.online@gmail.com' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-[#3f3f3f] font-semibold transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        Admin Panel
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#aaaaaa]" />
                      Settings & Profile
                    </Link>
                  </div>

                  <div className="border-t border-[#3f3f3f] pt-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-[#3f3f3f] hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              icon={UserIcon}
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10 font-medium"
            >
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};
