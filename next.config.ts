import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // designoslav ships raw .ts/.tsx + CSS Modules source (no build step),
  // so Next must transpile it like local app code.
  transpilePackages: ["designoslav"],
};

export default nextConfig;
