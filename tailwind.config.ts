import type { Config } from "tailwindcss";

export default {
	
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
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
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Dalfoon custom colors
				ocean: {
					DEFAULT: '#00A8E8', // Aqua Blue - main ocean color
					light: '#7DD3FC', // Light aqua blue
					dark: '#0369A1', // Deep ocean blue
					surface: '#E0F7FA', // Very light aqua for surfaces
				},
				coral: {
					DEFAULT: '#FF6B9D', // Coral Pink - primary accent
					light: '#FFB3D1', // Light coral pink
					dark: '#E91E63', // Deep coral
					soft: '#FFF0F5', // Very light coral for backgrounds
				},
				sunshine: {
					DEFAULT: '#FFD93D', // Sun Glow Orange/Yellow
					light: '#FFF59D', // Light sunshine yellow
					dark: '#F59E0B', // Deeper sun orange
					glow: '#FFFBEB', // Very light sunshine for highlights
				},
				wave: {
					DEFAULT: '#B8E6FF', // Soft wave blue
					light: '#E6F7FF', // Very light wave
					dark: '#4FC3F7', // Deeper wave blue
				}
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
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'bubble': {
					'0%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
					'50%': { transform: 'translateY(-20px) scale(1.1)', opacity: '1' },
					'100%': { transform: 'translateY(-40px) scale(0.8)', opacity: '0' }
				},
				'wave': {
					'0%, 100%': { transform: 'translateX(0)' },
					'50%': { transform: 'translateX(20px)' }
				},
				'splash': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'50%': { transform: 'scale(1.2)', opacity: '1' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'bubble': 'bubble 3s ease-in-out infinite',
				'wave': 'wave 4s ease-in-out infinite',
				'splash': 'splash 0.6s ease-out'
			},
			fontFamily: {
				'bubbly': ['Bubblegum Sans', 'cursive'],
				'rounded': ['Varela Round', 'sans-serif'],
				'cairo': ['Cairo', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
