/**
 * Sub-cities & Local Administrative Subdivisions Database
 * Maps Countries -> Cities -> Sub-cities / Districts / Quarters / Wards / Local Areas.
 */

export const SUBCITIES_DATABASE: Record<string, Record<string, string[]>> = {
  "Azerbaijan": {
    "Baku": ["Binagadi", "Garadagh", "Khatai", "Khazar", "Narimanov", "Nasimi", "Nizami", "Sabunchu", "Sabail", "Surakhani", "Yasamal", "Pirallahi"],
    "Ganja": ["Nizami District", "Kəpəz District", "Central Ganja", "Surrounding Settlements"],
    "Sumqayit": ["1st–17th Microdistricts", "18th Quarter", "Corat", "Hacı Zeynalabdin settlement"],
    "Lankaran": ["Lankaran city", "Haftoni", "Liman", "Hirkan", "Shilavar", "Separadi"],
    "Mingachevir": ["Central Mingachevir", "Yeni Mingachevir", "Bağlar", "Industrial Area"],
    "Nakhchivan": ["Nakhchivan city", "Qaraçuq", "Qaraxanbəyli", "Başbaşı", "Surrounding Settlements"],
    "Shirvan": ["Shirvan Centre", "Bayramlı", "Hacıqəhrəmanlı", "Surrounding Areas"],
    "Yevlakh": ["Yevlakh Centre", "Aran", "Tanrıqulular", "Nemətabad", "Malbinəsi"],
    "Shaki": ["Shaki Centre", "Kish", "Oxud", "Bash Kungut", "Bash Layisqi"],
    "Khirdalan": ["Khirdalan Centre", "28 May area", "AAAF Park", "Abşeron residential areas"],
    "Naftalan": ["Naftalan Centre", "Sahar", "Qashalty", "Surrounding Areas"],
    "Qabala": ["Gabala Centre", "Bum", "Vandam", "Nic", "Tikanlı"],
    "Quba": ["Quba Centre", "Qırmızı Qəsəbə", "Alpan", "Amsar", "Rustov"],
    "Shamakhi": ["Shamakhi Centre", "Meysari", "Sabir", "Chukhuryurd"],
    "Salyan": ["Salyan Centre", "Kürsəngi", "Yenikənd", "Qırxçıraq"],
    "Agjabadi": ["Agjabadi Centre", "Hindarx", "Qaravəlli", "Avşar"],
    "Barda": ["Barda Centre", "Lənbəran", "Qaradəmirçi", "Kətəlparaq"],
    "Bilasuvar": ["Bilasuvar Centre", "Amankənd", "Ağalıkənd", "Bəydili"],
    "Jalilabad": ["Jalilabad Centre", "Göytəpə", "Uzuntəpə", "Privolnoye"],
    "Imishli": ["Imishli Centre", "Bozavand", "Bəhrəmtəpə", "Aranlı"],
    "Sabirabad": ["Sabirabad Centre", "Ulacalı", "Qalağayın", "Kürkəndi"],
    "Saatli": ["Saatli Centre", "Azadkənd", "Mustafabəyli", "Qaralar"],
    "Astara": ["Astara Centre", "Kakalos", "Pensər", "Artupa", "Şahağacı"],
    "Masalli": ["Masalli Centre", "Boradigah", "Ərkivan", "Hişkədərə"],
    "Goychay": ["Göyçay Centre", "Potu", "Qaraman", "Çərəkə"],
    "Goygol": ["Göygöl Centre", "Hacıməlik", "Toğanalı", "Aşıqlı"],
    "Tovuz": ["Tovuz Centre", "Qovlar", "Dondar Quşçu", "Bozalqanlı"],
    "Agdash": ["Agdash Centre", "Ləki", "Orta Ləki", "Nehrəxəlil"],
    "Zaqatala": ["Zaqatala Centre", "Əliabad", "Car", "Tala", "Yuxarı Tala"],
    "Balakan": ["Balakan Centre", "Katex", "Mahamalar", "Qabaqçöl"]
  },
  "Bahamas": {
    "Nassau": ["Downtown Nassau", "Cable Beach", "Western District", "Eastern District", "Fox Hill", "Grants Town", "Bain Town", "Centreville", "Montagu"],
    "Freeport": ["Downtown Freeport", "Lucaya", "Williams Town", "Pinder's Point", "Eight Mile Rock", "Hawksbill"],
    "West End": ["West End settlement", "Bootle Bay", "Old Bahama Bay"],
    "Marsh Harbour": ["Marsh Harbour", "Dundas Town", "Murphy Town", "Spring City"],
    "Cooper's Town": ["Cooper's Town", "Treasure Cay area", "Crossing Rocks"],
    "George Town": ["George Town", "Exuma settlements", "Rolle Town", "Farmer's Hill"],
    "Dunmore Town": ["Dunmore Town", "Harbour Island settlements"],
    "Governor's Harbour": ["Governor's Harbour", "Cupid's Cay", "James Cistern", "Palmetto Point"],
    "Rock Sound": ["Rock Sound", "Tarpum Bay", "Green Castle"],
    "Alice Town": ["Alice Town", "Hatchet Bay", "Lower Bogue"],
    "Andros Town": ["Fresh Creek", "Central Andros", "Andros Town"],
    "Nichollstown and Berry Islands": ["Nichollstown", "Great Harbour Cay", "Bullock Harbour"],
    "Arthur's Town": ["Arthur's Town", "Orange Creek", "The Bight"],
    "Cockburn Town": ["Cockburn Town", "Grand Turk settlements"],
    "Clarence Town": ["Clarence Town", "Deadman's Cay", "Salt Pond"],
    "Duncan Town": ["Duncan Town", "Ragged Island settlements"],
    "Matthew Town": ["Matthew Town", "Inagua settlements"],
    "Port Nelson": ["Port Nelson", "Surrounding Long Island settlements"],
    "Spanish Wells": ["Spanish Wells", "Russell Island"],
    "High Rock": ["High Rock", "East Grand Bahama settlements"],
    "Fresh Creek": ["Fresh Creek", "Central Andros"],
    "Mangrove Cay": ["Moxon Town", "Lisbon Creek", "Burnt Ground"],
    "The Bluff": ["The Bluff", "North Andros settlements"],
    "San Andros": ["San Andros", "Nichollstown area"],
    "Deadman's Cay": ["Deadman's Cay", "Salt Pond", "Clarence Town"],
    "Simms": ["Simms", "Long Island settlements"],
    "Pirates Well": ["Pirates Well", "Nearby settlements"],
    "Sandy Point": ["Sandy Point", "Moore's Island area"],
    "Cherokee Point": ["Cherokee Point", "Cherokee settlements"],
    "Treasure Cay": ["Treasure Cay", "Treasure Cay community", "Nearby Abaco settlements"]
  },
  "Bahrain": {
    "Manama": ["Manama Centre", "Diplomatic Area", "Adliya", "Juffair", "Hoora", "Gudaibiya", "Seef", "Sanabis", "Salmaniya", "Zinj"],
    "Riffa": ["East Riffa", "West Riffa", "Bu Kuwara", "Al Hunainiya", "Al Buhair", "Al Hajiyat", "Al Rawdah"],
    "Muharraq": ["Muharraq Centre", "Busaiteen", "Al Dair", "Samaheej", "Arad", "Galali", "Hidd"],
    "Hamad Town": ["Hamad Town", "Roundabout 1–17 areas", "Al Markh", "Dar Kulaib"],
    "A'ali": ["A'ali Centre", "Ramli", "Buri", "Salmabad", "Zayed Town"],
    "Isa Town": ["Isa Town", "Jidd Ali", "Jerdab", "Sanad"],
    "Sitra": ["Sitra", "Wadiyan", "Al Kharijiya", "Marquban", "Sharq Sitra"],
    "Jidhafs": ["Jidhafs Centre", "Al Daih", "Seef", "Sanabis"],
    "Budaiya": ["Budaiya", "Janabiya", "Diraz", "Bani Jamra", "Barbar"],
    "Al Hidd": ["Hidd Centre", "East Hidd", "West Hidd", "Industrial Area"],
    "Jid Ali": ["Jid Ali", "Jerdab", "Sanad", "Nearby residential areas"],
    "Sanabis": ["Sanabis", "Seef", "Daih", "Jidhafs"],
    "Tubli": ["Tubli", "Jurdab", "Nabih Saleh", "Sanad"],
    "Diraz": ["Diraz", "Bani Jamra", "Barbar", "Budaiya"],
    "Barbar": ["Barbar", "Diraz", "Janabiya"],
    "Saar": ["Saar", "Janabiya", "Maqaba", "Jid Al Haj"],
    "Karzakan": ["Karzakan", "Damistan", "Malkiya", "Sadad"],
    "Bani Jamra": ["Bani Jamra", "Diraz", "Barbar"],
    "Daih": ["Daih", "Jidhafs", "Sanabis"],
    "Al Duraz": ["Diraz", "Budaiya", "Bani Jamra"],
    "Jannusan": ["Jannusan", "Saar", "Janabiya"],
    "Adliya": ["Adliya", "Gudaibiya", "Mahooz"],
    "Seef": ["Seef", "Sanabis", "Diplomatic Area"],
    "Zinj": ["Zinj", "Umm Al Hassam", "Juffair"],
    "Galali": ["Galali", "Diyar Al Muharraq", "Samaheej"],
    "Arad": ["Arad", "Busaiteen", "Galali"],
    "Askar": ["Askar", "Jaww", "Sakhir"],
    "Jaww": ["Jaww", "Askar", "Sakhir"],
    "Zallaq": ["Zallaq", "Safriya", "Al Hamala"],
    "Salmabad": ["Salmabad", "A'ali", "Buri", "Tubli"]
  },
  "Bangladesh": {
    "Dhaka": ["Dhaka North City Corporation", "Dhaka South City Corporation", "Gulshan", "Uttara", "Mirpur", "Mohammadpur", "Dhanmondi", "Tejgaon", "Motijheel", "Ramna", "Wari", "Jatrabari", "Lalbagh", "Demra", "Banani", "Badda"],
    "Chattogram": ["Kotwali", "Pahartali", "Panchlaish", "Khulshi", "Halishahar", "Agrabad", "Bakalia", "Chandgaon", "Patenga", "Bayezid"],
    "Khulna": ["Khalishpur", "Sonadanga", "Daulatpur", "Khulna Sadar", "Khan Jahan Ali", "Boyra", "Nirala"],
    "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Shah Makhdum", "Kazla", "Talaimari", "Sopura"],
    "Sylhet": ["Ambarkhana", "Zindabazar", "Lamabazar", "Subidbazar", "Shibganj", "Amberkhana", "Tilagor"],
    "Rangpur": ["Rangpur Sadar", "Mahiganj", "Modern", "Pairaband", "Kachari Bazar", "Keranipara"],
    "Mymensingh": ["Mymensingh Sadar", "Ganginarpar", "Maskanda", "Town Hall", "Charpara", "Kachari"],
    "Barishal": ["Barishal Sadar", "Kawnia", "Rupatali", "Nathullabad", "Sagardi", "Alekanda"],
    "Comilla": ["Adarsha Sadar", "Kandirpar", "Jhautola", "Shashongacha", "Tomchom Bridge", "Race Course"],
    "Narayanganj": ["Narayanganj Sadar", "Fatullah", "Siddhirganj", "Bandar", "Chashara", "Tanbazar"],
    "Gazipur": ["Tongi", "Gazipur Sadar", "Joydebpur", "Konabari", "Kaliakair", "Board Bazar", "Chandana"],
    "Tongi": ["Tongi East", "Tongi West", "Cherag Ali", "College Gate", "Station Road"],
    "Bogra": ["Bogura Sadar", "Thanthania", "Jaleshwaritola", "Satmatha", "Chelopara", "Naruli"],
    "Savar": ["Savar", "Ashulia", "Hemayetpur", "Aminbazar", "Baipayl", "Dhamsona"],
    "Jessore": ["Jashore Sadar", "Chanchra", "Arabpur", "Barandipara", "Rail Road", "Monihar"],
    "Cox's Bazar": ["Cox's Bazar Sadar", "Jhautola", "Sugandha", "Kalatali", "Baharchhara", "Link Road"],
    "Dinajpur": ["Dinajpur Sadar", "Balubari", "Pulhat", "Munshipara", "Ghashipara"],
    "Narsingdi": ["Narsingdi Sadar", "Madhabdi", "Palash", "Panchdona", "Baghata"],
    "Tangail": ["Tangail Sadar", "Akur Takur", "Kodalia", "College Para", "New Bus Stand"],
    "Jamalpur": ["Jamalpur Sadar", "Dewanpara", "Station Road", "Nandina", "Sharifpur"],
    "Pabna": ["Pabna Sadar", "Shalgaria", "Radhanagar", "Kalachandpara", "Ataikula"],
    "Kushtia": ["Kushtia Sadar", "Mojompur", "Court Para", "Thanapara", "Baradi"],
    "Faridpur": ["Faridpur Sadar", "Goalchamat", "Alipur", "Ambika Road", "Komorpur"],
    "Saidpur": ["Saidpur Sadar", "Bangalipur", "New Babupara", "Railway Colony"],
    "Feni": ["Feni Sadar", "Trunk Road", "Mohipal", "Master Para", "Academy Road"],
    "Noakhali": ["Maijdee", "Sonapur", "Begumganj", "Chowmuhani", "Noakhali Sadar"],
    "Brahmanbaria": ["Brahmanbaria Sadar", "Paikpara", "College Road", "Medda", "Kandipara"],
    "Sreemangal": ["Sreemangal Town", "Kalighat", "Bhanugach", "College Road", "Madhabpur"],
    "Moulvibazar": ["Moulvibazar Sadar", "Court Road", "Saifur Rahman Road", "Borolekha Road"],
    "Rangamati": ["Rangamati Sadar", "Tabalchhari", "Reserve Bazar", "Banarupa", "Vedvedi"]
  },
  "Barbados": {
    "Bridgetown": ["St. Michael", "Broad Street", "Swan Street", "Fontabelle", "Cheapside", "Careenage"],
    "Speightstown": ["St. Peter", "Queen Street", "Orange Street", "Heywoods", "Port St. Charles"],
    "Oistins": ["Christ Church", "Oistins Hill", "Miami Beach", "Enterprise", "Scarborough"],
    "Holetown": ["St. James", "First Street", "Second Street", "Sunset Crest", "Sandy Lane"],
    "Bathsheba": ["St. Joseph", "Cattlewash", "Hillcrest", "Tent Bay", "Joe's River"],
    "Crane": ["St. Philip", "Crane Beach", "Diamond Valley", "Kirtons"],
    "Six Cross Roads": ["St. Philip", "Emerald City", "Workmans", "Sunbury"],
    "Hastings": ["Christ Church", "Hastings Rocks", "Balmoral Gap", "Marine Gardens"],
    "Warrens": ["St. Michael", "Warrens Great House", "Warrens North", "Warrens South"],
    "Black Rock": ["St. Michael", "Eagle Hall", "Carlton", "Deacons"],
    "Worthing": ["Christ Church", "Worthing Beach", "Sandy Beach", "Harmony Hall"],
    "Christ Church": ["Oistins", "Hastings", "Worthing", "Dover", "Rockley", "Maxwell"],
    "Saint Lawrence": ["Christ Church", "St. Lawrence Gap", "Dover Beach", "Dover Woods"],
    "Maxwell": ["Christ Church", "Maxwell Coast Road", "Top Rock", "Maxwell Hill"],
    "Dover": ["Christ Church", "Dover Woods", "Dover Beach", "Dover Convention Area"],
    "Rockley": ["Christ Church", "Rockley Beach", "Golf Club Area", "Blue Waters"],
    "St. Philip": ["Six Cross Roads", "Crane", "Sam Lord's Castle", "Ruby", "Foul Bay"],
    "St. George": ["Bulkeley", "The Valley", "Charles Rowe Bridge", "Ellerton", "Gun Hill"],
    "St. Michael": ["Bridgetown", "Black Rock", "Warrens", "Bank Hall", "Belleville", "Grazettes"],
    "St. James": ["Holetown", "Fitts Village", "Paynes Bay", "Prospect", "Porters"],
    "St. Peter": ["Speightstown", "Mullins", "Gibbes", "Bakers", "Haymans"],
    "St. Lucy": ["Checker Hall", "Crab Hill", "Animal Flower Cave Area", "Pie Corner"],
    "St. Andrew": ["Belleplaine", "Barclay's Park", "Chalky Mount", "Bawdens"],
    "St. Joseph": ["Bathsheba", "Horse Hill", "Blackmans", "Chimborazo"],
    "St. John": ["Bath", "Four Roads", "Gall Hill", "Newcastle", "Malvern"],
    "St. Thomas": ["Welchman Hall", "Porters", "Bagatelle", "Arch Hall", "Lion Castle"],
    "The Belle": ["St. Michael", "Belle Gully", "Bibby's Lane", "Lower Estate"],
    "Crab Hill": ["St. Lucy", "Bromefield", "Hope", "North Point"],
    "Diamond Corner": ["St. Peter", "Portland", "Indian Ground", "Mile and a Quarter"],
    "Welchman Hall": ["St. Thomas", "Welchman Hall Gully", "Harrison's Cave Area", "Holy Innocents"]
  },
  "Belarus": {
    "Minsk": ["Centralny", "Savetski", "Pershamayski", "Partizanski", "Zavodski", "Leninski", "Kastrychnitski", "Maskowski", "Frunzyenski"],
    "Gomel": ["Centralny", "Savetski", "Novabelitski", "Zheleznodorozhny"],
    "Mogilev": ["Leninski", "Kastrychnitski", "Pervomayski"],
    "Vitebsk": ["Zheleznodorozhny", "Kastrychnitski", "Pershamayski"],
    "Grodno": ["Leninski", "Kastrychnitski"],
    "Brest": ["Leninski", "Maskowski"],
    "Babruysk": ["Leninski", "Pervomayski"],
    "Baranavichy": ["Central city", "East", "West", "North", "South"],
    "Barysaw": ["Central", "East", "West", "North", "South"],
    "Pinsk": ["Central", "South", "North", "East", "West"],
    "Orsha": ["Central", "East", "West", "North", "South"],
    "Mazyr": ["Central", "Pravoberezhny", "Left Bank", "Industrial Area"],
    "Salihorsk": ["Central", "4th Microdistrict", "5th Microdistrict", "New Town"],
    "Novopolotsk": ["Central", "Borovukha", "1st–12th Microdistricts"],
    "Lida": ["Central", "North", "South", "East", "West"],
    "Molodechno": ["Central", "Borovki", "Kirov", "Vostochny", "Zapadny"],
    "Polotsk": ["Central", "New Polotsk", "Zarechye", "Western Area"],
    "Slutsk": ["Central", "North", "South", "East", "West"],
    "Zhlobin": ["Central", "1st–18th Microdistricts", "Industrial Area"],
    "Svetlogorsk": ["Central", "Shatilki", "Novoselki", "Polesie"],
    "Rechytsa": ["Central", "East", "West", "North", "South"],
    "Kobryn": ["Central", "North", "South", "East", "West"],
    "Volkovysk": ["Central", "North", "South", "East", "West"],
    "Smarhon": ["Central", "North", "South", "East", "West"],
    "Osipovichi": ["Central", "East", "West", "North", "South"],
    "Navahrudak": ["Central", "North", "South", "East", "West"],
    "Dobrush": ["Central", "East", "West", "North", "South"],
    "Horki": ["Central", "University Area", "East", "West"],
    "Krichev": ["Central", "East", "West", "North", "South"],
    "Luninets": ["Central", "North", "South", "East", "West"]
  },
  "Cameroon": {
    "Yaoundé": ["Yaoundé I", "Yaoundé II", "Yaoundé III", "Yaoundé IV", "Yaoundé V", "Yaoundé VI", "Yaoundé VII", "Bastos", "Mvan", "Biyem-Assi"],
    "Douala": ["Douala I", "Douala II", "Douala III", "Douala IV", "Douala V", "Douala VI", "Bonanjo", "Akwa", "Bonapriso", "Deido"],
    "Garoua": ["Garoua I", "Garoua II", "Garoua III", "Lainde", "Poumpoumre", "Bibemire"],
    "Bamenda": ["Bamenda I", "Bamenda II", "Bamenda III", "Commercial Avenue", "Up Station", "Mile 2", "Mile 4"],
    "Maroua": ["Maroua I", "Maroua II", "Maroua III", "Hardé", "Domayo", "Diguirwo"],
    "Bafoussam": ["Bafoussam I", "Bafoussam II", "Bafoussam III", "Djeleng", "Tougang", "Kamkop"],
    "Ngaoundéré": ["Ngaoundéré I", "Ngaoundéré II", "Ngaoundéré III", "Baladji", "Sabongari", "Bamyanga"],
    "Bertoua": ["Bertoua I", "Bertoua II", "Mokolo", "Enia", "Tigaza"],
    "Kumba": ["Kumba I", "Kumba II", "Kumba III", "Fiango", "Station", "Buea Road"],
    "Limbe": ["Limbe I", "Limbe II", "Limbe III", "Down Beach", "Half Mile", "Bota", "Mile 4"],
    "Nkongsamba": ["Nkongsamba I", "Nkongsamba II", "Nkongsamba III", "Quartier 1", "Quartier 2"],
    "Ebolowa": ["Ebolowa I", "Ebolowa II", "Nko'ovos", "Angale", "Mekalat"],
    "Kribi": ["Kribi I", "Kribi II", "Dombé", "Mboamanga", "Grand Batanga", "Tara Plage"],
    "Buea": ["Buea I", "Buea II", "Molyko", "Clerks Quarters", "Great Soppo", "Bokwango", "Mile 16"],
    "Edéa": ["Edéa I", "Edéa II", "Ekite", "Pongo", "Haute Tension"],
    "Foumban": ["Foumban Centre", "Palais Royal", "Njinka", "Kounga", "Foumbot-area"],
    "Dschang": ["Dschang Centre", "Fongo-Tongo", "Keleng", "Foreke", "Tsinkop"],
    "Mbalmayo": ["Mbalmayo I", "Mbalmayo II", "Oyack", "Mbock-Ndoumbe"],
    "Loum": ["Loum Centre", "Manjo Road", "Quartier Haoussa", "Gare"],
    "Kousseri": ["Kousseri Centre", "Logone-Birni area", "Mada", "Gare Routière"],
    "Mokolo": ["Mokolo Centre", "Zamay", "Ldamtsai", "Mokolo Nord"],
    "Guider": ["Guider Centre", "Mayo-Louti area", "Guider Sud", "Sabongari"],
    "Meiganga": ["Meiganga Centre", "Gare Routière", "Sabongari", "Kombo"],
    "Batouri": ["Batouri Centre", "Kadey area", "Mokolo", "Gare"],
    "Yagoua": ["Yagoua Centre", "Danay area", "Yagoua Sud", "Gobaye"],
    "Sangmélima": ["Sangmélima I", "Sangmélima II", "Akonolinga Road", "Monavebe"],
    "Tiko": ["Tiko Town", "Likomba", "Mutengene area", "Golf Club area", "Tiko Wharf"],
    "Mutengene": ["Mutengene Centre", "Limbe Junction", "Mile 4", "Quarter 1"],
    "Kumbo": ["Kumbo Centre", "Tobin", "Squares", "Nso local area", "Kikaikelaki"],
    "Wum": ["Wum Centre", "Aghem area", "Wum Central", "Wum Nord"]
  },
  "Canada": {
    "Toronto": ["Etobicoke North", "Etobicoke Centre", "Etobicoke Lakeshore", "York South—Weston", "York Centre", "Davenport", "Spadina—Fort York", "University—Rosedale", "Toronto—St. Paul's", "Don Valley West", "Don Valley East", "Beaches—East York", "Scarborough Southwest", "Scarborough Centre", "Scarborough—Guildwood", "Scarborough North", "Scarborough—Rouge Park", "Willowdale", "Downtown Core", "Yorkville", "Queen West"],
    "Montreal": ["Ahuntsic-Cartierville", "Anjou", "Côte-des-Neiges—Notre-Dame-de-Grâce", "Lachine", "LaSalle", "Mercier—Hochelaga-Maisonneuve", "Montréal-Nord", "Outremont", "Pierrefonds-Roxboro", "Le Plateau-Mont-Royal", "Rivière-des-Prairies—Pointe-aux-Trembles", "Rosemont—La Petite-Patrie", "Saint-Laurent", "Saint-Léonard", "Le Sud-Ouest", "Verdun", "Ville-Marie", "Villeray—Saint-Michel—Parc-Extension", "Old Montreal", "Mile End"],
    "Vancouver": ["Downtown", "West End", "Kitsilano", "Fairview", "Mount Pleasant", "Grandview-Woodland", "Strathcona", "Hastings-Sunrise", "Kensington-Cedar Cottage", "Renfrew-Collingwood", "Killarney", "Sunset", "Victoria-Fraserview", "Marpole", "Oakridge", "Riley Park", "Dunbar-Southlands", "Kerrisdale", "Arbutus Ridge", "Shaughnessy", "West Point Grey", "Yaletown", "Gastown", "Coal Harbour"],
    "Calgary": ["Downtown", "Beltline", "Inglewood", "Bowness", "Brentwood", "Forest Lawn", "Seton", "Mahogany", "Kensington", "Bridgeland", "Mission", "Mount Royal", "Signal Hill", "Tuscany"],
    "Edmonton": ["Downtown", "Oliver", "Strathcona", "Westmount", "Glenora", "Mill Woods", "Clareview", "Castle Downs", "Terwillegar", "Windermere", "Summerside", "Riverbend", "Garneau", "Bonnie Doon"],
    "Ottawa": ["Kanata North", "Kanata South", "Orléans East-Cumberland", "Orléans South-Navan", "Barrhaven East", "Barrhaven West", "Rideau-Jock", "Nepean", "Gloucester-Southgate", "Alta Vista", "Rideau-Vanier", "Rideau-Rockcliffe", "Somerset", "Kitchissippi", "Bay", "College", "Knoxdale-Merivale", "ByWard Market", "The Glebe", "Centretown"],
    "Winnipeg": ["St. James", "Assiniboine South", "St. Charles", "Charleswood-Tuxedo-Westwood", "River Heights-Fort Garry", "Fort Rouge-East Fort Garry", "St. Boniface", "St. Vital", "Elmwood-East Kildonan", "North Kildonan", "Old Kildonan", "Point Douglas", "Exchange District", "Osborne Village"],
    "Quebec City": ["La Cité-Limoilou", "Les Rivières", "Sainte-Foy–Sillery–Cap-Rouge", "Charlesbourg", "Beauport", "La Haute-Saint-Charles", "Vieux-Québec", "Saint-Roch", "Montcalm"],
    "Hamilton": ["Ancaster", "Dundas", "Flamborough", "Glanbrook", "Hamilton Downtown", "Stoney Creek", "Westdale", "Mountain"],
    "Kitchener": ["Downtown", "Stanley Park", "Chicopee", "Centreville-Chicopee", "Forest Heights", "Forest Hill", "Laurentian", "Huron Park", "Doon South", "Williamsburg", "Highland West"],
    "London": ["Downtown", "Old East Village", "Hamilton Road", "Argyle", "East London", "North London", "West London", "Byron", "Oakridge", "Masonville", "Pond Mills"],
    "Halifax": ["Halifax Peninsula", "Dartmouth", "Bedford", "Sackville", "Spryfield", "Clayton Park", "Fairview", "Cole Harbour", "Eastern Passage", "Downtown Halifax", "North End"],
    "Victoria": ["Downtown", "Fairfield", "James Bay", "Fernwood", "Oaklands", "Jubilee", "Hillside-Quadra", "Burnside", "Victoria West", "Rockland"],
    "Windsor": ["Downtown", "Walkerville", "Ford City", "Riverside", "East Windsor", "South Windsor", "West Windsor", "Sandwich", "Forest Glade", "Devonshire"],
    "Oshawa": ["North Oshawa", "Central Oshawa", "Eastdale", "Donevan", "Vanier", "Lakeview", "Taunton", "Kedron"],
    "Saskatoon": ["Central Business District", "Nutana", "Riversdale", "City Park", "Caswell Hill", "Lawson Heights", "North Industrial", "Stonebridge", "Evergreen", "University Heights"],
    "St. Catharines": ["Downtown", "Port Dalhousie", "Merritton", "Glenridge", "Grantham", "Western Hill", "North End"],
    "Regina": ["Cathedral", "Downtown", "Douglas Park", "Lakeview", "North Central", "Normanview", "Rosemont", "South Albert", "Whitmore Park", "Harbour Landing", "Eastview"],
    "St. John's": ["Downtown", "Waterford Valley", "Churchill Park", "Georgestown", "Rabbittown", "Shea Heights", "Kilbride", "Goulds", "Kenmount Terrace"],
    "Barrie": ["Downtown", "Allandale", "Letitia Heights", "Sunnidale", "Holly", "Painswick", "Ardagh Bluffs", "Bayview", "Eastview"],
    "Kelowna": ["Downtown", "Glenmore", "Rutland", "Dilworth", "Mission", "Lower Mission", "Upper Mission", "Black Mountain", "North Glenmore", "South Pandosy"],
    "Abbotsford": ["Central Abbotsford", "Historic Downtown", "Clearbrook", "Sumas Prairie", "Matsqui Prairie", "Clayburn", "Huntingdon", "West Abbotsford"],
    "Kingston": ["Downtown", "Williamsville", "Portsmouth", "Rideau Heights", "Calvin Park", "Cataraqui North", "Cataraqui River East", "Sunnyside", "Collins Bay"],
    "Greater Sudbury": ["Sudbury", "Azilda", "Chelmsford", "Copper Cliff", "Coniston", "Dowling", "Garson", "Hanmer", "Lively", "Capreol", "Valley East", "Wahnapitae"],
    "Sherbrooke": ["Brompton", "Fleurimont", "Jacques-Cartier", "Lennoxville", "Mont-Bellevue", "Rock Forest", "Saint-Élie", "Deauville"],
    "Guelph": ["Downtown", "Exhibition Park", "Two Rivers", "St. Patrick's Ward", "Old University", "Onward Willow", "West Willow Village", "Kortright Hills", "Pineridge", "Clairfields"],
    "Trois-Rivières": ["Cap-de-la-Madeleine", "Sainte-Marthe-du-Cap", "Trois-Rivières-Ouest", "Trois-Rivières Centre", "Pointe-du-Lac"],
    "Moncton": ["Downtown Moncton", "Dieppe", "Riverview", "Sunny Brae", "Humphrey", "Lewisville", "Mountain Road", "North End"],
    "Brantford": ["Downtown", "Eagle Place", "Echo Place", "West Brant", "North Ward", "Holmedale", "Greenbrier"],
    "Thunder Bay": ["Current River", "McKellar Park", "Northwood", "Westfort", "Intercity", "Vickers Park", "Red River", "Neebing", "Fort William", "Port Arthur"]
  },
  "Central African Republic": {
    "Bangui": ["1st Arrondissement", "2nd Arrondissement", "3rd Arrondissement", "4th Arrondissement", "5th Arrondissement", "6th Arrondissement", "7th Arrondissement", "8th Arrondissement"],
    "Bimbo": ["Bimbo I", "Bimbo II", "Bimbo III", "Bimbo IV", "Bimbo V"],
    "Berbérati": ["Berbérati Centre", "Quartier Poto-Poto", "Quartier Ngombé", "Gare Routière"],
    "Carnot": ["Carnot Centre", "Quartier Mambéré", "Zone Minière", "Quartier Commercial"],
    "Bambari": ["Bambari Centre", "Quartier Ouaka", "Bornou", "Saint-Joseph"],
    "Bouar": ["Bouar Centre", "Camp Leclerc", "Quartier Haoussa", "Yadé"],
    "Bria": ["Bria Centre", "Quartier Kotto", "Bornou", "Plaine"],
    "Bossangoa": ["Bossangoa Centre", "Ouham", "Mission Catholique", "Gare"],
    "Kaga-Bandoro": ["Kaga-Bandoro Centre", "Nana-Gribizi", "Commercial", "Mission"],
    "Sibut": ["Sibut Centre", "Kémo", "Quartier Administratif", "Gare"],
    "Bozoum": ["Bozoum Centre", "Ouham-Pendé", "Mission", "Marché"],
    "Mbaïki": ["Mbaïki Centre", "Lobaye", "Quartier Forestier", "Bouchia"],
    "Nola": ["Nola Centre", "Sangha", "Boulbessoum", "Port"],
    "Damara": ["Damara Centre", "Ombella-M'Poko", "Gare", "Marché"],
    "Batangafo": ["Batangafo Centre", "Ouham", "Kabo Road", "Bouca Road"],
    "Mobaye": ["Mobaye Centre", "Basse-Kotto", "Oubangui Riverfront", "Mission"],
    "Bangassou": ["Bangassou Centre", "Mbomou", "Tokoyo", "Maliko"],
    "Rafai": ["Rafai Centre", "Chinko", "Mbomou", "Mission"],
    "Obo": ["Obo Centre", "Haut-Mbomou", "Airstrip Area", "Marché"],
    "Zemio": ["Zemio Centre", "Mbomou", "Airstrip", "Mission"],
    "Yaloké": ["Yaloké Centre", "Ombella-M'Poko", "Zone Minière", "Marché"],
    "Paoua": ["Paoua Centre", "Ouham-Pendé", "Bah-Bessar", "Marché"],
    "Bouca": ["Bouca Centre", "Ouham", "Mission", "Marché"],
    "Boda": ["Boda Centre", "Lobaye", "Zone Diamant", "Marché"],
    "Gambo": ["Gambo Centre", "Mbomou", "Mission", "Marché"],
    "Alindao": ["Alindao Centre", "Basse-Kotto", "Mission", "Marché"],
    "Kouango": ["Kouango Centre", "Ouaka", "Oubangui Riverfront", "Marché"],
    "Grimari": ["Grimari Centre", "Ouaka", "Bambari Road", "Marché"],
    "Ippy": ["Ippy Centre", "Ouaka", "Bria Road", "Marché"],
    "Dekoa": ["Dékoa Centre", "Kémo", "Batangafo Road", "Marché"]
  },
  "Chad": {
    "N'Djamena": ["1st Arrondissement", "2nd Arrondissement", "3rd Arrondissement", "4th Arrondissement", "5th Arrondissement", "6th Arrondissement", "7th Arrondissement", "8th Arrondissement", "9th Arrondissement", "10th Arrondissement"],
    "Moundou": ["Doyon", "Kamdé", "Dombe", "Baguirmi", "Quartiers Centraux", "Gueldjem"],
    "Sarh": ["Kassaï", "Kokaga", "Balimba", "Goz Amer", "Quartiers Centraux", "Maïngara"],
    "Abéché": ["Wara", "Chokoyan", "Am-Salay", "Hay-Salam", "Quartiers Centraux", "Goz Amir"],
    "Kélo": ["Kélo Centre", "Quartier Nord", "Quartier Sud", "Quartier Est", "Quartier Ouest"],
    "Am Timan": ["Am Timan Centre", "Quartier Nord", "Quartier Sud", "Quartier Est", "Marché"],
    "Mongo": ["Mongo Centre", "Quartier Nord", "Quartier Sud", "Quartier Est", "Guéra"],
    "Doba": ["Doba Centre", "Zone Pétrolière", "Quartier Nord", "Quartier Sud", "Péni"],
    "Pala": ["Pala Centre", "Quartier Nord", "Quartier Sud", "Quartier Est", "Mayo-Dallah"],
    "Ati": ["Ati Centre", "Batha", "Quartier Nord", "Quartier Sud", "Marché"],
    "Faya-Largeau": ["Faya Centre", "Faya Nord", "Faya Sud", "Palmeraie", "Aéroport"],
    "Bongor": ["Bongor Centre", "Mayo-Kebbi", "Quartier Nord", "Quartier Sud", "Quartier Est"],
    "Abeche": ["Wara", "Chokoyan", "Am-Salay", "Hay-Salam", "Quartiers Périphériques"],
    "Fada": ["Fada Centre", "Ennedi", "Quartier Nord", "Quartier Sud", "Gorges"],
    "Massaguet": ["Massaguet Centre", "Hadjer-Lamis", "Quartier Nord", "Gare Routière"],
    "Bol": ["Bol Centre", "Lac Tchad", "Quartier Nord", "Quartier Sud", "Port Lacustre"],
    "Mao": ["Mao Centre", "Kanem", "Quartier Nord", "Quartier Sud", "Marché"],
    "Moussoro": ["Moussoro Centre", "Bahr el Gazel", "Quartier Nord", "Quartier Sud"],
    "Biltine": ["Biltine Centre", "Wadi Fira", "Quartier Nord", "Quartier Sud"],
    "Faya": ["Faya Centre", "Borkou", "Faya Nord", "Faya Sud", "Palmeraie"],
    "Fianga": ["Fianga Centre", "Mayo-Kebbi Est", "Lac Fianga", "Marché"],
    "Laï": ["Laï Centre", "Tandjilé", "Quartier Nord", "Quartier Sud", "Logone Riverfront"],
    "Léré": ["Léré Centre", "Lac Léré", "Quartier Nord", "Frontière Cameroun"],
    "Massenya": ["Massenya Centre", "Chari-Baguirmi", "Palais du Sultan", "Marché"],
    "Oum Hadjer": ["Oum Hadjer Centre", "Batha", "Batha Riverfront", "Marché"],
    "Goz Beïda": ["Goz Beïda Centre", "Sila", "Quartier Nord", "Quartier Sud"],
    "Amdjarass": ["Amdjarass Centre", "Ennedi Est", "Aéroport Amdjarass", "Hôtel Toumaï Area"]
  },
  "Chile": {
    "Santiago": ["Santiago Centro", "Providencia", "Las Condes", "Ñuñoa", "La Reina", "Macul", "San Miguel", "Estación Central", "Maipú", "La Florida", "Puente Alto", "Vitacura", "Lo Barnechea", "Recoleta", "Bellavista"],
    "Puente Alto": ["Puente Alto Centro", "Bajos de Mena", "Las Vizcachas", "Casas Viejas", "Gabriela"],
    "Antofagasta": ["Centro", "Norte", "Centro Alto", "Bonilla", "La Chimba", "Coviefi", "Playa Blanca"],
    "Viña del Mar": ["Plan de Viña", "Miraflores", "Recreo", "Chorrillos", "Forestal", "Gómez Carreño", "Reñaca", "Concón"],
    "Valparaíso": ["El Almendral", "Playa Ancha", "Cerro Alegre", "Cerro Concepción", "Cerro Barón", "Placilla", "Curauma"],
    "Talcahuano": ["Centro", "Hualpén", "Las Salinas", "Medio Camino", "Brisas del Sol", "Sector Industrial"],
    "San Bernardo": ["Centro", "Nos", "Lo Herrera", "Maipo", "Chena", "Villa Chena"],
    "Temuco": ["Centro", "Pueblo Nuevo", "Amanecer", "Pedro de Valdivia", "Santa Rosa", "Labranza"],
    "Iquique": ["Centro", "Cavancha", "Playa Brava", "El Morro", "Alto Hospicio", "La Tirana sector"],
    "Concepción": ["Centro", "Barrio Norte", "Lorenzo Arenas", "Pedro de Valdivia", "Nonguén", "Collao", "San Pedro de la Paz"],
    "Rancagua": ["Centro", "Manzanal", "Machalí sector", "Baquedano", "Lourdes", "La Granja"],
    "La Serena": ["Centro", "La Pampa", "El Milagro", "Las Compañías", "San Joaquín", "Avenida del Mar"],
    "Puerto Montt": ["Centro", "Alerce", "Mirasol", "Valle Volcanes", "Pelluco", "Chamiza", "Angelmó"],
    "Coquimbo": ["Centro", "Guayacán", "El Llano", "Sindempart", "Tierras Blancas", "Parte Alta", "La Herradura"],
    "Osorno": ["Centro", "Rahue", "Ovejería", "Francke", "Pilauco", "Las Quemas"],
    "Valdivia": ["Centro", "Las Ánimas", "Collico", "Isla Teja", "Niebla", "Guacamayo"],
    "Arica": ["Centro", "Chinchorro", "Azapa", "Cerro La Cruz", "El Morro", "Playa Chinchorro"],
    "Talca": ["Centro", "Oriente", "Norte", "Sur", "Las Américas", "San Miguel"],
    "Chillán": ["Centro", "Oriente", "Poniente", "Ultraestación", "Vicente Pérez Rosales", "Parque Lantaño"],
    "Calama": ["Centro", "Topáter", "Kamac Mayu", "Villa Ayquina", "Puerto Seco"],
    "Copiapó": ["Centro", "Paipote", "El Palomar", "Rosario", "Borgoño", "Tierra Viva"],
    "Quilpué": ["Centro", "El Belloto", "Marga Marga", "Valencia", "Pompeya", "Los Pinos"],
    "Curicó": ["Centro", "Rauquén", "Zapallar", "Sarmiento", "Los Niches", "Santa Fe"],
    "Los Ángeles": ["Centro", "Paillihue", "Villa Todos Los Santos", "Santiago Bueras", "El Peral"],
    "Villa Alemana": ["Centro", "Peñablanca", "Troncos Viejos", "Huanhualí", "Las Américas"],
    "Coronel": ["Centro", "Lagunillas", "Camilo Olavarría", "Yobilo", "Schwager", "Parque Industrial"],
    "Punta Arenas": ["Centro", "Barrio Prat", "Río de los Ciervos", "Barranco Amarillo", "Playa Norte", "Leñadura"],
    "Melipilla": ["Centro", "Chocalán", "Pomaire", "Culiprán", "Codigua"],
    "San Antonio": ["Centro", "Barrancas", "Llolleo", "San Juan", "Cuncumén"],
    "Linares": ["Centro", "Nuevo Amanecer", "Estación", "Vara Gruesa", "Palmilla"]
  },
  "China": {
    "Shanghai": ["Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou", "Yangpu", "Minhang", "Baoshan", "Jiading", "Pudong New Area", "Jinshan", "Songjiang", "Qingpu", "Fengxian", "Chongming"],
    "Beijing": ["Dongcheng", "Xicheng", "Chaoyang", "Haidian", "Fengtai", "Shijingshan", "Mentougou", "Fangshan", "Tongzhou", "Shunyi", "Changping", "Daxing", "Huairou", "Pinggu", "Miyun", "Yanqing"],
    "Chongqing": ["Yuzhong", "Dadukou", "Jiangbei", "Shapingba", "Jiulongpo", "Nan'an", "Beibei", "Yubei", "Banan", "Qianjiang", "Wanzhou", "Fuling", "Changshou", "Jiangjin", "Hechuan", "Yongchuan", "Nanchuan", "Qijiang", "Dazu"],
    "Guangzhou": ["Yuexiu", "Liwan", "Haizhu", "Tianhe", "Baiyun", "Huangpu", "Huadu", "Panyu", "Nansha", "Conghua", "Zengcheng"],
    "Shenzhen": ["Futian", "Luohu", "Nanshan", "Yantian", "Bao'an", "Longgang", "Longhua", "Pingshan", "Guangming", "Dapeng"],
    "Tianjin": ["Heping", "Hedong", "Hexi", "Nankai", "Hebei", "Hongqiao", "Dongli", "Xiqing", "Jinnan", "Beichen", "Wuqing", "Baodi", "Binhai New Area", "Ninghe", "Jinghai", "Jizhou"],
    "Chengdu": ["Jinjiang", "Qingyang", "Jinniu", "Wuhou", "Chenghua", "Longquanyi", "Qingbaijiang", "Xindu", "Wenjiang", "Shuangliu", "Pidu", "Xinjin"],
    "Nanjing": ["Xuanwu", "Qinhuai", "Jianye", "Gulou", "Pukou", "Qixia", "Yuhuatai", "Jiangning", "Luhe", "Lishui", "Gaochun"],
    "Wuhan": ["Jiang'an", "Jianghan", "Qiaokou", "Hanyang", "Wuchang", "Qingshan", "Hongshan", "Dongxihu", "Hannan", "Caidian", "Jiangxia", "Huangpi", "Xinzhou"],
    "Xi'an": ["Xincheng", "Beilin", "Lianhu", "Baqiao", "Weiyang", "Yanta", "Yanliang", "Lintong", "Chang'an", "Gaoxin"],
    "Hangzhou": ["Shangcheng", "Gongshu", "Xihu", "Binjiang", "Xiaoshan", "Yuhang", "Linping", "Qiantang", "Fuyang", "Lin'an", "Tonglu"],
    "Dongguan": ["Dongcheng", "Nancheng", "Wanjiang", "Guancheng", "Chang'an", "Humen", "Houjie", "Dalang", "Dalingshan", "Liaobu", "Shijie", "Shilong"],
    "Foshan": ["Chancheng", "Nanhai", "Shunde", "Sanshui", "Gaoming"],
    "Shenyang": ["Heping", "Shenhe", "Dadong", "Huanggu", "Tiexi", "Hunnan", "Yuhong", "Shenbeixin", "Sujiatun", "Liaozhong"],
    "Qingdao": ["Shinan", "Shibei", "Huangdao", "Laoshan", "Licang", "Chengyang", "Jimo", "Jiaozhou", "Pingdu", "Laixi"],
    "Jinan": ["Lixia", "Shizhong", "Huaiyin", "Tianqiao", "Licheng", "Changqing", "Zhangqiu", "Jiyang", "Laiwu", "Gangcheng"],
    "Changsha": ["Furong", "Tianxin", "Yuelu", "Kaifu", "Yuhua", "Wangcheng", "Changsha County"],
    "Harbin": ["Daoli", "Nangang", "Daowai", "Xiangfang", "Pingfang", "Songbei", "Hulan", "Acheng", "Shuangcheng"],
    "Zhengzhou": ["Zhongyuan", "Erqi", "Guancheng", "Jinshui", "Huiji", "Shangjie", "Zhongmu", "Gongyi", "Xingyang", "Xinmi"],
    "Kunming": ["Wuhua", "Panlong", "Guandu", "Xishan", "Dongchuan", "Chenggong", "Jinning", "Anning", "Fumin", "Yiliang"],
    "Dalian": ["Zhongshan", "Xigang", "Shahekou", "Ganjingzi", "Lüshunkou", "Jinzhou", "Pulandian", "Wafangdian", "Zhuanghe"],
    "Xiamen": ["Siming", "Huli", "Haicang", "Jimei", "Tong'an", "Xiang'an"],
    "Hefei": ["Yaohai", "Luyang", "Shushan", "Baohe", "Feidong", "Feixi", "Changfeng", "Lujiang"],
    "Ningbo": ["Haishu", "Jiangbei", "Zhenhai", "Beilun", "Yinzhou", "Fenghua", "Xiangshan", "Ninghai", "Cixi", "Yuyao"],
    "Fuzhou": ["Gulou", "Taijiang", "Cangshan", "Mawei", "Jin'an", "Changle", "Minhou", "Lianjiang", "Luoyuan", "Minqing", "Yongtai"],
    "Nanchang": ["Donghu", "Xihu", "Qingyunpu", "Wanli", "Qingshanhu", "Honggutan", "Xinjian", "Anyi", "Jinxian"],
    "Changchun": ["Nanguan", "Kuancheng", "Chaoyang", "Erdao", "Lvyuan", "Shuangyang", "Jiutai", "Nong'an", "Yushu", "Dehui"],
    "Shijiazhuang": ["Chang'an", "Qiaoxi", "Xinhua", "Yuhua", "Gaocheng", "Luancheng", "Luquan", "Zhengding", "Jingxing", "Xinle"],
    "Taiyuan": ["Xiaodian", "Yingze", "Xinghualing", "Jiancaoping", "Wanbolin", "Jinyuan", "Qingxu", "Yangqu", "Loufan"],
    "Ürümqi": ["Tianshan", "Saybag", "Xinshi", "Shuimogou", "Toutunhe", "Midong", "Dabancheng", "Ürümqi County"]
  },
  "Djibouti": {
    "Djibouti City": ["Plateau", "Boulaos", "Ambouli", "Balbala", "PK12", "PK20", "Balbala 04", "Balbala 05", "Arhiba", "Stade", "Hablayeh", "Doraleh"],
    "Ali Sabieh": ["Ali Sabieh Centre", "Holl-Holl", "Goubetto", "Doudoubalale", "Assamo"],
    "Tadjoura": ["Tadjoura Centre", "Randa", "Dorra", "Adaylou", "Bankoualé", "Day", "Assal"],
    "Obock": ["Obock Centre", "Khor Angar", "Mabla", "Ras Doumeira", "Alaili Dadda"],
    "Dikhil": ["Dikhil Centre", "Yoboki", "As Eyla", "Galafi", "Mouloud"],
    "Arta": ["Arta Centre", "Wea", "Damerjog", "Karta", "Goubetto"],
    "Holhol": ["Holhol Centre", "Ali Adde", "Doudoubalale", "Surrounding Localities"],
    "Dorra": ["Dorra Centre", "Balho", "Assal", "Surrounding Settlements"],
    "Yoboki": ["Yoboki Centre", "Dikhil-side settlements", "Galafi Area"],
    "Randa": ["Randa Centre", "Day", "Bankoualé", "Surrounding Settlements"],
    "As Eyla": ["As Eyla Centre", "Mouloud", "Hanlé", "Surrounding Settlements"],
    "Balho": ["Balho Centre", "Dorra-side settlements", "Border Localities"],
    "Goubetto": ["Goubetto Centre", "Ali Sabieh-side settlements"],
    "Ali Adde": ["Ali Adde Centre", "Holhol Area", "Surrounding Settlements"],
    "Galafi": ["Galafi Centre", "Yoboki-side settlements", "Border Area"],
    "Loyada": ["Loyada Centre", "Coastal Border Area", "Surrounding Settlements"],
    "Khor Angar": ["Khor Angar Centre", "Obock Coastal Settlements"],
    "Mouloud": ["Mouloud Centre", "Dikhil-side settlements"],
    "PK 20": ["PK 20", "Balbala", "Surrounding Settlements"],
    "Dorra District": ["Dorra", "Surrounding Rural Settlements"],
    "Ras Dika": ["Ras-Dika", "Plateau", "Boulaos Area"],
    "Mabla": ["Mabla", "Khor Angar Area"],
    "Bouljourta": ["Bouljourta", "Surrounding Rural Settlements"],
    "Daasbiyo": ["Daasbiyo", "Ali Sabieh Area"],
    "Wea": ["Wea", "Arta Area"],
    "Day": ["Day", "Randa Area"],
    "Karta": ["Karta", "Arta Area"],
    "Gagade": ["Gagade", "Obock Area"],
    "Andoli": ["Andoli", "Tadjoura Area"],
    "Holl-Holl": ["Holl-Holl Centre", "Ali Sabieh Area"]
  },
  "Dominica": {
    "Roseau": ["Goodwill", "Fond Cole", "Pottersville", "Newtown", "Bath Estate", "Castle Comfort", "Canefield", "Stock Farm", "Canefield Industrial Estate"],
    "Portsmouth": ["Picard", "Glanvillia", "Lagoon", "Portsmouth Centre", "Chance", "Picard Estate"],
    "Marigot": ["Marigot Centre", "Wesley", "Woodford Hill", "Londonderry", "Atkinson"],
    "Mahaut": ["Mahaut Centre", "Massacre", "Canefield", "Warner", "Tarreau"],
    "Berekua": ["Berekua Centre", "Grand Bay", "Bellevue", "Pichelin", "Montine"],
    "Wesley": ["Wesley Centre", "Woodford Hill", "Marigot", "Anse du Mai"],
    "La Plaine": ["La Plaine Centre", "Rosalie", "Morne Jaune", "Grand Fond"],
    "Soufrière": ["Soufrière Centre", "Scotts Head", "Gallion", "Pointe Michel"],
    "Castle Bruce": ["Castle Bruce Centre", "Petite Soufrière", "Good Hope", "Salybia"],
    "Salisbury": ["Salisbury Centre", "Coulibistrie", "Macoucherie", "Layou"],
    "Massacre": ["Massacre Centre", "Canefield", "Mahaut-side communities"],
    "Canefield": ["Canefield", "Canefield Estate", "Warner", "Mahaut"],
    "Pont Cassé": ["Pont Cassé", "Laudat", "Wotten Waven", "Trafalgar"],
    "Colihaut": ["Colihaut", "Dublanc", "Bioche", "Coulibistrie"],
    "Vieille Case": ["Vieille Case", "Paix Bouche", "Thibaud", "Anse du Mai"],
    "Grand Bay": ["Grand Bay", "Berekua", "Pichelin", "Bellevue"],
    "Coulibistrie": ["Coulibistrie", "Dublanc", "Bioche"],
    "Goodwill": ["Goodwill", "Pottersville", "Roseau North"],
    "Loubiere": ["Loubiere", "Fond Cani", "Castle Comfort"],
    "Fond Cani": ["Fond Cani", "Loubiere", "Bath Estate"],
    "Trafalgar": ["Trafalgar", "Laudat", "Wotten Waven"],
    "Laudat": ["Laudat", "Trafalgar", "Morne Anglais"],
    "Picard": ["Picard", "Portsmouth", "Cabrits"],
    "Woodford Hill": ["Woodford Hill", "Wesley", "Marigot"],
    "Calibishie": ["Calibishie", "Anse du Mai", "Woodford Hill"],
    "Paix Bouche": ["Paix Bouche", "Vieille Case", "Thibaud"],
    "Thibaud": ["Thibaud", "Paix Bouche", "Vieille Case"],
    "Dublanc": ["Dublanc", "Coulibistrie", "Bioche"],
    "Morne Jaune": ["Morne Jaune", "La Plaine", "Rosalie"],
    "Rosalie": ["Rosalie", "La Plaine", "Morne Jaune"]
  },
  "Dominican Republic": {
    "Santo Domingo": ["Zona Colonial", "Ciudad Nueva", "Gazcue", "San Carlos", "Villa Francisca", "Villa Consuelo", "Ensanche Luperón", "Cristo Rey", "Villas Agrícolas", "Ensanche Kennedy", "Piantini", "Naco", "Bella Vista", "Mirador Sur", "Los Prados"],
    "Santiago de los Caballeros": ["Centro Histórico", "Los Jardines", "Villa Olga", "La Otra Banda", "Bella Vista", "Cienfuegos", "Gurabito", "Pekín", "Hato Mayor", "Ensanche Libertad", "Baracoa"],
    "Santo Domingo Este": ["Los Mina", "Alma Rosa", "Ensanche Ozama", "Los Mameyes", "Villa Duarte", "Isabelita", "Los Tres Ojos", "Invivienda", "Cancino", "San Isidro", "Hainamosa"],
    "Santo Domingo Norte": ["Villa Mella", "Sabana Perdida", "Guaricano", "Los Guaricanos", "El Higüero", "La Victoria", "Sierra Prieta"],
    "Santo Domingo Oeste": ["Herrera", "Las Caobas", "Manoguayabo", "Bayona", "Hato Nuevo", "Buenos Aires", "Engombe", "Alameda"],
    "San Pedro de Macorís": ["Centro", "Miramar", "Barrio México", "Placer Bonito", "Restauración", "Villa Providencia", "Punta Pescadora", "Santa Fe"],
    "La Romana": ["Centro", "Villa Verde", "Savica", "Chicago", "Villa Hermosa", "Piedra Linda", "Caleta", "Buena Vista Norte"],
    "San Cristóbal": ["Centro", "Madre Vieja", "Lava Pies", "Jeringa", "Pueblo Nuevo", "Hatillo", "Haina", "Nigua"],
    "Puerto Plata": ["Centro Histórico", "Padre Las Casas", "Ensanche Dubeau", "Gregorio Luperón", "Playa Oeste", "Barrio Haití", "San Marcos", "Cofresí"],
    "La Vega": ["Centro", "Villa Lora", "Villa Rosa", "El Campito", "Villa Francisca", "Palmarito", "Río Verde", "Bayacanes"],
    "San Francisco de Macorís": ["Centro", "Pueblo Nuevo", "Hermanas Mirabal", "San Martín", "Santa Ana", "Vista al Valle", "Espínola"],
    "Higüey": ["Centro", "La Basílica", "San Francisco", "Savica", "Nazaret", "Villa Cerro", "Cambelén", "La Otra Banda"],
    "Moca": ["Centro", "Juan Lopito", "Guauci", "Villa Bartola", "Las Flores", "El Caimito", "San Víctor"],
    "Bonao": ["Centro", "Las Mercedes", "Los Transformadores", "Prosperidad", "Brisas del Yuna", "Juma", "Jayaco"],
    "Baní": ["Centro", "Santa Rosa", "Villa Majega", "El Fundo", "Pueblo Nuevo", "Los Cajuilitos", "Villa Sombrero"],
    "Barahona": ["Centro", "Pueblo Nuevo", "Savica", "Palmarito", "Villa Estela", "La Playa", "Baitoíta", "El Cacique"],
    "Azua": ["Centro", "Pueblo Abajo", "Pueblo Arriba", "La Bombita", "Villa Esperanza", "Los Cartones", "Los Mangos"],
    "Bávaro": ["Bávaro", "El Cortecito", "Los Corales", "Cabeza de Toro", "Friusa", "Verón", "Arena Gorda"],
    "Punta Cana": ["Downtown Punta Cana", "Bávaro", "Cap Cana", "Verón", "Cabeza de Toro", "Macao", "Uvero Alto"],
    "Hato Mayor del Rey": ["Centro", "Las Malvinas", "Villa Canto", "Ondina", "Punta de Garza", "Gualey"],
    "Nagua": ["Centro", "Pueblo Nuevo", "San José de Villa", "Río Mar", "Nueva Nagua", "Matancitas"],
    "Mao": ["Centro", "Hatico", "Sibila", "Las 40", "Motocross", "Los Cajuiles", "Pueblo Nuevo"],
    "Cotuí": ["Centro", "Pueblo Nuevo", "Libertad", "Esperanza", "La Altagracia", "La Estancia"],
    "Bajos de Haina": ["Haina Centro", "Quita Sueño", "El Carril", "Gringo", "Piedra Blanca", "Itabo"],
    "Monte Cristi": ["Centro", "Las Flores", "San Fernando", "Cristo Rey", "El Rincón"],
    "Dajabón": ["Centro", "La Bomba", "Barrio Norte", "Benito Monción", "La Fe", "La Mara"],
    "Samaná": ["Centro", "Pueblo Arriba", "Pueblo Abajo", "La Cruz", "Villa Salma", "Los Cacaos"],
    "Las Terrenas": ["Pueblo", "El Portillo", "Cosón", "Bonita Beach", "Abra Grande", "La Granja"],
    "Jarabacoa": ["Centro", "Pueblo Nuevo", "La Colonia", "Pinar Quemado", "Buena Vista", "Hato Viejo", "Manabao"],
    "Constanza": ["Centro", "El Cercado", "Arroyo Arriba", "Tireo", "La Culata", "Valle Nuevo"]
  },
  "Ecuador": {
    "Guayaquil": ["Ayacucho", "Bolívar", "Carbo", "Febres Cordero", "García Moreno", "Letamendi", "Nueve de Octubre", "Olmedo", "Roca", "Rocafuerte", "Sucre", "Tarqui", "Urdaneta", "Ximena", "Pascuales", "Chongón", "Posorja", "Samborondón Area", "Puerto Santa Ana", "Urdesa"],
    "Quito": ["Centro Histórico", "Belisario Quevedo", "Chilibulo", "Chillogallo", "Chimbacalle", "Cochabamba", "Concepción", "Cotocollao", "El Condado", "Guamaní", "Iñaquito", "Itchimbía", "Jipijapa", "Kennedy", "La Argelia", "La Ecuatoriana", "La Mariscal", "Mariscal Sucre", "Ponceano", "Quitumbe", "Cumbayá", "Tumbaco"],
    "Cuenca": ["El Vecino", "Gil Ramírez Dávalos", "Huayna Cápac", "Machángara", "Monay", "San Blas", "San Sebastián", "Sucre", "Totoracocha", "Yanuncay", "Hermano Miguel", "Bellavista", "Cañaribamba", "El Batán", "San Joaquín", "Baños"],
    "Santo Domingo": ["Santo Domingo", "Chigüilpe", "Río Verde", "Abraham Calazacón", "Bombolí", "Zaracay", "Alluriquín", "Luz de América", "Puerto Limón", "Valle Hermoso"],
    "Machala": ["Machala", "Puerto Bolívar", "La Providencia", "9 de Mayo", "Jubones", "Jambelí", "El Cambio", "El Retiro"],
    "Durán": ["Eloy Alfaro", "El Recreo", "Divino Niño", "Primavera", "Panorama", "Abel Gilbert", "El Arbolito"],
    "Manta": ["Manta", "Tarqui", "Los Esteros", "Eloy Alfaro", "San Mateo", "Santa Marianita", "San Lorenzo", "Barbasquillo"],
    "Portoviejo": ["12 de Marzo", "Andrés de Vera", "Colón", "Picoazá", "San Pablo", "Simón Bolívar", "Francisco Pacheco", "Crucita"],
    "Loja": ["El Sagrario", "Sucre", "El Valle", "San Sebastián", "Punzara", "Carigán", "Malacatos", "Vilcabamba"],
    "Ambato": ["Atocha-Ficoa", "Celiano Monge", "Huachi Chico", "Huachi Loreto", "La Matriz", "La Península", "Pishilata", "San Francisco", "Izamba", "Pinllo"],
    "Riobamba": ["Lizarzaburu", "Maldonado", "Velasco", "Veloz", "Yaruquíes", "Calpi", "Cubijíes", "San Juan", "San Luis"],
    "Quevedo": ["Quevedo", "San Camilo", "San Cristóbal", "Venus del Río Quevedo", "Nicolás Infante Díaz", "Guayacán", "Viva Alfaro", "7 de Octubre"],
    "Milagro": ["Milagro", "Chobo", "Mariscal Sucre", "Roberto Astudillo", "5 de Junio", "Los Chirijos", "Ernesto Seminario"],
    "Ibarra": ["San Francisco", "El Sagrario", "Caranqui", "Alpachaca", "Priorato", "Ambuquí", "San Antonio"],
    "Esmeraldas": ["Esmeraldas", "Bartolomé Ruiz", "5 de Agosto", "Simón Plata Torres", "Tachina", "Vuelta Larga", "Las Palmas"],
    "Babahoyo": ["Camilo Ponce", "Clemente Baquerizo", "El Salto", "Barreiro", "Febres Cordero", "Caracol", "La Unión"],
    "Tulcán": ["Tulcán", "González Suárez", "Julio Andrade", "El Carmelo", "Maldonado", "Pioter", "Tufiño"],
    "La Libertad": ["La Libertad", "Barrio 28 de Mayo", "Abdón Calderón", "Kennedy", "Puerto Nuevo", "San Francisco", "Rocafuerte"],
    "Santa Elena": ["Santa Elena", "Ballenita", "Atahualpa", "Colonche", "Manglaralto", "Montañita", "Salinas Area"],
    "Huaquillas": ["Huaquillas", "Milton Reyes", "Unión Lojana", "El Paraíso", "Ecuador", "9 de Octubre", "Puerto Hualtaco"],
    "Nueva Loja": ["Nueva Loja", "Tarapoa", "Dureno", "El Eno", "General Farfán", "Pacayacu", "Jambelí"],
    "El Carmen": ["El Carmen", "Wilfrido Loor Moreira", "San Pedro de Suma", "Santa María", "4 de Diciembre"],
    "Pasaje": ["Pasaje", "Loma de Franco", "Tres Cerritos", "Buenavista", "Caña Quemada", "Casacay", "El Progreso"],
    "Chone": ["Chone", "Santa Rita", "Ricaurte", "Eloy Alfaro", "Boyacá", "Canuto", "Convento"],
    "Otavalo": ["El Jordán", "San Luis", "González Suárez", "Eugenio Espejo", "San José de Quichinche", "San Pablo", "Peguche"],
    "Cayambe": ["Cayambe", "Ayora", "Juan Montalvo", "Ascázubi", "Cangahua", "Olmedo"],
    "Salinas": ["Carlos Espinoza Larrea", "Alberto Spencer", "Santa Rosa", "José Luis Tamayo", "Anconcito", "Chipipe", "San Lorenzo"],
    "Playas": ["General Villamil", "Engabao", "Posorja-area", "Playa Rosada", "Data de Villamil"],
    "Latacunga": ["Eloy Alfaro", "Ignacio Flores", "Juan Montalvo", "La Matriz", "San Buenaventura", "Aláquez", "Mulaló"],
    "Azogues": ["Azogues", "Bayas", "Borrero", "Cojitambo", "Guapán", "Javier Loyola", "Luis Cordero"]
  },
  "Egypt": {
    "Cairo": ["Zamalek", "Downtown Tahrir", "Garden City", "Heliopolis", "Nasr City East", "Nasr City West", "Maadi", "New Cairo / 5th Settlement", "Shubra", "Dokki", "Mohandessin", "El Nozha", "Ain Shams", "El Mokattam", "Sayeda Zeinab", "Katameya"],
    "Alexandria": ["Montazah 1", "Montazah 2", "Eastern District", "Central District", "Western District", "Gomrok", "Amreya", "Agamy", "Borg El Arab", "Stanley", "Gleem", "Smouha", "Sidi Gaber", "Roushdy"],
    "Giza": ["North Giza", "South Giza", "Agouza", "Omraniya", "Haram", "Boulak El Dakrour", "Warraq", "Dokki", "Talbiya", "Imbaba", "Sheikh Zayed City", "6th of October City"],
    "Shubra El Kheima": ["East Shubra El Kheima", "West Shubra El Kheima", "Bahteem", "Ezbet El Nagar", "El Omrania", "El Shorafa", "El Barad"],
    "Port Said": ["Al Sharq", "Al Arab", "Al Manakh", "Al Dawahy", "Al Zohour", "Al Ganoub", "Port Fouad"],
    "Suez": ["Arbaeen", "Suez", "Ataqa", "Faisal", "Ganayen"],
    "Luxor": ["East Luxor", "West Luxor", "Karnak", "Awameya", "Al Bayadiya", "Al Manshiya", "Al Qurna", "Al Tod"],
    "Mansoura": ["Mansoura East", "Mansoura West", "El Gamaa", "Toriel", "El Mashaya", "Sandoub", "Mit Khamis"],
    "Tanta": ["First Tanta", "Second Tanta", "El Bahr", "El Qantara", "El Galaa", "El Siga", "El Istad"],
    "Asyut": ["East Assiut", "West Assiut", "Al Walidiya", "Al Hamraa", "Al Arbaeen", "Al Azhar", "Al Wadi Al Gadid"],
    "Ismailia": ["First District", "Second District", "Third District", "Sheikh Zayed", "El Balabsa", "Abu Attwa"],
    "Faiyum": ["First Faiyum", "Second Faiyum", "El Hadqa", "El Sayala", "El Masalla", "El Sadria", "El Bahr"],
    "Zagazig": ["First Zagazig", "Second Zagazig", "El Qawmia", "El Nakhas", "El Zohour", "El Qanayat Road", "El Hossainiya"],
    "Damietta": ["First Damietta", "Second Damietta", "Ras El Bar", "Ezbet El Lahm", "Shata", "New Damietta"],
    "Aswan": ["Aswan City", "East Aswan", "West Aswan", "El Sad", "El Mahatta", "Kima", "El Sahari", "New Aswan"],
    "Minya": ["East Minya", "West Minya", "Ard Sultan", "Shalaby", "Abu Hilal", "New Minya"],
    "Qena": ["Qena City", "East Qena", "West Qena", "Al Mahatta", "Al Dahtoura", "New Qena"],
    "Sohag": ["East Sohag", "West Sohag", "Al Kawthar", "Al Thalathini", "El Shahba", "New Sohag"],
    "Beni Suef": ["East Beni Suef", "West Beni Suef", "El Gharbeya", "El Sharqeya", "Al Rawda", "New Beni Suef"],
    "Hurghada": ["El Dahar", "Sekala", "El Kawthar", "Mubarak", "Arabia", "Intercontinental", "Magawish", "Sahl Hasheesh", "El Gouna"],
    "Shibin El Kom": ["East Shibin", "West Shibin", "El Gharbeya", "El Qibliya", "El Bahariya"],
    "Kafr El Sheikh": ["East Kafr El Sheikh", "West Kafr El Sheikh", "Al Qanater", "Al Mahatta", "El Zohour"],
    "Damanhur": ["East Damanhur", "West Damanhur", "El Shams", "El Mahatta", "El Abadiya", "El Nasr"],
    "Banha": ["East Banha", "West Banha", "Kafr El Gazzar", "El Atour", "El Mahatta"],
    "Arish": ["East Arish", "Central Arish", "West Arish", "El Masaeed", "El Obour", "El Rayshaat"],
    "Mallawi": ["East Mallawi", "West Mallawi", "Qibli", "Bahri", "El Mahatta"],
    "10th of Ramadan City": ["First District", "Second District", "Third District", "Fourth District", "Fifth District", "Sixth District", "Industrial Zone", "Garden District"],
    "6th of October City": ["First District", "Second District", "Third District", "Fourth District", "Fifth District", "Sixth District", "Seventh District", "Eighth District", "Ninth District", "Industrial Zone", "Sheikh Zayed"],
    "New Cairo": ["First Settlement", "Fifth Settlement", "Third Settlement", "South Investors", "North Investors", "Lotus", "Beit El Watan", "Andalus", "New Cairo Downtown", "El Rehab", "Madinaty"],
    "Obour": ["First District", "Second District", "Third District", "Fourth District", "Fifth District", "Sixth District", "Seventh District", "Industrial Zone", "Youth Housing"]
  },
  "El Salvador": {
    "San Salvador": ["Centro Histórico", "San Jacinto", "San Miguelito", "Escalón", "San Benito", "Flor Blanca", "Miramonte", "Colonia Médica", "Monserrat", "La Rábida", "Layco", "San Francisco", "Altamira"],
    "Santa Ana": ["Centro", "El Palmar", "El Ángel", "Santa Lucía", "San Rafael", "San Miguelito", "El Calvario", "San Antonio", "Santa Bárbara", "San Sebastián"],
    "San Miguel": ["Centro", "San Francisco", "La Cruz", "El Calvario", "San Felipe", "El Molino", "La Merced", "Las Ánimas", "La Presita", "Ciudad Pacífica"],
    "Soyapango": ["Centro", "Amatepec", "San José", "Prados de Venecia", "Las Margaritas", "Montes de San Bartolo", "Bosques de Prusia", "Sierra Morena", "San Bartolo"],
    "Santa Tecla": ["Centro", "El Cafetalón", "San Antonio", "Las Delicias", "Merliot", "Jardines del Volcán", "Utila", "El Carmen", "Alpes Suizos"],
    "Mejicanos": ["Centro", "Zacamil", "San Roque", "Montreal", "San Ramón", "San Miguel", "Santa Lucía", "La Gloria"],
    "Apopa": ["Centro", "El Ángel", "Valle Verde", "Popotlán", "Madre Tierra", "San Andrés", "El Tikal", "Chintuc"],
    "Delgado": ["Centro", "Paleca", "San José", "Plan del Pino", "San Antonio", "Acolhuatitán"],
    "Sonsonate": ["Centro", "El Ángel", "Veracruz", "Sensunapán", "Las Delicias", "El Balsamar", "San Antonio"],
    "San Marcos": ["Centro", "Los Andes", "El Pepeto", "San Antonio", "Las Delicias", "Planes de Renderos"],
    "Ilopango": ["Centro", "San Bartolo", "Santa Lucía", "Altavista", "Apulo", "Las Cañas", "Changallo"],
    "Usulután": ["Centro", "La Parroquia", "El Calvario", "San Juan", "El Molino", "El Obrajuelo", "El Carmen"],
    "Ahuachapán": ["Centro", "El Calvario", "San Antonio", "Las Chinamas", "El Barro", "El Refugio"],
    "Cojutepeque": ["Centro", "San Nicolás", "El Calvario", "San José", "El Carmen", "Santa Lucía"],
    "Zacatecoluca": ["Centro", "El Calvario", "San Sebastián", "Santa Lucía", "El Carmen", "Analco"],
    "La Unión": ["Centro", "Concepción", "San Carlos", "El Calvario", "Conchagua Road", "El Tamarindo"],
    "La Libertad": ["Centro", "El Puerto", "Santa Cruz", "San Blas", "El Majahual", "Tamanique Road", "El Tunco"],
    "Chalchuapa": ["Centro", "El Calvario", "San Sebastián", "El Coco", "Galeano", "El Paste"],
    "Quezaltepeque": ["Centro", "El Calvario", "San José", "San Juan", "Primavera", "Las Palmeras"],
    "Antiguo Cuscatlán": ["Centro", "Santa Elena", "Jardines de Guadalupe", "Madre Selva", "La Sultana", "Plan de La Laguna"],
    "San Martín": ["Centro", "San Andrés", "Santa Teresa", "Las Delicias", "Altavista", "Los Alpes"],
    "Cuscatancingo": ["Centro", "San Luis Mariona", "San José", "El Porvenir", "Las Flores", "Monte Carmelo"],
    "Sensuntepeque": ["Centro", "El Calvario", "San Antonio", "San Francisco", "Los Llanitos"],
    "Metapán": ["Centro", "El Calvario", "San Pedro", "San José", "Santa Cruz", "El Panal"],
    "Acajutla": ["Centro", "Acajutla Port", "El Suncita", "Metalío", "Las Atarrayas", "El Coyol"],
    "Izalco": ["Centro", "San Sebastián", "Cruz Galana", "Las Higueras", "Huiscoyolate", "Tecuma"],
    "San Vicente": ["Centro", "El Calvario", "San Francisco", "San Cristóbal", "Santa Rosa", "Dos Quebradas"],
    "Jiquilisco": ["Centro", "San Marcos Lempa", "La Canoa", "Tierra Blanca", "El Zamorán", "Puerto El Triunfo area"],
    "Chalatenango": ["Centro", "El Calvario", "San Antonio", "San José", "San Francisco", "La Sierpe"],
    "Suchitoto": ["Centro Histórico", "San José", "El Calvario", "Santa Lucía", "San Juan", "Aguacayo"]
  },
  "Ethiopia": {
    "Addis Ababa": [
      "Bole",
      "Kirkos (Kazanchis)",
      "Arada (Piassa)",
      "Yeka (Megenagna)",
      "Lideta",
      "Nifas Silk-Lafto",
      "Kolfe Keranio",
      "Gullele",
      "Akaky Kaliti",
      "Addis Ketema",
      "Lemi Kura",
      "Bole Medhanialem",
      "Bole Atlas",
      "Bole Rwanda",
      "Bole Brass",
      "Bole Bulbula",
      "Bole Michael",
      "Sarbet (Old Airport)",
      "CMC / Ayat",
      "Gerji / Imperial",
      "Mexico Square",
      "22 Mazoria",
      "Kazanchis",
      "Piassa (Piazza)",
      "Saris",
      "Gotera",
      "Tor Hailoch",
      "Megenagna",
      "Summit",
      "Hayat",
      "Kotebe",
      "Merkato",
      "Wollo Sefer",
      "Olympia",
      "Dembel",
      "Haya Hulet",
      "Bisrate Gabriel",
      "Jomo",
      "Lebu",
      "Lafto",
      "Kality",
      "Gofa",
      "Gurd Shola",
      "Salite Mehret",
      "Shiromeda",
      "Ferensay Legasion",
      "Meskel Flower"
    ],
    "Dire Dawa": ["Sabian", "Megala", "Gende Kore", "Kazira (Kezira)", "Melka Jebdu", "Dechatu", "Gurgura", "Legehare", "Addis Ketema", "Boren", "Shinile Area", "Industrial Park Zone"],
    "Mekelle": ["Ayder", "Hadnet", "Hawelti", "Semien", "Adi-Haki", "Quiha", "Kedamay Weyane", "Romanat", "Choma", "May Derhu", "Industrial Hub"],
    "Gondar": ["Azezo", "Maraki", "Arada", "Piazza", "Atse Tewodros", "Jantekel", "Maraki Hill", "Lideta", "Ginbot 20", "College Area", "Fasil Ghebbi Area", "Bambiko", "Angereb"],
    "Bahir Dar": ["Belay Zeleke", "Fasilo", "Ginbot 20", "Tana", "Atse Tewodros", "Dagmawi Minilik", "Shum Abo", "Hidar 11", "Gish Abay", "Shimbit", "Diaspora Village", "Kebele 01–14"],
    "Adama": ["Boku Shenen", "Dembela", "Lugo", "Melka Adama", "Bole", "Dabe", "Dabe-Suba", "Posta Bet", "Piazza", "Migira", "Kebele 01–18"],
    "Adama (Nazret)": ["Boku Shenen", "Dembela", "Lugo", "Melka Adama", "Bole", "Dabe", "Dabe-Suba", "Posta Bet", "Piazza", "Migira", "Kebele 01–18"],
    "Hawassa": ["Tabor", "Bahil Adarash", "Hayek Dar", "Menaharia", "Mehal Ketema", "Addis Ketema", "Misrak", "Millennium", "Alamura", "Piazza", "Wondo Area", "Industrial Park"],
    "Jimma": ["Hermata", "Ginjo", "Jiren", "Higher 2", "Bocho Bore", "Seto Semero", "Kito Furdisa", "Bosa Addis", "Mendera", "Aba Jifar Palace Quarter"],
    "Dessie": ["Segno Gebeya", "Arada", "Tita", "Menaheria", "Buanbua", "Legehar", "Piyassa", "Hotie", "Robit", "Menafesha", "Kebele 01–10"],
    "Bishoftu": ["Hora Lake Area", "Babogaya", "Bishoftu Center", "Kuriftu Sector", "Air Force Base Area", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06", "Kebele 07", "Kebele 08", "Kebele 09"],
    "Bishoftu (Debre Zeyit)": ["Hora Lake Area", "Babogaya", "Bishoftu Center", "Kuriftu Sector", "Air Force Base Area", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06", "Kebele 07", "Kebele 08", "Kebele 09"],
    "Jijiga": ["Jigjiga Central", "Karamara", "Fafan", "Dudumad", "University Campus Area", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06"],
    "Shashamane": ["Arada", "Mehal Ketema", "Abosto", "Awasho", "Dida Boji", "Jamaica Village", "Bole", "Kuyera", "Kebele 01", "Kebele 02", "Kebele 03"],
    "Wukro": ["Wukro Central", "Adi-Abo", "Adi-Hawsi", "Agula Area", "Kebele 01", "Kebele 02", "Kebele 03", "Surrounding Rural Kebeles"],
    "Wolaita Sodo": ["Sodo Zuria", "Mehal Ketema", "Arada", "Merkato", "Farawocha", "Ligaba", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05"],
    "Debre Birhan": ["Arada", "Tebasi", "Selassie Area", "Industrial Hub", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06", "Kebele 07", "Kebele 08", "Kebele 09"],
    "Debre Markos": ["Arada", "Teklehaimanot", "Nigust", "University Quarter", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06", "Kebele 07"],
    "Hosaena": ["Mehal Ketema", "Arada", "Hossana Central", "Bobicho", "Lichamba", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05"],
    "Harar": ["Jugol (Old Walled City)", "Abadir", "Hakim", "Shenkor", "Amir Nur", "Jin'Eala", "Sofi", "Erer", "Jinella", "Ras Makonnen Square"],
    "Dilla": ["Dilla Central", "Arada", "Buno", "University Area", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05"],
    "Nekemte": ["Arada", "Bakanisa", "Kumsa Moroda Area", "University Quarter", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06", "Kebele 07", "Kebele 08"],
    "Debre Tabor": ["Arada", "Mehal Ketema", "Gafat Historical Area", "Tabor Mountain Sector", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05"],
    "Kombolcha": ["Kombolcha Central", "Industrial & Textile Park", "Airport Sector", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06"],
    "Axum": ["Axum Central", "Mai Shum", "Arada", "Stelae Park Quarter", "Queen of Sheba Palace Area", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04"],
    "Bedele": ["Bedele Central", "Arada", "Brewery District", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05"],
    "Gode": ["Gode Central", "Shabelle Riverfront", "Airport Quarter", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06"],
    "Asella": ["Arada", "Mehal Ketema", "Chilalo Foothills", "Tiret", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06"],
    "Ambo": ["Ambo Central", "Mineral Springs Area", "Senkele Sector", "University Quarter", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05", "Kebele 06"],
    "Woldiya": ["Woldiya Central", "Arada", "Gubalafta", "University Area", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05"],
    "Shire": ["Shire Central", "Enda Medhanealem", "Mai Tsebri Road Area", "Airport Sector", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04"],
    "Adigrat": ["Adigrat Central", "Hiwane", "Selam", "Pharmaceutical Hub", "Kebele 01", "Kebele 02", "Kebele 03", "Kebele 04", "Kebele 05"]
  },
  "France": {
    "Paris": ["1er – Louvre", "2e – Bourse", "3e – Temple / Le Marais", "4e – Hôtel-de-Ville", "5e – Panthéon / Quartier Latin", "6e – Luxembourg / Saint-Germain", "7e – Palais-Bourbon / Tour Eiffel", "8e – Élysée / Champs-Élysées", "9e – Opéra", "10e – Entrepôt / Canal Saint-Martin", "11e – Popincourt / Bastille", "12e – Reuilly / Bercy", "13e – Gobelins / Olympiades", "14e – Observatoire / Montparnasse", "15e – Vaugirard", "16e – Passy / Trocadéro", "17e – Batignolles-Monceau", "18e – Butte-Montmartre", "19e – Buttes-Chaumont / La Villette", "20e – Ménilmontant / Belleville"],
    "Marseille": ["1er arrondissement", "2e arrondissement – Joliette", "6e arrondissement – Castellane", "7e arrondissement – Endoume", "8e arrondissement – Prado", "Vieux-Port", "Le Panier", "La Plaine", "Roucas-Blanc"],
    "Lyon": ["Presqu'île (1er & 2e)", "Vieux Lyon (5e)", "Part-Dieu (3e)", "Croix-Rousse (4e)", "Gerland (7e)", "Monplaisir (8e)", "Vaise (9e)", "Confluence"],
    "Toulouse": ["Capitole", "Saint-Cyprien", "Carmes", "Saint-Michel", "Compans-Caffarelli", "Minimes", "Bonnefoy", "Roseraie", "Rangueil", "Mirail"],
    "Nice": ["Vieux-Nice", "Carré d'Or", "Libération", "Cimiez", "Riquier", "Mont-Boron", "Fabron", "Magnan", "Saint-Roch", "Ariane", "Promenade des Anglais"],
    "Nantes": ["Centre-ville", "Dervallières-Zola", "Hauts-Pavés-Saint-Félix", "Malakoff-Saint-Donatien", "Île de Nantes", "Breil-Barberie", "Nantes Erdre", "Nantes Nord", "Nantes Sud"],
    "Montpellier": ["Centre Écusson", "Antigone", "Port Marianne", "Beaux-Arts", "Boutonnet", "Hôpitaux-Facultés", "Mosson", "Celleneuve", "Croix-d'Argent", "Prés d'Arènes"],
    "Strasbourg": ["Grande Île / Centre", "Krutenau", "Neudorf", "Neuhof", "Meinau", "Robertsau", "Cronenbourg", "Koenigshoffen", "Esplanade", "Hautepierre", "Petite France"],
    "Bordeaux": ["Centre-ville", "Chartrons", "Saint-Michel", "Nansouty", "Saint-Augustin", "Caudéran", "Bacalan", "Bastide", "Capucins-Victoire"],
    "Lille": ["Lille-Centre", "Vieux-Lille", "Wazemmes", "Vauban-Esquermes", "Fives", "Moulins", "Lille-Sud", "Bois-Blancs"],
    "Rennes": ["Centre", "Thabor-Saint-Hélier", "Bourg-l'Évesque", "Villejean-Beauregard", "Maurepas-Patton", "Cleunay-Arsenal-Redon", "Bréquigny"],
    "Reims": ["Centre-ville", "Clairmarais", "Laon-Zola", "Europe", "Châtillons", "Croix-Rouge", "Maison-Blanche", "Murigny"],
    "Le Havre": ["Centre", "Saint-François", "Sainte-Adresse", "Caucriauville", "Mont-Gaillard", "Sanvic", "Graville", "Aplemont"],
    "Saint-Étienne": ["Centre-ville", "Bellevue", "Beaubrun", "Carnot", "Châteaucreux", "Côte-Chaude", "Montreynaud", "Terrenoire", "La Métare"],
    "Toulon": ["Centre-ville", "Le Mourillon", "Saint-Jean du Var", "Siblas", "Sainte-Musse", "Pont-du-Las", "La Serinette", "Cap Brun"],
    "Grenoble": ["Centre", "Championnet", "Île Verte", "Europole", "Berriat", "Teisseire", "Villeneuve", "Mistral", "Eaux-Claires"],
    "Dijon": ["Centre-ville", "Montchapet", "Toison d'Or", "Fontaine d'Ouche", "Université", "Port du Canal", "Bourroches", "Chevreul-Parc"],
    "Angers": ["Centre-ville", "Belle-Beille", "Monplaisir", "La Roseraie", "Saint-Serge", "Justices", "Madeleine", "Doutre", "Deux-Croix-Banchais"],
    "Nîmes": ["Centre", "Gambetta", "Jean-Jaurès", "Pissevin", "Valdegour", "Mas de Mingue", "Castanet", "Courbessac"],
    "Villeurbanne": ["Gratte-Ciel", "Charpennes-Tonkin", "Cusset", "Buers", "Croix-Luizet", "Grandclément", "Ferrandière", "Perralière"],
    "Clermont-Ferrand": ["Centre", "Montferrand", "Chamalières", "La Glacière", "Saint-Jacques", "Croix-de-Neyrat", "Les Vergnes", "Fontaine-du-Bac"],
    "Le Mans": ["Centre", "République", "Gare", "Bollée", "Pontlieue", "Bellevue", "Université", "Sablons", "Vauguyon"],
    "Aix-en-Provence": ["Centre-ville", "Mazarin", "Saint-Mitre", "Jas de Bouffan", "Encagnane", "Pont-de-l'Arc", "Les Milles", "Luynes"],
    "Brest": ["Centre", "Saint-Martin", "Saint-Marc", "Bellevue", "Lambézellec", "Europe", "Quatre-Moulins", "Recouvrance"],
    "Tours": ["Centre", "Velpeau", "Febvay", "Sanitas", "Beaujardin", "Rabelais-Tonnellé", "Sainte-Radegonde", "Deux-Lions", "Monconseil"],
    "Amiens": ["Centre-ville", "Saint-Leu", "Saint-Maurice", "Saint-Honoré-Jeanne d'Arc", "Amiens Nord", "Étouvie", "Henriville", "Saint-Acheul"],
    "Limoges": ["Centre-ville", "Beaubreuil", "La Bastide", "Val de l'Aurence", "Landouge", "Vanteaux", "Montjovis", "Uzurat"],
    "Annecy": ["Centre-ville", "Cran-Gevrier", "Annecy-le-Vieux", "Seynod", "Meythet", "Novel", "Parmelan", "Albigny"],
    "Perpignan": ["Centre historique", "Saint-Assiscle", "Saint-Martin", "Saint-Mathieu", "Moulin-à-Vent", "Bas-Vernet", "Haut-Vernet", "Porte d'Espagne"],
    "Boulogne-Billancourt": ["Centre-ville", "Parchamp-Albert Kahn", "Silly-Gallieni", "République-Point-du-Jour", "Billancourt-Rives de Seine", "Trapèze"]
  },
  "India": {
    "Mumbai": ["Colaba", "Fort", "Marine Lines", "Girgaon", "Malabar Hill", "Worli", "Dadar", "Bandra West", "Bandra East", "Andheri West", "Andheri East", "Borivali", "Kurla", "Powai", "Chembur", "Ghatkopar", "Juhu", "BKC", "Lower Parel"],
    "Delhi": ["Connaught Place", "South Extension", "Hauz Khas", "Saket", "Aerocity", "Dwarka", "Rohini", "Karol Bagh", "Lajpat Nagar", "Chanakyapuri", "Vasant Kunj", "Civil Lines", "Shahdara", "Janakpuri"],
    "Bengaluru": ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Electronic City", "MG Road", "Jayanagar", "JP Nagar", "Yelahanka", "Malleshwaram", "Bellandur", "Hebbal", "Marathahalli", "BTM Layout"],
    "Hyderabad": ["Hitec City", "Gachibowli", "Jubilee Hills", "Banjara Hills", "Madhapur", "Kondapur", "Secunderabad", "Charminar", "Kukatpally", "Begumpet", "Ameerpet", "Dilsukhnagar"],
    "Ahmedabad": ["Navrangpura", "Vastrapur", "Satellite", "Bodakdev", "Prahlad Nagar", "SG Highway", "Maninagar", "Paldi", "Thaltej", "Bopal", "Chandkheda"],
    "Chennai": ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "Mylapore", "Nungambakkam", "Alwarpet", "Guindy", "OMR (IT Corridor)", "Besant Nagar", "Kilpauk", "Egmore"],
    "Kolkata": ["Park Street", "Salt Lake (Bidhannagar)", "New Town", "Ballygunge", "Alipore", "Bhowanipore", "Gariahat", "Howrah", "Dum Dum", "Behala", "Tollygunge", "Esplanade"],
    "Surat": ["Varachha", "Katargam", "Adajan", "Athwa Lines", "Vesu", "Piplod", "Ghopad", "Rander", "Udhna", "Citylight"],
    "Pune": ["Koregaon Park", "Kalyani Nagar", "Hinjawadi", "Baner", "Viman Nagar", "Aundh", "Shivajinagar", "Kothrud", "Hadapsar", "Magarpatta", "Wakad", "Bavdhan"],
    "Jaipur": ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Raja Park", "Tonk Road", "Bani Park", "Jagatpura", "Civil Lines", "Amer"],
    "Lucknow": ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Mahanagar", "Alambagh", "Chowk", "Vibhuti Khand", "Jankipuram"],
    "Kanpur": ["Civil Lines", "Swaroop Nagar", "Kakadeo", "Kidwai Nagar", "Govind Nagar", "Shastri Nagar", "Kalyanpur", "Arya Nagar", "Panki"],
    "Nagpur": ["Dharampeth", "Sadar", "Sitabuldi", "Ramdaspeth", "Civil Lines", "Manewada", "Pratap Nagar", "Wardha Road", "Hingna"],
    "Indore": ["Vijay Nagar", "Palasia", "MG Road", "AB Road", "Bhawarkua", "Rajendra Nagar", "Rau", "Chapan Dukan", "Saket"],
    "Thane": ["Naupada", "Ghodbunder Road", "Majiwada", "Vartak Nagar", "Panchpakhadi", "Wagle Estate", "Kopri", "Manpada"],
    "Bhopal": ["Arera Colony", "MP Nagar", "Kolar Road", "Shahpura", "TT Nagar", "Habibganj", "Bairagarh", "Hoshangabad Road"],
    "Visakhapatnam": ["MVP Colony", "Dwaraka Nagar", "Siripuram", "Beach Road", "Madhurawada", "Gajuwaka", "Rushikonda", "Seethammadhara"],
    "Pimpri-Chinchwad": ["Pimpri", "Chinchwad", "Wakad", "Pimple Saudagar", "Bhosari", "Nigdi", "Ravet", "Thergaon"],
    "Patna": ["Boring Road", "Bailey Road", "Kankarbagh", "Rajendra Nagar", "Patliputra", "Fraser Road", "Danapur", "Ashok Rajpath"],
    "Vadodara": ["Alkapuri", "Old Padra Road", "Sayajigunj", "Fatehgunj", "Vasna", "Gotri", "Manjalpur", "Karelibaug"],
    "Ghaziabad": ["Indirapuram", "Vaishali", "Vasundhara", "Raj Nagar Extension", "Kaushambi", "Crossings Republik", "Kavi Nagar"],
    "Ludhiana": ["Model Town", "Sarabha Nagar", "Civil Lines", "Ferozepur Road", "BRS Nagar", "Dugri", "Mall Road"],
    "Agra": ["Tajganj", "Civil Lines", "Sanjay Place", "Dayalbagh", "Fatehabad Road", "Kamla Nagar", "Sikandra"],
    "Nashik": ["College Road", "Gangapur Road", "Indira Nagar", "Mahatma Nagar", "Panchavati", "Nashik Road", "CIDCO"],
    "Faridabad": ["Sector 15", "Sector 16", "Sector 21", "NIT Faridabad", "Greenfield", "Surajkund", "Greater Faridabad"],
    "Meerut": ["Civil Lines", "Shastri Nagar", "Saket", "Modipuram", "Delhi Road", "Ganga Nagar", "Sadar Bazaar"],
    "Rajkot": ["Kalawad Road", "University Road", "Yagnik Road", "150 Feet Ring Road", "Raiya Road", "Amin Marg"],
    "Varanasi": ["Cantonment", "Lanka", "Sigra", "Bhelupur", "Assi Ghat Area", "Godowlia", "Sarnath", "Shivpur"],
    "Srinagar": ["Lal Chowk", "Rajbagh", "Jawahar Nagar", "Hazratbal", "Boulevard Road", "Karan Nagar", "Hyderpora"],
    "Aurangabad": ["CIDCO", "Samarth Nagar", "Osmanpura", "Garkheda", "Waluj", "Chikalthana", "Jalna Road"]
  },
  "United States": {
    "New York City": ["Manhattan (Midtown)", "Manhattan (Downtown / Wall St)", "Manhattan (Upper East Side)", "Manhattan (Upper West Side)", "SoHo / Tribeca", "Brooklyn (Williamsburg)", "Brooklyn (DUMBO)", "Brooklyn (Bushwick)", "Queens (Astoria)", "Queens (Long Island City)", "Bronx", "Staten Island"],
    "Los Angeles": ["Downtown LA", "Hollywood", "Beverly Hills Area", "Santa Monica", "Venice Beach", "Silver Lake", "Koreatown", "West Hollywood", "Culver City", "Pasadena", "Glendale", "Westwood / UCLA"],
    "Chicago": ["The Loop", "River North", "West Loop", "Lincoln Park", "Wicker Park", "Fulton Market", "Logan Square", "Lakeview / Wrigleyville", "Gold Coast", "Hyde Park"],
    "Houston": ["Downtown", "Galleria / Uptown", "Montrose", "The Heights", "Medical Center", "Midtown", "Rice Village", "Energy Corridor", "River Oaks", "Memorial"],
    "Phoenix": ["Downtown Phoenix", "Camelback Corridor", "Scottsdale Old Town", "Biltmore Area", "Tempe Mill Ave", "Arcadia", "North Scottsdale", "Paradise Valley"],
    "Philadelphia": ["Center City", "Old City", "Rittenhouse Square", "Fishtown", "Northern Liberties", "University City", "Manayunk", "South Philadelphia"],
    "San Antonio": ["Downtown / River Walk", "Pearl District", "Southtown", "Stone Oak", "La Cantera", "King William Historic District", "Alamo Heights"],
    "San Diego": ["Gaslamp Quarter", "Little Italy", "La Jolla", "Pacific Beach", "North Park", "Hillcrest", "Coronado", "Ocean Beach", "Mission Valley"],
    "Dallas": ["Downtown Dallas", "Uptown", "Deep Ellum", "Bishop Arts District", "Lower Greenville", "Oak Lawn", "Design District", "Knox-Henderson"],
    "Jacksonville": ["Downtown", "Riverside / Avondale", "San Marco", "Jacksonville Beach", "Southside", "Mandarin", "Northside", "Ponte Vedra"],
    "Austin": ["Downtown / 6th St", "South Congress (SoCo)", "East Austin", "Rainey Street", "The Domain", "Zilker / Barton Springs", "Mueller", "Clarksville"],
    "Fort Worth": ["Downtown / Sundance Square", "Cultural District", "Stockyards", "Near Southside / Magnolia", "West 7th", "TCU / University"],
    "San Jose": ["Downtown", "Santana Row", "North San Jose (Tech Hub)", "Willow Glen", "Japantown", "Almaden", "Rose Garden"],
    "Columbus": ["Short North", "Downtown", "German Village", "Italian Village", "Arena District", "Grandview Heights", "Easton Town Center"],
    "Charlotte": ["Uptown", "South End", "NoDa (Arts District)", "Plaza Midwood", "Dilworth", "Ballantyne", "Myers Park", "University City"],
    "Indianapolis": ["Downtown / Wholesale District", "Mass Ave", "Broad Ripple", "Fountain Square", "Fletcher Place", "Mile Square"],
    "Seattle": ["Downtown", "Capitol Hill", "Ballard", "South Lake Union", "Pioneer Square", "Fremont", "Queen Anne", "Belltown", "University District"],
    "Denver": ["Downtown / LoDo", "RiNo (River North Art District)", "Highland", "Capitol Hill", "Cherry Creek", "Baker / South Broadway", "Five Points"],
    "Washington, D.C.": ["Georgetown", "Dupont Circle", "Capitol Hill", "Downtown / K Street", "Adams Morgan", "Penn Quarter", "Navy Yard", "U Street Corridor", "Foggy Bottom"],
    "Nashville": ["Downtown / Broadway", "The Gulch", "East Nashville", "Music Row / Midtown", "12 South", "Germantown", "Green Hills", "Sobro"],
    "Oklahoma City": ["Downtown", "Bricktown", "Midtown", "Automobile Alley", "Paseo Arts District", "Plaza District", "Nichols Hills"],
    "El Paso": ["Downtown", "Sunset Heights", "Kern Place", "East El Paso", "Westside", "Cielo Vista", "Mission Valley"],
    "Boston": ["Back Bay", "Beacon Hill", "Seaport District", "South End", "North End", "Fenway / Kenmore", "Cambridge (Harvard Sq)", "Financial District"],
    "Portland": ["Downtown", "Pearl District", "Nob Hill / NW 23rd", "Hawthorne", "Alberta Arts District", "Central Eastside", "Mississippi Ave"],
    "Las Vegas": ["The Strip", "Downtown / Fremont Street", "Summerlin", "Henderson", "Arts District", "Spring Valley", "Chinatown"],
    "Detroit": ["Downtown", "Midtown / Cultural Center", "Corktown", "Eastern Market", "New Center", "Rivertown", "Palmer Woods"],
    "Memphis": ["Downtown / Beale Street", "Midtown / Overton Square", "Cooper-Young", "South Main Historic Arts", "East Memphis", "Harbor Town"],
    "Louisville": ["Downtown", "NuLu (East Market District)", "Highlands", "Old Louisville", "St. Matthews", "Clifton / Crescent Hill", "Germantown"],
    "Baltimore": ["Inner Harbor", "Fells Point", "Canton", "Federal Hill", "Mount Vernon", "Harbor East", "Hampden", "Charles Village"],
    "Milwaukee": ["Downtown", "Historic Third Ward", "East Side", "Bay View", "Walker's Point", "Brady Street", "Brewers Hill"]
  },
  "United Kingdom": {
    "London": ["City of London", "Westminster", "Camden", "Kensington & Chelsea", "Islington", "Hackney & Shoreditch", "Southwark / London Bridge", "Greenwich", "Canary Wharf", "Soho & Covent Garden", "Mayfair & Marylebone", "Brixton", "Clapham", "Notting Hill", "Richmond"],
    "Birmingham": ["City Centre", "Jewellery Quarter", "Digbeth", "Edgbaston", "Moseley", "Harborne", "Selly Oak", "Aston", "Erdington", "Solihull Area"],
    "Glasgow": ["City Centre", "West End", "Merchant City", "Southside", "Finnieston", "Shawlands", "Partick", "Dennistoun", "Hillhead"],
    "Liverpool": ["City Centre", "Baltic Triangle", "Ropewalks", "Albert Dock", "Waterfront", "Sefton Park", "Lark Lane", "Anfield", "Crosby"],
    "Bristol": ["Harbourside", "Clifton", "Stokes Croft", "Redcliffe", "Bedminster", "Southville", "Gloucester Road", "Cotham", "Montpelier"],
    "Manchester": ["Northern Quarter", "Spinningfields", "Ancoats", "Deansgate", "Castlefield", "Didsbury", "Chorlton", "Salford Quays", "Oxford Road Corridor"],
    "Sheffield": ["City Centre", "Kelham Island", "Ecclesall Road", "Broomhill", "Crookes", "Hillsborough", "Devonshire Quarter"],
    "Leeds": ["City Centre", "Headingley", "Chapel Allerton", "Roundhay", "Holbeck Urban Village", "Kirkstall", "Horsforth"],
    "Edinburgh": ["Old Town", "New Town", "Leith", "Stockbridge", "West End", "Morningside", "Bruntsfield", "Haymarket", "Portobello"],
    "Leicester": ["City Centre", "Clarendon Park", "Highfields", "Oadby", "Aylestone", "Belgrave", "Knighton", "Stoneygate"],
    "Coventry": ["City Centre", "Earlsdon", "Cheylesmore", "Stivichall", "Radford", "Foleshill", "Tile Hill", "Canley"],
    "Bradford": ["City Centre", "Little Germany", "Saltaire", "Manningham", "Baildon", "Shipley", "Ilkley", "Bingley"],
    "Cardiff": ["City Centre", "Cardiff Bay", "Roath", "Cathays", "Pontcanna", "Canton", "Llandaff", "Splott", "Heath"],
    "Belfast": ["Cathedral Quarter", "Titanic Quarter", "City Centre", "Queen's Quarter", "Gaeltacht Quarter", "Ballyhackamore", "Lisburn Road", "Ormeau Road"],
    "Nottingham": ["City Centre / Lace Market", "Hockley", "West Bridgford", "Wollaton", "Lenton", "Beeston", "Sherwood", "Sneinton"],
    "Newcastle upon Tyne": ["City Centre / Grainger Town", "Quayside", "Jesmond", "Ouseburn", "Gosforth", "Heaton", "Byker", "Fenham"],
    "Brighton and Hove": ["The Lanes", "North Laine", "Kemptown", "Hove Seafront", "Seven Dials", "Preston Park", "Hanover", "Marina"],
    "Plymouth": ["Barbican", "Hoe", "City Centre", "Royal William Yard", "Mutley Plain", "Peverell", "Stoke", "Devonport"],
    "Stoke-on-Trent": ["Hanley (City Centre)", "Burslem", "Stoke", "Tunstall", "Fenton", "Longton", "Trentham", "Hartshill"],
    "Wolverhampton": ["City Centre", "Tettenhall", "Penn", "Compton", "Whitmore Reans", "Wednesfield", "Bilston", "Heath Town"],
    "Derby": ["City Centre / Cathedral Quarter", "Friar Gate", "Darley Abbey", "Mickleover", "Allestree", "Littleover", "Alvaston", "Sinfin"],
    "Southampton": ["City Centre", "Ocean Village", "Bedford Place", "Portswood", "Shirley", "Bitterne", "Bassett", "Highfield"],
    "Swansea": ["City Centre", "Maritime Quarter / Marina", "Mumbles", "Uplands", "Sketty", "Brynmill", "Morriston", "Killay"],
    "Salford": ["Salford Quays / MediaCityUK", "Chapel Street", "Ordsall", "Swinton", "Eccles", "Worsley", "Pendleton"],
    "Aberdeen": ["City Centre / Union Street", "Old Aberdeen", "Rosemount", "West End", "Ferryhill", "Footdee (Fittie)", "Torry", "Culter"],
    "Westminster": ["Mayfair", "Soho", "Marylebone", "Victoria", "Pimlico", "St James's", "Belgravia", "Paddington", "Bayswater"],
    "Portsmouth": ["Old Portsmouth", "Southsea", "Gunwharf Quays", "Fratton", "North End", "Cosham", "Eastney", "Milton"],
    "York": ["City Centre / Shambles", "Micklegate", "Bootham", "Fulford", "Clifton", "Bishopthorpe Road", "Heworth", "Acomb"],
    "Peterborough": ["City Centre", "Werrington", "Orton", "Fletton", "Longthorpe", "Millfield", "Bretton", "Walton"],
    "Oxford": ["City Centre", "Jericho", "Cowley", "Summertown", "Headington", "Iffley", "Grandpont", "Botley"]
  },
  "Equatorial Guinea": {
    "Malabo": ["Ela Nguema", "Caracolas", "Sampaka", "Banapa", "Perez", "Semu", "Bisantang", "Paraiso"],
    "Bata": ["Asonga", "Comandachina", "Bikuy", "Nkolombong", "Ekusu", "Pueblo Nuevo", "Mocomo"],
    "Ebebiyin": ["Ebebiyin Centre", "Nsok-Nsomo area", "Border Sector", "Marché Central"],
    "Aconibe": ["Aconibe Centre", "Quartier Administratif", "Zone Résidentielle"],
    "Mongomo": ["Mongomo Centre", "Akoakam", "Zone Résidentielle", "Stade Area"],
    "Luba": ["Luba Port", "San Carlos Bay", "Bario Central", "Playa de Luba"],
    "Evinayong": ["Evinayong Centre", "Centro Sur", "Quartier Commercial"],
    "Niefang": ["Niefang Centre", "Rio Benito Area", "Marché"],
    "Cogo": ["Cogo Port", "Muni Riverfront", "Centro"],
    "Mikomeseng": ["Mikomeseng Centre", "Quartier Nord", "Quartier Sud"]
  },
  "Eritrea": {
    "Asmara": ["Abashawel", "Akria", "Arbaete Asmara", "Godiaf", "Gejeret", "Godaif", "Mai Temenai", "Paraiso", "Sembel", "Tiravolo", "Villaggio"],
    "Keren": ["Keren Centre", "Gira Fiyo", "Eritrean Railway Quarter", "Tsaeda Korba"],
    "Massawa": ["Taulud Island", "Massawa Island", "Gherar", "Kutmia", "Edaga"],
    "Assab": ["Assab Port", "Campo Marché", "Gedem", "Bay of Assab"],
    "Mendefera": ["Mendefera Centre", "San Giorgio", "Edaga", "Biet Gergis"],
    "Barentu": ["Barentu Centre", "Kudo", "Gash-Barka Zone", "Marché"],
    "Adi Keyh": ["Adi Keyh Centre", "Qohaito Road", "Edaga"],
    "Dekemhare": ["Dekemhare Centre", "Cinema Capitol Area", "Industrial Zone"],
    "Ak'ordat": ["Ak'ordat Centre", "Barka Riverfront", "Gash Area"],
    "Ghinda": ["Ghinda Town", "Railway View", "Central Market"]
  },
  "Estonia": {
    "Tallinn": ["Kesklinn (City Centre)", "Vanalinn (Old Town)", "Põhja-Tallinn (Kalamaja, Noblessner)", "Kristiine", "Lasnamäe", "Mustamäe", "Nõmme", "Pirita", "Haabersti (Kakumäe, Rocca al Mare)"],
    "Tartu": ["Kesklinn (Centre)", "Supilinn", "Karlova", "Tähtvere", "Annelinn", "Ränilinn", "Ihaste", "Veeriku"],
    "Narva": ["Kesklinn", "Vanalinn", "Kreenholm", "Siivertsi", "Pähklimäe", "Kalevi"],
    "Pärnu": ["Kesklinn", "Rannarajoon (Beach District)", "Ülejõe", "Raeküla", "Vana-Pärnu", "Mai"],
    "Kohtla-Järve": ["Järve", "Ahtme", "Kukruse", "Oru", "Sompa"],
    "Viljandi": ["Kesklinn", "Kantreküla", "Paalalinna", "Männimäe", "Kösti", "Uueveski"],
    "Rakvere": ["Kesklinn", "Moonaküla", "Lennuvälja", "Kondivalu", "Palermo"],
    "Maardu": ["Kallavere", "Muuga", "Kroodi", "Maardu järv"],
    "Kuressaare": ["Kesklinn", "Roomassaare", "Marientali", "Kudjape", "Tori"],
    "Sillamäe": ["Kesklinn", "Vanalinn", "Ranna", "Promenaad"]
  },
  "Eswatini": {
    "Mbabane": ["Mbabane Central", "Mbabane West", "Sidwashini", "Fonteyn", "Msunduza", "Eveni", "Sandla", "Mahwalala"],
    "Manzini": ["Manzini Central", "Ngwane Park", "Fairview", "Moneni", "Ticantfwini", "Madonsa", "Zakhele"],
    "Lobamba": ["Lobamba Royal Village", "Ezulwini Valley", "Lozitha", "Ludzidzini"],
    "Siteki": ["Siteki Central", "Lubombo Plateau", "Good Shepherd Area"],
    "Piggs Peak": ["Piggs Peak Town", "Orion Area", "Peak Timbers", "Malolotja Sector"],
    "Nhlangano": ["Nhlangano Central", "Mathendele", "Ngwane", "Mkhondvo Sector"],
    "Big Bend": ["Big Bend Village", "Lusoti", "Matata", "Great Usutu Sector"],
    "Simunye": ["Simunye Village", "Sugar Estate Area", "Mlawula Sector"]
  },
  "Fiji": {
    "Suva": ["Suva Central Business District", "Laucala Bay", "Samabula", "Tamavua", "Domain", "Toorak", "Raiwaqa", "Nasese", "Nabua", "Lami Area"],
    "Nadi": ["Nadi Town", "Denarau Island", "Namaka", "Martintar", "Wailoaloa Beach", "Votualevu", "Nadi Airport Area"],
    "Lautoka": ["Lautoka City", "Simla", "Navutu", "Vuda Point", "Tavakubu", "Waiyavi"],
    "Labasa": ["Labasa Town", "Nasea", "Yaudigi", "Vunika", "Tuatua", "Waiqele"],
    "Nausori": ["Nausori Town", "Davuilevu", "Lakena", "Waila", "Rewa Delta Area"],
    "Savusavu": ["Savusavu Town", "Copra Shed Marina", "Lesiaceva", "Nawi Island", "Namale"],
    "Sigatoka": ["Sigatoka Town", "Korotogo (Coral Coast)", "Olosara", "Kulukulu", "Laselase"],
    "Ba": ["Ba Town", "Varavu", "Nailaga", "Yalalevu", "Maururu"]
  },
  "Finland": {
    "Helsinki": ["Kluuvi (City Centre)", "Kamppi", "Punavuori", "Kallio", "Töölö", "Ullanlinna", "Ruoholahti", "Jätkäsaari", "Pasila", "Lauttasaari", "Kruununhaka", "Vallila", "Herttoniemi", "Vuosaari"],
    "Espoo": ["Tapiola", "Otaniemi (Aalto Tech Hub)", "Leppävaara", "Matinkylä", "Espoon keskus", "Kivenlahti", "Kauniainen area", "Haukilahti"],
    "Tampere": ["Keskustori (Centre)", "Pyynikki", "Pispala", "Tammela", "Kaleva", "Hervanta", "Hatanpää", "Ratina", "Kauppi"],
    "Vantaa": ["Tikkurila", "Myyrmäki", "Aviapolis (Airport Hub)", "Kivistö", "Korso", "Koivukylä", "Martinlaakso"],
    "Oulu": ["Keskusta (Centre)", "Tuira", "Linnanmaa (Tech & University)", "Myllyoja", "Karjasilta", "Toppila", "Kaakkuri"],
    "Turku": ["Keskusta (Aurajoki Riverfront)", "Martti", "Port Arthur (Portsa)", "Kupittaa", "Runosmäki", "Hirvensalo", "Varissuo"],
    "Jyväskylä": ["Keskusta", "Harju", "Lutakko", "Mattilanniemi", "Kortepohja", "Kuokkala", "Palokka"],
    "Kuopio": ["Keskusta", "Väinölänniemi", "Puijonlaakso", "Saaristokaupunki", "Petonen", "Niirala"],
    "Lahti": ["Keskusta", "Satama (Harbour)", "Salpausselkä", "Mukkula", "Laune", "Karisto"],
    "Pori": ["Keskusta", "Kirjurinluoto", "Yyteri Beach", "Herralahti", "Vähärauma"]
  },
  "Germany": {
    "Berlin": ["Mitte", "Friedrichshain-Kreuzberg", "Pankow (Prenzlauer Berg)", "Charlottenburg-Wilmersdorf", "Tempelhof-Schöneberg", "Neukölln", "Treptow-Köpenick", "Steglitz-Zehlendorf", "Spandau", "Reinickendorf"],
    "Munich": ["Altstadt-Lehel", "Maxvorstadt", "Ludwigsvorstadt-Isarvorstadt", "Schwabing", "Bogenhausen", "Sendling", "Haidhausen", "Giesing", "Neuhausen-Nymphenburg", "Moosach"],
    "Hamburg": ["Hamburg-Mitte (HafenCity, St. Pauli)", "Altona (Ottensen, Sternschanze)", "Eimsbüttel", "Hamburg-Nord (Winterhude, Eppendorf)", "Wandsbek", "Bergedorf", "Harburg"],
    "Frankfurt": ["Innenstadt", "Altstadt", "Westend", "Nordend", "Sachsenhausen", "Bornheim", "Bahnhofsviertel", "Gallus / Europaviertel", "Ostend", "Bockenheim"],
    "Cologne": ["Innenstadt (Altstadt, Neustadt)", "Ehrenfeld", "Lindenthal", "Nippes", "Deutz", "Mülheim", "Rodenkirchen", "Sülz"],
    "Stuttgart": ["Stuttgart-Mitte", "Stuttgart-Nord", "Stuttgart-Ost", "Stuttgart-Süd", "Stuttgart-West", "Bad Cannstatt", "Vaihingen", "Degerloch", "Möhringen"],
    "Düsseldorf": ["Altstadt", "Stadtmitte", "Carlstadt", "Pempelfort", "Oberkassel", "MedienHafen", "Derendorf", "Bilk", "Flingern"],
    "Leipzig": ["Mitte (Zentrum)", "Südvorstadt", "Connewitz", "Plagwitz", "Schleußig", "Gohlis", "Reudnitz", "Lindenau"],
    "Dresden": ["Altstadt", "Neustadt (Äußere & Innere)", "Blasewitz", "Loschwitz", "Pieschen", "Striesen", "Friedrichstadt", "Plauen"]
  },
  "Indonesia": {
    "Jakarta": ["Menteng", "Kebayoran Baru (Senopati, SCBD)", "Kuningan / Setiabudi", "Kemang", "Kelapa Gading", "PIK (Pantai Indah Kapuk)", "Pluit", "Tanah Abang", "Gambir", "Tanjung Priok", "Cilandak", "Pondok Indah"],
    "Surabaya": ["Gubeng", "Tegalsari", "Genteng", "Wonokromo", "Rungkut", "Sukolilo", "Sambikerep", "Pabean Cantian", "Krembangan"],
    "Bandung": ["Coblong (Dago)", "Bandung Wetan", "Sumur Bandung", "Sukajadi", "Cidadap", "Lengkong", "Cicendo", "Buahbatu", "Kiaracondong"],
    "Medan": ["Medan Kota", "Medan Baru", "Medan Petisah", "Medan Sunggal", "Medan Helvetia", "Medan Barat", "Medan Timur", "Medan Johor"],
    "Semarang": ["Semarang Tengah", "Semarang Barat", "Semarang Selatan", "Semarang Timur", "Semarang Utara", "Gajahmungkur", "Candisari", "Banyumanik"],
    "Makassar": ["Ujung Pandang", "Panakkukang", "Tamalate", "Rappocini", "Mariso", "Bontoala", "Wajo", "Biringkanaya"],
    "Denpasar": ["Denpasar Selatan (Sanur)", "Denpasar Barat", "Denpasar Utara", "Denpasar Timur", "Kuta Area", "Seminyak Area", "Canggu Sector"],
    "Yogyakarta": ["Kraton", "Gondomanan", "Danurejan", "Gedongtengen (Malioboro)", "Kotagede", "Umbulharjo", "Mergangsan", "Mantrijeron"]
  },
  "Ireland": {
    "Dublin": ["Dublin 1 (O'Connell St, IFSC)", "Dublin 2 (Grafton St, Temple Bar, Docklands)", "Dublin 4 (Ballsbridge, Donnybrook)", "Dublin 6 (Ranelagh, Rathmines)", "Dublin 7 (Smithfield, Stoneybatter)", "Dublin 8 (Portobello, Liberties)", "Howth", "Dún Laoghaire", "Malahide", "Sandyford / Dundrum"],
    "Cork": ["City Centre", "Victorian Quarter", "Shandon", "Montenotte", "Douglas", "Blackrock", "Ballincollig", "Bishopstown", "Wilton", "Sunday's Well"],
    "Galway": ["Latin Quarter", "Eyre Square", "Salthill", "Claddagh", "Westend", "Dangan", "Renmore", "Knocknacarra", "Barna"],
    "Limerick": ["Georgian Quarter", "King's Island", "Castletroy (UL Tech Hub)", "Raheen", "Dooradoyle", "Corbally", "Ennis Road"],
    "Waterford": ["Viking Triangle", "City Centre", "Ballybricken", "Ardkeen", "Tramore Road Sector", "Ferrybank"]
  },
  "Japan": {
    "Tokyo": ["Shibuya", "Shinjuku", "Chiyoda (Marunouchi)", "Minato (Roppongi, Akasaka)", "Chuo (Ginza, Nihonbashi)", "Meguro", "Setagaya", "Taito (Asakusa, Ueno)", "Bunkyo", "Shinagawa", "Toshima (Ikebukuro)", "Koto (Odaiba, Toyosu)"],
    "Osaka": ["Kita (Umeda)", "Minami (Namba, Dotonbori)", "Chuo (Shinsaibashi)", "Tennoji", "Nishi", "Fukushima", "Yodogawa", "Abeno", "Konohana"],
    "Kyoto": ["Shimogyo (Kyoto Station)", "Nakagyo (Kawaramachi, Karasuma)", "Higashiyama (Gion)", "Sakyo", "Kamigyo", "Kita", "Ukyo (Arashiyama)", "Fushimi"],
    "Yokohama": ["Minato Mirai 21", "Naka (Chinatown, Motomachi)", "Nishi (Yokohama Station)", "Kanagawa", "Kohoku", "Aoba", "Tsurumi"],
    "Nagoya": ["Naka (Sakae)", "Nakamura (Nagoya Station)", "Higashi", "Chikusa", "Mizuho", "Atsuta", "Meito"],
    "Fukuoka": ["Hakata (Hakata Station)", "Chuo (Tenjin, Daimyo)", "Sawara (Nishijin)", "Higashi", "Minami", "Jonan"],
    "Sapporo": ["Chuo (Odori, Susukino)", "Kita", "Higashi", "Shiroishi", "Toyohira", "Kotoni", "Maruyama"]
  },
  "Kuwait": {
    "Kuwait City": ["Sharq", "Mirqab", "Qibla", "Dasman", "Salhiya", "Bneid Al-Gar", "Sawaber"],
    "Hawalli": ["Hawalli Centre", "Salmiya", "Rumaithiya", "Jabriya", "Mishref", "Bayan", "Shaab", "Salwa"],
    "Salmiya": ["Marina Area", "Salem Al Mubarak St", "Baghdad St", "Block 1–12", "Ras Salmiya"],
    "Farwaniya": ["Farwaniya Centre", "Khaitan", "Omariya", "Rabiya", "Andalous", "Jleeb Al-Shuyoukh", "Ardiya"],
    "Ahmadi": ["Ahmadi City", "Fahaheel", "Mangaf", "Mahboula", "Abu Halifa", "Egaila", "Sabah Al Ahmad"],
    "Jahra": ["Jahra Town", "Qasr", "Waha", "Oyoun", "Nasseem", "Taima", "Saad Al Abdullah"]
  },
  "Malaysia": {
    "Kuala Lumpur": ["Bukit Bintang", "KLCC", "Bangsar", "Mont Kiara", "Mid Valley / Seputeh", "Damansara Heights", "Cheras", "Setapak", "Brickfields (Little India)", "Kepong"],
    "George Town (Penang)": ["UNESCO Heritage Zone", "Gurney Drive", "Bayan Lepas (Free Industrial Zone)", "Tanjung Tokong", "Batu Ferringhi", "Jelutong", "Gelugor", "Air Itam"],
    "Johor Bahru": ["JB City Centre", "Mount Austin", "Iskandar Puteri / Medini", "Tanjung Puteri", "Tebrau", "Permas Jaya", "Skudai", "Danga Bay"],
    "Petaling Jaya": ["Damansara Utama (Uptown)", "SS2", "Bandar Utama", "Kota Damansara", "Sunway / PJS", "Kelana Jaya", "Section 14", "Ara Damansara"],
    "Kota Kinabalu": ["KK Waterfront", "Gaya Street", "Tanjung Aru", "Likas", "Damai", "Luyang", "Inanam", "Kepayan"]
  },
  "Mexico": {
    "Mexico City": ["Cuauhtémoc (Roma, Condesa, Juárez, Centro Histórico)", "Miguel Hidalgo (Polanco, Lomas)", "Benito Juárez (Del Valle, Nápoles)", "Coyoacán", "Álvaro Obregón (Santa Fe, San Ángel)", "Tlalpan", "Gustavo A. Madero", "Iztapalapa", "Venustiano Carranza", "Cuajimalpa"],
    "Guadalajara": ["Zona Centro", "Colonia Americana", "Chapultepec", "Providencia", "Puerta de Hierro", "Ladrón de Guevara", "Zapopan Centro", "Tlaquepaque Centro", "Tonalá"],
    "Monterrey": ["Centro Monterrey", "San Pedro Garza García (Valle)", "Cumbres", "Contry", "San Jerónimo", "Barrio Antiguo", "Santa Catarina", "San Nicolás de los Garza", "Apodaca"],
    "Puebla": ["Centro Histórico", "Angelópolis", "La Paz", "Anzures", "Cholula (San Pedro / San Andrés)", "Huexotitla", "Las Ánimas", "Zavaleta"],
    "Cancún": ["Zona Hotelera", "Centro (Supermanzanas 1–30)", "Puerto Juárez", "Bonampak Area", "Plaza Las Américas Sector", "Huayacán Area"],
    "Tijuana": ["Zona Río", "Playas de Tijuana", "Zona Centro", "Agua Caliente", "Otay", "Chapultepec", "Hipódromo", "Mesa de Otay"]
  },
  "South Africa": {
    "Johannesburg": ["Sandton (CBD / Financial)", "Rosebank", "Melrose Arch", "Braamfontein", "Maboneng / City Centre", "Fourways", "Randburg", "Midrand", "Bryanston", "Parkhurst", "Soweto"],
    "Cape Town": ["City Bowl (CBD, Bree St)", "V&A Waterfront", "Camps Bay", "Sea Point / Green Point", "Claremont / Southern Suburbs", "Woodstock / Salt River", "Century City", "Constantia", "Durbanville", "Bloubergstrand"],
    "Durban": ["Durban Central / Beachfront", "Umhlanga Rocks / Ridge", "Morningside", "Berea", "Florida Road", "Westville", "Ballito Area", "Kloof", "Glenwood"],
    "Pretoria": ["Pretoria Central", "Hatfield (University Hub)", "Menlyn / Menlyn Maine", "Brooklyn", "Waterkloof", "Centurion", "Arcadia", "Faerie Glen", "Silver Lakes"]
  },
  "United Arab Emirates": {
    "Dubai": ["Downtown Dubai / Burj Khalifa", "Dubai Marina", "Business Bay", "Palm Jumeirah", "Jumeirah (1, 2, 3)", "DIFC (Financial Centre)", "JLT (Jumeirah Lake Towers)", "Deira", "Bur Dubai", "Al Barsha", "Dubai Hills Estate", "City Walk", "Bluewaters Island"],
    "Abu Dhabi": ["Corniche / Downtown", "Al Reem Island", "Saadiyat Island (Cultural District)", "Yas Island", "Al Maryah Island (ADGM)", "Khalidiya", "Al Bateen", "Mohammed Bin Zayed City", "Khalifa City", "Al Raha Beach"],
    "Sharjah": ["Al Majaz / Waterfront", "Al Qasimia", "Al Nahda", "Al Taawun", "Muwaileh (University City)", "Sharjah Industrial Area", "Al Khan", "Al Mamzar Sharjah"],
    "Ajman": ["Ajman Corniche", "Al Nuaimiya", "Al Rashidiya", "Al Jurf", "Al Rawda", "Ajman Free Zone"],
    "Ras Al Khaimah": ["Al Hamra Village", "Marjan Island", "Al Nakheel", "Khuzam", "Dafan Al Khor", "Mina Al Arab"]
  },
  "Kenya": {
    "Nairobi": ["Westlands", "Kilimani", "Karen", "Upper Hill", "CBD / Central", "Lavington", "Parklands", "Eastleigh", "South C", "South B", "Runda", "Gigiri", "Kileleshwa", "Langata", "Roysambu", "Kasarani", "Embakasi", "Pangani", "Ngara"],
    "Mombasa": ["Nyali", "Kizingo", "Old Town", "Tudor", "Bamburi", "Likoni", "Changamwe", "Mvita", "Shanzu", "Diani Beach Sector", "Port Reitz"],
    "Kisumu": ["Milimani", "Kisumu CBD", "Kondele", "Tom Mboya", "Riat Hills", "Mamboleo", "Nyamasaria", "Kanyakwar", "Dunga Beach Area"],
    "Nakuru": ["Nakuru CBD", "Milimani", "Section 58", "Naka", "Kiamunyi", "Lanet", "Free Area", "Ngata", "Pipeline Sector"],
    "Eldoret": ["Eldoret CBD", "Elgon View", "Kapsoya", "Pioneer", "Huruma", "Maili Nne", "Langas", "Action Sector"],
    "Thika": ["Thika CBD", "Section 9", "Landless", "Makongeni", "Ngoingwa", "Kenyatta Highway Sector"],
    "Naivasha": ["Naivasha Town", "Lake Naivasha Shore", "Moi South Lake Road", "Karagita", "DC Area"],
    "Malindi": ["Malindi Town", "Casuarina", "Silversands", "Shella", "Sabaki", "Airport Sector"]
  },
  "Nigeria": {
    "Lagos": ["Victoria Island (VI)", "Ikoyi", "Lekki Phase 1", "Ikeja (GRA / Capital)", "Surulere", "Yaba (Tech Cluster)", "Maryland", "Ajah", "Marina / Lagos Island", "Apapa", "Magodo", "Gbagada", "Festac Town", "Oshodi", "Alaba"],
    "Abuja": ["Maitama", "Asokoro", "Garki", "Wuse / Wuse 2", "Jabi", "Gwarinpa", "Central Business District (CBD)", "Guzape", "Utako", "Apo", "Lugbe", "Kubwa"],
    "Kano": ["Nasarawa GRA", "Fagge", "Dala", "Kano Municipal", "Tarauni", "Gwale", "Bompai Industrial Area", "Sabon Gari"],
    "Ibadan": ["Bodija", "Dugbe (CBD)", "Agodi GRA", "Oluyole", "Jericho", "Ring Road", "Samonda", "Mokola", "Iwo Road Area"],
    "Port Harcourt": ["Old GRA", "New GRA (Phases 1-4)", "Trans-Amadi Industrial Zone", "D-Line", "Rumuola", "Rumuokwuta", "Peter Odili Road", "Woji", "Diobu", "Eligbam"],
    "Benin City": ["GRA Benin", "Ring Road (King's Square)", "Ugbowo", "Ikpoba Hill", "Airport Road Sector", "Ekenwan Road"],
    "Enugu": ["Independence Layout", "GRA Enugu", "New Haven", "Ogui", "Achara Layout", "Trans-Ekulu", "Abakpa"]
  },
  "Ghana": {
    "Accra": ["Airport Residential Area", "Cantonments", "Osu", "East Legon", "Dzorwulu", "Labone", "Ridge", "Spintex", "Dansoman", "Adabraka", "Achimota", "Tema Community 1–12"],
    "Kumasi": ["Adum (CBD)", "Nhyiaeso", "Ahodwo", "Asokwa", "Bantama", "Oforikrom", "Suame Magazine", "Kwadaso"],
    "Tamale": ["Tamale Central", "Choggu", "Lamashiegu", "Vittin", "Nyohini", "Sagnarigu"],
    "Sekondi-Takoradi": ["Takoradi Central", "Market Circle", "Beach Road", "Airport Ridge", "Anaji", "Kwesimintsim"]
  },
  "Tanzania": {
    "Dar es Salaam": ["Kariakoo", "Masaki", "Oysterbay", "Mikocheni", "Upanga", "Kivukoni", "Kinondoni", "Sinza", "Mbezi Beach", "Tegeta", "Ilala CBD", "Posta"],
    "Arusha": ["Arusha CBD / Clock Tower", "Njiro", "Sakina", "Kijenge", "Olasiti", "Sekei", "Unga Limited"],
    "Dodoma": ["Dodoma Urban / CBD", "Area C", "Area D", "Kilimani", "Makulu", "Miyuji", "Nzuguni"],
    "Mwanza": ["Mwanza CBD", "Capri Point", "Isamilo", "Nyamagana", "Ilemela", "Kirumba", "Buzuruga"],
    "Zanzibar City": ["Stone Town (Mji Mkongwe)", "Ng'ambo", "Kikwajuni", "Michenzani", "Kilimani", "Mazizini"]
  },
  "Uganda": {
    "Kampala": ["Kololo", "Nakasero", "Kampala Central (CBD)", "Naguru", "Bugolobi", "Ntinda", "Muyenga", "Kabalagala", "Bukoto", "Kamwokya", "Rubaga", "Makindye"],
    "Entebbe": ["Entebbe Town", "Kitoro", "Airport Corridor", "Nakiwogo", "Lugard Area", "Botanical Gardens Sector"],
    "Jinja": ["Jinja Central", "Source of the Nile Area", "Walukuba", "Mpumudde", "Masese", "Bugembe"],
    "Gulu": ["Gulu Central", "Layibi", "Pece", "Bardege", "Laroo"]
  },
  "Rwanda": {
    "Kigali": ["Nyarugenge (CBD)", "Kacyiru (Embassy & Gov District)", "Kimihurura", "Gacuriro", "Kiyovu", "Remera", "Nyarutarama", "Kicukiro", "Kanombe", "Gisozi"],
    "Gisenyi": ["Gisenyi Town", "Lake Kivu Waterfront", "Border Sector", "Rubavu Urban"],
    "Butare": ["Huye Central", "University Campus Quarter", "Mukura", "Ngoma"]
  },
  "Saudi Arabia": {
    "Riyadh": ["Al-Olaya (Financial Hub)", "King Abdullah Financial District (KAFD)", "Al-Malaz", "Al-Nakheel", "Al-Sulaimaniyah", "Al-Sahafa", "Diplomatic Quarter (Al-Safarat)", "Al-Murabba", "Al-Yasmin", "Al-Narjis", "Al-Hamra"],
    "Jeddah": ["Al-Balad (Historic District)", "Al-Hamra / Corniche", "Al-Rawdah", "Al-Shati", "Al-Zahra", "Al-Mohammadiyyah", "Al-Andalus", "Al-Salamah", "Obhur Al-Shamaliyah", "Al-Safa"],
    "Mecca": ["Al-Haram Quarter", "Al-Aziziyah", "Al-Naseem", "Al-Shoqiyah", "Al-Hindawiyyah", "Al-Rusaifah"],
    "Medina": ["Central Area / Markaziyah", "Al-Haram", "Quba Sector", "Al-Uyun", "Sayyid Al-Shuhada", "Al-Duaitha"],
    "Dammam": ["Al-Shati", "Al-Faisaliyah", "Al-Adamah", "Al-Mazruiyah", "Corniche Dammam", "Al-Badi"],
    "Khobar": ["Al-Ulaya", "Al-Hizam Al-Thahabi", "Al-Rakah", "Corniche Khobar", "Al-Yarmouk", "Al-Bandariyah"]
  },
  "Italy": {
    "Rome": ["Centro Storico", "Trastevere", "Prati", "Monti", "Testaccio", "Parioli", "EUR", "Flaminio", "San Giovanni", "Ostiense", "Trieste / Salario", "Appio Latino"],
    "Milan": ["Duomo / Centro Storico", "Brera", "Porta Nuova / Isola", "Navigli", "Porta Romana", "Porta Venezia", "CityLife", "Lambrate", "Bicocca", "San Siro"],
    "Naples": ["Chiaia", "Centro Storico", "Vomero", "Posillipo", "Spaccanapoli", "Fuorigrotta", "San Ferdinando", "Toledo"],
    "Turin": ["Centro", "San Salvario", "Crocetta", "Vanchiglia", "Quadrilatero Romano", "San Donato", "Santa Rita", "Lingotto"],
    "Florence": ["Duomo / San Giovanni", "Santa Maria Novella", "Santa Croce", "Santo Spirito / Oltrarno", "San Marco", "Campo di Marte"],
    "Venice": ["San Marco", "Cannaregio", "Dorsoduro", "San Polo", "Santa Croce", "Castello", "Giudecca", "Lido di Venezia"]
  },
  "Spain": {
    "Madrid": ["Sol / Gran Vía", "Salamanca (Goya, Recoletos)", "Chamberí", "Malasaña / Universidad", "Chueca / Justicia", "La Latina / Palacio", "Retiro / Jerónimos", "Chamartín", "Moncloa-Aravaca", "Tetuán / AZCA", "Arganzuela / Legazpi"],
    "Barcelona": ["Eixample (Dreta & Esquerra)", "Ciutat Vella (Gòtic, Raval, Born)", "Gràcia", "Poblenou / 22@", "Sarrià-Sant Gervasi", "Les Corts", "Sants-Montjuïc", "Barceloneta", "Horta-Guinardó", "Sant Martí"],
    "Valencia": ["Ciutat Vella (El Carmen)", "Ruzafa / Eixample", "El Pla del Real", "Extramurs", "Poblats Marítims (El Cabanyal)", "Campanar", "Benimaclet"],
    "Seville": ["Casco Antiguo (Santa Cruz)", "Triana", "Los Remedios", "Nervión", "Macarena", "La Cartuja", "San Bernardo"],
    "Málaga": ["Centro Histórico", "Soho (Arts District)", "La Malagueta", "Teatinos", "Pedregalejo", "El Palo", "Carretera de Cádiz"]
  },
  "Netherlands": {
    "Amsterdam": ["Centrum (Grachtengordel)", "Zuid (De Pijp, Museumkwartier)", "West (Oud-West, Westerpark)", "Oost (Watergraafsmeer, Indische Buurt)", "Noord (NDSM)", "Zuidas (Financial)", "Nieuw-West"],
    "Rotterdam": ["Centrum (Stadsdriehoek)", "Kop van Zuid", "Delfshaven", "Kralingen", "Feijenoord", "Noord", "Oude Noorden"],
    "The Hague": ["Centrum", "Scheveningen (Beach)", "Statenkwartier", "Benoordenhout", "Bezuidenhout", "Archipelbuurt", "Segbroek"],
    "Utrecht": ["Binnenstad", "Oost (Wilhelminapark)", "Lombok / West", "Leidsche Rijn", "Noordoost", "Zuid / Lunetten"]
  },
  "Switzerland": {
    "Zurich": ["Altstadt (City, Lindenhof)", "Aussersihl / Langstrasse", "Wiedikon", "Industriequartier (Zürich West)", "Enge", "Riesbach / Seefeld", "Oerlikon", "Fluntern"],
    "Geneva": ["Cité-Centre", "Les Pâquis", "Eaux-Vives", "Plainpalais", "Champel", "Servette", "Nations / Diplomatic Sector", "Carouge"],
    "Basel": ["Altstadt Grossbasel", "Altstadt Kleinbasel", "St. Alban", "Gundeldingen", "Bachletten", "Clara", "St. Johann"]
  },
  "Australia": {
    "Sydney": ["CBD / Circular Quay", "The Rocks", "Surry Hills", "Paddington", "Darlinghurst", "Newtown", "Bondi / Bondi Beach", "Manly", "Parramatta", "North Sydney", "Chatswood", "Barangaroo"],
    "Melbourne": ["CBD", "Southbank", "Carlton", "Fitzroy", "St Kilda", "South Yarra", "Brunswick", "Docklands", "Richmond", "Prahran", "Footscray"],
    "Brisbane": ["CBD / Queen St", "South Bank / West End", "Fortitude Valley", "New Farm", "Paddington", "Kangaroo Point", "Teneriffe", "Spring Hill"],
    "Perth": ["Perth CBD", "Northbridge", "Fremantle", "Subiaco", "Mount Lawley", "Leederville", "South Perth", "Scarborough"]
  },
  "Brazil": {
    "São Paulo": ["Avenida Paulista / Bela Vista", "Jardins (Jardim Paulista)", "Pinheiros", "Vila Madalena", "Itaim Bibi", "Vila Olímpia", "Moema", "Centro Histórico", "Liberdade", "Santana", "Tatuapé"],
    "Rio de Janeiro": ["Copacabana", "Ipanema", "Leblon", "Centro / Lapa", "Botafogo", "Flamengo", "Barra da Tijuca", "Santa Teresa", "Tijuca", "Laranjeiras"],
    "Brasília": ["Asa Sul", "Asa Norte", "Setor Hoteleiro", "Lago Sul", "Lago Norte", "Sudoeste", "Águas Claras"]
  },
  "Argentina": {
    "Buenos Aires": ["Palermo (Soho & Hollywood)", "Recoleta", "Puerto Madero", "San Telmo", "Microcentro / Retiro", "Belgrano", "Almagro", "Caballito", "Villa Crespo", "Barracas"],
    "Córdoba": ["Centro", "Nueva Córdoba", "Güemes", "Cerro de las Rosas", "General Paz", "Alberdi", "Alta Córdoba"],
    "Rosario": ["Centro", "Pichincha", "Parque España", "Echesortu", "Fisherton", "Arroyito", "Martin"]
  },
  "Turkey": {
    "Istanbul": ["Kadikoy (Moda)", "Besiktas", "Sisli (Nisantasi)", "Beyoglu (Taksim, Galata)", "Fatih (Sultanahmet)", "Uskudar", "Bakirkoy", "Sariyer", "Atasehir", "Maltepe"],
    "Ankara": ["Cankaya (Kizilay, Tunali)", "Yenimahalle", "Kecioren", "Altindag (Ulus)", "Etimesgut", "Golbasi"],
    "Izmir": ["Konak (Alsancak)", "Karsiyaka (Bostanli)", "Bornova", "Buca", "Cesme Corridor", "Balcova", "Bayrakli"]
  },
  "South Korea": {
    "Seoul": ["Gangnam", "Hongdae (Mapo)", "Itaewon (Yongsan)", "Myeongdong (Jung)", "Jongno", "Yeouido (Yeongdeungpo)", "Songpa (Jamsil)", "Seocho", "Seongsu-dong", "Dongdaemun"],
    "Busan": ["Haeundae", "Seomyeon (Busanjin)", "Gwangalli (Suyeong)", "Nampo-dong (Jung)", "Centum City", "Sasang", "Dongnae"]
  },
  "Singapore": {
    "Singapore": ["Downtown Core / Marina Bay", "Orchard / Somerset", "Tanjong Pagar / CBD", "Chinatown", "Bugis / Kampong Glam", "Clarke Quay / Robertson Quay", "Jurong East", "Woodlands", "Tampines", "Bedok", "Novena", "Toa Payoh"]
  }
};

/**
 * Standard universal local subdivision generator for cities without explicit entry.
 * Generates 12 to 14 realistic, distinct districts/local areas tailored to the cultural/regional context.
 */
export function generateUniversalSubcities(countryName: string, cityName: string): string[] {
  const cleanCity = cityName.replace(/\s*\([^)]*\)/g, "").trim() || "City";
  const lowerCountry = (countryName || "").toLowerCase();

  // Regionally tailored terminology
  const isFrancophone = ["france", "cameroon", "senegal", "ivory coast", "côte d'ivoire", "mali", "guinea", "congo", "drc", "gabon", "togo", "benin", "madagascar", "chad", "niger", "burkina faso", "haiti"].some(c => lowerCountry.includes(c));
  const isHispanophone = ["spain", "mexico", "colombia", "argentina", "peru", "chile", "ecuador", "guatemala", "cuba", "bolivia", "dominican", "honduras", "paraguay", "el salvador", "nicaragua", "costa rica", "panama", "uruguay", "puerto rico"].some(c => lowerCountry.includes(c));
  const isLusophone = ["brazil", "portugal", "angola", "mozambique", "cape verde", "guinea-bissau"].some(c => lowerCountry.includes(c));
  const isArabic = ["saudi", "emirates", "uae", "egypt", "qatar", "kuwait", "oman", "bahrain", "jordan", "lebanon", "iraq", "morocco", "algeria", "tunisia", "libya", "yemen", "sudan"].some(c => lowerCountry.includes(c));

  if (isHispanophone) {
    return [
      `Centro Histórico / Downtown ${cleanCity}`,
      `Zona Rosa / Área Comercial`,
      `Distrito Financiero & Corporativo`,
      `Sector Norte`,
      `Sector Sur`,
      `Zona Oriente / Este`,
      `Zona Poniente / Oeste`,
      `Barrio San Pedro / Zona Residencial`,
      `Colonia Las Palmas`,
      `Área Universitaria / Campus Central`,
      `Parque Industrial & Tecnológico`,
      `Costanera / Zona Ribereña`,
      `Nueva ${cleanCity} Sector`,
      `Distrito Metropolitano`
    ];
  }

  if (isFrancophone) {
    return [
      `Centre-Ville / Downtown ${cleanCity}`,
      `Quartier Historique / Vieille Ville`,
      `Plateau / Quartier des Affaires`,
      `Secteur Nord`,
      `Secteur Sud`,
      `Secteur Est`,
      `Secteur Ouest`,
      `Zone Résidentielle Les Palmiers`,
      `Quartier Universitaire`,
      `Zone Industrielle & Commerciale`,
      `Quartier du Port / Berges`,
      `Grand ${cleanCity} Périphérie`,
      `Nouveau Quartier Résidentiel`,
      `District Métropolitain`
    ];
  }

  if (isLusophone) {
    return [
      `Centro Histórico / Downtown ${cleanCity}`,
      `Distrito Financeiro & Empresarial`,
      `Bairro Central / Área Comercial`,
      `Zona Norte`,
      `Zona Sul`,
      `Zona Leste`,
      `Zona Oeste`,
      `Bairro Universitário`,
      `Área Portuária / Orla`,
      `Polo Industrial & Tecnológico`,
      `Bairro Jardim / Parque Residencial`,
      `Nova ${cleanCity}`,
      `Complexo Metropolitano`
    ];
  }

  if (isArabic) {
    return [
      `Downtown / Al-Markaz ${cleanCity}`,
      `Al-Olaya / Central Financial District`,
      `Al-Rawdah / Residential Area`,
      `North ${cleanCity} District`,
      `South ${cleanCity} Sector`,
      `East ${cleanCity} Quarter`,
      `West ${cleanCity} Area`,
      `Al-Andalus Commercial Boulevard`,
      `Diplomatic Quarter / Al-Safarat`,
      `Corniche / Waterfront Promenade`,
      `University & Innovation City`,
      `Industrial City & Logistics Park`,
      `Al-Nahda New District`,
      `Metropolitan Quarter`
    ];
  }

  return [
    `Downtown / Central Business District`,
    `${cleanCity} City Centre`,
    `Financial & Commercial Quarter`,
    `Historic Old Town / Heritage Quarter`,
    `North ${cleanCity} District`,
    `South ${cleanCity} Sector`,
    `East ${cleanCity} Quarter`,
    `West ${cleanCity} Hills`,
    `Metropolitan Garden / Residential Park`,
    `University / Academic District`,
    `Harbour / Waterfront Promenade`,
    `Innovation & Technology Hub`,
    `Grand Avenue Shopping Quarter`,
    `Airport & Logistics Corridor`
  ];
}

/**
 * Get sub-cities / local areas for any country and city combination across all 195 countries.
 * Searches:
 * 1. Explicit SUBCITIES_DATABASE entries (normalized and parenthetical-stripped).
 * 2. Case-insensitive and alias matching.
 * 3. WORLD_COUNTRIES dataset if available.
 * 4. COUNTRY_ADMIN_DIVISIONS dataset if available.
 * 5. High-quality localized universal subdivision generator.
 */
export function getSubcitiesForCity(countryName: string, cityName: string): string[] {
  if (!countryName || !cityName) return [];
  
  const cName = countryName.trim();
  const cCity = cityName.trim();

  // Clean city name by stripping parenthetical suffix (e.g. "Adama (Nazret)" -> "Adama", alias "Nazret")
  const parenMatch = cCity.match(/^(.*?)\s*\((.*?)\)$/);
  const cleanCity = (parenMatch ? parenMatch[1] : cCity).trim();
  const aliasCity = (parenMatch ? parenMatch[2] : "").trim();

  // Standardize country names / aliases
  const countryAliases: Record<string, string> = {
    "united states of america": "United States",
    "usa": "United States",
    "us": "United States",
    "united kingdom": "United Kingdom",
    "uk": "United Kingdom",
    "great britain": "United Kingdom",
    "uae": "United Arab Emirates",
    "u.a.e.": "United Arab Emirates",
    "republic of korea": "South Korea",
    "korea, south": "South Korea",
    "korea": "South Korea",
    "russian federation": "Russia"
  };

  const normCountry = countryAliases[cName.toLowerCase()] || cName;

  // 1. Direct match in subcities database
  if (SUBCITIES_DATABASE[normCountry]) {
    const countryObj = SUBCITIES_DATABASE[normCountry];
    if (countryObj[cCity]) return countryObj[cCity];
    if (countryObj[cleanCity]) return countryObj[cleanCity];
    if (aliasCity && countryObj[aliasCity]) return countryObj[aliasCity];

    const matchedKey = Object.keys(countryObj).find((k) => {
      const kLower = k.toLowerCase();
      return (
        kLower === cCity.toLowerCase() ||
        kLower === cleanCity.toLowerCase() ||
        (aliasCity && kLower === aliasCity.toLowerCase()) ||
        (cleanCity.length > 3 && kLower.includes(cleanCity.toLowerCase())) ||
        (cleanCity.length > 3 && cleanCity.toLowerCase().includes(kLower))
      );
    });
    if (matchedKey) return countryObj[matchedKey];
  }

  // 2. Case-insensitive country lookup
  const matchedCountryKey = Object.keys(SUBCITIES_DATABASE).find(
    (k) => k.toLowerCase() === normCountry.toLowerCase() || k.toLowerCase() === cName.toLowerCase()
  );
  if (matchedCountryKey) {
    const countryObj = SUBCITIES_DATABASE[matchedCountryKey];
    if (countryObj[cCity]) return countryObj[cCity];
    if (countryObj[cleanCity]) return countryObj[cleanCity];
    if (aliasCity && countryObj[aliasCity]) return countryObj[aliasCity];

    const matchedKey = Object.keys(countryObj).find((k) => {
      const kLower = k.toLowerCase();
      return (
        kLower === cCity.toLowerCase() ||
        kLower === cleanCity.toLowerCase() ||
        (aliasCity && kLower === aliasCity.toLowerCase()) ||
        (cleanCity.length > 3 && kLower.includes(cleanCity.toLowerCase())) ||
        (cleanCity.length > 3 && cleanCity.toLowerCase().includes(kLower))
      );
    });
    if (matchedKey) return countryObj[matchedKey];
  }

  // 3. Check WORLD_COUNTRIES
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { WORLD_COUNTRIES } = require("./world-locations");
    if (Array.isArray(WORLD_COUNTRIES)) {
      const wCountry = WORLD_COUNTRIES.find(
        (c: any) =>
          c.name.toLowerCase() === normCountry.toLowerCase() ||
          c.name.toLowerCase() === cName.toLowerCase() ||
          c.code.toLowerCase() === normCountry.toLowerCase()
      );
      if (wCountry && Array.isArray(wCountry.regions)) {
        for (const reg of wCountry.regions) {
          if (Array.isArray(reg.cities)) {
            for (const city of reg.cities) {
              const cNameLower = city.name.toLowerCase();
              if (
                cNameLower === cCity.toLowerCase() ||
                cNameLower === cleanCity.toLowerCase() ||
                (aliasCity && cNameLower === aliasCity.toLowerCase()) ||
                (cleanCity.length > 3 && cNameLower.includes(cleanCity.toLowerCase())) ||
                (cleanCity.length > 3 && cleanCity.toLowerCase().includes(cNameLower))
              ) {
                if (Array.isArray(city.subcities) && city.subcities.length > 0) {
                  return city.subcities;
                }
              }
            }
          }
        }
      }
    }
  } catch {}

  // 4. Check COUNTRY_ADMIN_DIVISIONS
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { COUNTRY_ADMIN_DIVISIONS } = require("./country-admin-divisions");
    if (Array.isArray(COUNTRY_ADMIN_DIVISIONS)) {
      const admCountry = COUNTRY_ADMIN_DIVISIONS.find(
        (c: any) =>
          c.country.toLowerCase() === normCountry.toLowerCase() ||
          c.country.toLowerCase() === cName.toLowerCase() ||
          c.code.toLowerCase() === normCountry.toLowerCase()
      );
      if (admCountry && Array.isArray(admCountry.divisions)) {
        for (const div of admCountry.divisions) {
          if (typeof div !== "string" && div.name) {
            const divLower = div.name.toLowerCase();
            if (
              divLower === cCity.toLowerCase() ||
              divLower === cleanCity.toLowerCase() ||
              (cleanCity.length > 3 && divLower.includes(cleanCity.toLowerCase()))
            ) {
              if (Array.isArray(div.subdivisions) && div.subdivisions.length > 0) {
                return div.subdivisions;
              }
            }
          }
        }
      }
    }
  } catch {}

  // 5. Fallback to realistic, rich universal subdivision generator
  return generateUniversalSubcities(normCountry, cleanCity || cCity);
}

