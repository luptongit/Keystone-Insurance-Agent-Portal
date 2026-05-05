const pool = require('../pool');

async function cid(client, slug) {
  const { rows } = await client.query('SELECT id FROM customers WHERE slug = $1', [slug]);
  if (!rows.length) throw new Error(`Customer not found: ${slug}`);
  return rows[0].id;
}

// ── CUSTOMER DETAIL UPDATES ──
// Give every customer a full name, location, contact info, etc.
const customerUpdates = [
  // Households
  { slug: 'patel-household', name: 'Patel household', location: 'Plano, TX 75024', client_since: 'June 2020', member_count: 4, lifetime_value: '$19.8K', tier: 'Silver', email: 'rpatel@outlook.com', phone: '(469) 555-0234', preferred_contact: 'Call · mornings', language: 'English', retention_detail_score: 89 },
  { slug: 'lin-household', name: 'Lin household', location: 'Sugar Land, TX 77479', client_since: 'November 2021', member_count: 3, lifetime_value: '$16.4K', tier: 'Silver', email: 'davidlin@gmail.com', phone: '(281) 555-0167', preferred_contact: 'Email', language: 'English / Mandarin', retention_detail_score: 72 },
  { slug: 'reeves-household', name: 'Reeves household', location: 'McKinney, TX 75071', client_since: 'April 2026', member_count: 3, lifetime_value: '$290', tier: null, email: 'jreeves@icloud.com', phone: '(214) 555-0392', preferred_contact: 'Text', language: 'English', retention_detail_score: 90 },
  { slug: 'walsh-family', name: 'Walsh family', location: 'Austin, TX 78745', client_since: 'March 2025', member_count: 2, lifetime_value: '$2.1K', tier: null, email: 'bwalsh@gmail.com', phone: '(512) 555-0148', preferred_contact: 'Call · evenings', language: 'English', retention_detail_score: 84 },
  { slug: 'dawson-k', name: 'Dawson household', location: 'Arlington, TX 76013', client_since: 'September 2018', member_count: 4, lifetime_value: '$22.4K', tier: 'Gold', email: 'kevin.dawson@yahoo.com', phone: '(817) 555-0271', preferred_contact: 'Text', language: 'English', retention_detail_score: 85 },
  // Individuals
  { slug: 'kim-s', name: 'Kim, Sarah', location: 'Irving, TX 75038', client_since: 'August 2023', member_count: 1, lifetime_value: '$3.8K', tier: null, email: 'sarahkim@gmail.com', phone: '(972) 555-0183', preferred_contact: 'Text', language: 'English / Korean', retention_detail_score: 58 },
  { slug: 'westbrook-d', name: 'Westbrook, Derrick', location: 'Denton, TX 76201', client_since: 'March 2024', member_count: 1, lifetime_value: '$3.1K', tier: null, email: 'dwestbrook@outlook.com', phone: '(940) 555-0214', preferred_contact: 'Call', language: 'English', retention_detail_score: 79 },
  { slug: 'henderson-t', name: 'Henderson, Tom & Maria', location: 'Frisco, TX 75034', client_since: 'January 2022', member_count: 4, lifetime_value: '$6.3K', tier: null, email: 'tom.henderson@gmail.com', phone: '(469) 555-0156', preferred_contact: 'Call · mornings', language: 'English', retention_detail_score: 87 },
  { slug: 'donovan-m', name: 'Donovan, Michael', location: 'Southlake, TX 76092', client_since: 'May 2021', member_count: 1, lifetime_value: '$11.2K', tier: 'Silver', email: 'mdonovan@proton.me', phone: '(817) 555-0398', preferred_contact: 'Email', language: 'English', retention_detail_score: 88 },
  { slug: 'chen-l', name: 'Chen, Lisa', location: 'Dallas, TX 75204', client_since: 'October 2024', member_count: 1, lifetime_value: '$3.0K', tier: null, email: 'lisachen@gmail.com', phone: '(214) 555-0423', preferred_contact: 'Text · afternoons', language: 'English / Mandarin', retention_detail_score: 61 },
  { slug: 'olsen-r', name: 'Olsen, Rachel', location: 'Keller, TX 76248', client_since: 'February 2023', member_count: 2, lifetime_value: '$7.0K', tier: null, email: 'rachelolsen@icloud.com', phone: '(817) 555-0167', preferred_contact: 'Email', language: 'English', retention_detail_score: 83 },
  { slug: 'park-j', name: 'Park, James', location: 'Cedar Park, TX 78613', client_since: 'July 2024', member_count: 1, lifetime_value: '$3.1K', tier: null, email: 'jpark@gmail.com', phone: '(512) 555-0289', preferred_contact: 'Text', language: 'English', retention_detail_score: 86 },
  { slug: 'torres-a', name: 'Torres, Angela', location: 'San Antonio, TX 78216', client_since: 'April 2023', member_count: 1, lifetime_value: '$3.5K', tier: null, email: 'atorres@yahoo.com', phone: '(210) 555-0134', preferred_contact: 'Call', language: 'English / Spanish', retention_detail_score: 93 },
  { slug: 'yamamoto-k', name: 'Yamamoto, Ken', location: 'Round Rock, TX 78681', client_since: 'August 2022', member_count: 2, lifetime_value: '$2.5K', tier: null, email: 'kyamamoto@gmail.com', phone: '(512) 555-0317', preferred_contact: 'Email', language: 'English', retention_detail_score: 91 },
  { slug: 'okonkwo-a', name: 'Okonkwo, Adaeze', location: 'Houston, TX 77005', client_since: 'June 2021', member_count: 1, lifetime_value: '$4.2K', tier: null, email: 'adaeze.okonkwo@gmail.com', phone: '(713) 555-0258', preferred_contact: 'Call · evenings', language: 'English', retention_detail_score: 95 },
  // Businesses
  { slug: 'crestline-bakery', name: 'Crestline Bakery LLC', location: 'Fort Worth, TX 76107', client_since: 'January 2020', member_count: null, lifetime_value: '$184K', tier: 'Gold', email: 'ops@crestlinebakery.com', phone: '(817) 555-0442', preferred_contact: 'Email', language: 'English', retention_detail_score: 74 },
  { slug: 'greenfield-dental', name: 'Greenfield Dental Group', location: 'Grapevine, TX 76051', client_since: 'March 2023', member_count: null, lifetime_value: '$37.2K', tier: null, email: 'admin@greenfielddental.com', phone: '(817) 555-0518', preferred_contact: 'Email', language: 'English', retention_detail_score: 71 },
  { slug: 'martinez-auto-group', name: 'Martinez Auto Group', location: 'Dallas, TX 75247', client_since: 'September 2021', member_count: null, lifetime_value: '$156K', tier: 'Gold', email: 'rmartinez@martinezauto.com', phone: '(214) 555-0637', preferred_contact: 'Call · mornings', language: 'English / Spanish', retention_detail_score: 66 },
  { slug: 'blackwood-properties', name: 'Blackwood Properties LLC', location: 'Fort Worth, TX 76102', client_since: 'June 2022', member_count: null, lifetime_value: '$32.8K', tier: null, email: 'jblackwood@blackwoodprop.com', phone: '(817) 555-0789', preferred_contact: 'Call', language: 'English', retention_detail_score: 64 },
  { slug: 'nguyen-construction', name: 'Nguyen Construction Inc', location: 'Grand Prairie, TX 75050', client_since: 'April 2022', member_count: null, lifetime_value: '$85.2K', tier: 'Silver', email: 'tnguyen@nguyenconstruction.com', phone: '(972) 555-0445', preferred_contact: 'Call · mornings', language: 'English / Vietnamese', retention_detail_score: 76 },
  { slug: 'mercer-sons', name: 'Mercer & Sons Plumbing', location: 'Mansfield, TX 76063', client_since: 'October 2023', member_count: null, lifetime_value: '$8.8K', tier: null, email: 'bill@mercersons.com', phone: '(682) 555-0291', preferred_contact: 'Call', language: 'English', retention_detail_score: 78 },
];

