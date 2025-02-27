"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MotionConfig, motion } from "framer-motion";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <MotionConfig transition={{ duration: 0.6, ease: "easeInOut" }}>
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-br from-gray-900 to-gray-700 text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <Ghost size={80} className="text-yellow-400 animate-bounce" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl font-bold gradient-title mb-5 animate-ping"
        >
          404
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold mb-4"
        >
          Oops! Page Not Found
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-300 mb-6 max-w-lg"
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </motion.p>
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <Link href="/">
            <Button className="px-6 py-3 text-lg font-medium bg-yellow-400 text-black rounded-lg shadow-md hover:bg-yellow-300 hover:scale-105 transition-all animate-bounce">
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
