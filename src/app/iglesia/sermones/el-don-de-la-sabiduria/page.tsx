"use client";

import Link from "next/link";
import { ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function SermonSabiduriaPage() {
  const { lang } = useLang();

  const content = {
    en: {
      label: "Sermon Notes",
      title: "The Gift of the",
      titleAccent: "Word of Wisdom",
      series: "Spiritual Gifts",
      speaker: "Pastor Morris Velasquez",
      date: "Sep 6, 2017",
      intro:
        "The spiritual gifts are tools that the Holy Spirit gives to every believer for the building up of the body of Christ. In this study, Pastor Morris examines one of the most powerful and needed gifts: the word of wisdom — a supernatural revelation from God that provides divine direction in moments of uncertainty.",
      sections: [
        {
          heading: "What Is the Word of Wisdom?",
          text: "The word of wisdom, listed in 1 Corinthians 12:8, is not the same as human wisdom or intellectual knowledge. It is a supernatural gift — a fragment of God's infinite wisdom given to a believer at a specific moment for a specific purpose. It often comes as a sudden insight, a clear direction, or a divine solution to a problem that seemed impossible. King Solomon demonstrated this gift when he proposed to divide the baby between two women claiming to be the mother (1 Kings 3:16-28). His solution revealed the truth instantly.",
        },
        {
          heading: "The Difference Between Wisdom and Knowledge",
          text: "While the word of knowledge reveals facts about a situation (what is or what was), the word of wisdom reveals what should be done (what will be or what must happen). Knowledge diagnoses; wisdom prescribes. Knowledge tells you where you are; wisdom tells you where to go. Both gifts work together, but wisdom is particularly vital for leaders, pastors, and anyone making decisions that affect others. James 1:5 promises: \"If any of you lacks wisdom, let him ask of God, who gives to all liberally.\"",
        },
        {
          heading: "Biblical Examples of Divine Wisdom",
          text: "Throughout Scripture, we see God granting supernatural wisdom to His servants in critical moments. Joseph interpreted Pharaoh's dreams and designed a plan to save Egypt from famine (Genesis 41). Daniel received wisdom to interpret the writing on the wall (Daniel 5). Jesus demonstrated perfect wisdom when asked about paying taxes to Caesar — \"Render to Caesar what is Caesar's\" (Matthew 22:21). In each case, the wisdom came from God, not from human reasoning.",
        },
        {
          heading: "How to Activate This Gift in Your Life",
          text: "Pastor Morris emphasized that this gift is available to every believer, not just pastors or leaders. To position yourself to receive the word of wisdom: (1) Cultivate intimacy with God through daily prayer and Bible reading. (2) Learn to listen — God often speaks in the still, small voice. (3) Be willing to obey — God gives wisdom to those who will act on it. (4) Practice discernment — test every word against Scripture. (5) Stay humble — wisdom comes to the humble, not the proud (Proverbs 11:2).",
        },
      ],
      verse:
        "\"For the Lord gives wisdom; from His mouth come knowledge and understanding.\"",
      verseRef: "— Proverbs 2:6",
      backLabel: "Back to Sermons",
    },
    es: {
      label: "Notas del Sermon",
      title: "El Don de la",
      titleAccent: "Palabra de Sabiduria",
      series: "Dones Espirituales",
      speaker: "Pastor Morris Velasquez",
      date: "6 Sep 2017",
      intro:
        "Los dones espirituales son herramientas que el Espiritu Santo da a cada creyente para la edificacion del cuerpo de Cristo. En este estudio, el Pastor Morris examina uno de los dones mas poderosos y necesarios: la palabra de sabiduria — una revelacion sobrenatural de Dios que provee direccion divina en momentos de incertidumbre.",
      sections: [
        {
          heading: "Que Es la Palabra de Sabiduria?",
          text: "La palabra de sabiduria, mencionada en 1 Corintios 12:8, no es lo mismo que la sabiduria humana o el conocimiento intelectual. Es un don sobrenatural — un fragmento de la sabiduria infinita de Dios dado a un creyente en un momento especifico para un proposito especifico. A menudo viene como una percepcion repentina, una direccion clara, o una solucion divina a un problema que parecia imposible. El rey Salomon demostro este don cuando propuso dividir al bebe entre dos mujeres que afirmaban ser la madre (1 Reyes 3:16-28). Su solucion revelo la verdad instantaneamente.",
        },
        {
          heading: "La Diferencia Entre Sabiduria y Conocimiento",
          text: "Mientras la palabra de conocimiento revela hechos sobre una situacion (lo que es o lo que fue), la palabra de sabiduria revela lo que debe hacerse (lo que sera o lo que debe suceder). El conocimiento diagnostica; la sabiduria prescribe. El conocimiento te dice donde estas; la sabiduria te dice hacia donde ir. Ambos dones trabajan juntos, pero la sabiduria es particularmente vital para lideres, pastores y cualquiera que tome decisiones que afectan a otros. Santiago 1:5 promete: \"Si alguno de vosotros tiene falta de sabiduria, pidala a Dios, el cual da a todos abundantemente.\"",
        },
        {
          heading: "Ejemplos Biblicos de Sabiduria Divina",
          text: "A lo largo de las Escrituras, vemos a Dios otorgando sabiduria sobrenatural a Sus siervos en momentos criticos. Jose interpreto los suenos de Faraon y diseno un plan para salvar a Egipto de la hambruna (Genesis 41). Daniel recibio sabiduria para interpretar la escritura en la pared (Daniel 5). Jesus demostro sabiduria perfecta cuando le preguntaron sobre pagar impuestos al Cesar — \"Dad al Cesar lo que es del Cesar\" (Mateo 22:21). En cada caso, la sabiduria vino de Dios, no del razonamiento humano.",
        },
        {
          heading: "Como Activar Este Don en Tu Vida",
          text: "El Pastor Morris enfatizo que este don esta disponible para cada creyente, no solo para pastores o lideres. Para posicionarte para recibir la palabra de sabiduria: (1) Cultiva intimidad con Dios a traves de la oracion diaria y la lectura biblica. (2) Aprende a escuchar — Dios a menudo habla en la voz apacible y delicada. (3) Disponte a obedecer — Dios da sabiduria a quienes actuaran en base a ella. (4) Practica el discernimiento — prueba toda palabra contra las Escrituras. (5) Mantente humilde — la sabiduria viene a los humildes, no a los orgullosos (Proverbios 11:2).",
        },
      ],
      verse:
        "\"Porque Jehova da la sabiduria, y de su boca viene el conocimiento y la inteligencia.\"",
      verseRef: "— Proverbios 2:6",
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

            <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-10">
              <iframe
                src="https://www.youtube.com/embed/reTiSkwk_oU"
                title={c.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <p className="text-lg text-[#4A3F35] leading-relaxed mb-12">
              {c.intro}
            </p>
          </FadeIn>

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
