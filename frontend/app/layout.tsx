import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
};

export const metadata: Metadata = {
  title: 'SkillAssess — AI Skill Assessment & Personalised Learning Plans',
  description:
    'Know your real skills. Upload your resume and job description, take a brief AI assessment, then get a personalised learning roadmap with curated resources and realistic time estimates.',
  keywords: ['skill assessment', 'AI interview', 'learning plan', 'resume analysis', 'skill gap', 'learning roadmap', 'TDD', 'ZPD'],
  openGraph: {
    title: 'SkillAssess — AI Skill Assessment & Learning Plans',
    description: 'Identify your real skill gaps and get a personalised learning roadmap.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}

