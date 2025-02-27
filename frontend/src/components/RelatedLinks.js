import { Link } from "react-router-dom";

export default function RelatedLinks({ links }) {
  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Related</h3>
      <ul className="flex gap-4">
        {links.map(link => <Link className="text-primary hover:underline" key={link.to} to={link.to} >{link.title} &rarr;</Link>)}
      </ul>
    </div>
  )
}