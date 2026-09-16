import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, X, User } from 'lucide-react';
import { userApi } from '../lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  username: string;
}

interface UserSearchProps {
  onSelectUser: (user: User) => void;
  excludeUserIds?: number[];
  placeholder?: string;
  disabled?: boolean;
}

export default function UserSearch({
  onSelectUser,
  excludeUserIds = [],
  placeholder = 'Search users by name, username, or email...',
  disabled = false,
}: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.searchUsers(searchQuery, 10);
      const users = response.data.data || [];
      
      // Filter out excluded users
      const filteredUsers = users.filter(
        (user: User) => !excludeUserIds.includes(user.id)
      );
      
      setResults(filteredUsers);
      setIsOpen(filteredUsers.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Failed to search users:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, [excludeUserIds]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectUser = (user: User) => {
    console.log('[UserSearch] handleSelectUser called with:', user);
    onSelectUser(user);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelectUser(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search
          size={16}
          className="absolute left3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
          style={{ left: '12px' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field pl-9 pr-8 text-xs w-full"
        />
        {query && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors"
            disabled={disabled}
          >
            <X size={14} />
          </button>
        )}
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary animate-spin"
          />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-dark-bg border border-white/10 rounded-md shadow-xl z-10 overflow-hidden max-h-64 overflow-y-auto">
          {results.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className={`w-full px-3 py-2 text-left transition-all flex items-center gap-3 ${
                index === highlightedIndex
                  ? 'bg-primary/20 text-white'
                  : 'text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
                {user.name ? getInitials(user.name) : <User size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user.name || 'Unknown'}
                </p>
                <p className="text-[10px] text-secondary truncate">
                  @{user.username}
                </p>
                <p className="text-[10px] text-secondary truncate">
                  {user.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-dark-bg border border-white/10 rounded-md shadow-xl z-10 p-3">
          <p className="text-xs text-secondary text-center">No users found</p>
        </div>
      )}
    </div>
  );
}
