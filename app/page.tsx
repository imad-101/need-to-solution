import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Story } from "@/components/landing/Story";
import { Distinctive } from "@/components/landing/Distinctive";
import { FeaturedProblems } from "@/components/landing/FeaturedProblems";
import { RolesCta } from "@/components/landing/RolesCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Story />
      <Distinctive />
      <FeaturedProblems />
      <RolesCta />
    </>
  );
}
