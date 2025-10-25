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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
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
				// Dolphoon custom colors - using HSL for proper theme integration
				ocean: {
					DEFAULT: 'hsl(198, 100%, 46%)', // Aqua Blue - main ocean color
					light: 'hsl(199, 95%, 74%)', // Light aqua blue
					dark: 'hsl(201, 96%, 32%)', // Deep ocean blue
					surface: 'hsl(187, 68%, 94%)', // Very light aqua for surfaces
				},
				coral: {
					DEFAULT: 'hsl(341, 100%, 70%)', // Coral Pink - primary accent
					light: 'hsl(341, 100%, 85%)', // Light coral pink
					dark: 'hsl(340, 82%, 52%)', // Deep coral
					soft: 'hsl(340, 100%, 97%)', // Very light coral for backgrounds
				},
				sunshine: {
					DEFAULT: 'hsl(48, 100%, 62%)', // Sun Glow Orange/Yellow
					light: 'hsl(54, 100%, 80%)', // Light sunshine yellow
					dark: 'hsl(38, 92%, 50%)', // Deeper sun orange
					glow: 'hsl(48, 100%, 97%)', // Very light sunshine for highlights
				},
				wave: {
					DEFAULT: 'hsl(199, 100%, 85%)', // Soft wave blue
					light: 'hsl(199, 100%, 95%)', // Very light wave
					dark: 'hsl(199, 92%, 64%)', // Deeper wave blue
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
