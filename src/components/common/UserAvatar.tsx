import React, { useState } from 'react';
import { ShieldCheck, Flame, User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isOfficial?: boolean;
  role?: string;
  showBadge?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-bold',
  xl: 'w-20 h-20 text-xl font-bold',
  '2xl': 'w-28 h-28 text-3xl font-extrabold',
};

const badgeSizeClasses = {
  xs: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
  sm: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
  md: 'w-4 h-4 -bottom-0.5 -right-0.5',
  lg: 'w-5 h-5 -bottom-1 -right-1',
  xl: 'w-6 h-6 -bottom-1 -right-1',
  '2xl': 'w-8 h-8 -bottom-1.5 -right-1.5',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = 'Usuario',
  size = 'md',
  className = '',
  isOfficial = false,
  role = 'user',
  showBadge = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute initials
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'JA';

  const isSuperOrAdmin = role === 'admin' || role === 'superadmin' || isOfficial;

  // Detect whether avatar is real or should use fallback
  // Unsplash photos and stock placeholders are fake demo assets, not authentic user photos
  const isFakeStockPhoto = Boolean(
    avatar && (
      avatar.includes('images.unsplash.com') ||
      avatar.includes('unsplash.com') ||
      avatar.includes('placeholder')
    )
  );

  const hasValidPhoto = Boolean(
    avatar &&
    avatar.trim() !== '' &&
    !imageError &&
    !isFakeStockPhoto
  );

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      {hasValidPhoto ? (
        <img
          src={avatar!}
          alt={name}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover border border-slate-700/60 shadow-sm"
        />
      ) : (
        <div 
          className={`w-full h-full rounded-full flex items-center justify-center font-bold text-slate-100 shadow-inner select-none ${
            isSuperOrAdmin
              ? 'bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-500 border border-amber-400/40 text-white'
              : 'bg-gradient-to-tr from-slate-800 via-blue-900 to-slate-700 border border-blue-400/30 text-amber-200'
          }`}
          title={name}
        >
          {initials.length > 0 ? initials : <UserIcon className="w-1/2 h-1/2 opacity-75" />}
        </div>
      )}

      {showBadge && isSuperOrAdmin && (
        <div
          className={`absolute rounded-full flex items-center justify-center bg-amber-500 text-slate-950 shadow-md border-2 border-slate-950 ${badgeSizeClasses[size]}`}
          title="Verificado Oficial / Administrador"
        >
          <Flame className="w-2/3 h-2/3 fill-slate-950 text-slate-950" />
        </div>
      )}
    </div>
  );
};
