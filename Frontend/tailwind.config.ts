import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			brand: {
  				primary: '#0F172A',
  				secondary: '#14BEFF',
  				accent: '#3F6EFF'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			success: {
  				DEFAULT: '#10B981',
  				foreground: '#FFFFFF'
  			},
  			warning: {
  				DEFAULT: '#F59E0B',
  				foreground: '#FFFFFF'
  			},
  			info: {
  				DEFAULT: '#3B82F6',
  				foreground: '#FFFFFF'
  			}
  		},
  		fontSize: {
  			'heading-xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
  			'heading-lg': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
  			'heading-md': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
  			'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
  			'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
  			'label': ['0.875rem', { letterSpacing: '0.02em', fontWeight: '500' }],
  			'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
  		},
  		fontFamily: {
  			heading: [
  				'var(--font-dm-sans)',
  				'sans-serif'
  			],
  			body: [
  				'var(--font-inter)',
  				'sans-serif'
  			],
  			mono: [
  				'"JetBrains Mono"',
  				'"Courier New"',
  				'monospace'
  			]
  		},
  		letterSpacing: {
  			'tight-headings': '-0.02em',
  			'wide-labels': '0.05em',
  		},
  		lineHeight: {
  			'relaxed-body': '1.7',
  			'tight-headings': '1.2',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		backgroundImage: {
  			'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
  			'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  			'gradient-gains': 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
  			'gradient-losses': 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
  			'gradient-warning': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  			'gradient-premium': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  			'gradient-neutral': 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