// ── POLICIES (for all customers except Ramirez, who already has them) ──
const allPolicies = [
  // Patel household (3 policies)
  { slug: 'patel-household', policy_number: 'POL-AU-883201', line_type: 'auto', title: 'Personal auto — 2 vehicles', subtitle: '2023 Toyota Highlander · 2021 Honda Accord · Raj & Priya Patel', premium: 2180, payment_freq: 'monthly autopay', status: 'active', status_label: 'Active' },
  { slug: 'patel-household', policy_number: 'POL-HO-556718', line_type: 'home', title: 'Homeowners — HO-3 standard', subtitle: '2,800 sqft · built 2015 · $420K dwelling · $60K personal property', premium: 1700, payment_freq: '$1,000 deductible', status: 'active', status_label: 'Active' },
  { slug: 'patel-household', policy_number: 'POL-LF-334892', line_type: 'life', title: 'Term life — Raj Patel', subtitle: '$750K · 20-year term · issued 2022 · standard preferred', premium: 920, payment_freq: 'quarterly', status: 'active', status_label: 'Active' },
  // Lin household (2 policies)
  { slug: 'lin-household', policy_number: 'POL-AU-771890', line_type: 'auto', title: 'Personal auto — 2 vehicles', subtitle: '2020 BMW X3 · 2022 Hyundai Tucson · David & Amy Lin', premium: 2240, payment_freq: 'semi-annual', status: 'active', status_label: 'Active' },
  { slug: 'lin-household', policy_number: 'POL-HO-441254', line_type: 'home', title: 'Homeowners — HO-3 standard', subtitle: '3,100 sqft · built 2012 · $510K dwelling · roof replaced 2024', premium: 2400, payment_freq: '$1,500 deductible', status: 'claim', status_label: 'Active claim' },
  // Reeves household (2 policies)
  { slug: 'reeves-household', policy_number: 'POL-AU-992341', line_type: 'auto', title: 'Personal auto — 2 vehicles', subtitle: '2024 Ford Bronco · 2022 Mazda CX-5 · Jake & Megan Reeves', premium: 1980, payment_freq: 'monthly autopay', status: 'active', status_label: 'Active' },
  { slug: 'reeves-household', policy_number: 'POL-HO-662180', line_type: 'home', title: 'Homeowners — HO-3 standard', subtitle: '2,200 sqft · built 2019 · $380K dwelling · new construction', premium: 1500, payment_freq: '$1,000 deductible', status: 'active', status_label: 'Active' },
  // Walsh family (1 policy)
  { slug: 'walsh-family', policy_number: 'POL-AU-884512', line_type: 'auto', title: 'Personal auto — 1 vehicle', subtitle: '2023 Subaru Outback · Brian Walsh', premium: 1240, payment_freq: 'monthly autopay', status: 'active', status_label: 'Active' },
  // Dawson household (3 policies)
  { slug: 'dawson-k', policy_number: 'POL-AU-667123', line_type: 'auto', title: 'Personal auto — 3 vehicles', subtitle: '2024 Chevy Tahoe · 2021 Honda Civic · 2019 Ford F-150 · Kevin & Laura Dawson', premium: 2920, payment_freq: 'monthly autopay', status: 'active', status_label: 'Active' },
  { slug: 'dawson-k', policy_number: 'POL-HO-338741', line_type: 'home', title: 'Homeowners — HO-3 standard', subtitle: '3,800 sqft · built 2004 · $620K dwelling · pool · $75K personal property', premium: 2800, payment_freq: '$2,500 deductible', status: 'renewal', status_label: 'Renews 14d' },
  { slug: 'dawson-k', policy_number: 'POL-UM-112340', line_type: 'umbrella', title: 'Personal umbrella — $2M limit', subtitle: 'Excess liability above auto and home · added March 2020', premium: 380, payment_freq: 'annual pay', status: 'active', status_label: 'Active' },
  // Kim, Sarah (1 policy)
  { slug: 'kim-s', policy_number: 'POL-AU-778934', line_type: 'auto', title: 'Personal auto — 1 vehicle', subtitle: '2021 Kia Sorento · Sarah Kim', premium: 1420, payment_freq: 'monthly autopay', status: 'active', status_label: 'Active' },
  // Westbrook, Derrick (1 policy)
  { slug: 'westbrook-d', policy_number: 'POL-AU-889102', line_type: 'auto', title: 'Personal auto — 1 vehicle', subtitle: '2022 Dodge Ram 1500 · Derrick Westbrook', premium: 2040, payment_freq: 'monthly autopay', status: 'claim', status_label: 'Active claim' },
  // Henderson, Tom (1 policy)
  { slug: 'henderson-t', policy_number: 'POL-AU-665478', line_type: 'auto', title: 'Personal auto — 2 vehicles', subtitle: '2023 Toyota 4Runner · 2020 Honda Odyssey · Tom & Maria Henderson', premium: 1580, payment_freq: 'semi-annual', status: 'active', status_label: 'Active' },
  // Donovan, Michael (2 policies)
  { slug: 'donovan-m', policy_number: 'POL-AU-882103', line_type: 'auto', title: 'Personal auto — 1 vehicle', subtitle: '2024 Porsche Cayenne · Michael Donovan', premium: 2040, payment_freq: 'monthly autopay', status: 'active', status_label: 'Active' },
  { slug: 'donovan-m', policy_number: 'POL-UM-334567', line_type: 'umbrella', title: 'Personal umbrella — $2M limit', subtitle: 'Excess liability · recently upsold from $1M · boat purchase trigger', premium: 380, payment_freq: 'annual pay', status: 'active', status_label: 'Active' },
  // Chen, Lisa (1 policy)
  { slug: 'chen-l', policy_number: 'POL-HO-998234', line_type: 'home', title: 'Homeowners — HO-3 (investment)', subtitle: 'Duplex · 2,100 sqft · built 1998 · $340K dwelling · tenant-occupied', premium: 3000, payment_freq: '$2,500 deductible', status: 'active', status_label: 'Active' },
  // Olsen, Rachel (1 policy)
  { slug: 'olsen-r', policy_number: 'POL-HO-445612', line_type: 'home', title: 'Homeowners — HO-3 standard', subtitle: '2,400 sqft · built 2010 · $365K dwelling · garage endorsement added', premium: 2340, payment_freq: '$1,000 deductible', status: 'active', status_label: 'Active' },
  // Park, James (1 policy)
  { slug: 'park-j', policy_number: 'POL-RN-228901', line_type: 'home', title: 'Renters — HO-4', subtitle: 'Apt 12B · $30K personal property · converting to homeowners May 8', premium: 280, payment_freq: 'monthly', status: 'active', status_label: 'Active' },
  // Torres, Angela (1 policy)
  { slug: 'torres-a', policy_number: 'POL-AU-556789', line_type: 'auto', title: 'Personal auto — 1 vehicle', subtitle: '2022 Toyota Corolla · Angela Torres · clean record', premium: 1180, payment_freq: 'semi-annual', status: 'active', status_label: 'Active' },
  // Yamamoto, Ken (1 policy)
  { slug: 'yamamoto-k', policy_number: 'POL-UM-778234', line_type: 'umbrella', title: 'Personal umbrella — $2M limit', subtitle: 'Excess liability above auto (other carrier) and home (other carrier)', premium: 620, payment_freq: 'annual pay', status: 'renewal', status_label: 'Renews 7d' },
  // Okonkwo, Adaeze (1 policy)
  { slug: 'okonkwo-a', policy_number: 'POL-LF-445678', line_type: 'life', title: 'Term life — Adaeze Okonkwo', subtitle: '$500K · 20-year term · issued 2021 · standard preferred', premium: 840, payment_freq: 'annual pay', status: 'active', status_label: 'Active' },
  // Crestline Bakery (2 policies)
  { slug: 'crestline-bakery', policy_number: 'POL-BP-220156', line_type: 'commercial', title: 'Business owners policy (BOP)', subtitle: 'GL + property · bakery/café · 12 employees · $2M aggregate', premium: 38400, payment_freq: 'quarterly installments', status: 'active', status_label: 'Active' },
  { slug: 'crestline-bakery', policy_number: 'POL-WC-330289', line_type: 'commercial', title: 'Workers compensation', subtitle: 'Classification 2003 · 12 employees · experience mod 0.92', premium: 7700, payment_freq: 'monthly', status: 'active', status_label: 'Active' },
  // Greenfield Dental (2 policies)
  { slug: 'greenfield-dental', policy_number: 'POL-BP-440312', line_type: 'commercial', title: 'Business owners policy (BOP)', subtitle: 'GL + property · dental practice · 8 employees · $1M/$2M', premium: 8200, payment_freq: 'quarterly installments', status: 'active', status_label: 'Active' },
  { slug: 'greenfield-dental', policy_number: 'POL-PL-550478', line_type: 'commercial', title: 'Professional liability (E&O)', subtitle: 'Dental malpractice · $1M per occurrence · $3M aggregate', premium: 4200, payment_freq: 'annual pay', status: 'active', status_label: 'Active' },
  // Martinez Auto Group (3 policies)
  { slug: 'martinez-auto-group', policy_number: 'POL-CA-660123', line_type: 'commercial', title: 'Commercial auto — fleet', subtitle: '14 vehicles · 3 locations · hired/non-owned included · $1M CSL', premium: 24800, payment_freq: 'monthly installments', status: 'active', status_label: 'Active' },
  { slug: 'martinez-auto-group', policy_number: 'POL-GL-770234', line_type: 'commercial', title: 'General liability', subtitle: 'Auto dealership · $2M aggregate · $1M per occurrence · completed ops', premium: 12400, payment_freq: 'quarterly', status: 'renewal', status_label: 'Renews 49d' },
  { slug: 'martinez-auto-group', policy_number: 'POL-CP-880345', line_type: 'commercial', title: 'Commercial property', subtitle: '3 dealership locations · $4.2M total insured value · 90% coinsurance', premium: 5400, payment_freq: 'semi-annual', status: 'active', status_label: 'Active' },
  // Blackwood Properties (3 policies)
  { slug: 'blackwood-properties', policy_number: 'POL-CP-110456', line_type: 'commercial', title: 'Commercial property — portfolio', subtitle: '3 properties · mixed-use · total insured value $6.8M', premium: 4800, payment_freq: 'quarterly installments', status: 'active', status_label: 'Active' },
  { slug: 'blackwood-properties', policy_number: 'POL-GL-220567', line_type: 'commercial', title: 'General liability', subtitle: 'Real estate management · $2M aggregate · tenant liability included', premium: 2200, payment_freq: 'quarterly', status: 'active', status_label: 'Active' },
  { slug: 'blackwood-properties', policy_number: 'POL-UM-330678', line_type: 'umbrella', title: 'Commercial umbrella — $5M', subtitle: 'Excess liability over GL and property · scheduled underlying', premium: 1200, payment_freq: 'annual pay', status: 'active', status_label: 'Active' },
  // Nguyen Construction (2 policies)
  { slug: 'nguyen-construction', policy_number: 'POL-GL-440789', line_type: 'commercial', title: 'General liability — contractor', subtitle: 'General contractor · $2M aggregate · completed operations 5yr', premium: 14200, payment_freq: 'monthly installments', status: 'active', status_label: 'Active' },
  { slug: 'nguyen-construction', policy_number: 'POL-WC-550890', line_type: 'commercial', title: 'Workers compensation', subtitle: 'Classification 5403/5606 · 22 employees · experience mod 1.08', premium: 14200, payment_freq: 'monthly installments', status: 'active', status_label: 'Active' },
  // Mercer & Sons (1 policy)
  { slug: 'mercer-sons', policy_number: 'POL-BP-660901', line_type: 'commercial', title: 'Business owners policy (BOP)', subtitle: 'Plumbing contractor · GL + tools/equipment · 6 employees · $1M/$2M', premium: 4400, payment_freq: 'quarterly', status: 'active', status_label: 'Active' },
];

// ── HOUSEHOLD / TEAM MEMBERS ──
const allMembers = [
  // Patel household
  { slug: 'patel-household', name: 'Raj Patel', initials: 'RP', relationship: 'Primary · age 46', detail: 'DL · Driver · Insured (life)', avatar_class: 'a' },
  { slug: 'patel-household', name: 'Priya Patel', initials: 'PP', relationship: 'Spouse · age 44', detail: 'DL · Driver', avatar_class: 'b' },
  { slug: 'patel-household', name: 'Ananya Patel', initials: 'AP', relationship: 'Daughter · age 19', detail: 'DL · Listed driver · college student', avatar_class: 'c' },
  { slug: 'patel-household', name: 'Dev Patel', initials: 'DP', relationship: 'Son · age 16', detail: 'Permit · teen driver add pending', avatar_class: 'd' },
  // Lin household
  { slug: 'lin-household', name: 'David Lin', initials: 'DL', relationship: 'Primary · age 48', detail: 'DL · Driver', avatar_class: 'a' },
  { slug: 'lin-household', name: 'Amy Lin', initials: 'AL', relationship: 'Spouse · age 45', detail: 'DL · Driver', avatar_class: 'b' },
  { slug: 'lin-household', name: 'Ethan Lin', initials: 'EL', relationship: 'Son · age 12', detail: 'Dependent', avatar_class: 'c' },
  // Reeves household
  { slug: 'reeves-household', name: 'Jake Reeves', initials: 'JR', relationship: 'Primary · age 32', detail: 'DL · Driver', avatar_class: 'a' },
  { slug: 'reeves-household', name: 'Megan Reeves', initials: 'MR', relationship: 'Spouse · age 30', detail: 'DL · Driver', avatar_class: 'b' },
  { slug: 'reeves-household', name: 'Lily Reeves', initials: 'LR', relationship: 'Daughter · age 3', detail: 'Dependent', avatar_class: 'c' },
  // Walsh family
  { slug: 'walsh-family', name: 'Brian Walsh', initials: 'BW', relationship: 'Primary · age 29', detail: 'DL · Driver · first-time homebuyer', avatar_class: 'a' },
  { slug: 'walsh-family', name: 'Nicole Walsh', initials: 'NW', relationship: 'Spouse · age 28', detail: 'DL · Driver', avatar_class: 'b' },
  // Dawson household
  { slug: 'dawson-k', name: 'Kevin Dawson', initials: 'KD', relationship: 'Primary · age 52', detail: 'DL · Driver · boat owner', avatar_class: 'a' },
  { slug: 'dawson-k', name: 'Laura Dawson', initials: 'LD', relationship: 'Spouse · age 50', detail: 'DL · Driver', avatar_class: 'b' },
  { slug: 'dawson-k', name: 'Ryan Dawson', initials: 'RD', relationship: 'Son · age 22', detail: 'DL · Listed driver · graduated college', avatar_class: 'c' },
  { slug: 'dawson-k', name: 'Emma Dawson', initials: 'ED', relationship: 'Daughter · age 19', detail: 'DL · Listed driver · college student', avatar_class: 'd' },
  // Henderson
  { slug: 'henderson-t', name: 'Tom Henderson', initials: 'TH', relationship: 'Primary · age 47', detail: 'DL · Driver', avatar_class: 'a' },
  { slug: 'henderson-t', name: 'Maria Henderson', initials: 'MH', relationship: 'Spouse · age 45', detail: 'DL · Driver', avatar_class: 'b' },
  { slug: 'henderson-t', name: 'Jake Henderson', initials: 'JH', relationship: 'Son · age 16', detail: 'Permit · teen driver add in UW review', avatar_class: 'c' },
  { slug: 'henderson-t', name: 'Olivia Henderson', initials: 'OH', relationship: 'Daughter · age 13', detail: 'Dependent', avatar_class: 'd' },
  // Olsen
  { slug: 'olsen-r', name: 'Rachel Olsen', initials: 'RO', relationship: 'Primary · age 38', detail: 'Homeowner', avatar_class: 'a' },
  { slug: 'olsen-r', name: 'Max Olsen', initials: 'MO', relationship: 'Son · age 8', detail: 'Dependent', avatar_class: 'b' },
  // Yamamoto
  { slug: 'yamamoto-k', name: 'Ken Yamamoto', initials: 'KY', relationship: 'Primary · age 55', detail: 'Umbrella policyholder', avatar_class: 'a' },
  { slug: 'yamamoto-k', name: 'Yuki Yamamoto', initials: 'YY', relationship: 'Spouse · age 53', detail: 'Listed on umbrella', avatar_class: 'b' },
  // Business key contacts
  { slug: 'crestline-bakery', name: 'Diane Morales', initials: 'DM', relationship: 'Owner · decision maker', detail: 'Primary insured · 12 employees', avatar_class: 'a' },
  { slug: 'crestline-bakery', name: 'Tony Restrepo', initials: 'TR', relationship: 'General manager', detail: 'Authorized for endorsements', avatar_class: 'b' },
  { slug: 'greenfield-dental', name: 'Dr. Neil Greenfield', initials: 'NG', relationship: 'Owner · principal', detail: 'Primary insured · 3 dentists', avatar_class: 'a' },
  { slug: 'greenfield-dental', name: 'Karen Mitchell', initials: 'KM', relationship: 'Office manager', detail: 'Handles billing and certificates', avatar_class: 'b' },
  { slug: 'martinez-auto-group', name: 'Roberto Martinez', initials: 'RM', relationship: 'Owner · president', detail: 'Primary insured · 3 locations', avatar_class: 'a' },
  { slug: 'martinez-auto-group', name: 'Carmen Martinez', initials: 'CM', relationship: 'VP operations', detail: 'Handles fleet and HR', avatar_class: 'b' },
  { slug: 'blackwood-properties', name: 'James Blackwood', initials: 'JB', relationship: 'Managing partner', detail: 'Primary insured · 3 properties', avatar_class: 'a' },
  { slug: 'nguyen-construction', name: 'Tran Nguyen', initials: 'TN', relationship: 'Owner · president', detail: 'Primary insured · 22 employees', avatar_class: 'a' },
  { slug: 'nguyen-construction', name: 'Linh Nguyen', initials: 'LN', relationship: 'CFO', detail: 'Handles insurance and payroll', avatar_class: 'b' },
  { slug: 'mercer-sons', name: 'Bill Mercer', initials: 'BM', relationship: 'Owner', detail: 'Primary insured · 6 employees', avatar_class: 'a' },
];

