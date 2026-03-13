import React, { useState, useEffect } from 'react';
import ApplicationLogo from './ApplicationLogo';

export const SplashWelcome = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const hasSeenSplash = sessionStorage.getItem('ve_splash_seen');
        if (!hasSeenSplash) {
            setShouldRender(true);
            setIsVisible(true);
            sessionStorage.setItem('ve_splash_seen', 'true');
            
            // Start fade out after 3 seconds
            const fadeTimer = setTimeout(() => {
                setIsVisible(false);
            }, 3000);
            
            // Unmount after animation finishes (3.5s)
            const unmountTimer = setTimeout(() => {
                setShouldRender(false);
            }, 3500);
            
            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(unmountTimer);
            };
        }
    }, []);

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a] transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Logo with scaling and glow effect */}
                <div className="relative mb-10 group">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-3xl scale-150 animate-pulse duration-[2000ms]" />
                    <div className="relative z-10 p-6 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10 shadow-2xl transform transition-transform duration-1000 animate-in zoom-in-50 slide-in-from-bottom-12">
                        <ApplicationLogo className="w-24 h-24 md:w-32 md:h-32 text-white fill-current drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                </div>

                {/* Text lines */}
                <div className="text-center space-y-4">
                    <div className="overflow-hidden">
                        <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter italic animate-in slide-in-from-bottom-full duration-1000 delay-300 fill-mode-forwards">
                            VECODE
                        </h1>
                    </div>
                    
                    <div className="relative">
                        <div className="h-[2px] w-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent m-auto animate-[grow_1.5s_ease-in-out_forwards_delay-800]" />
                    </div>

                    <div className="overflow-hidden">
                        <p className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] animate-in slide-in-from-top-full duration-1000 delay-1200 fill-mode-forwards opacity-80">
                            Pro-Agroindustria S.A. de C.V.
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes grow {
                    0% { width: 0; opacity: 0; }
                    50% { opacity: 1; }
                    100% { width: 280px; opacity: 1; }
                }
                .fill-mode-forwards {
                    animation-fill-mode: forwards;
                }
                .delay-1000 { animation-delay: 1000ms; }
                .delay-1200 { animation-delay: 1200ms; }
            `}} />
        </div>
    );
};
