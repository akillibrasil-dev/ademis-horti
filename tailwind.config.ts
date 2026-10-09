import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { akilli: '#f79633', graphite: '#666666' } } },
  plugins: [],
};

export default config;
