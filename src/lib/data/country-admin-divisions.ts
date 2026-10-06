/**
 * Comprehensive 195-Country First-Level Administrative Divisions (ISO 3166-2 standard).
 * Accurately models Country Context: Regional State, Chartered City, State, Province,
 * Prefecture, Governorate, Canton, Department, Oblast, County, Emirate, Parish, etc.
 */

export interface Level1DivisionConfig {
  name: string;
  type?: string; // e.g. "Regional State", "Chartered City Administration", "State", "Union Territory", etc.
  subdivisions?: string[]; // e.g. Zones, Sub-cities, Counties, Districts
}

export interface CountryAdminDivision {
  country: string;
  flag: string;
  code: string;
  adminLevel1Type: string; // Dynamic label e.g. "State", "Province", "Regional State / Chartered City", "County", "Governorate", "Prefecture", "Canton", "Oblast"
  subdivisionType: string; // Dynamic child label e.g. "Sub-City / Zone", "County / Municipality", "District / Neighborhood", "Borough / Ward"
  divisions: (string | Level1DivisionConfig)[];
}

export const COUNTRY_ADMIN_DIVISIONS: CountryAdminDivision[] = [
  // 1. Afghanistan
  {
    country: "Afghanistan",
    flag: "🇦🇫",
    code: "AF",
    adminLevel1Type: "Province (Wilayat)",
    subdivisionType: "District",
    divisions: [
      "Badakhshan", "Badghis", "Baghlan", "Balkh", "Bamyan", "Daykundi", "Farah", "Faryab",
      "Ghazni", "Ghor", "Helmand", "Herat", "Jowzjan", "Kabul", "Kandahar", "Kapisa",
      "Khost", "Kunar", "Kunduz", "Laghman", "Logar", "Nangarhar", "Nimruz", "Nuristan",
      "Paktia", "Paktika", "Panjshir", "Parwan", "Samangan", "Sar-e Pol", "Takhar", "Uruzgan",
      "Wardak", "Zabul"
    ],
  },
  // 2. Albania
  {
    country: "Albania",
    flag: "🇦🇱",
    code: "AL",
    adminLevel1Type: "County / Prefecture (Qark)",
    subdivisionType: "Municipality",
    divisions: [
      "Berat", "Dibër", "Durrës", "Elbasan", "Fier", "Gjirokastër", "Korçë", "Kukës",
      "Lezhë", "Shkodër", "Tiranë", "Vlorë"
    ],
  },
  // 3. Algeria
  {
    country: "Algeria",
    flag: "🇩🇿",
    code: "DZ",
    adminLevel1Type: "Province (Wilaya)",
    subdivisionType: "District / Daira",
    divisions: [
      "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
      "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
      "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
      "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
      "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
      "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
      "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
      "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
    ],
  },
  // 4. Andorra
  {
    country: "Andorra",
    flag: "🇦🇩",
    code: "AD",
    adminLevel1Type: "Parish (Parròquia)",
    subdivisionType: "Village / Quarter",
    divisions: [
      "Canillo", "Encamp", "La Massana", "Ordino", "Sant Julià de Lòria", "Andorra la Vella", "Escaldes-Engordany"
    ],
  },
  // 5. Angola
  {
    country: "Angola",
    flag: "🇦🇴",
    code: "AO",
    adminLevel1Type: "Province",
    subdivisionType: "Municipality",
    divisions: [
      "Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cuanza Norte", "Cuanza Sul", "Cunene",
      "Cubango", "Huambo", "Huíla", "Icolo e Bengo", "Luanda", "Lunda Norte", "Lunda Sul",
      "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
    ],
  },
  // 6. Antigua and Barbuda
  {
    country: "Antigua and Barbuda",
    flag: "🇦🇬",
    code: "AG",
    adminLevel1Type: "Parish / Dependency",
    subdivisionType: "Village",
    divisions: [
      "Saint George", "Saint John", "Saint Mary", "Saint Paul", "Saint Peter", "Saint Philip", "Barbuda", "Redonda"
    ],
  },
  // 7. Argentina
  {
    country: "Argentina",
    flag: "🇦🇷",
    code: "AR",
    adminLevel1Type: "Province / Autonomous City",
    subdivisionType: "Department / Partido",
    divisions: [
      "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Ciudad Autónoma de Buenos Aires", "Córdoba",
      "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
      "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
      "Santiago del Estero", "Tierra del Fuego"
    ],
  },
  // 8. Armenia
  {
    country: "Armenia",
    flag: "🇦🇲",
    code: "AM",
    adminLevel1Type: "Province (Marz) / City",
    subdivisionType: "Community",
    divisions: [
      "Aragatsotn", "Ararat", "Armavir", "Gegharkunik", "Kotayk", "Lori", "Shirak", "Syunik",
      "Tavush", "Vayots Dzor", "Yerevan"
    ],
  },
  // 9. Australia
  {
    country: "Australia",
    flag: "🇦🇺",
    code: "AU",
    adminLevel1Type: "State / Territory",
    subdivisionType: "Local Government Area / Suburb",
    divisions: [
      "New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia",
      "Northern Territory", "Australian Capital Territory"
    ],
  },
  // 10. Austria
  {
    country: "Austria",
    flag: "🇦🇹",
    code: "AT",
    adminLevel1Type: "State (Bundesland)",
    subdivisionType: "District (Bezirk)",
    divisions: [
      "Burgenland", "Carinthia", "Lower Austria", "Upper Austria", "Salzburg", "Styria", "Tyrol", "Vorarlberg", "Vienna"
    ],
  },
  // 11. Azerbaijan
  {
    country: "Azerbaijan",
    flag: "🇦🇿",
    code: "AZ",
    adminLevel1Type: "District / City",
    subdivisionType: "Municipality",
    divisions: [
      "Absheron", "Agdash", "Agjabadi", "Agstafa", "Agsu", "Astara", "Baku", "Balakan", "Barda",
      "Beylagan", "Bilasuvar", "Dashkasan", "Fuzuli", "Ganja", "Gədəbəy", "Gobustan", "Goranboy",
      "Goychay", "Hajigabul", "Imishli", "Ismayilli", "Jabrayil", "Jalilabad", "Kalbajar",
      "Khachmaz", "Khankendi", "Khizi", "Khojavend", "Kurdamir", "Lachin", "Lankaran", "Lerik",
      "Masally", "Mingachevir", "Nakhchivan", "Neftchala", "Oghuz", "Ordubad", "Qabala", "Qakh",
      "Qazakh", "Quba", "Qubadli", "Qusar", "Saatly", "Sabirabad", "Salyan", "Samukh", "Shabran",
      "Shaki", "Shamakhi", "Shamkir", "Sharur", "Shusha", "Siyazan", "Sumqayit", "Tartar",
      "Tovuz", "Ujar", "Yardimli", "Yevlakh", "Zangilan", "Zaqatala", "Zardab"
    ],
  },
  // 12. Bahamas
  {
    country: "Bahamas",
    flag: "🇧🇸",
    code: "BS",
    adminLevel1Type: "District / Island",
    subdivisionType: "Settlement",
    divisions: [
      "Acklins", "Berry Islands", "Bimini", "Black Point", "Cat Island", "Central Abaco", "Central Andros",
      "Central Eleuthera", "City of Freeport", "Crooked Island", "East Grand Bahama", "Exuma", "Grand Cay",
      "Harbour Island", "Hope Town", "Inagua", "Long Island", "Mangrove Cay", "Mayaguana", "Moore's Island",
      "New Providence", "North Abaco", "North Andros", "North Eleuthera", "Ragged Island", "Rum Cay",
      "San Salvador", "South Abaco", "South Andros", "South Eleuthera", "Spanish Wells", "West Grand Bahama"
    ],
  },
  // 13. Bahrain
  {
    country: "Bahrain",
    flag: "🇧🇭",
    code: "BH",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "Block / Area",
    divisions: ["Capital", "Muharraq", "Northern", "Southern"],
  },
  // 14. Bangladesh
  {
    country: "Bangladesh",
    flag: "🇧🇩",
    code: "BD",
    adminLevel1Type: "Division",
    subdivisionType: "District (Zila)",
    divisions: ["Barisal", "Chattogram", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"],
  },
  // 15. Barbados
  {
    country: "Barbados",
    flag: "🇧🇧",
    code: "BB",
    adminLevel1Type: "Parish",
    subdivisionType: "Village / Area",
    divisions: [
      "Christ Church", "Saint Andrew", "Saint George", "Saint James", "Saint John", "Saint Joseph",
      "Saint Lucy", "Saint Michael", "Saint Peter", "Saint Philip", "Saint Thomas"
    ],
  },
  // 16. Belarus
  {
    country: "Belarus",
    flag: "🇧🇾",
    code: "BY",
    adminLevel1Type: "Oblast / City",
    subdivisionType: "Raion (District)",
    divisions: ["Brest", "Gomel", "Grodno", "Mogilev", "Minsk", "Vitebsk", "Minsk City"],
  },
  // 17. Belgium
  {
    country: "Belgium",
    flag: "🇧🇪",
    code: "BE",
    adminLevel1Type: "Region / Province",
    subdivisionType: "Municipality",
    divisions: [
      "Brussels-Capital", "Flemish Brabant", "Walloon Brabant", "Antwerp", "Limburg",
      "East Flanders", "West Flanders", "Hainaut", "Liège", "Luxembourg", "Namur"
    ],
  },
  // 18. Belize
  {
    country: "Belize",
    flag: "🇧🇿",
    code: "BZ",
    adminLevel1Type: "District",
    subdivisionType: "Town / Village",
    divisions: ["Belize", "Cayo", "Corozal", "Orange Walk", "Stann Creek", "Toledo"],
  },
  // 19. Benin
  {
    country: "Benin",
    flag: "🇧🇯",
    code: "BJ",
    adminLevel1Type: "Department",
    subdivisionType: "Commune",
    divisions: [
      "Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Donga",
      "Littoral", "Mono", "Ouémé", "Plateau", "Zou"
    ],
  },
  // 20. Bhutan
  {
    country: "Bhutan",
    flag: "🇧🇹",
    code: "BT",
    adminLevel1Type: "Dzongkhag (District)",
    subdivisionType: "Gewog",
    divisions: [
      "Bumthang", "Chukha", "Dagana", "Gasa", "Haa", "Lhuentse", "Mongar", "Paro",
      "Pema Gatshel", "Punakha", "Samdrup Jongkhar", "Samtse", "Sarpang", "Thimphu",
      "Trashigang", "Trashiyangtse", "Trongsa", "Tsirang", "Wangdue Phodrang", "Zhemgang"
    ],
  },
  // 21. Bolivia
  {
    country: "Bolivia",
    flag: "🇧🇴",
    code: "BO",
    adminLevel1Type: "Department",
    subdivisionType: "Province",
    divisions: ["Chuquisaca", "La Paz", "Cochabamba", "Oruro", "Potosí", "Tarija", "Santa Cruz", "Beni", "Pando"],
  },
  // 22. Bosnia and Herzegovina
  {
    country: "Bosnia and Herzegovina",
    flag: "🇧🇦",
    code: "BA",
    adminLevel1Type: "Entity / District",
    subdivisionType: "Canton / Municipality",
    divisions: ["Federation of Bosnia and Herzegovina", "Republika Srpska", "Brčko District"],
  },
  // 23. Botswana
  {
    country: "Botswana",
    flag: "🇧🇼",
    code: "BW",
    adminLevel1Type: "District / Town",
    subdivisionType: "Sub-district",
    divisions: [
      "Central", "Chobe", "Francistown", "Gaborone", "Ghanzi", "Jwaneng", "Kgalagadi",
      "Kgatleng", "Kweneng", "Lobatse", "North East", "North West", "Selibe Phikwe", "Southern", "Sowa"
    ],
  },
  // 24. Brazil
  {
    country: "Brazil",
    flag: "🇧🇷",
    code: "BR",
    adminLevel1Type: "State / Federal District",
    subdivisionType: "Municipality",
    divisions: [
      "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Espírito Santo", "Goiás",
      "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
      "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul",
      "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins", "Federal District"
    ],
  },
  // 25. Brunei
  {
    country: "Brunei",
    flag: "🇧🇳",
    code: "BN",
    adminLevel1Type: "District (Daerah)",
    subdivisionType: "Mukim",
    divisions: ["Belait", "Brunei-Muara", "Temburong", "Tutong"],
  },
  // 26. Bulgaria
  {
    country: "Bulgaria",
    flag: "🇧🇬",
    code: "BG",
    adminLevel1Type: "Province (Oblast)",
    subdivisionType: "Municipality",
    divisions: [
      "Blagoevgrad", "Burgas", "Dobrich", "Gabrovo", "Haskovo", "Kardzhali", "Kyustendil", "Lovech",
      "Montana", "Pazardzhik", "Pernik", "Pleven", "Plovdiv", "Razgrad", "Ruse", "Shumen",
      "Silistra", "Sliven", "Smolyan", "Sofia City", "Sofia Province", "Stara Zagora", "Targovishte",
      "Varna", "Veliko Tarnovo", "Vidin", "Vratsa", "Yambol"
    ],
  },
  // 27. Burkina Faso
  {
    country: "Burkina Faso",
    flag: "🇧🇫",
    code: "BF",
    adminLevel1Type: "Region",
    subdivisionType: "Province",
    divisions: [
      "Boucle du Mouhoun", "Cascades", "Centre", "Centre-Est", "Centre-Nord", "Centre-Ouest",
      "Centre-Sud", "Est", "Hauts-Bassins", "Nord", "Plateau-Central", "Sahel", "Sud-Ouest"
    ],
  },
  // 28. Burundi
  {
    country: "Burundi",
    flag: "🇧🇮",
    code: "BI",
    adminLevel1Type: "Province",
    subdivisionType: "Commune",
    divisions: [
      "Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Cankuzo", "Cibitoke",
      "Gitega", "Karuzi", "Kayanza", "Kirundo", "Makamba", "Muramvya", "Muyinga",
      "Mwaro", "Ngozi", "Rutana", "Ruyigi"
    ],
  },
  // 29. Cabo Verde
  {
    country: "Cabo Verde",
    flag: "🇨🇻",
    code: "CV",
    adminLevel1Type: "Municipality (Concelho)",
    subdivisionType: "Freguesia (Parish)",
    divisions: [
      "Boa Vista", "Brava", "Maio", "Mosteiros", "Paul", "Porto Novo", "Praia", "Ribeira Brava",
      "Ribeira Grande", "Sal", "Santa Catarina", "Santa Cruz", "São Domingos", "São Filipe",
      "São Lourenço dos Órgãos", "São Miguel", "São Salvador do Mundo", "São Vicente", "Tarrafal",
      "Tarrafal de São Nicolau"
    ],
  },
  // 30. Cambodia
  {
    country: "Cambodia",
    flag: "🇰🇭",
    code: "KH",
    adminLevel1Type: "Province / Municipality",
    subdivisionType: "District (Srok/Khan)",
    divisions: [
      "Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang", "Kampong Speu",
      "Kampong Thom", "Kampot", "Kandal", "Kep", "Koh Kong", "Kratié", "Mondulkiri",
      "Oddar Meanchey", "Pailin", "Phnom Penh", "Preah Sihanouk", "Preah Vihear", "Pursat",
      "Prey Veng", "Ratanakiri", "Siem Reap", "Stung Treng", "Svay Rieng", "Takeo", "Tboung Khmum"
    ],
  },
  // 31. Cameroon
  {
    country: "Cameroon",
    flag: "🇨🇲",
    code: "CM",
    adminLevel1Type: "Region",
    subdivisionType: "Department",
    divisions: [
      "Adamawa", "Centre", "East", "Far North", "Littoral", "North", "Northwest", "South", "Southwest"
    ],
  },
  // 32. Canada
  {
    country: "Canada",
    flag: "🇨🇦",
    code: "CA",
    adminLevel1Type: "Province / Territory",
    subdivisionType: "Municipality / County",
    divisions: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
      "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan",
      "Northwest Territories", "Nunavut", "Yukon"
    ],
  },
  // 33. Central African Republic
  {
    country: "Central African Republic",
    flag: "🇨🇫",
    code: "CF",
    adminLevel1Type: "Prefecture / Commune",
    subdivisionType: "Sub-prefecture",
    divisions: [
      "Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Haute-Kotto", "Haut-Mbomou", "Kémo",
      "Lobaye", "Mambéré-Kadéï", "Mbomou", "Nana-Grébizi", "Nana-Mambéré", "Ombella-M'Poko",
      "Ouaka", "Ouham", "Ouham-Pendé", "Sangha-Mbaéré"
    ],
  },
  // 34. Chad
  {
    country: "Chad",
    flag: "🇹🇩",
    code: "TD",
    adminLevel1Type: "Province",
    subdivisionType: "Department",
    divisions: [
      "Bahr el Gazel", "Batha", "Borkou", "Chari-Baguirmi", "Ennedi-Est", "Ennedi-Ouest",
      "Guéra", "Hadjer-Lamis", "Kanem", "Lac", "Logone Occidental", "Logone Oriental",
      "Mandoul", "Mayo-Kebbi Est", "Mayo-Kebbi Ouest", "Moyen-Chari", "N'Djamena",
      "Ouaddaï", "Salamat", "Sila", "Tandjilé", "Tibesti", "Wadi Fira"
    ],
  },
  // 35. Chile
  {
    country: "Chile",
    flag: "🇨🇱",
    code: "CL",
    adminLevel1Type: "Region",
    subdivisionType: "Province / Commune",
    divisions: [
      "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso",
      "Santiago Metropolitan", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía",
      "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
    ],
  },
  // 36. China
  {
    country: "China",
    flag: "🇨🇳",
    code: "CN",
    adminLevel1Type: "Province / Municipality / Region",
    subdivisionType: "Prefecture / District",
    divisions: [
      "Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou",
      "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Inner Mongolia", "Jiangsu",
      "Jiangxi", "Jilin", "Liaoning", "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai",
      "Shanxi", "Sichuan", "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang", "Hong Kong", "Macao"
    ],
  },
  // 37. Colombia
  {
    country: "Colombia",
    flag: "🇨🇴",
    code: "CO",
    adminLevel1Type: "Department / Capital District",
    subdivisionType: "Municipality",
    divisions: [
      "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá", "Caldas",
      "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía",
      "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander",
      "Putumayo", "Quindío", "Risaralda", "San Andrés and Providencia", "Santander", "Sucre",
      "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
    ],
  },
  // 38. Comoros
  {
    country: "Comoros",
    flag: "🇰🇲",
    code: "KM",
    adminLevel1Type: "Autonomous Island",
    subdivisionType: "Prefecture",
    divisions: ["Grande Comore", "Mohéli", "Anjouan"],
  },
  // 39. Democratic Republic of the Congo
  {
    country: "Democratic Republic of the Congo",
    flag: "🇨🇩",
    code: "CD",
    adminLevel1Type: "Province / City",
    subdivisionType: "Territory / Commune",
    divisions: [
      "Bas-Uélé", "Équateur", "Haut-Katanga", "Haut-Lomami", "Haut-Uélé", "Ituri", "Kasaï",
      "Kasaï-Central", "Kasaï-Oriental", "Kinshasa", "Kongo Central", "Kwango", "Kwilu", "Lomami",
      "Lualaba", "Mai-Ndombe", "Maniema", "Mongala", "Nord-Kivu", "Nord-Ubangi", "Sankuru",
      "Sud-Kivu", "Sud-Ubangi", "Tanganyika", "Tshopo", "Tshuapa"
    ],
  },
  // 40. Republic of the Congo
  {
    country: "Republic of the Congo",
    flag: "🇨🇬",
    code: "CG",
    adminLevel1Type: "Department",
    subdivisionType: "District / Commune",
    divisions: [
      "Bouenza", "Cuvette", "Cuvette-Ouest", "Kouilou", "Lékoumou", "Likouala", "Niari",
      "Plateaux", "Pointe-Noire", "Pool", "Sangha", "Brazzaville"
    ],
  },
  // 41. Costa Rica
  {
    country: "Costa Rica",
    flag: "🇨🇷",
    code: "CR",
    adminLevel1Type: "Province",
    subdivisionType: "Canton",
    divisions: ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"],
  },
  // 42. Côte d'Ivoire
  {
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    code: "CI",
    adminLevel1Type: "District",
    subdivisionType: "Region",
    divisions: [
      "Abidjan", "Bas-Sassandra", "Comoé", "Denguélé", "Gôh-Djiboua", "Lacs", "Lagunes",
      "Montagnes", "Sassandra-Marahoué", "Savanes", "Vallée du Bandama", "Woroba", "Yamoussoukro", "Zanzan"
    ],
  },
  // 43. Croatia
  {
    country: "Croatia",
    flag: "🇭🇷",
    code: "HR",
    adminLevel1Type: "County (Županija) / City",
    subdivisionType: "Municipality",
    divisions: [
      "Zagreb County", "Krapina-Zagorje", "Sisak-Moslavina", "Karlovac", "Varaždin", "Koprivnica-Križevci",
      "Bjelovar-Bilogora", "Primorje-Gorski Kotar", "Lika-Senj", "Virovitica-Podravina", "Požega-Slavonia",
      "Brod-Posavina", "Zadar", "Osijek-Baranja", "Šibenik-Knin", "Vukovar-Srijem", "Split-Dalmatia",
      "Istria", "Dubrovnik-Neretva", "Međimurje", "Zagreb City"
    ],
  },
  // 44. Cuba
  {
    country: "Cuba",
    flag: "🇨🇺",
    code: "CU",
    adminLevel1Type: "Province / Special Municipality",
    subdivisionType: "Municipality",
    divisions: [
      "Artemisa", "Camagüey", "Ciego de Ávila", "Cienfuegos", "Granma", "Guantánamo", "Havana",
      "Holguín", "Isla de la Juventud", "Las Tunas", "Matanzas", "Mayabeque", "Pinar del Río",
      "Sancti Spíritus", "Santiago de Cuba", "Villa Clara"
    ],
  },
  // 45. Cyprus
  {
    country: "Cyprus",
    flag: "🇨🇾",
    code: "CY",
    adminLevel1Type: "District",
    subdivisionType: "Municipality / Community",
    divisions: ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Kyrenia"],
  },
  // 46. Czechia
  {
    country: "Czechia",
    flag: "🇨🇿",
    code: "CZ",
    adminLevel1Type: "Region (Kraj) / Capital City",
    subdivisionType: "District (Okres)",
    divisions: [
      "Prague", "Central Bohemian", "South Bohemian", "Plzeň", "Karlovy Vary", "Ústí nad Labem",
      "Liberec", "Hradec Králové", "Pardubice", "Vysočina", "South Moravian", "Olomouc", "Zlín", "Moravian-Silesian"
    ],
  },
  // 47. Denmark
  {
    country: "Denmark",
    flag: "🇩🇰",
    code: "DK",
    adminLevel1Type: "Region",
    subdivisionType: "Municipality (Kommune)",
    divisions: ["Capital Region", "Central Denmark", "North Denmark", "Region Zealand", "Region of Southern Denmark"],
  },
  // 48. Djibouti
  {
    country: "Djibouti",
    flag: "🇩🇯",
    code: "DJ",
    adminLevel1Type: "Region / City",
    subdivisionType: "District",
    divisions: ["Ali Sabieh", "Arta", "Dikhil", "Djibouti", "Obock", "Tadjourah"],
  },
  // 49. Dominica
  {
    country: "Dominica",
    flag: "🇩🇲",
    code: "DM",
    adminLevel1Type: "Parish",
    subdivisionType: "Village",
    divisions: [
      "Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Joseph",
      "Saint Luke", "Saint Mark", "Saint Patrick", "Saint Paul", "Saint Peter"
    ],
  },
  // 50. Dominican Republic
  {
    country: "Dominican Republic",
    flag: "🇩🇴",
    code: "DO",
    adminLevel1Type: "Province / National District",
    subdivisionType: "Municipality",
    divisions: [
      "Azua", "Baoruco", "Barahona", "Dajabón", "Duarte", "Elías Piña", "El Seibo", "Espaillat",
      "Hato Mayor", "Hermanas Mirabal", "Independencia", "La Altagracia", "La Romana", "La Vega",
      "María Trinidad Sánchez", "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales",
      "Peravia", "Puerto Plata", "Samaná", "Sánchez Ramírez", "San Cristóbal", "San José de Ocoa",
      "San Juan", "San Pedro de Macorís", "Santiago", "Santiago Rodríguez", "Santo Domingo",
      "Valverde", "Distrito Nacional"
    ],
  },
  // 51. Ecuador
  {
    country: "Ecuador",
    flag: "🇪🇨",
    code: "EC",
    adminLevel1Type: "Province",
    subdivisionType: "Canton",
    divisions: [
      "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas",
      "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago", "Napo",
      "Orellana", "Pastaza", "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos",
      "Tungurahua", "Zamora Chinchipe"
    ],
  },
  // 52. Egypt
  {
    country: "Egypt",
    flag: "🇪🇬",
    code: "EG",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "Markaz / Kism",
    divisions: [
      "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta",
      "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matrouh", "Minya",
      "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea",
      "Sharqia", "Sohag", "South Sinai", "Suez"
    ],
  },
  // 53. El Salvador
  {
    country: "El Salvador",
    flag: "🇸🇻",
    code: "SV",
    adminLevel1Type: "Department",
    subdivisionType: "Municipality",
    divisions: [
      "Ahuachapán", "Cabañas", "Chalatenango", "Cuscatlán", "La Libertad", "La Paz", "La Unión",
      "Morazán", "San Miguel", "San Salvador", "San Vicente", "Santa Ana", "Sonsonate", "Usulután"
    ],
  },
  // 54. Equatorial Guinea
  {
    country: "Equatorial Guinea",
    flag: "🇬🇶",
    code: "GQ",
    adminLevel1Type: "Province",
    subdivisionType: "District",
    divisions: ["Annobón", "Bioko Norte", "Bioko Sur", "Centro Sur", "Djibloho", "Kié-Ntem", "Litoral", "Wele-Nzas"],
  },
  // 55. Eritrea
  {
    country: "Eritrea",
    flag: "🇪🇷",
    code: "ER",
    adminLevel1Type: "Region (Zoba)",
    subdivisionType: "Sub-region",
    divisions: ["Anseba", "Central", "Southern Red Sea", "Northern Red Sea", "Southern", "Gash-Barka"],
  },
  // 56. Estonia
  {
    country: "Estonia",
    flag: "🇪🇪",
    code: "EE",
    adminLevel1Type: "County (Maakond)",
    subdivisionType: "Municipality",
    divisions: [
      "Harju", "Hiiu", "Ida-Viru", "Jõgeva", "Järva", "Lääne", "Lääne-Viru", "Põlva",
      "Pärnu", "Rapla", "Saare", "Tartu", "Valga", "Viljandi", "Võru"
    ],
  },
  // 57. Eswatini
  {
    country: "Eswatini",
    flag: "🇸🇿",
    code: "SZ",
    adminLevel1Type: "Region",
    subdivisionType: "Inkhundla",
    divisions: ["Hhohho", "Lubombo", "Manzini", "Shiselweni"],
  },
  // 58. Ethiopia (Special detailed treatment: 12 Regional States + 2 Chartered Cities)
  {
    country: "Ethiopia",
    flag: "🇪🇹",
    code: "ET",
    adminLevel1Type: "Regional State / Chartered City",
    subdivisionType: "Sub-City / Zone / Special Woreda",
    divisions: [
      {
        name: "Addis Ababa",
        type: "Chartered City Administration",
        subdivisions: [
          "Bole", "Kirkos (Kazanchis)", "Arada (Piassa)", "Yeka (Megenagna)", "Lideta",
          "Nifas Silk-Lafto", "Kolfe Keranio", "Gullele", "Akaky Kaliti", "Addis Ketema",
          "Lemi Kura", "Bole Medhanialem", "Bole Atlas", "Bole Rwanda", "Sarbet (Old Airport)",
          "CMC / Ayat", "Gerji / Imperial", "Mexico Square", "22 Mazoria", "Saris", "Gotera", "Tor Hailoch"
        ],
      },
      {
        name: "Dire Dawa",
        type: "Chartered City Administration",
        subdivisions: ["Sabiyan", "Gende Kore", "Megala", "Melka Jebdu", "Kezira", "Shinile Area"],
      },
      {
        name: "Oromia",
        type: "Regional State",
        subdivisions: [
          "Adama (Nazret)", "Bishoftu (Debre Zeyit)", "Jimma", "Shashemene", "Burayu",
          "Dukem", "Sebeta", "Batu (Ziway)", "Nekemte", "Asella", "Ambo", "Waliso",
          "East Shewa Zone", "West Shewa Zone", "Arsi Zone", "Jimma Zone", "Bale Zone", "Borena Zone"
        ],
      },
      {
        name: "Amhara",
        type: "Regional State",
        subdivisions: [
          "Bahir Dar", "Gondar", "Dessie", "Debre Birhan", "Debre Markos", "Kombolcha",
          "Woldiya", "North Gondar Zone", "South Gondar Zone", "North Wollo Zone",
          "South Wollo Zone", "North Shewa Zone", "East Gojjam Zone", "West Gojjam Zone"
        ],
      },
      {
        name: "Central Ethiopia",
        type: "Regional State",
        subdivisions: [
          "Hadiya Zone (Hosaena)", "Gurage Zone (Wolkite)", "Siltie Zone (Worabe)",
          "East Gurage Zone", "Kembata Zone (Durame)", "Halaba Zone", "Yem Zone",
          "Tembaro Special Woreda", "Mareko Special Woreda", "Qebena Special Woreda"
        ],
      },
      {
        name: "South Ethiopia",
        type: "Regional State",
        subdivisions: [
          "Wolaita Zone (Sodo)", "Gamo Zone (Arba Minch)", "Gofa Zone (Sawla)",
          "Gedeo Zone (Dilla)", "South Omo Zone (Jinka)", "Ari Zone", "Konso Zone",
          "Gardula Zone", "Burji Zone", "Amaro Zone", "Basketo Zone", "Ale Zone"
        ],
      },
      {
        name: "Sidama",
        type: "Regional State",
        subdivisions: ["Hawassa (Capital)", "Yirgalem", "Aleta Wondo", "Leku", "Wondo Genet", "Dale Zone", "Aroresa Zone"],
      },
      {
        name: "Tigray",
        type: "Regional State",
        subdivisions: [
          "Mekelle", "Adigrat", "Shire (Inda Selassie)", "Axum", "Alamata", "Maychew",
          "Central Tigray Zone", "Eastern Tigray Zone", "Southern Tigray Zone", "North Western Tigray Zone"
        ],
      },
      {
        name: "Somali",
        type: "Regional State",
        subdivisions: ["Jijiga", "Degehabur", "Gode", "Kebri Dahar", "Fafan Zone", "Sitti Zone", "Shabelle Zone", "Dollo Zone"],
      },
      {
        name: "Afar",
        type: "Regional State",
        subdivisions: ["Semera (Capital)", "Awash", "Asaita", "Zone 1 (Awsi Rasu)", "Zone 2 (Kilbet Rasu)", "Zone 3 (Gabi Rasu)"],
      },
      {
        name: "Benishangul-Gumuz",
        type: "Regional State",
        subdivisions: ["Assosa", "Bambasi", "Metekel Zone", "Kamashi Zone", "Assosa Zone"],
      },
      {
        name: "Gambela",
        type: "Regional State",
        subdivisions: ["Gambela Town", "Abobo", "Itang Special Woreda", "Anuak Zone", "Nuer Zone", "Majang Zone"],
      },
      {
        name: "Harari",
        type: "Regional State",
        subdivisions: ["Harar (Jugol Walled City)", "Amir Nur", "Abadir", "Shenkor", "Erer", "Sofie"],
      },
      {
        name: "Southwest Ethiopia",
        type: "Regional State",
        subdivisions: ["Bonga (Keffa)", "Mizan Teferi (Bench Sheko)", "Tepi (Sheka)", "Dawro Zone", "West Omo Zone", "Konta Zone"],
      },
    ],
  },
  // 59. Fiji
  {
    country: "Fiji",
    flag: "🇫🇯",
    code: "FJ",
    adminLevel1Type: "Division / Dependency",
    subdivisionType: "Province",
    divisions: ["Central", "Eastern", "Northern", "Western", "Rotuma"],
  },
  // 60. Finland
  {
    country: "Finland",
    flag: "🇫🇮",
    code: "FI",
    adminLevel1Type: "Region (Maakunta)",
    subdivisionType: "Sub-region / Municipality",
    divisions: [
      "Uusimaa", "Southwest Finland", "Satakunta", "Kanta-Häme", "Pirkanmaa", "Päijät-Häme",
      "Kymenlaakso", "South Karelia", "South Savo", "North Savo", "North Karelia", "Central Finland",
      "South Ostrobothnia", "Ostrobothnia", "Central Ostrobothnia", "North Ostrobothnia", "Kainuu", "Lapland", "Åland"
    ],
  },
  // 61. France
  {
    country: "France",
    flag: "🇫🇷",
    code: "FR",
    adminLevel1Type: "Region",
    subdivisionType: "Department",
    divisions: [
      "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire",
      "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine",
      "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur", "Guadeloupe", "Martinique",
      "French Guiana", "Réunion", "Mayotte"
    ],
  },
  // 62. Gabon
  {
    country: "Gabon",
    flag: "🇬🇦",
    code: "GA",
    adminLevel1Type: "Province",
    subdivisionType: "Department",
    divisions: [
      "Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo",
      "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem"
    ],
  },
  // 63. Gambia
  {
    country: "Gambia",
    flag: "🇬🇲",
    code: "GM",
    adminLevel1Type: "Region / Municipality",
    subdivisionType: "District",
    divisions: ["Banjul", "Kanifing", "Central River", "Lower River", "North Bank", "Upper River", "West Coast"],
  },
  // 64. Georgia
  {
    country: "Georgia",
    flag: "🇬🇪",
    code: "GE",
    adminLevel1Type: "Region / Autonomous Republic / City",
    subdivisionType: "Municipality",
    divisions: [
      "Abkhazia", "Adjara", "Guria", "Imereti", "Kakheti", "Kvemo Kartli", "Mtskheta-Mtianeti",
      "Racha-Lechkhumi and Kvemo Svaneti", "Samegrelo-Zemo Svaneti", "Samtskhe-Javakheti", "Shida Kartli", "Tbilisi"
    ],
  },
  // 65. Germany
  {
    country: "Germany",
    flag: "🇩🇪",
    code: "DE",
    adminLevel1Type: "State (Bundesland)",
    subdivisionType: "Rural District / Urban District",
    divisions: [
      "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse",
      "Mecklenburg-Vorpommern", "Lower Saxony", "North Rhine-Westphalia", "Rhineland-Palatinate",
      "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
    ],
  },
  // 66. Ghana
  {
    country: "Ghana",
    flag: "🇬🇭",
    code: "GH",
    adminLevel1Type: "Region",
    subdivisionType: "District / Metropolitan Area",
    divisions: [
      "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East",
      "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"
    ],
  },
  // 67. Greece
  {
    country: "Greece",
    flag: "🇬🇷",
    code: "GR",
    adminLevel1Type: "Region / Autonomous Monastic State",
    subdivisionType: "Regional Unit",
    divisions: [
      "Attica", "Central Greece", "Central Macedonia", "Crete", "Eastern Macedonia and Thrace",
      "Epirus", "Ionian Islands", "North Aegean", "Peloponnese", "South Aegean", "Thessaly",
      "Western Greece", "Western Macedonia", "Mount Athos"
    ],
  },
  // 68. Grenada
  {
    country: "Grenada",
    flag: "🇬🇩",
    code: "GD",
    adminLevel1Type: "Parish / Dependency",
    subdivisionType: "Village / Town",
    divisions: [
      "Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Mark", "Saint Patrick",
      "Carriacou and Petite Martinique"
    ],
  },
  // 69. Guatemala
  {
    country: "Guatemala",
    flag: "🇬🇹",
    code: "GT",
    adminLevel1Type: "Department",
    subdivisionType: "Municipality",
    divisions: [
      "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso", "Escuintla",
      "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango",
      "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez",
      "Totonicapán", "Zacapa"
    ],
  },
  // 70. Guinea
  {
    country: "Guinea",
    flag: "🇬🇳",
    code: "GN",
    adminLevel1Type: "Region",
    subdivisionType: "Prefecture",
    divisions: ["Boké", "Conakry", "Faranah", "Kankan", "Kindia", "Labé", "Mamou", "Nzérékoré"],
  },
  // 71. Guinea-Bissau
  {
    country: "Guinea-Bissau",
    flag: "🇬🇼",
    code: "GW",
    adminLevel1Type: "Region / Autonomous Sector",
    subdivisionType: "Sector",
    divisions: ["Bafatá", "Biombo", "Bissau", "Bolama", "Cacheu", "Gabú", "Oio", "Quinara", "Tombali"],
  },
  // 72. Guyana
  {
    country: "Guyana",
    flag: "🇬🇾",
    code: "GY",
    adminLevel1Type: "Region",
    subdivisionType: "Neighbourhood",
    divisions: [
      "Barima-Waini", "Cuyuni-Mazaruni", "Demerara-Mahaica", "East Berbice-Corentyne",
      "Essequibo Islands-West Demerara", "Mahaica-Berbice", "Pomeroon-Supenaam", "Potaro-Siparuni",
      "Upper Demerara-Berbice", "Upper Takutu-Upper Essequibo"
    ],
  },
  // 73. Haiti
  {
    country: "Haiti",
    flag: "🇭🇹",
    code: "HT",
    adminLevel1Type: "Department",
    subdivisionType: "Arrondissement",
    divisions: [
      "Artibonite", "Centre", "Grand'Anse", "Nippes", "Nord", "Nord-Est", "Nord-Ouest", "Ouest", "Sud", "Sud-Est"
    ],
  },
  // 74. Honduras
  {
    country: "Honduras",
    flag: "🇭🇳",
    code: "HN",
    adminLevel1Type: "Department",
    subdivisionType: "Municipality",
    divisions: [
      "Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortés", "El Paraíso",
      "Francisco Morazán", "Gracias a Dios", "Intibucá", "Islas de la Bahía", "La Paz",
      "Lempira", "Ocotepeque", "Olancho", "Santa Bárbara", "Valle", "Yoro"
    ],
  },
  // 75. Hungary
  {
    country: "Hungary",
    flag: "🇭🇺",
    code: "HU",
    adminLevel1Type: "County (Megye) / Capital City",
    subdivisionType: "District (Járás)",
    divisions: [
      "Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Budapest", "Csongrád-Csanád",
      "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok", "Komárom-Esztergom",
      "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna", "Vas", "Veszprém", "Zala"
    ],
  },
  // 76. Iceland
  {
    country: "Iceland",
    flag: "🇮🇸",
    code: "IS",
    adminLevel1Type: "Region (Landshlutar)",
    subdivisionType: "Municipality",
    divisions: [
      "Capital Region", "Southern Peninsula", "West", "Westfjords", "Northwest", "Northeast", "East", "South"
    ],
  },
  // 77. India
  {
    country: "India",
    flag: "🇮🇳",
    code: "IN",
    adminLevel1Type: "State / Union Territory",
    subdivisionType: "District / Taluka",
    divisions: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
      "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
      "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
      "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
      "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ],
  },
  // 78. Indonesia
  {
    country: "Indonesia",
    flag: "🇮🇩",
    code: "ID",
    adminLevel1Type: "Province",
    subdivisionType: "Regency / City (Kabupaten/Kota)",
    divisions: [
      "Aceh", "Bali", "Bangka Belitung", "Banten", "Bengkulu", "Central Java", "Central Kalimantan",
      "Central Sulawesi", "East Java", "East Kalimantan", "East Nusa Tenggara", "Gorontalo", "Jakarta",
      "Jambi", "Lampung", "Maluku", "North Kalimantan", "North Maluku", "North Sulawesi", "North Sumatra",
      "Papua", "Riau", "Riau Islands", "South Kalimantan", "South Sulawesi", "Southeast Sulawesi",
      "South Sumatra", "Southwest Papua", "West Java", "West Kalimantan", "West Nusa Tenggara",
      "West Papua", "West Sulawesi", "West Sumatra", "Yogyakarta"
    ],
  },
  // 79. Iran
  {
    country: "Iran",
    flag: "🇮🇷",
    code: "IR",
    adminLevel1Type: "Province (Ostan)",
    subdivisionType: "County (Shahrestan)",
    divisions: [
      "Alborz", "Ardabil", "Bushehr", "Chaharmahal and Bakhtiari", "East Azerbaijan", "Fars", "Gilan",
      "Golestan", "Hamadan", "Hormozgan", "Ilam", "Isfahan", "Kerman", "Kermanshah", "Khuzestan",
      "Kohgiluyeh and Boyer-Ahmad", "Kurdistan", "Lorestan", "Markazi", "Mazandaran", "North Khorasan",
      "Qazvin", "Qom", "Razavi Khorasan", "Semnan", "Sistan and Baluchestan", "South Khorasan",
      "Tehran", "West Azerbaijan", "Yazd", "Zanjan"
    ],
  },
  // 80. Iraq
  {
    country: "Iraq",
    flag: "🇮🇶",
    code: "IQ",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "District (Qadaa)",
    divisions: [
      "Al Anbar", "Baghdad", "Basra", "Babil", "Karbala", "Diyala", "Dohuk", "Erbil", "Kirkuk",
      "Maysan", "Muthanna", "Najaf", "Nineveh", "Qadisiyyah", "Salah ad-Din", "Sulaymaniyah", "Dhi Qar", "Wasit", "Halabja"
    ],
  },
  // 81. Ireland
  {
    country: "Ireland",
    flag: "🇮🇪",
    code: "IE",
    adminLevel1Type: "County",
    subdivisionType: "Municipal District",
    divisions: [
      "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare",
      "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath",
      "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"
    ],
  },
  // 82. Israel
  {
    country: "Israel",
    flag: "🇮🇱",
    code: "IL",
    adminLevel1Type: "District (Mehoz)",
    subdivisionType: "Sub-district (Nafah)",
    divisions: ["Central", "Haifa", "Jerusalem", "Northern", "Southern", "Tel Aviv"],
  },
  // 83. Italy
  {
    country: "Italy",
    flag: "🇮🇹",
    code: "IT",
    adminLevel1Type: "Region (Regione)",
    subdivisionType: "Province / Metropolitan City",
    divisions: [
      "Abruzzo", "Aosta Valley", "Apulia", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
      "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche", "Molise", "Piedmont",
      "Sardinia", "Sicily", "Tuscany", "Trentino-Alto Adige", "Umbria", "Veneto"
    ],
  },
  // 84. Jamaica
  {
    country: "Jamaica",
    flag: "🇯🇲",
    code: "JM",
    adminLevel1Type: "Parish",
    subdivisionType: "Community / Town",
    divisions: [
      "Clarendon", "Hanover", "Kingston", "Manchester", "Portland", "Saint Andrew", "Saint Ann",
      "Saint Catherine", "Saint Elizabeth", "Saint James", "Saint Mary", "Saint Thomas", "Trelawny", "Westmoreland"
    ],
  },
  // 85. Japan
  {
    country: "Japan",
    flag: "🇯🇵",
    code: "JP",
    adminLevel1Type: "Prefecture (Todōfuken)",
    subdivisionType: "City / Ward (Shi/Ku)",
    divisions: [
      "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki", "Tochigi",
      "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa", "Niigata", "Toyama", "Ishikawa", "Fukui",
      "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo",
      "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima",
      "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"
    ],
  },
  // 86. Jordan
  {
    country: "Jordan",
    flag: "🇯🇴",
    code: "JO",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "District (Liwa)",
    divisions: [
      "Ajloun", "Amman", "Aqaba", "Balqa", "Irbid", "Jerash", "Karak", "Ma'an", "Madaba", "Mafraq", "Tafileh", "Zarqa"
    ],
  },
  // 87. Kazakhstan
  {
    country: "Kazakhstan",
    flag: "🇰🇿",
    code: "KZ",
    adminLevel1Type: "Region / City",
    subdivisionType: "District (Audan)",
    divisions: [
      "Abai", "Akmola", "Aktobe", "Almaty Region", "Atyrau", "East Kazakhstan", "Jambyl", "Jetisu",
      "Karaganda", "Kostanay", "Kyzylorda", "Mangystau", "North Kazakhstan", "Pavlodar", "Turkistan",
      "Ulytau", "West Kazakhstan", "Almaty City", "Astana City", "Shymkent City"
    ],
  },
  // 88. Kenya
  {
    country: "Kenya",
    flag: "🇰🇪",
    code: "KE",
    adminLevel1Type: "County",
    subdivisionType: "Sub-County / Constituency",
    divisions: [
      "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
      "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
      "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
      "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
      "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
      "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
    ],
  },
  // 89. Kiribati
  {
    country: "Kiribati",
    flag: "🇰🇮",
    code: "KI",
    adminLevel1Type: "Island Group",
    subdivisionType: "Island Council",
    divisions: ["Gilbert Islands", "Line Islands", "Phoenix Islands"],
  },
  // 90. Kuwait
  {
    country: "Kuwait",
    flag: "🇰🇼",
    code: "KW",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "Area / Block",
    divisions: ["Al Ahmadi", "Al Asimah", "Al Farwaniyah", "Al Jahra", "Hawalli", "Mubarak Al-Kabeer"],
  },
  // 91. Kyrgyzstan
  {
    country: "Kyrgyzstan",
    flag: "🇰🇬",
    code: "KG",
    adminLevel1Type: "Region (Oblast) / City",
    subdivisionType: "Raion (District)",
    divisions: ["Batken", "Chuy", "Issyk-Kul", "Jalal-Abad", "Naryn", "Osh", "Talas", "Bishkek", "Osh City"],
  },
  // 92. Laos
  {
    country: "Laos",
    flag: "🇱🇦",
    code: "LA",
    adminLevel1Type: "Province / Prefecture",
    subdivisionType: "District (Muang)",
    divisions: [
      "Attapeu", "Bokeo", "Bolikhamsai", "Champasak", "Houaphanh", "Khammouane", "Luang Namtha",
      "Luang Prabang", "Oudomxay", "Phongsaly", "Salavan", "Savannakhet", "Vientiane Province",
      "Vientiane Capital", "Xaignabouli", "Xaisomboun", "Sekong", "Xiangkhouang"
    ],
  },
  // 93. Latvia
  {
    country: "Latvia",
    flag: "🇱🇻",
    code: "LV",
    adminLevel1Type: "Planning Region / Municipality",
    subdivisionType: "Parish / City",
    divisions: ["Kurzeme", "Latgale", "Riga", "Vidzeme", "Zemgale"],
  },
  // 94. Lebanon
  {
    country: "Lebanon",
    flag: "🇱🇧",
    code: "LB",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "District (Caza)",
    divisions: [
      "Akkar", "Baalbek-Hermel", "Beirut", "Beqaa", "Mount Lebanon", "Nabatieh", "North Lebanon", "South Lebanon"
    ],
  },
  // 95. Lesotho
  {
    country: "Lesotho",
    flag: "🇱🇸",
    code: "LS",
    adminLevel1Type: "District",
    subdivisionType: "Community Council",
    divisions: [
      "Berea", "Butha-Buthe", "Leribe", "Mafeteng", "Maseru", "Mohale's Hoek", "Mokhotlong",
      "Qacha's Nek", "Quthing", "Thaba-Tseka"
    ],
  },
  // 96. Liberia
  {
    country: "Liberia",
    flag: "🇱🇷",
    code: "LR",
    adminLevel1Type: "County",
    subdivisionType: "District",
    divisions: [
      "Bomi", "Bong", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa",
      "Margibi", "Maryland", "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"
    ],
  },
  // 97. Libya
  {
    country: "Libya",
    flag: "🇱🇾",
    code: "LY",
    adminLevel1Type: "District (Shabiyah)",
    subdivisionType: "Municipality",
    divisions: [
      "Benghazi", "Derna", "Ghat", "Jabal al Akhdar", "Jabal al Gharbi", "Jufra", "Kufra",
      "Marj", "Misrata", "Murqub", "Murzuq", "Nalut", "Sabha", "Sirte", "Tripoli",
      "Wadi al Hayaa", "Wadi al Shatii", "Zawiya"
    ],
  },
  // 98. Liechtenstein
  {
    country: "Liechtenstein",
    flag: "🇱🇮",
    code: "LI",
    adminLevel1Type: "Municipality (Gemeinde)",
    subdivisionType: "Village",
    divisions: [
      "Balzers", "Bendern", "Eschen", "Gamprin", "Mauren", "Planken", "Ruggell", "Schaan", "Schellenberg", "Triesen", "Triesenberg", "Vaduz"
    ],
  },
  // 99. Lithuania
  {
    country: "Lithuania",
    flag: "🇱🇹",
    code: "LT",
    adminLevel1Type: "County (Apskritis)",
    subdivisionType: "Municipality",
    divisions: [
      "Alytus", "Kaunas", "Klaipėda", "Marijampolė", "Panevėžys", "Šiauliai", "Tauragė", "Telšiai", "Utena", "Vilnius"
    ],
  },
  // 100. Luxembourg
  {
    country: "Luxembourg",
    flag: "🇱🇺",
    code: "LU",
    adminLevel1Type: "Canton / District",
    subdivisionType: "Commune",
    divisions: ["Diekirch", "Grevenmacher", "Luxembourg"],
  },
  // 101. Madagascar
  {
    country: "Madagascar",
    flag: "🇲🇬",
    code: "MG",
    adminLevel1Type: "Region",
    subdivisionType: "District",
    divisions: [
      "Analamanga", "Bongolava", "Itasy", "Vakinankaratra", "Diana", "Sava", "Sofia", "Boeny",
      "Betsiboka", "Melaky", "Alaotra-Mangoro", "Atsinanana", "Analanjirofo", "Amoron'i Mania",
      "Haute Matsiatra", "Vatovavy", "Fitovinany", "Atsimo-Atsinanana", "Ihorombe", "Menabe",
      "Atsimo-Andrefana", "Androy"
    ],
  },
  // 102. Malawi
  {
    country: "Malawi",
    flag: "🇲🇼",
    code: "MW",
    adminLevel1Type: "Region",
    subdivisionType: "District",
    divisions: ["Central", "Northern", "Southern"],
  },
  // 103. Malaysia
  {
    country: "Malaysia",
    flag: "🇲🇾",
    code: "MY",
    adminLevel1Type: "State / Federal Territory",
    subdivisionType: "District (Daerah)",
    divisions: [
      "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak",
      "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"
    ],
  },
  // 104. Maldives
  {
    country: "Maldives",
    flag: "🇲🇻",
    code: "MV",
    adminLevel1Type: "Atoll / City",
    subdivisionType: "Island",
    divisions: [
      "Alifushi", "Addu City", "Fuvahmulah City", "Haa Alif", "Haa Dhaalu", "Kaafu", "Laamu",
      "Lhaviyani", "Malé", "Meemu", "Noonu", "Raa", "Shaviyani", "Thaa", "Vaavu"
    ],
  },
  // 105. Mali
  {
    country: "Mali",
    flag: "🇲🇱",
    code: "ML",
    adminLevel1Type: "Region / District",
    subdivisionType: "Cercle",
    divisions: [
      "Bamako", "Gao", "Kayes", "Kidal", "Koulikoro", "Mopti", "Ségou", "Sikasso", "Timbuktu", "Taoudénit", "Ménaka"
    ],
  },
  // 106. Malta
  {
    country: "Malta",
    flag: "🇲🇹",
    code: "MT",
    adminLevel1Type: "Region",
    subdivisionType: "Local Council",
    divisions: [
      "Northern", "Central", "Southern Harbour", "Northern Harbour", "South Eastern", "Western", "Gozo and Comino"
    ],
  },
  // 107. Marshall Islands
  {
    country: "Marshall Islands",
    flag: "🇲🇭",
    code: "MH",
    adminLevel1Type: "Island Chain / Municipality",
    subdivisionType: "Atoll",
    divisions: ["Ralik Chain", "Ratak Chain"],
  },
  // 108. Mauritania
  {
    country: "Mauritania",
    flag: "🇲🇷",
    code: "MR",
    adminLevel1Type: "Region (Wilaya)",
    subdivisionType: "Moughataa (Department)",
    divisions: [
      "Adrar", "Assaba", "Brakna", "Dakhlet Nouadhibou", "Gorgol", "Guidimaka", "Hodh Ech Chargui",
      "Hodh El Gharbi", "Inchiri", "Nouakchott Nord", "Nouakchott Ouest", "Nouakchott Sud", "Tagant",
      "Tiris Zemmour", "Trarza"
    ],
  },
  // 109. Mauritius
  {
    country: "Mauritius",
    flag: "🇲🇺",
    code: "MU",
    adminLevel1Type: "District / Dependency",
    subdivisionType: "Village / Town Council",
    divisions: [
      "Black River", "Flacq", "Grand Port", "Moka", "Pamplemousses", "Plaines Wilhems",
      "Port Louis", "Rivière du Rempart", "Savanne", "Agalega", "Rodrigues"
    ],
  },
  // 110. Mexico
  {
    country: "Mexico",
    flag: "🇲🇽",
    code: "MX",
    adminLevel1Type: "State / Capital City",
    subdivisionType: "Municipality (Municipio) / Borough",
    divisions: [
      "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
      "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México State",
      "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo",
      "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
      "Yucatán", "Zacatecas", "Mexico City"
    ],
  },
  // 111. Micronesia
  {
    country: "Micronesia",
    flag: "🇫🇲",
    code: "FM",
    adminLevel1Type: "State",
    subdivisionType: "Municipality",
    divisions: ["Chuuk", "Kosrae", "Pohnpei", "Yap"],
  },
  // 112. Moldova
  {
    country: "Moldova",
    flag: "🇲🇩",
    code: "MD",
    adminLevel1Type: "District / Municipality / Autonomous Unit",
    subdivisionType: "Commune / Town",
    divisions: [
      "Chișinău", "Bălți", "Bender", "Anenii Noi", "Basarabeasca", "Briceni", "Cahul", "Cantemir",
      "Călărași", "Căușeni", "Cimișlia", "Criuleni", "Dondușeni", "Drochia", "Dubăsari", "Edineț",
      "Fălești", "Florești", "Gagauzia", "Glodeni", "Hîncești", "Ialoveni", "Leova", "Nisporeni",
      "Ocnița", "Orhei", "Rezina", "Rîșcani", "Sîngerei", "Soroca", "Strășeni", "Șoldănești",
      "Ștefan Vodă", "Taraclia", "Telenești", "Ungheni"
    ],
  },
  // 113. Monaco
  {
    country: "Monaco",
    flag: "🇲🇨",
    code: "MC",
    adminLevel1Type: "Ward / Quarter",
    subdivisionType: "Block",
    divisions: [
      "Monaco-Ville", "Monte Carlo", "La Condamine", "Fontvieille", "Larvotto", "Les Révoires",
      "Moneghetti", "Saint-Roman", "Saint-Michel", "La Colle", "Les Monéghetti"
    ],
  },
  // 114. Mongolia
  {
    country: "Mongolia",
    flag: "🇲🇳",
    code: "MN",
    adminLevel1Type: "Province (Aimag) / Capital",
    subdivisionType: "District (Sum/Düüreg)",
    divisions: [
      "Arkhangai", "Bayankhongor", "Bayan-Ölgii", "Bulgan", "Darkhan-Uul", "Dornod", "Dornogovi",
      "Dundgovi", "Govi-Altai", "Govisümber", "Khentii", "Khovd", "Khövsgöl", "Ömnögovi",
      "Orkhon", "Övörkhangai", "Selenge", "Sükhbaatar", "Töv", "Ulaanbaatar", "Uvs", "Zavkhan"
    ],
  },
  // 115. Montenegro
  {
    country: "Montenegro",
    flag: "🇲🇪",
    code: "ME",
    adminLevel1Type: "Municipality (Opština)",
    subdivisionType: "Settlement",
    divisions: [
      "Andrijevica", "Bar", "Berane", "Bijelo Polje", "Budva", "Cetinje", "Danilovgrad",
      "Herceg Novi", "Kolašin", "Kotor", "Mojkovac", "Nikšić", "Petnjica", "Plav", "Pljevlja",
      "Plužine", "Podgorica", "Rožaje", "Šavnik", "Tivat", "Tuzi", "Ulcinj", "Žabljak"
    ],
  },
  // 116. Morocco
  {
    country: "Morocco",
    flag: "🇲🇦",
    code: "MA",
    adminLevel1Type: "Region",
    subdivisionType: "Province / Prefecture",
    divisions: [
      "Beni Mellal-Khenifra", "Casablanca-Settat", "Dakhla-Oued Ed-Dahab", "Drâa-Tafilalet",
      "Fès-Meknès", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Marrakech-Safi", "Oriental",
      "Rabat-Salé-Kénitra", "Souss-Massa", "Tanger-Tétouan-Al Hoceima"
    ],
  },
  // 117. Mozambique
  {
    country: "Mozambique",
    flag: "🇲🇿",
    code: "MZ",
    adminLevel1Type: "Province / City",
    subdivisionType: "District",
    divisions: [
      "Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo Province", "Maputo City",
      "Nampula", "Niassa", "Sofala", "Tete", "Zambezia"
    ],
  },
  // 118. Myanmar
  {
    country: "Myanmar",
    flag: "🇲🇲",
    code: "MM",
    adminLevel1Type: "State / Region / Union Territory",
    subdivisionType: "District",
    divisions: [
      "Kachin", "Kayah", "Kayin", "Chin", "Sagaing", "Tanintharyi", "Bago", "Magway",
      "Mandalay", "Mon", "Rakhine", "Yangon", "Shan", "Naypyidaw Union Territory"
    ],
  },
  // 119. Namibia
  {
    country: "Namibia",
    flag: "🇳🇦",
    code: "NA",
    adminLevel1Type: "Region",
    subdivisionType: "Constituency",
    divisions: [
      "Erongo", "Hardap", "//Kharas", "Kavango East", "Kavango West", "Khomas", "Kunene",
      "Ohangwena", "Omaheke", "Omusati", "Oshana", "Oshikoto", "Otjozondjupa", "Zambezi"
    ],
  },
  // 120. Nauru
  {
    country: "Nauru",
    flag: "🇳🇷",
    code: "NR",
    adminLevel1Type: "District",
    subdivisionType: "Village",
    divisions: [
      "Aiwo", "Anabar", "Anetan", "Anibare", "Baiti", "Boe", "Buada", "Denigomodu",
      "Ewa", "Ijuw", "Meneng", "Nibok", "Uaboe", "Yaren"
    ],
  },
  // 121. Nepal
  {
    country: "Nepal",
    flag: "🇳🇵",
    code: "NP",
    adminLevel1Type: "Province",
    subdivisionType: "District",
    divisions: ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"],
  },
  // 122. Netherlands
  {
    country: "Netherlands",
    flag: "🇳🇱",
    code: "NL",
    adminLevel1Type: "Province",
    subdivisionType: "Municipality (Gemeente)",
    divisions: [
      "Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg",
      "North Brabant", "North Holland", "Overijssel", "South Holland", "Utrecht", "Zeeland"
    ],
  },
  // 123. New Zealand
  {
    country: "New Zealand",
    flag: "🇳🇿",
    code: "NZ",
    adminLevel1Type: "Region / Territory",
    subdivisionType: "District / City",
    divisions: [
      "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne", "Hawke's Bay",
      "Taranaki", "Manawatū-Whanganui", "Wellington", "Tasman", "Nelson", "Marlborough",
      "West Coast", "Canterbury", "Otago", "Southland", "Chatham Islands"
    ],
  },
  // 124. Nicaragua
  {
    country: "Nicaragua",
    flag: "🇳🇮",
    code: "NI",
    adminLevel1Type: "Department / Autonomous Region",
    subdivisionType: "Municipality",
    divisions: [
      "Boaco", "Carazo", "Chinandega", "Chontales", "Estelí", "Granada", "Jinotega",
      "León", "Madriz", "Managua", "Masaya", "Matagalpa", "Nueva Segovia", "Río San Juan",
      "Rivas", "North Caribbean Coast", "South Caribbean Coast"
    ],
  },
  // 125. Niger
  {
    country: "Niger",
    flag: "🇳🇪",
    code: "NE",
    adminLevel1Type: "Region / Capital District",
    subdivisionType: "Department",
    divisions: ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"],
  },
  // 126. Nigeria
  {
    country: "Nigeria",
    flag: "🇳🇬",
    code: "NG",
    adminLevel1Type: "State / Federal Capital Territory",
    subdivisionType: "Local Government Area (LGA)",
    divisions: [
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
      "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
      "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
      "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory"
    ],
  },
  // 127. North Korea
  {
    country: "North Korea",
    flag: "🇰🇵",
    code: "KP",
    adminLevel1Type: "Province / Special City",
    subdivisionType: "County (Kun)",
    divisions: [
      "Chagang", "North Hamgyong", "South Hamgyong", "North Hwanghae", "South Hwanghae",
      "Kangwon", "North Pyongan", "South Pyongan", "Ryanggang", "Pyongyang", "Rason", "Nampo"
    ],
  },
  // 128. North Macedonia
  {
    country: "North Macedonia",
    flag: "🇲🇰",
    code: "MK",
    adminLevel1Type: "Statistical Region",
    subdivisionType: "Municipality (Opština)",
    divisions: [
      "Eastern", "Northeastern", "Pelagonia", "Polog", "Skopje", "Southeastern", "Southwestern", "Vardar"
    ],
  },
  // 129. Norway
  {
    country: "Norway",
    flag: "🇳🇴",
    code: "NO",
    adminLevel1Type: "County (Fylke)",
    subdivisionType: "Municipality (Kommune)",
    divisions: [
      "Agder", "Akershus", "Buskerud", "Finnmark", "Innlandet", "Møre og Romsdal", "Nordland",
      "Oslo", "Rogaland", "Telemark", "Troms", "Trøndelag", "Vestfold", "Vestland", "Østfold"
    ],
  },
  // 130. Oman
  {
    country: "Oman",
    flag: "🇴🇲",
    code: "OM",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "Wilayat (Province)",
    divisions: [
      "Ad Dakhiliyah", "Dhofar", "North Al Batinah", "South Al Batinah", "North Ash Sharqiyah",
      "South Ash Sharqiyah", "Al Wusta", "Al Dhahirah", "Musandam", "Muscat", "Al Buraimi"
    ],
  },
  // 131. Pakistan
  {
    country: "Pakistan",
    flag: "🇵🇰",
    code: "PK",
    adminLevel1Type: "Province / Territory",
    subdivisionType: "District / Division",
    divisions: [
      "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory",
      "Azad Jammu and Kashmir", "Gilgit-Baltistan"
    ],
  },
  // 132. Palau
  {
    country: "Palau",
    flag: "🇵🇼",
    code: "PW",
    adminLevel1Type: "State",
    subdivisionType: "Village",
    divisions: [
      "Aimeliik", "Airai", "Angaur", "Hatohobei", "Kayangel", "Koror", "Melekeok", "Ngaraard",
      "Ngarchelong", "Ngardmau", "Ngatpang", "Ngchesar", "Ngeremlengui", "Ngiwal", "Peleliu", "Sonsorol"
    ],
  },
  // 133. Palestine
  {
    country: "Palestine",
    flag: "🇵🇸",
    code: "PS",
    adminLevel1Type: "Governorate",
    subdivisionType: "Municipality",
    divisions: [
      "Bethlehem", "Deir al-Balah", "Gaza", "Hebron", "Jenin", "Jericho and Al Aghwar",
      "Jerusalem", "Khan Yunis", "Nablus", "Qalqilya", "Rafah", "Ramallah and Al-Bireh", "Salfit", "Tubas", "Tulkarm"
    ],
  },
  // 134. Panama
  {
    country: "Panama",
    flag: "🇵🇦",
    code: "PA",
    adminLevel1Type: "Province / Comarca",
    subdivisionType: "District",
    divisions: [
      "Bocas del Toro", "Chiriquí", "Coclé", "Colón", "Darién", "Herrera", "Los Santos",
      "Panamá", "Panamá Oeste", "Veraguas", "Emberá-Wounaan", "Guna Yala", "Ngäbe-Buglé"
    ],
  },
  // 135. Papua New Guinea
  {
    country: "Papua New Guinea",
    flag: "🇵🇬",
    code: "PG",
    adminLevel1Type: "Province / Region",
    subdivisionType: "District",
    divisions: [
      "Central", "Chimbu", "Eastern Highlands", "East New Britain", "East Sepik", "Enga", "Gulf",
      "Hela", "Jiwaka", "Madang", "Manus", "Milne Bay", "Morobe", "New Ireland", "Northern",
      "Southern Highlands", "West New Britain", "West Sepik", "Western", "Western Highlands",
      "Bougainville", "National Capital District"
    ],
  },
  // 136. Paraguay
  {
    country: "Paraguay",
    flag: "🇵🇾",
    code: "PY",
    adminLevel1Type: "Department / Capital",
    subdivisionType: "District",
    divisions: [
      "Alto Paraguay", "Alto Paraná", "Amambay", "Asunción", "Boquerón", "Caaguazú", "Caazapá",
      "Canindeyú", "Central", "Concepción", "Cordillera", "Guairá", "Itapúa", "Misiones",
      "Ñeembucú", "Paraguarí", "Presidente Hayes", "San Pedro"
    ],
  },
  // 137. Peru
  {
    country: "Peru",
    flag: "🇵🇪",
    code: "PE",
    adminLevel1Type: "Department / Region",
    subdivisionType: "Province",
    divisions: [
      "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco",
      "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto",
      "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"
    ],
  },
  // 138. Philippines
  {
    country: "Philippines",
    flag: "🇵🇭",
    code: "PH",
    adminLevel1Type: "Region",
    subdivisionType: "Province / Independent City",
    divisions: [
      "Ilocos Region", "Cagayan Valley", "Central Luzon", "CALABARZON", "MIMAROPA", "Bicol",
      "Western Visayas", "Central Visayas", "Eastern Visayas", "Zamboanga Peninsula",
      "Northern Mindanao", "Davao Region", "SOCCSKSARGEN", "Caraga", "BARMM",
      "Cordillera Administrative Region", "National Capital Region"
    ],
  },
  // 139. Poland
  {
    country: "Poland",
    flag: "🇵🇱",
    code: "PL",
    adminLevel1Type: "Voivodeship (Province)",
    subdivisionType: "County (Powiat)",
    divisions: [
      "Lower Silesian", "Kuyavian-Pomeranian", "Lublin", "Lubusz", "Łódź", "Lesser Poland",
      "Masovian", "Opole", "Podkarpackie", "Podlaskie", "Pomeranian", "Silesian",
      "Świętokrzyskie", "Warmian-Masurian", "Greater Poland", "West Pomeranian"
    ],
  },
  // 140. Portugal
  {
    country: "Portugal",
    flag: "🇵🇹",
    code: "PT",
    adminLevel1Type: "District / Autonomous Region",
    subdivisionType: "Municipality (Concelho)",
    divisions: [
      "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro",
      "Guarda", "Leiria", "Lisbon", "Portalegre", "Porto", "Santarém", "Setúbal",
      "Viana do Castelo", "Vila Real", "Viseu", "Azores", "Madeira"
    ],
  },
  // 141. Qatar
  {
    country: "Qatar",
    flag: "🇶🇦",
    code: "QA",
    adminLevel1Type: "Municipality (Baladiyah)",
    subdivisionType: "Zone",
    divisions: [
      "Ad Dawhah", "Al Daayen", "Al Khor", "Al Shamal", "Al Shahaniya", "Al Wakrah", "Al Rayyan", "Umm Salal"
    ],
  },
  // 142. Romania
  {
    country: "Romania",
    flag: "🇷🇴",
    code: "RO",
    adminLevel1Type: "County (Județ) / Capital",
    subdivisionType: "Municipality / Commune",
    divisions: [
      "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov",
      "Brăila", "Bucharest", "Buzău", "Caraș-Severin", "Călărași", "Cluj", "Constanța",
      "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara",
      "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt",
      "Prahova", "Sălaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea",
      "Vaslui", "Vâlcea", "Vrancea"
    ],
  },
  // 143. Russia
  {
    country: "Russia",
    flag: "🇷🇺",
    code: "RU",
    adminLevel1Type: "Republic / Oblast / Krai / Federal City",
    subdivisionType: "Raion / Urban Okrug",
    divisions: [
      "Adygea", "Altai", "Bashkortostan", "Buryatia", "Chechnya", "Chuvashia", "Dagestan",
      "Ingushetia", "Kabardino-Balkaria", "Kalmykia", "Karachay-Cherkessia", "Karelia", "Khakassia",
      "Komi", "Mari El", "Mordovia", "North Ossetia-Alania", "Sakha", "Tatarstan", "Tuva",
      "Udmurtia", "Yakutia", "Moscow City", "Saint Petersburg", "Moscow Oblast", "Leningrad Oblast",
      "Krasnodar Krai", "Sverdlovsk Oblast", "Novosibirsk Oblast", "Rostov Oblast", "Samara Oblast"
    ],
  },
  // 144. Rwanda
  {
    country: "Rwanda",
    flag: "🇷🇼",
    code: "RW",
    adminLevel1Type: "Province / Capital City",
    subdivisionType: "District",
    divisions: ["Kigali", "Eastern", "Northern", "Southern", "Western"],
  },
  // 145. Saint Kitts and Nevis
  {
    country: "Saint Kitts and Nevis",
    flag: "🇰🇳",
    code: "KN",
    adminLevel1Type: "Parish",
    subdivisionType: "Village",
    divisions: [
      "Christ Church Nichola Town", "Saint Anne Sandy Point", "Saint George Basseterre",
      "Saint George Gingerland", "Saint James Windward", "Saint John Capisterre", "Saint John Figtree",
      "Saint Mary Cayon", "Saint Paul Capisterre", "Saint Paul Charlestown", "Saint Peter Basseterre",
      "Saint Thomas Middle Island", "Saint Thomas Lowland", "Trinity Palmetto Point"
    ],
  },
  // 146. Saint Lucia
  {
    country: "Saint Lucia",
    flag: "🇱🇨",
    code: "LC",
    adminLevel1Type: "District",
    subdivisionType: "Community",
    divisions: [
      "Anse la Raye", "Babonneau", "Castries", "Choiseul", "Dennery", "Gros Islet",
      "Laborie", "Micoud", "Praslin", "Soufrière", "Vieux Fort"
    ],
  },
  // 147. Saint Vincent and the Grenadines
  {
    country: "Saint Vincent and the Grenadines",
    flag: "🇻🇨",
    code: "VC",
    adminLevel1Type: "Parish",
    subdivisionType: "Town / Village",
    divisions: ["Charlotte", "Grenadines", "Saint Andrew", "Saint David", "Saint George", "Saint Patrick"],
  },
  // 148. Samoa
  {
    country: "Samoa",
    flag: "🇼🇸",
    code: "WS",
    adminLevel1Type: "District (Itūmālō)",
    subdivisionType: "Village",
    divisions: [
      "A'ana", "Aiga-i-le-Tai", "Atua", "Fa'asaleleaga", "Gaga'emauga", "Gaga'ifomauga",
      "Palauli", "Satupa'itea", "Tuamasaga", "Va'a-o-Fonoti", "Vaisigano"
    ],
  },
  // 149. San Marino
  {
    country: "San Marino",
    flag: "🇸🇲",
    code: "SM",
    adminLevel1Type: "Municipality (Castello)",
    subdivisionType: "Curazie (Parish)",
    divisions: [
      "Acquaviva", "Borgo Maggiore", "Chiesanuova", "Domagnano", "Faetano", "Fiorentino",
      "Montegiardino", "San Marino", "Serravalle"
    ],
  },
  // 150. São Tomé and Príncipe
  {
    country: "São Tomé and Príncipe",
    flag: "🇸🇹",
    code: "ST",
    adminLevel1Type: "District / Autonomous Region",
    subdivisionType: "Locality",
    divisions: ["Água Grande", "Cantagalo", "Caué", "Lembá", "Lobata", "Mé-Zóchi", "Príncipe"],
  },
  // 151. Saudi Arabia
  {
    country: "Saudi Arabia",
    flag: "🇸🇦",
    code: "SA",
    adminLevel1Type: "Province (Mintaqah)",
    subdivisionType: "Governorate (Muhafazah)",
    divisions: [
      "Riyadh", "Makkah", "Madinah", "Eastern Province", "Qassim", "Asir", "Tabuk",
      "Hail", "Northern Borders", "Jazan", "Najran", "Al Bahah", "Al Jawf"
    ],
  },
  // 152. Senegal
  {
    country: "Senegal",
    flag: "🇸🇳",
    code: "SN",
    adminLevel1Type: "Region",
    subdivisionType: "Department",
    divisions: [
      "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda", "Louga",
      "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor"
    ],
  },
  // 153. Serbia
  {
    country: "Serbia",
    flag: "🇷🇸",
    code: "RS",
    adminLevel1Type: "Statistical Region / Province",
    subdivisionType: "District / Municipality",
    divisions: [
      "Belgrade", "Vojvodina", "Šumadija and Western Serbia", "Southern and Eastern Serbia", "Kosovo and Metohija"
    ],
  },
  // 154. Seychelles
  {
    country: "Seychelles",
    flag: "🇸🇨",
    code: "SC",
    adminLevel1Type: "District",
    subdivisionType: "Sub-district",
    divisions: [
      "Anse Aux Pins", "Anse Boileau", "Anse Etoile", "Anse Royale", "Au Cap", "Baie Lazare",
      "Baie Sainte Anne", "Beau Vallon", "Bel Air", "Bel Ombre", "Cascade", "Glacis",
      "Grand'Anse Mahé", "Grand'Anse Praslin", "La Digue", "La Rivière Anglaise", "Mont Buxton",
      "Mont Fleuri", "Plaisance", "Pointe La Rue", "Port Glaud", "Roche Caiman", "Saint Louis", "Takamaka"
    ],
  },
  // 155. Sierra Leone
  {
    country: "Sierra Leone",
    flag: "🇸🇱",
    code: "SL",
    adminLevel1Type: "Province / Area",
    subdivisionType: "District",
    divisions: ["Eastern", "Northern", "North Western", "Southern", "Western Area"],
  },
  // 156. Singapore
  {
    country: "Singapore",
    flag: "🇸🇬",
    code: "SG",
    adminLevel1Type: "Planning Region",
    subdivisionType: "Planning Area / Subzone",
    divisions: ["Central Region", "East Region", "North Region", "North-East Region", "West Region"],
  },
  // 157. Slovakia
  {
    country: "Slovakia",
    flag: "🇸🇰",
    code: "SK",
    adminLevel1Type: "Region (Kraj)",
    subdivisionType: "District (Okres)",
    divisions: ["Bratislava", "Trnava", "Trenčín", "Nitra", "Žilina", "Banská Bystrica", "Prešov", "Košice"],
  },
  // 158. Slovenia
  {
    country: "Slovenia",
    flag: "🇸🇮",
    code: "SI",
    adminLevel1Type: "Statistical Region",
    subdivisionType: "Municipality",
    divisions: [
      "Pomurska", "Podravska", "Koroška", "Savinjska", "Zasavska", "Posavska",
      "Jugovzhodna Slovenija", "Osrednjeslovenska", "Gorenjska", "Primorsko-notranjska",
      "Goriška", "Obalno-kraška"
    ],
  },
  // 159. Solomon Islands
  {
    country: "Solomon Islands",
    flag: "🇸🇧",
    code: "SB",
    adminLevel1Type: "Province / Capital Territory",
    subdivisionType: "Ward",
    divisions: [
      "Central", "Choiseul", "Guadalcanal", "Isabel", "Makira-Ulawa", "Malaita",
      "Rennell and Bellona", "Temotu", "Western", "Honiara"
    ],
  },
  // 160. Somalia
  {
    country: "Somalia",
    flag: "🇸🇴",
    code: "SO",
    adminLevel1Type: "Region (Gobol)",
    subdivisionType: "District",
    divisions: [
      "Awdal", "Bakool", "Banaadir", "Bari", "Bay", "Galguduud", "Gedo", "Hiiraan",
      "Lower Juba", "Lower Shabelle", "Middle Juba", "Middle Shabelle", "Mudug",
      "Nugaal", "Sanaag", "Sool", "Togdheer", "Woqooyi Galbeed"
    ],
  },
  // 161. South Africa
  {
    country: "South Africa",
    flag: "🇿🇦",
    code: "ZA",
    adminLevel1Type: "Province",
    subdivisionType: "District / Metropolitan Municipality",
    divisions: [
      "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
      "Mpumalanga", "Northern Cape", "North West", "Western Cape"
    ],
  },
  // 162. South Korea
  {
    country: "South Korea",
    flag: "🇰🇷",
    code: "KR",
    adminLevel1Type: "Province / Metropolitan City",
    subdivisionType: "District / County (Gu/Gun)",
    divisions: [
      "Seoul", "Busan", "Daegu", "Incheon", "Gwangju", "Daejeon", "Ulsan", "Sejong",
      "Gyeonggi", "Gangwon", "North Chungcheong", "South Chungcheong", "North Jeolla",
      "South Jeolla", "North Gyeongsang", "South Gyeongsang", "Jeju"
    ],
  },
  // 163. South Sudan
  {
    country: "South Sudan",
    flag: "🇸🇸",
    code: "SS",
    adminLevel1Type: "State / Administrative Area",
    subdivisionType: "County",
    divisions: [
      "Central Equatoria", "Eastern Equatoria", "Western Equatoria", "Jonglei", "Lakes",
      "Northern Bahr el Ghazal", "Western Bahr el Ghazal", "Unity", "Upper Nile", "Warrap",
      "Abyei Administrative Area", "Pibor Administrative Area", "Ruweng Administrative Area"
    ],
  },
  // 164. Spain
  {
    country: "Spain",
    flag: "🇪🇸",
    code: "ES",
    adminLevel1Type: "Autonomous Community / City",
    subdivisionType: "Province / Municipality",
    divisions: [
      "Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands",
      "Cantabria", "Castile and León", "Castile-La Mancha", "Catalonia", "Extremadura", "Galicia",
      "La Rioja", "Madrid", "Murcia", "Navarre", "Valencian Community", "Ceuta", "Melilla"
    ],
  },
  // 165. Sri Lanka
  {
    country: "Sri Lanka",
    flag: "🇱🇰",
    code: "LK",
    adminLevel1Type: "Province",
    subdivisionType: "District",
    divisions: [
      "Central", "Eastern", "North Central", "Northern", "North Western",
      "Sabaragamuwa", "Southern", "Uva", "Western"
    ],
  },
  // 166. Sudan
  {
    country: "Sudan",
    flag: "🇸🇩",
    code: "SD",
    adminLevel1Type: "State (Wilayah)",
    subdivisionType: "District",
    divisions: [
      "Blue Nile", "Central Darfur", "Central Region", "East Darfur", "Gedaref", "Gezira",
      "Kassala", "Khartoum", "North Darfur", "North Kordofan", "Northern", "Red Sea",
      "River Nile", "Sennar", "South Darfur", "South Kordofan", "West Darfur", "West Kordofan", "White Nile"
    ],
  },
  // 167. Suriname
  {
    country: "Suriname",
    flag: "🇸🇷",
    code: "SR",
    adminLevel1Type: "District",
    subdivisionType: "Ressort",
    divisions: [
      "Brokopondo", "Commewijne", "Coronie", "Marowijne", "Nickerie", "Para",
      "Paramaribo", "Saramacca", "Sipaliwini", "Wanica"
    ],
  },
  // 168. Sweden
  {
    country: "Sweden",
    flag: "🇸🇪",
    code: "SE",
    adminLevel1Type: "County (Län)",
    subdivisionType: "Municipality (Kommun)",
    divisions: [
      "Blekinge", "Dalarna", "Gävleborg", "Gotland", "Halland", "Jämtland", "Jönköping",
      "Kalmar", "Kronoberg", "Norrbotten", "Örebro", "Östergötland", "Skåne", "Södermanland",
      "Stockholm", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland"
    ],
  },
  // 169. Switzerland
  {
    country: "Switzerland",
    flag: "🇨🇭",
    code: "CH",
    adminLevel1Type: "Canton",
    subdivisionType: "District / Municipality",
    divisions: [
      "Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft",
      "Basel-Stadt", "Bern", "Fribourg", "Geneva", "Glarus", "Graubünden", "Jura",
      "Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn",
      "St. Gallen", "Thurgau", "Ticino", "Uri", "Valais", "Vaud", "Zug", "Zürich"
    ],
  },
  // 170. Syria
  {
    country: "Syria",
    flag: "🇸🇾",
    code: "SY",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "District (Mantiqah)",
    divisions: [
      "Damascus", "Rif Dimashq", "Aleppo", "Homs", "Hama", "Latakia", "Tartus",
      "Idlib", "Raqqa", "Deir ez-Zor", "Hasakah", "Daraa", "As-Suwayda", "Quneitra"
    ],
  },
  // 171. Tajikistan
  {
    country: "Tajikistan",
    flag: "🇹🇯",
    code: "TJ",
    adminLevel1Type: "Region (Viloyat) / Capital",
    subdivisionType: "District (Nohiya)",
    divisions: [
      "Dushanbe", "Gorno-Badakhshan", "Khatlon", "Sughd", "Districts of Republican Subordination"
    ],
  },
  // 172. Tanzania
  {
    country: "Tanzania",
    flag: "🇹🇿",
    code: "TZ",
    adminLevel1Type: "Region",
    subdivisionType: "District",
    divisions: [
      "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi", "Kigoma",
      "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Morogoro", "Mtwara", "Mwanza",
      "Njombe", "Pemba North", "Pemba South", "Pwani", "Rukwa", "Ruvuma", "Shinyanga",
      "Simiyu", "Singida", "Songwe", "Tabora", "Tanga", "Zanzibar North", "Zanzibar South", "Zanzibar Urban/West"
    ],
  },
  // 173. Thailand
  {
    country: "Thailand",
    flag: "🇹🇭",
    code: "TH",
    adminLevel1Type: "Province (Changwat) / Special Area",
    subdivisionType: "District (Amphoe)",
    divisions: [
      "Bangkok", "Amnat Charoen", "Ang Thong", "Bueng Kan", "Buriram", "Chachoengsao", "Chai Nat",
      "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chon Buri", "Chumphon", "Kalasin",
      "Kamphaeng Phet", "Kanchanaburi", "Khon Kaen", "Krabi", "Lampang", "Lamphun", "Loei",
      "Lopburi", "Mae Hong Son", "Maha Sarakham", "Mukdahan", "Nakhon Nayok", "Nakhon Pathom",
      "Nakhon Phanom", "Nakhon Ratchasima", "Nakhon Sawan", "Nakhon Si Thammarat", "Nan",
      "Narathiwat", "Nong Bua Lamphu", "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani",
      "Phang Nga", "Phatthalung", "Phayao", "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok",
      "Phra Nakhon Si Ayutthaya", "Phuket", "Prachin Buri", "Prachuap Khiri Khan", "Ranong",
      "Ratchaburi", "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan", "Samut Sakhon",
      "Samut Songkhram", "Saraburi", "Satun", "Sing Buri", "Sisaket", "Songkhla", "Sukhothai",
      "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat", "Ubon Ratchathani", "Udon Thani",
      "Uthai Thani", "Uttaradit", "Yala", "Yasothon"
    ],
  },
  // 174. Timor-Leste
  {
    country: "Timor-Leste",
    flag: "🇹🇱",
    code: "TL",
    adminLevel1Type: "Municipality",
    subdivisionType: "Administrative Post",
    divisions: [
      "Aileu", "Ainaro", "Baucau", "Bobonaro", "Covalima", "Dili", "Ermera",
      "Lautém", "Liquiçá", "Manatuto", "Manufahi", "Oecusse", "Viqueque"
    ],
  },
  // 175. Togo
  {
    country: "Togo",
    flag: "🇹🇬",
    code: "TG",
    adminLevel1Type: "Region / Capital Area",
    subdivisionType: "Prefecture",
    divisions: ["Centrale", "Kara", "Maritime", "Plateaux", "Savanes", "Grand Lomé"],
  },
  // 176. Tonga
  {
    country: "Tonga",
    flag: "🇹🇴",
    code: "TO",
    adminLevel1Type: "Island Division",
    subdivisionType: "District",
    divisions: ["'Eua", "Ha'apai", "Niuas", "Tongatapu", "Vava'u"],
  },
  // 177. Trinidad and Tobago
  {
    country: "Trinidad and Tobago",
    flag: "🇹🇹",
    code: "TT",
    adminLevel1Type: "Regional Corporation / Municipality",
    subdivisionType: "Community",
    divisions: [
      "Couva-Tabaquite-Talparo", "Diego Martin", "Eastern Tobago", "Penal-Debe", "Point Fortin",
      "Princes Town", "Rio Claro-Mayaro", "San Fernando", "San Juan-Laventille", "Sangre Grande",
      "Siparia", "Tunapuna-Piarco", "Port of Spain", "Chaguanas", "Arima", "Western Tobago"
    ],
  },
  // 178. Tunisia
  {
    country: "Tunisia",
    flag: "🇹🇳",
    code: "TN",
    adminLevel1Type: "Governorate (Wilayah)",
    subdivisionType: "Delegation (Mutamadiyah)",
    divisions: [
      "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", "Kairouan",
      "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", "Monastir", "Nabeul",
      "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
    ],
  },
  // 179. Türkiye
  {
    country: "Türkiye",
    flag: "🇹🇷",
    code: "TR",
    adminLevel1Type: "Province (İl)",
    subdivisionType: "District (İlçe)",
    divisions: [
      "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
      "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik",
      "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
      "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep",
      "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "Istanbul", "İzmir",
      "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale",
      "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin",
      "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya",
      "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon",
      "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
    ],
  },
  // 180. Turkmenistan
  {
    country: "Turkmenistan",
    flag: "🇹🇲",
    code: "TM",
    adminLevel1Type: "Region (Welayat) / City",
    subdivisionType: "District (Etrap)",
    divisions: ["Ahal", "Balkan", "Daşoguz", "Lebap", "Mary", "Ashgabat"],
  },
  // 181. Tuvalu
  {
    country: "Tuvalu",
    flag: "🇹🇻",
    code: "TV",
    adminLevel1Type: "Island Council",
    subdivisionType: "Village",
    divisions: [
      "Funafuti", "Nanumea", "Nanumaga", "Niutao", "Nui", "Vaitupu", "Nukufetau", "Nukulaelae"
    ],
  },
  // 182. Uganda
  {
    country: "Uganda",
    flag: "🇺🇬",
    code: "UG",
    adminLevel1Type: "Region",
    subdivisionType: "District",
    divisions: ["Central", "Eastern", "Northern", "Western"],
  },
  // 183. Ukraine
  {
    country: "Ukraine",
    flag: "🇺🇦",
    code: "UA",
    adminLevel1Type: "Oblast / Autonomous Republic / City",
    subdivisionType: "Raion (District)",
    divisions: [
      "Cherkasy", "Chernihiv", "Chernivtsi", "Dnipropetrovsk", "Donetsk", "Ivano-Frankivsk",
      "Kharkiv", "Kherson", "Khmelnytskyi", "Kyiv", "Kirovohrad", "Luhansk", "Lviv", "Mykolaiv",
      "Odesa", "Poltava", "Rivne", "Sumy", "Ternopil", "Vinnytsia", "Volyn", "Zakarpattia",
      "Zaporizhzhia", "Zhytomyr", "Crimea", "Kyiv City", "Sevastopol"
    ],
  },
  // 184. United Arab Emirates
  {
    country: "United Arab Emirates",
    flag: "🇦🇪",
    code: "AE",
    adminLevel1Type: "Emirate",
    subdivisionType: "Sector / Municipality",
    divisions: ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"],
  },
  // 185. United Kingdom
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    code: "GB",
    adminLevel1Type: "Country / Division",
    subdivisionType: "County / Borough / Council Area",
    divisions: ["England", "Scotland", "Wales", "Northern Ireland"],
  },
  // 186. United States
  {
    country: "United States",
    flag: "🇺🇸",
    code: "US",
    adminLevel1Type: "State / Federal District",
    subdivisionType: "County / Borough / Parish",
    divisions: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming", "District of Columbia"
    ],
  },
  // 187. Uruguay
  {
    country: "Uruguay",
    flag: "🇺🇾",
    code: "UY",
    adminLevel1Type: "Department",
    subdivisionType: "Municipality",
    divisions: [
      "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores", "Florida",
      "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Río Negro", "Rivera", "Rocha",
      "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
    ],
  },
  // 188. Uzbekistan
  {
    country: "Uzbekistan",
    flag: "🇺🇿",
    code: "UZ",
    adminLevel1Type: "Region (Viloyat) / Republic / City",
    subdivisionType: "District (Tuman)",
    divisions: [
      "Andijan", "Bukhara", "Fergana", "Jizzakh", "Khorezm", "Namangan", "Navoiy",
      "Qashqadaryo", "Karakalpakstan", "Samarkand", "Sirdaryo", "Surxondaryo", "Tashkent Region", "Tashkent City"
    ],
  },
  // 189. Vanuatu
  {
    country: "Vanuatu",
    flag: "🇻🇺",
    code: "VU",
    adminLevel1Type: "Province",
    subdivisionType: "Municipality",
    divisions: ["Malampa", "Penama", "Sanma", "Shefa", "Tafea", "Torba"],
  },
  // 190. Vatican City
  {
    country: "Vatican City",
    flag: "🇻🇦",
    code: "VA",
    adminLevel1Type: "City State",
    subdivisionType: "Sector",
    divisions: ["Vatican City"],
  },
  // 191. Venezuela
  {
    country: "Venezuela",
    flag: "🇻🇪",
    code: "VE",
    adminLevel1Type: "State / Capital District / Dependency",
    subdivisionType: "Municipality",
    divisions: [
      "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes",
      "Delta Amacuro", "Falcón", "Guárico", "La Guaira", "Lara", "Mérida", "Miranda", "Monagas",
      "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Yaracuy", "Zulia",
      "Capital District", "Federal Dependencies"
    ],
  },
  // 192. Vietnam
  {
    country: "Vietnam",
    flag: "🇻🇳",
    code: "VN",
    adminLevel1Type: "Province / Municipality",
    subdivisionType: "District / Ward",
    divisions: [
      "An Giang", "Ba Ria-Vung Tau", "Bac Giang", "Bac Kan", "Bac Lieu", "Bac Ninh", "Ben Tre",
      "Binh Dinh", "Binh Duong", "Binh Phuoc", "Binh Thuan", "Ca Mau", "Cao Bang", "Da Nang",
      "Dak Lak", "Dak Nong", "Dien Bien", "Dong Nai", "Dong Thap", "Gia Lai", "Ha Giang",
      "Ha Nam", "Ha Noi", "Ha Tinh", "Hai Duong", "Hai Phong", "Hau Giang", "Hoa Binh",
      "Hung Yen", "Khanh Hoa", "Kien Giang", "Kon Tum", "Lai Chau", "Lam Dong", "Lang Son",
      "Lao Cai", "Long An", "Nam Dinh", "Nghe An", "Ninh Binh", "Ninh Thuan", "Phu Tho",
      "Phu Yen", "Quang Binh", "Quang Nam", "Quang Ngai", "Quang Ninh", "Quang Tri", "Soc Trang",
      "Son La", "Tay Ninh", "Thai Binh", "Thai Nguyen", "Thanh Hoa", "Thua Thien Hue",
      "Tien Giang", "Tra Vinh", "Tuyen Quang", "Vinh Long", "Vinh Phuc", "Yen Bai", "Ho Chi Minh City", "Can Tho"
    ],
  },
  // 193. Yemen
  {
    country: "Yemen",
    flag: "🇾🇪",
    code: "YE",
    adminLevel1Type: "Governorate (Muhafazah)",
    subdivisionType: "District (Mudiriyah)",
    divisions: [
      "Abyan", "Aden", "Amran", "Al Bayda", "Ad Dali'", "Dhamar", "Hadramaut", "Hajjah",
      "Al Hudaydah", "Ibb", "Al Jawf", "Lahij", "Marib", "Raymah", "Saada", "Sana'a",
      "Shabwah", "Socotra", "Taiz", "Amanat Al Asimah"
    ],
  },
  // 194. Zambia
  {
    country: "Zambia",
    flag: "🇿🇲",
    code: "ZM",
    adminLevel1Type: "Province",
    subdivisionType: "District",
    divisions: [
      "Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga", "Northern", "North-Western", "Southern", "Western"
    ],
  },
  // 195. Zimbabwe
  {
    country: "Zimbabwe",
    flag: "🇿🇼",
    code: "ZW",
    adminLevel1Type: "Province",
    subdivisionType: "District",
    divisions: [
      "Bulawayo", "Harare", "Manicaland", "Mashonaland Central", "Mashonaland East",
      "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"
    ],
  },
];

