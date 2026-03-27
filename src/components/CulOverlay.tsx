import React, { useEffect, useRef, useState } from 'react';

interface CulOverlayProps {
    show: boolean;
    isPlayerTeam: boolean;
    teamColors?: [string, string];
    onDone: () => void;
}

export const CulOverlay: React.FC<CulOverlayProps> = ({ show, isPlayerTeam, teamColors, onDone }) => {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    useEffect(() => {
        if (!show) return;
        setVisible(true);
        setLeaving(false);

        const leaveTimer = setTimeout(() => setLeaving(true), 1100);
        const doneTimer = setTimeout(() => {
            setVisible(false);
            setLeaving(false);
            onDoneRef.current();
        }, 1550);

        return () => {
            clearTimeout(leaveTimer);
            clearTimeout(doneTimer);
        };
    }, [show]);

    if (!visible) return null;

    const primaryColor = teamColors?.[0] ?? (isPlayerTeam ? '#10b981' : '#ef4444');
    const glowColor = primaryColor + '99';
    const bgGradient = isPlayerTeam
        ? 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(0,0,0,0.6) 70%)'
        : 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(0,0,0,0.6) 70%)';

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
            style={{ background: bgGradient }}
        >
            <div
                className={leaving ? 'animate-cul-leave' : 'animate-cul-enter'}
                style={{ textAlign: 'center' }}
            >
                <div
                    style={{
                        fontSize: 'clamp(6rem, 20vw, 14rem)',
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                        color: primaryColor,
                        textShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor}, 4px 4px 0 rgba(0,0,0,0.6)`,
                        WebkitTextStroke: `2px rgba(255,255,255,0.15)`,
                    }}
                >
                    CÚL!
                </div>
                <div
                    style={{
                        fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                        fontWeight: 700,
                        color: 'white',
                        marginTop: '0.5rem',
                        textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                        opacity: 0.95,
                    }}
                >
                    {isPlayerTeam ? '⬆️ Ar Aghaidh linn!' : '😬 Cúl don namhaid!'}
                </div>
            </div>
        </div>
    );
};