// ── TIMELINE EVENTS (for non-Ramirez customers) ──
const allEvents = [
  // Patel household
  { slug: 'patel-household', event_type: 'note', event_time: '1 day ago', title: 'Term life quote requested — Raj Patel', detail: 'Client called about $750K 20-year term. Quoted $920/yr standard preferred. Wants to discuss with Priya and call back this afternoon.', attribution: 'Maya Chen · 2:14 PM' },
  { slug: 'patel-household', event_type: 'policy', event_time: '3 days ago', title: 'Auto policy renewed — no changes', detail: 'Annual renewal processed. Premium $2,180 (+3.9%). Autopay active on Amex ending 4412.', attribution: 'System · automated' },
  { slug: 'patel-household', event_type: 'payment', event_time: 'Apr 15', title: 'Payment received — $181.67', detail: 'Auto policy monthly autopay · Amex ending 4412', attribution: 'System · billing' },
  { slug: 'patel-household', event_type: 'contact', event_time: 'Apr 3', title: 'Email opened — "Your renewal is coming up"', detail: 'Renewal reminder campaign · auto + home bundle', attribution: 'Marketing studio · automated' },
  { slug: 'patel-household', event_type: 'policy', event_time: 'Jan 2026', title: 'Ananya added to auto policy', detail: 'College student away-from-home discount applied · reduced premium impact', attribution: 'Maya Chen · self-service' },
  // Lin household
  { slug: 'lin-household', event_type: 'claim', event_time: '4 weeks ago', title: 'Claim filed — roof damage from hail', detail: 'Claim CLM-2026-38921 · hail event March 28 · adjuster assigned · est. $18,400', attribution: 'Adjuster: M. Rodriguez' },
  { slug: 'lin-household', event_type: 'payment', event_time: 'Apr 1', title: 'Payment received — $1,120', detail: 'Auto policy semi-annual payment · ACH from Chase ending 7823', attribution: 'System · billing' },
  { slug: 'lin-household', event_type: 'note', event_time: 'Mar 30', title: 'Contacted about roof inspection', detail: 'Spoke with David. Inspector scheduled for April 4. David concerned about premium impact after claim.', attribution: 'Maya Chen · 11:22 AM' },
  { slug: 'lin-household', event_type: 'policy', event_time: 'Nov 2025', title: 'Homeowners renewed', detail: 'Premium $2,400/yr (+6.7%). Roof age contributing to increase. Discussed replacement timeline.', attribution: 'System · automated' },
  // Reeves household
  { slug: 'reeves-household', event_type: 'policy', event_time: '8 days ago', title: 'New business bound — auto + home bundle', detail: 'Referred by Michael Donovan. Bundle discount applied. Total premium $3,480/yr.', attribution: 'Maya Chen · bound' },
  { slug: 'reeves-household', event_type: 'note', event_time: '10 days ago', title: 'Initial consultation completed', detail: 'Jake and Megan moving to McKinney from apartment in Dallas. First-time homebuyers. Looking for auto+home bundle.', attribution: 'Maya Chen · 3:45 PM' },
  { slug: 'reeves-household', event_type: 'contact', event_time: '12 days ago', title: 'Referral received from Donovan, Michael', detail: 'Michael texted asking if we could help his friend Jake with auto+home for new house purchase.', attribution: 'Referral tracking' },
  // Walsh family
  { slug: 'walsh-family', event_type: 'note', event_time: '6 days ago', title: 'Home purchase detected — pre-qualified for homeowners', detail: 'MLS data shows Walsh family closing on 1,800 sqft home in Austin. Built 2020. Purchase price $385K. Pre-filled quote ready.', attribution: 'Data 360 · life event' },
  { slug: 'walsh-family', event_type: 'payment', event_time: 'Apr 12', title: 'Payment received — $103.33', detail: 'Auto policy monthly autopay · Visa ending 9012', attribution: 'System · billing' },
  { slug: 'walsh-family', event_type: 'policy', event_time: 'Mar 2025', title: 'Auto policy issued', detail: 'New-to-book. Single vehicle. Brian Walsh. Standard rate.', attribution: 'Maya Chen · bound' },
  // Dawson household
  { slug: 'dawson-k', event_type: 'policy', event_time: '3 days ago', title: 'Umbrella renewed — no changes', detail: '$2M limit. Annual premium $380. No claims in coverage period.', attribution: 'System · automated' },
  { slug: 'dawson-k', event_type: 'payment', event_time: 'Apr 18', title: 'Payment received — $243.33', detail: 'Auto policy monthly autopay · ACH from BOA ending 5567', attribution: 'System · billing' },
  { slug: 'dawson-k', event_type: 'note', event_time: 'Apr 10', title: 'Annual review call completed', detail: 'Kevin happy with coverage. Mentioned boat purchase — discussed additional coverage. Referred Jake Reeves for auto+home.', attribution: 'Maya Chen · 10:30 AM' },
  { slug: 'dawson-k', event_type: 'claim', event_time: 'Sep 2025', title: 'Claim closed — water heater leak', detail: 'Claim CLM-2025-27894 · water damage to basement · paid $4,200 · deductible $2,500', attribution: 'Adjuster: K. Thompson' },
  { slug: 'dawson-k', event_type: 'contact', event_time: 'Aug 2025', title: 'Birthday card sent — Kevin Dawson', detail: 'Annual birthday campaign · Kevin turned 52', attribution: 'Marketing studio · automated' },
  // Kim, Sarah
  { slug: 'kim-s', event_type: 'claim', event_time: '2 months ago', title: 'Claim closed — fender bender', detail: 'Claim CLM-2026-31042 · parking lot collision · paid $2,800 · $500 deductible · no injuries', attribution: 'Adjuster: S. Williams' },
  { slug: 'kim-s', event_type: 'claim', event_time: 'Oct 2025', title: 'Claim closed — windshield replacement', detail: 'Claim CLM-2025-28901 · rock chip on I-635 · paid $412 to Safelite · zero deductible glass', attribution: 'Adjuster: automated' },
  { slug: 'kim-s', event_type: 'payment', event_time: 'Apr 14', title: 'Payment received — $118.33', detail: 'Auto policy monthly autopay · Visa ending 3456', attribution: 'System · billing' },
  { slug: 'kim-s', event_type: 'note', event_time: 'Mar 8', title: 'Shopping signal detected — Progressive', detail: 'Third-party intent feed detected comparison shopping activity. Premium sensitivity: high after 2 claims.', attribution: 'Data 360 · automated' },
  // Westbrook, Derrick
  { slug: 'westbrook-d', event_type: 'claim', event_time: '2 weeks ago', title: 'Claim filed — rear-end collision', detail: 'Claim CLM-2026-44871 · rear-ended on I-35 · 2022 Ram 1500 · awaiting photo upload · est. $6,200', attribution: 'Adjuster: Rita Park' },
  { slug: 'westbrook-d', event_type: 'payment', event_time: 'Apr 10', title: 'Payment received — $170.00', detail: 'Auto policy monthly autopay · ACH from USAA ending 8901', attribution: 'System · billing' },
  { slug: 'westbrook-d', event_type: 'policy', event_time: 'Mar 2024', title: 'Auto policy issued', detail: 'New business. Single vehicle 2022 Ram 1500. Standard rate.', attribution: 'Maya Chen · bound' },
  // Henderson, Tom
  { slug: 'henderson-t', event_type: 'policy', event_time: '5 days ago', title: 'Endorsement submitted — add teen driver', detail: 'Jake Henderson, age 16. Learner\'s permit. Pending UW review for good student discount eligibility.', attribution: 'Maya Chen · submitted' },
  { slug: 'henderson-t', event_type: 'payment', event_time: 'Apr 1', title: 'Payment received — $790', detail: 'Auto policy semi-annual payment · ACH from Wells Fargo ending 6678', attribution: 'System · billing' },
  { slug: 'henderson-t', event_type: 'note', event_time: 'Mar 25', title: 'Discussed teen driver options', detail: 'Tom called about adding Jake to policy. Explained good student and defensive driving discounts. Will send grades for verification.', attribution: 'Maya Chen · 9:45 AM' },
  { slug: 'henderson-t', event_type: 'contact', event_time: 'Feb 2026', title: 'Email opened — "Insuring your teen driver" guide', detail: 'Triggered by DMV data showing new permit in household', attribution: 'Data 360 · automated' },
  // Donovan, Michael
  { slug: 'donovan-m', event_type: 'policy', event_time: '2 weeks ago', title: 'Umbrella upsold — $1M → $2M', detail: 'Triggered by boat purchase. Added scheduled watercraft endorsement. Premium impact: +$120/yr.', attribution: 'Maya Chen · bound' },
  { slug: 'donovan-m', event_type: 'payment', event_time: 'Apr 12', title: 'NSF on autopay — $170.00', detail: 'Auto policy monthly autopay · ACH from Chase ending 2234 returned insufficient funds', attribution: 'System · billing' },
  { slug: 'donovan-m', event_type: 'note', event_time: 'Apr 8', title: 'Boat purchase — coverage discussion', detail: 'Michael bought a 22ft Sea Ray. Discussed watercraft endorsement on umbrella vs standalone boat policy. Went with umbrella add.', attribution: 'Maya Chen · 4:15 PM' },
  { slug: 'donovan-m', event_type: 'contact', event_time: 'Apr 5', title: 'Referred Jake Reeves for auto+home', detail: 'Michael texted referral. Reeves family closing on house in McKinney.', attribution: 'Referral tracking' },
  // Chen, Lisa
  { slug: 'chen-l', event_type: 'note', event_time: '8 days ago', title: 'Deal stalled — competing Allstate quote', detail: 'Lisa received $2,680/yr quote from Allstate for investment duplex. Our premium $3,000. Exploring coverage differences to justify gap.', attribution: 'Maya Chen · 11:00 AM' },
  { slug: 'chen-l', event_type: 'payment', event_time: 'Apr 5', title: 'Payment received — $750', detail: 'Homeowners quarterly payment · ACH from Citi ending 5567', attribution: 'System · billing' },
  { slug: 'chen-l', event_type: 'policy', event_time: 'Oct 2024', title: 'Homeowners issued — investment property', detail: 'New business. Duplex in Dallas. Tenant-occupied. Landlord/investment property form.', attribution: 'Maya Chen · bound' },
  // Olsen, Rachel
  { slug: 'olsen-r', event_type: 'policy', event_time: '4 days ago', title: 'Endorsement processed — detached garage', detail: 'Added 600 sqft detached garage. Increased dwelling coverage by $45K. Premium impact: +$140/yr.', attribution: 'Maya Chen · processed' },
  { slug: 'olsen-r', event_type: 'payment', event_time: 'Apr 8', title: 'Payment received — $195', detail: 'Homeowners monthly payment · ACH from Chase ending 1189', attribution: 'System · billing' },
  { slug: 'olsen-r', event_type: 'note', event_time: 'Mar 28', title: 'DocuSign sent for garage endorsement', detail: 'Endorsement for new detached garage. Client to sign and return. Coverage effective upon signature.', attribution: 'Maya Chen · 2:30 PM' },
  // Park, James
  { slug: 'park-j', event_type: 'note', event_time: '4 days ago', title: 'Homeowners quote prepared — conversion', detail: 'James closing on property May 8. 2,400 sqft, built 2018. Pre-filled from MLS data. Quote ready for review at $1,890/yr.', attribution: 'Data 360 · life event' },
  { slug: 'park-j', event_type: 'payment', event_time: 'Apr 10', title: 'Payment received — $23.33', detail: 'Renters policy monthly payment · Visa ending 7734', attribution: 'System · billing' },
  { slug: 'park-j', event_type: 'policy', event_time: 'Jul 2024', title: 'Renters policy issued', detail: 'New business. Apartment in Cedar Park. $30K personal property. Standard rate.', attribution: 'Maya Chen · bound' },
  // Torres, Angela
  { slug: 'torres-a', event_type: 'payment', event_time: 'Apr 1', title: 'Payment received — $590', detail: 'Auto policy semi-annual payment · ACH from USAA ending 4478', attribution: 'System · billing' },
  { slug: 'torres-a', event_type: 'policy', event_time: 'Apr 2023', title: 'Auto policy issued', detail: 'New business. 2022 Toyota Corolla. Clean driving record. Good driver discount applied.', attribution: 'Maya Chen · bound' },
  { slug: 'torres-a', event_type: 'contact', event_time: 'Mar 2026', title: 'Renewal notice sent', detail: '3-year renewal. Rate hold — no increase. Autopay continues.', attribution: 'System · automated' },
  // Yamamoto, Ken
  { slug: 'yamamoto-k', event_type: 'policy', event_time: '7 days ago', title: 'Renewal package generated — umbrella', detail: 'Annual renewal. Premium $640 (+3.2%). Standard re-quote prepared for comparison.', attribution: 'System · automated' },
  { slug: 'yamamoto-k', event_type: 'payment', event_time: 'May 2025', title: 'Payment received — $620', detail: 'Umbrella annual payment · check #4812', attribution: 'System · billing' },
  { slug: 'yamamoto-k', event_type: 'note', event_time: 'Apr 2025', title: 'Annual review — no changes', detail: 'Ken satisfied with $2M umbrella. Underlying auto and home with other carriers unchanged.', attribution: 'Maya Chen · 3:00 PM' },
  // Okonkwo, Adaeze
  { slug: 'okonkwo-a', event_type: 'note', event_time: '3 days ago', title: 'Marriage trigger detected — bundle opportunity', detail: 'Public records show marriage filed. Auto+home+umbrella bundle opportunity. Deal score: 68.', attribution: 'Data 360 · life event' },
  { slug: 'okonkwo-a', event_type: 'payment', event_time: 'Jun 2025', title: 'Payment received — $840', detail: 'Term life annual payment · ACH from Chase ending 3345', attribution: 'System · billing' },
  { slug: 'okonkwo-a', event_type: 'policy', event_time: 'Jun 2021', title: 'Term life issued', detail: '$500K 20-year term. Standard preferred. Non-tobacco. Annual renewable.', attribution: 'Maya Chen · bound' },
  // Crestline Bakery
  { slug: 'crestline-bakery', event_type: 'policy', event_time: '8 days ago', title: 'Cyber liability quote requested', detail: 'New TX cyber product. Diane interested in $1M limit for POS and customer data. Quote pending UW.', attribution: 'Maya Chen · submitted' },
  { slug: 'crestline-bakery', event_type: 'claim', event_time: 'Jan 2026', title: 'Claim closed — employee slip and fall', detail: 'Claim CLM-2026-11234 · WC claim · employee back strain · 3 weeks lost time · paid $8,400', attribution: 'Adjuster: D. Foster' },
  { slug: 'crestline-bakery', event_type: 'payment', event_time: 'Apr 1', title: 'Payment received — $9,600', detail: 'BOP quarterly installment · ACH from business checking ending 7712', attribution: 'System · billing' },
  { slug: 'crestline-bakery', event_type: 'note', event_time: 'Mar 15', title: 'Annual review with Diane Morales', detail: 'Reviewed all coverages. Discussed cyber exposure — POS system, customer email list. Diane interested in new TX cyber product.', attribution: 'Maya Chen · 10:00 AM' },
  // Greenfield Dental
  { slug: 'greenfield-dental', event_type: 'claim', event_time: '6 weeks ago', title: 'Claim filed — water damage from burst pipe', detail: 'Claim CLM-2026-35678 · burst pipe in operatory 3 · equipment damage · est. $24,000', attribution: 'Adjuster: T. Ramirez' },
  { slug: 'greenfield-dental', event_type: 'payment', event_time: 'Apr 5', title: 'Payment received — $2,050', detail: 'BOP quarterly installment · ACH from practice checking ending 2289', attribution: 'System · billing' },
  { slug: 'greenfield-dental', event_type: 'note', event_time: 'Mar 20', title: 'Renewal discussion — adding cyber', detail: 'Dr. Greenfield concerned about HIPAA data breach exposure. Discussed cyber add-on. Premium est. $1,800/yr.', attribution: 'Maya Chen · 2:15 PM' },
  // Martinez Auto Group
  { slug: 'martinez-auto-group', event_type: 'note', event_time: '5 days ago', title: 'Fleet renewal discussion — 14 vehicles', detail: 'Roberto reviewing fleet composition. 2 vehicles totaled this year. Adding 3 new. Loss runs from prior carrier still outstanding.', attribution: 'Maya Chen · 9:00 AM' },
  { slug: 'martinez-auto-group', event_type: 'claim', event_time: '3 months ago', title: 'Claim closed — fleet vehicle collision', detail: 'Claim CLM-2026-22345 · delivery van rear-ended at red light · paid $9,800 · driver uninjured', attribution: 'Adjuster: P. Gonzalez' },
  { slug: 'martinez-auto-group', event_type: 'payment', event_time: 'Apr 1', title: 'Payment received — $2,066.67', detail: 'Commercial auto monthly installment · ACH from business checking ending 8834', attribution: 'System · billing' },
  { slug: 'martinez-auto-group', event_type: 'policy', event_time: 'Sep 2021', title: 'Commercial package bound', detail: 'New business. Auto dealership. 3 locations in DFW. Commercial auto + GL + property. Total premium $38,900/yr.', attribution: 'Maya Chen · bound' },
  // Blackwood Properties
  { slug: 'blackwood-properties', event_type: 'note', event_time: '10 days ago', title: 'Shopping signal detected — Nationwide', detail: 'Third-party data shows comparison activity. Blackwood may be seeking quotes for portfolio. Premium sensitivity triggered by 8.5% renewal increase.', attribution: 'Data 360 · automated' },
  { slug: 'blackwood-properties', event_type: 'payment', event_time: 'Apr 5', title: 'Payment received — $1,200', detail: 'Commercial property quarterly installment · wire transfer', attribution: 'System · billing' },
  { slug: 'blackwood-properties', event_type: 'claim', event_time: 'Nov 2025', title: 'Claim closed — tenant liability', detail: 'Claim CLM-2025-29012 · tenant injury in common area · slip on wet floor · paid $6,800', attribution: 'Adjuster: R. Davis' },
  // Nguyen Construction
  { slug: 'nguyen-construction', event_type: 'policy', event_time: '2 weeks ago', title: 'Workers comp audit initiated', detail: 'Annual payroll audit for policy period. 22 employees. Estimated additional premium may apply.', attribution: 'System · audit' },
  { slug: 'nguyen-construction', event_type: 'claim', event_time: 'Dec 2025', title: 'Claim closed — employee fall from scaffold', detail: 'Claim CLM-2025-31456 · WC claim · broken wrist · 6 weeks lost time · paid $22,400', attribution: 'Adjuster: M. Chen' },
  { slug: 'nguyen-construction', event_type: 'payment', event_time: 'Apr 1', title: 'Payment received — $2,366.67', detail: 'GL + WC monthly installment · ACH from business checking ending 5590', attribution: 'System · billing' },
  // Mercer & Sons
  { slug: 'mercer-sons', event_type: 'note', event_time: '2 weeks ago', title: 'Expansion discussion — second location', detail: 'Bill opening second shop in Arlington. Needs to update BOP with additional location. Quote pending.', attribution: 'Maya Chen · 11:30 AM' },
  { slug: 'mercer-sons', event_type: 'payment', event_time: 'Apr 1', title: 'Payment received — $1,100', detail: 'BOP quarterly payment · check #1822', attribution: 'System · billing' },
  { slug: 'mercer-sons', event_type: 'policy', event_time: 'Oct 2023', title: 'BOP issued', detail: 'New business. Plumbing contractor. GL + tools/equipment. 6 employees.', attribution: 'Maya Chen · bound' },
];

