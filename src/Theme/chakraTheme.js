import { extendTheme } from '@chakra-ui/react';

// Clean, minimal, light toast styling with subtle texture
const toastBaseStyle = {
    bg: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: '8px',
    boxShadow: `
    0 4px 24px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04)
  `,
    color: '#1f2937',
    fontFamily: "'Urbanist', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    // Subtle texture overlay for focus
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.01) 0%, transparent 50%)
    `,
        borderRadius: '8px',
        zIndex: -1,
        opacity: 0.6,
    },

    // Smooth entrance animation
    '@keyframes slideInRight': {
        '0%': {
            transform: 'translateX(100%)',
            opacity: 0,
        },
        '100%': {
            transform: 'translateX(0)',
            opacity: 1,
        },
    },

    animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

const liquidGlassTheme = extendTheme({
    styles: {
        global: {
            // Global toast container styles
            '.chakra-toast__inner': {
                background: 'transparent !important',
            },

            // Global animations for smooth toast interactions
            '@keyframes spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' }
            },

            '@keyframes slideInRight': {
                '0%': {
                    transform: 'translateX(100%) scale(0.9)',
                    opacity: 0,
                },
                '100%': {
                    transform: 'translateX(0) scale(1)',
                    opacity: 1,
                },
            },

            '@keyframes slideOutRight': {
                '0%': {
                    transform: 'translateX(0) scale(1)',
                    opacity: 1,
                },
                '100%': {
                    transform: 'translateX(100%) scale(0.9)',
                    opacity: 0,
                },
            },

            // Enhanced toast positioning and smooth dismissal
            '.chakra-toast': {
                '&[data-status="success"], &[data-status="error"], &[data-status="info"], &[data-status="loading"]': {
                    '&.chakra-toast--closing': {
                        animation: 'slideOutRight 0.3s cubic-bezier(0.4, 0, 1, 1) forwards',
                    }
                }
            }
        }
    },
    components: {
        Alert: {
            variants: {
                // Success toast - minimal with subtle focus texture
                'solid-success': {
                    container: {
                        ...toastBaseStyle,
                        '&::before': {
                            background: `
                radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                radial-gradient(circle at 85% 85%, rgba(0, 0, 0, 0.015) 0%, transparent 50%)
              `,
                            borderRadius: '8px',
                            zIndex: -1,
                            opacity: 0.8,
                        },
                    },
                    title: {
                        color: '#111827',
                        fontWeight: '600',
                        fontSize: '15px',
                        marginBottom: '4px',
                        letterSpacing: '-0.02em',
                    },
                    description: {
                        color: '#4b5563',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontWeight: '400',
                    },
                    icon: {
                        display: 'none',
                    }
                },

                // Error toast - minimal with subtle focus texture
                'solid-error': {
                    container: {
                        ...toastBaseStyle,
                        '&::before': {
                            background: `
                radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                radial-gradient(circle at 85% 85%, rgba(0, 0, 0, 0.015) 0%, transparent 50%)
              `,
                            borderRadius: '8px',
                            zIndex: -1,
                            opacity: 0.8,
                        },
                    },
                    title: {
                        color: '#111827',
                        fontWeight: '600',
                        fontSize: '15px',
                        marginBottom: '4px',
                        letterSpacing: '-0.02em',
                    },
                    description: {
                        color: '#4b5563',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontWeight: '400',
                    },
                    icon: {
                        display: 'none',
                    }
                },

                // Info toast - minimal with subtle focus texture
                'solid-info': {
                    container: {
                        ...toastBaseStyle,
                        '&::before': {
                            background: `
                radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                radial-gradient(circle at 85% 85%, rgba(0, 0, 0, 0.015) 0%, transparent 50%)
              `,
                            borderRadius: '8px',
                            zIndex: -1,
                            opacity: 0.8,
                        },
                    },
                    title: {
                        color: '#111827',
                        fontWeight: '600',
                        fontSize: '15px',
                        marginBottom: '4px',
                        letterSpacing: '-0.02em',
                    },
                    description: {
                        color: '#4b5563',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontWeight: '400',
                    },
                    icon: {
                        display: 'none',
                    }
                },

                // Warning toast - minimal with subtle focus texture
                'solid-warning': {
                    container: {
                        ...toastBaseStyle,
                        '&::before': {
                            background: `
                radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                radial-gradient(circle at 85% 85%, rgba(0, 0, 0, 0.015) 0%, transparent 50%)
              `,
                            borderRadius: '8px',
                            zIndex: -1,
                            opacity: 0.8,
                        },
                    },
                    title: {
                        color: '#111827',
                        fontWeight: '600',
                        fontSize: '15px',
                        marginBottom: '4px',
                        letterSpacing: '-0.02em',
                    },
                    description: {
                        color: '#4b5563',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontWeight: '400',
                    },
                    icon: {
                        display: 'none',
                    }
                },

                // Loading toast - minimal with subtle pulse animation
                'solid-loading': {
                    container: {
                        ...toastBaseStyle,
                        '&::before': {
                            background: `
                radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
                radial-gradient(circle at 85% 85%, rgba(0, 0, 0, 0.015) 0%, transparent 50%)
              `,
                            borderRadius: '8px',
                            zIndex: -1,
                            opacity: 0.8,
                            animation: 'pulseGentle 2s ease-in-out infinite',
                        },

                        '@keyframes pulseGentle': {
                            '0%, 100%': {
                                opacity: 0.8,
                            },
                            '50%': {
                                opacity: 0.6,
                            },
                        },
                    },
                    title: {
                        color: '#111827',
                        fontWeight: '600',
                        fontSize: '15px',
                        marginBottom: '4px',
                        letterSpacing: '-0.02em',
                    },
                    description: {
                        color: '#4b5563',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontWeight: '400',
                    },
                    icon: {
                        display: 'none',
                    }
                }
            }
        }
    },
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
});

export default liquidGlassTheme; 