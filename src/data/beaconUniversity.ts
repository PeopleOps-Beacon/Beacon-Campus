import type {
  Building,
  Campus,
  CampusAlert,
  CampusEvent,
  CampusService,
  ClassScheduleEntry,
  ConstructionNotice,
  OrientationItem,
  ParkingLot,
  QuickQuestion,
  TourStop,
  WalkingPathEdge,
  WalkingPathNode
} from "../types/campus";

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

const buildings: Building[] = [
  {
    id: "richardson",
    name: "Long Hall",
    abbreviation: "LH",
    aliases: ["long hall", "richardson", "science hall", "science building", "life sciences", "lh", "chem lab", "chemistry lab"],
    category: "academic",
    description:
      "Home to biology, chemistry, and physics labs, lecture halls, and the Science Tutoring Center.",
    address: "210 Discovery Way",
    point: { x: 430, y: 260 },
    floors: 3,
    primaryEntranceId: "richardson-west",
    accessibleEntranceId: "richardson-south",
    entrances: [
      { id: "richardson-north", label: "North Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 430, y: 235 } },
      { id: "richardson-south", label: "South Entrance", side: "south", accessible: true, automaticDoor: true, point: { x: 430, y: 285 }, notes: "Ramp and automatic doors" },
      { id: "richardson-west", label: "West Entrance", side: "west", accessible: false, automaticDoor: false, point: { x: 405, y: 260 } },
      { id: "richardson-east", label: "East Entrance", side: "east", accessible: false, automaticDoor: false, point: { x: 455, y: 260 } }
    ],
    rooms: [
      { id: "richardson-204", number: "204", name: "BIO 101 Lecture Hall", floor: 2 },
      { id: "richardson-110", number: "110", name: "Chemistry Lab", floor: 1 },
      { id: "richardson-118", number: "118", floor: 1 }
    ],
    departments: [
      { id: "dept-science", name: "Science Department", abbreviation: "SCI", floor: 2, hoursNote: "Monday–Friday, 9 AM–4 PM" }
    ],
    amenities: [
      { id: "richardson-elevator", type: "elevator", label: "Elevator, 30 ft inside the south entrance", floor: 1 },
      { id: "richardson-stairs", type: "stairs", label: "Main stairwell just inside the south entrance", floor: 1 },
      { id: "richardson-restroom-1", type: "restroom", label: "1st floor, east corridor", floor: 1 },
      { id: "richardson-arestroom-2", type: "accessible-restroom", label: "2nd floor, near Room 204", floor: 2 }
    ],
    hours: { opens: "07:00", closes: "22:00" },
    nearbyParkingIds: ["lot-d", "lot-c"],
    landmarkNote: "Past Cooper Library, on the north side of Bowman Field",
    photoTone: "stone"
  },
  {
    id: "jefferson",
    name: "Strode Tower",
    abbreviation: "ST",
    aliases: ["strode tower", "strode", "jefferson", "academic center", "st", "english 101"],
    category: "academic",
    description: "General-education classrooms, seminar rooms, and the English & Humanities Department.",
    address: "140 University Parkway",
    point: { x: 560, y: 210 },
    floors: 2,
    primaryEntranceId: "jefferson-north",
    accessibleEntranceId: "jefferson-south",
    entrances: [
      { id: "jefferson-north", label: "North Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 560, y: 185 } },
      { id: "jefferson-south", label: "South Entrance", side: "south", accessible: true, automaticDoor: true, point: { x: 560, y: 235 } }
    ],
    rooms: [{ id: "jefferson-115", number: "115", name: "English 101", floor: 1 }],
    departments: [{ id: "dept-english", name: "English & Humanities Department", floor: 2, hoursNote: "Monday–Friday, 9 AM–4 PM" }],
    amenities: [
      { id: "jefferson-elevator", type: "elevator", label: "Elevator near the south entrance", floor: 1 },
      { id: "jefferson-restroom", type: "restroom", label: "1st floor, main hallway", floor: 1 },
      { id: "jefferson-arestroom", type: "accessible-restroom", label: "1st floor, main hallway", floor: 1 }
    ],
    hours: { opens: "07:00", closes: "21:00" },
    nearbyParkingIds: ["lot-d"],
    landmarkNote: "On the North Academic Quad, next to the Brooks Center",
    photoTone: "brick"
  },
  {
    id: "student-union",
    name: "Hendrix Student Center",
    abbreviation: "HSC",
    aliases: ["hendrix", "hendrix student center", "student union", "student center", "the union", "hsc", "union", "bookstore", "career services"],
    category: "student-life",
    description: "The social hub of campus — dining, the bookstore, career services, and student organization space.",
    address: "1 Beacon Way",
    point: { x: 500, y: 445 },
    floors: 2,
    primaryEntranceId: "student-union-north",
    accessibleEntranceId: "student-union-east",
    entrances: [
      { id: "student-union-north", label: "North Entrance", side: "north", accessible: false, automaticDoor: true, point: { x: 500, y: 420 } },
      { id: "student-union-east", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 525, y: 445 }, notes: "Automatic doors, step-free" }
    ],
    rooms: [{ id: "union-ballroom", number: "Ballroom", floor: 2 }],
    departments: [
      { id: "dept-student-affairs", name: "Student Affairs", floor: 1 },
      { id: "dept-career-services", name: "Career Services", floor: 1 }
    ],
    amenities: [
      { id: "union-coffee", type: "coffee", label: "Beacon Grounds Coffee, 1st floor", floor: 1 },
      { id: "union-dining", type: "dining", label: "Union Food Court, 1st floor", floor: 1 },
      { id: "union-study", type: "study-space", label: "2nd floor lounge", floor: 2 },
      { id: "union-elevator", type: "elevator", label: "Elevator near the east entrance", floor: 1 },
      { id: "union-restroom", type: "restroom", label: "1st floor, near the food court", floor: 1 },
      { id: "union-arestroom", type: "accessible-restroom", label: "1st floor, near the east entrance", floor: 1 }
    ],
    hours: { opens: "06:00", closes: "23:59", note: "Open until midnight most nights" },
    nearbyParkingIds: ["lot-e", "lot-a"],
    landmarkNote: "South side of the Green, the building with the big glass atrium",
    photoTone: "glass"
  },
  {
    id: "library",
    name: "Cooper Library",
    abbreviation: "CL",
    aliases: ["cooper library", "cooper", "library", "hamilton library", "cl", "the library", "testing center", "it help desk"],
    category: "library",
    description: "The university library, quiet study floors, group study rooms, and the IT Help Desk.",
    address: "88 Hamilton Court",
    point: { x: 415, y: 305 },
    floors: 4,
    primaryEntranceId: "library-main",
    accessibleEntranceId: "library-accessible",
    entrances: [
      { id: "library-main", label: "Main Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 415, y: 280 } },
      { id: "library-accessible", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 440, y: 305 }, notes: "Ramp and automatic doors" }
    ],
    rooms: [{ id: "library-quiet-floor", number: "3rd Floor", name: "Quiet Study Floor", floor: 3 }],
    departments: [{ id: "dept-library-reference", name: "Reference & Research Help", floor: 1 }],
    amenities: [
      { id: "library-study-1", type: "study-space", label: "Group study rooms, 2nd floor", floor: 2 },
      { id: "library-study-2", type: "study-space", label: "Quiet study, 3rd and 4th floors", floor: 3 },
      { id: "library-printing", type: "printing", label: "Print/copy station, 1st floor", floor: 1 },
      { id: "library-restroom", type: "restroom", label: "1st floor, near the main entrance", floor: 1 },
      { id: "library-arestroom", type: "accessible-restroom", label: "1st floor, near the east entrance", floor: 1 }
    ],
    hours: { opens: "07:00", closes: "01:00", note: "Extended hours during finals week" },
    nearbyParkingIds: ["lot-e"],
    landmarkNote: "The tall building with the glass reading room, just west of Bowman Field",
    photoTone: "stone"
  },
  {
    id: "founders",
    name: "Sikes Hall",
    abbreviation: "SH",
    aliases: ["sikes hall", "sikes", "founders", "administration building", "sh", "financial aid", "registrar", "advising"],
    category: "administration",
    description: "Financial Aid, the Registrar, and Academic Advising all under one roof.",
    address: "300 Founders Circle",
    point: { x: 490, y: 545 },
    floors: 2,
    primaryEntranceId: "founders-south",
    accessibleEntranceId: "founders-south",
    entrances: [
      { id: "founders-north", label: "North Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 490, y: 520 } },
      { id: "founders-south", label: "South Entrance", side: "south", accessible: true, automaticDoor: true, point: { x: 490, y: 570 }, notes: "Ramp and elevator lobby" }
    ],
    rooms: [
      { id: "founders-220", number: "220", name: "Financial Aid Office", floor: 2 },
      { id: "founders-110", number: "110", name: "Registrar", floor: 1 },
      { id: "founders-215", number: "215", name: "Academic Advising", floor: 2 }
    ],
    departments: [
      { id: "dept-financial-aid", name: "Financial Aid", floor: 2, roomId: "founders-220", hoursNote: "Open until 5:00 PM" },
      { id: "dept-registrar", name: "Registrar", floor: 1, roomId: "founders-110", hoursNote: "Open until 5:00 PM" },
      { id: "dept-advising", name: "Academic Advising", floor: 2, roomId: "founders-215", appointmentRequired: true, hoursNote: "Open until 5:00 PM" }
    ],
    amenities: [
      { id: "founders-elevator", type: "elevator", label: "Elevator lobby, inside the south entrance", floor: 1 },
      { id: "founders-restroom", type: "restroom", label: "1st floor, near the north entrance", floor: 1 },
      { id: "founders-arestroom", type: "accessible-restroom", label: "2nd floor, near the elevator", floor: 2 }
    ],
    hours: { opens: "08:00", closes: "17:00" },
    nearbyParkingIds: ["lot-a", "lot-d"],
    landmarkNote: "The stone building south of Bowman Field, past Hendrix Student Center",
    photoTone: "stone"
  },
  {
    id: "admissions",
    name: "Old Main",
    abbreviation: "OM",
    aliases: ["old main", "admissions", "welcome center", "om", "admissions office", "campus tours", "visitor check-in"],
    category: "administration",
    description: "Beacon University's historic clock-tower building — the first stop for prospective students and campus visitors, where tours start.",
    address: "20 Welcome Plaza",
    point: { x: 330, y: 605 },
    floors: 1,
    primaryEntranceId: "admissions-east",
    accessibleEntranceId: "admissions-east",
    entrances: [
      { id: "admissions-east", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 355, y: 605 }, notes: "Visitor check-in directly inside" },
      { id: "admissions-west", label: "West Entrance", side: "west", accessible: false, automaticDoor: false, point: { x: 305, y: 605 } }
    ],
    rooms: [],
    departments: [{ id: "dept-admissions", name: "Undergraduate Admissions", floor: 1, hoursNote: "Open until 5:00 PM" }],
    amenities: [
      { id: "admissions-coffee", type: "coffee", label: "Visitor coffee station, lobby", floor: 1 },
      { id: "admissions-restroom", type: "restroom", label: "1st floor lobby", floor: 1 },
      { id: "admissions-arestroom", type: "accessible-restroom", label: "1st floor lobby", floor: 1 }
    ],
    hours: { opens: "08:30", closes: "17:00" },
    nearbyParkingIds: ["lot-a"],
    landmarkNote: "The clock-tower building near the south campus entrance, next to Visitor Lot A",
    photoTone: "stone"
  },
  {
    id: "veterans",
    name: "Military Heritage House",
    abbreviation: "MHH",
    aliases: ["military heritage house", "veterans", "veterans resource center", "mhh", "veterans office", "military services"],
    category: "student-life",
    description: "Support, community space, and benefits guidance for veteran and military-connected students.",
    address: "45 Union Walk",
    point: { x: 610, y: 440 },
    floors: 1,
    primaryEntranceId: "veterans-main",
    accessibleEntranceId: "veterans-main",
    entrances: [{ id: "veterans-main", label: "Main Entrance", side: "north", accessible: true, automaticDoor: true, point: { x: 610, y: 415 } }],
    rooms: [],
    departments: [{ id: "dept-veterans", name: "Veterans & Military Services", floor: 1 }],
    amenities: [
      { id: "veterans-study", type: "study-space", label: "Lounge and study area", floor: 1 },
      { id: "veterans-restroom", type: "restroom", label: "1st floor", floor: 1 }
    ],
    hours: { opens: "08:00", closes: "18:00" },
    nearbyParkingIds: ["lot-e"],
    landmarkNote: "East of Hendrix Student Center, along Union Walk",
    photoTone: "brick"
  },
  {
    id: "health-center",
    name: "Redfern Health Center",
    abbreviation: "RHC",
    aliases: ["redfern", "redfern health center", "health center", "campus health", "clinic", "rhc", "counseling"],
    category: "health-safety",
    description: "Student medical care, counseling services, and wellness resources.",
    address: "60 Wellness Drive",
    point: { x: 760, y: 395 },
    floors: 1,
    primaryEntranceId: "health-main",
    accessibleEntranceId: "health-main",
    entrances: [{ id: "health-main", label: "Main Entrance", side: "north", accessible: true, automaticDoor: true, point: { x: 760, y: 370 } }],
    rooms: [],
    departments: [
      { id: "dept-health", name: "Student Health Services", floor: 1, hoursNote: "Urgent care until 8 PM weekdays" },
      { id: "dept-counseling", name: "Counseling Services", floor: 1, appointmentRequired: true }
    ],
    amenities: [
      { id: "health-restroom", type: "restroom", label: "1st floor", floor: 1 },
      { id: "health-arestroom", type: "accessible-restroom", label: "1st floor", floor: 1 }
    ],
    hours: { opens: "08:00", closes: "18:00", note: "Urgent care until 8 PM weekdays" },
    nearbyParkingIds: ["lot-e"],
    landmarkNote: "East side of campus, past Military Heritage House",
    photoTone: "glass"
  },
  {
    id: "public-safety",
    name: "Edgar Public Safety Building",
    abbreviation: "PS",
    aliases: ["campus police", "public safety", "police", "security", "emergency"],
    category: "health-safety",
    description: "Campus police, emergency management, and lost & found.",
    address: "5 Safety Way",
    point: { x: 830, y: 350 },
    floors: 1,
    primaryEntranceId: "safety-main",
    accessibleEntranceId: "safety-main",
    entrances: [{ id: "safety-main", label: "Main Entrance", side: "north", accessible: true, automaticDoor: true, point: { x: 830, y: 325 } }],
    rooms: [],
    departments: [{ id: "dept-safety", name: "Campus Police & Public Safety", floor: 1, hoursNote: "Open 24 hours" }],
    amenities: [{ id: "safety-restroom", type: "restroom", label: "1st floor", floor: 1 }],
    hours: { opens: "00:00", closes: "23:59", note: "Open 24 hours, every day" },
    nearbyParkingIds: ["lot-e"],
    landmarkNote: "East edge of campus, near the Health Center",
    photoTone: "stone"
  },
  {
    id: "oak",
    name: "Johnstone Hall",
    abbreviation: "JH",
    aliases: ["johnstone hall", "johnstone", "oak hall", "jh", "housing", "residence life"],
    category: "residence",
    description: "First-year residence hall on the west side of campus, near the dining hall.",
    address: "10 Oak Row",
    point: { x: 190, y: 240 },
    floors: 4,
    primaryEntranceId: "oak-main",
    accessibleEntranceId: "oak-accessible",
    entrances: [
      { id: "oak-main", label: "Main Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 190, y: 215 } },
      { id: "oak-accessible", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 215, y: 240 } }
    ],
    rooms: [],
    departments: [{ id: "dept-housing", name: "Residence Life Office", floor: 1 }],
    amenities: [
      { id: "oak-elevator", type: "elevator", label: "Elevator near the east entrance", floor: 1 },
      { id: "oak-study", type: "study-space", label: "Common room, 1st floor", floor: 1 },
      { id: "oak-restroom", type: "restroom", label: "Each floor, community bathroom", floor: 1 }
    ],
    hours: { opens: "00:00", closes: "23:59", note: "Resident card access required after 10 PM" },
    nearbyParkingIds: ["lot-c"],
    landmarkNote: "West side of campus, on Dorm Row",
    photoTone: "brick"
  },
  {
    id: "pine",
    name: "Manning Hall",
    abbreviation: "MH",
    aliases: ["manning hall", "manning", "pine hall", "mh", "pine dorm"],
    category: "residence",
    description: "Upper-class residence hall on the west side of campus.",
    address: "12 Oak Row",
    point: { x: 190, y: 400 },
    floors: 4,
    primaryEntranceId: "pine-main",
    accessibleEntranceId: "pine-accessible",
    entrances: [
      { id: "pine-main", label: "Main Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 190, y: 375 } },
      { id: "pine-accessible", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 215, y: 400 } }
    ],
    rooms: [],
    departments: [],
    amenities: [
      { id: "pine-elevator", type: "elevator", label: "Elevator near the east entrance", floor: 1 },
      { id: "pine-restroom", type: "restroom", label: "Each floor, community bathroom", floor: 1 }
    ],
    hours: { opens: "00:00", closes: "23:59", note: "Resident card access required after 10 PM" },
    nearbyParkingIds: ["lot-c"],
    landmarkNote: "West side of campus, on Dorm Row",
    photoTone: "brick"
  },
  {
    id: "dining-commons",
    name: "Schilletter Dining Hall",
    abbreviation: "SDH",
    aliases: ["schilletter", "schilletter dining hall", "dining hall", "dining commons", "cafeteria", "food court", "sdh", "dining"],
    category: "dining",
    description: "The main all-you-care-to-eat dining hall, open for breakfast, lunch, and dinner.",
    address: "8 Commons Lane",
    point: { x: 270, y: 310 },
    floors: 1,
    primaryEntranceId: "dining-main",
    accessibleEntranceId: "dining-main",
    entrances: [{ id: "dining-main", label: "Main Entrance", side: "north", accessible: true, automaticDoor: true, point: { x: 270, y: 285 } }],
    rooms: [],
    departments: [],
    amenities: [
      { id: "dining-restroom", type: "restroom", label: "1st floor", floor: 1 },
      { id: "dining-arestroom", type: "accessible-restroom", label: "1st floor", floor: 1 }
    ],
    hours: { opens: "07:00", closes: "21:00", note: "Breakfast, lunch, and dinner service" },
    nearbyParkingIds: ["lot-c"],
    landmarkNote: "Between the residence halls and Bowman Field",
    photoTone: "glass"
  },
  {
    id: "athletics-center",
    name: "Littlejohn Coliseum",
    abbreviation: "LJC",
    aliases: ["littlejohn", "littlejohn coliseum", "athletics center", "gym", "basketball arena", "ljc", "rec center", "fitness center", "fike"],
    category: "athletics",
    description: "The basketball arena, recreation and fitness center, and athletics offices.",
    address: "1 Champion Way",
    point: { x: 760, y: 590 },
    floors: 2,
    primaryEntranceId: "athletics-main",
    accessibleEntranceId: "athletics-main",
    entrances: [{ id: "athletics-main", label: "Main Entrance", side: "north", accessible: true, automaticDoor: true, point: { x: 760, y: 565 } }],
    rooms: [],
    departments: [],
    amenities: [
      { id: "athletics-restroom", type: "restroom", label: "1st floor concourse", floor: 1 },
      { id: "athletics-arestroom", type: "accessible-restroom", label: "1st floor concourse", floor: 1 }
    ],
    hours: { opens: "06:00", closes: "23:00" },
    nearbyParkingIds: ["lot-b", "lot-d"],
    landmarkNote: "Southeast corner of campus, next to Memorial Stadium",
    photoTone: "glass"
  },
  {
    id: "stadium",
    name: "Memorial Stadium",
    abbreviation: "STAD",
    aliases: ["memorial stadium", "death valley", "stadium", "football stadium", "game day"],
    category: "athletics",
    description: "Known to students as \"Death Valley\" — home of Beacon University football and large campus ceremonies like Commencement.",
    address: "2 Champion Way",
    point: { x: 860, y: 650 },
    floors: 1,
    primaryEntranceId: "stadium-main",
    accessibleEntranceId: "stadium-main",
    entrances: [{ id: "stadium-main", label: "Main Gate", side: "north", accessible: true, automaticDoor: false, point: { x: 860, y: 625 } }],
    rooms: [],
    departments: [],
    amenities: [
      { id: "stadium-restroom", type: "restroom", label: "Concourse level", floor: 1 },
      { id: "stadium-arestroom", type: "accessible-restroom", label: "Concourse level", floor: 1 }
    ],
    hours: { opens: "00:00", closes: "23:59", note: "Open on event days only" },
    nearbyParkingIds: ["lot-b"],
    landmarkNote: "Far southeast corner of campus, past Littlejohn Coliseum",
    photoTone: "stone"
  },
  {
    id: "fine-arts",
    name: "Brooks Center for the Performing Arts",
    abbreviation: "BC",
    aliases: ["brooks center", "brooks", "fine arts center", "fine arts", "theatre", "art building", "bc", "history 210"],
    category: "arts",
    description: "Theatre, galleries, music rehearsal space, and the Fine & Performing Arts Department.",
    address: "75 Gallery Row",
    point: { x: 700, y: 190 },
    floors: 3,
    primaryEntranceId: "fine-arts-main",
    accessibleEntranceId: "fine-arts-accessible",
    entrances: [
      { id: "fine-arts-main", label: "Main Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 700, y: 165 } },
      { id: "fine-arts-accessible", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 725, y: 190 } }
    ],
    rooms: [{ id: "fine-arts-302", number: "302", name: "History 210 Lecture Room", floor: 3 }],
    departments: [{ id: "dept-fine-arts", name: "Fine & Performing Arts Department", floor: 2 }],
    amenities: [
      { id: "fine-arts-elevator", type: "elevator", label: "Elevator, main lobby", floor: 1 },
      { id: "fine-arts-restroom", type: "restroom", label: "1st floor lobby", floor: 1 },
      { id: "fine-arts-arestroom", type: "accessible-restroom", label: "1st floor lobby", floor: 1 }
    ],
    hours: { opens: "08:00", closes: "22:00" },
    nearbyParkingIds: ["lot-d"],
    landmarkNote: "North Academic Quad, next to Strode Tower",
    photoTone: "stone"
  }
];

// ---------------------------------------------------------------------------
// Parking
// ---------------------------------------------------------------------------

const parkingLots: ParkingLot[] = [
  {
    id: "lot-a",
    name: "Visitor Lot A",
    point: { x: 380, y: 650 },
    eligibility: ["visitor"],
    permitRequired: false,
    freeMinutes: 120,
    accessibleSpaces: 6,
    notes: "No permit required for the first 2 hours. Accessible spaces available near the east exit.",
    walkTimeMinutesTo: { admissions: 4, founders: 6, "student-union": 8 }
  },
  {
    id: "lot-b",
    name: "Visitor Lot B",
    point: { x: 900, y: 680 },
    eligibility: ["visitor"],
    permitRequired: false,
    freeMinutes: 120,
    accessibleSpaces: 4,
    notes: "Closest visitor lot to Littlejohn Coliseum and Memorial Stadium.",
    walkTimeMinutesTo: { "athletics-center": 3, stadium: 6 },
    closed: true,
    closureReason: "Closed today for event setup"
  },
  {
    id: "lot-c",
    name: "Student Lot C",
    point: { x: 100, y: 300 },
    eligibility: ["student"],
    permitRequired: true,
    accessibleSpaces: 5,
    notes: "Requires a valid Beacon University student parking permit.",
    walkTimeMinutesTo: { oak: 2, pine: 3, "dining-commons": 2, richardson: 6 }
  },
  {
    id: "lot-d",
    name: "Faculty & Staff Lot D",
    point: { x: 600, y: 600 },
    eligibility: ["faculty", "visitor"],
    permitRequired: true,
    accessibleSpaces: 6,
    notes: "Faculty/staff permit required Monday–Friday, 7 AM–6 PM. Open to all after 6 PM and on weekends.",
    walkTimeMinutesTo: { founders: 3, richardson: 5, jefferson: 6, "fine-arts": 5, "athletics-center": 6 }
  },
  {
    id: "lot-e",
    name: "Visitor & Event Lot E",
    point: { x: 650, y: 480 },
    eligibility: ["visitor", "student"],
    permitRequired: false,
    freeMinutes: 60,
    accessibleSpaces: 5,
    notes: "Best option near Hendrix Student Center, Cooper Library, and Military Heritage House.",
    walkTimeMinutesTo: { "student-union": 3, library: 4, veterans: 2, "health-center": 4 }
  }
];

// ---------------------------------------------------------------------------
// Walking graph — landmark nodes + building/parking nodes
// ---------------------------------------------------------------------------

const landmarkNodes: WalkingPathNode[] = [
  { id: "green", label: "Bowman Field", point: { x: 500, y: 360 }, isLandmark: true },
  { id: "library-plaza", label: "Cooper Library Plaza", point: { x: 430, y: 300 }, isLandmark: true },
  { id: "union-plaza", label: "Hendrix Plaza", point: { x: 500, y: 440 }, isLandmark: true },
  { id: "dorm-row", label: "Dorm Row Walk", point: { x: 230, y: 320 }, isLandmark: true },
  { id: "admin-walk", label: "Administration Walk", point: { x: 480, y: 580 }, isLandmark: true },
  { id: "south-gate", label: "South Campus Gate", point: { x: 360, y: 615 }, isLandmark: true },
  { id: "east-walk", label: "East Campus Walk", point: { x: 700, y: 380 }, isLandmark: true },
  { id: "athletics-walk", label: "Athletics Way", point: { x: 760, y: 560 }, isLandmark: true },
  { id: "north-quad", label: "North Academic Quad", point: { x: 560, y: 230 }, isLandmark: true },
  { id: "garden-walk", label: "Reflection Pond", point: { x: 420, y: 400 }, isLandmark: true }
];

const buildingNodes: WalkingPathNode[] = buildings.map((b) => ({
  id: b.id,
  label: b.name,
  point: b.point,
  isLandmark: false
}));

const parkingNodes: WalkingPathNode[] = parkingLots.map((p) => ({
  id: p.id,
  label: p.name,
  point: p.point,
  isLandmark: false
}));

const pathNodes: WalkingPathNode[] = [...landmarkNodes, ...buildingNodes, ...parkingNodes];

const pathEdges: WalkingPathEdge[] = [
  { from: "green", to: "library-plaza", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "green", to: "union-plaza", minutes: 2, accessible: true, outdoor: true, crowdLevel: 4, noiseLevel: 4 },
  { from: "green", to: "garden-walk", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true },
  { from: "garden-walk", to: "union-plaza", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true },
  { from: "green", to: "north-quad", minutes: 3, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 2 },
  { from: "green", to: "admin-walk", minutes: 4, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 },
  { from: "green", to: "dorm-row", minutes: 4, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "library-plaza", to: "richardson", minutes: 5, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 1 },
  { from: "library-plaza", to: "library", minutes: 1, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true },
  { from: "library-plaza", to: "north-quad", minutes: 2, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "north-quad", to: "jefferson", minutes: 2, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3 },
  { from: "north-quad", to: "fine-arts", minutes: 4, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 },
  { from: "north-quad", to: "fine-arts", minutes: 2, accessible: false, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "union-plaza", to: "student-union", minutes: 1, accessible: true, outdoor: true, crowdLevel: 4, noiseLevel: 4 },
  { from: "union-plaza", to: "veterans", minutes: 2, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "union-plaza", to: "east-walk", minutes: 3, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3 },
  { from: "union-plaza", to: "lot-e", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "east-walk", to: "health-center", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 },
  { from: "east-walk", to: "public-safety", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 },
  { from: "east-walk", to: "athletics-walk", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "admin-walk", to: "founders", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true },
  { from: "admin-walk", to: "south-gate", minutes: 3, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true },
  { from: "admin-walk", to: "lot-d", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 },
  { from: "south-gate", to: "admissions", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "south-gate", to: "lot-a", minutes: 1, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 },
  { from: "dorm-row", to: "oak", minutes: 1, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "dorm-row", to: "pine", minutes: 2, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2 },
  { from: "dorm-row", to: "dining-commons", minutes: 2, accessible: true, outdoor: true, crowdLevel: 4, noiseLevel: 3 },
  { from: "dorm-row", to: "lot-c", minutes: 1, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 },
  { from: "athletics-walk", to: "athletics-center", minutes: 1, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3 },
  { from: "athletics-walk", to: "stadium", minutes: 3, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3 },
  { from: "athletics-walk", to: "lot-b", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1 }
];

// ---------------------------------------------------------------------------
// Alerts, construction, events
// ---------------------------------------------------------------------------

const alerts: CampusAlert[] = [
  {
    id: "alert-richardson-west",
    severity: "warning",
    title: "Long Hall — West Entrance Closed",
    message: "The west entrance to Long Hall is temporarily closed for construction. Use the south entrance instead.",
    affectedBuildingIds: ["richardson"],
    affectedEntranceIds: ["richardson-west"],
    substituteEntranceId: "richardson-south",
    addedWalkMinutes: 2,
    startsAt: "2026-08-10T07:00:00-04:00",
    endsAt: "2026-08-29T18:00:00-04:00",
    active: true
  },
  {
    id: "alert-library-elevator",
    severity: "advisory",
    title: "Cooper Library — Elevator Temporarily Unavailable",
    message: "The elevator near the east entrance of Cooper Library is temporarily out of service. The east entrance ramp is still accessible for step-free entry to the 1st floor.",
    affectedBuildingIds: ["library"],
    startsAt: "2026-08-13T08:00:00-04:00",
    active: true
  },
  {
    id: "alert-lot-b-closed",
    severity: "warning",
    title: "Visitor Lot B Closed Today",
    message: "Visitor Lot B is closed today for event setup near Littlejohn Coliseum. Faculty & Staff Lot D is open to visitors after 6 PM and on weekends.",
    affectedBuildingIds: ["athletics-center", "stadium"],
    affectedParkingIds: ["lot-b"],
    startsAt: "2026-08-15T00:00:00-04:00",
    endsAt: "2026-08-15T23:59:00-04:00",
    active: true
  },
  {
    id: "alert-green-walkway",
    severity: "advisory",
    title: "Bowman Field — Walkway Detour",
    message: "The northeast walkway across Bowman Field is temporarily closed for irrigation work. Please use the paved path along the field's south edge.",
    affectedBuildingIds: [],
    startsAt: "2026-08-12T07:00:00-04:00",
    active: true
  },
  {
    id: "alert-stadium-traffic",
    severity: "info",
    title: "Event Traffic Near Memorial Stadium",
    message: "Increased pedestrian and vehicle traffic is expected near Memorial Stadium this evening ahead of the Homecoming basketball game.",
    affectedBuildingIds: ["stadium", "athletics-center"],
    startsAt: "2026-08-15T15:00:00-04:00",
    endsAt: "2026-08-15T22:00:00-04:00",
    active: true
  }
];

const construction: ConstructionNotice[] = [
  {
    id: "construction-richardson-west",
    title: "Long Hall — West Entrance Sidewalk Replacement",
    description: "The sidewalk and steps at the west entrance are being replaced. The entrance is closed to foot traffic until work is complete.",
    affectedBuildingIds: ["richardson"],
    active: true,
    startsAt: "2026-08-10",
    endsAt: "2026-08-29"
  },
  {
    id: "construction-founders-lobby",
    title: "Sikes Hall — Lobby Renovation",
    description: "Minor lobby renovation work. All offices remain open and accessible through both entrances.",
    affectedBuildingIds: ["founders"],
    active: true,
    startsAt: "2026-08-01",
    endsAt: "2026-09-15"
  }
];

const events: CampusEvent[] = [
  {
    id: "evt-orientation",
    name: "New Student Orientation",
    date: "2026-08-20",
    startTime: "09:00",
    endTime: "16:00",
    venueBuildingId: "student-union",
    description: "A full day of welcome sessions, campus tours, and check-in for incoming first-year students.",
    recommendedParkingId: "lot-a",
    recommendedEntranceId: "student-union-east",
    arrivalRecommendation: "Arrive by 8:45 AM for check-in. Parking in Lot A is complimentary for orientation."
  },
  {
    id: "evt-campus-tour",
    name: "Daily Campus Tour",
    date: "2026-08-15",
    startTime: "10:00",
    endTime: "11:15",
    venueBuildingId: "admissions",
    description: "A guided walking tour of academic buildings, residence halls, dining, and athletics facilities.",
    recommendedParkingId: "lot-a",
    recommendedEntranceId: "admissions-east",
    arrivalRecommendation: "Check in at Old Main 10 minutes before tour start."
  },
  {
    id: "evt-basketball-homecoming",
    name: "Homecoming Basketball Game",
    date: "2026-08-15",
    startTime: "19:00",
    venueBuildingId: "athletics-center",
    description: "Beacon University Basketball hosts its Homecoming game in Littlejohn Coliseum.",
    recommendedParkingId: "lot-d",
    recommendedEntranceId: "athletics-main",
    accessibilityNote: "Accessible seating available near both arena entrances — ask any usher for directions.",
    arrivalRecommendation: "Visitor Lot B is closed today for setup — use Faculty & Staff Lot D instead, open to visitors after 6 PM."
  },
  {
    id: "evt-graduation",
    name: "Commencement Ceremony",
    date: "2026-05-16",
    startTime: "10:00",
    endTime: "12:30",
    venueBuildingId: "stadium",
    description: "University-wide Commencement ceremony for graduating students and their families.",
    recommendedParkingId: "lot-b",
    recommendedEntranceId: "stadium-main",
    accessibilityNote: "Reserved accessible seating and drop-off is available at the Memorial Stadium Main Gate.",
    arrivalRecommendation: "Arrive at least 60 minutes early — Lots B and D both fill quickly on Commencement morning."
  },
  {
    id: "evt-career-fair",
    name: "Fall Career Fair",
    date: "2026-09-24",
    startTime: "11:00",
    endTime: "15:00",
    venueBuildingId: "student-union",
    description: "Meet employers from across the region in the Hendrix Ballroom.",
    recommendedParkingId: "lot-e",
    recommendedEntranceId: "student-union-east",
    arrivalRecommendation: "The Ballroom is on the 2nd floor — the elevator near the east entrance is the quickest way up."
  },
  {
    id: "evt-family-weekend",
    name: "Family Weekend",
    date: "2026-10-03",
    startTime: "09:00",
    endTime: "20:00",
    venueBuildingId: "student-union",
    description: "A weekend of campus activities, athletics, and dining for families visiting Beacon University.",
    recommendedParkingId: "lot-a",
    recommendedEntranceId: "student-union-east",
    arrivalRecommendation: "Hendrix Student Center is home base for the weekend — pick up your schedule at the welcome table inside the east entrance."
  },
  {
    id: "evt-open-house",
    name: "Prospective Student Open House",
    date: "2026-11-14",
    startTime: "09:30",
    endTime: "13:00",
    venueBuildingId: "admissions",
    description: "Information sessions, financial aid guidance, and campus tours for prospective students and families.",
    recommendedParkingId: "lot-a",
    recommendedEntranceId: "admissions-east",
    arrivalRecommendation: "Check in at Old Main first — financial aid drop-in sessions run all morning at Sikes Hall."
  },
  {
    id: "evt-theatre",
    name: "Fall Theatre Performance",
    date: "2026-11-20",
    startTime: "19:30",
    venueBuildingId: "fine-arts",
    description: "The Beacon University Theatre Department presents its fall mainstage production.",
    recommendedParkingId: "lot-d",
    recommendedEntranceId: "fine-arts-accessible",
    accessibilityNote: "Accessible seating is available — request it when you check in at the box office.",
    arrivalRecommendation: "Doors open 30 minutes before curtain. The box office is just inside the east entrance."
  }
];

// ---------------------------------------------------------------------------
// Services, schedule, tour, orientation, quick questions
// ---------------------------------------------------------------------------

const services: CampusService[] = [
  { id: "svc-admissions", name: "Admissions", category: "admissions", buildingId: "admissions", departmentId: "dept-admissions", description: "Undergraduate admissions counseling and application support." },
  { id: "svc-financial-aid", name: "Financial Aid", category: "financial-aid", buildingId: "founders", departmentId: "dept-financial-aid", description: "Grants, loans, scholarships, and financial aid appeals." },
  { id: "svc-registrar", name: "Registrar", category: "registrar", buildingId: "founders", departmentId: "dept-registrar", description: "Transcripts, enrollment verification, and registration holds." },
  { id: "svc-advising", name: "Academic Advising", category: "advising", buildingId: "founders", departmentId: "dept-advising", description: "Course planning and degree progress advising.", appointmentRequired: true },
  { id: "svc-career-services", name: "Career Services", category: "career-services", buildingId: "student-union", departmentId: "dept-career-services", description: "Resume help, interview prep, and employer connections." },
  { id: "svc-veterans", name: "Veterans Services", category: "veterans", buildingId: "veterans", departmentId: "dept-veterans", description: "Benefits guidance and community space for veteran and military-connected students." },
  { id: "svc-student-affairs", name: "Student Affairs", category: "student-affairs", buildingId: "student-union", departmentId: "dept-student-affairs", description: "Student organizations, conduct, and campus life support." },
  { id: "svc-counseling", name: "Counseling Services", category: "counseling", buildingId: "health-center", departmentId: "dept-counseling", description: "Confidential mental health counseling for students.", appointmentRequired: true },
  { id: "svc-health", name: "Student Health Services", category: "health", buildingId: "health-center", departmentId: "dept-health", description: "Primary care, urgent care, and immunizations." },
  { id: "svc-police", name: "Campus Police", category: "police", buildingId: "public-safety", departmentId: "dept-safety", description: "Campus safety, escorts, and emergency response." },
  { id: "svc-accessibility", name: "Accessibility Services", category: "accessibility", buildingId: "founders", description: "Accommodations, adaptive technology, and accessible routing support." },
  { id: "svc-it-help-desk", name: "IT Help Desk", category: "it-help-desk", buildingId: "library", description: "Tech support, laptop loaners, and Wi-Fi troubleshooting." },
  { id: "svc-bookstore", name: "Beacon Bookstore", category: "bookstore", buildingId: "student-union", description: "Textbooks, course materials, and Beacon spirit wear." },
  { id: "svc-dining", name: "Dining Services", category: "dining", buildingId: "dining-commons", description: "Meal plans, dining hours, and menus." },
  { id: "svc-housing", name: "Housing & Residence Life", category: "housing", buildingId: "oak", departmentId: "dept-housing", description: "Room assignments, move-in, and residence hall support." },
  { id: "svc-testing-center", name: "Testing Center", category: "testing-center", buildingId: "library", description: "Proctored exams and testing accommodations." },
  { id: "svc-library", name: "Library Services", category: "library", buildingId: "library", departmentId: "dept-library-reference", description: "Research help, course reserves, and study space reservations." },
  { id: "svc-tutoring", name: "Science Tutoring Center", category: "tutoring", buildingId: "richardson", description: "Free drop-in tutoring for BIO, CHEM, and PHYS courses." }
];

const jordanSchedule: ClassScheduleEntry[] = [
  { id: "class-english", time: "09:00", course: "ENG 101", courseName: "English 101", buildingId: "jefferson", roomNumber: "115" },
  { id: "class-bio", time: "10:30", course: "BIO 101", courseName: "Introduction to Biology", buildingId: "richardson", roomNumber: "204" },
  { id: "class-history", time: "13:00", course: "HIST 210", courseName: "History 210", buildingId: "fine-arts", roomNumber: "302" }
];

const tourStops: TourStop[] = [
  { id: "tour-admissions", order: 1, buildingId: "admissions", point: { x: 330, y: 605 }, title: "Old Main", description: "Your tour starts here — pick up a campus map and meet your tour guide." },
  { id: "tour-green", order: 2, point: { x: 500, y: 360 }, title: "Bowman Field", description: "The historic heart of campus. Most academic buildings and Hendrix Student Center open onto the field." },
  { id: "tour-library", order: 3, buildingId: "library", point: { x: 415, y: 305 }, title: "Cooper Library", description: "Four floors of study space, research help, and the campus's best reading room view." },
  { id: "tour-union", order: 4, buildingId: "student-union", point: { x: 500, y: 445 }, title: "Hendrix Student Center", description: "Dining, the bookstore, and the center of student life." },
  { id: "tour-oak", order: 5, buildingId: "oak", point: { x: 190, y: 240 }, title: "Johnstone Hall", description: "A sample first-year residence hall — tour a model room if one is available." },
  { id: "tour-dining", order: 6, buildingId: "dining-commons", point: { x: 270, y: 310 }, title: "Schilletter Dining Hall", description: "The main dining hall, with options for every diet and schedule." },
  { id: "tour-richardson", order: 7, buildingId: "richardson", point: { x: 430, y: 260 }, title: "Long Hall", description: "Labs, lecture halls, and the Science Tutoring Center." },
  { id: "tour-athletics", order: 8, buildingId: "athletics-center", point: { x: 760, y: 590 }, title: "Littlejohn Coliseum", description: "The basketball arena and recreation center — end your tour here with a look at Beacon Athletics." }
];

const orientationItems: OrientationItem[] = [
  { id: "orient-session", order: 1, icon: "schedule", title: "Your First Orientation Session", time: "09:00", buildingId: "student-union", description: "Welcome to Beacon University. Your first orientation session begins at 9:00 AM in Hendrix Student Center." },
  { id: "orient-parking", order: 2, icon: "parking", title: "Where to Park", description: "Visitor parking is available in Lot A. From Lot A, Hendrix Student Center is about an 8 minute walk." },
  { id: "orient-checkin", order: 3, icon: "check-in", title: "Check-In", buildingId: "student-union", description: "Check-in is through the east entrance of Hendrix Student Center — look for the Orientation table just inside." },
  { id: "orient-id", order: 4, icon: "id", title: "Student ID", buildingId: "student-union", description: "Get your Beacon University ID card at the Student Affairs desk, 1st floor." },
  { id: "orient-financial-aid", order: 5, icon: "financial-aid", title: "Financial Aid", buildingId: "founders", description: "Sikes Hall, 2nd floor, Room 220. Bring a photo ID." },
  { id: "orient-residence", order: 6, icon: "residence", title: "Your Residence Hall", buildingId: "oak", description: "Move into Johnstone Hall any time after 9:00 AM. Volunteers at the main entrance can help you carry belongings." },
  { id: "orient-dining", order: 7, icon: "dining", title: "Dining", buildingId: "dining-commons", description: "Schilletter Dining Hall is open for breakfast, lunch, and dinner. Your student ID doubles as your meal card." },
  { id: "orient-sessions", order: 8, icon: "sessions", title: "Afternoon Advising Sessions", time: "13:30", buildingId: "jefferson", description: "Academic advising sessions continue at 1:30 PM in Strode Tower." }
];

const quickQuestions: QuickQuestion[] = [
  { id: "qq-next-class", question: "Where is my next class?", answer: "Your next class is BIO 101 at 10:30 AM in Long Hall, Room 204 — about an 8 minute walk from here." },
  { id: "qq-parking", question: "Where can I park?", answer: "Visitor parking is available in Lot A near Old Main, with no permit required for the first 2 hours." },
  { id: "qq-restroom", question: "Where is the nearest restroom?", answer: "Open any building page to see restroom and accessible-restroom locations by floor — most buildings have one near the main entrance." },
  { id: "qq-food", question: "Where can I eat?", answer: "Schilletter Dining Hall is open now, and Hendrix Student Center has a coffee shop and grab-and-go options." },
  { id: "qq-open-now", question: "What is open now?", answer: "Most academic buildings are open until 10 PM. Check a building's detail page for its exact hours." },
  { id: "qq-admissions", question: "How do I get to Admissions?", answer: "Old Main is about a 4 minute walk from Visitor Lot A. Use the east entrance — visitor check-in is directly inside." },
  { id: "qq-events", question: "What events are happening today?", answer: "Check the Events tab for today's campus events, including recommended parking and entrances for each." },
  { id: "qq-late", question: "I'm running late — what's the fastest route to class?", answer: "Start your route now and Beacon will guide you the fastest way, calling out any entrance changes along the way." }
];

// ---------------------------------------------------------------------------
// Alias map — phrases that should resolve to a specific destination
// ---------------------------------------------------------------------------

const aliasMap: Record<string, string> = {
  "bio 101": "room:richardson-204",
  "biology 101": "room:richardson-204",
  "room 204": "room:richardson-204",
  "eng 101": "room:jefferson-115",
  "english 101": "room:jefferson-115",
  "hist 210": "room:fine-arts-302",
  "history 210": "room:fine-arts-302",
  "financial aid": "service:svc-financial-aid",
  "visitor parking": "parking:lot-a",
  "basketball arena": "building:athletics-center",
  "veterans office": "service:svc-veterans",
  "campus police": "service:svc-police",
  "graduation": "event:evt-graduation",
  "commencement": "event:evt-graduation",
  "coffee": "amenity:coffee",
  "closest bathroom": "amenity:restroom",
  "nearest bathroom": "amenity:restroom"
};

export const BEACON_UNIVERSITY: Campus = {
  id: "beacon-university",
  universityName: "Beacon University",
  shortName: "Beacon U",
  tagline: "Know where you are. Know where you're going.",
  center: { x: 500, y: 400 },
  buildings,
  parkingLots,
  pathNodes,
  pathEdges,
  alerts,
  construction,
  events,
  services,
  tourStops,
  orientationItems,
  quickQuestions,
  aliasMap
};

export const JORDAN_SCHEDULE = jordanSchedule;

export const DEMO_PERSONA = {
  name: "Jordan",
  status: "First-year student",
  schedule: jordanSchedule
};

export const START_POINT_OPTIONS: { id: string; label: string }[] = [
  { id: "green", label: "Bowman Field (default)" },
  { id: "oak", label: "Johnstone Hall" },
  { id: "pine", label: "Manning Hall" },
  { id: "student-union", label: "Hendrix Student Center" },
  { id: "lot-a", label: "Visitor Lot A" },
  { id: "lot-b", label: "Visitor Lot B" }
];

export const DEFAULT_START_NODE_ID = "green";
