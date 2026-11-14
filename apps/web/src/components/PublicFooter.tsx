'use client';
import Link from 'next/link';

export function PublicFooter() {
    return (
        <footer className="relative z-10 w-full mt-auto py-6 backdrop-blur-sm bg-black/20 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Links */}
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-300">

                    {/* Product/Help */}
                    <div className="flex items-center gap-x-4">
                        <Link href="/help" className="hover:text-spaas-blue transition-colors">Help Center</Link>
                        <span className="text-gray-600">·</span>
                        <Link href="/status" className="hover:text-spaas-blue transition-colors">System Status</Link>
                    </div>

                    <span className="text-gray-600 hidden sm:inline">|</span>

                    {/* Legal */}
                    <div className="flex items-center gap-x-4">
                        <Link href="/terms" className="hover:text-spaas-blue transition-colors">Terms of Service</Link>
                        <span className="text-gray-600">·</span>
                        <Link href="/privacy" className="hover:text-spaas-blue transition-colors">Privacy Policy</Link>
                        <span className="text-gray-600">·</span>
                        <Link href="/cookies" className="hover:text-spaas-blue transition-colors">Cookie Policy</Link>
                    </div>

                    <span className="text-gray-600 hidden sm:inline">|</span>

                    {/* Company */}
                    <div className="flex items-center gap-x-4">
                        <Link href="/about" className="hover:text-spaas-blue transition-colors">About Us</Link>
                        <span className="text-gray-600">·</span>
                        <a href="mailto:hello@quickie-studio.com" className="hover:text-spaas-blue transition-colors">Contact Support</a>
                    </div>
                </div>

                {/* Copyright Line */}
                <div className="mt-4 text-center text-[10px] sm:text-xs text-gray-400">
                    &copy; 2026 SPAAS · Quickie Studio. All rights reserved.
                </div>

            </div>
        </footer>
    );
}