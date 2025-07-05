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
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <p className="text-base font-semibold leading-7 text-primary"><Link href="/legal">Tools</Link></p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Free Online Tools</h1>
        <ul className="list-disc ms-5 text-lg space-y-2 mt-8">
          {tools.map(t => (
            <li key={t.slug}><Link href={`/tools/${t.slug}`} className="text-primary hover:underline">{t.title}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
