import Link from 'next/link';
import { getRelatedTools } from '@/lib/tools';

export default function RelatedLinks({ links, currentSlug }) {
  const finalLinks = links || getRelatedTools(currentSlug);
  return (
    <div>
      <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900">Related</h2>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {finalLinks.map(link => (
          <li key={link.to}>
            <Link className="font-medium text-primary underline underline-offset-4 hover:text-primary-500" href={link.to}>
              {link.title} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
