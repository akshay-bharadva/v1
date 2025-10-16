import Layout from "@/components/layout";
import LittleAboutMyself from "@/components/little-about-myself";
import Hero from "@/components/hero";
import Projects from "@/components/projects";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";

export default function HomePage() {
  const { site: siteConfig } = appConfig;
  return (
    <Layout>
      <Head>
        <link rel="canonical" href={siteConfig.url} />
      </Head>
      {/* Container for centered content */}
      <div className="mx-auto w-full px-4 sm:px-8 md:px-16 xl:px-48 2xl:px-72">
        {/* Main hero with kinetic typography */}
        <LittleAboutMyself />
        {/* Short bio paragraph */}
        <Hero />
      </div>
      {/* Featured projects section, now spans full width */}
      <Projects />
    </Layout>
  );
}