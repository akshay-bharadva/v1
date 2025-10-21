/*
This file is updated to align with the new kinetic typography design.
- The `LittleAboutMyself` and `Hero` components are retained for structure, but their internal styling will be updated in their respective files.
- The `Newsletter` and `Projects` components are also kept, and their redesign will be handled in their files.
- The `` class is removed, inheriting the global `font-sans`.
- Head tags and metadata remain unchanged as they are functional.
*/
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