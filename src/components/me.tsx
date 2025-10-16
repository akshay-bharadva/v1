// The 'Me' component is simplified. The blocky, rotated card is removed.
// It now presents a clean avatar and name, fitting the minimalist aesthetic.

import Image from "next/image";
import { motion } from "framer-motion";

export default function Me() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 text-center"
    >
      <div className="flex flex-col items-center gap-6">
        <Image
          src={"https://avatars.githubusercontent.com/u/52954931?v=4"}
          alt="Akshay Bharadva avatar"
          width={128}
          height={128}
          className="size-32 rounded-full border-2 border-white/10 object-cover"
          priority
        />
        <div className="text-center">
          <h1 className="text-5xl font-black text-slate-100">Akshay Bharadva</h1>
          <p className="mt-2 text-xl font-medium text-accent">Fullstack Developer</p>
        </div>
      </div>
    </motion.section>
  );
}