import LanguageSwitch from "./LanguageSwitch";
import { englishLandingText } from "@/lib/landing/en";
import { RECEIVE_PATHS } from "@/lib/landing/routes";
import Link from "next/link";

import logo from "@/img/icon.png";
import BIcon from "./BIcon";
import Image from 'next/image';
import { tools } from '@/lib/tools';

export default function Footer({ homeHref = "/", text = englishLandingText.footer, showLanguageSwitch = false }) {
  return (
    // I do NOT know why the key= trick works I just tried it and it seems to fix the scroll bug LMAOOOOO
    // Edit: didnt work
    <footer className="bg-white --dark:bg-gray-900 z-10 relative" key={"fix-scroll-bug-asdf"}>
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
          <div>
            <a href={`${homeHref}#`} className="inline-flex items-center">
              <Image src={logo} className="w-8 h-8 me-1 shrink-0" alt={text.logo} />
              <span className="self-center text-2xl font-semibold whitespace-nowrap --dark:text-white">{process.env.NEXT_PUBLIC_SITE_NAME}</span>
            </a>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-8 break-words min-[400px]:grid-cols-2 sm:grid-cols-3">
            <div>
              <h3 className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white"><Link className="hover:underline" href={"/tools"}>{text.tools}</Link></h3>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                {tools.map(t => (
                  <li key={t.slug} className="mb-4">
                    <Link href={`/tools/${t.slug}`} className="hover:underline">
                      {text.toolNames[t.slug]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white"><Link className="hover:underline" href={"/how-to"}>{text.guides}</Link></p>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="/how-to/transfer-files-from-iphone-to-pc" className="hover:underline">{text.iphone}</Link>
                </li>
                <li className="mb-4">
                  <Link href="/how-to/transfer-files-from-pc-to-pc" className="hover:underline">{text.pc}</Link>
                </li>
                <li>
                  <Link href="/how-to/transfer-files-from-android-to-pc" className="hover:underline">{text.android}</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white">{text.resources}</p>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a href={`/contact`} className="hover:underline">{text.support}</a>
                </li>
                <li className="mb-4">
                  <h3><a href={RECEIVE_PATHS[homeHref === "/sv" ? "sv" : "en"]} className="hover:underline">{text.receive}</a></h3>
                </li>
                <li className="mb-4">
                  <h3><a href={homeHref} className="hover:underline">{text.send}</a></h3>
                </li>
                {/* <li className="mb-4">
                  <h3><a href="/how-to" className="hover:underline">How-Tos</a></h3>
                </li> */}
                <li>
                  <a href="https://github.com/robinkarlberg/transfer.zip-web?tab=readme-ov-file#self-hosting" className="hover:underline">{text.selfHosting}</a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white"><Link className="hover:underline" href={"/legal"}>{text.legal}</Link></p>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link href="/legal/privacy-policy" className="hover:underline">{text.privacy}</Link>
                </li>
                <li className="mb-4">
                  <Link href="/legal/terms-and-conditions" className="hover:underline">{text.terms}</Link>
                </li>
                <li>
                  <Link href="/legal/impressum" className="hover:underline">{text.impressum}</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white"><a className="hover:underline" href="/alternative">{text.alternatives}</a></p>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <h3><Link href="/alternative/wetransfer" className="hover:underline ">{text.wetransferAlternative}</Link></h3>
                </li>
                <li>
                  <h3><Link href="/alternative/smash" className="hover:underline ">{text.smashAlternative}</Link></h3>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-6 text-sm font-semibold text-gray-900 uppercase --dark:text-white"><a className="hover:underline" href="/comparison">{text.comparisons}</a></p>
              <ul className="text-gray-500 --dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <h3><Link href="/comparison/wetransfer" className="hover:underline ">{text.wetransferComparison}</Link></h3>
                </li>
                <li>
                  <h3><Link href="/comparison/smash" className="hover:underline ">{text.smashComparison}</Link></h3>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto --dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center --dark:text-gray-400"><a className="hover:underline" href="#">{text.made} <BIcon name={"heart-fill"} className={"text-red-500"} /></a> {text.from}<BIcon name={"dot"} />&copy; 2026 <a target="_blank" href={process.env.NEXT_PUBLIC_AUTHOR_URL} className="hover:underline">{process.env.NEXT_PUBLIC_AUTHOR}</a>. {/*All Rights Reserved.*/}
          </span>
          <div className="flex mt-4 items-center gap-4 sm:justify-center sm:mt-0">
            {showLanguageSwitch && <LanguageSwitch language={homeHref === "/sv" ? "sv" : "en"} />}
            {process.env.NEXT_PUBLIC_FACEBOOK_URL && <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                <path fillRule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">{text.facebook}</span>
            </a>}
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white ms-5">
              <BIcon center name={"instagram"} />
              <span className="sr-only">{text.instagram}</span>
            </a>}
            {process.env.NEXT_PUBLIC_BLUESKY_URL && <a href={process.env.NEXT_PUBLIC_BLUESKY_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white ms-5">
              <BIcon center name={"bluesky"} />
              <span className="sr-only">{text.bluesky}</span>
            </a>}
            {process.env.NEXT_PUBLIC_TWITTER_URL && <a href={process.env.NEXT_PUBLIC_TWITTER_URL} className="text-gray-500 hover:text-gray-900 --dark:hover:text-white ms-5">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 17">
                <path fillRule="evenodd" d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">{text.twitter}</span>
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
