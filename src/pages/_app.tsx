import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AI Video Repurposing Tool</title>
        <meta name="description" content="Transform your long-form videos into viral short clips automatically using AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="AI Video Repurposing Tool" />
        <meta property="og:description" content="Transform your long-form videos into viral short clips automatically using AI" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Video Repurposing Tool" />
        <meta name="twitter:description" content="Transform your long-form videos into viral short clips automatically using AI" />
      </Head>
      <Component {...pageProps} />
    </>
  )
} 