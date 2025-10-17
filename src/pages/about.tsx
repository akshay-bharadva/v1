import Layout from "@/components/layout";
import Me from "@/components/me";
import Hero from "@/components/hero";
import Technology from "@/components/technology";
import Tools from "@/components/tools";
import Experience from "@/components/experience";
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
        <link rel="canonical" href={pageUrl} />
      </Head>
      <div className="mx-auto w-full px-4 sm:px-8 md:px-16 xl:px-48 2xl:px-72">
        {/* 1. Introduction */}
        <Me />
        {/* 2. Bio */}
        <Hero />
        {/* 3. Professional History */}
        <Experience />
        {/* 4. Skills */}
        <Technology />
        {/* 5. Tools */}
        <Tools />
      </div>
    </Layout>
  );
}