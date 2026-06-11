// Assign artists found via web search to uncategorized songs
const SUPABASE_URL = "https://dlpopmazvupiukpxurmf.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscG9wbWF6dnVwaXVrcHh1cm1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MjM1NywiZXhwIjoyMDg2NjM4MzU3fQ.1br-NU_lr9pr2htfgh43OAww6bInIaKSEFtYC9MYk7E";
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Known artist mappings from web research
// format: { pattern (regex on normalized title), artist, category }
const artistMappings = [
  // Elevation Worship
  { p: /^la bendicion|the blessing/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  { p: /^same god$/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  { p: /^authority$/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  { p: /^turnaround$/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  // Hillsong
  { p: /^100 billion/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^a hundred billion/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^so will i/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^king of majesty/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^forever reign/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^jesus lover of my soul/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^hide me now/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^oceans/i, artist: "Hillsong United", cat: "Worship Inglés" },
  { p: /^majesty.*majesty/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^majestad.*majesty/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^what a beautiful name/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^forever$|^forever \(/i, artist: "Hillsong United", cat: "Worship Inglés" },
  { p: /^i surrender/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^you are the same/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  // Christy Nockels / Passion
  { p: /^waiting here for you/i, artist: "Christy Nockels", cat: "Worship Inglés" },
  // Koryn Hawthorne
  { p: /^speak the name/i, artist: "Koryn Hawthorne", cat: "Worship Inglés" },
  // MercyMe
  { p: /^greater$/i, artist: "MercyMe", cat: "Worship Inglés" },
  // Rick Founds
  { p: /^lord.*i lift your name/i, artist: "Rick Founds", cat: "Worship Inglés" },
  // Vertical Worship
  { p: /^open.*the heavens/i, artist: "Vertical Worship", cat: "Worship Inglés" },
  // Michael W. Smith
  { p: /^surrounded|^fight my battles|^this is how i fight/i, artist: "Michael W. Smith", cat: "Worship Inglés" },
  // Sinach
  { p: /^way maker/i, artist: "Sinach", cat: "Worship Inglés" },
  // Tim Hughes
  { p: /^here i am to worship/i, artist: "Tim Hughes", cat: "Worship Inglés" },
  // Holy Holy Holy - himno clásico
  { p: /^holy holy holy$/i, artist: "Himno Clásico", cat: "Alabanza General" },
  // Amazing Grace
  { p: /^amazing grace/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^sublime gracia/i, artist: "Himno Clásico", cat: "Alabanza General" },
  // Because He Lives
  { p: /^because he lives/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^porque el vive/i, artist: "Himno Clásico", cat: "Alabanza General" },
  // Marcos Witt
  { p: /^cien ovejas/i, artist: "Marcos Witt", cat: "Adoración Español" },
  // Jesús Adrián Romero
  { p: /^cansado del camino/i, artist: "Jesús Adrián Romero", cat: "Cantautores" },
  // Daniel Calveti
  { p: /^la ni[ñn]a de tus ojos/i, artist: "Daniel Calveti", cat: "Cantautores" },
  // Varios en español conocidos
  { p: /^at the cross/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^at your feet/i, artist: "Casting Crowns", cat: "Worship Inglés" },
  { p: /^above all/i, artist: "Michael W. Smith", cat: "Worship Inglés" },
  { p: /^come now is the time/i, artist: "Brian Doerksen", cat: "Worship Inglés" },
  { p: /^draw me close/i, artist: "Kelly Carpenter", cat: "Worship Inglés" },
  { p: /^i stand.*in awe/i, artist: "Mark Altrogge", cat: "Worship Inglés" },
  { p: /^my redeemer lives/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^no longer a slave|^no longer slaves/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^your love never fails/i, artist: "Jesus Culture", cat: "Worship Inglés" },
  { p: /^your presence/i, artist: "Planetshakers", cat: "Worship Inglés" },
  { p: /^you deserve the glory/i, artist: "Terry MacAlmon", cat: "Worship Inglés" },
  { p: /^freedom reigns/i, artist: "Jesus Culture", cat: "Worship Inglés" },
  { p: /^joy unspeakable/i, artist: "Mandisa", cat: "Worship Inglés" },
  { p: /^eagles$/i, artist: "Himnos Clásicos", cat: "Alabanza General" },
  { p: /^praise the lord/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^air i breathe|^the air i breathe|^this is the air/i, artist: "Michael W. Smith", cat: "Worship Inglés" },
  { p: /^not the same/i, artist: "Building 429", cat: "Worship Inglés" },
  { p: /^faithful$/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  { p: /^everlasting.*savior/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  { p: /^everlasting$/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^eternal mercy/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^there is joy in the house/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^there is power$/i, artist: "Lincoln Brewster", cat: "Worship Inglés" },
  { p: /^there is power in the blood/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^lion and the lamb/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^my beloved/i, artist: "David Crowder", cat: "Worship Inglés" },
  { p: /^christ alone/i, artist: "Keith & Kristyn Getty", cat: "Worship Inglés" },
  { p: /^my hope is built/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^the solid rock/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^come holy spirit/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^come like you promised/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^dance like david/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^dancing generation/i, artist: "Matt Redman", cat: "Worship Inglés" },
  { p: /^thank you$/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^thank you for your kindness/i, artist: "Don Moen", cat: "Worship Inglés" },
  { p: /^we will sing/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^sing like never before/i, artist: "Matt Redman", cat: "Worship Inglés" },
  { p: /^you are here/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^you are.*wonderful/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^you are so amazing/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^you are the one$/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^for yours is the kingdom/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^name above all names/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^overflow in this place/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^oh lord you rescued/i, artist: "Hillsong United", cat: "Worship Inglés" },
  { p: /^i give you glory/i, artist: "Don Moen", cat: "Worship Inglés" },
  { p: /^on eagle.*wings/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^open my eyes/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^all the heavens/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^king of heaven$/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^i'll worship your holy name/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^lord almighty/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^lord i seek you/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^lord over everything/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^lord there is none/i, artist: "Lenny LeBlanc", cat: "Worship Inglés" },
  { p: /^lord you are faithful/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^holy.*there is no one/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^holy we cry/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^holy spirit.*welcome/i, artist: "Francesca Battistelli", cat: "Worship Inglés" },
  { p: /^be near me lord/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^aaronic blessing/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^wings$/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^millions of angels/i, artist: "Praise & Worship", cat: "Worship Inglés" },
  { p: /^i want to see/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^i.*ve got a river/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^celebrate jesus/i, artist: "Don Moen", cat: "Worship Inglés" },
  { p: /^god incomparable/i, artist: "Planetshakers", cat: "Worship Inglés" },
  { p: /^great is your faithfulness/i, artist: "Himno Clásico", cat: "Alabanza General" },
  // Español conocidos
  { p: /^a danzar.*barak/i, artist: "Barak", cat: "Adoración Español" },
  { p: /^bienvenido espiritu/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^bienvenido santo/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^ven espiritu/i, artist: "Barak", cat: "Adoración Español" },
  { p: /^ven santo espiritu/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^vengo hoy a postrarme/i, artist: "Marcos Barrientos", cat: "Adoración Español" },
  { p: /^cuan bello es el se/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^cuando miro a tu santidad/i, artist: "Wayne Watson", cat: "Worship Inglés" },
  { p: /^como hizo david/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^danzo como david/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^la gloria de dios/i, artist: "Ricardo Montaner", cat: "Alabanza General" },
  { p: /^libre soy|^i am free/i, artist: "Newsboys", cat: "Worship Inglés" },
  { p: /^sana nuestra tierra/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^sediento de ti/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^este es mi deseo/i, artist: "Danilo Montero", cat: "Cantautores" },
  { p: /^mi rosa de jardin|^rosa de jardin|^eres para mi rosa/i, artist: "Tercer Cielo", cat: "Alabanza Latina" },
  { p: /^creo en ti jesus/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^yo creo en ti/i, artist: "Alex Campos", cat: "Cantautores" },
  { p: /^i believe in you/i, artist: "Alex Campos", cat: "Cantautores" },
  { p: /^majestuoso/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^poderoso.*el es poderoso/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^poderoso su nombre/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^me levanto$/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^yo navegare/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^tu fidelidad/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^tu gracia nos hace danzar/i, artist: "Danilo Montero", cat: "Cantautores" },
  { p: /^tu mereces la gloria/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^excelso dios/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^en vez de dolor/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^coronado en majestad/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^digno.*recibir/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^digno.*gloria/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^digno es jesus/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^al rey.*los reyes/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^al rey hossana/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^al rey jesus/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^alabadle/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^alabare mix/i, artist: "Varios", cat: "Alabanza General" },
  { p: /^alabe a dios/i, artist: "Danny Berrios", cat: "Alabanza General" },
  { p: /^aleluya.*santo/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^cantare de lo bueno/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^goodness of god/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^rey de gloria/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^rev de majestad/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^rey de majestad/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^rey de mi vida/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^por siempre reinaras/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^mil generaciones/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^hasta mil generaciones/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^nuestro dios es un ex[c]?elso/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^grandes? es el se[ñn]or/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^grande y fuerte/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^great and mighty/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^dios es mas grande/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^dios el mas grande/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^mi dios es mas grande/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^hosanna al/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^hossana al/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^cristo.*muerto/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^cristo.*mover montes/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^cristo.*nombre sin igual/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^cristo jesus resucito/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^cristo yo te amo/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^el es el rey/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^el se[ñn]or puso en mi boca/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^el me levantara/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^la generacion$/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^seremos la generacion/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^gritaremos hoy/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^somos tu pueblo/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^yo le canto/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^hermoso nombre/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^cuan hermoso su nombre/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^what a wonderful name/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^bendito sea tu nombre/i, artist: "Matt Redman", cat: "Worship Inglés" },
  { p: /^no one like you/i, artist: "David Crowder", cat: "Worship Inglés" },
  { p: /^no hay saludo|^no hay un saludo/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^happy birthday/i, artist: "Varios", cat: "Alabanza General" },
  { p: /^jireh adonai/i, artist: "Paul Wilbur", cat: "Worship Inglés" },
  { p: /^yahweh/i, artist: "Paul Wilbur", cat: "Worship Inglés" },
  { p: /^yaweh/i, artist: "Paul Wilbur", cat: "Worship Inglés" },
  { p: /^inconmovible/i, artist: "Christine D'Clario", cat: "Adoración Español" },
  { p: /^increible invencible/i, artist: "Miel San Marcos", cat: "Adoración Español" },
  { p: /^dios de pactos/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^avivamiento en mi pais/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^mi alma clama/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^casa de dios/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^mejor es un dia/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^better one day/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^atmósfera/i, artist: "Barak", cat: "Adoración Español" },
  { p: /^yo quiero estar ante tu altar/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^puedo danzar/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^triunfare/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^tu iglesia te alaba/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^recordare aquella cruz/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^dios esta llamando/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^desciende aqui/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^manda la lluvia/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^poder en jesus/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^poderes y reinos/i, artist: "Keith & Kristyn Getty", cat: "Worship Inglés" },
  { p: /^resplandor del rey/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^derrama tu gloria/i, artist: "Christine D'Clario", cat: "Adoración Español" },
  { p: /^padre de misericordias/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^soy sano soy libre/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^soy quien dices/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^todo mi vida/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^toda mi vida/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^ya no soy.*esclavo/i, artist: "Bethel Music", cat: "Worship Inglés" },
  { p: /^el volvera$/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^el centro$/i, artist: "Ebenezer", cat: "Adoración Español" },
  { p: /^amen$/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^amen.*amen/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^cerca de ti yo quiero/i, artist: "Himno Clásico", cat: "Alabanza General" },
  { p: /^bendito jesus/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^yo te exalto/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^yo te adoro mi se/i, artist: "Juan Carlos Alvarado", cat: "Adoración Español" },
  { p: /^confiado andare/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^confio en dios/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  { p: /^i trust in god/i, artist: "Elevation Worship", cat: "Worship Inglés" },
  { p: /^tu nombre alabare/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^tu nombre se[ñn]or/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^tu nombre sobre todo/i, artist: "Hillsong Worship", cat: "Worship Inglés" },
  { p: /^mi sanador/i, artist: "Christine D'Clario", cat: "Adoración Español" },
  { p: /^eres mi sanador/i, artist: "Christine D'Clario", cat: "Adoración Español" },
  { p: /^cordero santo/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^dame un nuevo corazon/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^decimos santo/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^dios de mi corazon/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^santo.*dios todopoderoso/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^santo santo poderoso/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^santo digno/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^es mi salvador/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^en mi corazon hay una cancion/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^en jesus fuerte soy/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^si tuvie/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^fe como un grano/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^el saludo del cristiano/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^dios te guarde/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^quieres ser salvo/i, artist: "Praise & Worship", cat: "Alabanza General" },
  { p: /^alabado$/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^a los pies de la cruz/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^cuando esta iglesia/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^la ofrenda/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^hoy yo soy la ofrenda/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^ofrenda de adoracion/i, artist: "Marcos Witt", cat: "Adoración Español" },
  { p: /^fragancia de alabanza/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^mi alabanza sera mi arma/i, artist: "Marco Barrientos", cat: "Adoración Español" },
  { p: /^toma el pandero/i, artist: "Marcos Witt", cat: "Adoración Español" },
];

function normalize(text) {
  return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

async function fetchAllSongs() {
  const all = [];
  let offset = 0;
  while (true) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/songs?select=id,title,artist,tags&order=title.asc&offset=${offset}&limit=1000`, { headers });
    const d = await r.json();
    if (!Array.isArray(d) || d.length === 0) break;
    all.push(...d);
    if (d.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function updateSong(id, updates, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=eq.${id}`, {
        method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(updates)
      });
      return r.ok;
    } catch { if (i < retries - 1) await sleep(2000); else return false; }
  }
}

async function main() {
  console.log("=== Assign Artists from Web Search ===\n");
  console.log("1. Fetching songs...");
  const all = await fetchAllSongs();
  console.log(`   Total: ${all.length}`);

  const uncat = all.filter(s => {
    const tags = s.tags || [];
    const hasCat = tags.some(t => !["dropbox", "lacuerda", "importado"].includes(t));
    return (!s.artist || s.artist === "Unknown" || s.artist === "Desconocido") && !hasCat;
  });
  console.log(`   Uncategorized: ${uncat.length}\n`);

  const matched = [];
  const unmatched = [];

  for (const song of uncat) {
    const normTitle = normalize(song.title);
    let found = false;
    for (const mapping of artistMappings) {
      if (mapping.p.test(song.title) || mapping.p.test(normTitle)) {
        matched.push({ song, artist: mapping.artist, cat: mapping.cat });
        found = true;
        break;
      }
    }
    if (!found) unmatched.push(song);
  }

  console.log(`   Matched: ${matched.length}`);
  console.log(`   Still unmatched: ${unmatched.length}\n`);

  // Show matches
  console.log("--- MATCHED ---");
  for (const m of matched) {
    console.log(`  "${m.song.title}" → ${m.artist} [${m.cat}]`);
  }

  console.log("\n--- UNMATCHED ---");
  for (const s of unmatched) {
    console.log(`  "${s.title}"`);
  }

  // Apply updates
  console.log(`\n2. Updating ${matched.length} songs...`);
  let updated = 0;
  for (const m of matched) {
    const tags = new Set(m.song.tags || []);
    tags.add(m.cat);
    const ok = await updateSong(m.song.id, { artist: m.artist, tags: [...tags] });
    if (ok) updated++;
    if (updated % 30 === 0) await sleep(500);
    if (updated % 50 === 0) console.log(`   ${updated}/${matched.length}...`);
  }
  console.log(`   Done: ${updated} updated\n`);

  // Final dedup
  console.log("3. Final dedup...");
  const fresh = await fetchAllSongs();
  const groups = new Map();
  for (const s of fresh) {
    const k = `${normalize(s.title)}||${normalize(s.artist || "")}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(s);
  }
  const dups = [];
  for (const [, g] of groups) {
    if (g.length <= 1) continue;
    // keep first by id (arbitrary, they should be same)
    for (let i = 1; i < g.length; i++) dups.push(g[i].id);
  }
  if (dups.length > 0) {
    console.log(`   Deleting ${dups.length} duplicates...`);
    for (let i = 0; i < dups.length; i += 100) {
      const batch = dups.slice(i, i + 100);
      const idList = batch.map((id) => `"${id}"`).join(",");
      await fetch(`${SUPABASE_URL}/rest/v1/import_items?song_id=in.(${idList})`, {
        method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ song_id: null })
      }).catch(() => {});
      await fetch(`${SUPABASE_URL}/rest/v1/songs?id=in.(${idList})`, {
        method: "DELETE", headers: { ...headers, Prefer: "return=minimal" }
      }).catch(() => {});
      await sleep(300);
    }
  }

  // Final stats
  const final = await fetchAllSongs();
  let wa = 0, wc = 0, uc = 0;
  for (const s of final) {
    const tags = s.tags || [];
    const hasCat = tags.some(t => !["dropbox", "lacuerda", "importado"].includes(t));
    if (s.artist && s.artist !== "Unknown") wa++;
    if (hasCat) wc++;
    if ((!s.artist || s.artist === "Unknown") && !hasCat) uc++;
  }
  console.log(`\n=== FINAL ===`);
  console.log(`Total: ${final.length}`);
  console.log(`With artist: ${wa}`);
  console.log(`With category: ${wc}`);
  console.log(`Uncategorized: ${uc}`);
}

main().catch(console.error);
