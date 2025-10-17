import Layout from "@/components/layout";
import Head from "next/head";
import { config as appConfig } from "@/lib/config";
import { supabase } from "@/supabase/client";
import type { PortfolioSection } from "@/types";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Mail, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const { site: siteConfig } = appConfig;
  const pageTitle = `Contact Me | ${siteConfig.title}`;
  const pageDescription = "Let's build something great together. Get in touch with Akshay Bharadva.";
  const pageUrl = `${siteConfig.url}/contact/`;

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
          .eq('title', 'Services')
          .order('display_order', { foreignTable: 'portfolio_items', ascending: true })
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw new Error(fetchError.message);
        setServiceSection(data);
      } catch (err: any) { setError(err.message || "Could not load services."); } 
      finally { setIsLoading(false); }
    };

    fetchServices();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

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
      <main className="mx-auto max-w-5xl px-4 py-16 font-sans md:py-24">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-black text-slate-100 md:text-6xl">Get In Touch</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-400">
            Have a project in mind or just want to say hello? I'd love to hear from you.
          </p>
          <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                  <a href="mailto:akshaybharadva19@gmail.com">
                      <Mail className="mr-2 size-5" /> Email Me
                  </a>
              </Button>
              <Button asChild variant="secondary" size="icon" aria-label="GitHub">
                  <a href="https://github.com/akshay-bharadva" target="_blank" rel="noopener noreferrer"><Github /></a>
              </Button>
              <Button asChild variant="secondary" size="icon" aria-label="LinkedIn">
                  <a href="https://www.linkedin.com/in/akshay-bharadva/" target="_blank" rel="noopener noreferrer"><Linkedin /></a>
              </Button>
          </div>
        </motion.header>

        {(isLoading || (!isLoading && serviceSection?.portfolio_items && serviceSection.portfolio_items.length > 0)) && (
          <motion.div className="mt-24">
              <h2 className="mb-10 text-center text-4xl font-bold text-slate-400">What I Can Do For You</h2>
              {isLoading && (
                 <div className="flex justify-center"><div className="mb-4 w-10 h-10 animate-spin rounded-full border-4 border-accent border-l-transparent"></div></div>
              )}
              {!isLoading && serviceSection?.portfolio_items && (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                >
                  {serviceSection.portfolio_items.map((service) => (
                    <motion.div 
                      key={service.id}
                      variants={itemVariants}
                      className="flex h-full flex-col rounded-lg border border-white/10 bg-zinc-900 p-8"
                    >
                      <h3 className="mb-3 text-2xl font-bold text-slate-100">{service.title}</h3>
                      <p className="mb-6 flex-grow text-slate-400">{service.subtitle}</p>
                      {service.tags && (
                        <ul className="mb-8 space-y-3">
                          {service.tags.map(tag => (
                            <li key={tag} className="flex items-start text-slate-300">
                              <Check className="mr-3 mt-1 size-4 shrink-0 text-accent" />
                              <span>{tag}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
          </motion.div>
        )}
      </main>
    </Layout>
  );
}