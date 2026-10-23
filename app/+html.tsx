import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Root HTML for every web page. The site has its own ES/EN switch,
// so browser auto-translation is turned off (it garbled the toggle).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es" translate="no">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#1D6BFF" />
        <meta property="og:site_name" content="Sylkit" />
        <meta property="og:type" content="website" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'body{background-color:#F6F8FC;}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
