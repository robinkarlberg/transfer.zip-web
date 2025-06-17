import Link from 'next/link';

export default function RelatedLinks({ links }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Related</h2>
      <ul className="flex gap-4">
        {links.map(link => <Link className="text-primary hover:underline" key={link.to} href={link.to} >{link.title} &rarr;</Link>)}
      </ul>
    </div>
  )
}