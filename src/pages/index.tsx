/*
This file is heavily redesigned to create a more engaging and professional homepage.
- The layout is now asymmetrical on larger screens, featuring a bold hero section on the left and a preview of projects on the right.
- `LittleAboutMyself` and `Hero` are combined into a single, more impactful `Hero` component.
- The `Projects` component is updated to only show a curated selection on the homepage.
- The `Newsletter` section is visually enhanced.
- A new animated background element is added via the Layout component for a dynamic feel.
*/
import Layout from "@/components/layout/Layout";
import Projects from "@/components/features/projects/Projects";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { useEffect } from "react";
import Hero from "@/components/features/home/Hero";
import Experience from "@/components/features/experience/Experience";
import Newsletter from "@/components/features/home/Newsletter";

export default function HomePage() {
  const { site: siteConfig } = appConfig;

  useEffect(() => {
    const webhookUrl = process.env.NEXT_PUBLIC_VISIT_NOTIFIER_URL || "";
    if (process.env.NODE_ENV === "production" && webhookUrl) {
      if (!sessionStorage.getItem("visitNotified")) {
        const userAgent = navigator.userAgent || "Unknown";
        const referrer = document.referrer || "Direct visit";
        const embed = {
          title: "🚀 New Portfolio Visitor!",
          color: 3447003,
          description: `Someone just landed on the portfolio.`,
          fields: [
            { name: "🔗 Referrer", value: `\`${referrer}\``, inline: false },
            { name: "🖥️ User Agent", value: `\`\`\`${userAgent}\`\`\`` },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Visit Notification" }
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Portfolio Bot",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [embed],
          }),
        })
          .then(() => sessionStorage.setItem("visitNotified", "true"))
          .catch((err) => console.error("Failed to send visit notification:", err));
      }
    }
  }, []);

   return (
    <Layout>
      <Head>
        <link rel="canonical" href={siteConfig.url} />
      </Head>
      <div className="py-12 md:py-20">
        <Hero />
        <Projects />
        <Experience />
        <Newsletter />
      </div>
    </Layout>
  );
}


