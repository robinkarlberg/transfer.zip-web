import Link from 'next/link';
import { getRelatedTools } from '@/lib/tools';

export default function RelatedLinks({ links, currentSlug }) {
  const finalLinks = links || getRelatedTools(currentSlug);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Related</h2>
      <ul className="flex gap-4 flex-wrap">
        {finalLinks.map(link => (
          <Link className="text-primary hover:underline" key={link.to} href={link.to}>
            {link.title} &rarr;
          </Link>
        ))}
      </ul>
    </div>
  );
}