import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { supabase } from "@/supabase/client";
import type { PortfolioSection } from "@/types";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export default function HireMePage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `Hire Me | ${siteConfig.title}`;
  const pageDescription = "Services offered by Akshay Bharadva. Let's build something great together.";
  const pageUrl = `${siteConfig.url}/hire-me/`;

  const [serviceSection, setServiceSection] = useState<PortfolioSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('portfolio_sections')
          .select('*, portfolio_items(*)')
          .eq('title', 'Services') // IMPORTANT: The section title in your CMS must be "Services"
          .order('display_order', { foreignTable: 'portfolio_items', ascending: true })
          .single();

        // PGRST116 means no rows were found, which is a valid state (no services created yet).
        if (fetchError && fetchError.code !== 'PGRST116') {
          throw new Error(fetchError.message);
        }
        setServiceSection(data);
      } catch (err: any) {
        console.error("Error fetching services:", err);
        setError(err.message || "Could not load services at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

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
      <main className="py-12 font-space md:py-16">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 border-b-4 border-black pb-6 text-center"
        >
          <h1 className="mb-3 text-5xl font-black text-black md:text-6xl">LET'S WORK TOGETHER</h1>
          <p className="mx-auto max-w-2xl text-xl font-semibold text-gray-700">
            I help startups and businesses bring their ideas to life with clean code and great user experiences.
          </p>
        </motion.header>

        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-none border-2 border-dashed border-black bg-white py-20 text-center">
             <div className="mx-auto mb-4 size-12 animate-spin rounded-none border-y-4 border-black"></div>
             <p className="text-lg font-bold text-black">Loading Services...</p>
          </div>
        )}

        {error && !isLoading && (
            <div className="rounded-none border-2 border-red-500 bg-red-100 p-8 text-center font-semibold text-red-700 shadow-[4px_4px_0_#B91C1C]">
                <h3 className="text-xl font-bold">Error Loading Services</h3>
                <p className="mt-2">{error}</p>
            </div>
        )}

        {!isLoading && !error && (!serviceSection || !serviceSection.portfolio_items || serviceSection.portfolio_items.length === 0) && (
            <div className="text-center rounded-none border-2 border-dashed border-black bg-yellow-100 p-12">
                <h3 className="text-xl font-bold">Services information coming soon!</h3>
                <p className="text-gray-700">Please check back later or contact me directly via email.</p>
            </div>
        )}

        {!isLoading && serviceSection && serviceSection.portfolio_items && serviceSection.portfolio_items.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {serviceSection.portfolio_items.map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="flex h-full flex-col rounded-none border-2 border-black bg-white p-6 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0px_#4f46e5] transition-shadow"
              >
                <h3 className="mb-3 text-2xl font-bold text-black">{service.title}</h3>
                <p className="mb-4 flex-grow text-sm text-gray-600">{service.subtitle}</p>
                {service.tags && (
                  <ul className="mb-6 space-y-2">
                    {service.tags.map(tag => (
                      <li key={tag} className="flex items-start text-sm">
                        <Check className="mr-2 mt-0.5 size-4 shrink-0 text-green-600" />
                        <span>{tag}</span>
                      </li>
                    ))}
                  </ul>
                )}
                 <Button asChild variant="default" className="mt-auto w-full">
                   <a href={service.link_url || "mailto:akshaybharadva19@gmail.com"}>
                     {service.link_url ? 'Learn More' : 'Inquire Now'}
                   </a>
                 </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </Layout>
  );
}