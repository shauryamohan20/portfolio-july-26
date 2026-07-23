import Section from "./Section";
import { profile } from "@/data/content";

export default function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="A little about me"
    >
      <div className="space-y-4 leading-relaxed text-muted">
        <p>
          I&apos;m {profile.name}, a developer based in {profile.location}. I&apos;m
          passionate about building clean, functional, and user-friendly digital
          experiences, and I work across the full stack to bring ideas to life.
        </p>
        <p>
          As a freelancer I&apos;ve partnered with clients worldwide to ship
          e-commerce stores, business websites, and custom platforms — always with an
          eye for detail, clear communication, and on-time delivery. When I&apos;m not
          coding, you&apos;ll usually find me behind a camera, capturing landscapes and
          everyday moments.
        </p>
      </div>
    </Section>
  );
}
