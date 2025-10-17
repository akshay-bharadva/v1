import Layout from "@/components/layout";
import LittleAboutMyself from "@/components/little-about-myself";
import Hero from "@/components/hero";
import Newsletter from "@/components/newsletter";
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
      <LittleAboutMyself />
      <Hero />
      <Projects />
      <Newsletter />
    </Layout>
  );
}