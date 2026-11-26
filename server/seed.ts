import { db } from './db.ts';

export function seedDatabase(): void {
  const destCount = (db.prepare('SELECT COUNT(*) as cnt FROM destinations').get() as { cnt: number }).cnt;
  if (destCount > 0) {
    return;
  }

  const insertDestination = db.prepare(`
    INSERT INTO destinations (
      slug, name, region, category, tagline, short_description, history_text,
      architecture_notes, best_time, recommended_days, unesco_year, elevation_m,
      latitude, longitude, hero_image, secondary_image, is_featured, travel_tips_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAttraction = db.prepare(`
    INSERT INTO attractions (
      destination_id, name, era, summary, highlight_tip, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const destinationsData = [
    {
      slug: 'samarkand',
      name: 'Samarkand',
      region: 'Zeravshan Valley',
      category: 'Timurid Capitals',
      tagline: 'Jewel of the Silk Road & Capital of Timurid Renaissance',
      short_description:
        'A luminous crossroads of Persian, Turkic, and Mediterranean scholarship where turquoise domes rise above 2,750 years of Silk Road history.',
      history_text:
        'Founded in the 8th century BCE as Marakanda, Samarkand blossomed into the radiant heart of the Silk Road. In 1370, Amir Timur chose it as the imperial capital of his empire, summoning the finest ceramicists, astronomers, and master calligraphers from across Central Asia, Persia, and India. His grandson Ulugh Beg later turned the city into a global center of mathematics and astronomy, charting nearly a thousand stars with astonishing precision.',
      architecture_notes:
        'Samarkand is celebrated for monumental Timurid pishtaq portals, ribbed turquoise domes, and intricate banai brick-mosaic calligraphy. Cobalt lapis lazuli glazes catch the desert sun from dawn until blue hour.',
      best_time: 'April – May & September – October',
      recommended_days: '3–4 Days',
      unesco_year: 'UNESCO 2001',
      elevation_m: 705,
      latitude: 39.6542,
      longitude: 66.9597,
      hero_image: '/src/assets/images/hero_registan_samarkand_1795670679164.jpg',
      secondary_image: '/src/assets/images/dest_samarkand_shahizinda_1795670678180.jpg',
      is_featured: 1,
      travel_tips: [
        'Arrive at Registan Square 20 minutes before sunrise for tranquil courtyard light and evening illumination at 20:00.',
        'Board the Afrosiyob high-speed bullet train from Tashkent (2 hours 10 minutes); reserve seats two weeks ahead.',
        'Visit the Konigil Silk Paper Mill along the Siab stream to see 8th-century mulberry papermaking techniques.'
      ],
      attractions: [
        {
          name: 'Registan Square',
          era: '15th–17th Century',
          summary:
            'Framed by the Ulugh Beg, Sher-Dor, and Tilya-Kori Madrasahs, this monumental plaza represents the zenith of Islamic civic architecture.',
          highlight_tip: 'Step inside Tilya-Kori Madrasah to witness the gold-leafed trompe-l’oeil flat ceiling curved like a dome.',
          latitude: 39.6548,
          longitude: 66.9758
        },
        {
          name: 'Shah-i-Zinda',
          era: '11th–15th Century',
          summary:
            'A sacred hillside avenue of royal mausoleums showcasing the evolution of Samarkand majolica, carved terracotta, and starry cobalt tilework.',
          highlight_tip: 'Walk slowly up the Stairway of Steps in early morning when sunlight illuminates the recessed muqarnas vaults.',
          latitude: 39.6625,
          longitude: 66.9877
        },
        {
          name: 'Gur-e-Amir Mausoleum',
          era: '1403–1404',
          summary:
            'The octagonal resting place of Amir Timur, crowned by an iconic fluted azure dome that later inspired Mughal architecture.',
          highlight_tip: 'Notice the single dark green nephrite jade cenotaph beneath the gilded papier-mâché interior vault.',
          latitude: 39.6485,
          longitude: 66.9692
        }
      ]
    },
    {
      slug: 'bukhara',
      name: 'Bukhara',
      region: 'Kyzylkum Oasis',
      category: 'Oasis & Fortress',
      tagline: 'Living Museum of 140 Architectural Monuments & Sacred Scholarship',
      short_description:
        'An atmospheric desert oasis of mudbrick alleys, domed trading bazaars, ancient caravanserais, and turquoise-tiled madrasahs.',
      history_text:
        'For over two millennia, Bukhara stood as one of the intellectual pillars of Eurasia—home to polymath Ibn Sina (Avicenna) and historian Al-Narshakhi. Protected by desert sands and fed by the Zeravshan canals, its old quarter preserves an unbroken medieval urban fabric where trading domes still hum with goldsmiths, carpet weavers, and miniature painters.',
      architecture_notes:
        'Unlike the colossal scale of Samarkand, Bukhara rewards quiet discovery: intricate geometric brickwork from the Samanid dynasty (9th–10th century) sits beside sheltered taqi trading domes and carved wooden ayvan verandas.',
      best_time: 'March – May & September – November',
      recommended_days: '2–3 Days',
      unesco_year: 'UNESCO 1993',
      elevation_m: 225,
      latitude: 39.7747,
      longitude: 64.4286,
      hero_image: '/src/assets/images/dest_bukhara_poikalyan_1795670678571.jpg',
      secondary_image: '/src/assets/images/culture_clothing_suzani_1795670682175.jpg',
      is_featured: 1,
      travel_tips: [
        'Stay inside a restored 19th-century merchant courtyard guesthouse around Lyabi-Hauz.',
        'Explore the covered Toki Sarrafon and Toki Zargaron trading domes on foot at dusk.',
        'Book a traditional Bukharan hammam (Bozori Kord) dating back to the 16th century for an authentic bathhouse ritual.'
      ],
      attractions: [
        {
          name: 'Poi Kalyan Complex',
          era: '12th–16th Century',
          summary:
            'Anchored by the 45.6-meter Kalyan Minaret—spared even by Genghis Khan—alongside the vast Kalyan Mosque and Mir-i-Arab Madrasah.',
          highlight_tip: 'Count the fourteen distinct decorative brick bands encircling the minaret at golden hour.',
          latitude: 39.7758,
          longitude: 64.4151
        },
        {
          name: 'Ark Fortress',
          era: '5th–19th Century',
          summary:
            'A massive royal citadel built atop an ancient earthen mound that served as the fortified residence of Bukhara’s Emirs for over a millennium.',
          highlight_tip: 'Climb the grand stone ramp to view the throne room courtyard and panoramic vistas across the old city.',
          latitude: 39.7779,
          longitude: 64.4109
        },
        {
          name: 'Lyabi-Hauz Ensemble',
          era: '16th–17th Century',
          summary:
            'A serene stone-lined reflection pool shaded by centuries-old mulberry trees, flanked by Nadir Divan-Begi Madrasah and Khanqah.',
          highlight_tip: 'Dine beside the water in the evening and observe the phoenix mosaics above the madrasah portal.',
          latitude: 39.7732,
          longitude: 64.4208
        }
      ]
    },
    {
      slug: 'khiva',
      name: 'Khiva',
      region: 'Khorezm Oasis',
      category: 'Oasis & Fortress',
      tagline: 'A Preserved Mudbrick Citadel Frozen in Time',
      short_description:
        'Step inside Itchan Kala’s towering ochre ramparts to wander car-free lanes of turquoise minarets and carved elm columns.',
      history_text:
        'Positioned along the western caravan route toward the Caspian Sea, Khiva rose to prominence as the capital of the Khanate of Khorezm. Legend tells that travelers quenched their thirst at the Kheivak well dug by Shem, son of Noah. Today, its inner walled city, Itchan Kala, remains Central Asia’s most intact fortified medieval town.',
      architecture_notes:
        'Khiva’s distinctive aesthetic pairs sun-baked adobe fortifications with shimmering sky-blue Khorezmian majolica tiles and masterfully carved wooden pillars supporting open-air summer mosques.',
      best_time: 'April – June & September – October',
      recommended_days: '2 Days',
      unesco_year: 'UNESCO 1990',
      elevation_m: 109,
      latitude: 41.3775,
      longitude: 60.3639,
      hero_image: '/src/assets/images/dest_khiva_itchankala_1795670679526.jpg',
      secondary_image: '/src/assets/images/landscape_kyzylkum_desert_1795670766338.jpg',
      is_featured: 1,
      travel_tips: [
        'Stay overnight inside Itchan Kala to experience silent, lantern-lit cobblestone alleys after day-trippers depart.',
        'Climb the Kuhna Ark watchtower 45 minutes before sunset for sweeping views over Kalta Minor and the desert horizon.',
        'Try Khorezmian Shivit Oshi (bright green dill-infused noodles) unique to Khiva.'
      ],
      attractions: [
        {
          name: 'Itchan Kala',
          era: '14th–19th Century',
          summary:
            'The UNESCO-protected inner walled city enclosed by 2.2 kilometers of crenellated clay ramparts, housing over 50 historic monuments.',
          highlight_tip: 'Enter through the West Gate (Ata Darvoza) at dawn when bakers light clay tandoor ovens along the lane.',
          latitude: 41.3783,
          longitude: 60.3596
        },
        {
          name: 'Kalta Minor Minaret',
          era: '1851–1855',
          summary:
            'An unforgettable 29-meter unfinished tower wrapped completely in luminous bands of turquoise, emerald, and white glazed tile.',
          highlight_tip: 'Look closely at the cobalt calligraphy bands circling the upper rim.',
          latitude: 41.3782,
          longitude: 60.3585
        },
        {
          name: 'Juma Mosque & Forest of Columns',
          era: '10th–18th Century',
          summary:
            'A tranquil hypostyle prayer hall supported by 213 intricately carved wooden columns, some dating back over a thousand years.',
          highlight_tip: 'Pause beneath the twin ceiling light wells that cast natural spotlights onto the ancient elm woodwork.',
          latitude: 41.3780,
          longitude: 60.3602
        }
      ]
    },
    {
      slug: 'tashkent',
      name: 'Tashkent',
      region: 'Chirchiq Oasis',
      category: 'Modern & Mountain',
      tagline: 'Where Ancient Bazaars Meet Tree-Lined Boulevards & Metro Palaces',
      short_description:
        'Uzbekistan’s dynamic capital blends Silk Road spice markets and 16th-century manuscripts with Soviet-era mosaic grandeur and leafy cafes.',
      history_text:
        'Known historically as Chach, Tashkent has served for over 2,200 years as the northern gateway between settled oases and nomadic steppes. Rebuilt after the 1966 earthquake with lush parks, monumental fountains, and ornate marble metro stations, modern Tashkent bridges deep Islamic scholarship with cosmopolitan Central Asian vitality.',
      architecture_notes:
        'Discover medieval brick ensembles like Khast Imam alongside modernist 1970s mosaic facades, Art Deco opera halls, and underground metro stations themed around astronomy and poetry.',
      best_time: 'Year-round (Peak: April – October)',
      recommended_days: '2 Days',
      unesco_year: 'Heritage Hub',
      elevation_m: 455,
      latitude: 41.2995,
      longitude: 69.2401,
      hero_image: '/src/assets/images/dest_tashkent_chorsu_1795670679873.jpg',
      secondary_image: '/src/assets/images/food_uzbek_plov_1795670683683.jpg',
      is_featured: 1,
      travel_tips: [
        'Ride the Tashkent Metro across Kosmonavtlar, Alisher Navoi, and Mustaqillik Maydoni stations.',
        'Visit Besh Qozon (Central Asian Plov Center) before 13:00 to watch chefs stir steaming cauldrons for thousands of guests.',
        'Take a 90-minute excursion north to the Chimgan Mountains and Charvak Reservoir.'
      ],
      attractions: [
        {
          name: 'Chorsu Bazaar',
          era: 'Ancient / 1980s Dome',
          summary:
            'Crowned by a colossal turquoise-ribbed dome, Tashkent’s historic market overflows with saffron, mountain honey, dried melons, and hot flatbreads.',
          highlight_tip: 'Head to the upper balcony inside the main dome for a dramatic aerial view of spice and nut stalls.',
          latitude: 41.3266,
          longitude: 69.2351
        },
        {
          name: 'Amir Timur Square',
          era: '19th Century – Present',
          summary:
            'The manicured civic heart of Tashkent centered on the bronze equestrian statue of Amir Timur and surrounded by historic clock towers.',
          highlight_tip: 'Pair your walk with the State Museum of Timurid History just off the square.',
          latitude: 41.3111,
          longitude: 69.2797
        },
        {
          name: 'Khast Imam Complex',
          era: '16th Century',
          summary:
            'The spiritual heart of Tashkent housing Barak-Khan Madrasah, Muyi Muborak Library, and one of the world’s oldest parchment Qurans.',
          highlight_tip: 'Stroll the adjacent Old Mahalla mud-walled lanes of Hastimom for authentic neighborhood atmosphere.',
          latitude: 41.3372,
          longitude: 69.2401
        }
      ]
    },
    {
      slug: 'shahrisabz',
      name: 'Shahrisabz',
      region: 'Kashkadarya Foothills',
      category: 'Timurid Capitals',
      tagline: 'The Emerald Birthplace of Amir Timur Beneath Mountain Peaks',
      short_description:
        'A serene garden city framed by the Zeravshan Range, celebrated for the towering mosaic portals of Timur’s Ak-Saray Palace.',
      history_text:
        'Meaning "The Green City" in Persian, Shahrisabz (ancient Kesh) was the ancestral homeland of Amir Timur, born nearby in 1336. Determined to honor his birthplace, Timur commissioned a palace of unprecedented scale—Ak-Saray—whose vaulted portal was so monumental that its inscription famously challenged visitors: "If you doubt our power, look upon our buildings."',
      architecture_notes:
        'Even in ruin, Ak-Saray’s twin 38-meter surviving pylons showcase dazzling cobalt, turquoise, and gold Kufic calligraphy backed by dramatic alpine foothills.',
      best_time: 'April – June & September – October',
      recommended_days: '1 Day (Scenic Drive from Samarkand)',
      unesco_year: 'UNESCO 2000',
      elevation_m: 622,
      latitude: 39.0578,
      longitude: 66.8342,
      hero_image: '/src/assets/images/dest_shahrisabz_aksaray_1795670680514.jpg',
      secondary_image: '/src/assets/images/culture_navruz_festival_1795670683512.jpg',
      is_featured: 1,
      travel_tips: [
        'Cross the scenic Takhtakaracha Mountain Pass (1,675 m) from Samarkand and stop at roadside stalls for mountain herbs and kurut.',
        'Explore the quiet cypress avenues linking Ak-Saray to Dorut Tilovat and Dorus Siadat.',
        'Look for traditional Kashkadarya geometric embroidery in the local artisans’ courtyard.'
      ],
      attractions: [
        {
          name: 'Ak-Saray Palace',
          era: '1380–1404',
          summary:
            'The monumental summer palace of Amir Timur, whose surviving twin mosaic gate towers remain among the grandest Timurid structures ever raised.',
          highlight_tip: 'Examine the surviving braided turquoise tile borders at the base of the western pylon.',
          latitude: 39.0609,
          longitude: 66.8288
        },
        {
          name: 'Dorut Tilovat Complex',
          era: '1437',
          summary:
            'Known as the "House of Meditation," anchored by the Kok Gumbaz (Blue Dome) Friday Mosque built by Ulugh Beg in honor of his father Shah Rukh.',
          highlight_tip: 'Step into the quiet courtyard beside the ancient plane trees for peaceful contemplation.',
          latitude: 39.0532,
          longitude: 66.8295
        },
        {
          name: 'Dorus Siadat Mausoleum',
          era: '1380–1392',
          summary:
            'Timur’s dynastic burial complex built for his eldest son Jahangir, featuring a tall conical dome and an underground limestone crypt.',
          highlight_tip: 'Notice the dramatic contrast between the austere stone crypt intended for Timur and the ornate brick upper shrine.',
          latitude: 39.0528,
          longitude: 66.8336
        }
      ]
    }
  ];

  for (const dest of destinationsData) {
    const info = insertDestination.run(
      dest.slug,
      dest.name,
      dest.region,
      dest.category,
      dest.tagline,
      dest.short_description,
      dest.history_text,
      dest.architecture_notes,
      dest.best_time,
      dest.recommended_days,
      dest.unesco_year,
      dest.elevation_m,
      dest.latitude,
      dest.longitude,
      dest.hero_image,
      dest.secondary_image,
      dest.is_featured,
      JSON.stringify(dest.travel_tips)
    );
    const destId = Number(info.lastInsertRowid);
    for (const attr of dest.attractions) {
      insertAttraction.run(
        destId,
        attr.name,
        attr.era,
        attr.summary,
        attr.highlight_tip,
        attr.latitude,
        attr.longitude
      );
    }
  }

  const insertExperience = db.prepare(`
    INSERT INTO experiences (
      slug, title, destination_slug, city_name, category, duration, price_usd, season, summary, highlights_json, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const experiencesData = [
    {
      slug: 'registan-golden-hour-architecture-walk',
      title: 'Registan Golden Hour & Astronomical Heritage Walk',
      destination_slug: 'samarkand',
      city_name: 'Samarkand',
      category: 'Architecture',
      duration: '3 Hours',
      price_usd: 55,
      season: 'Year-round',
      summary:
        'Explore the hidden astronomical motifs, gilded Tilya-Kori vaults, and evening illumination of Registan Square with an architectural historian.',
      highlights: ['Private access insights into Timurid calligraphy', 'Ulugh Beg Observatory context', 'Blue hour photography framing'],
      image_url: '/src/assets/images/hero_registan_samarkand_1795670679164.jpg'
    },
    {
      slug: 'kyzylkum-desert-yurt-stargazing',
      title: 'Kyzylkum Desert Yurt Camp & Aidarkul Twilight',
      destination_slug: 'bukhara',
      city_name: 'Bukhara & Nurata',
      category: 'Desert & Nature',
      duration: '2 Days / 1 Night',
      price_usd: 165,
      season: 'March – November',
      summary:
        'Journey beyond the oasis to sleep inside traditional felt-covered yurts beside Aidarkul Lake under pristine Silk Road desert skies.',
      highlights: ['Camel trekking across golden dunes', 'Campfire dutar folk songs', 'Lakeside sunrise breakfast'],
      image_url: '/src/assets/images/landscape_kyzylkum_desert_1795670766338.jpg'
    },
    {
      slug: 'chorsu-spice-plov-masterclass',
      title: 'Chorsu Bazaar Spice Trail & Samarkand Plov Workshop',
      destination_slug: 'tashkent',
      city_name: 'Tashkent',
      category: 'Culinary',
      duration: '4 Hours',
      price_usd: 68,
      season: 'Year-round',
      summary:
        'Source yellow carrots, barberries, and Uzbek cumin at Chorsu Bazaar before cooking authentic kazan plov beside a master oshpaz.',
      highlights: ['Guided spice & dried fruit tasting', 'Wood-fired kazan technique', 'Fresh tandoor non baking'],
      image_url: '/src/assets/images/food_uzbek_plov_1795670683683.jpg'
    },
    {
      slug: 'bukhara-ikat-suzani-atelier',
      title: 'Silk Ikat & Suzani Embroidery Atelier Session',
      destination_slug: 'bukhara',
      city_name: 'Bukhara',
      category: 'Artisan Craft',
      duration: '2.5 Hours',
      price_usd: 45,
      season: 'Year-round',
      summary:
        'Meet fourth-generation textile masters in a historic Bukharan courtyard to learn natural pomegranate dyeing and tambour chain-stitching.',
      highlights: ['Natural madder & indigo dye studio', 'Hands-on embroidery sampler', 'Green tea ceremony in carved ayvan'],
      image_url: '/src/assets/images/culture_clothing_suzani_1795670682175.jpg'
    },
    {
      slug: 'khiva-dawn-citadel-ramparts',
      title: 'Itchan Kala Dawn Ramparts & Khorezm Bakery Walk',
      destination_slug: 'khiva',
      city_name: 'Khiva',
      category: 'Heritage',
      duration: '2.5 Hours',
      price_usd: 40,
      season: 'March – November',
      summary:
        'Walk the quiet clay fortifications of Khiva at first light as tandoor ovens glow and the turquoise tiles of Kalta Minor ignite in sunrise amber.',
      highlights: ['Sunrise panoramic fortress walk', 'Juma Mosque carved timber study', 'Warm morning non tasting'],
      image_url: '/src/assets/images/dest_khiva_itchankala_1795670679526.jpg'
    },
    {
      slug: 'rishtan-ceramic-glazing-heritage',
      title: 'Ishkor Glaze & Traditional Chaikhana Hospitality',
      destination_slug: 'shahrisabz',
      city_name: 'Shahrisabz & Fergana',
      category: 'Artisan Craft',
      duration: '3 Hours',
      price_usd: 52,
      season: 'Year-round',
      summary:
        'Discover mineral plant-ash turquoise glazes and experience unhurried Uzbek chaikhana hospitality with samovar green tea and dutar melodies.',
      highlights: ['Mineral turquoise glazing demonstration', 'Traditional piala tea etiquette', 'Live folk string performance'],
      image_url: '/src/assets/images/culture_rishtan_ceramics_1795670682154.jpg'
    }
  ];

  for (const exp of experiencesData) {
    insertExperience.run(
      exp.slug,
      exp.title,
      exp.destination_slug,
      exp.city_name,
      exp.category,
      exp.duration,
      exp.price_usd,
      exp.season,
      exp.summary,
      JSON.stringify(exp.highlights),
      exp.image_url
    );
  }

  const insertCulture = db.prepare(`
    INSERT INTO culture_items (
      slug, title, category, subtitle, region, description, heritage_note, image_url, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cultureData = [
    {
      slug: 'uzbek-traditional-clothing',
      title: 'Uzbek Traditional Clothing',
      category: 'Textiles & Attire',
      subtitle: 'Khan-Atlas Silk, Abrbandi Ikat & Embroidered Doppi',
      region: 'Margilan & Bukhara',
      description:
        'Uzbek ceremonial dress is an expression of regional identity and living geometry. Flowing quilted chapan robes, luminous khan-atlas silk dresses, and hand-stitched doppi skullcaps carry centuries-old abrbandi ("cloud-binding") resist-dyed patterns inspired by pomegranate blossoms, almond motifs, and flowing river currents.',
      heritage_note: 'UNESCO Intangible Cultural Heritage — Margilan Craft Development Center',
      image_url: '/src/assets/images/culture_clothing_suzani_1795670682175.jpg',
      sort_order: 1
    },
    {
      slug: 'national-crafts-ceramics',
      title: 'National Crafts & Ceramics',
      category: 'Artisan Heritage',
      subtitle: 'Ishkor-Glazed Pottery, Woodcarving & Chased Brassware',
      region: 'Rishtan, Gijduvan & Khiva',
      description:
        'From the luminous turquoise and cobalt majolica of Rishtan to the earthy ochre-green ceramics of Gijduvan, Uzbek artisans still prepare natural ishkor glazes from desert mountain herbs. Alongside pottery, Bukharan chased copper trays and Khivan carved walnut doors sustain multi-generational family guilds.',
      heritage_note: 'Over 900 years of continuous ceramic workshop lineage in the Fergana Valley',
      image_url: '/src/assets/images/culture_rishtan_ceramics_1795670682154.jpg',
      sort_order: 2
    },
    {
      slug: 'suzani-embroidery',
      title: 'Suzani Embroidery',
      category: 'Textiles & Attire',
      subtitle: 'Needlework Stories of Prosperity, Sun & Pomegranate',
      region: 'Nurata, Samarkand & Shakhrisabz',
      description:
        'Derived from the Persian word for needle ("suzan"), Suzani wall hangings were traditionally stitched by brides and mothers as cherished wedding dowries. Using silk thread on hand-loomed cotton, each medallion carries protective symbolism—pomegranates for abundance, rosettes for the sun, and chili motifs to ward off misfortune.',
      heritage_note: 'Each region boasts distinct stitch styles: bosma, yurma, and kanda-khayol',
      image_url: '/src/assets/images/culture_clothing_suzani_1795670682175.jpg',
      sort_order: 3
    },
    {
      slug: 'traditional-music-dance',
      title: 'Traditional Music & Dance',
      category: 'Performing Arts',
      subtitle: 'Shashmaqam Court Suites, Dutar Strings & Expressive Lazgi',
      region: 'Bukhara, Khorezm & Tashkent',
      description:
        'Uzbekistan’s musical soul spans the meditative classical suites of Shashmaqam—sung with Sufi poetry to the accompaniment of tanbur, dutar, and doira frame drums—and the joyous, rhythmic Khorezm Lazgi dance, whose sparkling wrist movements celebrate vitality and light.',
      heritage_note: 'Both Shashmaqam and Khorezm Lazgi are inscribed by UNESCO',
      image_url: '/src/assets/images/culture_music_hospitality_1795670683064.jpg',
      sort_order: 4
    },
    {
      slug: 'hospitality-and-customs',
      title: 'Hospitality & Tea Customs',
      category: 'Living Customs',
      subtitle: 'Mehmondostlik — The Sacred Art of Welcoming a Guest',
      region: 'Nationwide',
      description:
        'In Uzbek homes, a guest is honored as "higher than one’s father." Visitors are welcomed onto cushioned tapchan daybeds beneath carved walnut ayvans, where the host pours fragrant green kuk-choy three times (qaytarish) before offering a warm piala filled halfway—an unmistakable sign of respect inviting unhurried conversation.',
      heritage_note: 'Breaking round Non flatbread by hand begins every shared meal',
      image_url: '/src/assets/images/culture_music_hospitality_1795670683064.jpg',
      sort_order: 5
    },
    {
      slug: 'navruz-celebrations',
      title: 'Navruz Celebrations',
      category: 'Festivals',
      subtitle: 'Vernal Equinox, Sumalak Cauldrons & Spring Renewal',
      region: 'Nationwide (March 21)',
      description:
        'Celebrating the arrival of spring for over 3,000 years, Navruz unites neighborhoods around towering copper cauldrons where women stir sweet sprouted-wheat sumalak through the night with songs and wishes. Dawn brings brass karnay fanfare, apricot blossoms, kite flying, and kupkari equestrian games.',
      heritage_note: 'Inscribed on UNESCO’s Intangible Cultural Heritage list',
      image_url: '/src/assets/images/culture_navruz_festival_1795670683512.jpg',
      sort_order: 6
    },
    {
      slug: 'local-cultural-festivals',
      title: 'Silk Road Cultural Festivals',
      category: 'Festivals',
      subtitle: 'Sharq Taronalari, Silk & Spices, and Bakhshi Storytelling',
      region: 'Samarkand, Bukhara & Termez',
      description:
        'Throughout spring and autumn, Uzbekistan’s monumental squares transform into open-air stages. Samarkand hosts the biennial Sharq Taronalari ("Melodies of the Orient") beneath Registan’s illuminated domes, while Bukhara’s Silk & Spices Festival fills medieval trading domes with artisan parades and folk ensembles.',
      heritage_note: 'Peak festival calendar spans late March through September',
      image_url: '/src/assets/images/hero_registan_samarkand_1795670679164.jpg',
      sort_order: 7
    }
  ];

  for (const item of cultureData) {
    insertCulture.run(
      item.slug,
      item.title,
      item.category,
      item.subtitle,
      item.region,
      item.description,
      item.heritage_note,
      item.image_url,
      item.sort_order
    );
  }

  const insertCuisine = db.prepare(`
    INSERT INTO cuisine_items (
      slug, name, uzbek_name, origin_city, course_type, prep_time, description, cultural_background, key_ingredients_json, image_url, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cuisineData = [
    {
      slug: 'plov',
      name: 'Plov',
      uzbek_name: 'Osh / Palov',
      origin_city: 'Samarkand & Tashkent',
      course_type: 'Mains & Feasts',
      prep_time: '2.5 Hours',
      description:
        'Uzbekistan’s crowning culinary emblem: fragrant Devzira or laser rice steamed over slow-braised lamb, golden yellow carrots, caramelized onions, cumin, chickpeas, and whole roasted garlic in a heavy cast-iron kazan.',
      cultural_background:
        'Recognized by UNESCO, plov anchors weddings, hospitality gatherings, and morning community feasts (nahor oshi). Every region guards its own signature: Samarkand layers ingredients cleanly without stirring, while Tashkent blends raisins and quail eggs into rich Wedding Plov.',
      key_ingredients: ['Aged Rice', 'Tender Lamb', 'Yellow & Red Carrots', 'Cumin & Barberries', 'Whole Garlic', 'Chickpeas'],
      image_url: '/src/assets/images/food_uzbek_plov_1795670683683.jpg',
      sort_order: 1
    },
    {
      slug: 'samsa',
      name: 'Samsa',
      uzbek_name: 'Tandir Somsa',
      origin_city: 'Jizzakh, Samarkand & Bukhara',
      course_type: 'Bakery & Street',
      prep_time: '1 Hour',
      description:
        'Flaky, golden triangular or teardrop pastries filled with hand-chopped lamb, sweet onion, and warm cumin, slapped onto the blazing clay walls of a wood-fired tandoor oven until blistered and crisp.',
      cultural_background:
        'Samsa is the unmistakable aroma of morning bazaars along the Silk Road. In spring, bakeries also stuff delicate dough with wild green herbs (kok somsa) or sweet spiced pumpkin.',
      key_ingredients: ['Laminated Dough', 'Hand-Diced Lamb', 'Sweet Onion', 'Black Nigella Seeds', 'Cumin', 'Sesame'],
      image_url: '/src/assets/images/food_uzbek_samsa_1795670682990.jpg',
      sort_order: 2
    },
    {
      slug: 'lagman',
      name: 'Lagman',
      uzbek_name: 'Lag‘mon',
      origin_city: 'Tashkent & Fergana Valley',
      course_type: 'Mains & Feasts',
      prep_time: '1.5 Hours',
      description:
        'Springy, hand-pulled wheat noodles stretched from a single continuous ribbon of dough and bathed in a vibrant, aromatic stew of seared beef, crisp bell peppers, radishes, garlic, and vine-ripened tomatoes.',
      cultural_background:
        'Born from cultural exchange along the eastern Silk Road corridors, lagman celebrates kinetic kitchen artistry—master chefs swing and slap dough against wooden boards to create noodles of extraordinary chew and Silk Road warmth.',
      key_ingredients: ['Hand-Pulled Noodles', 'Seared Beef', 'Bell Peppers', 'Garlic & Star Anise', 'Tomatoes', 'Fresh Cilantro'],
      image_url: '/src/assets/images/food_uzbek_lagman_1795670784214.jpg',
      sort_order: 3
    },
    {
      slug: 'manti',
      name: 'Manti',
      uzbek_name: 'Manti',
      origin_city: 'Bukhara & Samarkand',
      course_type: 'Mains & Feasts',
      prep_time: '1.5 Hours',
      description:
        'Generous, hand-pleated steamed dumplings filled with finely diced lamb, sweet onion, and aromatic black pepper, served steaming hot with cool tangy suzma yogurt and garden herbs.',
      cultural_background:
        'Steamed in multi-tiered metal kaskon pots for family gatherings, manti showcase the patience of Uzbek home cooking—true connoisseurs insist the meat must always be hand-chopped with a heavy knife rather than ground so juices remain sealed inside the delicate wrapper.',
      key_ingredients: ['Thin Wheat Dough', 'Hand-Chopped Lamb', 'Sweet Onion', 'Suzma Yogurt', 'Crushed Black Pepper', 'Dill'],
      image_url: '/src/assets/images/food_uzbek_manti_1795670707920.jpg',
      sort_order: 4
    },
    {
      slug: 'shashlik',
      name: 'Shashlik',
      uzbek_name: 'Kabob / Shashlik',
      origin_city: 'Gijduvan & Nationwide',
      course_type: 'Mains & Feasts',
      prep_time: '45 Mins',
      description:
        'Juicy skewers of lamb, beef, or spiced minced qiyma grilled over glowing saxaul desert wood embers, crowned with paper-thin sumac-marinated red onions and fresh pomegranate seeds.',
      cultural_background:
        'Whether at bustling chaikhanas beside mountain streams or evening courtyards in Gijduvan, shashlik masters fan glowing charcoal with woven reed fans to achieve a smoky crust while keeping the center impossibly tender.',
      key_ingredients: ['Marinated Lamb', 'Coriander Seed', 'Red Onion', 'Sumac', 'Pomegranate Pearls', 'Saxaul Embers'],
      image_url: '/src/assets/images/food_uzbek_shashlik_1795670785363.jpg',
      sort_order: 5
    },
    {
      slug: 'non',
      name: 'Non',
      uzbek_name: 'Samarqand Noni / Patir',
      origin_city: 'Samarkand & Nationwide',
      course_type: 'Bakery & Street',
      prep_time: '2 Hours',
      description:
        'Iconic round, golden-crusted leavened flatbreads stamped in the center with an ornate wooden chakich pin-wheel, baked on the scorching interior walls of a clay tandoor.',
      cultural_background:
        'In Uzbek tradition, bread is sacred—never placed upside down, never cut with a knife, and always torn by hand to bless the table. Samarkand non is so prized for its dense, fragrant crumb that travelers famously carry loaves home as treasured gifts.',
      key_ingredients: ['Stone-Milled Wheat Flour', 'Natural Starter', 'Sesame & Nigella', 'Milk or Butter (Patir)', 'Sea Salt'],
      image_url: '/src/assets/images/food_uzbek_non_1795670766967.jpg',
      sort_order: 6
    },
    {
      slug: 'shurpa',
      name: 'Shurpa',
      uzbek_name: 'Sho‘rva',
      origin_city: 'Tashkent & Kashkadarya',
      course_type: 'Soups',
      prep_time: '2 Hours',
      description:
        'A deeply nourishing golden broth slow-simmered with bone-in lamb, whole sweet carrots, tender potatoes, chickpeas, sweet peppers, and a finishing shower of fresh mountain dill and cilantro.',
      cultural_background:
        'Often served as the comforting opening course in Uzbek chaikhanas, shurpa exemplifies patience and pure ingredients—gentle simmering extracts velvety richness without heavy creams, leaving a restorative elixir flavored by whole herbs.',
      key_ingredients: ['Bone-In Lamb', 'Whole Carrots', 'Chickpeas', 'Potatoes', 'Fresh Dill & Cilantro', 'Coriander'],
      image_url: '/src/assets/images/food_uzbek_shurpa_1795670784939.jpg',
      sort_order: 7
    }
  ];

  for (const dish of cuisineData) {
    insertCuisine.run(
      dish.slug,
      dish.name,
      dish.uzbek_name,
      dish.origin_city,
      dish.course_type,
      dish.prep_time,
      dish.description,
      dish.cultural_background,
      JSON.stringify(dish.key_ingredients),
      dish.image_url,
      dish.sort_order
    );
  }

  const insertGallery = db.prepare(`
    INSERT INTO gallery_items (
      title, category, location, destination_slug, photographer_credit, caption, image_url, likes, is_wide
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const galleryData = [
    {
      title: 'Twilight Over Registan Square',
      category: 'Architecture',
      location: 'Samarkand',
      destination_slug: 'samarkand',
      photographer_credit: 'Azizbek Karimov',
      caption: 'Three grand madrasahs glow in twilight gold as the turquoise dome of Tilya-Kori mirrors the dusk sky.',
      image_url: '/src/assets/images/hero_registan_samarkand_1795670679164.jpg',
      likes: 184,
      is_wide: 1
    },
    {
      title: 'Corridor of Cobalt Majolica',
      category: 'Architecture',
      location: 'Shah-i-Zinda, Samarkand',
      destination_slug: 'samarkand',
      photographer_credit: 'Madina Tursunova',
      caption: 'Morning shadows sweep across 14th-century carved ceramic portals along the Avenue of Mausoleums.',
      image_url: '/src/assets/images/dest_samarkand_shahizinda_1795670678180.jpg',
      likes: 142,
      is_wide: 0
    },
    {
      title: 'The Great Kalyan Minaret',
      category: 'Architecture',
      location: 'Bukhara',
      destination_slug: 'bukhara',
      photographer_credit: 'Timur Rakhimov',
      caption: 'Standing since 1127, Bukhara’s masterwork of baked brick rises beside the Mir-i-Arab turquoise domes.',
      image_url: '/src/assets/images/dest_bukhara_poikalyan_1795670678571.jpg',
      likes: 159,
      is_wide: 0
    },
    {
      title: 'Sunrise Over Itchan Kala',
      category: 'Architecture',
      location: 'Khiva',
      destination_slug: 'khiva',
      photographer_credit: 'Kamola Yusupova',
      caption: 'Amber dawn light grazes Kalta Minor and the ancient earthen walls of Khorezm’s walled inner city.',
      image_url: '/src/assets/images/dest_khiva_itchankala_1795670679526.jpg',
      likes: 168,
      is_wide: 0
    },
    {
      title: 'Kyzylkum Yurt Sanctuary',
      category: 'Landscapes',
      location: 'Aidarkul & Kyzylkum Desert',
      destination_slug: 'bukhara',
      photographer_credit: 'Sardor Alimov',
      caption: 'Warm lantern light welcomes travelers to a desert yurt camp overlooking Aidarkul Lake at dusk.',
      image_url: '/src/assets/images/landscape_kyzylkum_desert_1795670766338.jpg',
      likes: 211,
      is_wide: 1
    },
    {
      title: 'Suzani & Silk Ikat Courtyard',
      category: 'Culture',
      location: 'Bukhara',
      destination_slug: 'bukhara',
      photographer_credit: 'Dilnoza Saidova',
      caption: 'Hand-dyed abrbandi chapan coats and pomegranate Suzani textiles hang in a carved walnut veranda.',
      image_url: '/src/assets/images/culture_clothing_suzani_1795670682175.jpg',
      likes: 127,
      is_wide: 0
    },
    {
      title: 'Rishtan Turquoise Ceramics',
      category: 'Culture',
      location: 'Fergana Valley',
      destination_slug: 'tashkent',
      photographer_credit: 'Rustam Nazarov',
      caption: 'Natural mineral-glazed lagan platters painted freehand in a master Rishtan pottery studio.',
      image_url: '/src/assets/images/culture_rishtan_ceramics_1795670682154.jpg',
      likes: 118,
      is_wide: 0
    },
    {
      title: 'Navruz Karnay Fanfare',
      category: 'Culture',
      location: 'Shahrisabz',
      destination_slug: 'shahrisabz',
      photographer_credit: 'Azizbek Karimov',
      caption: 'Long brass karnay horns and doira frame drums herald the vernal equinox beneath blossoming apricot trees.',
      image_url: '/src/assets/images/culture_navruz_festival_1795670683512.jpg',
      likes: 134,
      is_wide: 0
    },
    {
      title: 'Samarkand Ceremonial Plov',
      category: 'Cuisine',
      location: 'Samarkand',
      destination_slug: 'samarkand',
      photographer_credit: 'Madina Tursunova',
      caption: 'Golden rice, yellow carrots, whole roasted garlic, and ruby pomegranate jewels in a ceramic lagan.',
      image_url: '/src/assets/images/food_uzbek_plov_1795670683683.jpg',
      likes: 196,
      is_wide: 0
    },
    {
      title: 'Chorsu Bazaar Spice Dome',
      category: 'Landscapes',
      location: 'Tashkent',
      destination_slug: 'tashkent',
      photographer_credit: 'Sardor Alimov',
      caption: 'Saffron, dried apricots, and tandoor loaves spill across market tables beneath Chorsu’s turquoise dome.',
      image_url: '/src/assets/images/dest_tashkent_chorsu_1795670679873.jpg',
      likes: 145,
      is_wide: 0
    },
    {
      title: 'Ak-Saray Beneath the Zeravshan Peaks',
      category: 'Architecture',
      location: 'Shahrisabz',
      destination_slug: 'shahrisabz',
      photographer_credit: 'Timur Rakhimov',
      caption: 'The surviving mosaic portal towers of Timur’s summer palace stand framed by lush gardens and mountains.',
      image_url: '/src/assets/images/dest_shahrisabz_aksaray_1795670680514.jpg',
      likes: 129,
      is_wide: 0
    },
    {
      title: 'Sacred Tandoor Non Loaves',
      category: 'Cuisine',
      location: 'Samarkand',
      destination_slug: 'samarkand',
      photographer_credit: 'Kamola Yusupova',
      caption: 'Freshly pulled flatbreads stamped with geometric chakich medallions rest beside an earthen tandoor.',
      image_url: '/src/assets/images/food_uzbek_non_1795670766967.jpg',
      likes: 151,
      is_wide: 0
    }
  ];

  for (const g of galleryData) {
    insertGallery.run(
      g.title,
      g.category,
      g.location,
      g.destination_slug,
      g.photographer_credit,
      g.caption,
      g.image_url,
      g.likes,
      g.is_wide
    );
  }

  const insertReview = db.prepare(`
    INSERT INTO reviews (
      destination_slug, author_name, author_country, rating, visit_season, title, comment, helpful_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const reviewsData = [
    {
      destination_slug: 'samarkand',
      author_name: 'Elena Rostova',
      author_country: 'France',
      rating: 5,
      visit_season: 'Autumn (September)',
      title: 'Registan at twilight is unforgettable',
      comment:
        'Standing in the center of Registan Square as the golden floodlights ignite against the cobalt twilight sky is one of the finest architectural experiences on earth. Do not miss Shah-i-Zinda at 8 AM before tour buses arrive.',
      helpful_count: 14
    },
    {
      destination_slug: 'samarkand',
      author_name: 'Marcus Lindqvist',
      author_country: 'Sweden',
      rating: 5,
      visit_season: 'Spring (April)',
      title: 'Effortless high-speed rail & living history',
      comment:
        'The Afrosiyob train from Tashkent made reaching Samarkand effortless. Pairing Gur-e-Amir with an afternoon watching mulberry paper craft in Konigil gave us both monumental grandeur and intimate heritage.',
      helpful_count: 9
    },
    {
      destination_slug: 'bukhara',
      author_name: 'Claire Beaumont',
      author_country: 'Canada',
      rating: 5,
      visit_season: 'Spring (May)',
      title: 'A city made for slow wandering',
      comment:
        'Bukhara has a completely different rhythm from Samarkand—intimate courtyard guesthouses, artisans weaving silk ikat beneath medieval trading domes, and green tea beside Lyabi-Hauz.',
      helpful_count: 11
    },
    {
      destination_slug: 'khiva',
      author_name: 'Kenji Takahashi',
      author_country: 'Japan',
      rating: 5,
      visit_season: 'Autumn (October)',
      title: 'Sleeping inside the ancient mudbrick walls',
      comment:
        'Staying inside Itchan Kala transformed our visit. Walking past Kalta Minor after sunset when the clay lanes empty out felt like stepping directly into the 18th century.',
      helpful_count: 8
    },
    {
      destination_slug: 'tashkent',
      author_name: 'Sophia Al-Mansoor',
      author_country: 'UAE',
      rating: 5,
      visit_season: 'Spring (April)',
      title: 'Vibrant markets and remarkable hospitality',
      comment:
        'Chorsu Bazaar alone is worth two mornings—the spice pyramids and warm tandoor non are extraordinary. Plus the Soviet-era mosaic metro stations look like underground art museums.',
      helpful_count: 7
    },
    {
      destination_slug: 'shahrisabz',
      author_name: 'David Mercer',
      author_country: 'United Kingdom',
      rating: 5,
      visit_season: 'Autumn (September)',
      title: 'Dramatic mountain pass & Timurid scale',
      comment:
        'The drive across the Takhtakaracha Pass from Samarkand was breathtaking, and standing beneath the sheer height of Ak-Saray’s surviving towers makes you appreciate Timur’s ambition.',
      helpful_count: 6
    }
  ];

  for (const r of reviewsData) {
    insertReview.run(
      r.destination_slug,
      r.author_name,
      r.author_country,
      r.rating,
      r.visit_season,
      r.title,
      r.comment,
      r.helpful_count
    );
  }

  const insertItinerary = db.prepare(`
    INSERT INTO itinerary_items (
      trip_code, item_type, item_slug, title, city, day_number, preferred_month, notes, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertItinerary.run(
    'SILK-2026',
    'destination',
    'tashkent',
    'Tashkent Arrival & Chorsu Bazaar',
    'Tashkent',
    1,
    'April',
    'Morning metro art tour, Chorsu spice stalls, and evening plov dinner.',
    '/src/assets/images/dest_tashkent_chorsu_1795670679873.jpg'
  );
  insertItinerary.run(
    'SILK-2026',
    'destination',
    'samarkand',
    'Samarkand: Registan & Shah-i-Zinda',
    'Samarkand',
    3,
    'April',
    'Board 08:00 Afrosiyob high-speed train; sunset architectural walk at Registan.',
    '/src/assets/images/hero_registan_samarkand_1795670679164.jpg'
  );
  insertItinerary.run(
    'SILK-2026',
    'destination',
    'bukhara',
    'Bukhara: Poi Kalyan & Artisan Domes',
    'Bukhara',
    6,
    'April',
    'Check into Lyabi-Hauz courtyard riad; afternoon Suzani & silk ikat atelier.',
    '/src/assets/images/dest_bukhara_poikalyan_1795670678571.jpg'
  );
}
