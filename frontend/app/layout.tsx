import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillAssess — AI-Powered Skill Assessment & Learning Plans',
  description:
    'Validate your real technical skills with AI-powered conversational assessment. Get personalized learning plans to close your skill gaps.',
  keywords: ['skill assessment', 'AI interview', 'learning plan', 'resume analysis', 'skill gap'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
