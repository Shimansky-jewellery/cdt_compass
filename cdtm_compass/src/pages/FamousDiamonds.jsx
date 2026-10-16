import famousDiamonds from "../data/famousDiamonds.js";
import ViewToScale from "../components/ViewToScale/ViewToScale.jsx";
import "./FamousDiamonds.css";

const galleryOrder = [
  "jubilee",
  "kimberley",
  "koh-i-noor",
  "millennium-star",
  "centenary",
  "cullinan",
  "cullinan-i",
  "de-beers",
  "eureka",
  "excelsior",
  "golden-jubilee",
  "great-mogul",
  "hope",
  "incomparable",
  "jonker",
];
const galleryDiamonds = galleryOrder.map((id) =>
  famousDiamonds.find((diamond) => diamond.id === id)
);

export default function FamousDiamonds() {
  return (
    <main className="famousPage">
      <header className="famousTitleBand">
        <div className="famousTitleInner">
          <h1>Famous Diamonds</h1>
        </div>
      </header>

      <section className="famousGallerySection" aria-label="Famous diamond gallery">
        <div className="famousGallery" tabIndex="0" aria-label="Scroll through famous diamonds">
          {galleryDiamonds.map((diamond) => (
            <figure className="famousGalleryCard" key={diamond.id}>
              <img src={diamond.imageUrl} alt={diamond.alt} loading="lazy" />
              <figcaption>{diamond.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="famousStories">
        {famousDiamonds.map((diamond, index) => (
          <article
            className={`diamondStory${index % 2 ? " diamondStory--imageFirst" : ""}`}
            key={diamond.id}
          >
            <div className="diamondStoryText">
              <h2>{diamond.name}</h2>
              <dl className="diamondFigures">
                {diamond.figures.map(([label, value]) => (
                  <div className="diamondFigure" key={label}>
                    <dt>{label}:</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="diamondDescription">
                {diamond.description.map((paragraph, paragraphIndex) => (
                  <p key={`${diamond.id}-description-${paragraphIndex}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <ViewToScale
                stone={diamond.stone}
                title={diamond.name}
                summary={diamond.figures
                  .map(([label, value]) => `${label}: ${value}`)
                  .join(" · ")}
              />
            </div>
            <img
              className="diamondStoryImage"
              src={diamond.imageUrl}
              alt={diamond.alt}
              loading="lazy"
            />
          </article>
        ))}
      </div>

      <p className="famousNote">
        3D shapes are illustrative. Sizes marked est. are calculated from carat
        weight.
      </p>

    </main>
  );
}
