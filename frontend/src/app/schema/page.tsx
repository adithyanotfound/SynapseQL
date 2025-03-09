"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaCode, FaPlay, FaTimes } from 'react-icons/fa';
import BACKEND_URL from '../config';

const Particle = ({ delay = 0 }) => {
  return (
    <motion.div
      className="pointer-events-none absolute h-2 w-2 rounded-full bg-white/10"
      initial={{ 
        x: Math.random() * 100 - 50 + "%", 
        y: "110%",
        opacity: 0.1 + Math.random() * 0.3
      }}
      animate={{ 
        y: "-110%",
        x: `${Math.random() * 100 - 50}%`
      }}
      transition={{ 
        duration: 10 + Math.random() * 10,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    />
  );
};

export default function SchemaPage() {
  const router = useRouter();
  const [schema, setSchema] = useState(`{
  "databases": {
    "db1": {
      "host": "localhost",
      "port": 5432,
      "user": "postgres",
      "password": "mysecretpassword",
      "database": "database1"
    },
    "db2": {
      "host": "localhost",
      "port": 5433,
      "user": "postgres",
      "password": "mysecretpassword",
      "database": "database2"
    }
  },
  "tables": {
    "authors": {
      "db": "db1",
      "columns": ["id", "name"],
      "relations": {
        "books": {
          "foreign_key": "id",
          "reference": "author_id",
          "table": "books"
        }
      }
    },
    "books": {
      "db": "db1",
      "columns": ["id", "title", "author_id"],
      "relations": {
        "authors": {
          "foreign_key": "author_id",
          "reference": "id",
          "table": "authors"
        }
      }
    }
  }
}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      const parsedSchema = JSON.parse(schema);

      const response = await fetch(`${BACKEND_URL}/api/config/load`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedSchema)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load schema");
      }

      router.push("/editor");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4 text-white">
      {Array.from({ length: 20 }).map((_, i) => (
        <Particle key={i} delay={i * 0.5} />
      ))}
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-3xl">
        <div className="rounded-xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-purple-500/10 p-2">
              <FaCode className="text-xl text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Database Schema</h2>
              <p className="text-sm text-white/50">Define your database structure</p>
            </div>
          </div>

          <div className="relative mt-6">
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="h-[400px] w-full rounded-lg border border-white/10 bg-black/50 p-6 font-mono text-sm leading-relaxed tracking-wide text-white/80 backdrop-blur-sm transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
              spellCheck="false"
              placeholder="Enter your schema here..."
            />
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-500">
                <FaTimes className="text-xs" />
                {error}
              </motion.div>
            )}

            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-purple-500 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-purple-600 ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <FaPlay className="text-xs" />
                  Continue
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-white/40">
            <div>Press Ctrl + Enter to submit</div>
            <div>{schema.length} characters</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
