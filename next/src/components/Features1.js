import BIcon from "./BIcon"
// import ProductDemoScreenshot from "@/img/ProductDemoScreenshot.png"
import logo from "@/img/icon.png"
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
    name: 'Chapter Heraldry',
    description: "Display your Chapter's colors with pride. Add your sigil and livery to every transmission.",
    icon: 'person',
  },
  {
    name: 'Unbreakable Vox-links',
    description: "Vox-link severed? Fear not. The Machine Spirit will ensure your transmission is completed.",
    icon: 'arrow-clockwise',
  },
  // {
  //   name: 'Resumable Uploads',
  //   description: 'Transfers interrupted? No worries. Easily resume uploads when your network goes down.',
  //   icon: 'arrow-clockwise',
  // },
  {
    name: 'Battlefield Intelligence',
    description: 'Know when your decrees have been received and your orders followed, with precise intelligence.',
    icon: 'bar-chart',
  },
  {
    name: 'For the Omnissiah',
    description: <>The sacred code is open to all Tech-Priests on GitHub. <Link className="text-primary hover:underline whitespace-nowrap" href="https://github.com/robinkarlberg/transfer.zip-web">Praise the Omnissiah! &rarr;</Link></>,
    icon: 'github',
  },
];

export default function Features1() {

  return (
    <div className="bg-white py-24 sm:py-32" id="why-choose-us">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* <Image alt="Logo" src={logo} className="w-16 mx-auto"></Image> */}
          <h2 className="text-base/7 font-semibold text-primary">Why Serve the Emperor?</h2>
          {/* <div className="text-blue-500 mb-4">{[1, 2, 3, 4, 5].map(i => <BIcon key={i} name={"star-fill"} />)}</div> */}
          <p className="mt-2 text-pretty text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            For the Glory of the Imperium. No Heresy.
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">
            Banish slow transmissions, restricted data-tethers, and exorbitant tithes. Serve the Emperor with seamless data-transfer, without bankrupting your Chapter.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-lg font-bold text-gray-900">
                  <div className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <BIcon center name={feature.icon} aria-hidden="true" className="size-6 text-white" />
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
