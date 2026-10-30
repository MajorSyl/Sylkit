import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Root HTML for every web page. The site picks English or Spanish itself,
// so browser auto-translation is turned off (it would double-translate).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" translate="no">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:image" content="https://sylkit.com/brand/sylkit-icon-512.png" />
        <meta property="og:site_name" content="Sylkit" />
        <meta property="og:type" content="website" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'body{background-color:#F6F8FC;}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
