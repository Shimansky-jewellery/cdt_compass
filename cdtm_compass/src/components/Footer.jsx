import siteContent from "../data/siteContent.js";
import "./Footer.css";

const legalLinks = [
  ["Terms and Conditions", "https://www.capetowndiamondmuseum.org/terms-and-conditions/"],
  ["Privacy Policy", "https://www.capetowndiamondmuseum.org/privacy-policy/"],
];

const guideLinks = [
  ["FAQs", "https://www.capetowndiamondmuseum.org/faqs/"],
];

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerColumns">
        <section className="footerColumn">
          <h2>Contact</h2>
          <a href={`tel:${siteContent.contact.phone.replaceAll(" ", "")}`}>
            {siteContent.contact.phone}
          </a>
          <a href={`mailto:${siteContent.contact.email}`}>
            {siteContent.contact.email}
          </a>
          <p>{siteContent.contact.address}</p>
          <a
            href={siteContent.contact.mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            View Map and Directions
          </a>
        </section>

        <section className="footerColumn">
          <h2>The Diamond Quiz</h2>
          <p>How much do you know about the fascinating world of diamonds?</p>
          <a href={siteContent.quizUrl} target="_blank" rel="noreferrer">
            Take the Quiz
          </a>
        </section>

        <section className="footerColumn">
          <h2>Legal</h2>
          {legalLinks.map(([label, href]) => (
            <a href={href} target="_blank" rel="noreferrer" key={label}>
              {label}
            </a>
          ))}
        </section>

        <section className="footerColumn">
          <h2>Guide</h2>
          {guideLinks.map(([label, href]) => (
            <a href={href} target="_blank" rel="noreferrer" key={label}>
              {label}
            </a>
          ))}
        </section>
      </div>

      <div className="footerBottom">
        <nav className="footerSocials" aria-label="Social media">
          <a href="https://www.facebook.com/shimansky/" target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a href="https://www.youtube.com/@ShimanskyJewellery" target="_blank" rel="noreferrer">
            YouTube
          </a>
          <a href="https://www.instagram.com/shimansky/" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>
        <small>
          © {new Date().getFullYear()} Cape Town Diamond Museum. All rights
          reserved.
        </small>
      </div>
    </footer>
  );
}
