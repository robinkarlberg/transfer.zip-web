import BIcon from "./BIcon"

const testimonials = [
  {
    quote: "Love how simple and no-BS Transfer.zip is.",
    author: "maddogmdd",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/kilzfob/",
  },
  {
    quote: "After spending hours browsing for a simple way to send a 23 GB file, this is the answer.",
    author: "amca12006",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lgjz9lh/"
  },
  {
    quote: "This is amazing",
    author: "jormaig",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lsqqo1h/"
  },
]

export default function TestimonialCloud({ className }) {
  return (
    <div className={`bg-gray-50 pt-10 mb-8 border border-dashed ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-primary">Our Reviews</h2>
          {/* <div className="text-blue-500 mb-4">{[1, 2, 3, 4, 5].map(i => <BIcon key={i} name={"star-fill"} />)}</div> */}
          <p className="mt-2 text-pretty text-3xl font-bold tracking-tight text-gray-800 sm:text-5xl lg:text-balance">
            Users <BIcon name={"heart-fill"} className={"text-red-400 text-2xl sm:text-4xl"}/> Transfer.zip
          </p>
        </div>
        <div className="mx-auto pb-10 pt-16 grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:gap-x-10 lg:mx-0 md:max-w-none md:grid-cols-3">
          {testimonials.map(testimonial => {
            return (
              <div key={testimonial.proof} className="col-span-1 text-center h-32">
                <div className="text-blue-500 mb-2">{[1, 2, 3, 4, 5].map(i => <BIcon key={i} name={"star-fill"} />)}</div>
                <div className="text-gray-600 mb-2"><p><BIcon name={"quote"} /> {testimonial.quote}</p></div>
                <div className="font-bold text-gray-700">
                  <BIcon name={"reddit"} className={"me-1"} />
                  <a className="hover:underline" target="_blank" href={testimonial.proof}>{testimonial.author}</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
