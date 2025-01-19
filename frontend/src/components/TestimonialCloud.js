import BIcon from "./BIcon"

const testimonials = [
  {
    quote: "F*****g THANK you. Everyone else has recommended site that all have limits on file size that are just too small for me ...",
    author: "Bravo-Xray",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lj01kxe/"
  },
  {
    quote: "Love how simple and no-BS Transfer.zip is.",
    author: "maddogmdd",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/kilzfob/",
  },
  {
    quote: "... after spending hours browsing for a simple way to send a 23 GB file, this is the answer.",
    author: "amca12006",
    proof: "https://www.reddit.com/r/techsupport/comments/bjqmm6/comment/lgjz9lh/"
  }
]

export default function TestimonialCloud() {
  return (
    <div className="bg-white mb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* <h2 className="text-center text-lg/8 font-semibold text-gray-900">
          Trusted by more than 10k users every month.
        </h2> */}
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-1 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:gap-x-10 lg:mx-0 md:max-w-none md:grid-cols-3">
          {testimonials.map(testimonial => {
            return (
              <div className="col-span-1 text-center">
                <div className="text-primary mb-2">{[1, 2, 3, 4, 5].map(() => <BIcon name={"star-fill"} />)}</div>
                <div className="text-gray-700 mb-2"><p>{testimonial.quote}</p></div>
                <div className="font-bold text-gray-700">
                  <BIcon name={"reddit"} className={"me-1 text-gray-700"} />
                  <a className="hover:underline" href={testimonial.proof}>{testimonial.author}</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
