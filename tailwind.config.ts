import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-primary)',
        panel: 'var(--bg-secondary)',
        ink: 'var(--text-primary)',
        soft: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
        subtle: 'var(--border)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', 'serif'],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        30: '7.5rem',
      },
    },
  },
  plugins: [],
}

export default config
