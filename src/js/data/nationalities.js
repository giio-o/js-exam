/**
 * A broad, alphabetical list of nationality/demonym labels used to power
 * the "Browse by Cuisine" pill row (mirrors the reference site's long,
 * horizontally-scrolling cuisine filter). Clicking a pill filters recipes
 * via TheMealDB's filter.php?a= (area) endpoint - since TheMealDB only has
 * real recipes for ~28 areas, most pills will correctly show an empty
 * state, same as querying an area MealDB has no data for.
 */
export const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "Andorran", "Angolan",
  "Antiguan, Barbudan", "Argentine", "Armenian", "Aruban", "Australian",
  "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi",
  "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese",
  "Bhutanese", "Bolivian", "Bosnian, Herzegovinian", "Botswanan", "Brazilian",
  "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese",
  "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean",
  "Chadian", "Chilean", "Chinese", "Colombian", "Comoran",
  "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot",
  "Czech", "Danish", "Djiboutian", "Dominican", "Dutch",
  "Ecuadorian", "Egyptian", "Emirati", "English", "Equatorial Guinean",
  "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino",
  "Finnish", "French", "Gabonese", "Gambian", "Georgian",
  "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan",
  "Guinean", "Guyanese", "Haitian", "Honduran", "Hungarian",
  "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi",
  "Irish", "Israeli", "Italian", "Ivorian", "Jamaican",
  "Japanese", "Jordanian", "Kazakhstani", "Kenyan", "Korean",
  "Kuwaiti", "Kyrgyz", "Lao", "Latvian", "Lebanese",
  "Liberian", "Libyan", "Lithuanian", "Luxembourgish", "Macedonian",
  "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian",
  "Maltese", "Mauritanian", "Mauritian", "Mexican", "Moldovan",
  "Monacan", "Mongolian", "Moroccan", "Mozambican", "Namibian",
  "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien",
  "Norwegian", "Omani", "Pakistani", "Panamanian", "Papua New Guinean",
  "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari",
  "Romanian", "Russian", "Rwandan", "Salvadoran", "Samoan",
  "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois",
  "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Somali",
  "South African", "Spanish", "Sri Lankan", "Sudanese", "Surinamese",
  "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese",
  "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan",
  "Trinidadian, Tobagonian", "Tunisian", "Turkish", "Turkmen", "Ugandan",
  "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese",
  "Welsh", "Yemeni", "Zambian", "Zimbabwean",
];
