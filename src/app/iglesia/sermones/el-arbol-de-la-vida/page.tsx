"use client";

import Link from "next/link";
import { ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import { useLang } from "@/lib/iglesia/use-lang";
import { FadeIn } from "@/components/iglesia/fade-in";
import { PageHero } from "@/components/iglesia/page-hero";

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export default function SermonArbolVidaPage() {
  const { lang } = useLang();

  const content = {
    en: {
      label: "Sermon Notes",
      title: "The Tree",
      titleAccent: "of Life",
      series: "Bible Study",
      speaker: "Pastor Morris Velasquez",
      date: "",
      intro:
        "From the Garden of Eden to the New Jerusalem, the tree of life appears as one of the most beautiful and mysterious symbols in all of Scripture. In this Bible study, Pastor Morris traces its meaning through the entire biblical narrative, revealing how it points to God's eternal plan of redemption and restoration.",
      sections: [
        {
          heading: "In the Beginning: The Garden of Eden",
          text: "The tree of life first appears in Genesis 2:9 — planted by God in the middle of the Garden of Eden alongside the tree of the knowledge of good and evil. Adam and Eve had free access to the tree of life; they could eat from it and live forever in God's presence. It represented eternal communion with the Creator. But when sin entered the world, God placed cherubim with flaming swords to guard the way to the tree of life (Genesis 3:24). Humanity was cut off from eternal life — not as punishment alone, but as mercy, so that we wouldn't live forever in a fallen state.",
        },
        {
          heading: "In the Wisdom Literature: A Symbol of Blessing",
          text: "The book of Proverbs uses the tree of life as a metaphor for the good things God desires to give us. Wisdom herself is called \"a tree of life to those who take hold of her\" (Proverbs 3:18). The fruit of the righteous is a tree of life (Proverbs 11:30). A desire fulfilled is a tree of life (Proverbs 13:12). Each of these references paints a picture of life as God intended it — abundant, fruitful, deeply satisfying. Even in a fallen world, we can experience glimpses of Eden when we walk in God's wisdom and righteousness.",
        },
        {
          heading: "In the Cross: The True Tree of Life",
          text: "The apostle Peter uses a remarkable phrase in 1 Peter 2:24 — Christ \"bore our sins in His body on the tree.\" The cross itself is called a tree. What Adam lost at one tree, Christ restored at another. The cross became the new tree of life — the place where death was defeated and eternal life was made available again. Through faith in Christ's sacrifice, we regain access to what was lost in the garden. Galatians 3:13 says: \"Christ redeemed us from the curse of the law by becoming a curse for us — for it is written, 'Cursed is everyone who is hanged on a tree.'\"",
        },
        {
          heading: "In Eternity: The New Jerusalem",
          text: "The Bible ends where it began — with the tree of life. In Revelation 22:1-2, John sees a river of the water of life flowing from the throne of God, and on each side of the river stands the tree of life, bearing twelve kinds of fruit, yielding its fruit every month. Its leaves are \"for the healing of the nations.\" No more cherubim guarding the way. No more separation. The curse is removed forever. Revelation 22:14 promises: \"Blessed are those who wash their robes, that they may have the right to the tree of life.\" The entire story of the Bible — from Genesis to Revelation — is the story of God restoring humanity's access to eternal life with Him.",
        },
      ],
      verse:
        "\"Blessed are those who wash their robes, that they may have the right to the tree of life and may go through the gates into the city.\"",
      verseRef: "— Revelation 22:14",
      backLabel: "Back to Sermons",
    },
    es: {
      label: "Notas del Sermon",
      title: "El Arbol",
      titleAccent: "de la Vida",
      series: "Estudio Biblico",
      speaker: "Pastor Morris Velasquez",
      date: "",
      intro:
        "Desde el Jardin del Eden hasta la Nueva Jerusalen, el arbol de la vida aparece como uno de los simbolos mas hermosos y misteriosos de toda la Escritura. En este estudio biblico, el Pastor Morris traza su significado a traves de toda la narrativa biblica, revelando como apunta al plan eterno de Dios de redencion y restauracion.",
      sections: [
        {
          heading: "En el Principio: El Jardin del Eden",
          text: "El arbol de la vida aparece por primera vez en Genesis 2:9 — plantado por Dios en medio del Jardin del Eden junto al arbol del conocimiento del bien y del mal. Adan y Eva tenian libre acceso al arbol de la vida; podian comer de el y vivir para siempre en la presencia de Dios. Representaba la comunion eterna con el Creador. Pero cuando el pecado entro al mundo, Dios coloco querubines con espadas de fuego para guardar el camino al arbol de la vida (Genesis 3:24). La humanidad fue cortada de la vida eterna — no solo como castigo, sino como misericordia, para que no vivieramos para siempre en un estado caido.",
        },
        {
          heading: "En la Literatura Sapiencial: Un Simbolo de Bendicion",
          text: "El libro de Proverbios usa el arbol de la vida como metafora de las cosas buenas que Dios desea darnos. La sabiduria misma es llamada \"arbol de vida a los que de ella echan mano\" (Proverbios 3:18). El fruto del justo es arbol de vida (Proverbios 11:30). El deseo cumplido es arbol de vida (Proverbios 13:12). Cada una de estas referencias pinta un cuadro de la vida como Dios la planifico — abundante, fructifera, profundamente satisfactoria. Aun en un mundo caido, podemos experimentar destellos del Eden cuando caminamos en la sabiduria y justicia de Dios.",
        },
        {
          heading: "En la Cruz: El Verdadero Arbol de la Vida",
          text: "El apostol Pedro usa una frase notable en 1 Pedro 2:24 — Cristo \"llevo nuestros pecados en su cuerpo sobre el madero.\" La cruz misma es llamada un madero, un arbol. Lo que Adan perdio en un arbol, Cristo lo restauro en otro. La cruz se convirtio en el nuevo arbol de la vida — el lugar donde la muerte fue derrotada y la vida eterna fue hecha disponible nuevamente. A traves de la fe en el sacrificio de Cristo, recuperamos el acceso a lo que se perdio en el jardin. Galatas 3:13 dice: \"Cristo nos redimio de la maldicion de la ley, hecho por nosotros maldicion — porque escrito esta: Maldito todo el que es colgado en un madero.\"",
        },
        {
          heading: "En la Eternidad: La Nueva Jerusalen",
          text: "La Biblia termina donde comenzo — con el arbol de la vida. En Apocalipsis 22:1-2, Juan ve un rio de agua de vida fluyendo del trono de Dios, y a cada lado del rio esta el arbol de la vida, que produce doce frutos, dando cada mes su fruto. Sus hojas son \"para la sanidad de las naciones.\" Ya no hay querubines guardando el camino. Ya no hay separacion. La maldicion es removida para siempre. Apocalipsis 22:14 promete: \"Bienaventurados los que lavan sus ropas, para tener derecho al arbol de la vida.\" Toda la historia de la Biblia — de Genesis a Apocalipsis — es la historia de Dios restaurando el acceso de la humanidad a la vida eterna con El.",
        },
      ],
      verse:
        "\"Bienaventurados los que lavan sus ropas, para tener derecho al arbol de la vida, y para entrar por las puertas en la ciudad.\"",
      verseRef: "— Apocalipsis 22:14",
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
            </div>

            <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-10">
              <iframe
                src="https://www.youtube.com/embed/zD_bPrkJ2uo"
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
