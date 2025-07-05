import Link from 'next/link';

import logo from "@/img/icon.png";
import BIcon from "./BIcon";
import Image from 'next/image';
import { tools } from '@/lib/tools';

export default function Footer({ }) {
  return (
    // I do NOT know why the key= trick works I just tried it and it seems to fix the scroll bug LMAOOOOO
    // Edit: didnt work
    <footer className="bg-white --dark:bg-gray-900 z-10 relative" key={"fix-scroll-bug-asdf"}>
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="#" className="flex items-center">
              <Image src={logo} className="w-8 h-8 me-1" alt="Company Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap --dark:text-white">{process.env.NEXT_PUBLIC_SITE_NAME}</span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <h5 className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white">Tools</h5>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                {tools.map(t => (
                  <li key={t.slug} className="mb-4">
                    <Link href={`/tools/${t.slug}`} className="hover:underline">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white"><a className="hover:underline" href="https://blog.transfer.zip/">Blog</a></h5>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="https://blog.transfer.zip/2025/04/05/how-to-send-large-video-files.html" className="hover:underline ">Send Large Video Files</Link>
                </li>
                {/* <li className="mb-4">
                  <Link href="https://blog.transfer.zip/2025/04/01/android-file-transfer-for-mac.html" className="hover:underline ">Android to Mac File Transfer</Link>
                </li> */}
                <li className="mb-4">
                  <Link href="https://blog.transfer.zip/2025/03/07/how-send-100gb-files-for-free.html" className="hover:underline ">Send 100GB Files Free</Link>
                </li>
                <li>
                  <Link href="https://blog.transfer.zip/2025/03/08/how-send-large-audio-files.html" className="hover:underline">Send Large Audio Files</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white">Resources</h5>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="hover:underline">Contact</a>
                </li>
                <li className="mb-4">
                  <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="hover:underline">Support</a>
                </li>
                <li>
                  <a href="https://github.com/robinkarlberg/transfer.zip-web?tab=readme-ov-file#self-hosting" className="hover:underline">Self Hosting</a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white">Legal</h5>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="/legal/privacy-policy" className="hover:underline">Privacy Policy</Link>
                </li>
                <li className="mb-4">
                  <Link href="/legal/terms-and-conditions" className="hover:underline">Terms</Link>
                </li>
                <li>
                  <Link href="/legal/impressum" className="hover:underline">Impressum</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto --dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center --dark:text-gray-400"><a className="hover:underline" href="#">Shipped with <BIcon name={"heart-fill"} className={"text-red-500"} /></a> from 🇸🇪<BIcon name={"dot"} />&copy; 2025 <a target="_blank" href={process.env.NEXT_PUBLIC_AUTHOR_URL} className="hover:underline">{process.env.NEXT_PUBLIC_AUTHOR}</a>. {/*All Rights Reserved.*/}
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            {process.env.NEXT_PUBLIC_FACEBOOK_URL && <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                <path fillRule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Facebook page</span>
            </a>}
            {process.env.NEXT_PUBLIC_DISCORD_URL && <a href={process.env.NEXT_PUBLIC_DISCORD_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white ms-5">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 21 16">
                <path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
              </svg>
              <span className="sr-only">Discord community</span>
            </a>}
            {process.env.NEXT_PUBLIC_BLUESKY_URL && <a href={process.env.NEXT_PUBLIC_BLUESKY_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white ms-5">
              <BIcon center name={"bluesky"} />
              <span className="sr-only">Bluesky page</span>
            </a>}
            {process.env.NEXT_PUBLIC_TWITTER_URL && <a href={process.env.NEXT_PUBLIC_TWITTER_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white ms-5">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 17">
                <path fillRule="evenodd" d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Twitter page</span>
            </a>}
            {process.env.NEXT_PUBLIC_GITHUB_URL && <a href={process.env.NEXT_PUBLIC_GITHUB_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white ms-5">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">GitHub account</span>
            </a>}
          </div>
        </div>
      </div>
    </footer>

  )
}