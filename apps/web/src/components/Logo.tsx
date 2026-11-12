'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LogoProps {
    variant?: 'full' | 'icon';
    href?: string | null;
    height?: number;
}

export function Logo({ variant = 'full', href = '/dashboard', height = 32 }: LogoProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && theme === 'dark';

    const src =
        variant === 'icon'
            ? isDark
                ? '/logo-icon-white.svg'
                : '/logo-icon-dark.svg'
            : isDark
                ? '/logo-full-white.svg'
                : '/logo-full-dark.svg';

    const width = variant === 'icon' ? height : height * 4.5;

    const img = (
        <img
            src={src}
            alt="SPAAS"
            width={Math.round(width)}
            height={height}
            style={{ objectFit: 'contain' }}
        />
    );

    if (href === null) {
        return img;
    }

    return (
        <Link href={href} className="inline-flex items-center">
            {img}
        </Link>
    );
}