// ── RETENTION FACTORS (for non-Ramirez customers) ──
const allFactors = [
  // Patel
  { slug: 'patel-household', label: 'Bundle strength', value: 'Strong', sentiment: 'pos' },
  { slug: 'patel-household', label: 'Payment history', value: 'Perfect', sentiment: 'pos' },
  { slug: 'patel-household', label: 'Tenure', value: '6 years', sentiment: 'pos' },
  { slug: 'patel-household', label: 'Cross-sell pending', value: 'Term life', sentiment: 'pos' },
  // Lin
  { slug: 'lin-household', label: 'Active claim', value: 'Roof damage', sentiment: 'neg' },
  { slug: 'lin-household', label: 'Premium increase', value: '+6.7%', sentiment: 'neg' },
  { slug: 'lin-household', label: 'Bundle strength', value: 'Moderate', sentiment: 'pos' },
  { slug: 'lin-household', label: 'Tenure', value: '5 years', sentiment: 'pos' },
  // Reeves
  { slug: 'reeves-household', label: 'New customer', value: '1 month', sentiment: 'pos' },
  { slug: 'reeves-household', label: 'Referral source', value: 'Donovan', sentiment: 'pos' },
  { slug: 'reeves-household', label: 'Bundle discount', value: 'Applied', sentiment: 'pos' },
  // Walsh
  { slug: 'walsh-family', label: 'Cross-sell opportunity', value: 'Home purchase', sentiment: 'pos' },
  { slug: 'walsh-family', label: 'Single-line risk', value: 'Auto only', sentiment: 'neg' },
  { slug: 'walsh-family', label: 'Tenure', value: '1 year', sentiment: 'pos' },
  // Dawson
  { slug: 'dawson-k', label: 'Bundle strength', value: 'Strong', sentiment: 'pos' },
  { slug: 'dawson-k', label: 'Tenure', value: '8 years', sentiment: 'pos' },
  { slug: 'dawson-k', label: 'Referral activity', value: 'Active', sentiment: 'pos' },
  { slug: 'dawson-k', label: 'Recent claim', value: 'Water leak', sentiment: 'neg' },
  // Kim
  { slug: 'kim-s', label: 'Claims frequency', value: '2 in 24mo', sentiment: 'neg' },
  { slug: 'kim-s', label: 'Shopping signal', value: 'Progressive', sentiment: 'neg' },
  { slug: 'kim-s', label: 'Premium sensitivity', value: 'High', sentiment: 'neg' },
  { slug: 'kim-s', label: 'Single-line risk', value: 'Auto only', sentiment: 'neg' },
  // Westbrook
  { slug: 'westbrook-d', label: 'Active claim', value: 'Collision', sentiment: 'neg' },
  { slug: 'westbrook-d', label: 'Tenure', value: '2 years', sentiment: 'pos' },
  { slug: 'westbrook-d', label: 'Payment history', value: 'Good', sentiment: 'pos' },
  // Henderson
  { slug: 'henderson-t', label: 'Payment history', value: 'Perfect', sentiment: 'pos' },
  { slug: 'henderson-t', label: 'Tenure', value: '4 years', sentiment: 'pos' },
  { slug: 'henderson-t', label: 'Teen driver pending', value: 'UW review', sentiment: 'neg' },
  // Donovan
  { slug: 'donovan-m', label: 'Cross-sell completed', value: 'Umbrella', sentiment: 'pos' },
  { slug: 'donovan-m', label: 'Referral activity', value: 'Active', sentiment: 'pos' },
  { slug: 'donovan-m', label: 'NSF event', value: 'Apr 12', sentiment: 'neg' },
  { slug: 'donovan-m', label: 'Tenure', value: '5 years', sentiment: 'pos' },
  // Chen
  { slug: 'chen-l', label: 'Competing quote', value: 'Allstate', sentiment: 'neg' },
  { slug: 'chen-l', label: 'Price gap', value: '-$320/yr', sentiment: 'neg' },
  { slug: 'chen-l', label: 'Single-line risk', value: 'Home only', sentiment: 'neg' },
  // Olsen
  { slug: 'olsen-r', label: 'Recent endorsement', value: 'Garage add', sentiment: 'pos' },
  { slug: 'olsen-r', label: 'Tenure', value: '3 years', sentiment: 'pos' },
  { slug: 'olsen-r', label: 'Payment history', value: 'Good', sentiment: 'pos' },
  // Park
  { slug: 'park-j', label: 'Life event', value: 'Home purchase', sentiment: 'pos' },
  { slug: 'park-j', label: 'Conversion pending', value: 'Renters→HO', sentiment: 'pos' },
  { slug: 'park-j', label: 'Tenure', value: '2 years', sentiment: 'pos' },
  // Torres
  { slug: 'torres-a', label: 'Claims history', value: 'Clean', sentiment: 'pos' },
  { slug: 'torres-a', label: 'Rate hold', value: 'No increase', sentiment: 'pos' },
  { slug: 'torres-a', label: 'Tenure', value: '3 years', sentiment: 'pos' },
  // Yamamoto
  { slug: 'yamamoto-k', label: 'Payment history', value: 'Perfect', sentiment: 'pos' },
  { slug: 'yamamoto-k', label: 'Tenure', value: '4 years', sentiment: 'pos' },
  { slug: 'yamamoto-k', label: 'Underlying with other carrier', value: 'Risk', sentiment: 'neg' },
  // Okonkwo
  { slug: 'okonkwo-a', label: 'Payment history', value: 'Perfect', sentiment: 'pos' },
  { slug: 'okonkwo-a', label: 'Life event', value: 'Marriage', sentiment: 'pos' },
  { slug: 'okonkwo-a', label: 'Cross-sell potential', value: 'High', sentiment: 'pos' },
  // Crestline
  { slug: 'crestline-bakery', label: 'Tenure', value: '6 years', sentiment: 'pos' },
  { slug: 'crestline-bakery', label: 'WC claim history', value: '1 in 12mo', sentiment: 'neg' },
  { slug: 'crestline-bakery', label: 'Renewal premium', value: '+4.6%', sentiment: 'neg' },
  { slug: 'crestline-bakery', label: 'Cross-sell pending', value: 'Cyber', sentiment: 'pos' },
  // Greenfield
  { slug: 'greenfield-dental', label: 'Active claim', value: 'Water damage', sentiment: 'neg' },
  { slug: 'greenfield-dental', label: 'Renewal coming', value: '+5.6%', sentiment: 'neg' },
  { slug: 'greenfield-dental', label: 'Cross-sell potential', value: 'Cyber', sentiment: 'pos' },
  // Martinez
  { slug: 'martinez-auto-group', label: 'Largest account', value: '22% of book', sentiment: 'neg' },
  { slug: 'martinez-auto-group', label: 'Fleet losses', value: '2 vehicles', sentiment: 'neg' },
  { slug: 'martinez-auto-group', label: 'Tenure', value: '5 years', sentiment: 'pos' },
  { slug: 'martinez-auto-group', label: 'Concentration risk', value: 'High', sentiment: 'neg' },
  // Blackwood
  { slug: 'blackwood-properties', label: 'Shopping signal', value: 'Nationwide', sentiment: 'neg' },
  { slug: 'blackwood-properties', label: 'Premium increase', value: '+8.5%', sentiment: 'neg' },
  { slug: 'blackwood-properties', label: 'Tenant claim history', value: '1 in 12mo', sentiment: 'neg' },
  // Nguyen
  { slug: 'nguyen-construction', label: 'WC audit pending', value: 'Due now', sentiment: 'neg' },
  { slug: 'nguyen-construction', label: 'Experience mod', value: '1.08', sentiment: 'neg' },
  { slug: 'nguyen-construction', label: 'Tenure', value: '4 years', sentiment: 'pos' },
  { slug: 'nguyen-construction', label: 'Growth trajectory', value: '+22 empl', sentiment: 'pos' },
  // Mercer
  { slug: 'mercer-sons', label: 'Expansion planned', value: '2nd location', sentiment: 'pos' },
  { slug: 'mercer-sons', label: 'Claims history', value: 'Clean', sentiment: 'pos' },
  { slug: 'mercer-sons', label: 'Tenure', value: '3 years', sentiment: 'pos' },
];

