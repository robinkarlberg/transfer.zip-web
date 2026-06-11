import BIcon from "./BIcon"
// import ProductDemoScreenshot from "@/img/ProductDemoScreenshot.png"
import logo from "@/img/icon.png"
import { ChartBarIcon, ChevronsUpIcon, FileArchiveIcon, LinkIcon, LockIcon, RotateCcw, RotateCwIcon, UserIcon } from "lucide-react";
import Image from "next/image"
import Link from "next/link";

const features = [
  // {
  //   name: 'Privacy First',
  //   description: 'Your privacy matters. User data is securely hosted in the EU, keeping your life safe and private.',
  //   icon: 'shield-check',
  // },
  // {
  //   name: 'No Limits',
  //   description: "Easily transfer massive files without ever hitting a limit.",
  //   icon: 'arrow-clockwise',
  // },
  // {
  //   name: 'Files Available All Year',
  //   description: 'Your files stay accessible all year. No more expiry anxiety.',
  //   icon: 'calendar',
  // },
  {
    name: 'Custom Branding',
    description: 'Make every transfer your own. Add your logo, background and domain for a great look.',
    icon: UserIcon,
  },
  {
    name: 'Familiar Links',
    description: "All links end with .zip - a familiar sight for people used to working with files.",
    icon: LinkIcon,
  },
  // {
  //   name: 'Resumable Uploads',
  //   description: 'Transfers interrupted? No worries. Easily resume uploads when your network goes down.',
  //   icon: 'arrow-clockwise',
  // },
  {
    name: 'Made for RAW and 8k',
    description: 'Gigabit speeds mean less waiting for files to send, and more time working on what matters.',
    icon: ChevronsUpIcon,
  },
  {
    name: 'Ultimate Trust & Security',
    description: <>All file data is stored encrypted, and the source code is fully open. <Link target="_blank" className="text-primary hover:underline whitespace-nowrap" href="https://github.com/robinkarlberg/transfer.zip-web">See the code on GitHub &rarr;</Link></>,
    icon: LockIcon,
  },
];

export default function Features1() {

  return (
    <div className="bg-white py-24 sm:py-32" id="why-choose-us">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* <Image alt="Logo" src={logo} className="w-16 mx-auto"></Image> */}
          <h2 className="text-base/7 font-semibold text-primary">File-sharing for Pros</h2>
          {/* <div className="text-blue-500 mb-4">{[1, 2, 3, 4, 5].map(i => <BIcon key={i} name={"star-fill"} />)}</div> */}
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            Look{" "}
            <span className="relative">
              <span className="relative z-10">professional</span>
              <svg
                className="absolute left-0 bottom-[0.1em] w-full text-primary-500"
                style={{ height: "0.2em" }}
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 15 C 20 22, 40 5, 60 12 S 90 18, 98 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ vectorEffect: "non-scaling-stroke" }}
                />
              </svg>
            </span>
            {" "}when sharing files.
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Your clients get a fast download page with your brand on it. You get a price that doesn't double overnight.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-lg font-bold text-gray-900">
                  <div className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-primary text-white">
                    <feature.icon size={16}/>
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto mt-16">
          <video
            // autoPlay
            width={2432}
            height={1442}
            className="mx-auto rounded-xl w-full max-w-4xl"
            loop
            controls
            // preload="none"
            poster={"/img/ProductDemoScreenshot.png"}
          >
            <source src={"/img/ProductDemo.mp4"} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  )
}
