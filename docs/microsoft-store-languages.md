# Microsoft Store language checklist

Map of the **partner.microsoft.com** language checkboxes to the locales shipped in this app.
Tick the boxes marked ☑ — those resolve to a dictionary in `src/i18n/`. Leave ☐ unticked.

**697 of 830 entries are supported**, covering **73 app locales**.

> Regional variants of the same language (e.g. every `English (…)` row) all resolve to one dictionary, so all of them are ticked. If the portal allows, ticking the plain base-language entry is sufficient — the app does not distinguish regions beyond the variants listed under “App locale” below.

> **RTL languages are intentionally excluded** (Arabic, Hebrew, Persian/Farsi, Urdu, Uyghur, Dari, and Arabic-script variants such as Punjabi (Arabic)). Only LTR locales are shipped.

## Fastest way to do this

Paste `docs/microsoft-store-languages-autotick.js` into the DevTools Console on the partner-site language picker, then run `__esuyoTick.preview()` and `__esuyoTick.tick()`. It ticks every supported box in one pass and reports anything it could not find. Scroll the whole list into view first if the page virtualizes rows. `__esuyoTick.untick()` reverses it.

If you would rather do it manually, tick the entries below. Plain language names cover their regional variants; the four script/region-specific entries at the end are needed because they map to a different (or the only supported) dictionary.

- [ ] Afrikaans
- [ ] Albanian
- [ ] Amharic
- [ ] Armenian
- [ ] Azerbaijani (Latin)
- [ ] Bangla
- [ ] Basque
- [ ] Belarusian
- [ ] Bosnian
- [ ] Bulgarian
- [ ] Catalan
- [ ] Chinese
- [ ] Chinese (Traditional)
- [ ] Croatian
- [ ] Czech
- [ ] Danish
- [ ] Dutch
- [ ] English
- [ ] Estonian
- [ ] Filipino
- [ ] Finnish
- [ ] French
- [ ] Galician
- [ ] Georgian
- [ ] German
- [ ] Greek
- [ ] Gujarati
- [ ] Hindi
- [ ] Hungarian
- [ ] Icelandic
- [ ] Indonesian
- [ ] Irish
- [ ] isiZulu
- [ ] Italian
- [ ] Japanese
- [ ] Kannada
- [ ] Kazakh
- [ ] Khmer
- [ ] Kiswahili
- [ ] Korean
- [ ] Kyrgyz
- [ ] Lao
- [ ] Latvian
- [ ] Lithuanian
- [ ] Luxembourgish
- [ ] Macedonian
- [ ] Malay
- [ ] Malayalam
- [ ] Maltese
- [ ] Marathi
- [ ] Mongolian
- [ ] Nepali
- [ ] North Macedonia
- [ ] Norwegian
- [ ] Polish
- [ ] Portuguese
- [ ] Portuguese (Brazil)
- [ ] Punjabi
- [ ] Romanian
- [ ] Russian
- [ ] Serbian
- [ ] Sinhala
- [ ] Slovak
- [ ] Slovenian
- [ ] Spanish
- [ ] Swedish
- [ ] Tamil
- [ ] Telugu
- [ ] Thai
- [ ] Turkish
- [ ] Ukrainian
- [ ] Uzbek
- [ ] Valencian
- [ ] Vietnamese
- [ ] Welsh

## Checklist

