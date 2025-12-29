'use client';

import { type FC } from 'react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: 'active' | 'idle' | 'offline';
}

interface UserPresenceProps {
  users: User[];
}

export const UserPresence: FC<UserPresenceProps> = ({ users }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
            ) : (
              user.name.slice(0, 2).toUpperCase()
            )}
          </div>
        ))}
        {users.length > 3 && (
          <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-semibold">
            +{users.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};
