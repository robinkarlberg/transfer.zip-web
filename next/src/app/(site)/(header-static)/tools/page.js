import Link from 'next/link';
import { tools } from '@/lib/tools';

export const metadata = {
  title: "Free Online Tools | Transfer.zip",
  description: "Handy browser tools for zip compression, conversion and more.",
  openGraph: {
    title: "Free Online Tools | Transfer.zip",
    description: "Handy browser tools for zip compression, conversion and more.",
    images: ["https://cdn.transfer.zip/og.png"],
  },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-bold mb-8">Free Online Tools</h1>
      <ul className="list-disc ms-5 text-lg space-y-2">
        {tools.map(t => (
          <li key={t.slug}><Link href={`/tools/${t.slug}`} className="text-primary hover:underline">{t.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}