// ── OPPORTUNITIES (for non-Ramirez customers) ──
const allOpportunities = [
  // Patel
  { slug: 'patel-household', title: 'Add Dev to auto policy', description: 'Dev turns 16 this summer. Good student and defensive driving discounts may apply. Early quoting recommended.', confidence: 72, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14M5 13v5a1 1 0 001 1h2"/>', meta_left: 'Est. premium: +$840/yr', meta_right: '3 min flow' },
  { slug: 'patel-household', title: 'Umbrella — $1M', description: 'Household with teen driver and 3 policies. Umbrella coverage strongly recommended for liability protection.', confidence: 68, icon_svg: '<path d="M12 2v2M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10H2zM12 12v8a2 2 0 11-4 0"/>', meta_left: 'Est. premium: $280/yr', meta_right: '1 min flow' },
  // Lin
  { slug: 'lin-household', title: 'Roof replacement discount', description: 'If roof is replaced after hail claim, homeowners premium could decrease 8-12%. Follow up post-repair.', confidence: 82, icon_svg: '<path d="M3 12l9-9 9 9M5 10v10h14V10"/>', meta_left: 'Potential savings: -$240/yr', meta_right: 'Post-claim' },
  { slug: 'lin-household', title: 'Life insurance — David & Amy', description: 'Two-income household with dependent child. No life coverage on file. Cross-sell propensity: moderate.', confidence: 55, icon_svg: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78"/>', meta_left: 'Est. premium: $1,100/yr', meta_right: 'Discovery call' },
  // Reeves
  { slug: 'reeves-household', title: 'Umbrella — $1M', description: 'New homeowners with young child. Standard umbrella recommendation for new bundles.', confidence: 65, icon_svg: '<path d="M12 2v2M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10H2zM12 12v8a2 2 0 11-4 0"/>', meta_left: 'Est. premium: $240/yr', meta_right: '1 min flow' },
  { slug: 'reeves-household', title: 'Life insurance — Jake & Megan', description: 'Young family with new mortgage. Life coverage gap identified. High propensity for term life bundle.', confidence: 74, icon_svg: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78"/>', meta_left: 'Est. premium: $780/yr', meta_right: 'Discovery call' },
  // Walsh
  { slug: 'walsh-family', title: 'Homeowners — first home purchase', description: 'Closing on property in Austin. MLS data pre-filled. 1,800 sqft, built 2020. Quote ready for review.', confidence: 88, icon_svg: '<path d="M3 12l9-9 9 9M5 10v10h14V10"/>', meta_left: 'Est. premium: $1,620/yr', meta_right: 'Pre-filled quote' },
  { slug: 'walsh-family', title: 'Auto+home bundle discount', description: 'Converting to multi-policy household would save 12-15% on combined premium.', confidence: 85, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14"/>', meta_left: 'Est. savings: -$340/yr', meta_right: 'Bundle quote' },
  // Dawson
  { slug: 'dawson-k', title: 'Watercraft endorsement review', description: 'Kevin purchased a boat. Current umbrella covers scheduled watercraft. Standalone boat policy may offer better coverage.', confidence: 60, icon_svg: '<path d="M2 20c2-2 4-3 6-3s4 1 6 3 4 3 6 3 4-1 6-3"/>', meta_left: 'Coverage review', meta_right: '5 min consult' },
  // Kim
  { slug: 'kim-s', title: 'Retention offer — rate hold', description: 'Progressive shopping signal detected. Proactive rate hold or re-quote with loss-free discount projection (if no claims 12mo).', confidence: 42, icon_svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', meta_left: 'Retention play', meta_right: 'Call today' },
  // Westbrook
  { slug: 'westbrook-d', title: 'Homeowners cross-sell', description: 'Derrick currently renting. Single-line auto. If homeowner conversion is possible, bundle discount would retain.', confidence: 35, icon_svg: '<path d="M3 12l9-9 9 9M5 10v10h14V10"/>', meta_left: 'Est. premium: $1,400/yr', meta_right: 'Discovery call' },
  // Henderson
  { slug: 'henderson-t', title: 'Homeowners — family home', description: 'Tom & Maria own home in Frisco but homeowners is with another carrier. Bundle opportunity if we can compete on rate.', confidence: 58, icon_svg: '<path d="M3 12l9-9 9 9M5 10v10h14V10"/>', meta_left: 'Est. premium: $2,100/yr', meta_right: 'Competitive quote' },
  // Donovan
  { slug: 'donovan-m', title: 'Homeowners — Southlake estate', description: 'Michael\'s homeowners is with another carrier. High-value home in Southlake. Premium would be significant.', confidence: 45, icon_svg: '<path d="M3 12l9-9 9 9M5 10v10h14V10"/>', meta_left: 'Est. premium: $4,200/yr', meta_right: 'Competitive quote' },
  // Chen
  { slug: 'chen-l', title: 'Landlord package — add liability', description: 'Investment duplex currently has property-only coverage. Landlord liability gap identified.', confidence: 70, icon_svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', meta_left: 'Est. premium: +$420/yr', meta_right: '2 min flow' },
  // Olsen
  { slug: 'olsen-r', title: 'Auto cross-sell', description: 'Rachel has homeowners only. Auto is with another carrier. Bundle discount could save 12-15%.', confidence: 52, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14"/>', meta_left: 'Est. savings: -$280/yr', meta_right: 'Competitive quote' },
  // Park
  { slug: 'park-j', title: 'Auto + homeowners bundle', description: 'James currently auto-only with another carrier. Homeowners conversion creates bundle opportunity.', confidence: 76, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14"/>', meta_left: 'Est. bundle: $2,980/yr', meta_right: 'Bundle quote' },
  // Torres
  { slug: 'torres-a', title: 'Homeowners cross-sell', description: 'Angela owns a condo in SA. No homeowners/condo policy on file. Cross-sell propensity: moderate.', confidence: 48, icon_svg: '<path d="M3 12l9-9 9 9M5 10v10h14V10"/>', meta_left: 'Est. premium: $980/yr', meta_right: 'Discovery call' },
  // Yamamoto
  { slug: 'yamamoto-k', title: 'Consolidate auto + home', description: 'Ken has underlying auto and home with other carriers. Consolidating would reduce umbrella cost and increase retention.', confidence: 40, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14"/>', meta_left: 'Retention play', meta_right: 'Competitive quote' },
  // Okonkwo
  { slug: 'okonkwo-a', title: 'Personal lines bundle — marriage', description: 'Marriage life event detected. Auto+home+umbrella bundle opportunity. Estimated household premium $3,100/yr.', confidence: 68, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14"/>', meta_left: 'Est. premium: $3,100/yr', meta_right: 'Bundle quote' },
  // Crestline
  { slug: 'crestline-bakery', title: 'Cyber liability — new TX product', description: 'POS system processes 400+ transactions/day. Customer email list has 2,800 entries. Cyber exposure is real.', confidence: 78, icon_svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', meta_left: 'Est. premium: $2,400/yr', meta_right: 'Quote ready' },
  { slug: 'crestline-bakery', title: 'EPLI coverage', description: '12 employees. No employment practices liability insurance. Growing workforce creates exposure.', confidence: 55, icon_svg: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>', meta_left: 'Est. premium: $1,200/yr', meta_right: 'Discovery call' },
  // Greenfield
  { slug: 'greenfield-dental', title: 'Cyber + HIPAA coverage', description: 'Dental practice stores patient PHI. HIPAA breach coverage gap identified. Critical for compliance.', confidence: 82, icon_svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', meta_left: 'Est. premium: $1,800/yr', meta_right: 'Quote ready' },
  // Martinez
  { slug: 'martinez-auto-group', title: 'Garage keepers legal liability', description: 'Auto dealership holding customer vehicles for service. Current coverage may be insufficient for inventory value.', confidence: 72, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14M5 13v5a1 1 0 001 1h2"/>', meta_left: 'Coverage review', meta_right: '10 min consult' },
  { slug: 'martinez-auto-group', title: 'Umbrella — $5M commercial', description: 'Concentration risk flagged. Umbrella would protect against catastrophic loss across 3 locations.', confidence: 65, icon_svg: '<path d="M12 2v2M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10H2zM12 12v8a2 2 0 11-4 0"/>', meta_left: 'Est. premium: $3,200/yr', meta_right: 'Quote ready' },
  // Blackwood
  { slug: 'blackwood-properties', title: 'Retention offer — portfolio review', description: 'Shopping signal detected. Proactive portfolio review with competitive analysis to demonstrate value.', confidence: 48, icon_svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', meta_left: 'Retention play', meta_right: 'Schedule review' },
  // Nguyen
  { slug: 'nguyen-construction', title: 'Commercial auto — 8 vehicles', description: 'Fleet of 8 work trucks currently with another carrier. Consolidating would reduce audit complexity.', confidence: 60, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14"/>', meta_left: 'Est. premium: $12,800/yr', meta_right: 'Competitive quote' },
  { slug: 'nguyen-construction', title: 'Inland marine — tools/equipment', description: '22 employees with portable tools and equipment. Currently uninsured. Average claim: $4,200.', confidence: 72, icon_svg: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>', meta_left: 'Est. premium: $3,400/yr', meta_right: '5 min flow' },
  // Mercer
  { slug: 'mercer-sons', title: 'Workers compensation', description: '6 employees doing physical plumbing work. No WC coverage. Required by TX law for contractors.', confidence: 90, icon_svg: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>', meta_left: 'Est. premium: $4,800/yr', meta_right: 'Required' },
  { slug: 'mercer-sons', title: 'Commercial auto — 3 vans', description: 'Service vans currently on personal auto policies. Commercial auto endorsement needed for work use.', confidence: 85, icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14"/>', meta_left: 'Est. premium: $3,200/yr', meta_right: 'Quote ready' },
];

// ── CLAIMS ──
const allClaims = [
  // Ramirez (already has timeline event for windshield, add formal claims)
  { slug: 'ramirez-household', claim_number: 'CLM-2025-09221', claim_date: 'Feb 3, 2025', claim_type: 'Comprehensive — glass', description: 'Windshield replacement · 2022 Honda CR-V · rock chip on I-30', amount: 487, status: 'closed', adjuster: 'J. Patterson' },
  { slug: 'ramirez-household', claim_number: 'CLM-2023-18442', claim_date: 'Jul 14, 2023', claim_type: 'Homeowners — weather', description: 'Wind damage to fence and patio cover · straight-line winds', amount: 3200, status: 'closed', adjuster: 'K. Thompson' },
  // Patel
  { slug: 'patel-household', claim_number: 'CLM-2024-22189', claim_date: 'Sep 8, 2024', claim_type: 'Homeowners — water', description: 'Dishwasher overflow · kitchen water damage · hardwood floor repair', amount: 4800, status: 'closed', adjuster: 'R. Davis' },
  // Lin
  { slug: 'lin-household', claim_number: 'CLM-2026-38921', claim_date: 'Mar 28, 2026', claim_type: 'Homeowners — hail', description: 'Hail damage to roof · full replacement needed · inspection Apr 4', amount: 18400, status: 'open', adjuster: 'M. Rodriguez' },
  // Dawson
  { slug: 'dawson-k', claim_number: 'CLM-2025-27894', claim_date: 'Sep 12, 2025', claim_type: 'Homeowners — water', description: 'Water heater leak · basement water damage · remediation and repair', amount: 4200, status: 'closed', adjuster: 'K. Thompson' },
  // Kim
  { slug: 'kim-s', claim_number: 'CLM-2026-31042', claim_date: 'Feb 18, 2026', claim_type: 'Auto — collision', description: 'Parking lot fender bender · rear bumper damage · no injuries', amount: 2800, status: 'closed', adjuster: 'S. Williams' },
  { slug: 'kim-s', claim_number: 'CLM-2025-28901', claim_date: 'Oct 4, 2025', claim_type: 'Auto — comprehensive', description: 'Windshield replacement · rock chip on I-635 · Safelite', amount: 412, status: 'closed', adjuster: null },
  // Westbrook
  { slug: 'westbrook-d', claim_number: 'CLM-2026-44871', claim_date: 'Apr 14, 2026', claim_type: 'Auto — collision', description: 'Rear-ended on I-35 · 2022 Ram 1500 · awaiting photos · est. repair', amount: 6200, status: 'open', adjuster: 'Rita Park' },
  // Crestline
  { slug: 'crestline-bakery', claim_number: 'CLM-2026-11234', claim_date: 'Jan 15, 2026', claim_type: 'Workers comp', description: 'Employee back strain · lifting heavy mixing bowls · 3 weeks lost time', amount: 8400, status: 'closed', adjuster: 'D. Foster' },
  // Greenfield
  { slug: 'greenfield-dental', claim_number: 'CLM-2026-35678', claim_date: 'Mar 14, 2026', claim_type: 'Property — water', description: 'Burst pipe in operatory 3 · equipment and flooring damage', amount: 24000, status: 'open', adjuster: 'T. Ramirez' },
  // Martinez
  { slug: 'martinez-auto-group', claim_number: 'CLM-2026-22345', claim_date: 'Jan 22, 2026', claim_type: 'Commercial auto', description: 'Delivery van rear-ended at red light · body work and bumper', amount: 9800, status: 'closed', adjuster: 'P. Gonzalez' },
  { slug: 'martinez-auto-group', claim_number: 'CLM-2025-44123', claim_date: 'Aug 8, 2025', claim_type: 'Commercial auto', description: 'Lot vehicle vandalism · 2 windshields broken · overnight', amount: 1400, status: 'closed', adjuster: 'P. Gonzalez' },
  // Blackwood
  { slug: 'blackwood-properties', claim_number: 'CLM-2025-29012', claim_date: 'Nov 3, 2025', claim_type: 'GL — tenant injury', description: 'Tenant slip on wet floor in common area · knee injury · medical only', amount: 6800, status: 'closed', adjuster: 'R. Davis' },
  // Nguyen
  { slug: 'nguyen-construction', claim_number: 'CLM-2025-31456', claim_date: 'Dec 5, 2025', claim_type: 'Workers comp', description: 'Employee fall from scaffold · broken wrist · 6 weeks lost time', amount: 22400, status: 'closed', adjuster: 'M. Chen' },
];

// ── BILLING ──
const allBilling = [
  // Ramirez
  { slug: 'ramirez-household', txn_date: 'Apr 14', description: 'Auto monthly autopay', amount: 15333, txn_type: 'payment', method: 'ACH · Wells Fargo ··4421', status: 'completed' },
  { slug: 'ramirez-household', txn_date: 'Mar 14', description: 'Auto monthly autopay', amount: 15333, txn_type: 'payment', method: 'ACH · Wells Fargo ··4421', status: 'completed' },
  { slug: 'ramirez-household', txn_date: 'Feb 14', description: 'Auto monthly autopay', amount: 15333, txn_type: 'payment', method: 'ACH · Wells Fargo ··4421', status: 'completed' },
  { slug: 'ramirez-household', txn_date: 'Jul 2025', description: 'Umbrella annual payment', amount: 34000, txn_type: 'payment', method: 'ACH · Wells Fargo ··4421', status: 'completed' },
  { slug: 'ramirez-household', txn_date: 'Apr 1', description: 'Life (Carlos) quarterly', amount: 16000, txn_type: 'payment', method: 'ACH · Wells Fargo ··4421', status: 'completed' },
  // Patel
  { slug: 'patel-household', txn_date: 'Apr 15', description: 'Auto monthly autopay', amount: 18167, txn_type: 'payment', method: 'Amex ··4412', status: 'completed' },
  { slug: 'patel-household', txn_date: 'Mar 15', description: 'Auto monthly autopay', amount: 18167, txn_type: 'payment', method: 'Amex ··4412', status: 'completed' },
  { slug: 'patel-household', txn_date: 'Apr 1', description: 'Life (Raj) quarterly', amount: 23000, txn_type: 'payment', method: 'Amex ··4412', status: 'completed' },
  // Lin
  { slug: 'lin-household', txn_date: 'Apr 1', description: 'Auto semi-annual', amount: 112000, txn_type: 'payment', method: 'ACH · Chase ··7823', status: 'completed' },
  { slug: 'lin-household', txn_date: 'Nov 2025', description: 'Homeowners annual', amount: 240000, txn_type: 'payment', method: 'ACH · Chase ··7823', status: 'completed' },
  // Reeves
  { slug: 'reeves-household', txn_date: 'Apr 22', description: 'Initial premium — auto + home', amount: 348000, txn_type: 'payment', method: 'ACH · BOA ··3391', status: 'completed' },
  // Walsh
  { slug: 'walsh-family', txn_date: 'Apr 12', description: 'Auto monthly autopay', amount: 10333, txn_type: 'payment', method: 'Visa ··9012', status: 'completed' },
  { slug: 'walsh-family', txn_date: 'Mar 12', description: 'Auto monthly autopay', amount: 10333, txn_type: 'payment', method: 'Visa ··9012', status: 'completed' },
  // Dawson
  { slug: 'dawson-k', txn_date: 'Apr 18', description: 'Auto monthly autopay', amount: 24333, txn_type: 'payment', method: 'ACH · BOA ··5567', status: 'completed' },
  { slug: 'dawson-k', txn_date: 'Mar 2026', description: 'Umbrella annual', amount: 38000, txn_type: 'payment', method: 'ACH · BOA ··5567', status: 'completed' },
  // Kim
  { slug: 'kim-s', txn_date: 'Apr 14', description: 'Auto monthly autopay', amount: 11833, txn_type: 'payment', method: 'Visa ··3456', status: 'completed' },
  // Westbrook
  { slug: 'westbrook-d', txn_date: 'Apr 10', description: 'Auto monthly autopay', amount: 17000, txn_type: 'payment', method: 'ACH · USAA ··8901', status: 'completed' },
  // Henderson
  { slug: 'henderson-t', txn_date: 'Apr 1', description: 'Auto semi-annual', amount: 79000, txn_type: 'payment', method: 'ACH · Wells Fargo ··6678', status: 'completed' },
  // Donovan
  { slug: 'donovan-m', txn_date: 'Apr 12', description: 'Auto monthly autopay', amount: 17000, txn_type: 'payment', method: 'ACH · Chase ··2234', status: 'nsf' },
  { slug: 'donovan-m', txn_date: 'Mar 12', description: 'Auto monthly autopay', amount: 17000, txn_type: 'payment', method: 'ACH · Chase ··2234', status: 'completed' },
  { slug: 'donovan-m', txn_date: 'Apr 2026', description: 'Umbrella annual', amount: 38000, txn_type: 'payment', method: 'ACH · Chase ··2234', status: 'completed' },
  // Chen
  { slug: 'chen-l', txn_date: 'Apr 5', description: 'Homeowners quarterly', amount: 75000, txn_type: 'payment', method: 'ACH · Citi ··5567', status: 'completed' },
  // Olsen
  { slug: 'olsen-r', txn_date: 'Apr 8', description: 'Homeowners monthly', amount: 19500, txn_type: 'payment', method: 'ACH · Chase ··1189', status: 'completed' },
  // Park
  { slug: 'park-j', txn_date: 'Apr 10', description: 'Renters monthly', amount: 2333, txn_type: 'payment', method: 'Visa ··7734', status: 'completed' },
  // Torres
  { slug: 'torres-a', txn_date: 'Apr 1', description: 'Auto semi-annual', amount: 59000, txn_type: 'payment', method: 'ACH · USAA ··4478', status: 'completed' },
  // Yamamoto
  { slug: 'yamamoto-k', txn_date: 'May 2025', description: 'Umbrella annual', amount: 62000, txn_type: 'payment', method: 'Check #4812', status: 'completed' },
  // Okonkwo
  { slug: 'okonkwo-a', txn_date: 'Jun 2025', description: 'Term life annual', amount: 84000, txn_type: 'payment', method: 'ACH · Chase ··3345', status: 'completed' },
  // Crestline
  { slug: 'crestline-bakery', txn_date: 'Apr 1', description: 'BOP quarterly installment', amount: 960000, txn_type: 'payment', method: 'ACH · business ··7712', status: 'completed' },
  { slug: 'crestline-bakery', txn_date: 'Apr 1', description: 'WC monthly', amount: 64167, txn_type: 'payment', method: 'ACH · business ··7712', status: 'completed' },
  // Greenfield
  { slug: 'greenfield-dental', txn_date: 'Apr 5', description: 'BOP quarterly installment', amount: 205000, txn_type: 'payment', method: 'ACH · practice ··2289', status: 'completed' },
  // Martinez
  { slug: 'martinez-auto-group', txn_date: 'Apr 1', description: 'Commercial auto monthly', amount: 206667, txn_type: 'payment', method: 'ACH · business ··8834', status: 'completed' },
  { slug: 'martinez-auto-group', txn_date: 'Apr 1', description: 'GL quarterly', amount: 310000, txn_type: 'payment', method: 'ACH · business ··8834', status: 'completed' },
  // Blackwood
  { slug: 'blackwood-properties', txn_date: 'Apr 5', description: 'Property quarterly', amount: 120000, txn_type: 'payment', method: 'Wire transfer', status: 'completed' },
  // Nguyen
  { slug: 'nguyen-construction', txn_date: 'Apr 1', description: 'GL + WC monthly', amount: 236667, txn_type: 'payment', method: 'ACH · business ··5590', status: 'completed' },
  // Mercer
  { slug: 'mercer-sons', txn_date: 'Apr 1', description: 'BOP quarterly', amount: 110000, txn_type: 'payment', method: 'Check #1822', status: 'completed' },
];

// ── DOCUMENTS ──
const allDocuments = [
  // Ramirez
  { slug: 'ramirez-household', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-771422', doc_date: 'Apr 2026', file_size: '245 KB' },
  { slug: 'ramirez-household', doc_type: 'Dec page', title: 'Homeowners declarations — POL-HO-441208', doc_date: 'Apr 2026', file_size: '312 KB' },
  { slug: 'ramirez-household', doc_type: 'Dec page', title: 'Umbrella declarations — POL-UM-090714', doc_date: 'Jul 2025', file_size: '189 KB' },
  { slug: 'ramirez-household', doc_type: 'ID card', title: 'Auto ID cards — Carlos & Elena', doc_date: 'Apr 2026', file_size: '84 KB' },
  { slug: 'ramirez-household', doc_type: 'Renewal', title: 'Renewal offer — auto + home bundle', doc_date: 'Apr 2026', file_size: '428 KB' },
  { slug: 'ramirez-household', doc_type: 'Claim', title: 'Claim summary — CLM-2025-09221', doc_date: 'Feb 2025', file_size: '156 KB' },
  { slug: 'ramirez-household', doc_type: 'Certificate', title: 'Life certificate — Carlos Ramirez', doc_date: 'Jan 2021', file_size: '98 KB' },
  { slug: 'ramirez-household', doc_type: 'Certificate', title: 'Life certificate — Elena Ramirez', doc_date: 'Jan 2021', file_size: '96 KB' },
  // Patel
  { slug: 'patel-household', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-883201', doc_date: 'Apr 2026', file_size: '238 KB' },
  { slug: 'patel-household', doc_type: 'Dec page', title: 'Homeowners declarations — POL-HO-556718', doc_date: 'Jan 2026', file_size: '298 KB' },
  { slug: 'patel-household', doc_type: 'ID card', title: 'Auto ID cards — Raj & Priya', doc_date: 'Apr 2026', file_size: '82 KB' },
  { slug: 'patel-household', doc_type: 'Quote', title: 'Term life quote — Raj Patel', doc_date: 'Apr 2026', file_size: '124 KB' },
  { slug: 'patel-household', doc_type: 'Endorsement', title: 'Ananya Patel — driver add', doc_date: 'Jan 2026', file_size: '102 KB' },
  // Lin
  { slug: 'lin-household', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-771890', doc_date: 'Mar 2026', file_size: '241 KB' },
  { slug: 'lin-household', doc_type: 'Dec page', title: 'Homeowners declarations — POL-HO-441254', doc_date: 'Nov 2025', file_size: '305 KB' },
  { slug: 'lin-household', doc_type: 'Claim', title: 'Claim report — CLM-2026-38921', doc_date: 'Mar 2026', file_size: '342 KB' },
  { slug: 'lin-household', doc_type: 'Inspection', title: 'Roof inspection report', doc_date: 'Apr 2026', file_size: '1.2 MB' },
  // Keep it shorter for remaining — 3-4 docs each
  { slug: 'reeves-household', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-992341', doc_date: 'Apr 2026', file_size: '232 KB' },
  { slug: 'reeves-household', doc_type: 'Dec page', title: 'Homeowners declarations — POL-HO-662180', doc_date: 'Apr 2026', file_size: '289 KB' },
  { slug: 'reeves-household', doc_type: 'ID card', title: 'Auto ID cards — Jake & Megan', doc_date: 'Apr 2026', file_size: '81 KB' },
  { slug: 'walsh-family', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-884512', doc_date: 'Mar 2025', file_size: '218 KB' },
  { slug: 'walsh-family', doc_type: 'ID card', title: 'Auto ID card — Brian Walsh', doc_date: 'Mar 2025', file_size: '78 KB' },
  { slug: 'walsh-family', doc_type: 'Quote', title: 'Homeowners quote — pre-filled', doc_date: 'Apr 2026', file_size: '156 KB' },
  { slug: 'dawson-k', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-667123', doc_date: 'Mar 2026', file_size: '256 KB' },
  { slug: 'dawson-k', doc_type: 'Dec page', title: 'Homeowners declarations — POL-HO-338741', doc_date: 'Sep 2025', file_size: '318 KB' },
  { slug: 'dawson-k', doc_type: 'Dec page', title: 'Umbrella declarations — POL-UM-112340', doc_date: 'Mar 2026', file_size: '186 KB' },
  { slug: 'dawson-k', doc_type: 'Claim', title: 'Claim summary — CLM-2025-27894', doc_date: 'Sep 2025', file_size: '148 KB' },
  { slug: 'kim-s', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-778934', doc_date: 'Aug 2025', file_size: '224 KB' },
  { slug: 'kim-s', doc_type: 'ID card', title: 'Auto ID card — Sarah Kim', doc_date: 'Aug 2025', file_size: '76 KB' },
  { slug: 'kim-s', doc_type: 'Claim', title: 'Claim summary — CLM-2026-31042', doc_date: 'Feb 2026', file_size: '134 KB' },
  { slug: 'westbrook-d', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-889102', doc_date: 'Mar 2024', file_size: '228 KB' },
  { slug: 'westbrook-d', doc_type: 'Claim', title: 'Claim report — CLM-2026-44871', doc_date: 'Apr 2026', file_size: '286 KB' },
  { slug: 'henderson-t', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-665478', doc_date: 'Jan 2026', file_size: '234 KB' },
  { slug: 'henderson-t', doc_type: 'Endorsement', title: 'Teen driver add — pending', doc_date: 'Apr 2026', file_size: '108 KB' },
  { slug: 'donovan-m', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-882103', doc_date: 'May 2025', file_size: '226 KB' },
  { slug: 'donovan-m', doc_type: 'Dec page', title: 'Umbrella declarations — POL-UM-334567', doc_date: 'Apr 2026', file_size: '192 KB' },
  { slug: 'donovan-m', doc_type: 'Endorsement', title: 'Watercraft endorsement', doc_date: 'Apr 2026', file_size: '114 KB' },
  { slug: 'chen-l', doc_type: 'Dec page', title: 'Homeowners declarations — POL-HO-998234', doc_date: 'Oct 2024', file_size: '302 KB' },
  { slug: 'chen-l', doc_type: 'Quote', title: 'Competing Allstate comparison', doc_date: 'Apr 2026', file_size: '88 KB' },
  { slug: 'olsen-r', doc_type: 'Dec page', title: 'Homeowners declarations — POL-HO-445612', doc_date: 'Feb 2023', file_size: '296 KB' },
  { slug: 'olsen-r', doc_type: 'Endorsement', title: 'Garage addition endorsement', doc_date: 'Apr 2026', file_size: '118 KB' },
  { slug: 'park-j', doc_type: 'Dec page', title: 'Renters declarations — POL-RN-228901', doc_date: 'Jul 2024', file_size: '178 KB' },
  { slug: 'park-j', doc_type: 'Quote', title: 'Homeowners quote — conversion', doc_date: 'Apr 2026', file_size: '162 KB' },
  { slug: 'torres-a', doc_type: 'Dec page', title: 'Auto declarations — POL-AU-556789', doc_date: 'Apr 2025', file_size: '216 KB' },
  { slug: 'torres-a', doc_type: 'ID card', title: 'Auto ID card — Angela Torres', doc_date: 'Apr 2025', file_size: '74 KB' },
  { slug: 'yamamoto-k', doc_type: 'Dec page', title: 'Umbrella declarations — POL-UM-778234', doc_date: 'May 2025', file_size: '184 KB' },
  { slug: 'yamamoto-k', doc_type: 'Renewal', title: 'Renewal offer — umbrella', doc_date: 'Apr 2026', file_size: '142 KB' },
  { slug: 'okonkwo-a', doc_type: 'Certificate', title: 'Life certificate — Adaeze Okonkwo', doc_date: 'Jun 2021', file_size: '94 KB' },
  { slug: 'okonkwo-a', doc_type: 'Dec page', title: 'Term life declarations — POL-LF-445678', doc_date: 'Jun 2025', file_size: '168 KB' },
  { slug: 'crestline-bakery', doc_type: 'Dec page', title: 'BOP declarations — POL-BP-220156', doc_date: 'Jan 2026', file_size: '412 KB' },
  { slug: 'crestline-bakery', doc_type: 'Dec page', title: 'WC declarations — POL-WC-330289', doc_date: 'Jan 2026', file_size: '328 KB' },
  { slug: 'crestline-bakery', doc_type: 'COI', title: 'Certificate of insurance', doc_date: 'Jan 2026', file_size: '96 KB' },
  { slug: 'crestline-bakery', doc_type: 'Claim', title: 'WC claim summary — CLM-2026-11234', doc_date: 'Jan 2026', file_size: '184 KB' },
  { slug: 'greenfield-dental', doc_type: 'Dec page', title: 'BOP declarations — POL-BP-440312', doc_date: 'Mar 2023', file_size: '396 KB' },
  { slug: 'greenfield-dental', doc_type: 'Dec page', title: 'Prof liability — POL-PL-550478', doc_date: 'Mar 2023', file_size: '284 KB' },
  { slug: 'greenfield-dental', doc_type: 'Claim', title: 'Property claim — CLM-2026-35678', doc_date: 'Mar 2026', file_size: '428 KB' },
  { slug: 'martinez-auto-group', doc_type: 'Dec page', title: 'Commercial auto — POL-CA-660123', doc_date: 'Sep 2025', file_size: '486 KB' },
  { slug: 'martinez-auto-group', doc_type: 'Dec page', title: 'GL declarations — POL-GL-770234', doc_date: 'Sep 2025', file_size: '368 KB' },
  { slug: 'martinez-auto-group', doc_type: 'Fleet schedule', title: 'Vehicle schedule — 14 units', doc_date: 'Apr 2026', file_size: '124 KB' },
  { slug: 'martinez-auto-group', doc_type: 'COI', title: 'Certificate of insurance', doc_date: 'Sep 2025', file_size: '98 KB' },
  { slug: 'blackwood-properties', doc_type: 'Dec page', title: 'Property declarations — POL-CP-110456', doc_date: 'Jun 2025', file_size: '442 KB' },
  { slug: 'blackwood-properties', doc_type: 'Dec page', title: 'GL declarations — POL-GL-220567', doc_date: 'Jun 2025', file_size: '324 KB' },
  { slug: 'blackwood-properties', doc_type: 'Property schedule', title: 'Property schedule — 3 locations', doc_date: 'Jun 2025', file_size: '112 KB' },
  { slug: 'nguyen-construction', doc_type: 'Dec page', title: 'GL declarations — POL-GL-440789', doc_date: 'Apr 2025', file_size: '358 KB' },
  { slug: 'nguyen-construction', doc_type: 'Dec page', title: 'WC declarations — POL-WC-550890', doc_date: 'Apr 2025', file_size: '342 KB' },
  { slug: 'nguyen-construction', doc_type: 'Audit', title: 'WC payroll audit worksheet', doc_date: 'Apr 2026', file_size: '86 KB' },
  { slug: 'mercer-sons', doc_type: 'Dec page', title: 'BOP declarations — POL-BP-660901', doc_date: 'Oct 2025', file_size: '312 KB' },
  { slug: 'mercer-sons', doc_type: 'COI', title: 'Certificate of insurance', doc_date: 'Oct 2025', file_size: '92 KB' },
];

// ── NOTES ──
const allNotes = [
  // Ramirez
  { slug: 'ramirez-household', author: 'Maya Chen', note_date: 'Apr 27', content: 'Carlos called — State Farm quoted $3,180 for auto+home bundle vs our $3,840. Sounded open to staying but wants to see if we can match. Renewal is May 2. Need to prepare competitive analysis.', note_type: 'call' },
  { slug: 'ramirez-household', author: 'Maya Chen', note_date: 'Apr 20', content: 'Renewal package generated. 18.4% increase driven by territory loss trends and roof age. Carlos will likely push back on premium. Prepare bundle re-rate with loyalty discount.', note_type: 'note' },
  { slug: 'ramirez-household', author: 'Maya Chen', note_date: 'Feb 5', content: 'Windshield claim resolved quickly. Carlos appreciated the zero-deductible glass coverage. Good touchpoint — reinforces value of our coverage vs bare-bones competitors.', note_type: 'note' },
  // Patel
  { slug: 'patel-household', author: 'Maya Chen', note_date: 'Apr 28', content: 'Raj called about term life. Quoted $920/yr for $750K 20-year term. He wants to discuss with Priya. Follow up this afternoon.', note_type: 'call' },
  { slug: 'patel-household', author: 'Maya Chen', note_date: 'Jan 15', content: 'Added Ananya to auto policy. Away-from-home college student discount applied. Raj asked about Dev — will need to add him this summer when he gets his license.', note_type: 'note' },
  // Lin
  { slug: 'lin-household', author: 'Maya Chen', note_date: 'Mar 30', content: 'Spoke with David about roof inspection. Inspector scheduled April 4. David concerned about premium impact. Discussed potential for premium decrease if roof is replaced.', note_type: 'call' },
  { slug: 'lin-household', author: 'Maya Chen', note_date: 'Mar 28', content: 'Hail claim filed. Significant roof damage. Adjuster M. Rodriguez assigned. Estimated $18,400. Will follow up after inspection.', note_type: 'note' },
  // Reeves
  { slug: 'reeves-household', author: 'Maya Chen', note_date: 'Apr 22', content: 'New business bound. Jake and Megan Reeves — referred by Michael Donovan. Auto + home bundle. Great first impression. Will follow up in 30 days for satisfaction check.', note_type: 'note' },
  // Walsh
  { slug: 'walsh-family', author: 'Data 360', note_date: 'Apr 24', content: 'Life event detected: home purchase. MLS data shows Walsh closing on 1,800 sqft home in Austin. Built 2020. Purchase price $385K. Pre-filled homeowners quote generated.', note_type: 'system' },
  { slug: 'walsh-family', author: 'Maya Chen', note_date: 'Mar 2025', content: 'New auto policy bound. Brian and Nicole Walsh. Single vehicle — 2023 Subaru Outback. Young couple, currently renting.', note_type: 'note' },
  // Dawson
  { slug: 'dawson-k', author: 'Maya Chen', note_date: 'Apr 10', content: 'Annual review with Kevin. Very happy. Bought a 22ft Sea Ray — added watercraft endorsement to umbrella. Kevin referred Jake Reeves for auto+home. Great client relationship.', note_type: 'call' },
  { slug: 'dawson-k', author: 'Maya Chen', note_date: 'Sep 2025', content: 'Water heater leak claim. Kevin handled it well. Basement damage. $4,200 paid after $2,500 deductible. Discussed replacement prevention.', note_type: 'note' },
  // Kim
  { slug: 'kim-s', author: 'Data 360', note_date: 'Mar 8', content: 'Shopping signal: Progressive comparison activity detected via third-party intent feed. 2 claims in 24 months driving premium sensitivity.', note_type: 'system' },
  { slug: 'kim-s', author: 'Maya Chen', note_date: 'Feb 20', content: 'Fender bender claim resolved. Sarah frustrated with premium impact. Discussed safe driver program and claim-free discount timeline.', note_type: 'call' },
  // Westbrook
  { slug: 'westbrook-d', author: 'Maya Chen', note_date: 'Apr 14', content: 'Derrick called to report collision. Rear-ended on I-35. Ram 1500 needs body work. Filed FNOL — adjuster Rita Park assigned. Need photos uploaded.', note_type: 'call' },
  // Henderson
  { slug: 'henderson-t', author: 'Maya Chen', note_date: 'Mar 25', content: 'Tom called about adding Jake (16) to policy. Discussed good student and defensive driving discounts. Tom will send grades for GPA verification.', note_type: 'call' },
  { slug: 'henderson-t', author: 'Data 360', note_date: 'Feb 2026', content: 'Teen driver detected: DMV permit issued for Jake Henderson (age 16). Recommended proactive outreach for policy addition.', note_type: 'system' },
  // Donovan
  { slug: 'donovan-m', author: 'Maya Chen', note_date: 'Apr 8', content: 'Michael bought a 22ft Sea Ray. Discussed watercraft options — went with umbrella endorsement vs standalone. Also referred Jake Reeves.', note_type: 'call' },
  { slug: 'donovan-m', author: 'System', note_date: 'Apr 12', content: 'NSF on autopay — $170 auto premium. ACH from Chase ··2234 returned insufficient funds. Grace period ends May 6.', note_type: 'system' },
  // Chen
  { slug: 'chen-l', author: 'Maya Chen', note_date: 'Apr 22', content: 'Lisa received Allstate quote at $2,680/yr vs our $3,000. Our coverage includes ordinance/law and sewer backup — theirs doesn\'t. Need to prepare comparison sheet.', note_type: 'call' },
  // Olsen
  { slug: 'olsen-r', author: 'Maya Chen', note_date: 'Mar 28', content: 'DocuSign sent for garage endorsement. Rachel building 600 sqft detached garage. Coverage increase $45K dwelling. Awaiting signature.', note_type: 'note' },
  // Park
  { slug: 'park-j', author: 'Data 360', note_date: 'Apr 26', content: 'Life event: property closing May 8. MLS: 2,400 sqft, built 2018, good condition. Pre-filled homeowners quote at $1,890/yr.', note_type: 'system' },
  // Torres
  { slug: 'torres-a', author: 'Maya Chen', note_date: 'Apr 2023', content: 'New auto policy bound. Angela Torres. Clean driving record. Good driver discount. Semi-annual payment.', note_type: 'note' },
  // Yamamoto
  { slug: 'yamamoto-k', author: 'Maya Chen', note_date: 'Apr 2025', content: 'Annual review. Ken satisfied with $2M umbrella. Underlying auto and home remain with other carriers. Discussed consolidation — Ken prefers to keep separate for now.', note_type: 'call' },
  // Okonkwo
  { slug: 'okonkwo-a', author: 'Data 360', note_date: 'Apr 27', content: 'Marriage life event detected via public records. Bundle opportunity: auto + home + umbrella. Estimated household premium $3,100/yr.', note_type: 'system' },
  // Crestline
  { slug: 'crestline-bakery', author: 'Maya Chen', note_date: 'Mar 15', content: 'Annual review with Diane Morales. Discussed cyber exposure — POS processes 400+ txn/day, 2,800 email subscribers. New TX cyber product is a good fit. Quoting $2,400/yr.', note_type: 'call' },
  { slug: 'crestline-bakery', author: 'Maya Chen', note_date: 'Jan 18', content: 'WC claim resolved. Employee back strain from lifting. 3 weeks lost time. Discussed ergonomic training to prevent recurrence.', note_type: 'note' },
  // Greenfield
  { slug: 'greenfield-dental', author: 'Maya Chen', note_date: 'Mar 20', content: 'Dr. Greenfield concerned about HIPAA exposure after hearing about breaches at other practices. Cyber+HIPAA coverage quoted at $1,800/yr. High interest.', note_type: 'call' },
  // Martinez
  { slug: 'martinez-auto-group', author: 'Maya Chen', note_date: 'Apr 25', content: 'Fleet renewal discussion with Roberto. 2 vehicles totaled this year, adding 3 new. Still waiting on loss runs from prior carrier for GL renewal.', note_type: 'call' },
  // Blackwood
  { slug: 'blackwood-properties', author: 'Data 360', note_date: 'Apr 20', content: 'Shopping signal: Nationwide comparison activity detected. Premium sensitivity triggered by 8.5% renewal increase on portfolio.', note_type: 'system' },
  // Nguyen
  { slug: 'nguyen-construction', author: 'Maya Chen', note_date: 'Apr 15', content: 'WC audit initiated. 22 employees currently. Payroll has increased — expecting additional premium. Tran aware and budgeting for it.', note_type: 'call' },
  // Mercer
  { slug: 'mercer-sons', author: 'Maya Chen', note_date: 'Apr 16', content: 'Bill opening second shop in Arlington. Needs BOP endorsement for additional location. Also discussed WC — currently no WC coverage for 6 employees. Required by TX law.', note_type: 'call' },
];

async function seed(client) {
  // 1. Update all customer detail fields
  for (const cu of customerUpdates) {
    await client.query(
      `UPDATE customers SET
        name = COALESCE($2, name),
        location = $3, client_since = $4, member_count = $5, lifetime_value = $6,
        tier = $7, email = $8, phone = $9, preferred_contact = $10, language = $11, retention_detail_score = $12
       WHERE slug = $1`,
      [cu.slug, cu.name, cu.location, cu.client_since, cu.member_count, cu.lifetime_value, cu.tier, cu.email, cu.phone, cu.preferred_contact, cu.language, cu.retention_detail_score]
    );
  }

  // 2. Insert policies (skip Ramirez — already has them)
  for (let i = 0; i < allPolicies.length; i++) {
    const p = allPolicies[i];
    const custId = await cid(client, p.slug);
    await client.query(
      `INSERT INTO policies (customer_id, policy_number, line_type, title, subtitle, premium, payment_freq, status, status_label, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [custId, p.policy_number, p.line_type, p.title, p.subtitle, p.premium, p.payment_freq, p.status, p.status_label, i]
    );
  }

  // 3. Insert household members (skip Ramirez)
  for (let i = 0; i < allMembers.length; i++) {
    const m = allMembers[i];
    const custId = await cid(client, m.slug);
    await client.query(
      'INSERT INTO household_members (customer_id, name, initials, relationship, detail, avatar_class, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [custId, m.name, m.initials, m.relationship, m.detail, m.avatar_class, i]
    );
  }

  // 4. Insert timeline events (skip Ramirez)
  for (let i = 0; i < allEvents.length; i++) {
    const e = allEvents[i];
    const custId = await cid(client, e.slug);
    await client.query(
      'INSERT INTO timeline_events (customer_id, event_type, event_time, title, detail, attribution, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [custId, e.event_type, e.event_time, e.title, e.detail, e.attribution, i]
    );
  }

  // 5. Insert retention factors (skip Ramirez)
  for (let i = 0; i < allFactors.length; i++) {
    const f = allFactors[i];
    const custId = await cid(client, f.slug);
    await client.query(
      'INSERT INTO retention_factors (customer_id, label, value, sentiment, sort_order) VALUES ($1,$2,$3,$4,$5)',
      [custId, f.label, f.value, f.sentiment, i]
    );
  }

  // 6. Insert opportunities (skip Ramirez)
  for (let i = 0; i < allOpportunities.length; i++) {
    const o = allOpportunities[i];
    const custId = await cid(client, o.slug);
    await client.query(
      'INSERT INTO opportunities (customer_id, title, description, confidence, icon_svg, meta_left, meta_right, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [custId, o.title, o.description, o.confidence, o.icon_svg, o.meta_left, o.meta_right, i]
    );
  }

  // 7. Insert claims
  for (let i = 0; i < allClaims.length; i++) {
    const c = allClaims[i];
    const custId = await cid(client, c.slug);
    await client.query(
      'INSERT INTO customer_claims (customer_id, claim_number, claim_date, claim_type, description, amount, status, adjuster, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [custId, c.claim_number, c.claim_date, c.claim_type, c.description, c.amount, c.status, c.adjuster, i]
    );
  }

  // 8. Insert billing
  for (let i = 0; i < allBilling.length; i++) {
    const b = allBilling[i];
    const custId = await cid(client, b.slug);
    await client.query(
      'INSERT INTO customer_billing (customer_id, txn_date, description, amount, txn_type, method, status, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [custId, b.txn_date, b.description, b.amount, b.txn_type, b.method, b.status, i]
    );
  }

  // 9. Insert documents
  for (let i = 0; i < allDocuments.length; i++) {
    const d = allDocuments[i];
    const custId = await cid(client, d.slug);
    await client.query(
      'INSERT INTO customer_documents (customer_id, doc_type, title, doc_date, file_size, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
      [custId, d.doc_type, d.title, d.doc_date, d.file_size, i]
    );
  }

  // 10. Insert notes
  for (let i = 0; i < allNotes.length; i++) {
    const n = allNotes[i];
    const custId = await cid(client, n.slug);
    await client.query(
      'INSERT INTO customer_notes (customer_id, author, note_date, content, note_type, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
      [custId, n.author, n.note_date, n.content, n.note_type, i]
    );
  }

  console.log(`Seeded: ${customerUpdates.length} customer updates, ${allPolicies.length} policies, ${allMembers.length} members, ${allEvents.length} events, ${allFactors.length} factors, ${allOpportunities.length} opportunities, ${allClaims.length} claims, ${allBilling.length} billing, ${allDocuments.length} documents, ${allNotes.length} notes.`);
}

if (require.main === module) {
  (async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await seed(client);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
      await pool.end();
    }
  })().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = seed;
