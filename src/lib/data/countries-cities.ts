/**
 * Comprehensive 195-country dataset with 30 cities each.
 * Used in the Add Business/Listing Wizard Step 2 for Country and City/Municipality selection.
 */

export interface CountryEntry {
  name: string;
  flag: string;
  cities: string[];
  code?: string;
}

export const COUNTRIES_WITH_CITIES: CountryEntry[] = [
  {
    name: "Afghanistan",
    flag: "🇦🇫",
    cities: ["Kabul","Kandahar","Herat","Mazar-i-Sharif","Jalalabad","Kunduz","Ghazni","Balkh","Baghlan","Gardez","Khost","Sheberghan","Bamyan","Faizabad","Taloqan","Charikar","Pul-e-Khumri","Lashkar Gah","Farah","Zaranj","Asadabad","Nili","Mehtarlam","Sar-e Pol","Samangan","Aybak","Qala-i-Naw","Tarinkot","Shindand","Andkhoy"],
  },
  {
    name: "Albania",
    flag: "🇦🇱",
    cities: ["Tirana","Durrës","Vlorë","Elbasan","Shkodër","Fier","Kamëz","Korçë","Berat","Lushnjë","Kavajë","Gjirokastër","Sarandë","Pogradec","Lezhë","Kukës","Laç","Patos","Kuçovë","Burrel","Peshkopi","Rrëshen","Gramsh","Librazhd","Tepelenë","Përmet","Devoll","Delvinë","Himarë","Vorë"],
  },
  {
    name: "Algeria",
    flag: "🇩🇿",
    cities: ["Algiers","Oran","Constantine","Annaba","Blida","Batna","Djelfa","Sétif","Sidi Bel Abbès","Biskra","Tébessa","El Oued","Skikda","Tlemcen","Béjaïa","Tiaret","Bordj Bou Arréridj","M'Sila","Chlef","Mostaganem","Jijel","Saïda","Mascara","Relizane","Guelma","Khenchela","Laghouat","Ouargla","Ghardaïa","Adrar"],
  },
  {
    name: "Andorra",
    flag: "🇦🇩",
    cities: ["Andorra la Vella","Escaldes-Engordany","Encamp","Sant Julià de Lòria","La Massana","Canillo","Ordino","Pas de la Casa","El Tarter","Soldeu","Arinsal","Anyós","La Cortinada","Arinsal Village","Erts","Sispony","Pal","Aixirivall","Bixessarri","Aubinyà","Fontaneda","Llorts","El Serrat","Ransol","Canillo Village","Prats","Meritxell","Vila","Santa Coloma","Engolasters"],
  },
  {
    name: "Angola",
    flag: "🇦🇴",
    cities: ["Luanda","Huambo","Lobito","Benguela","Lubango","Malanje","Namibe","Cabinda","Soyo","Kuito","Uíge","Menongue","Sumbe","Dundo","Ndalatando","Ondjiva","Moçâmedes","Catumbela","Caxito","Luena","Saurimo","Tomboco","Gabela","Porto Amboim","Waku-Kungo","Caála","Chitato","Camacupa","Cubal","M'banza-Kongo"],
  },
  {
    name: "Antigua and Barbuda",
    flag: "🇦🇬",
    cities: ["St. John's","All Saints","Liberta","Potters Village","Bolans","Parham","Piggotts","Freetown","Willikies","Urlings","Old Road","Codrington","English Harbour","Falmouth","Cedar Grove","Jennings","Swetes","Seaview Farm","Glanvilles","Five Islands Village","Woods","Herberts","Clare Hall","Cooks","Gray's Farm","Buckleys","Johnsons Point","Seatons","Cassada Gardens","Freemans"],
  },
  {
    name: "Argentina",
    flag: "🇦🇷",
    cities: ["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata","San Miguel de Tucumán","Mar del Plata","Salta","Santa Fe","San Juan","Resistencia","Neuquén","Santiago del Estero","Corrientes","Posadas","San Salvador de Jujuy","Bahía Blanca","Paraná","Formosa","San Luis","La Rioja","Catamarca","Río Cuarto","Comodoro Rivadavia","Concordia","San Nicolás de los Arroyos","Santa Rosa","Tandil","Ushuaia","Puerto Madryn"],
  },
  {
    name: "Armenia",
    flag: "🇦🇲",
    cities: ["Yerevan","Gyumri","Vanadzor","Vagharshapat","Abovyan","Kapan","Hrazdan","Armavir","Artashat","Ijevan","Gavar","Sevan","Goris","Charentsavan","Ararat","Ashtarak","Masis","Hoktemberyan","Spitak","Dilijan","Sisian","Alaverdi","Stepanavan","Martuni","Vardenis","Yeghvard","Aparan","Berd","Maralik","Tashir"],
  },
  {
    name: "Australia",
    flag: "🇦🇺",
    cities: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Newcastle","Wollongong","Geelong","Hobart","Townsville","Cairns","Darwin","Toowoomba","Ballarat","Bendigo","Albury","Launceston","Mackay","Rockhampton","Bunbury","Bundaberg","Coffs Harbour","Wagga Wagga","Hervey Bay","Mildura","Shepparton","Port Macquarie","Gladstone"],
  },
  {
    name: "Austria",
    flag: "🇦🇹",
    cities: ["Vienna","Graz","Linz","Salzburg","Innsbruck","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn","Wiener Neustadt","Steyr","Feldkirch","Bregenz","Leonding","Klosterneuburg","Traun","Baden bei Wien","Wolfsberg","Leoben","Krems an der Donau","Amstetten","Kapfenberg","Hallein","Kufstein","Schwechat","Ternitz","Braunau am Inn","Spittal an der Drau","Eisenstadt"],
  },
  {
    name: "Azerbaijan",
    flag: "🇦🇿",
    cities: ["Baku","Ganja","Sumqayit","Lankaran","Mingachevir","Nakhchivan","Shirvan","Yevlakh","Shaki","Khirdalan","Naftalan","Qabala","Quba","Shamakhi","Salyan","Agjabadi","Barda","Bilasuvar","Jalilabad","Imishli","Sabirabad","Saatli","Astara","Masalli","Goychay","Goygol","Tovuz","Agdash","Zaqatala","Balakan"],
  },
  {
    name: "Bahamas",
    flag: "🇧🇸",
    cities: ["Nassau","Freeport","West End","Marsh Harbour","Cooper's Town","George Town","Dunmore Town","Governor's Harbour","Rock Sound","Alice Town","Andros Town","Nichollstown and Berry Islands","Arthur's Town","Cockburn Town","Clarence Town","Duncan Town","Matthew Town","Port Nelson","Spanish Wells","High Rock","Fresh Creek","Mangrove Cay","The Bluff","San Andros","Deadman's Cay","Simms","Pirates Well","Sandy Point","Cherokee Point","Treasure Cay"],
  },
  {
    name: "Bahrain",
    flag: "🇧🇭",
    cities: ["Manama","Riffa","Muharraq","Hamad Town","A'ali","Isa Town","Sitra","Jidhafs","Budaiya","Al Hidd","Jid Ali","Sanabis","Tubli","Diraz","Barbar","Saar","Karzakan","Bani Jamra","Daih","Al Duraz","Jannusan","Adliya","Seef","Zinj","Galali","Arad","Askar","Jaww","Zallaq","Salmabad"],
  },
  {
    name: "Bangladesh",
    flag: "🇧🇩",
    cities: ["Dhaka","Chattogram","Khulna","Rajshahi","Sylhet","Rangpur","Mymensingh","Barishal","Comilla","Narayanganj","Gazipur","Tongi","Bogra","Savar","Jessore","Cox's Bazar","Dinajpur","Narsingdi","Tangail","Jamalpur","Pabna","Kushtia","Faridpur","Saidpur","Feni","Noakhali","Brahmanbaria","Sreemangal","Moulvibazar","Rangamati"],
  },
  {
    name: "Barbados",
    flag: "🇧🇧",
    cities: ["Bridgetown","Speightstown","Oistins","Holetown","Bathsheba","Crane","Six Cross Roads","Hastings","Warrens","Black Rock","Worthing","Christ Church","Saint Lawrence","Maxwell","Dover","Rockley","St. Philip","St. George","St. Michael","St. James","St. Peter","St. Lucy","St. Andrew","St. Joseph","St. John","St. Thomas","The Belle","Crab Hill","Diamond Corner","Welchman Hall"],
  },
  {
    name: "Belarus",
    flag: "🇧🇾",
    cities: ["Minsk","Gomel","Mogilev","Vitebsk","Grodno","Brest","Babruysk","Baranavichy","Barysaw","Pinsk","Orsha","Mazyr","Salihorsk","Novopolotsk","Lida","Molodechno","Polotsk","Slutsk","Zhlobin","Svetlogorsk","Rechytsa","Kobryn","Volkovysk","Smarhon","Osipovichi","Navahrudak","Dobrush","Horki","Krichev","Luninets"],
  },
  {
    name: "Belgium",
    flag: "🇧🇪",
    cities: ["Brussels","Antwerp","Ghent","Charleroi","Liège","Bruges","Namur","Leuven","Mons","Mechelen","Aalst","La Louvière","Kortrijk","Hasselt","Ostend","Sint-Niklaas","Tournai","Genk","Seraing","Roeselare","Verviers","Mouscron","Dendermonde","Turnhout","Beringen","Dilbeek","Vilvoorde","Herentals","Waregem","Lommel"],
  },
  {
    name: "Belize",
    flag: "🇧🇿",
    cities: ["Belize City","San Ignacio","Belmopan","Orange Walk Town","San Pedro","Dangriga","Corozal Town","Punta Gorda","Benque Viejo del Carmen","Ladyville","San Antonio","Independence","Placencia","Hopkins","San Jose Succotz","Valley of Peace","Spanish Lookout","Yo Creek","Trial Farm","Camalote","Burrell Boom","Hattieville","Crooked Tree","Gales Point","Toledo Settlement","Silver Creek","Mango Creek","Bella Vista","Guinea Grass","Teakettle"],
  },
  {
    name: "Benin",
    flag: "🇧🇯",
    cities: ["Cotonou","Porto-Novo","Parakou","Abomey-Calavi","Djougou","Bohicon","Abomey","Natitingou","Lokossa","Ouidah","Savalou","Kandi","Aplahoué","Sakété","Comè","Malanville","Pobè","Nikki","Bassila","Allada","Dogbo","Ketou","Bembèrèkè","Tchaourou","Save","Dassa-Zoumè","Bantè","Grand-Popo","Tanguiéta","Kétou"],
  },
  {
    name: "Bhutan",
    flag: "🇧🇹",
    cities: ["Thimphu","Phuntsholing","Punakha","Paro","Gelephu","Samdrup Jongkhar","Wangdue Phodrang","Jakar","Trashigang","Mongar","Trongsa","Sarpang","Tsirang","Dagana","Samtse","Sankosh","Lhuentse","Trashiyangtse","Pemagatshel","Damphu","Tashichho Dzong area","Nganglam","Kanglung","Deothang","Chhukha","Gasa","Haa","Zhemgang","Panbang","Bumthang"],
  },
  {
    name: "Bolivia",
    flag: "🇧🇴",
    cities: ["Santa Cruz de la Sierra","La Paz","Cochabamba","Sucre","Oruro","Tarija","Potosí","Sacaba","Quillacollo","Montero","Trinidad","Riberalta","Cobija","Yacuiba","Tiquipaya","Warnes","Camiri","Villazón","Bermejo","Viacha","Llallagua","Guayaramerín","Tupiza","San Ignacio de Velasco","Colcapirhua","Cotoca","La Guardia","El Alto","Uyuni","Colomi"],
  },
  {
    name: "Bosnia and Herzegovina",
    flag: "🇧🇦",
    cities: ["Sarajevo","Banja Luka","Tuzla","Zenica","Mostar","Bijeljina","Brčko","Prijedor","Doboj","Cazin","Trebinje","Bihać","Živinice","Gradačac","Visoko","Zvornik","Gračanica","Travnik","Bugojno","Konjic","Goražde","Livno","Široki Brijeg","Orašje","Srebrenik","Kakanj","Velika Kladuša","Lukavac","Vitez","Jajce"],
  },
  {
    name: "Botswana",
    flag: "🇧🇼",
    cities: ["Gaborone","Francistown","Molepolole","Maun","Serowe","Kanye","Mahalapye","Mochudi","Palapye","Tlokweng","Ramotswa","Lobatse","Kgatleng","Kasane","Jwaneng","Selibe Phikwe","Tonota","Thamaga","Moshupa","Tutume","Ghanzi","Bobonong","Letlhakane","Orapa","Hukuntsi","Tsabong","Mmadinare","Shakawe","Nata","Gweta"],
  },
  {
    name: "Brazil",
    flag: "🇧🇷",
    cities: ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba","Recife","Goiânia","Belém","Porto Alegre","Guarulhos","Campinas","São Luís","São Gonçalo","Maceió","Duque de Caxias","Natal","Campo Grande","Teresina","São Bernardo do Campo","João Pessoa","Osasco","Santo André","Jaboatão dos Guararapes","Contagem","Uberlândia","Sorocaba","Ribeirão Preto"],
  },
  {
    name: "Brunei",
    flag: "🇧🇳",
    cities: ["Bandar Seri Begawan","Kuala Belait","Seria","Tutong","Bangar","Muara","Jerudong","Gadong","Sengkurong","Mentiri","Kilanas","Berakas","Lambak","Rimba","Menglait","Mata-Mata","Kiarong","Bunut","Lumapas","Sungai Liang","Labi","Kampong Ayer","Kuala Lurah","Serasa","Pekan Tutong","Pekan Bangar","Sungai Kedayan","Telisai","Lamunin","Kiudang"],
  },
  {
    name: "Bulgaria",
    flag: "🇧🇬",
    cities: ["Sofia","Plovdiv","Varna","Burgas","Ruse","Stara Zagora","Pleven","Sliven","Dobrich","Shumen","Pernik","Haskovo","Yambol","Pazardzhik","Blagoevgrad","Veliko Tarnovo","Vratsa","Gabrovo","Asenovgrad","Vidin","Kazanlak","Kardzhali","Kyustendil","Montana","Targovishte","Dimitrovgrad","Silistra","Lovech","Razgrad","Dupnitsa"],
  },
  {
    name: "Burkina Faso",
    flag: "🇧🇫",
    cities: ["Ouagadougou","Bobo-Dioulasso","Koudougou","Banfora","Ouahigouya","Dédougou","Fada N'Gourma","Tenkodogo","Kaya","Ziniaré","Dori","Gaoua","Manga","Réo","Koupéla","Po","Diapaga","Djibo","Kongoussi","Yako","Bogandé","Gorom-Gorom","Houndé","Dano","Diébougou","Tougan","Solenzo","Orodara","Nouna","Kombissiri"],
  },
  {
    name: "Burundi",
    flag: "🇧🇮",
    cities: ["Bujumbura","Gitega","Muyinga","Ngozi","Ruyigi","Kayanza","Bururi","Makamba","Rumonge","Cibitoke","Bubanza","Rutana","Karuzi","Muramvya","Mwaro","Kirundo","Cankuzo","Kibumbu","Kiremba","Kiganda","Kabezi","Isale","Mabayi","Bugarama","Nyanza-Lac","Kibago","Kayogoro","Mabanda","Mpanda","Musongati"],
  },
  {
    name: "Cabo Verde",
    flag: "🇨🇻",
    cities: ["Praia","Mindelo","Santa Maria","Assomada","Espargos","Pedra Badejo","São Filipe","Tarrafal","Porto Novo","Sal Rei","Cidade Velha","Ribeira Grande","Ponta do Sol","São Domingos","Calheta de São Miguel","Santa Cruz","Mosteiros","Vila do Maio","Povoação Velha","Ribeira Brava","Tarrafal de São Nicolau","Cova Figueira","Achada Igreja","Achada Lem","João Teves","Chã de Igreja","Ribeira da Prata","Calheta","Preguiça","Fajã"],
  },
  {
    name: "Cambodia",
    flag: "🇰🇭",
    cities: ["Phnom Penh","Siem Reap","Battambang","Sihanoukville","Poipet","Kampong Cham","Kampong Speu","Kampong Chhnang","Kampong Thom","Kampot","Krong Suong","Pursat","Sisophon","Takeo","Svay Rieng","Kep","Kratie","Stung Treng","Banlung","Samraong","Pailin","Suong","Prey Veng","Doun Kaev","Chbar Mon","Ta Khmau","Serei Saophoan","Krong Bavet","Krong Stueng Saen","Krong Samraong"],
  },
  {
    name: "Cameroon",
    flag: "🇨🇲",
    cities: ["Yaoundé","Douala","Garoua","Bamenda","Maroua","Bafoussam","Ngaoundéré","Bertoua","Kumba","Limbe","Nkongsamba","Ebolowa","Kribi","Buea","Edéa","Foumban","Dschang","Mbalmayo","Loum","Kousseri","Mokolo","Guider","Meiganga","Batouri","Yagoua","Sangmélima","Tiko","Mutengene","Kumbo","Wum"],
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    cities: ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Kitchener","London","Halifax","Victoria","Windsor","Oshawa","Saskatoon","St. Catharines","Regina","St. John's","Barrie","Kelowna","Abbotsford","Kingston","Greater Sudbury","Sherbrooke","Guelph","Trois-Rivières","Moncton","Brantford","Thunder Bay"],
  },
  {
    name: "Central African Republic",
    flag: "🇨🇫",
    cities: ["Bangui","Bimbo","Berbérati","Carnot","Bambari","Bouar","Bria","Bossangoa","Kaga-Bandoro","Sibut","Bozoum","Mbaïki","Nola","Damara","Batangafo","Mobaye","Bangassou","Rafai","Obo","Zemio","Yaloké","Paoua","Bouca","Boda","Gambo","Alindao","Kouango","Grimari","Ippy","Dekoa"],
  },
  {
    name: "Chad",
    flag: "🇹🇩",
    cities: ["N'Djamena","Moundou","Sarh","Abéché","Kélo","Am Timan","Mongo","Doba","Pala","Ati","Faya-Largeau","Bongor","Abeche","Fada","Massaguet","Bol","Mao","Moussoro","Biltine","Faya","Fianga","Laï","Léré","Massenya","Moussoro","Oum Hadjer","Pala","Bongor","Goz Beïda","Amdjarass"],
  },
  {
    name: "Chile",
    flag: "🇨🇱",
    cities: ["Santiago","Puente Alto","Antofagasta","Viña del Mar","Valparaíso","Talcahuano","San Bernardo","Temuco","Iquique","Concepción","Rancagua","La Serena","Puerto Montt","Coquimbo","Osorno","Valdivia","Arica","Talca","Chillán","Calama","Copiapó","Quilpué","Curicó","Los Ángeles","Villa Alemana","Coronel","Punta Arenas","Melipilla","San Antonio","Linares"],
  },
  {
    name: "China",
    flag: "🇨🇳",
    cities: ["Shanghai","Beijing","Chongqing","Guangzhou","Shenzhen","Tianjin","Chengdu","Nanjing","Wuhan","Xi'an","Hangzhou","Dongguan","Foshan","Shenyang","Qingdao","Jinan","Changsha","Harbin","Zhengzhou","Kunming","Dalian","Xiamen","Hefei","Ningbo","Fuzhou","Nanchang","Changchun","Shijiazhuang","Taiyuan","Ürümqi"],
  },
  {
    name: "Colombia",
    flag: "🇨🇴",
    cities: ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta","Soacha","Bucaramanga","Pereira","Santa Marta","Ibagué","Villavicencio","Manizales","Pasto","Montería","Neiva","Valledupar","Armenia","Sincelejo","Popayán","Buenaventura","Florencia","Tunja","Riohacha","Quibdó","Palmira","Cartago","Apartadó","Bello","Barrancabermeja"],
  },
  {
    name: "Comoros",
    flag: "🇰🇲",
    cities: ["Moroni","Mutsamudu","Fomboni","Domoni","Foumbouni","Moya","Mitsamiouli","Iconi","Sima","Ouani","Bambadjani","Mbéni","Bouni","Mirontsi","Koni-Djodjo","Chindini","Kangani","Nioumachoua","Dembeni","Kokoni","Bandamadji","Dzahadjou","Mramani","Tsidjé","Hantsambou","Salimani","Bambao","Sima Moya","Moya-Mutsamudu","Karthala"],
  },
  {
    name: "Congo, Democratic Republic of the",
    flag: "🇨🇩",
    cities: ["Kinshasa","Lubumbashi","Mbuji-Mayi","Kananga","Kisangani","Bukavu","Tshikapa","Kolwezi","Likasi","Goma","Matadi","Kikwit","Uvira","Bunia","Beni","Butembo","Kalemie","Kindu","Gemena","Isiro","Bandundu","Mbandaka","Boma","Mwene-Ditu","Kabinda","Kamina","Gbadolite","Lisala","Boende","Kongolo"],
  },
  {
    name: "Congo, Republic of the",
    flag: "🇨🇬",
    cities: ["Brazzaville","Pointe-Noire","Dolisie","Nkayi","Ouésso","Madingou","Mossendjo","Impfondo","Gamboma","Djambala","Sibiti","Kinkala","Owando","Loandjili","Makoua","Madingou-Kayes","Mouyondzi","Ewo","Sembe","Pokola","Mossaka","Loubomo","Kellé","Boundji","Ollombo","Hinda","Madingou","Kindamba","Mindouli","Mayoko"],
  },
  {
    name: "Costa Rica",
    flag: "🇨🇷",
    cities: ["San José","Alajuela","Cartago","Heredia","Liberia","Puntarenas","Limón","San Isidro de El General","Desamparados","San Vicente","Curridabat","San Rafael","Escazú","Santa Ana","Paraíso","San Ramón","Grecia","Nicoya","Ciudad Quesada","Turrialba","Guápiles","Aserrí","Orotina","Quepos","Golfito","Tilarán","Cañas","Siquirres","Atenas","La Cruz"],
  },
  {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    cities: ["Abidjan","Bouaké","Yamoussoukro","Daloa","San-Pédro","Korhogo","Man","Divo","Gagnoa","Abengourou","Anyama","Agboville","Grand-Bassam","Dabou","Bondoukou","Séguéla","Odienné","Ferkessédougou","Adzopé","Issia","Sassandra","Soubré","Aboisso","Bingerville","Guiglo","Duékoué","Toumodi","Daoukro","Bouna","Dimbokro"],
  },
  {
    name: "Croatia",
    flag: "🇭🇷",
    cities: ["Zagreb","Split","Rijeka","Osijek","Zadar","Pula","Slavonski Brod","Karlovac","Varaždin","Šibenik","Dubrovnik","Sisak","Bjelovar","Kaštela","Samobor","Vinkovci","Vukovar","Koprivnica","Čakovec","Požega","Solin","Zaprešić","Đakovo","Metković","Sinj","Makarska","Trogir","Knin","Našice","Kutina"],
  },
  {
    name: "Cuba",
    flag: "🇨🇺",
    cities: ["Havana","Santiago de Cuba","Camagüey","Holguín","Guantánamo","Santa Clara","Las Tunas","Bayamo","Cienfuegos","Pinar del Río","Matanzas","Ciego de Ávila","Sancti Spíritus","Manzanillo","Cárdenas","Palma Soriano","Moa","Nuevitas","Artemisa","Mayarí","Morón","Colon","Jovellanos","Sagua la Grande","Baracoa","Güines","Trinidad","Remedios","Caibarién","San José de las Lajas"],
  },
  {
    name: "Cyprus",
    flag: "🇨🇾",
    cities: ["Nicosia","Limassol","Larnaca","Paphos","Famagusta","Strovolos","Aradippou","Aglantzia","Lakatamia","Engomi","Paralimni","Germasogeia","Deryneia","Polis","Lefkara","Kyrenia","Morphou","Protaras","Ayia Napa","Peyia","Ypsonas","Mesa Geitonia","Agios Athanasios","Dali","Geri","Sotira","Dhromolaxia","Kiti","Kouklia","Pissouri"],
  },
  {
    name: "Czechia",
    flag: "🇨🇿",
    cities: ["Prague","Brno","Ostrava","Plzeň","Liberec","Olomouc","České Budějovice","Hradec Králové","Pardubice","Ústí nad Labem","Zlín","Havířov","Kladno","Most","Opava","Frýdek-Místek","Jihlava","Teplice","Karviná","Děčín","Chomutov","Karlovy Vary","Mladá Boleslav","Jablonec nad Nisou","Prostějov","Přerov","Česká Lípa","Třebíč","Tábor","Znojmo"],
  },
  {
    name: "Denmark",
    flag: "🇩🇰",
    cities: ["Copenhagen","Aarhus","Odense","Aalborg","Esbjerg","Randers","Kolding","Horsens","Vejle","Roskilde","Herning","Silkeborg","Næstved","Fredericia","Viborg","Køge","Holstebro","Taastrup","Hillerød","Slagelse","Sønderborg","Svendborg","Helsingør","Hjørring","Holbæk","Frederikshavn","Glostrup","Birkerød","Skive","Ringsted"],
  },
  {
    name: "Djibouti",
    flag: "🇩🇯",
    cities: ["Djibouti City","Ali Sabieh","Tadjoura","Obock","Dikhil","Arta","Holhol","Dorra","Yoboki","Randa","As Eyla","Balho","Goubetto","Ali Adde","Galafi","Loyada","Khor Angar","Mouloud","PK 20","Dorra District","Ras Dika","Mabla","Bouljourta","Daasbiyo","Wea","Day","Karta","Gagade","Andoli","Holl-Holl"],
  },
  {
    name: "Dominica",
    flag: "🇩🇲",
    cities: ["Roseau","Portsmouth","Marigot","Mahaut","Berekua","Wesley","La Plaine","Soufrière","Castle Bruce","Salisbury","Massacre","Canefield","Pont Cassé","Colihaut","Vieille Case","Grand Bay","Coulibistrie","Goodwill","Loubiere","Fond Cani","Trafalgar","Laudat","Picard","Woodford Hill","Calibishie","Paix Bouche","Thibaud","Dublanc","Morne Jaune","Rosalie"],
  },
  {
    name: "Dominican Republic",
    flag: "🇩🇴",
    cities: ["Santo Domingo","Santiago de los Caballeros","Santo Domingo Este","Santo Domingo Norte","Santo Domingo Oeste","San Pedro de Macorís","La Romana","San Cristóbal","Puerto Plata","La Vega","San Francisco de Macorís","Higüey","Moca","Bonao","Baní","Barahona","Azua","Bávaro","Punta Cana","Hato Mayor del Rey","Nagua","Mao","Cotuí","Bajos de Haina","Monte Cristi","Dajabón","Samaná","Las Terrenas","Jarabacoa","Constanza"],
  },
  {
    name: "Ecuador",
    flag: "🇪🇨",
    cities: ["Guayaquil","Quito","Cuenca","Santo Domingo","Machala","Durán","Manta","Portoviejo","Loja","Ambato","Riobamba","Quevedo","Milagro","Ibarra","Esmeraldas","Babahoyo","Tulcán","La Libertad","Santa Elena","Huaquillas","Nueva Loja","El Carmen","Pasaje","Chone","Otavalo","Cayambe","Salinas","Playas","Latacunga","Azogues"],
  },
  {
    name: "Egypt",
    flag: "🇪🇬",
    cities: ["Cairo","Alexandria","Giza","Shubra El Kheima","Port Said","Suez","Luxor","Mansoura","Tanta","Asyut","Ismailia","Faiyum","Zagazig","Damietta","Aswan","Minya","Qena","Sohag","Beni Suef","Hurghada","Shibin El Kom","Kafr El Sheikh","Damanhur","Banha","Arish","Mallawi","10th of Ramadan City","6th of October City","New Cairo","Obour"],
  },
  {
    name: "El Salvador",
    flag: "🇸🇻",
    cities: ["San Salvador","Santa Ana","San Miguel","Soyapango","Santa Tecla","Mejicanos","Apopa","Delgado","Sonsonate","San Marcos","Ilopango","Usulután","Ahuachapán","Cojutepeque","Zacatecoluca","La Unión","La Libertad","Chalchuapa","Quezaltepeque","Antiguo Cuscatlán","San Martín","Cuscatancingo","Sensuntepeque","Metapán","Acajutla","Izalco","San Vicente","Jiquilisco","Chalatenango","Suchitoto"],
  },
  {
    name: "Equatorial Guinea",
    flag: "🇬🇶",
    cities: ["Malabo","Bata","Ebebiyin","Mongomo","Aconibe","Luba","Evinayong","Mongomeyen","Micomeseng","Añisok","Cogo","Rebola","Riaba","Niefang","Mbini","Bidjabidjan","Machinda","Mongomo de Guadalupe","Nkue","Bicurga","Baney","Ayene","Bitica","Corisco","Cocobeach","Mongomeyen Airport area","Mongomo District","Luba District","Bata District","Ebebiyin District"],
  },
  {
    name: "Eritrea",
    flag: "🇪🇷",
    cities: ["Asmara","Keren","Massawa","Assab","Mendefera","Barentu","Dekemhare","Adi Keyh","Agordat","Teseney","Nakfa","Adi Quala","Ghinda","Senafe","Afabet","Fenkil","Hagaz","Nefasit","Dahlak Kebir","Massawa Port","Kassala Border area","Mai Aini","Fode","Logo Anseba","Shieb","Karora","Emni Haili","Serejeka","Zula","Hirgigo"],
  },
  {
    name: "Estonia",
    flag: "🇪🇪",
    cities: ["Tallinn","Tartu","Narva","Pärnu","Kohtla-Järve","Viljandi","Maardu","Rakvere","Kuressaare","Sillamäe","Võru","Valga","Jõhvi","Haapsalu","Keila","Paide","Elva","Saue","Põlva","Tapa","Kiviõli","Rapla","Jõgeva","Põltsamaa","Paldiski","Kärdla","Loksa","Türi","Otepää","Kunda"],
  },
  {
    name: "Eswatini",
    flag: "🇸🇿",
    cities: ["Mbabane","Manzini","Lobamba","Siteki","Nhlangano","Piggs Peak","Malkerns","Matsapha","Big Bend","Hluti","Lavumisa","Hlatikulu","Mankayane","Ngwenya","Sidvokodvo","Bulembu","Bhunya","Kwaluseni","Ezulwini","Lobamba Royal Village","Mhlume","Simunye","Tshaneni","Nsoko","Mpaka","Siphofaneni","Matsanjeni","Mahamba","Hhohho","Mbadlane"],
  },
  {
    name: "Ethiopia",
    flag: "🇪🇹",
    cities: ["Addis Ababa","Dire Dawa","Mekelle","Gondar","Bahir Dar","Adama","Hawassa","Jimma","Dessie","Bishoftu","Jijiga","Shashamane","Wukro","Wolaita Sodo","Debre Birhan","Debre Markos","Hosaena","Harar","Dilla","Nekemte","Debre Tabor","Kombolcha","Axum","Bedele","Gode","Asella","Ambo","Woldiya","Shire","Adigrat"],
  },
  {
    name: "Fiji",
    flag: "🇫🇯",
    cities: ["Suva","Nadi","Lautoka","Labasa","Ba","Nausori","Savusavu","Sigatoka","Rakiraki","Levuka","Lami","Navua","Tavua","Korovou","Seaqaqa","Vatukoula","Nadi Town","Nabouwalu","Nasinu","Pacific Harbour","Deuba","Korotogo","Lautoka City","Labasa Town","Kavala","Vunidawa","Dreketi","Tavua Town","Wainibuka","Koro Island"],
  },
  {
    name: "Finland",
    flag: "🇫🇮",
    cities: ["Helsinki","Espoo","Tampere","Vantaa","Oulu","Turku","Jyväskylä","Kuopio","Lahti","Pori","Kouvola","Joensuu","Lappeenranta","Hämeenlinna","Vaasa","Seinäjoki","Rovaniemi","Mikkeli","Kotka","Salo","Porvoo","Kokkola","Hyvinkää","Lohja","Järvenpää","Rauma","Kajaani","Kerava","Kemi","Savonlinna"],
  },
  {
    name: "France",
    flag: "🇫🇷",
    cities: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Montpellier","Strasbourg","Bordeaux","Lille","Rennes","Reims","Le Havre","Saint-Étienne","Toulon","Grenoble","Dijon","Angers","Nîmes","Villeurbanne","Clermont-Ferrand","Le Mans","Aix-en-Provence","Brest","Tours","Amiens","Limoges","Annecy","Perpignan","Boulogne-Billancourt"],
  },
  {
    name: "Gabon",
    flag: "🇬🇦",
    cities: ["Libreville","Port-Gentil","Franceville","Oyem","Moanda","Mouila","Lambaréné","Tchibanga","Koulamoutou","Makokou","Bitam","Ntoum","Lastoursville","Gamba","Mitzic","Ndendé","Fougamou","Mayumba","Cocobeach","Mékambo","Mounana","Okondja","Akiéni","Mbigou","Mimongo","Booué","Bifoun","Ndjolé","Lékoni","Ntoum Nord"],
  },
  {
    name: "Gambia",
    flag: "🇬🇲",
    cities: ["Banjul","Serekunda","Brikama","Bakau","Farafenni","Lamin","Basse Santa Su","Sukuta","Brufut","Gunjur","Barra","Janjanbureh","Basse","Bansang","Bwiam","Essau","Kerewan","Kololi","Fajara","Bakoteh","Tallinding","Kanifing","Abuko","Yundum","Soma","Mansa Konko","Kuntaur","Georgetown","Juffureh","Tanji"],
  },
  {
    name: "Georgia",
    flag: "🇬🇪",
    cities: ["Tbilisi","Batumi","Kutaisi","Rustavi","Gori","Zugdidi","Poti","Kobuleti","Khashuri","Samtredia","Senaki","Zestaponi","Marneuli","Telavi","Akhaltsikhe","Kvareli","Borjomi","Gardabani","Chiatura","Tsqaltubo","Kaspi","Sagarejo","Bolnisi","Gurjaani","Ozurgeti","Mtskheta","Akhalkalaki","Dusheti","Sachkhere","Ambrolauri"],
  },
  {
    name: "Germany",
    flag: "🇩🇪",
    cities: ["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Dortmund","Essen","Bremen","Dresden","Hanover","Nuremberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster","Karlsruhe","Mannheim","Augsburg","Wiesbaden","Gelsenkirchen","Mönchengladbach","Braunschweig","Kiel","Aachen","Chemnitz"],
  },
  {
    name: "Ghana",
    flag: "🇬🇭",
    cities: ["Accra","Kumasi","Tamale","Sekondi-Takoradi","Ashaiman","Sunyani","Cape Coast","Obuasi","Teshie","Tema","Madina","Koforidua","Wa","Techiman","Ho","Tarkwa","Kasoa","Dome","Bolgatanga","Yendi","Nkawkaw","Swedru","Aflao","Elmina","Winneba","Berekum","Salaga","Navrongo","Axim","Kintampo"],
  },
  {
    name: "Greece",
    flag: "🇬🇷",
    cities: ["Athens","Thessaloniki","Patras","Heraklion","Larissa","Volos","Rhodes","Ioannina","Chania","Agrinio","Kalamata","Alexandroupoli","Katerini","Lamia","Komotini","Kavala","Chalcis","Serres","Tripoli","Corfu","Drama","Veria","Kozani","Rethymno","Xanthi","Orestiada","Mytilene","Kos","Sparta","Nafplio"],
  },
  {
    name: "Grenada",
    flag: "🇬🇩",
    cities: ["St. George's","Gouyave","Grenville","Sauteurs","Hillsborough","Victoria","St. David's","Grand Anse","Lance aux Épines","Morne Rouge","Carriacou","Hillsborough Town","Tivoli","Westerhall","St. George","Calliste","Calivigny","Tempe","Fontenoy","Beausejour","Birch Grove","Concord","Dunfermline","La Fortune","Mt. Gay","Grand Bras","Petit Etang","Hermitage","Belmont","River Sallee"],
  },
  {
    name: "Guatemala",
    flag: "🇬🇹",
    cities: ["Guatemala City","Mixco","Villa Nueva","Quetzaltenango","Escuintla","San Miguel Petapa","Villa Canales","Cobán","Huehuetenango","Chimaltenango","Puerto Barrios","Jalapa","Chiquimula","Antigua Guatemala","Totonicapán","Mazatenango","Retalhuleu","Jutiapa","Flores","Sololá","Panajachel","Zacapa","Amatitlán","Santa Lucía Cotzumalguapa","Cuilapa","San Marcos","Coatepeque","Malacatán","Tiquisate","Barberena"],
  },
  {
    name: "Guinea",
    flag: "🇬🇳",
    cities: ["Conakry","Nzérékoré","Kankan","Kindia","Labé","Kissidougou","Mamou","Boké","Guéckédou","Faranah","Siguiri","Macenta","Coyah","Dubréka","Fria","Dabola","Dalaba","Télimélé","Forécariah","Kouroussa","Koundara","Mali","Lola","Beyla","Yomou","Tougué","Pita","Gaoual","Koubia","Dinguiraye"],
  },
  {
    name: "Guinea-Bissau",
    flag: "🇬🇼",
    cities: ["Bissau","Bafatá","Gabú","Cacheu","Bolama","Bubaque","Catió","Canchungo","Buba","Quinhamel","Mansôa","Farim","Bissorã","Bambadinca","Quebo","Fulacunda","Cacine","São Domingos","Mansaba","Empada","Nhacra","Prabis","Safim","Bigene","Bula","Contuboel","Pirada","Tite","Bedanda","Cuntum"],
  },
  {
    name: "Guyana",
    flag: "🇬🇾",
    cities: ["Georgetown","Linden","New Amsterdam","Corriverton","Bartica","Skeldon","Rose Hall","Anna Regina","Vreed-en-Hoop","Parika","Lethem","Mabaruma","Mahdia","Suddie","Charity","Springlands","Rosignol","Fort Wellington","Mahaica","Cove and John","Leonora","Wakenaam","Essequibo Coast","Port Kaituma","Ituni","Kwakwani","Aishalton","Albion","Canje","Mahaicony"],
  },
  {
    name: "Haiti",
    flag: "🇭🇹",
    cities: ["Port-au-Prince","Cap-Haïtien","Carrefour","Delmas","Pétion-Ville","Gonaïves","Les Cayes","Jacmel","Port-de-Paix","Saint-Marc","Jérémie","Hinche","Fort-Liberté","Ouanaminthe","Mirebalais","Petit-Goâve","Léogâne","Croix-des-Bouquets","Cité Soleil","Dessalines","Anse-à-Veau","Aquin","Miragoâne","Limbé","Grande-Rivière-du-Nord","Trou-du-Nord","Thomazeau","Cabaret","Arcahaie","Port-Salut"],
  },
  {
    name: "Honduras",
    flag: "🇭🇳",
    cities: ["Tegucigalpa","San Pedro Sula","Choloma","La Ceiba","El Progreso","Comayagua","Puerto Cortés","Villanueva","Choluteca","Juticalpa","Danlí","Siguatepeque","La Lima","Tela","Santa Rosa de Copán","Tocoa","Olanchito","Yoro","La Esperanza","Copán Ruinas","Roatán","Trujillo","Nacaome","Catacamas","Talanga","Marcala","Gracias","Intibucá","La Paz","San Lorenzo"],
  },
  {
    name: "Hungary",
    flag: "🇭🇺",
    cities: ["Budapest","Debrecen","Szeged","Miskolc","Pécs","Győr","Nyíregyháza","Kecskemét","Székesfehérvár","Szombathely","Szolnok","Tatabánya","Sopron","Kaposvár","Veszprém","Békéscsaba","Zalaegerszeg","Eger","Nagykanizsa","Dunaújváros","Hódmezővásárhely","Dunakeszi","Szigetszentmiklós","Érd","Baja","Salgótarján","Vác","Cegléd","Gyöngyös","Hajdúböszörmény"],
  },
  {
    name: "Iceland",
    flag: "🇮🇸",
    cities: ["Reykjavík","Kópavogur","Hafnarfjörður","Akureyri","Reykjanesbær","Garðabær","Mosfellsbær","Árborg","Akranes","Fjarðabyggð","Múlaþing","Vestmannaeyjar","Grindavík","Borgarbyggð","Ísafjörður","Hveragerði","Höfn","Egilsstaðir","Selfoss","Húsavík","Sauðárkrókur","Stykkishólmur","Bolungarvík","Dalvík","Neskaupstaður","Ólafsfjörður","Eskifjörður","Vík í Mýrdal","Blönduós","Siglufjörður"],
  },
  {
    name: "India",
    flag: "🇮🇳",
    cities: ["Mumbai","Delhi","Bengaluru","Hyderabad","Ahmedabad","Chennai","Kolkata","Surat","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Pimpri-Chinchwad","Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik","Faridabad","Meerut","Rajkot","Varanasi","Srinagar","Aurangabad"],
  },
  {
    name: "Indonesia",
    flag: "🇮🇩",
    cities: ["Jakarta","Surabaya","Bandung","Medan","Semarang","Makassar","Palembang","Tangerang","Depok","South Tangerang","Bekasi","Batam","Bogor","Pekanbaru","Bandar Lampung","Padang","Malang","Denpasar","Samarinda","Banjarmasin","Yogyakarta","Balikpapan","Pontianak","Manado","Jambi","Mataram","Cirebon","Surakarta","Kupang","Jayapura"],
  },
  {
    name: "Iran",
    flag: "🇮🇷",
    cities: ["Tehran","Mashhad","Isfahan","Karaj","Shiraz","Tabriz","Qom","Ahvaz","Kermanshah","Urmia","Rasht","Zahedan","Hamadan","Kerman","Yazd","Arak","Ardabil","Bandar Abbas","Qazvin","Khorramabad","Sanandaj","Sari","Gorgan","Bojnurd","Amol","Neyshabur","Sabzevar","Kashan","Abadan","Dezful"],
  },
  {
    name: "Iraq",
    flag: "🇮🇶",
    cities: ["Baghdad","Mosul","Basra","Erbil","Kirkuk","Najaf","Karbala","Sulaymaniyah","Nasiriyah","Amarah","Diwaniyah","Hillah","Ramadi","Fallujah","Samarra","Tikrit","Baqubah","Duhok","Zakho","Kut","Samawah","Kufa","Tal Afar","Sinjar","Haditha","Hawija","Balad","Shaqlawa","Halabja","Ranya"],
  },
  {
    name: "Ireland",
    flag: "🇮🇪",
    cities: ["Dublin","Cork","Limerick","Galway","Waterford","Drogheda","Dundalk","Swords","Bray","Navan","Ennis","Carlow","Kilkenny","Tralee","Newbridge","Naas","Athlone","Letterkenny","Wexford","Sligo","Clonmel","Greystones","Mullingar","Celbridge","Portlaoise","Ballina","Killarney","Tullamore","Castlebar","Arklow"],
  },
  {
    name: "Israel",
    flag: "🇮🇱",
    cities: ["Jerusalem","Tel Aviv","Haifa","Rishon LeZion","Petah Tikva","Ashdod","Netanya","Beersheba","Bnei Brak","Holon","Ramat Gan","Ashkelon","Rehovot","Bat Yam","Beit Shemesh","Kfar Saba","Herzliya","Hadera","Modi'in-Maccabim-Re'ut","Nazareth","Lod","Ramla","Ra'anana","Givatayim","Afula","Eilat","Ramat HaSharon","Kiryat Ata","Kiryat Gat","Karmiel"],
  },
  {
    name: "Italy",
    flag: "🇮🇹",
    cities: ["Rome","Milan","Naples","Turin","Palermo","Genoa","Bologna","Florence","Bari","Catania","Venice","Verona","Messina","Padua","Trieste","Taranto","Brescia","Prato","Parma","Modena","Reggio Calabria","Perugia","Livorno","Ravenna","Cagliari","Foggia","Rimini","Salerno","Ferrara","Sassari"],
  },
  {
    name: "Jamaica",
    flag: "🇯🇲",
    cities: ["Kingston","Spanish Town","Montego Bay","Portmore","May Pen","Mandeville","Old Harbour","Savanna-la-Mar","Ocho Rios","Linstead","Half Way Tree","Port Antonio","Morant Bay","St. Ann's Bay","Falmouth","Black River","Lucea","Brown's Town","Bog Walk","Santa Cruz","Ewarton","Yallahs","Constant Spring","Negril","Annotto Bay","Christiana","Hopewell","Duncans","Discovery Bay","Port Maria"],
  },
  {
    name: "Japan",
    flag: "🇯🇵",
    cities: ["Tokyo","Yokohama","Osaka","Nagoya","Sapporo","Fukuoka","Kobe","Kyoto","Kawasaki","Saitama","Hiroshima","Sendai","Chiba","Kitakyushu","Sakai","Niigata","Hamamatsu","Kumamoto","Sagamihara","Shizuoka","Okayama","Himeji","Matsuyama","Utsunomiya","Matsudo","Kanazawa","Kawaguchi","Oita","Nagasaki","Fukuyama"],
  },
  {
    name: "Jordan",
    flag: "🇯🇴",
    cities: ["Amman","Zarqa","Irbid","Aqaba","Russeifa","Sahab","Madaba","As-Salt","Jerash","Mafraq","Karak","Tafilah","Ma'an","Ramtha","Ajloun","Fuheis","Al-Husun","Ain Al-Basha","Al-Jizah","Wadi Musa","Shobak","Dhiban","Al-Muwaqqar","Naour","Umm Qais","Deir Alla","Kufranjah","Al-Hasa","Sweileh","Al-Baqa'a"],
  },
  {
    name: "Kazakhstan",
    flag: "🇰🇿",
    cities: ["Almaty","Astana","Shymkent","Karaganda","Aktobe","Taraz","Pavlodar","Oskemen","Semey","Kostanay","Kyzylorda","Atyrau","Aktau","Petropavl","Oral","Temirtau","Turkistan","Kokshetau","Ekibastuz","Rudny","Zhezkazgan","Balkhash","Kentau","Taldykorgan","Kaskelen","Saran","Stepnogorsk","Satpayev","Kapchagay","Zhanaozen"],
  },
  {
    name: "Kenya",
    flag: "🇰🇪",
    cities: ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Ruiru","Kikuyu","Thika","Malindi","Kitale","Garissa","Kakamega","Nyeri","Machakos","Meru","Naivasha","Kericho","Embu","Bungoma","Kilifi","Lodwar","Isiolo","Nanyuki","Voi","Narok","Mumias","Migori","Homa Bay","Kitui","Wajir"],
  },
  {
    name: "Kiribati",
    flag: "🇰🇮",
    cities: ["South Tarawa","Betio","Bairiki","Bikenibeu","Teaoraereke","Bonriki","Buariki","Temwaiku","Eita","Ambo","Abarao","Nawerewere","Temaiku","Tanaea","Tabiteuea North","Tabiteuea South","Butaritari","London","Makin","Kuria","Abaiang","Marakei","Maiana","Abemama","Nonouti","Beru","Nikunau","Onotoa","Tamana","Kiritimati"],
  },
  {
    name: "Kuwait",
    flag: "🇰🇼",
    cities: ["Kuwait City","Al Ahmadi","Hawalli","As Salimiyah","Farwaniya","Al Jahra","Salwa","Sabah Al Salem","Fahaheel","Mubarak Al-Kabeer","Jaber Al-Ahmad","Mangaf","Mahboula","Abu Al Hasaniya","Abu Fatira","Fintas","Reqqa","Ardiya","Jleeb Al-Shuyoukh","Sulaibiya","Saba Al-Salem","Qurain","Adailiya","Shamiya","Qadsiya","Kaifan","Rawda","Khaldiya","Yarmouk","Jabriya"],
  },
  {
    name: "Kyrgyzstan",
    flag: "🇰🇬",
    cities: ["Bishkek","Osh","Jalal-Abad","Karakol","Tokmok","Uzgen","Kara-Balta","Balykchy","Naryn","Talas","Kara-Suu","Kyzyl-Kiya","Batken","Isfana","Tash-Kumyr","Kant","Mailuu-Suu","Kochkor-Ata","Kemin","Bazar-Korgon","Kerben","Toktogul","Nookat","Kadamjay","Cholpon-Ata","Kochkor","At-Bashy","Aravan","Suluktu","Karakul"],
  },
  {
    name: "Laos",
    flag: "🇱🇦",
    cities: ["Vientiane","Savannakhet","Pakse","Luang Prabang","Thakhek","Phonsavan","Muang Xay","Vang Vieng","Luang Namtha","Phongsali","Saravan","Sam Neua","Attapeu","Pakbeng","Seno","Xam Neua","Pakxan","Muang Phin","Kaysone Phomvihane","Champasak","Nong Khiaw","Vieng Xay","Bokeo","Houayxay","Salavan","Sekong","Muang Sing","Namor","Khammouane","Paksan"],
  },
  {
    name: "Latvia",
    flag: "🇱🇻",
    cities: ["Riga","Daugavpils","Liepāja","Jelgava","Jūrmala","Ventspils","Rēzekne","Valmiera","Ogre","Jēkabpils","Tukums","Salaspils","Cēsis","Kuldīga","Sigulda","Bauska","Saldus","Talsi","Dobele","Līvāni","Gulbene","Madona","Limbaži","Aizkraukle","Krāslava","Ludza","Preiļi","Alūksne","Smiltene","Balvi"],
  },
  {
    name: "Lebanon",
    flag: "🇱🇧",
    cities: ["Beirut","Tripoli","Sidon","Tyre","Zahle","Baabda","Jounieh","Byblos","Baalbek","Aley","Nabatieh","Broummana","Bhamdoun","Bint Jbeil","Batroun","Zgharta","Jezzine","Douris","Hermel","Marjayoun","Rashaya","Hasbaya","Amioun","Chekka","Anfeh","Bcharre","Qobayat","Halba","Choueifat","Baalbek District"],
  },
  {
    name: "Lesotho",
    flag: "🇱🇸",
    cities: ["Maseru","Teyateyaneng","Mafeteng","Hlotse","Mohale's Hoek","Maputsoe","Qacha's Nek","Butha-Buthe","Mokhotlong","Thaba-Tseka","Quthing","Roma","Morija","Mazenod","Matsieng","Peka","Mapoteng","Semonkong","Mantsonyane","Mokhotlong Town","Hlotse Camp","Teyateyaneng Central","Mafeteng Central","Mohale's Hoek Central","Butha-Buthe Central","Qacha's Nek Central","Quthing Central","Thaba-Tseka Central","Maputsoe Industrial","Maseru West"],
  },
  {
    name: "Liberia",
    flag: "🇱🇷",
    cities: ["Monrovia","Gbarnga","Buchanan","Ganta","Kakata","Harper","Zwedru","Voinjama","Greenville","Robertsport","Paynesville","New Kru Town","Bensonville","Tubmanburg","Sanniquellie","Pleebo","Fish Town","Bopolu","Cestos City","Careysburg","Clay-Ashland","Brewerville","Harper City","Zwedru City","Voinjama City","Gbarnga City","Ganta City","Kakata City","Buchanan City","Robertsport City"],
  },
  {
    name: "Libya",
    flag: "🇱🇾",
    cities: ["Tripoli","Benghazi","Misrata","Tarhuna","Al Bayda","Zawiya","Zliten","Ajdabiya","Sabha","Derna","Tobruk","Gharyan","Sirte","Khoms","Murzuq","Nalut","Ghadames","Bani Walid","Al Marj","Zuwara","Ubari","Brak Al-Shati","Jalu","Kufra","Ghat","Waddan","Hun","Mizdah","Yafran","Qatrun"],
  },
  {
    name: "Liechtenstein",
    flag: "🇱🇮",
    cities: ["Vaduz","Schaan","Triesen","Balzers","Eschen","Mauren","Triesenberg","Ruggell","Gamprin","Schellenberg","Planken","Nendeln","Bendern","Malbun","Steg","Masescha","Rotenboden","Gaflei","Silum","Frommenhaus","Schaanwald","Hinterschellenberg","Forst","Mäls","Gnalp","Rietli","Mitteldorf","Riet","Plankenberg","Triesenberg Village"],
  },
  {
    name: "Lithuania",
    flag: "🇱🇹",
    cities: ["Vilnius","Kaunas","Klaipėda","Šiauliai","Panevėžys","Alytus","Marijampolė","Mažeikiai","Jonava","Utena","Kėdainiai","Telšiai","Tauragė","Ukmergė","Visaginas","Plungė","Šilutė","Kretinga","Palanga","Radviliškis","Druskininkai","Joniškis","Biržai","Elektrėnai","Garliava","Rokiškis","Kuršėnai","Naujoji Akmenė","Šakiai","Pakruojis"],
  },
  {
    name: "Luxembourg",
    flag: "🇱🇺",
    cities: ["Luxembourg City","Esch-sur-Alzette","Differdange","Dudelange","Ettelbruck","Diekirch","Strassen","Bertrange","Bettembourg","Pétange","Schifflange","Wiltz","Rumelange","Grevenmacher","Mamer","Echternach","Kayl","Remich","Mondercange","Steinfort","Junglinster","Hesperange","Walferdange","Sandweiler","Mersch","Mondorf-les-Bains","Redange","Clervaux","Vianden","Larochette"],
  },
  {
    name: "Madagascar",
    flag: "🇲🇬",
    cities: ["Antananarivo","Toamasina","Antsirabe","Fianarantsoa","Mahajanga","Toliara","Antsiranana","Ambovombe","Antanifotsy","Moramanga","Sambava","Manakara","Ambalavao","Antalaha","Farafangana","Miarinarivo","Tsiroanomandidy","Ambanja","Marovoay","Mananjary","Vohipeno","Fenoarivo Atsinanana","Maroantsetra","Nosy Be","Morondava","Ihosy","Ambatolampy","Betafo","Fort-Dauphin","Mananara Avaratra"],
  },
  {
    name: "Malawi",
    flag: "🇲🇼",
    cities: ["Lilongwe","Blantyre","Mzuzu","Zomba","Kasungu","Mangochi","Salima","Mchinji","Karonga","Liwonde","Mzimba","Balaka","Dedza","Nkhotakota","Rumphi","Nsanje","Chitipa","Nkhata Bay","Mulanje","Thyolo","Mwanza","Chikwawa","Ntcheu","Ntchisi","Dowa","Monkey Bay","Mangochi Town","Luchenza","Neno","Mzuzu City"],
  },
  {
    name: "Malaysia",
    flag: "🇲🇾",
    cities: ["Kuala Lumpur","George Town","Johor Bahru","Ipoh","Kuching","Kota Kinabalu","Shah Alam","Malacca City","Alor Setar","Petaling Jaya","Kota Bharu","Kuala Terengganu","Kuantan","Seremban","Klang","Putrajaya","Miri","Sandakan","Tawau","Sibu","Batu Pahat","Kluang","Kangar","Taiping","Sungai Petani","Kuala Selangor","Bintulu","Labuan","Pasir Gudang","Sepang"],
  },
  {
    name: "Maldives",
    flag: "🇲🇻",
    cities: ["Malé","Addu City","Fuvahmulah","Kulhudhuffushi","Thinadhoo","Naifaru","Hithadhoo","Villingili","Hulhumalé","Maafushi","Thulusdhoo","Dhidhdhoo","Eydhafushi","Dharavandhoo","Mahibadhoo","Felidhoo","Muli","Meedhoo","Ungoofaaru","Kudahuvadhoo","Dhangethi","Huraa","Guraidhoo","Himandhoo","Ihavandhoo","Hanimaadhoo","Hoarafushi","Thimarafushi","Gaafu Dhaalu","Laamu Atoll"],
  },
  {
    name: "Mali",
    flag: "🇲🇱",
    cities: ["Bamako","Sikasso","Mopti","Ségou","Kayes","Koutiala","Gao","Timbuktu","Kidal","Koulikoro","San","Niono","Markala","Bougouni","Kita","Kolokani","Banamba","Bandiagara","Djenné","Douentza","Diré","Niafunké","Ansongo","Bourem","Kangaba","Fana","Kati","Dioïla","Yanfolila","Koro"],
  },
  {
    name: "Malta",
    flag: "🇲🇹",
    cities: ["Valletta","Birkirkara","Mosta","Qormi","Zabbar","San Pawl il-Baħar","St. Julian's","Sliema","Żebbuġ","Naxxar","Rabat","Mellieħa","Fgura","Marsaskala","Paola","Tarxien","Żejtun","Attard","Swieqi","Pembroke","Gżira","Msida","Birżebbuġa","Victoria","Nadur","Xewkija","Xagħra","Senglea","Cospicua","Żabbar"],
  },
  {
    name: "Marshall Islands",
    flag: "🇲🇭",
    cities: ["Majuro","Ebeye","Laura","Rita","Delap","Uliga","Darrit","Ajeltake","Long Island","Rongelap","Kwajalein","Wotje","Jaluit","Mili","Arno","Ailinglaplap","Aur","Likiep","Maloelap","Mejit","Utirik","Ujae","Lae","Lib","Namdrik","Namu","Ebon","Ailuk","Jabat","Kili"],
  },
  {
    name: "Mauritania",
    flag: "🇲🇷",
    cities: ["Nouakchott","Nouadhibou","Kiffa","Rosso","Zouérat","Kaédi","Atar","Néma","Sélibaby","Aioun","Aleg","Akjoujt","Tidjikja","Boutilimit","Boghé","Maghama","M'Bout","Bababé","Timbedra","Bassiknou","Chinguetti","Ouadane","Oualata","F'Dérik","Bir Moghrein","Tintane","Tamchekket","Magta Lahjar","Mederdra","R'Kiz"],
  },
  {
    name: "Mauritius",
    flag: "🇲🇺",
    cities: ["Port Louis","Beau Bassin-Rose Hill","Vacoas-Phoenix","Curepipe","Quatre Bornes","Triolet","Goodlands","Centre de Flacq","Mahébourg","Grand Baie","Rose Belle","Souillac","Rivière du Rempart","Pamplemousses","Moka","Bel Air Rivière Sèche","Chemin Grenier","Bambous","Flic en Flac","Tamarin","Black River","Rivière Noire","Grand Gaube","Pointe aux Piments","Calodyne","Trou aux Biches","Montagne Blanche","Pailles","Albion","Vacoas"],
  },
  {
    name: "Mexico",
    flag: "🇲🇽",
    cities: ["Mexico City","Ecatepec","Guadalajara","Puebla","Ciudad Juárez","Tijuana","León","Zapopan","Monterrey","Nezahualcóyotl","Chihuahua City","Mérida","San Luis Potosí","Aguascalientes","Hermosillo","Saltillo","Mexicali","Culiacán","Querétaro","Morelia","Chimalhuacán","Cancún","Veracruz","Acapulco","Torreón","Tlalnepantla","Cuautitlán Izcalli","Durango","Toluca","Ciudad López Mateos"],
  },
  {
    name: "Micronesia",
    flag: "🇫🇲",
    cities: ["Palikir","Weno","Kolonia","Tofol","Colonia","Lelu","Nett","Malem","Uman","Madolenihmw","Sokehs","Kitti","Tafunsak","Udot","Tamol","Mwoakilloa","Pohnpei","Tol","Mori","Nukuoro","Ngatik","Kapingamarangi","Pingelap","Mokil","Sapwuahfik","Fais","Ulithi","Yap","Chuuk","Kosrae"],
  },
  {
    name: "Moldova",
    flag: "🇲🇩",
    cities: ["Chișinău","Tiraspol","Bălți","Bender","Rîbnița","Cahul","Ungheni","Soroca","Orhei","Comrat","Dubăsari","Ceadîr-Lunga","Strășeni","Codru","Durlești","Ialoveni","Hîncești","Edineț","Drochia","Căușeni","Florești","Fălești","Sîngerei","Cricova","Vulcănești","Anenii Noi","Rezina","Taraclia","Nisporeni","Ștefan Vodă"],
  },
  {
    name: "Monaco",
    flag: "🇲🇨",
    cities: ["Monaco","Monte Carlo","La Condamine","Fontvieille","Moneghetti","Larvotto","Saint Roman","Saint Michel","Monaco-Ville","La Colle","Les Révoires","Jardin Exotique","Port Hercule","Port de Fontvieille","Carré d'Or","Larvotto Beach","Monte-Carlo Bay","Condamine Market","Fontvieille Harbour","Grimaldi Forum","La Rousse","Saint Roman District","Monaco Harbour","Casino Square","Place d'Armes","Place du Palais","Portier","Spélugues","Les Salines","La Turbie"],
  },
  {
    name: "Mongolia",
    flag: "🇲🇳",
    cities: ["Ulaanbaatar","Erdenet","Darkhan","Choibalsan","Mörön","Nalaikh","Ölgii","Arvaikheer","Bayankhongor","Dalanzadgad","Sükhbaatar","Zuunmod","Uliastai","Tsetserleg","Ulaangom","Altai","Baruun-Urt","Mandalgovi","Bulgan","Kharkhorin","Zamyn-Üüd","Tosontsengel","Khovd","Undurkhaan","Baganuur","Bagakhangai","Sharyngol","Khutag-Öndör","Bayankhongor Town","Khorgo"],
  },
  {
    name: "Montenegro",
    flag: "🇲🇪",
    cities: ["Podgorica","Nikšić","Budva","Bar","Cetinje","Herceg Novi","Bijelo Polje","Ulcinj","Tivat","Rožaje","Pljevlja","Berane","Kotor","Danilovgrad","Mojkovac","Kolašin","Žabljak","Plav","Andrijevica","Petnjica","Tuzi","Šavnik","Plužine","Gusinje","Risan","Perast","Igalo","Sutomore","Dobrota","Budva Old Town"],
  },
  {
    name: "Morocco",
    flag: "🇲🇦",
    cities: ["Casablanca","Rabat","Fez","Marrakesh","Tangier","Agadir","Meknes","Oujda","Kenitra","Tetouan","Safi","El Jadida","Beni Mellal","Nador","Taza","Khouribga","Settat","Larache","Ksar El Kebir","Khemisset","Berrechid","Ouarzazate","Essaouira","Ifrane","Chefchaouen","Mohammedia","Al Hoceima","Errachidia","Dakhla","Laayoune"],
  },
  {
    name: "Mozambique",
    flag: "🇲🇿",
    cities: ["Maputo","Matola","Nampula","Beira","Chimoio","Nacala","Quelimane","Tete","Xai-Xai","Maxixe","Pemba","Lichinga","Inhambane","Mocuba","Cuamba","Montepuez","Dondo","Angoche","Gurué","Vilankulo","Chókwè","Manjacaze","Marracuene","Boane","Moamba","Mocímboa da Praia","Ribáuè","Mueda","Ilha de Moçambique","Catandica"],
  },
  {
    name: "Myanmar",
    flag: "🇲🇲",
    cities: ["Yangon","Mandalay","Naypyidaw","Mawlamyine","Bago","Pathein","Monywa","Meiktila","Taunggyi","Sittwe","Myitkyina","Myeik","Dawei","Hpa-An","Lashio","Pyay","Magway","Pakokku","Sagaing","Kalay","Taungoo","Mogok","Kyaikto","Thanlyin","Thayet","Hinthada","Kyaingtong","Tachileik","Loikaw","Shwebo"],
  },
  {
    name: "Namibia",
    flag: "🇳🇦",
    cities: ["Windhoek","Rundu","Walvis Bay","Oshakati","Swakopmund","Katima Mulilo","Otjiwarongo","Rehoboth","Tsumeb","Keetmanshoop","Gobabis","Ongwediva","Ondangwa","Outjo","Mariental","Lüderitz","Opuwo","Eenhana","Okahandja","Usakos","Karasburg","Grootfontein","Omaruru","Henties Bay","Aranos","Khorixas","Ruacana","Katutura","Aroab","Bethanie"],
  },
  {
    name: "Nauru",
    flag: "🇳🇷",
    cities: ["Yaren","Denigomodu","Aiwo","Anabar","Anetan","Anibare","Baiti","Boe","Buada","Meneng","Nibok","Uaboe","Ijuw","Ewa","Arijejen","Menen District","Yaren District","Aiwo District","Anabar District","Anetan District","Anibare District","Baiti District","Boe District","Buada District","Denigomodu District","Ewa District","Ijuw District","Meneng District","Nibok District","Uaboe District"],
  },
  {
    name: "Nepal",
    flag: "🇳🇵",
    cities: ["Kathmandu","Pokhara","Lalitpur","Bharatpur","Biratnagar","Birgunj","Dharan","Butwal","Dhangadhi","Hetauda","Janakpur","Nepalgunj","Itahari","Tulsipur","Bhaktapur","Kirtipur","Mechinagar","Birtamode","Ghorahi","Tikapur","Banepa","Damak","Rajbiraj","Lahan","Kalaiya","Jaleshwar","Tansen","Dhankuta","Baglung","Bhadrapur"],
  },
  {
    name: "Netherlands",
    flag: "🇳🇱",
    cities: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Groningen","Tilburg","Almere","Breda","Nijmegen","Apeldoorn","Haarlem","Arnhem","Enschede","Amersfoort","Zaanstad","'s-Hertogenbosch","Haarlemmermeer","Zoetermeer","Zwolle","Leiden","Maastricht","Dordrecht","Ede","Leeuwarden","Alkmaar","Emmen","Delft","Deventer","Venlo"],
  },
  {
    name: "New Zealand",
    flag: "🇳🇿",
    cities: ["Auckland","Christchurch","Wellington","Hamilton","Tauranga","Dunedin","Lower Hutt","Palmerston North","Napier","Porirua","Hibiscus Coast","New Plymouth","Rotorua","Whangārei","Invercargill","Nelson","Hastings","Upper Hutt","Queenstown","Gisborne","Blenheim","Timaru","Taupō","Masterton","Whanganui","Kapiti Coast","Ashburton","Cambridge","Levin","Oamaru"],
  },
  {
    name: "Nicaragua",
    flag: "🇳🇮",
    cities: ["Managua","León","Masaya","Matagalpa","Chinandega","Estelí","Granada","Jinotepe","Juigalpa","Bluefields","Tipitapa","Ciudad Sandino","Diriamba","Rivas","Ocotal","Somoto","Boaco","Chichigalpa","El Viejo","Nagarote","Jinotega","Sébaco","San Marcos","Nindirí","La Trinidad","Corinto","San Carlos","Nueva Guinea","Waslala","Puerto Cabezas"],
  },
  {
    name: "Niger",
    flag: "🇳🇪",
    cities: ["Niamey","Zinder","Maradi","Agadez","Tahoua","Dosso","Diffa","Arlit","Birni N'Konni","Tessaoua","Gaya","Tillabéri","Filingué","Madaoua","Magaria","Mirriah","Matameye","Dakoro","Guidan Roumdji","Mayahi","Tibiri","Téra","Say","Kollo","Ouallam","Gouré","Nguigmi","Diffa Town","Ayorou","Abalak"],
  },
  {
    name: "Nigeria",
    flag: "🇳🇬",
    cities: ["Lagos","Kano","Ibadan","Abuja","Port Harcourt","Benin City","Maiduguri","Kaduna","Enugu","Jos","Ilorin","Aba","Onitsha","Warri","Sokoto","Calabar","Uyo","Abeokuta","Akure","Bauchi","Katsina","Owerri","Osogbo","Ado-Ekiti","Ikeja","Zaria","Makurdi","Minna","Gombe","Yola"],
  },
  {
    name: "North Korea",
    flag: "🇰🇵",
    cities: ["Pyongyang","Hamhung","Chongjin","Nampo","Wonsan","Sinuiju","Tanchon","Kaesong","Sariwon","Hyesan","Kanggye","Sunchon","Haeju","Anju","Kusong","Hoeryong","Rason","Tokchon","Musan","Kimchaek","Huichon","Sakchu","Manpo","Pyongsong","Kowon","Wiwon","Onsong","Kilju","Munchon","Songnim"],
  },
  {
    name: "North Macedonia",
    flag: "🇲🇰",
    cities: ["Skopje","Bitola","Kumanovo","Prilep","Tetovo","Veles","Ohrid","Štip","Gostivar","Strumica","Kavadarci","Kočani","Kičevo","Struga","Radoviš","Gevgelija","Debar","Kriva Palanka","Negotino","Sveti Nikole","Delčevo","Berovo","Vinica","Resen","Probištip","Valandovo","Demir Kapija","Kratovo","Makedonski Brod","Bogdanci"],
  },
  {
    name: "Norway",
    flag: "🇳🇴",
    cities: ["Oslo","Bergen","Trondheim","Stavanger","Drammen","Fredrikstad","Kristiansand","Sandnes","Tromsø","Sarpsborg","Skien","Ålesund","Sandefjord","Haugesund","Tønsberg","Moss","Porsgrunn","Bodø","Arendal","Hamar","Ytrebygda","Larvik","Halden","Kongsberg","Harstad","Lillehammer","Molde","Gjøvik","Narvik","Alta"],
  },
  {
    name: "Oman",
    flag: "🇴🇲",
    cities: ["Muscat","Seeb","Salalah","Bawshar","Sohar","Nizwa","Sur","Rustaq","Ibri","Barka","Khasab","Al Buraimi","Bahla","Ibra","Samail","Bidbid","Nakhal","Al Hamra","Adam","Shinas","Liwa","Saham","Al Khaburah","Duqm","Thumrait","Mirbat","Ruwi","Muttrah","Qurayyat","Al Mudaybi"],
  },
  {
    name: "Pakistan",
    flag: "🇵🇰",
    cities: ["Karachi","Lahore","Faisalabad","Rawalpindi","Gujranwala","Peshawar","Multan","Hyderabad","Islamabad","Quetta","Bahawalpur","Sargodha","Sialkot","Sukkur","Larkana","Sheikhupura","Jhang","Dera Ghazi Khan","Gujrat","Mardan","Kasur","Rahim Yar Khan","Sahiwal","Okara","Wah Cantonment","Mingora","Nawabshah","Mirpur","Chiniot","Jacobabad"],
  },
  {
    name: "Palau",
    flag: "🇵🇼",
    cities: ["Ngerulmud","Koror","Melekeok","Airai","Ngaraard","Ngardmau","Ngatpang","Ngchesar","Ngiwal","Aimeliik","Peleliu","Angaur","Kayangel","Hatohobei","Ngerchelong","Meyungs","Malakal","Ngerkebesang","Ulimang","Ngetkib","Ngaraard Village","Ngarchelong Village","Ngchesar Village","Airai Village","Aimeliik Village","Peleliu Village","Angaur Village","Kayangel Village","Melekeok Village","Koror City"],
  },
  {
    name: "Palestine",
    flag: "🇵🇸",
    cities: ["Gaza City","Hebron","Nablus","Ramallah","Jenin","Bethlehem","Khan Yunis","Rafah","Tulkarm","Qalqilya","Jericho","Salfit","Tubas","Dura","Yatta","Beit Jala","Beit Sahour","Bani Na'im","Abu Dis","Al-Bireh","Jabalia","Deir al-Balah","Rafah Camp","Khan Yunis Camp","Gaza Beach","Beit Hanoun","Beit Lahia","Nuseirat","Jabalya","Ariha"],
  },
  {
    name: "Panama",
    flag: "🇵🇦",
    cities: ["Panama City","San Miguelito","Tocumen","David","Colón","La Chorrera","Arraiján","Chitré","Santiago de Veraguas","Penonomé","Changuinola","La Concepción","Aguadulce","Las Tablas","Puerto Armuelles","Bugaba","Boquete","Antón","Soná","Chepo","Capira","Chilibre","Pacora","Natá","Ocú","Almirante","Bocas del Toro","Chame","Gorgona","Chitré Nuevo"],
  },
  {
    name: "Papua New Guinea",
    flag: "🇵🇬",
    cities: ["Port Moresby","Lae","Mount Hagen","Madang","Kokopo","Popondetta","Goroka","Wewak","Kimbe","Mendi","Kavieng","Daru","Vanimo","Alotau","Rabaul","Kerema","Honiara","Bulolo","Arawa","Kundiawa","Tari","Buka","Tabubil","Kainantu","Ialibu","Wabag","Kieta","Finschhafen","Lorengau","Kiunga"],
  },
  {
    name: "Paraguay",
    flag: "🇵🇾",
    cities: ["Asunción","Ciudad del Este","San Lorenzo","Luque","Capiatá","Lambaré","Fernando de la Mora","Mariano Roque Alonso","Encarnación","Pedro Juan Caballero","Caaguazú","Coronel Oviedo","Concepción","Villarrica","Pilar","Caacupé","Itauguá","Limpio","Presidente Franco","Hernandarias","Minga Guazú","Villa Elisa","Ñemby","Maracaná","San Juan Bautista","Paraguarí","Carapeguá","Curuguaty","Salto del Guairá","Filadelfia"],
  },
  {
    name: "Peru",
    flag: "🇵🇪",
    cities: ["Lima","Arequipa","Trujillo","Chiclayo","Piura","Cusco","Huancayo","Iquitos","Chimbote","Tacna","Pucallpa","Ica","Juliaca","Sullana","Ayacucho","Cajamarca","Tarapoto","Huánuco","Puno","Chincha Alta","Huaraz","Tumbes","Talara","Jaén","Moquegua","Abancay","Puerto Maldonado","Ilo","Cerro de Pasco","Moyobamba"],
  },
  {
    name: "Philippines",
    flag: "🇵🇭",
    cities: ["Manila","Quezon City","Davao City","Caloocan","Cebu City","Zamboanga City","Antipolo","Pasig","Taguig","Cagayan de Oro","Parañaque","Dasmariñas","Valenzuela","Las Piñas","General Santos","Makati","Bacoor","San Jose del Monte","Iloilo City","Muntinlupa","Lapu-Lapu City","Imus","Navotas","Malabon","Angeles City","Marikina","Butuan","Baguio","Batangas City","Tacloban"],
  },
  {
    name: "Poland",
    flag: "🇵🇱",
    cities: ["Warsaw","Kraków","Łódź","Wrocław","Poznań","Gdańsk","Szczecin","Bydgoszcz","Lublin","Białystok","Katowice","Gdynia","Częstochowa","Radom","Toruń","Sosnowiec","Rzeszów","Kielce","Gliwice","Olsztyn","Zabrze","Bielsko-Biała","Bytom","Zielona Góra","Rybnik","Ruda Śląska","Opole","Tychy","Gorzów Wielkopolski","Elbląg"],
  },
  {
    name: "Portugal",
    flag: "🇵🇹",
    cities: ["Lisbon","Porto","Vila Nova de Gaia","Amadora","Braga","Coimbra","Funchal","Setúbal","Almada","Agualva-Cacém","Queluz","Aveiro","Odivelas","Leiria","Barreiro","Viseu","Guimarães","Matosinhos","Faro","Rio de Mouro","Portimão","Santarém","Évora","Maia","Cascais","Oeiras","Sintra","Torres Vedras","Póvoa de Varzim","Covilhã"],
  },
  {
    name: "Qatar",
    flag: "🇶🇦",
    cities: ["Doha","Al Rayyan","Al Wakrah","Umm Salal Muhammad","Al Khor","Dukhan","Al Shamal","Mesaieed","Lusail","Al Daayen","Al Wukair","Al Ruwais","Al Ghuwairiya","Al Thakhira","Fuwayrit","Simaisma","Madinat ash Shamal","Abu Hamour","Ain Khaled","Al Gharrafa","Al Hilal","Al Mamoura","Al Muntazah","Al Sadd","Old Airport","West Bay","Barwa City","Education City","The Pearl","Industrial Area"],
  },
  {
    name: "Romania",
    flag: "🇷🇴",
    cities: ["Bucharest","Cluj-Napoca","Timișoara","Iași","Constanța","Craiova","Brașov","Galați","Ploiești","Oradea","Brăila","Arad","Pitești","Sibiu","Bacău","Târgu Mureș","Baia Mare","Buzău","Satu Mare","Botoșani","Râmnicu Vâlcea","Suceava","Drobeta-Turnu Severin","Piatra Neamț","Târgu Jiu","Târgoviște","Focșani","Alba Iulia","Tulcea","Reșița"],
  },
  {
    name: "Russia",
    flag: "🇷🇺",
    cities: ["Moscow","Saint Petersburg","Novosibirsk","Yekaterinburg","Kazan","Nizhny Novgorod","Krasnoyarsk","Chelyabinsk","Samara","Ufa","Rostov-on-Don","Krasnodar","Omsk","Voronezh","Perm","Volgograd","Saratov","Tyumen","Tolyatti","Izhevsk","Barnaul","Ulyanovsk","Irkutsk","Khabarovsk","Yaroslavl","Vladivostok","Makhachkala","Tomsk","Orenburg","Kemerovo"],
  },
  {
    name: "Rwanda",
    flag: "🇷🇼",
    cities: ["Kigali","Butare","Gitarama","Ruhengeri","Gisenyi","Byumba","Cyangugu","Kibuye","Kibungo","Musanze","Rubavu","Huye","Muhanga","Rusizi","Nyagatare","Kayonza","Rwamagana","Nyanza","Gicumbi","Karongi","Ngoma","Bugesera","Gatsibo","Gakenke","Musanze Town","Nyamagabe","Nyaruguru","Rulindo","Burera","Ngororero"],
  },
  {
    name: "Saint Kitts and Nevis",
    flag: "🇰🇳",
    cities: ["Basseterre","Charlestown","Sandy Point Town","Cayon","Dieppe Bay Town","Gingerland","Old Road Town","St. Paul's","Saddlers","Mansion","Tabernacle","Challengers","Middle Island","Boyd's","Verchilds","Newcastle","Cotton Ground","Brown Hill","Keynisham","Monkey Hill","Newton Ground","Parry's","Palmetto Point","Half Way Tree","Ottley's","Camps","Fig Tree","Estridge","Market Shop","St. John's"],
  },
  {
    name: "Saint Lucia",
    flag: "🇱🇨",
    cities: ["Castries","Vieux Fort","Gros Islet","Soufrière","Micoud","Dennery","Laborie","Choiseul","Anse La Raye","Canaries","Babonneau","Bisee","Marigot","Dauphin","Praslin","Mon Repos","Saltibus","Ti Rocher","La Clery","Marchand","Ciceron","Morne Du Don","Bexon","Augier","La Tourney","Mabouya Valley","Grande Riviere","Fond St. Jacques","Choiseul Village","Vieux Fort Town"],
  },
  {
    name: "Saint Vincent and the Grenadines",
    flag: "🇻🇨",
    cities: ["Kingstown","Georgetown","Barrouallie","Chateaubelair","Biabou","Layou","Calliaqua","Port Elizabeth","Byera","Mesopotamia","Sandy Bay","Stubbs","Bequia","Union Island","Canouan","Mayreau","Mustique","Petit St Vincent","Wallilabou","Vermont","Arnos Vale","Sion Hill","Edinboro","Lowmans","Questelles","Park Hill","Colonarie","Brighton","Marriaqua","Dovers"],
  },
  {
    name: "Samoa",
    flag: "🇼🇸",
    cities: ["Apia","Vaitele","Faleula","Siusega","Malie","Leulumoega","Safotulafai","Asau","Salelologa","Mulifanua","Lalomanu","Lotofaga","Poutasi","Safata","Nofoali'i","Falealili","Solosolo","Aleipata","Satupa'itea","Vailoa","Gataivai","Safune","Manono","Savai'i","Saleaula","Fagamalo","Fasito'o Uta","Fasito'o Tai","Lepea","Moamoa"],
  },
  {
    name: "San Marino",
    flag: "🇸🇲",
    cities: ["San Marino","Serravalle","Borgo Maggiore","Domagnano","Fiorentino","Acquaviva","Faetano","Chiesanuova","Montegiardino","Murata","Dogana","Borgo Maggiore Centro","Cailungo","Ca' Berlone","Cà Chiavello","Cà Rigo","Cà Muraccini","Cà Franceschino","Cerbaiola","Falciano","Galazzano","Gualdicciolo","Montalbo","Montecerreto","Poggio di Chiesanuova","Rovereta","Serravalle Centro","Valdragone","Ventoso","Torraccia"],
  },
  {
    name: "Sao Tome and Principe",
    flag: "🇸🇹",
    cities: ["São Tomé","Santo António","Neves","Santana","Trindade","Guadalupe","São João dos Angolares","Ribeira Afonso","Bombom","Pantufo","Almas","Agostinho Neto","Água Grande","Água-Izé","Angolares","Bela Vista","Caixão Grande","Diogo Simão","Guadalupe Town","Lembá","Lobata","Mé-Zóchi","Monte Café","Porto Alegre","Ribeira Peixe","Ribeira Afonso Town","Santa Catarina","São Carlos","São João dos Angolares Town","Trindade Town"],
  },
  {
    name: "Saudi Arabia",
    flag: "🇸🇦",
    cities: ["Riyadh","Jeddah","Mecca","Medina","Dammam","Taif","Tabuk","Buraidah","Khamis Mushait","Abha","Al Khobar","Hail","Najran","Jubail","Yanbu","Al Hofuf","Al Qatif","Jizan","Al Bahah","Sakaka","Arar","Al Kharj","Dhahran","Buraydah","Unaizah","Rabigh","Qurayyat","Al Lith","Hafr Al Batin","Wadi ad-Dawasir"],
  },
  {
    name: "Senegal",
    flag: "🇸🇳",
    cities: ["Dakar","Touba","Thiès","Rufisque","Kaolack","Mbour","Saint-Louis","Ziguinchor","Diourbel","Louga","Tambacounda","Kolda","Richard-Toll","Tivaouane","Joal-Fadiouth","Fatick","Kaffrine","Matam","Kédougou","Sédhiou","Bargny","Guédiawaye","Pikine","Guédiawaye Nord","Yoff","Mbao","Diamniadio","Kébémer","Nioro du Rip","Podor"],
  },
  {
    name: "Serbia",
    flag: "🇷🇸",
    cities: ["Belgrade","Novi Sad","Niš","Kragujevac","Subotica","Zrenjanin","Pančevo","Čačak","Kraljevo","Novi Pazar","Smederevo","Leskovac","Užice","Vranje","Valjevo","Šabac","Sombor","Požarevac","Pirot","Zaječar","Kikinda","Jagodina","Sremska Mitrovica","Vršac","Bor","Prokuplje","Loznica","Aranđelovac","Ruma","Bačka Palanka"],
  },
  {
    name: "Seychelles",
    flag: "🇸🇨",
    cities: ["Victoria","Anse Boileau","Beau Vallon","Cascade","Anse Royale","Takamaka","Bel Ombre","Grand Anse Mahé","Pointe Larue","Mont Fleuri","Plaisance","English River","Glacis","Au Cap","Port Glaud","Baie Lazare","Bel Air","Saint Louis","Roche Caiman","Anse Aux Pins","La Digue","Praslin","Baie Sainte Anne","Grand Anse Praslin","Anse Volbert","La Passe","Beau Vallon Village","Anse Etoile","Montagne Posee","Anse Forbans"],
  },
  {
    name: "Sierra Leone",
    flag: "🇸🇱",
    cities: ["Freetown","Bo","Kenema","Makeni","Koidu","Waterloo","Port Loko","Lunsar","Kabala","Magburaka","Moyamba","Kambia","Kailahun","Pujehun","Bonthe","Kono","Bombali","Segbwema","Koindu","Mattru Jong","Pepel","Hastings","Newton","Regent","Lumley","Wilberforce","Calaba Town","Kissy","Jui","Rokel"],
  },
  {
    name: "Singapore",
    flag: "🇸🇬",
    cities: ["Singapore","Jurong East","Woodlands","Tampines","Bedok","Hougang","Sengkang","Punggol","Yishun","Ang Mo Kio","Bukit Batok","Bukit Merah","Choa Chu Kang","Clementi","Pasir Ris","Queenstown","Serangoon","Toa Payoh","Bishan","Geylang","Kallang","Marine Parade","Novena","Orchard","Outram","River Valley","Rochor","Tiong Bahru","Bukit Timah","Sentosa"],
  },
  {
    name: "Slovakia",
    flag: "🇸🇰",
    cities: ["Bratislava","Košice","Prešov","Žilina","Nitra","Banská Bystrica","Trnava","Trenčín","Martin","Poprad","Prievidza","Zvolen","Považská Bystrica","Michalovce","Spišská Nová Ves","Komárno","Levice","Humenné","Bardejov","Liptovský Mikuláš","Lučenec","Ružomberok","Piešťany","Topoľčany","Trebišov","Senica","Nové Zámky","Dubnica nad Váhom","Pezinok","Brezno"],
  },
  {
    name: "Slovenia",
    flag: "🇸🇮",
    cities: ["Ljubljana","Maribor","Kranj","Celje","Koper","Velenje","Novo Mesto","Ptuj","Kamnik","Jesenice","Nova Gorica","Domžale","Škofja Loka","Murska Sobota","Izola","Slovenska Bistrica","Postojna","Logatec","Vrhnika","Kočevje","Trbovlje","Brežice","Ajdovščina","Sežana","Radovljica","Rogaška Slatina","Črnomelj","Litija","Ravne na Koroškem","Bled"],
  },
  {
    name: "Solomon Islands",
    flag: "🇸🇧",
    cities: ["Honiara","Auki","Gizo","Munda","Kirakira","Lata","Taro","Tulagi","Buala","Yandina","Gizo Town","Honiara Central","Noro","Aola","Marovo","Seghe","Mbambanakira","Tingoa","Doma","Arnavon","Santa Cruz","Luganville","Nggela","Russell Islands","Malaita","Guadalcanal","Makira","Temotu","Western Province","Isabel Province"],
  },
  {
    name: "Somalia",
    flag: "🇸🇴",
    cities: ["Mogadishu","Hargeisa","Kismayo","Bosaso","Garoowe","Baidoa","Berbera","Burao","Beledweyne","Marka","Jowhar","Borama","Erigavo","Las Anod","Garowe","Galkayo","Dhusamareb","Hobyo","Bardera","Afgooye","Baraawe","Qardho","Las Qoray","Eyl","Buuhoodle","Belet Hawo","Luuq","Doolow","Jilib","Kurtunwarey"],
  },
  {
    name: "South Africa",
    flag: "🇿🇦",
    cities: ["Johannesburg","Cape Town","Durban","Pretoria","Gqeberha","Bloemfontein","East London","Polokwane","Pietermaritzburg","Nelspruit","Kimberley","Rustenburg","Welkom","Vereeniging","Soweto","Midrand","Centurion","Roodepoort","Benoni","Boksburg","Krugersdorp","George","Mthatha","Witbank","Klerksdorp","Potchefstroom","Richards Bay","Mossel Bay","Upington","Tshwane"],
  },
  {
    name: "South Korea",
    flag: "🇰🇷",
    cities: ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Suwon","Ulsan","Yongin","Goyang","Changwon","Seongnam","Bucheon","Cheongju","Ansan","Jeonju","Anyang","Hwaseong","Pohang","Gimhae","Pyeongtaek","Gimpo","Gwangmyeong","Jeju City","Wonju","Yangsan","Gumi","Iksan","Chuncheon","Gangneung"],
  },
  {
    name: "South Sudan",
    flag: "🇸🇸",
    cities: ["Juba","Wau","Malakal","Yei","Bor","Aweil","Rumbek","Yambio","Torit","Bentiu","Kuacjok","Renk","Nimule","Maridi","Aweil East","Kapoeta","Terekeka","Pibor","Leer","Mundri","Kajo-Keji","Yambio Town","Wulu","Rumbek Centre","Yirol","Akobo","Nasir","Fangak","Pochalla","Magwi"],
  },
  {
    name: "Spain",
    flag: "🇪🇸",
    cities: ["Madrid","Barcelona","Valencia","Seville","Zaragoza","Málaga","Murcia","Palma","Las Palmas de Gran Canaria","Bilbao","Alicante","Córdoba","Valladolid","Vigo","Gijón","L'Hospitalet de Llobregat","A Coruña","Granada","Vitoria-Gasteiz","Elche","Oviedo","Santa Cruz de Tenerife","Badalona","Cartagena","Terrassa","Jerez de la Frontera","Sabadell","Móstoles","Alcalá de Henares","Pamplona"],
  },
  {
    name: "Sri Lanka",
    flag: "🇱🇰",
    cities: ["Colombo","Sri Jayawardenepura Kotte","Dehiwala-Mount Lavinia","Moratuwa","Kandy","Jaffna","Negombo","Galle","Trincomalee","Batticaloa","Kurunegala","Ratnapura","Anuradhapura","Badulla","Matara","Kotte","Nuwara Eliya","Kegalle","Kalutara","Dambulla","Chilaw","Vavuniya","Mannar","Puttalam","Ampara","Hambantota","Polonnaruwa","Gampaha","Panadura","Wattala"],
  },
  {
    name: "Sudan",
    flag: "🇸🇩",
    cities: ["Khartoum","Omdurman","Khartoum North","Port Sudan","Nyala","Kassala","El Obeid","Wad Madani","El Fasher","Geneina","Kosti","Atbara","Dongola","Sennar","Rabak","Ed Damazin","El Gedaref","Shendi","Berber","Merowe","Ad-Damazin","Zalingei","Kadugli","El Daein","Al Fashir","Tokar","Suakin","Halfa","Shendi Town","Kassala Town"],
  },
  {
    name: "Suriname",
    flag: "🇸🇷",
    cities: ["Paramaribo","Lelydorp","Brokopondo","Nieuw Nickerie","Moengo","Albina","Totness","Onverwacht","Wageningen","Groningen","Brownsweg","Mariënburg","Paranam","Domburg","Nieuw Amsterdam","Berg en Dal","Zanderij","La Vigilantia","Tamanredjo","Meerzorg","Richelieu","Wanhatti","Galibi","Apoera","Kwamalasamutu","Sipaliwini","Stoelmanseiland","Benzdorp","Langatabiki","Pikin Slee"],
  },
  {
    name: "Sweden",
    flag: "🇸🇪",
    cities: ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping","Helsingborg","Jönköping","Norrköping","Lund","Umeå","Gävle","Borås","Södertälje","Eskilstuna","Halmstad","Växjö","Karlstad","Sundsvall","Östersund","Trollhättan","Luleå","Borlänge","Falun","Kalmar","Kristianstad","Skellefteå","Karlskrona","Nyköping"],
  },
  {
    name: "Switzerland",
    flag: "🇨🇭",
    cities: ["Zürich","Geneva","Basel","Lausanne","Bern","Winterthur","Lucerne","St. Gallen","Lugano","Biel/Bienne","Thun","Köniz","La Chaux-de-Fonds","Schaffhausen","Fribourg","Chur","Neuchâtel","Vernier","Uster","Sion","Emmen","Yverdon-les-Bains","Zug","Kriens","Rapperswil-Jona","Dübendorf","Montreux","Frauenfeld","Bellinzona","Aarau"],
  },
  {
    name: "Syria",
    flag: "🇸🇾",
    cities: ["Damascus","Aleppo","Homs","Latakia","Hama","Deir ez-Zor","Raqqa","Idlib","Daraa","Al-Hasakah","Tartus","Douma","Manbij","Qamishli","Jableh","As-Suwayda","Palmyra","Ar-Rastan","Al-Bab","Afrin","Azaz","Jarabulus","Al-Mayadin","Tadmur","Salamiyah","Masyaf","Baniyas","Jisr ash-Shughur","Saraqib","Maarat al-Numan"],
  },
  {
    name: "Tajikistan",
    flag: "🇹🇯",
    cities: ["Dushanbe","Khujand","Kulob","Bokhtar","Istaravshan","Tursunzoda","Vahdat","Konibodom","Isfara","Panjakent","Hisor","Norak","Khorugh","Yovon","Farkhor","Danghara","Vose","Rasht","Jilikul","Qurghonteppa","Buston","Ghafurov","Chkalovsk","Nurek","Kairakkum","Shahritus","Qubodiyon","Ayni","Darvoz","Murghob"],
  },
  {
    name: "Tanzania",
    flag: "🇹🇿",
    cities: ["Dar es Salaam","Mwanza","Arusha","Dodoma","Mbeya","Morogoro","Zanzibar City","Tanga","Moshi","Kigoma","Tabora","Iringa","Mtwara","Songea","Musoma","Shinyanga","Bukoba","Sumbawanga","Singida","Babati","Njombe","Geita","Kahama","Korogwe","Bagamoyo","Morogoro Town","Ifakara","Lindi","Mafinga","Tunduma"],
  },
  {
    name: "Thailand",
    flag: "🇹🇭",
    cities: ["Bangkok","Chiang Mai","Pattaya","Phuket City","Hat Yai","Nakhon Ratchasima","Udon Thani","Khon Kaen","Nakhon Si Thammarat","Chiang Rai","Ayutthaya","Ubon Ratchathani","Surat Thani","Hua Hin","Nakhon Sawan","Phitsanulok","Songkhla","Kanchanaburi","Rayong","Sukhothai","Lampang","Samut Prakan","Nonthaburi","Pathum Thani","Pattaya City","Krabi","Trang","Chon Buri","Saraburi","Suphan Buri"],
  },
  {
    name: "Timor-Leste",
    flag: "🇹🇱",
    cities: ["Dili","Baucau","Maliana","Suai","Lospalos","Same","Viqueque","Aileu","Ainaro","Manatuto","Liquiçá","Ermera","Gleno","Pante Macassar","Los Palos","Tutuala","Maubisse","Venilale","Baguia","Quelicai","Lautém","Fatululic","Bobonaro","Covalima","Manufahi","Ossu","Turiscai","Atauro","Metinaro","Hera"],
  },
  {
    name: "Togo",
    flag: "🇹🇬",
    cities: ["Lomé","Sokodé","Kara","Atakpamé","Kpalimé","Dapaong","Tsévié","Aného","Notsé","Bassar","Bafilo","Amlamé","Niamtougou","Mango","Badou","Kévé","Vogan","Tabligbo","Tchamba","Kandé","Aneho","Blitta","Kpagouda","Agou-Gare","Kara Town","Sokodé Town","Atakpamé Town","Kpalimé Town","Dapaong Town","Notsé Town"],
  },
  {
    name: "Tonga",
    flag: "🇹🇴",
    cities: ["Nuku'alofa","Neiafu","Haveluloto","Vaini","Tofoa-Koloua","Pangai","Ohonua","Mu'a","Hihifo","Ha'apai","Tongatapu","Vava'u","Eua","Niuafo'ou","Niuatoputapu","Kolonga","Tatakamotonga","Lapaha","Pea","Fua'amotu","Navutoka","Longomapu","Hahake","Houma","Nukunuku","Kolovai","Sopu","Ma'ufanga","Popua","Fanga"],
  },
  {
    name: "Trinidad and Tobago",
    flag: "🇹🇹",
    cities: ["Port of Spain","San Fernando","Chaguanas","Arima","Point Fortin","Scarborough","Tunapuna","Couva","Diego Martin","Princes Town","Sangre Grande","Penal","Siparia","Mayaro","Rio Claro","Debe","Cunupia","Arouca","Barataria","Laventille","Marabella","Gasparillo","Tacarigua","St. Joseph","Mahaica","Claxton Bay","Tobago","Crown Point","Plymouth","Roxborough"],
  },
  {
    name: "Tunisia",
    flag: "🇹🇳",
    cities: ["Tunis","Sfax","Sousse","Ettadhamen","Kairouan","Gabès","Bizerte","Ariana","Gafsa","El Mourouj","Ben Arous","Monastir","Nabeul","Hammamet","Médenine","Zarzis","Kasserine","Mahdia","Djerba Midun","Houmt Souk","Beja","Jendouba","Le Kef","Tozeur","Douz","Tataouine","Siliana","Zaghouan","Menzel Bourguiba","Korba"],
  },
  {
    name: "Türkiye",
    flag: "🇹🇷",
    cities: ["Istanbul","Ankara","Izmir","Bursa","Antalya","Adana","Konya","Gaziantep","Şanlıurfa","Mersin","Diyarbakır","Kayseri","Eskişehir","Samsun","Denizli","Adapazarı","Malatya","Kahramanmaraş","Erzurum","Van","Batman","Elazığ","Manisa","Balıkesir","Sivas","Gebze","Tarsus","Trabzon","Çorum","Ordu"],
  },
  {
    name: "Turkmenistan",
    flag: "🇹🇲",
    cities: ["Ashgabat","Türkmenabat","Daşoguz","Mary","Balkanabat","Baýramaly","Tejen","Turkmenbaşy","Serdar","Köneürgenç","Annau","Abadan","Gökdepe","Bäherden","Kaka","Seydi","Magdanly","Atamyrat","Kerki","Gazanjyk","Bereket","Hazar","Gumdag","Tagtabazar","Ýolöten","Sakarçäge","Sarahs","Farap","Köýtendag","Garabogaz"],
  },
  {
    name: "Tuvalu",
    flag: "🇹🇻",
    cities: ["Funafuti","Vaiaku","Fongafale","Asau","Savave","Tanrake","Lolua","Kulia","Teava","Toga","Motulalo","Niulakita","Niutao","Nanumea","Nanumaga","Nui","Vaitupu","Nukufetau","Nukulaelae","Niulakita Village","Nanumea Village","Nanumaga Village","Niutao Village","Nui Village","Vaitupu Village","Nukufetau Village","Nukulaelae Village","Fongafale Village","Vaiaku Village","Asau Village"],
  },
  {
    name: "Uganda",
    flag: "🇺🇬",
    cities: ["Kampala","Gulu","Lira","Mbarara","Jinja","Mbale","Kasese","Fort Portal","Masaka","Entebbe","Arua","Soroti","Kabale","Hoima","Mityana","Mukono","Njeru","Iganga","Tororo","Busia","Mubende","Kitgum","Moroto","Lugazi","Masindi","Kisoro","Kamuli","Wakiso","Rukungiri","Bushenyi"],
  },
  {
    name: "Ukraine",
    flag: "🇺🇦",
    cities: ["Kyiv","Kharkiv","Odesa","Dnipro","Donetsk","Lviv","Zaporizhzhia","Kryvyi Rih","Mykolaiv","Mariupol","Vinnytsia","Poltava","Chernihiv","Cherkasy","Sumy","Zhytomyr","Khmelnytskyi","Chernivtsi","Rivne","Ivano-Frankivsk","Ternopil","Lutsk","Uzhhorod","Bila Tserkva","Kremenchuk","Melitopol","Brovary","Nikopol","Pavlohrad","Kropyvnytskyi"],
  },
  {
    name: "United Arab Emirates",
    flag: "🇦🇪",
    cities: ["Dubai","Abu Dhabi","Sharjah","Al Ain","Ajman","Ras Al Khaimah","Fujairah","Umm Al Quwain","Khor Fakkan","Dibba Al-Fujairah","Dibba Al-Hisn","Kalba","Madinat Zayed","Liwa Oasis","Ruwais","Jebel Ali","Hatta","Masdar City","Mussafah","Al Dhaid","Ar-Rams","Ghayathi","Zayed City","Al Hamriyah","Al Madam","Al Sila","Delma Island","Mirfa","Dhaid","Al Jazirah Al Hamra"],
  },
  {
    name: "United Kingdom",
    flag: "🇬🇧",
    cities: ["London","Birmingham","Glasgow","Liverpool","Bristol","Manchester","Sheffield","Leeds","Edinburgh","Leicester","Coventry","Bradford","Cardiff","Belfast","Nottingham","Newcastle upon Tyne","Brighton and Hove","Plymouth","Stoke-on-Trent","Wolverhampton","Derby","Southampton","Swansea","Salford","Aberdeen","Westminster","Portsmouth","York","Peterborough","Oxford"],
  },
  {
    name: "United States",
    flag: "🇺🇸",
    cities: ["New York City","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","Jacksonville","Austin","Fort Worth","San Jose","Columbus","Charlotte","Indianapolis","Seattle","Denver","Washington, D.C.","Nashville","Oklahoma City","El Paso","Boston","Portland","Las Vegas","Detroit","Memphis","Louisville","Baltimore","Milwaukee"],
  },
  {
    name: "Uruguay",
    flag: "🇺🇾",
    cities: ["Montevideo","Salto","Ciudad de la Costa","Paysandú","Las Piedras","Rivera","Maldonado","Tacuarembó","Melo","Mercedes","Artigas","Minas","San José de Mayo","Durazno","Florida","Colonia del Sacramento","Rocha","Pando","Fray Bentos","Treinta y Tres","Canelones","Nueva Helvecia","Dolores","Carmelo","Nueva Palmira","San Carlos","La Paz","Santa Lucía","Young","Chuy"],
  },
  {
    name: "Uzbekistan",
    flag: "🇺🇿",
    cities: ["Tashkent","Samarkand","Namangan","Andijan","Bukhara","Nukus","Qarshi","Fergana","Kokand","Margilan","Jizzakh","Termez","Navoiy","Urgench","Gulistan","Chirchiq","Angren","Bekabad","Denov","Shahrisabz","Kattaqo'rg'on","Zarafshan","Chust","Asaka","Yangiyul","Olmaliq","G'ijduvon","Kagan","Khiva","Qŭqon"],
  },
  {
    name: "Vanuatu",
    flag: "🇻🇺",
    cities: ["Port Vila","Luganville","Isangel","Lakatoro","Sola","Lenakel","Norsup","Port Olry","Tanna","Espiritu Santo","Malakula","Pentecost","Ambrym","Ambae","Efate","Erromango","Aneityum","Torba","Sanma","Shefa","Tafea","Penama","Malampa","Sarakata","Lolowai","Redcliffe","Vao","Longana","Craig Cove","Dillon's Bay"],
  },
  {
    name: "Vatican City",
    flag: "🇻🇦",
    cities: ["Vatican City","St. Peter's Square","Vatican Gardens","Vatican Museums","Apostolic Palace","Belvedere Courtyard","Cortile del Belvedere","Via della Conciliazione","St. Peter's Basilica","Sistine Chapel","Paul VI Audience Hall","Vatican Necropolis","Campo Santo Teutonico","Santa Marta","Vatican Railway Station","Vatican Library","Vatican Apostolic Archives","Pinacoteca","Bramante Staircase","Raphael Rooms","Borgia Apartment","Niccoline Chapel","Cortile della Pigna","Passetto di Borgo","Porta Sant'Anna","Porta del Perugino","San Damaso Courtyard","Governatorate of Vatican City","Vatican Pharmacy","Vatican Post Office"],
  },
  {
    name: "Venezuela",
    flag: "🇻🇪",
    cities: ["Caracas","Maracaibo","Valencia","Barquisimeto","Maracay","Ciudad Guayana","Barcelona","Maturín","Puerto La Cruz","Petare","Ciudad Bolívar","Barinas","Cumaná","Mérida","Cabimas","Acarigua","Los Teques","Guanare","San Cristóbal","Coro","Punto Fijo","El Tigre","Valera","Carúpano","Porlamar","Puerto Cabello","Ocumare del Tuy","Araure","San Fernando de Apure","Anaco"],
  },
  {
    name: "Vietnam",
    flag: "🇻🇳",
    cities: ["Ho Chi Minh City","Hanoi","Hai Phong","Da Nang","Can Tho","Bien Hoa","Hue","Nha Trang","Buon Ma Thuot","Vung Tau","Quy Nhon","Thai Nguyen","Nam Dinh","Vinh","Ha Long","Thanh Hoa","Rach Gia","My Tho","Long Xuyen","Cam Ranh","Phan Thiet","Pleiku","Da Lat","Tuy Hoa","Bac Ninh","Thai Binh","Hai Duong","Dong Hoi","Lao Cai","Viet Tri"],
  },
  {
    name: "Yemen",
    flag: "🇾🇪",
    cities: ["Sana'a","Aden","Taiz","Hodeidah","Ibb","Dhamar","Mukalla","Sa'dah","Hajjah","Zinjibar","Marib","Sayyan","Amran","Bayt al-Faqih","Zabid","Rada'a","Yarim","Seiyun","Shibam","Ataq","Al Ghaydah","Lahij","Damt","Jibla","Khamir","Bajil","Abs","Harad","Al Bayda","Tarim"],
  },
  {
    name: "Zambia",
    flag: "🇿🇲",
    cities: ["Lusaka","Kitwe","Ndola","Kabwe","Chingola","Livingstone","Luanshya","Mufulira","Kasama","Chipata","Solwezi","Mongu","Mazabuka","Kafue","Choma","Kalulushi","Petauke","Mansa","Kapiri Mposhi","Serenje","Monze","Mkushi","Mpika","Chinsali","Siavonga","Sesheke","Zimba","Mumbwa","Luangwa","Nakonde"],
  },
  {
    name: "Zimbabwe",
    flag: "🇿🇼",
    cities: ["Harare","Bulawayo","Chitungwiza","Mutare","Gweru","Epworth","Kwekwe","Kadoma","Masvingo","Chinhoyi","Marondera","Norton","Chegutu","Zvishavane","Bindura","Victoria Falls","Hwange","Redcliff","Beitbridge","Rusape","Chipinge","Kariba","Gokwe","Mvurwi","Shurugwi","Chiredzi","Karoi","Ruwa","Plumtree","Murehwa"],
  },
];

/**
 * Get a country entry by name (case-insensitive).
 */
export function getCountryEntry(name: string): CountryEntry | undefined {
  return COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get cities for a given country name. Returns empty array if not found.
 */
export function getCitiesForCountry(countryName: string): string[] {
  return getCountryEntry(countryName)?.cities ?? [];
}

export { getSubcitiesForCity, SUBCITIES_DATABASE } from "./subcities-database";
