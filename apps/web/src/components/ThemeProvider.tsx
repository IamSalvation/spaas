'use client';
import { ThemeProvider as NextThemesProvider, type Attribute } from 'next-themes';

interface Props {
    children: React.ReactNode;
    attribute?: Attribute | Attribute[];
    defaultTheme?: string;
    enableSystem?: boolean;
}

export function ThemeProvider({ children, ...props }: Props) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}