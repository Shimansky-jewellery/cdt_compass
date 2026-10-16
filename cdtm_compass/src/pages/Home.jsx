import { Link } from "react-router-dom";
import siteContent from "../data/siteContent.js";
import "./Home.css";

const museumUrl = "https://www.capetowndiamondmuseum.org";
const bookingUrl = siteContent.bookingUrl;

const experiences = [
  {
    title: "EXPERIENCE",
    description: "The Cape Town Diamond Museum is the only one of its kind.",
    href: `${museumUrl}/about-the-museum/experience/`,
  },
  {
    title: "DISCOVER",
    description: "Discover the world's famous diamonds with life-size replicas.",
    href: `${museumUrl}/about-the-museum/discover/`,
  },
  {
    title: "EXPLORE",
    description:
      "Learn about the South African diamond rush and where it all began.",
    href: `${museumUrl}/about-the-museum/explore/`,
  },
  {
    title: "LEARN",
    description:
      "Learn how rough diamonds are transformed into creations of light.",
    href: `${museumUrl}/about-the-museum/learn/`,
  },
];

export default function Home() {
  return (
    <main className="homePage">
      <section className="hero" aria-labelledby="heroTitle">
        <div className="heroContent">
          <p className="eyebrow">A journey through the world of diamonds</p>
          <h1 id="heroTitle">The Cape Town Diamond Museum</h1>
          <p className="heroSubtitle">
            Cape Town&apos;s top-rated museum, located at the Clock Tower
            Waterfront
          </p>
          <div className="heroActions">
            <a
              className="button button--gold"
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Book a Tour
            </a>
            <Link className="button button--outline" to="/compass">
              Find the Museum
            </Link>
          </div>
        </div>
      </section>

      <section className="experienceSection sectionWrap">
        <header className="sectionHeading">
          <p className="eyebrow">Diamonds in South Africa</p>
          <h2>experience. discover. explore. learn.</h2>
        </header>

        <div className="experienceGrid">
          {/* TODO: Replace these neutral placeholders with the real CTDM card image URLs. */}
          {experiences.map((experience) => (
            <article className="experienceCard" key={experience.title}>
              <div className="experienceImage" aria-hidden="true" />
              <div className="experienceCardContent">
                <h3>{experience.title}</h3>
                <p>{experience.description}</p>
                <a
                  href={experience.href}
                  target="_blank"
                  rel="noreferrer"
                  className="textLink"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tourSection">
        <div className="tourContent sectionWrap">
          <p className="eyebrow">An intimate museum experience</p>
          <h2>Book your diamond tour</h2>
          <p>{siteContent.tourDescription}</p>
          <a
            className="button button--gold"
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            Book a Tour
          </a>
        </div>
      </section>

      <section className="visitSection sectionWrap" aria-label="Plan your visit">
        <article className="visitBlock">
          <p className="eyebrow">Plan your visit</p>
          <h2>OPERATING HOURS</h2>
          <p>{siteContent.operatingHours}</p>
          <a
            className="button button--dark"
            href={siteContent.bookingUrl}
            target="_blank"
            rel="noreferrer"
          >
            Book Now
          </a>
        </article>
        <article className="visitBlock">
          <p className="eyebrow">Find us</p>
          <h2>BOOKING INFO</h2>
          <p>
            <a href={`tel:${siteContent.contact.phone.replaceAll(" ", "")}`}>
              {siteContent.contact.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${siteContent.contact.email}`}>
              {siteContent.contact.email}
            </a>
          </p>
          <p>{siteContent.contact.address}</p>
        </article>
        <article className="visitBlock">
          <p className="eyebrow">Tour details</p>
          <h2>FEES AND DURATION</h2>
          <p>{siteContent.fee}</p>
          <p>{siteContent.tourDuration}</p>
        </article>
      </section>
    </main>
  );
}
