import Hero from "@/components/hero";
import Layout from "@/components/layout";
import Me from "@/components/me";
import Technology from "@/components/technology";
import Tools from "@/components/tools";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";

export default function AboutPage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `About Me | ${siteConfig.title}`;
  const pageDescription = `Learn more about Akshay Bharadva, a full-stack developer, his skills, and the tools he uses.`;
  const pageUrl = `${siteConfig.url}/about/`;

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="profile" />
        <meta property="profile:first_name" content="Akshay" />
        <meta property="profile:last_name" content="Bharadva" />
        <meta property="profile:username" content="akshay-bharadva" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
      </Head>
      <Me />
      <Hero />
      <Technology />
      <Tools />
    </Layout>
  );
}
