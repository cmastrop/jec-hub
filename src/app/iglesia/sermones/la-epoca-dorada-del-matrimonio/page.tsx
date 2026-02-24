"use client";

import Link from "next/link";
import { ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function SermonMatrimonioPage() {
  const { lang } = useLang();

  const content = {
    en: {
      label: "Sermon Notes",
      title: "The Golden Age",
      titleAccent: "of Marriage",
      series: "Family & Faith",
      speaker: "Pastor Morris Velasquez",
      date: "Sep 21, 2025",
      intro:
        "In this powerful message, Pastor Morris explores what it means to build a marriage that stands the test of time — a marriage rooted not in fleeting emotions, but in the unshakeable foundation of faith in God.",
      sections: [
        {
          heading: "The Foundation: Christ at the Center",
          text: "Every strong building needs a solid foundation. In the same way, every lasting marriage must be built upon the rock of Jesus Christ. When both husband and wife place God at the center of their relationship, they create a bond that no storm can break. As Ecclesiastes 4:12 reminds us: \"A cord of three strands is not quickly broken.\" That third strand is God Himself.",
        },
        {
          heading: "The Covenant: More Than a Contract",
          text: "The world treats marriage like a contract — something that can be broken when it's no longer convenient. But God designed marriage as a covenant, a sacred promise before Him. Just as God keeps His covenant with us despite our failures, we are called to love our spouse with the same unconditional, sacrificial love. This is the kind of love described in 1 Corinthians 13 — patient, kind, not self-seeking.",
        },
        {
          heading: "Building a Legacy of Faith",
          text: "A godly marriage doesn't just bless the couple — it blesses generations to come. When children grow up seeing their parents pray together, forgive each other, and serve God side by side, they inherit a legacy of faith that shapes their own lives and families. Proverbs 22:6 says: \"Train up a child in the way he should go, and when he is old he will not depart from it.\"",
        },
        {
          heading: "Practical Keys for a Golden Marriage",
          text: "Pastor Morris shared four practical keys: (1) Pray together daily — couples who pray together stay together. (2) Communicate with grace — speak the truth in love, listen with patience. (3) Forgive quickly — don't let the sun go down on your anger. (4) Serve together — find a ministry you can do as a couple. These simple practices, done consistently, transform ordinary marriages into extraordinary ones.",
        },
      ],
      verse:
        "\"Therefore what God has joined together, let no one separate.\"",
      verseRef: "— Mark 10:9",
      backLabel: "Back to Sermons",
    },
    es: {
      label: "Notas del Sermon",
      title: "La Epoca Dorada",
      titleAccent: "del Matrimonio",
      series: "Familia y Fe",
      speaker: "Pastor Morris Velasquez",
      date: "21 Sep 2025",
      intro:
        "En este poderoso mensaje, el Pastor Morris explora lo que significa construir un matrimonio que resista la prueba del tiempo — un matrimonio arraigado no en emociones pasajeras, sino en el fundamento inquebrantable de la fe en Dios.",
      sections: [
        {
          heading: "El Fundamento: Cristo en el Centro",
          text: "Todo edificio fuerte necesita un fundamento solido. De la misma manera, todo matrimonio duradero debe ser construido sobre la roca de Jesucristo. Cuando ambos, esposo y esposa, colocan a Dios en el centro de su relacion, crean un vinculo que ninguna tormenta puede romper. Como nos recuerda Eclesiastes 4:12: \"Un cordon de tres hilos no se rompe facilmente.\" Ese tercer hilo es Dios mismo.",
        },
        {
          heading: "El Pacto: Mas Que un Contrato",
          text: "El mundo trata al matrimonio como un contrato — algo que se puede romper cuando ya no es conveniente. Pero Dios diseno el matrimonio como un pacto, una promesa sagrada ante El. Asi como Dios mantiene Su pacto con nosotros a pesar de nuestras fallas, somos llamados a amar a nuestro conyuge con el mismo amor incondicional y sacrificial. Este es el tipo de amor descrito en 1 Corintios 13 — paciente, bondadoso, no busca lo suyo.",
        },
        {
          heading: "Construyendo un Legado de Fe",
          text: "Un matrimonio piadoso no solo bendice a la pareja — bendice a generaciones venideras. Cuando los hijos crecen viendo a sus padres orar juntos, perdonarse mutuamente y servir a Dios lado a lado, heredan un legado de fe que moldea sus propias vidas y familias. Proverbios 22:6 dice: \"Instruye al nino en su camino, y aun cuando fuere viejo no se apartara de el.\"",
        },
        {
          heading: "Claves Practicas para un Matrimonio Dorado",
          text: "El Pastor Morris compartio cuatro claves practicas: (1) Oren juntos diariamente — las parejas que oran juntas permanecen juntas. (2) Comuniquense con gracia — hablen la verdad en amor, escuchen con paciencia. (3) Perdonen rapidamente — no dejen que el sol se ponga sobre su enojo. (4) Sirvan juntos — encuentren un ministerio que puedan hacer como pareja. Estas practicas simples, hechas consistentemente, transforman matrimonios ordinarios en extraordinarios.",
        },
      ],
      verse:
        "\"Por tanto, lo que Dios junto, no lo separe el hombre.\"",
      verseRef: "— Marcos 10:9",
      backLabel: "Volver a Sermones",
    },
  };

  const c = content[lang];

  return (
    <>
      <PageHero
        image="/iglesia/preaching.jpg"
        label={c.label}
        title={c.title}
        titleAccent={c.titleAccent}
      />

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <Link
              href="/iglesia/sermones"
              className="inline-flex items-center gap-2 text-sm text-[#C9A86C] hover:text-[#4A3F35] transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {c.backLabel}
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-[#6B5D4D] mb-6">
              <span className="inline-block bg-[#C9A86C]/20 text-[#C9A86C] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {c.series}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {c.speaker}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {c.date}
              </span>
            </div>

            {/* YouTube embed */}
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-10">
              <iframe
                src="https://www.youtube.com/embed/UYkCTuR5aBQ"
                title={c.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Intro */}
            <p className="text-lg text-[#4A3F35] leading-relaxed mb-12">
              {c.intro}
            </p>
          </FadeIn>

          {/* Sections */}
          {c.sections.map((section, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-[#C9A86C] flex-shrink-0" />
                  <h2
                    className="text-xl font-semibold text-[#4A3F35]"
                    style={serif}
                  >
                    {section.heading}
                  </h2>
                </div>
                <p className="text-[#6B5D4D] leading-relaxed pl-8">
                  {section.text}
                </p>
              </div>
            </FadeIn>
          ))}

          {/* Closing Verse */}
          <FadeIn delay={400}>
            <div className="mt-16 p-8 bg-[#4A3F35] rounded-xl text-center">
              <p
                className="text-xl text-white/90 italic leading-relaxed"
                style={serif}
              >
                {c.verse}
              </p>
              <p className="text-[#C9A86C] font-semibold mt-4">
                {c.verseRef}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
