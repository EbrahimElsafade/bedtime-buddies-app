import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
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
				// Wonder World custom colors - vibrant purples and complementary colors
				wonder: {
					DEFAULT: '#0EA5E9', // Bright blue - main brand color
					light: '#38BDF8', // Light blue
					dark: '#0284C7', // Dark blue
				},
				magic: {
					DEFAULT: '#10B981', // Green for magic/nature
					light: '#34D399', // Light green
					dark: '#059669', // Dark green
				},
				joy: {
					DEFAULT: '#F59E0B', // Warm orange for joy/excitement
					light: '#FBBF24', // Light orange
					dark: '#D97706', // Dark orange
				},
				adventure: {
					DEFAULT: '#8B5CF6', // Purple for adventure/creativity
					light: '#A78BFA', // Light purple
					dark: '#7C3AED', // Dark purple
				},
				dream: {
					DEFAULT: '#8B5CF6', // Purple for dreams/creativity
					light: '#A78BFA', // Light purple
					dark: '#7C3AED', // Dark purple
				},
				sunshine: {
					DEFAULT: '#EAB308', // Bright yellow for sunshine/happiness
					light: '#FACC15', // Light yellow
					dark: '#CA8A04', // Dark yellow
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
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				'sparkle': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.7', transform: 'scale(1.1)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'33%': { transform: 'translateY(-10px) rotate(1deg)' },
					'66%': { transform: 'translateY(-5px) rotate(-1deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bounce-gentle': 'bounce-gentle 3s ease-in-out infinite',
				'sparkle': 'sparkle 2s ease-in-out infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite'
			},
			fontFamily: {
				'bubbly': ['Bubblegum Sans', 'cursive'],
				'rounded': ['Varela Round', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