| Select | Microsoft Partner Center entry | App locale |
| :---: | --- | --- |
| ☑ | Afrikaans | `af` |
| ☑ | Afrikaans (South Africa) | `af` |
| ☑ | Albanian | `sq` |
| ☑ | Albanian (Albania) | `sq` |
| ☑ | Amharic | `am` |
| ☑ | Amharic (Ethiopia) | `am` |
| ☐ | Arabic | — |
| ☐ | Arabic (Algeria) | — |
| ☐ | Arabic (Bahrain) | — |
| ☐ | Arabic (Egypt) | — |
| ☐ | Arabic (Iraq) | — |
| ☐ | Arabic (Israel) | — |
| ☐ | Arabic (Jordan) | — |
| ☐ | Arabic (Kuwait) | — |
| ☐ | Arabic (Lebanon) | — |
| ☐ | Arabic (Libya) | — |
| ☐ | Arabic (Mauritania) | — |
| ☐ | Arabic (Morocco) | — |
| ☐ | Arabic (Oman) | — |
| ☐ | Arabic (Palestinian Authority) | — |
| ☐ | Arabic (Qatar) | — |
| ☐ | Arabic (Saudi Arabia) | — |
| ☐ | Arabic (Syria) | — |
| ☐ | Arabic (Tunisia) | — |
| ☐ | Arabic (United Arab Emirates) | — |
| ☐ | Arabic (Western Sahara (Disputed)) | — |
| ☐ | Arabic (Yemen) | — |
| ☑ | Armenian | `hy` |
| ☑ | Armenian (Armenia) | `hy` |
| ☐ | Assamese | — |
| ☐ | Assamese (India) | — |
| ☐ | Azerbaijani | — |
| ☐ | Azerbaijani (Arabic) | — |
| ☐ | Azerbaijani (Arabic) (Azerbaijan) | — |
| ☐ | Azerbaijani (Cyrillic) | — |
| ☐ | Azerbaijani (Cyrillic) (Azerbaijan) | — |
| ☑ | Azerbaijani (Latin) | `az` |
| ☑ | Azerbaijani (Latin) (Azerbaijan) | `az` |
| ☑ | Bangla | `bn` |
| ☑ | Bangla (Bangladesh) | `bn` |
| ☑ | Bangla (India) | `bn` |
| ☑ | Bangla (Pakistan) | `bn` |
| ☑ | Basque | `eu` |
| ☑ | Basque (Basque) | `eu` |
| ☑ | Belarusian | `be` |
| ☑ | Belarusian (Belarus) | `be` |
| ☑ | Bosnian | `bs` |
| ☐ | Bosnian (Cyrillic) | — |
| ☐ | Bosnian (Cyrillic) (Bosnia and Herzegovina) | — |
| ☑ | Bosnian (Latin) | `bs` |
| ☑ | Bosnian (Latin) (Bosnia and Herzegovina) | `bs` |
| ☑ | Bulgarian | `bg` |
| ☑ | Bulgarian (Bulgaria) | `bg` |
| ☐ | Cajun French | — |
| ☐ | Cajun French (Latin) | — |
| ☑ | Catalan | `ca` |
| ☑ | Catalan (Spain) | `ca` |
| ☐ | Cherokee | — |
| ☐ | Cherokee (Cherokee) | — |
| ☐ | Cherokee (Cherokee) (United States) | — |
| ☐ | Cherokee (Latin) | — |
| ☐ | Cherokee (United States) | — |
| ☑ | Chinese | `zh-CN` |
| ☑ | Chinese (China) | `zh-CN` |
| ☑ | Chinese (Hong Kong SAR) | `zh-TW` |
| ☑ | Chinese (Macao SAR) | `zh-TW` |
| ☑ | Chinese (Simplified) | `zh-CN` |
| ☑ | Chinese (Simplified) (China) | `zh-CN` |
| ☑ | Chinese (Simplified) (Singapore) | `zh-CN` |
| ☑ | Chinese (Singapore) | `zh-CN` |
| ☑ | Chinese (Taiwan) | `zh-TW` |
| ☑ | Chinese (Traditional) | `zh-TW` |
| ☑ | Chinese (Traditional) (Hong Kong) | `zh-TW` |
| ☑ | Chinese (Traditional) (Macao SAR) | `zh-TW` |
| ☑ | Chinese (Traditional) (Taiwan) | `zh-TW` |
| ☑ | Croatian | `hr` |
| ☑ | Croatian (Bosnia and Herzegovina) | `hr` |
| ☑ | Croatian (Croatia) | `hr` |
| ☑ | Czech | `cs` |
| ☑ | Czech (Czech Republic) | `cs` |
| ☑ | Danish | `da` |
| ☑ | Danish (Denmark) | `da` |
| ☐ | Dari | — |
| ☐ | Dari (Afghanistan) | — |
| ☐ | Dari (Arabic) | — |
| ☑ | Dutch | `nl` |
| ☑ | Dutch (Belgium) | `nl` |
| ☑ | Dutch (Netherlands) | `nl` |
| ☑ | English | `en` |
| ☑ | English (Afghanistan) | `en` |
| ☑ | English (Åland Islands) | `en` |
| ☑ | English (Albania) | `en` |
| ☑ | English (Algeria) | `en` |
| ☑ | English (American Samoa) | `en` |
| ☑ | English (Andorra) | `en` |
| ☑ | English (Angola) | `en` |
| ☑ | English (Anguilla) | `en` |
| ☑ | English (Antarctica) | `en` |
| ☑ | English (Antigua and Barbuda) | `en` |
| ☑ | English (Armenia) | `en` |
| ☑ | English (Aruba) | `en` |
| ☑ | English (Australia and New Zealand) | `en` |
| ☑ | English (Australia) | `en` |
| ☑ | English (Azerbaijan) | `en` |
| ☑ | English (Bahamas) | `en` |
| ☑ | English (Bangladesh) | `en` |
| ☑ | English (Barbados) | `en` |
| ☑ | English (Belarus) | `en` |
| ☑ | English (Belize) | `en` |
| ☑ | English (Benin) | `en` |
| ☑ | English (Bermuda) | `en` |
| ☑ | English (Bhutan) | `en` |
| ☑ | English (Bolivia) | `en` |
| ☑ | English (Bonaire, Saint Eustatius and Saba) | `en` |
| ☑ | English (Bosnia and Herzegovina) | `en` |
| ☑ | English (Botswana) | `en` |
| ☑ | English (Bouvet Island) | `en` |
| ☑ | English (British Indian Ocean Territory) | `en` |
| ☑ | English (British Virgin Islands) | `en` |
| ☑ | English (Brunei) | `en` |
| ☑ | English (Bulgaria) | `en` |
| ☑ | English (Burkina Faso) | `en` |
| ☑ | English (Burundi) | `en` |
| ☑ | English (Cambodia) | `en` |
| ☑ | English (Cameroon) | `en` |
| ☑ | English (Canada) | `en` |
| ☑ | English (Cape Verde) | `en` |
| ☑ | English (Caribbean) | `en` |
| ☑ | English (Cayman Islands) | `en` |
| ☑ | English (Central African Republic) | `en` |
| ☑ | English (Chad) | `en` |
| ☑ | English (Christmas Island) | `en` |
| ☑ | English (Cocos (Keeling) Islands) | `en` |
| ☑ | English (Comoros) | `en` |
| ☑ | English (Congo (DRC)) | `en` |
| ☑ | English (Congo) | `en` |
| ☑ | English (Cook Islands) | `en` |
| ☑ | English (Côte d'Ivoire) | `en` |
| ☑ | English (Croatia) | `en` |
| ☑ | English (Curaçao) | `en` |
| ☑ | English (Czech Republic) | `en` |
| ☑ | English (Djibouti) | `en` |
| ☑ | English (Dominica) | `en` |
| ☑ | English (Dominican Republic) | `en` |
| ☑ | English (Eastern Africa) | `en` |
| ☑ | English (Equatorial Guinea) | `en` |
| ☑ | English (Eritrea) | `en` |
| ☑ | English (Estonia) | `en` |
| ☑ | English (Ethiopia) | `en` |
| ☑ | English (Falkland Islands (Islas Malvinas)) | `en` |
| ☑ | English (Faroe Islands) | `en` |
| ☑ | English (Fiji) | `en` |
| ☑ | English (French Guiana) | `en` |
| ☑ | English (French Polynesia) | `en` |
| ☑ | English (French Southern and Antarctic Lands) | `en` |
| ☑ | English (Gabon) | `en` |
| ☑ | English (Gambia, The) | `en` |
| ☑ | English (Georgia) | `en` |
| ☑ | English (Germany) | `en` |
| ☑ | English (Ghana) | `en` |
| ☑ | English (Gibraltar) | `en` |
| ☑ | English (Greece) | `en` |
| ☑ | English (Greenland) | `en` |
| ☑ | English (Guadeloupe) | `en` |
| ☑ | English (Guam) | `en` |
| ☑ | English (Guernsey) | `en` |
| ☑ | English (Guinea) | `en` |
| ☑ | English (Guinea-Bissau) | `en` |
| ☑ | English (Guyana) | `en` |
| ☑ | English (Haiti) | `en` |
| ☑ | English (Heard Island and McDonald Islands) | `en` |
| ☑ | English (Honduras) | `en` |
| ☑ | English (Hong Kong SAR) | `en` |
| ☑ | English (Hungary) | `en` |
| ☑ | English (Iceland) | `en` |
| ☑ | English (India) | `en` |
| ☑ | English (Indonesia) | `en` |
| ☑ | English (Iraq) | `en` |
| ☑ | English (Ireland) | `en` |
| ☑ | English (Isle of Man) | `en` |
| ☑ | English (Israel) | `en` |
| ☑ | English (Jamaica) | `en` |
| ☑ | English (Jersey) | `en` |
| ☑ | English (Jordan) | `en` |
| ☑ | English (Kazakhstan) | `en` |
| ☑ | English (Kenya) | `en` |
| ☑ | English (Kiribati) | `en` |
| ☑ | English (Kyrgyzstan) | `en` |
| ☑ | English (Laos) | `en` |
| ☑ | English (Latvia) | `en` |
| ☑ | English (Lesotho) | `en` |
| ☑ | English (Liberia) | `en` |
| ☑ | English (Libya) | `en` |
| ☑ | English (Lithuania) | `en` |
| ☑ | English (Macao SAR) | `en` |
| ☑ | English (Macedonia, FYRO) | `en` |
| ☑ | English (Madagascar) | `en` |
| ☑ | English (Malawi) | `en` |
| ☑ | English (Malaysia) | `en` |
| ☑ | English (Maldives) | `en` |
| ☑ | English (Mali) | `en` |
| ☑ | English (Malta) | `en` |
| ☑ | English (Marshall Islands) | `en` |
| ☑ | English (Martinique) | `en` |
| ☑ | English (Mauritius) | `en` |
| ☑ | English (Mayotte) | `en` |
| ☑ | English (Micronesia) | `en` |
| ☑ | English (Moldova) | `en` |
| ☑ | English (Monaco) | `en` |
| ☑ | English (Mongolia) | `en` |
| ☑ | English (Montserrat) | `en` |
| ☑ | English (Mozambique) | `en` |
| ☑ | English (Myanmar) | `en` |
| ☑ | English (Namibia) | `en` |
| ☑ | English (Nauru) | `en` |
| ☑ | English (Nepal) | `en` |
| ☑ | English (Netherlands Antilles (Former)) | `en` |
| ☑ | English (Netherlands) | `en` |
| ☑ | English (New Caledonia) | `en` |
| ☑ | English (New Zealand) | `en` |
| ☑ | English (Nicaragua) | `en` |
| ☑ | English (Niger) | `en` |
| ☑ | English (Nigeria) | `en` |
| ☑ | English (Niue) | `en` |
| ☑ | English (Norfolk Island) | `en` |
| ☑ | English (Northern America) | `en` |
| ☑ | English (Northern Mariana Islands) | `en` |
| ☑ | English (Oman) | `en` |
| ☑ | English (Pakistan) | `en` |
| ☑ | English (Palau) | `en` |
| ☑ | English (Palestinian Authority) | `en` |
| ☑ | English (Papua New Guinea) | `en` |
| ☑ | English (Philippines) | `en` |
| ☑ | English (Pitcairn Islands) | `en` |
| ☑ | English (Puerto Rico) | `en` |
| ☑ | English (Qatar) | `en` |
| ☑ | English (Réunion) | `en` |
| ☑ | English (Romania) | `en` |
| ☑ | English (Rwanda) | `en` |
| ☑ | English (Saint Barthélemy) | `en` |
| ☑ | English (Saint Helena, Ascension and Tristan da Cunha) | `en` |
| ☑ | English (Saint Kitts and Nevis) | `en` |
| ☑ | English (Saint Lucia) | `en` |
| ☑ | English (Saint Martin (French Part)) | `en` |
| ☑ | English (Saint Pierre and Miquelon) | `en` |
| ☑ | English (Saint Vincent and the Grenadines) | `en` |
| ☑ | English (Samoa) | `en` |
| ☑ | English (San Marino) | `en` |
| ☑ | English (São Tomé and Príncipe) | `en` |
| ☑ | English (Saudi Arabia) | `en` |
| ☑ | English (Senegal) | `en` |
| ☑ | English (Seychelles) | `en` |
| ☑ | English (Sierra Leone) | `en` |
| ☑ | English (Singapore) | `en` |
| ☑ | English (Sint Maarten (Dutch Part)) | `en` |
| ☑ | English (Slovakia) | `en` |
| ☑ | English (Slovenia) | `en` |
| ☑ | English (Solomon Islands) | `en` |
| ☑ | English (Somalia) | `en` |
| ☑ | English (South Africa) | `en` |
| ☑ | English (South Georgia and the South Sandwich Islands) | `en` |
| ☑ | English (Southern Africa) | `en` |
| ☑ | English (Sri Lanka) | `en` |
| ☑ | English (Sudan) | `en` |
| ☑ | English (Suriname) | `en` |
| ☑ | English (Svalbard and Jan Mayen) | `en` |
| ☑ | English (Swaziland) | `en` |
| ☑ | English (Tajikistan) | `en` |
| ☑ | English (Tanzania) | `en` |
| ☑ | English (Thailand) | `en` |
| ☑ | English (Timor-Leste) | `en` |
| ☑ | English (Togo) | `en` |
| ☑ | English (Tokelau) | `en` |
| ☑ | English (Tonga) | `en` |
| ☑ | English (Trinidad and Tobago) | `en` |
| ☑ | English (Türkiye) | `en` |
| ☑ | English (Turkmenistan) | `en` |
| ☑ | English (Turks and Caicos Islands) | `en` |
| ☑ | English (Tuvalu) | `en` |
| ☑ | English (U.S. Minor Outlying Islands) | `en` |
| ☑ | English (U.S. Virgin Islands) | `en` |
| ☑ | English (Uganda) | `en` |
| ☑ | English (United Arab Emirates) | `en` |
| ☑ | English (United Kingdom) | `en` |
| ☑ | English (Uzbekistan) | `en` |
| ☑ | English (Vanuatu) | `en` |
| ☑ | English (Vatican City) | `en` |
| ☑ | English (Vietnam) | `en` |
| ☑ | English (Wallis and Futuna) | `en` |
| ☑ | English (Western Africa) | `en` |
| ☑ | English (Zambia) | `en` |
| ☑ | English (Zimbabwe) | `en` |
| ☑ | Estonian | `et` |
| ☑ | Estonian (Estonia) | `et` |
| ☑ | Filipino | `fil` |
| ☑ | Filipino (Latin) | `fil` |
| ☑ | Filipino (Philippines) | `fil` |
| ☑ | Finnish | `fi` |
| ☑ | Finnish (Finland) | `fi` |
| ☐ | Franco-Provençal | — |
| ☐ | Franco-Provençal (Latin) | — |
| ☑ | French | `fr` |
| ☑ | French (Åland Islands) | `fr` |
| ☑ | French (Albania) | `fr` |
| ☑ | French (Algeria) | `fr` |
| ☑ | French (American Samoa) | `fr` |
| ☑ | French (Andorra) | `fr` |
| ☑ | French (Angola) | `fr` |
| ☑ | French (Anguilla) | `fr` |
| ☑ | French (Antarctica) | `fr` |
| ☑ | French (Antigua and Barbuda) | `fr` |
| ☑ | French (Aruba) | `fr` |
| ☑ | French (Azerbaijan) | `fr` |
| ☑ | French (Bahamas, The) | `fr` |
| ☑ | French (Barbados) | `fr` |
| ☑ | French (Belgium) | `fr` |
| ☑ | French (Belize) | `fr` |
| ☑ | French (Benin) | `fr` |
| ☑ | French (Bermuda) | `fr` |
| ☑ | French (Bhutan) | `fr` |
| ☑ | French (Bolivia) | `fr` |
| ☑ | French (Bonaire, Saint Eustatius and Saba) | `fr` |
| ☑ | French (Bosnia and Herzegovina) | `fr` |
| ☑ | French (Botswana) | `fr` |
| ☑ | French (Bouvet Island) | `fr` |
| ☑ | French (British Indian Ocean Territory) | `fr` |
| ☑ | French (British Virgin Islands) | `fr` |
| ☑ | French (Brunei) | `fr` |
| ☑ | French (Burkina Faso) | `fr` |
| ☑ | French (Burundi) | `fr` |
| ☑ | French (Cameroon) | `fr` |
| ☑ | French (Canada) | `fr` |
| ☑ | French (Cape Verde) | `fr` |
| ☑ | French (Caribbean) | `fr` |
| ☑ | French (Cayman Islands) | `fr` |
| ☑ | French (Central African Republic) | `fr` |
| ☑ | French (Chad) | `fr` |
| ☑ | French (Christmas Island) | `fr` |
| ☑ | French (Cocos (Keeling) Islands) | `fr` |
| ☑ | French (Comoros) | `fr` |
| ☑ | French (Congo (DRC)) | `fr` |
| ☑ | French (Congo) | `fr` |
| ☑ | French (Cook Islands) | `fr` |
| ☑ | French (Côte d'Ivoire) | `fr` |
| ☑ | French (Curaçao) | `fr` |
| ☑ | French (Djibouti) | `fr` |
| ☑ | French (Dominica) | `fr` |
| ☑ | French (Dominican Republic) | `fr` |
| ☑ | French (Equatorial Guinea) | `fr` |
| ☑ | French (Eritrea) | `fr` |
| ☑ | French (Falkland Islands (Islas Malvinas)) | `fr` |
| ☑ | French (Faroe Islands) | `fr` |
| ☑ | French (Fiji) | `fr` |
| ☑ | French (France) | `fr` |
| ☑ | French (French Guiana) | `fr` |
| ☑ | French (French Polynesia) | `fr` |
| ☑ | French (Gabon) | `fr` |
| ☑ | French (Gambia, The) | `fr` |
| ☑ | French (Georgia) | `fr` |
| ☑ | French (Ghana) | `fr` |
| ☑ | French (Gibraltar) | `fr` |
| ☑ | French (Greenland) | `fr` |
| ☑ | French (Grenada) | `fr` |
| ☑ | French (Guadeloupe) | `fr` |
| ☑ | French (Guam) | `fr` |
| ☑ | French (Guernsey) | `fr` |
| ☑ | French (Guinea) | `fr` |
| ☑ | French (Guinea-Bissau) | `fr` |
| ☑ | French (Guyana) | `fr` |
| ☑ | French (Haiti) | `fr` |
| ☑ | French (Heard Island and McDonald Islands) | `fr` |
| ☑ | French (Honduras) | `fr` |
| ☑ | French (Jamaica) | `fr` |
| ☑ | French (Jersey) | `fr` |
| ☑ | French (Kiribati) | `fr` |
| ☑ | French (Kyrgyzstan) | `fr` |
| ☑ | French (Laos) | `fr` |
| ☑ | French (Lesotho) | `fr` |
| ☑ | French (Liberia) | `fr` |
| ☑ | French (Libya) | `fr` |
| ☑ | French (Luxembourg) | `fr` |
| ☑ | French (Macao SAR) | `fr` |
| ☑ | French (Madagascar) | `fr` |
| ☑ | French (Malawi) | `fr` |
| ☑ | French (Maldives) | `fr` |
| ☑ | French (Mali) | `fr` |
| ☑ | French (Marshall Islands) | `fr` |
| ☑ | French (Martinique) | `fr` |
| ☑ | French (Mauritius) | `fr` |
| ☑ | French (Mayotte) | `fr` |
| ☑ | French (Micronesia) | `fr` |
| ☑ | French (Moldova) | `fr` |
| ☑ | French (Monaco) | `fr` |
| ☑ | French (Mongolia) | `fr` |
| ☑ | French (Montserrat) | `fr` |
| ☑ | French (Morocco) | `fr` |
| ☑ | French (Mozambique) | `fr` |
| ☑ | French (Myanmar) | `fr` |
| ☑ | French (Namibia) | `fr` |
| ☑ | French (Nauru) | `fr` |
| ☑ | French (New Caledonia) | `fr` |
| ☑ | French (Nicaragua) | `fr` |
| ☑ | French (Niger) | `fr` |
| ☑ | French (Niue) | `fr` |
| ☑ | French (Norfolk Island) | `fr` |
| ☑ | French (North Africa) | `fr` |
| ☑ | French (Northern America) | `fr` |
| ☑ | French (Northern Mariana Islands) | `fr` |
| ☑ | French (Palau) | `fr` |
| ☑ | French (Palestinian Authority) | `fr` |
| ☑ | French (Papua New Guinea) | `fr` |
| ☑ | French (Pitcairn Islands) | `fr` |
| ☑ | French (Réunion) | `fr` |
| ☑ | French (Rwanda) | `fr` |
| ☑ | French (Saint Barthélemy) | `fr` |
| ☑ | French (Saint Helena, Ascension and Tristan da Cunha) | `fr` |
| ☑ | French (Saint Kitts and Nevis) | `fr` |
| ☑ | French (Saint Lucia) | `fr` |
| ☑ | French (Saint Martin (French Part)) | `fr` |
| ☑ | French (Saint Pierre and Miquelon) | `fr` |
| ☑ | French (Saint Vincent and the Grenadines) | `fr` |
| ☑ | French (Samoa) | `fr` |
| ☑ | French (San Marino) | `fr` |
| ☑ | French (São Tomé and Príncipe) | `fr` |
| ☑ | French (Senegal) | `fr` |
| ☑ | French (Seychelles) | `fr` |
| ☑ | French (Sierra Leone) | `fr` |
| ☑ | French (Sint Maarten (Dutch Part)) | `fr` |
| ☑ | French (Solomon Islands) | `fr` |
| ☑ | French (Somalia) | `fr` |
| ☑ | French (South Georgia and the South Sandwich Islands) | `fr` |
| ☑ | French (Suriname) | `fr` |
| ☑ | French (Svalbard and Jan Mayen) | `fr` |
| ☑ | French (Swaziland) | `fr` |
| ☑ | French (Switzerland) | `fr` |
| ☑ | French (Tajikistan) | `fr` |
| ☑ | French (Tanzania) | `fr` |
| ☑ | French (Timor-Leste) | `fr` |
| ☑ | French (Togo) | `fr` |
| ☑ | French (Tokelau) | `fr` |
| ☑ | French (Tonga) | `fr` |
| ☑ | French (Tunisia) | `fr` |
| ☑ | French (Turks and Caicos Islands) | `fr` |
| ☑ | French (Tuvalu) | `fr` |
| ☑ | French (U.S. Minor Outlying Islands) | `fr` |
| ☑ | French (U.S. Virgin Islands) | `fr` |
| ☑ | French (Uganda) | `fr` |
| ☑ | French (Vanuatu) | `fr` |
| ☑ | French (Vatican City) | `fr` |
| ☑ | French (Wallis and Futuna) | `fr` |
| ☑ | French (Western Africa) | `fr` |
| ☑ | French (Western Europe) | `fr` |
| ☑ | French (Zambia) | `fr` |
| ☑ | French (Zimbabwe) | `fr` |
| ☑ | Galician | `gl` |
| ☑ | Galician (Spain) | `gl` |
| ☑ | Georgian | `ka` |
| ☑ | Georgian (Georgia) | `ka` |
| ☑ | German | `de` |
| ☑ | German (Austria) | `de` |
| ☑ | German (Germany) | `de` |
| ☑ | German (Liechtenstein) | `de` |
| ☑ | German (Luxembourg) | `de` |
| ☑ | German (Switzerland) | `de` |
| ☑ | Greek | `el` |
| ☑ | Greek (Cyprus) | `el` |
| ☑ | Greek (Greece) | `el` |
| ☑ | Gujarati | `gu` |
| ☑ | Gujarati (India) | `gu` |
| ☐ | Hausa | — |
| ☐ | Hausa (Latin) | — |
| ☐ | Hausa (Latin) (Nigeria) | — |
| ☐ | Hebrew | — |
| ☐ | Hebrew (Israel) | — |
| ☑ | Hindi | `hi` |
| ☑ | Hindi (India) | `hi` |
| ☑ | Hungarian | `hu` |
| ☑ | Hungarian (Hungary) | `hu` |
| ☑ | Icelandic | `is` |
| ☑ | Icelandic (Iceland) | `is` |
| ☐ | Igbo | — |
| ☐ | Igbo (Latin) | — |
| ☐ | Igbo (Nigeria) | — |
| ☑ | Indonesian | `id` |
| ☑ | Indonesian (Indonesia) | `id` |
| ☐ | Inuktitut | — |
| ☐ | Inuktitut (Canada) | — |
| ☐ | Inuktitut (Canadian) Canada | — |
| ☐ | Inuktitut (Latin) | — |
| ☐ | Inuktitut (Latin) (Canada) | — |
| ☑ | Irish | `ga` |
| ☑ | Irish (Ireland) | `ga` |
| ☐ | isiXhosa | — |
| ☐ | isiXhosa (South Africa) | — |
| ☑ | isiZulu | `zu` |
| ☑ | isiZulu (South Africa) | `zu` |
| ☑ | Italian | `it` |
| ☑ | Italian (Italy) | `it` |
| ☑ | Italian (Switzerland) | `it` |
| ☑ | Japanese | `ja` |
| ☑ | Japanese (Japan) | `ja` |
| ☑ | Kannada | `kn` |
| ☑ | Kannada (India) | `kn` |
| ☑ | Kazakh | `kk` |
| ☑ | Kazakh (Kazakhstan) | `kk` |
| ☑ | Khmer | `km` |
| ☑ | Khmer (Cambodia) | `km` |
| ☐ | K'iche' | — |
| ☐ | K'iche' (Guatemala) | — |
| ☐ | K'iche' (Latin) | — |
| ☐ | Kinyarwanda | — |
| ☐ | Kinyarwanda (Rwanda) | — |
| ☑ | Kiswahili | `sw` |
| ☑ | Kiswahili (Kenya) | `sw` |
| ☐ | Konkani | — |
| ☐ | Konkani (India) | — |
| ☑ | Korean | `ko` |
| ☑ | Korean (Korea) | `ko` |
| ☐ | Kurdish | — |
| ☐ | Kurdish (Arabic) | — |
| ☐ | Kurdish (Iraq) | — |
| ☑ | Kyrgyz | `ky` |
| ☑ | Kyrgyz (Cyrillic) | `ky` |
| ☑ | Kyrgyz (Kyrgyzstan) | `ky` |
| ☑ | Lao | `lo` |
| ☑ | Lao (Laos) | `lo` |
| ☑ | Latvian | `lv` |
| ☑ | Latvian (Latvia) | `lv` |
| ☑ | Lithuanian | `lt` |
| ☑ | Lithuanian (Lithuania) | `lt` |
| ☑ | Luxembourgish | `lb` |
| ☑ | Luxembourgish (Luxembourg) | `lb` |
| ☑ | Macedonian | `mk` |
| ☑ | Malay | `ms` |
| ☑ | Malay (Brunei) | `ms` |
| ☑ | Malay (Malaysia) | `ms` |
| ☑ | Malayalam | `ml` |
| ☑ | Malayalam (India) | `ml` |
| ☑ | Maltese | `mt` |
| ☑ | Maltese (Malta) | `mt` |
| ☐ | Maori | — |
| ☐ | Maori (Latin) | — |
| ☐ | Maori (New Zealand) | — |
| ☑ | Marathi | `mr` |
| ☑ | Marathi (India) | `mr` |
| ☑ | Mongolian | `mn` |
| ☑ | Mongolian (Cyrillic) | `mn` |
| ☑ | Mongolian (Mongolia) | `mn` |
| ☐ | Mongolian (Mongolian) | — |
| ☐ | Mongolian (Phags-pa) | — |
| ☑ | Nepali | `ne` |
| ☑ | Nepali (Nepal) | `ne` |
| ☑ | North Macedonia | `mk` |
| ☑ | Norwegian | `nb` |
| ☑ | Norwegian (Bokmål) | `nb` |
| ☑ | Norwegian (Bokmål) (Norway) | `nb` |
| ☑ | Norwegian (Norway) | `nb` |
| ☐ | Norwegian (Nynorsk) | — |
| ☐ | Norwegian (Nynorsk) (Norway) | — |
| ☐ | Odia | — |
| ☐ | Odia (India) | — |
| ☐ | Persian/Farsi | — |
| ☐ | Persian/Farsi (Iran) | — |
| ☑ | Polish | `pl` |
| ☑ | Polish (Poland) | `pl` |
| ☑ | Portuguese | `pt` |
| ☑ | Portuguese (Brazil) | `pt-BR` |
| ☑ | Portuguese (Portugal) | `pt` |
| ☑ | Punjabi | `pa` |
| ☐ | Punjabi (Arabic) | — |
| ☐ | Punjabi (Devanagari) | — |
| ☑ | Punjabi (India) | `pa` |
| ☑ | Punjabi (Pakistan) | `pa` |
| ☐ | Quechua | — |
| ☐ | Quechua (Bolivia) | — |
| ☐ | Quechua (Ecuador) | — |
| ☐ | Quechua (Peru) | — |
| ☑ | Romanian | `ro` |
| ☑ | Romanian (Romania) | `ro` |
| ☑ | Russian | `ru` |
| ☑ | Russian (Armenia) | `ru` |
| ☑ | Russian (Belarus) | `ru` |
| ☑ | Russian (Kazakhstan) | `ru` |
| ☑ | Russian (Russia) | `ru` |
| ☑ | Russian (Ukraine) | `ru` |
| ☐ | Scottish Gaelic | — |
| ☐ | Scottish Gaelic (Latin) | — |
| ☐ | Scottish Gaelic (United Kingdom) | — |
| ☑ | Serbian | `sr` |
| ☐ | Serbian (Cyrillic) | — |
| ☐ | Serbian (Cyrillic) (Bosnia and Herzegovina) | — |
| ☐ | Serbian (Cyrillic) (Montenegro) | — |
| ☐ | Serbian (Cyrillic) (Serbia ) | — |
| ☐ | Serbian (Cyrillic) (Serbia and Montenegro, Former) | — |
| ☑ | Serbian (Latin) | `sr` |
| ☑ | Serbian (Latin) (Bosnia and Herzegovina) | `sr` |
| ☑ | Serbian (Latin) (Montenegro) | `sr` |
| ☑ | Serbian (Latin) (Serbia and Montenegro (Former)) | `sr` |
| ☑ | Serbian (Latin) (Serbia) | `sr` |
| ☐ | Sesotho sa Leboa | — |
| ☐ | Sesotho sa Leboa (South Africa) | — |
| ☐ | Setswana | — |
| ☐ | Setswana (Botswana) | — |
| ☐ | Setswana (South Africa) | — |
| ☐ | Sindhi | — |
| ☐ | Sindhi (Arabic) | — |
| ☐ | Sindhi (Devanagari) | — |
| ☐ | Sindhi (Pakistan) | — |
| ☑ | Sinhala | `si` |
| ☑ | Sinhala (Sri Lanka) | `si` |
| ☑ | Slovak | `sk` |
| ☑ | Slovak (Slovakia) | `sk` |
| ☑ | Slovenian | `sl` |
| ☑ | Slovenian (Sierra Leone) | `sl` |
| ☑ | Slovenian (Slovenia) | `sl` |
| ☑ | Spanish | `es` |
| ☑ | Spanish (Åland Islands) | `es` |
| ☑ | Spanish (Albania) | `es` |
| ☑ | Spanish (American Samoa) | `es` |
| ☑ | Spanish (Americas) | `es` |
| ☑ | Spanish (Andorra) | `es` |
| ☑ | Spanish (Angola) | `es` |
| ☑ | Spanish (Anguilla) | `es` |
| ☑ | Spanish (Antarctica) | `es` |
| ☑ | Spanish (Antigua and Barbuda) | `es` |
| ☑ | Spanish (Argentina) | `es` |
| ☑ | Spanish (Aruba) | `es` |
| ☑ | Spanish (Azerbaijan) | `es` |
| ☑ | Spanish (Bahamas, The) | `es` |
| ☑ | Spanish (Barbados) | `es` |
| ☑ | Spanish (Belize) | `es` |
| ☑ | Spanish (Benin) | `es` |
| ☑ | Spanish (Bermuda) | `es` |
| ☑ | Spanish (Bhutan) | `es` |
| ☑ | Spanish (Bolivia) | `es` |
| ☑ | Spanish (Bonaire, Saint Eustatius and Saba) | `es` |
| ☑ | Spanish (Bosnia and Herzegovina) | `es` |
| ☑ | Spanish (Botswana) | `es` |
| ☑ | Spanish (Bouvet Island) | `es` |
| ☑ | Spanish (British Indian Ocean Territory) | `es` |
| ☑ | Spanish (British Virgin Islands) | `es` |
| ☑ | Spanish (Brunei) | `es` |
| ☑ | Spanish (Burkina Faso) | `es` |
| ☑ | Spanish (Burundi) | `es` |
| ☑ | Spanish (Cameroon) | `es` |
| ☑ | Spanish (Canada) | `es` |
| ☑ | Spanish (Cape Verde) | `es` |
| ☑ | Spanish (Cayman Islands) | `es` |
| ☑ | Spanish (Central African Republic) | `es` |
| ☑ | Spanish (Chad) | `es` |
| ☑ | Spanish (Chile) | `es` |
| ☑ | Spanish (Christmas Island) | `es` |
| ☑ | Spanish (Cocos (Keeling) Islands) | `es` |
| ☑ | Spanish (Colombia) | `es` |
| ☑ | Spanish (Comoros) | `es` |
| ☑ | Spanish (Congo (DRC)) | `es` |
| ☑ | Spanish (Congo) | `es` |
| ☑ | Spanish (Cook Islands) | `es` |
| ☑ | Spanish (Costa Rica) | `es` |
| ☑ | Spanish (Côte d'Ivoire) | `es` |
| ☑ | Spanish (Cuba) | `es` |
| ☑ | Spanish (Curaçao) | `es` |
| ☑ | Spanish (Djibouti) | `es` |
| ☑ | Spanish (Dominica) | `es` |
| ☑ | Spanish (Dominican Republic) | `es` |
| ☑ | Spanish (Ecuador) | `es` |
| ☑ | Spanish (El Salvador) | `es` |
| ☑ | Spanish (Equatorial Guinea) | `es` |
| ☑ | Spanish (Eritrea) | `es` |
| ☑ | Spanish (EU) | `es` |
| ☑ | Spanish (Falkland Islands (Islas Malvinas)) | `es` |
| ☑ | Spanish (Faroe Islands) | `es` |
| ☑ | Spanish (Fiji) | `es` |
| ☑ | Spanish (French Guiana) | `es` |
| ☑ | Spanish (French Polynesia) | `es` |
| ☑ | Spanish (Gabon) | `es` |
| ☑ | Spanish (Gambia, The) | `es` |
| ☑ | Spanish (Georgia) | `es` |
| ☑ | Spanish (Ghana) | `es` |
| ☑ | Spanish (Gibraltar) | `es` |
| ☑ | Spanish (Greenland) | `es` |
| ☑ | Spanish (Grenada) | `es` |
| ☑ | Spanish (Guadeloupe) | `es` |
| ☑ | Spanish (Guam) | `es` |
| ☑ | Spanish (Guatemala) | `es` |
| ☑ | Spanish (Guernsey) | `es` |
| ☑ | Spanish (Guinea) | `es` |
| ☑ | Spanish (Guinea-Bissau) | `es` |
| ☑ | Spanish (Guyana) | `es` |
| ☑ | Spanish (Haiti) | `es` |
| ☑ | Spanish (Heard Island and McDonald Islands) | `es` |
| ☑ | Spanish (Honduras) | `es` |
| ☑ | Spanish (Jamaica) | `es` |
| ☑ | Spanish (Jersey) | `es` |
| ☑ | Spanish (Kiribati) | `es` |
| ☑ | Spanish (Kyrgyzstan) | `es` |
| ☑ | Spanish (Laos) | `es` |
| ☑ | Spanish (Latin America and the Caribbean) | `es` |
| ☑ | Spanish (Lesotho) | `es` |
| ☑ | Spanish (Liberia) | `es` |
| ☑ | Spanish (Libya) | `es` |
| ☑ | Spanish (Macao SAR) | `es` |
| ☑ | Spanish (Madagascar) | `es` |
| ☑ | Spanish (Malawi) | `es` |
| ☑ | Spanish (Maldives) | `es` |
| ☑ | Spanish (Mali) | `es` |
| ☑ | Spanish (Marshall Islands) | `es` |
| ☑ | Spanish (Martinique) | `es` |
| ☑ | Spanish (Mauritius) | `es` |
| ☑ | Spanish (Mayotte) | `es` |
| ☑ | Spanish (Mexico) | `es` |
| ☑ | Spanish (Micronesia) | `es` |
| ☑ | Spanish (Moldova) | `es` |
| ☑ | Spanish (Monaco) | `es` |
| ☑ | Spanish (Mongolia) | `es` |
| ☑ | Spanish (Montserrat) | `es` |
| ☑ | Spanish (Mozambique) | `es` |
| ☑ | Spanish (Myanmar) | `es` |
| ☑ | Spanish (Namibia) | `es` |
| ☑ | Spanish (Nauru) | `es` |
| ☑ | Spanish (New Caledonia) | `es` |
| ☑ | Spanish (Nicaragua) | `es` |
| ☑ | Spanish (Niger) | `es` |
| ☑ | Spanish (Niue) | `es` |
| ☑ | Spanish (Norfolk Island) | `es` |
| ☑ | Spanish (Northern Mariana Islands) | `es` |
| ☑ | Spanish (Palau) | `es` |
| ☑ | Spanish (Palestinian Authority) | `es` |
| ☑ | Spanish (Panama) | `es` |
| ☑ | Spanish (Papua New Guinea) | `es` |
| ☑ | Spanish (Paraguay) | `es` |
| ☑ | Spanish (Peru) | `es` |
| ☑ | Spanish (Pitcairn Islands) | `es` |
| ☑ | Spanish (Puerto Rico) | `es` |
| ☑ | Spanish (Réunion) | `es` |
| ☑ | Spanish (Rwanda) | `es` |
| ☑ | Spanish (Saint Barthélemy) | `es` |
| ☑ | Spanish (Saint Helena, Ascension and Tristan da Cunha) | `es` |
| ☑ | Spanish (Saint Kitts and Nevis) | `es` |
| ☑ | Spanish (Saint Lucia) | `es` |
| ☑ | Spanish (Saint Martin (French Part)) | `es` |
| ☑ | Spanish (Saint Pierre and Miquelon) | `es` |
| ☑ | Spanish (Saint Vincent and the Grenadines) | `es` |
| ☑ | Spanish (Samoa) | `es` |
| ☑ | Spanish (San Marino) | `es` |
| ☑ | Spanish (São Tomé and Príncipe) | `es` |
| ☑ | Spanish (Senegal) | `es` |
| ☑ | Spanish (Seychelles) | `es` |
| ☑ | Spanish (Sierra Leone) | `es` |
| ☑ | Spanish (Sint Maarten (Dutch Part)) | `es` |
| ☑ | Spanish (Solomon Islands) | `es` |
| ☑ | Spanish (Somalia) | `es` |
| ☑ | Spanish (South Georgia and the South Sandwich Islands) | `es` |
| ☑ | Spanish (Spain) | `es` |
| ☑ | Spanish (Suriname) | `es` |
| ☑ | Spanish (Svalbard and Jan Mayen) | `es` |
| ☑ | Spanish (Swaziland) | `es` |
| ☑ | Spanish (Tajikistan) | `es` |
| ☑ | Spanish (Tanzania) | `es` |
| ☑ | Spanish (Timor-Leste) | `es` |
| ☑ | Spanish (Togo) | `es` |
| ☑ | Spanish (Tokelau) | `es` |
| ☑ | Spanish (Tonga) | `es` |
| ☑ | Spanish (Turks and Caicos Islands) | `es` |
| ☑ | Spanish (Tuvalu) | `es` |
| ☑ | Spanish (U.S. Minor Outlying Islands) | `es` |
| ☑ | Spanish (U.S. Virgin Islands) | `es` |
| ☑ | Spanish (Uganda) | `es` |
| ☑ | Spanish (United States) | `es` |
| ☑ | Spanish (Uruguay) | `es` |
| ☑ | Spanish (Vanuatu) | `es` |
| ☑ | Spanish (Vatican City) | `es` |
| ☑ | Spanish (Venezuela) | `es` |
| ☑ | Spanish (Wallis and Futuna) | `es` |
| ☑ | Spanish (Zambia) | `es` |
| ☑ | Spanish (Zimbabwe) | `es` |
| ☑ | Swedish | `sv` |
| ☑ | Swedish (Finland) | `sv` |
| ☑ | Swedish (Sweden) | `sv` |
| ☐ | Tajik | — |
| ☐ | Tajik (Arabic) | — |
| ☐ | Tajik (Cyrillic) | — |
| ☐ | Tajik (Latin) | — |
| ☐ | Tajik (Tajikistan) | — |
| ☑ | Tamil | `ta` |
| ☑ | Tamil (India) | `ta` |
| ☐ | Tatar | — |
| ☐ | Tatar (Arabic) | — |
| ☐ | Tatar (Cyrillic) | — |
| ☐ | Tatar (Latin) | — |
| ☐ | Tatar (Russia) | — |
| ☑ | Telugu | `te` |
| ☑ | Telugu (India) | `te` |
| ☑ | Thai | `th` |
| ☑ | Thai (Thailand) | `th` |
| ☐ | Tigrinya | — |
| ☐ | Tigrinya (Ethiopia) | — |
| ☑ | Turkish | `tr` |
| ☑ | Turkish (Türkiye) | `tr` |
| ☐ | Turkmen | — |
| ☐ | Turkmen (Cyrillic) | — |
| ☐ | Turkmen (Cyrillic) (Türkiye) | — |
| ☐ | Turkmen (Latin) | — |
| ☐ | Turkmen (Latin) (Türkiye) | — |
| ☐ | Turkmen (Türkiye) | — |
| ☐ | Turkmen (Turkmenistan) | — |
| ☑ | Ukrainian | `uk` |
| ☑ | Ukrainian (Ukraine) | `uk` |
| ☐ | Urdu | — |
| ☐ | Urdu (Pakistan) | — |
| ☐ | Uyghur | — |
| ☐ | Uyghur (Arabic) | — |
| ☐ | Uyghur (China) | — |
| ☐ | Uyghur (Cyrillic) | — |
| ☐ | Uyghur (Latin) | — |
| ☑ | Uzbek | `uz` |
| ☐ | Uzbek (Cyrillic) | — |
| ☑ | Uzbek (Latin) | `uz` |
| ☑ | Uzbek (Latin) (Uzbekistan) | `uz` |
| ☑ | Uzbek (Uzbekistan) | `uz` |
| ☑ | Valencian | `ca` |
| ☑ | Vietnamese | `vi` |
| ☑ | Vietnamese (Vietnam) | `vi` |
| ☑ | Welsh | `cy` |
| ☑ | Welsh (United Kingdom) | `cy` |
| ☐ | Wolof | — |
| ☐ | Wolof (Senegal) | — |
| ☐ | Yoruba | — |
| ☐ | Yoruba (Latin) | — |
| ☐ | Yoruba (Nigeria) | — |

## Ticked entries grouped by app locale

| App locale | Microsoft entries to tick | Count |
| --- | --- | ---: |
| `af` | Afrikaans; Afrikaans (South Africa) | 2 |
| `am` | Amharic; Amharic (Ethiopia) | 2 |
| `az` | Azerbaijani (Latin); Azerbaijani (Latin) (Azerbaijan) | 2 |
| `be` | Belarusian; Belarusian (Belarus) | 2 |
| `bg` | Bulgarian; Bulgarian (Bulgaria) | 2 |
| `bn` | Bangla; Bangla (Bangladesh); Bangla (India); Bangla (Pakistan) | 4 |
| `bs` | Bosnian; Bosnian (Latin); Bosnian (Latin) (Bosnia and Herzegovina) | 3 |
| `ca` | Catalan; Catalan (Spain); Valencian | 3 |
| `cs` | Czech; Czech (Czech Republic) | 2 |
| `cy` | Welsh; Welsh (United Kingdom) | 2 |
| `da` | Danish; Danish (Denmark) | 2 |
| `de` | German; German (Austria); German (Germany); German (Liechtenstein); German (Luxembourg); German (Switzerland) | 6 |
| `el` | Greek; Greek (Cyprus); Greek (Greece) | 3 |
| `en` | English; English (Afghanistan); English (Åland Islands); English (Albania); English (Algeria); English (American Samoa); English (Andorra); English (Angola); English (Anguilla); English (Antarctica); English (Antigua and Barbuda); English (Armenia); English (Aruba); English (Australia and New Zealand); English (Australia); English (Azerbaijan); English (Bahamas); English (Bangladesh); English (Barbados); English (Belarus); English (Belize); English (Benin); English (Bermuda); English (Bhutan); English (Bolivia); English (Bonaire, Saint Eustatius and Saba); English (Bosnia and Herzegovina); English (Botswana); English (Bouvet Island); English (British Indian Ocean Territory); English (British Virgin Islands); English (Brunei); English (Bulgaria); English (Burkina Faso); English (Burundi); English (Cambodia); English (Cameroon); English (Canada); English (Cape Verde); English (Caribbean); English (Cayman Islands); English (Central African Republic); English (Chad); English (Christmas Island); English (Cocos (Keeling) Islands); English (Comoros); English (Congo (DRC)); English (Congo); English (Cook Islands); English (Côte d'Ivoire); English (Croatia); English (Curaçao); English (Czech Republic); English (Djibouti); English (Dominica); English (Dominican Republic); English (Eastern Africa); English (Equatorial Guinea); English (Eritrea); English (Estonia); English (Ethiopia); English (Falkland Islands (Islas Malvinas)); English (Faroe Islands); English (Fiji); English (French Guiana); English (French Polynesia); English (French Southern and Antarctic Lands); English (Gabon); English (Gambia, The); English (Georgia); English (Germany); English (Ghana); English (Gibraltar); English (Greece); English (Greenland); English (Guadeloupe); English (Guam); English (Guernsey); English (Guinea); English (Guinea-Bissau); English (Guyana); English (Haiti); English (Heard Island and McDonald Islands); English (Honduras); English (Hong Kong SAR); English (Hungary); English (Iceland); English (India); English (Indonesia); English (Iraq); English (Ireland); English (Isle of Man); English (Israel); English (Jamaica); English (Jersey); English (Jordan); English (Kazakhstan); English (Kenya); English (Kiribati); English (Kyrgyzstan); English (Laos); English (Latvia); English (Lesotho); English (Liberia); English (Libya); English (Lithuania); English (Macao SAR); English (Macedonia, FYRO); English (Madagascar); English (Malawi); English (Malaysia); English (Maldives); English (Mali); English (Malta); English (Marshall Islands); English (Martinique); English (Mauritius); English (Mayotte); English (Micronesia); English (Moldova); English (Monaco); English (Mongolia); English (Montserrat); English (Mozambique); English (Myanmar); English (Namibia); English (Nauru); English (Nepal); English (Netherlands Antilles (Former)); English (Netherlands); English (New Caledonia); English (New Zealand); English (Nicaragua); English (Niger); English (Nigeria); English (Niue); English (Norfolk Island); English (Northern America); English (Northern Mariana Islands); English (Oman); English (Pakistan); English (Palau); English (Palestinian Authority); English (Papua New Guinea); English (Philippines); English (Pitcairn Islands); English (Puerto Rico); English (Qatar); English (Réunion); English (Romania); English (Rwanda); English (Saint Barthélemy); English (Saint Helena, Ascension and Tristan da Cunha); English (Saint Kitts and Nevis); English (Saint Lucia); English (Saint Martin (French Part)); English (Saint Pierre and Miquelon); English (Saint Vincent and the Grenadines); English (Samoa); English (San Marino); English (São Tomé and Príncipe); English (Saudi Arabia); English (Senegal); English (Seychelles); English (Sierra Leone); English (Singapore); English (Sint Maarten (Dutch Part)); English (Slovakia); English (Slovenia); English (Solomon Islands); English (Somalia); English (South Africa); English (South Georgia and the South Sandwich Islands); English (Southern Africa); English (Sri Lanka); English (Sudan); English (Suriname); English (Svalbard and Jan Mayen); English (Swaziland); English (Tajikistan); English (Tanzania); English (Thailand); English (Timor-Leste); English (Togo); English (Tokelau); English (Tonga); English (Trinidad and Tobago); English (Türkiye); English (Turkmenistan); English (Turks and Caicos Islands); English (Tuvalu); English (U.S. Minor Outlying Islands); English (U.S. Virgin Islands); English (Uganda); English (United Arab Emirates); English (United Kingdom); English (Uzbekistan); English (Vanuatu); English (Vatican City); English (Vietnam); English (Wallis and Futuna); English (Western Africa); English (Zambia); English (Zimbabwe) | 204 |
| `es` | Spanish; Spanish (Åland Islands); Spanish (Albania); Spanish (American Samoa); Spanish (Americas); Spanish (Andorra); Spanish (Angola); Spanish (Anguilla); Spanish (Antarctica); Spanish (Antigua and Barbuda); Spanish (Argentina); Spanish (Aruba); Spanish (Azerbaijan); Spanish (Bahamas, The); Spanish (Barbados); Spanish (Belize); Spanish (Benin); Spanish (Bermuda); Spanish (Bhutan); Spanish (Bolivia); Spanish (Bonaire, Saint Eustatius and Saba); Spanish (Bosnia and Herzegovina); Spanish (Botswana); Spanish (Bouvet Island); Spanish (British Indian Ocean Territory); Spanish (British Virgin Islands); Spanish (Brunei); Spanish (Burkina Faso); Spanish (Burundi); Spanish (Cameroon); Spanish (Canada); Spanish (Cape Verde); Spanish (Cayman Islands); Spanish (Central African Republic); Spanish (Chad); Spanish (Chile); Spanish (Christmas Island); Spanish (Cocos (Keeling) Islands); Spanish (Colombia); Spanish (Comoros); Spanish (Congo (DRC)); Spanish (Congo); Spanish (Cook Islands); Spanish (Costa Rica); Spanish (Côte d'Ivoire); Spanish (Cuba); Spanish (Curaçao); Spanish (Djibouti); Spanish (Dominica); Spanish (Dominican Republic); Spanish (Ecuador); Spanish (El Salvador); Spanish (Equatorial Guinea); Spanish (Eritrea); Spanish (EU); Spanish (Falkland Islands (Islas Malvinas)); Spanish (Faroe Islands); Spanish (Fiji); Spanish (French Guiana); Spanish (French Polynesia); Spanish (Gabon); Spanish (Gambia, The); Spanish (Georgia); Spanish (Ghana); Spanish (Gibraltar); Spanish (Greenland); Spanish (Grenada); Spanish (Guadeloupe); Spanish (Guam); Spanish (Guatemala); Spanish (Guernsey); Spanish (Guinea); Spanish (Guinea-Bissau); Spanish (Guyana); Spanish (Haiti); Spanish (Heard Island and McDonald Islands); Spanish (Honduras); Spanish (Jamaica); Spanish (Jersey); Spanish (Kiribati); Spanish (Kyrgyzstan); Spanish (Laos); Spanish (Latin America and the Caribbean); Spanish (Lesotho); Spanish (Liberia); Spanish (Libya); Spanish (Macao SAR); Spanish (Madagascar); Spanish (Malawi); Spanish (Maldives); Spanish (Mali); Spanish (Marshall Islands); Spanish (Martinique); Spanish (Mauritius); Spanish (Mayotte); Spanish (Mexico); Spanish (Micronesia); Spanish (Moldova); Spanish (Monaco); Spanish (Mongolia); Spanish (Montserrat); Spanish (Mozambique); Spanish (Myanmar); Spanish (Namibia); Spanish (Nauru); Spanish (New Caledonia); Spanish (Nicaragua); Spanish (Niger); Spanish (Niue); Spanish (Norfolk Island); Spanish (Northern Mariana Islands); Spanish (Palau); Spanish (Palestinian Authority); Spanish (Panama); Spanish (Papua New Guinea); Spanish (Paraguay); Spanish (Peru); Spanish (Pitcairn Islands); Spanish (Puerto Rico); Spanish (Réunion); Spanish (Rwanda); Spanish (Saint Barthélemy); Spanish (Saint Helena, Ascension and Tristan da Cunha); Spanish (Saint Kitts and Nevis); Spanish (Saint Lucia); Spanish (Saint Martin (French Part)); Spanish (Saint Pierre and Miquelon); Spanish (Saint Vincent and the Grenadines); Spanish (Samoa); Spanish (San Marino); Spanish (São Tomé and Príncipe); Spanish (Senegal); Spanish (Seychelles); Spanish (Sierra Leone); Spanish (Sint Maarten (Dutch Part)); Spanish (Solomon Islands); Spanish (Somalia); Spanish (South Georgia and the South Sandwich Islands); Spanish (Spain); Spanish (Suriname); Spanish (Svalbard and Jan Mayen); Spanish (Swaziland); Spanish (Tajikistan); Spanish (Tanzania); Spanish (Timor-Leste); Spanish (Togo); Spanish (Tokelau); Spanish (Tonga); Spanish (Turks and Caicos Islands); Spanish (Tuvalu); Spanish (U.S. Minor Outlying Islands); Spanish (U.S. Virgin Islands); Spanish (Uganda); Spanish (United States); Spanish (Uruguay); Spanish (Vanuatu); Spanish (Vatican City); Spanish (Venezuela); Spanish (Wallis and Futuna); Spanish (Zambia); Spanish (Zimbabwe) | 161 |
| `et` | Estonian; Estonian (Estonia) | 2 |
| `eu` | Basque; Basque (Basque) | 2 |
| `fi` | Finnish; Finnish (Finland) | 2 |
| `fil` | Filipino; Filipino (Latin); Filipino (Philippines) | 3 |
| `fr` | French; French (Åland Islands); French (Albania); French (Algeria); French (American Samoa); French (Andorra); French (Angola); French (Anguilla); French (Antarctica); French (Antigua and Barbuda); French (Aruba); French (Azerbaijan); French (Bahamas, The); French (Barbados); French (Belgium); French (Belize); French (Benin); French (Bermuda); French (Bhutan); French (Bolivia); French (Bonaire, Saint Eustatius and Saba); French (Bosnia and Herzegovina); French (Botswana); French (Bouvet Island); French (British Indian Ocean Territory); French (British Virgin Islands); French (Brunei); French (Burkina Faso); French (Burundi); French (Cameroon); French (Canada); French (Cape Verde); French (Caribbean); French (Cayman Islands); French (Central African Republic); French (Chad); French (Christmas Island); French (Cocos (Keeling) Islands); French (Comoros); French (Congo (DRC)); French (Congo); French (Cook Islands); French (Côte d'Ivoire); French (Curaçao); French (Djibouti); French (Dominica); French (Dominican Republic); French (Equatorial Guinea); French (Eritrea); French (Falkland Islands (Islas Malvinas)); French (Faroe Islands); French (Fiji); French (France); French (French Guiana); French (French Polynesia); French (Gabon); French (Gambia, The); French (Georgia); French (Ghana); French (Gibraltar); French (Greenland); French (Grenada); French (Guadeloupe); French (Guam); French (Guernsey); French (Guinea); French (Guinea-Bissau); French (Guyana); French (Haiti); French (Heard Island and McDonald Islands); French (Honduras); French (Jamaica); French (Jersey); French (Kiribati); French (Kyrgyzstan); French (Laos); French (Lesotho); French (Liberia); French (Libya); French (Luxembourg); French (Macao SAR); French (Madagascar); French (Malawi); French (Maldives); French (Mali); French (Marshall Islands); French (Martinique); French (Mauritius); French (Mayotte); French (Micronesia); French (Moldova); French (Monaco); French (Mongolia); French (Montserrat); French (Morocco); French (Mozambique); French (Myanmar); French (Namibia); French (Nauru); French (New Caledonia); French (Nicaragua); French (Niger); French (Niue); French (Norfolk Island); French (North Africa); French (Northern America); French (Northern Mariana Islands); French (Palau); French (Palestinian Authority); French (Papua New Guinea); French (Pitcairn Islands); French (Réunion); French (Rwanda); French (Saint Barthélemy); French (Saint Helena, Ascension and Tristan da Cunha); French (Saint Kitts and Nevis); French (Saint Lucia); French (Saint Martin (French Part)); French (Saint Pierre and Miquelon); French (Saint Vincent and the Grenadines); French (Samoa); French (San Marino); French (São Tomé and Príncipe); French (Senegal); French (Seychelles); French (Sierra Leone); French (Sint Maarten (Dutch Part)); French (Solomon Islands); French (Somalia); French (South Georgia and the South Sandwich Islands); French (Suriname); French (Svalbard and Jan Mayen); French (Swaziland); French (Switzerland); French (Tajikistan); French (Tanzania); French (Timor-Leste); French (Togo); French (Tokelau); French (Tonga); French (Tunisia); French (Turks and Caicos Islands); French (Tuvalu); French (U.S. Minor Outlying Islands); French (U.S. Virgin Islands); French (Uganda); French (Vanuatu); French (Vatican City); French (Wallis and Futuna); French (Western Africa); French (Western Europe); French (Zambia); French (Zimbabwe) | 153 |
| `ga` | Irish; Irish (Ireland) | 2 |
| `gl` | Galician; Galician (Spain) | 2 |
| `gu` | Gujarati; Gujarati (India) | 2 |
| `hi` | Hindi; Hindi (India) | 2 |
| `hr` | Croatian; Croatian (Bosnia and Herzegovina); Croatian (Croatia) | 3 |
| `hu` | Hungarian; Hungarian (Hungary) | 2 |
| `hy` | Armenian; Armenian (Armenia) | 2 |
| `id` | Indonesian; Indonesian (Indonesia) | 2 |
| `is` | Icelandic; Icelandic (Iceland) | 2 |
| `it` | Italian; Italian (Italy); Italian (Switzerland) | 3 |
| `ja` | Japanese; Japanese (Japan) | 2 |
| `ka` | Georgian; Georgian (Georgia) | 2 |
| `kk` | Kazakh; Kazakh (Kazakhstan) | 2 |
| `km` | Khmer; Khmer (Cambodia) | 2 |
| `kn` | Kannada; Kannada (India) | 2 |
| `ko` | Korean; Korean (Korea) | 2 |
| `ky` | Kyrgyz; Kyrgyz (Cyrillic); Kyrgyz (Kyrgyzstan) | 3 |
| `lb` | Luxembourgish; Luxembourgish (Luxembourg) | 2 |
| `lo` | Lao; Lao (Laos) | 2 |
| `lt` | Lithuanian; Lithuanian (Lithuania) | 2 |
| `lv` | Latvian; Latvian (Latvia) | 2 |
| `mk` | Macedonian; North Macedonia | 2 |
| `ml` | Malayalam; Malayalam (India) | 2 |
| `mn` | Mongolian; Mongolian (Cyrillic); Mongolian (Mongolia) | 3 |
| `mr` | Marathi; Marathi (India) | 2 |
| `ms` | Malay; Malay (Brunei); Malay (Malaysia) | 3 |
| `mt` | Maltese; Maltese (Malta) | 2 |
| `nb` | Norwegian; Norwegian (Bokmål); Norwegian (Bokmål) (Norway); Norwegian (Norway) | 4 |
| `ne` | Nepali; Nepali (Nepal) | 2 |
| `nl` | Dutch; Dutch (Belgium); Dutch (Netherlands) | 3 |
| `pa` | Punjabi; Punjabi (India); Punjabi (Pakistan) | 3 |
| `pl` | Polish; Polish (Poland) | 2 |
| `pt` | Portuguese; Portuguese (Portugal) | 2 |
| `pt-BR` | Portuguese (Brazil) | 1 |
| `ro` | Romanian; Romanian (Romania) | 2 |
| `ru` | Russian; Russian (Armenia); Russian (Belarus); Russian (Kazakhstan); Russian (Russia); Russian (Ukraine) | 6 |
| `si` | Sinhala; Sinhala (Sri Lanka) | 2 |
| `sk` | Slovak; Slovak (Slovakia) | 2 |
| `sl` | Slovenian; Slovenian (Sierra Leone); Slovenian (Slovenia) | 3 |
| `sq` | Albanian; Albanian (Albania) | 2 |
| `sr` | Serbian; Serbian (Latin); Serbian (Latin) (Bosnia and Herzegovina); Serbian (Latin) (Montenegro); Serbian (Latin) (Serbia and Montenegro (Former)); Serbian (Latin) (Serbia) | 6 |
| `sv` | Swedish; Swedish (Finland); Swedish (Sweden) | 3 |
| `sw` | Kiswahili; Kiswahili (Kenya) | 2 |
| `ta` | Tamil; Tamil (India) | 2 |
| `te` | Telugu; Telugu (India) | 2 |
| `th` | Thai; Thai (Thailand) | 2 |
| `tr` | Turkish; Turkish (Türkiye) | 2 |
| `uk` | Ukrainian; Ukrainian (Ukraine) | 2 |
| `uz` | Uzbek; Uzbek (Latin); Uzbek (Latin) (Uzbekistan); Uzbek (Uzbekistan) | 4 |
| `vi` | Vietnamese; Vietnamese (Vietnam) | 2 |
| `zh-CN` | Chinese; Chinese (China); Chinese (Simplified); Chinese (Simplified) (China); Chinese (Simplified) (Singapore); Chinese (Singapore) | 6 |
| `zh-TW` | Chinese (Hong Kong SAR); Chinese (Macao SAR); Chinese (Taiwan); Chinese (Traditional); Chinese (Traditional) (Hong Kong); Chinese (Traditional) (Macao SAR); Chinese (Traditional) (Taiwan) | 7 |
| `zu` | isiZulu; isiZulu (South Africa) | 2 |

## Notes

- The app resolves the OS locale with exact match → base language → `en`, plus aliases (`zh-Hans` → `zh-CN`, `no` → `nb`). A regional Windows locale such as `en-GB` or `fr-BE` therefore already works without a separate dictionary.
- Script variants are only supported where a matching dictionary exists: Serbian (Latin), Bosnian (Latin), Azerbaijani (Latin), Uzbek (Latin), Mongolian (Cyrillic), Kyrgyz (Cyrillic), and Chinese Simplified/Traditional. Other script variants are left unticked.
- If you add a locale later, update `src/i18n/index.js` and re-check the corresponding boxes.
