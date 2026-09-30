import AccordionGallery from "./reactbits/AccordionGallery";
import FoldText from "./reactbits/FoldText";
import { GALLERY_IMAGES } from "@/lib/constants";

export default function GallerySection() {
  return (
    <section id="galeria" className="section-padding bg-cream-card/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-14">
          <span className="text-gold-deep text-xs tracking-[0.3em] uppercase font-semibold block mb-3">
            Galeria
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-dark mb-4">
            {/* React Bits — Fold Text: o título se desdobra ao entrar na tela */}
            <FoldText
              text="O cuidado em cada detalhe"
              splitBy="word"
              hinge="top"
              trigger="scroll"
              duration={0.8}
              stagger={0.09}
              creaseShading={0.4}
              fontSize="inherit"
              fontWeight="inherit"
              color="currentColor"
              style={{ letterSpacing: "normal", lineHeight: 1.15 }}
            />
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#C9A15C] to-transparent mx-auto mb-6" />
          <p className="text-dark/75 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Registros dos atendimentos da Dra. Priscila Santos na Quiro+ — da avaliação inicial ao ajuste.
            Passe o mouse ou toque em uma foto para ampliar.
          </p>
        </div>

        {/* React Bits — Accordion Gallery */}
        <AccordionGallery
          items={GALLERY_IMAGES}
          defaultIndex={2}
          accentColor="#C9A15C"
          overlayColor="#2B2318"
          textColor="#F4EBDD"
          height={540}
          gap={10}
          radius={22}
          expandRatio={0.46}
          tilt={6}
          parallax={0.5}
          duration={0.7}
          grayscale
          ariaLabel="Fotos dos atendimentos da Quiro+"
        />
      </div>
    </section>
  );
}