// Helper functions for global and country-specific resolution
export function getCountryAdminConfig(countryName: string): CountryAdminDivision {
  if (!countryName) return COUNTRY_ADMIN_DIVISIONS[57]; // Default to Ethiopia
  const norm = countryName.trim().toLowerCase();
  const found = COUNTRY_ADMIN_DIVISIONS.find(
    (c) => c.country.toLowerCase() === norm || c.code.toLowerCase() === norm
  );
  if (found) return found;

  return {
    country: countryName,
    flag: "🌐",
    code: "OTHER",
    adminLevel1Type: "State / Province / Region",
    subdivisionType: "District / Sub-city / Area",
    divisions: [],
  };
}

export function getAdminLevel1Label(countryName: string): string {
  const config = getCountryAdminConfig(countryName);
  return config.adminLevel1Type || "Region / State / Province";
}

export function getAdminSubdivisionLabel(countryName: string): string {
  const config = getCountryAdminConfig(countryName);
  return config.subdivisionType || "Sub-City / District / Area";
}

export function getAdminLevel1Divisions(countryName: string): { name: string; type?: string; subdivisions?: string[] }[] {
  const config = getCountryAdminConfig(countryName);
  return config.divisions.map((d) => {
    if (typeof d === "string") {
      return { name: d };
    }
    return d;
  });
}
