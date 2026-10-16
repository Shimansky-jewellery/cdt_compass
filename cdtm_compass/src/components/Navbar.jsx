import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const museumLinks = [
  ["About the museum", "https://www.capetowndiamondmuseum.org/about-the-museum/"],
  [
    "Formation of Diamonds",
    "https://www.capetowndiamondmuseum.org/about-diamonds/formation-of-diamonds/",
  ],
  [
    "Visiting Info",
    "https://www.capetowndiamondmuseum.org/visiting/visiting-information/",
  ],
  [
    "Things to do",
    "https://www.capetowndiamondmuseum.org/visiting/things-to-do-in-cape-town/",
  ],
  ["Diamond Quiz", "https://www.capetowndiamondmuseum.org/diamond-quiz/"],
  ["Blogs", "https://www.capetowndiamondmuseum.org/blogs/"],
  ["Contact", "https://www.capetowndiamondmuseum.org/contact/general-enquiry/"],
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="siteHeader">
      <nav className="siteNav" aria-label="Main navigation">
        <Link
          className="siteLogo"
          to="/"
          aria-label="Cape Town Diamond Museum home"
          onClick={closeMenu}
        >
          <img
            src="https://www.capetowndiamondmuseum.org/wp-content/uploads/2025/04/shimansky-weblogo.jpg"
            alt="Shimansky"
          />
        </Link>

        <button
          className="navToggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="siteNavLinks"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul
          id="siteNavLinks"
          className={`navLinks${menuOpen ? " navLinks--open" : ""}`}
        >
          <li>
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>
          </li>
          {museumLinks.map(([label, href]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" onClick={closeMenu}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <NavLink to="/famous-diamonds" onClick={closeMenu}>
              Famous Diamonds
            </NavLink>
          </li>
          <li className="navCompassItem">
            <Link className="navCompass" to="/compass" onClick={closeMenu}>
              Find the Museum
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
