import type {
  Building,
  BuildingPhoto,
  Campus,
  CampusAlert,
  CampusEvent,
  CampusService,
  ClassScheduleEntry,
  ConstructionNotice,
  DataProvenance,
  OrientationItem,
  ParkingLot,
  QuickQuestion,
  TourStop,
  WalkingPathEdge,
  WalkingPathNode
} from "../types/campus";

import longHallPhoto from "../assets/buildings/long-hall.jpg";
import danielHallPhoto from "../assets/buildings/daniel-hall.jpg";
import hendrixPhoto from "../assets/buildings/hendrix.jpg";
import cooperLibraryPhoto from "../assets/buildings/cooper-library.jpg";
import sikesHallPhoto from "../assets/buildings/sikes-hall.jpg";
import oldMainPhoto from "../assets/buildings/old-main.jpg";
import martinHallPhoto from "../assets/buildings/martin-hall.jpg";
import redfernPhoto from "../assets/buildings/redfern.jpg";
import littlejohnPhoto from "../assets/buildings/littlejohn.jpg";
import memorialStadiumPhoto from "../assets/buildings/memorial-stadium.jpg";

// ---------------------------------------------------------------------------
// Data provenance helpers
//
// Every building/lot name in this file was checked against a live source
// during this session (clemson.edu, Clemson Libraries/Housing, ClemsonWiki,
// Wikipedia, and press coverage of the 2020 Tillman Hall -> Old Main
// restoration) — see BEACON_UNIVERSITY.dataDisclosure.sources for the full
// citation list. "verified" below means the building's real-world name and
// role were confirmed this way. It does NOT mean the room numbers, hours,
// entrance sides, map coordinates, or walking-path timings are official
// Clemson facilities data — those remain illustrative placeholders for this
// prototype, and are always marked as such in `note`.
// ---------------------------------------------------------------------------

function verified(source: string, note?: string): DataProvenance {
  return {
    status: "verified",
    source,
    note:
      note ??
      "Building name and role are real and cited. Room numbers, hours, entrance sides, and map position are illustrative for this prototype, not official Clemson facilities data."
  };
}

function fixture(note?: string): DataProvenance {
  return {
    status: "development-fixture",
    note: note ?? "Illustrative placeholder for this prototype — not sourced from official campus data."
  };
}

// Real photos of each named building, sourced from Wikimedia Commons (CC BY-SA 3.0,
// Chris Pruitt / "Spyder Monkey", taken Aug 2010) — see each building's provenance
// note for the corresponding Commons file page.
function photo(src: string, fileName: string): BuildingPhoto {
  return {
    src,
    credit: "Photo: Chris Pruitt, CC BY-SA 3.0, via Wikimedia Commons",
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${fileName}`
  };
}

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

const buildings: Building[] = [
  {
    id: "richardson",
    name: "Long Hall",
    abbreviation: "LH",
    aliases: ["long hall", "science hall", "science building", "biological sciences", "lh", "chem lab", "chemistry lab"],
    category: "academic",
    description: "Home to Clemson's Department of Biological Sciences — labs, lecture halls, and the Science Tutoring Center.",
    address: "Long Hall, Clemson, SC 29634",
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
      { id: "dept-science", name: "Biological Sciences", abbreviation: "BIOSC", floor: 2, hoursNote: "Monday–Friday, 9 AM–4 PM" }
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
    photoTone: "stone",
    photo: photo(longHallPhoto, "CU_Long_Hall_Aug2010.jpg"),
    provenance: verified(
      "clemson.edu/science/academics/departments/biosci — Biological Sciences is housed primarily in Long Hall and Jordan Hall"
    )
  },
  {
    id: "jefferson",
    name: "Daniel Hall",
    abbreviation: "DH",
    aliases: ["daniel hall", "daniel", "classroom building", "dh", "engl 1030", "english 1030"],
    category: "academic",
    description: "A general classroom building hosting English, foreign language, mathematics, chemistry, speech, and history courses.",
    address: "Daniel Hall, Clemson, SC 29634",
    point: { x: 560, y: 210 },
    floors: 2,
    primaryEntranceId: "jefferson-north",
    accessibleEntranceId: "jefferson-south",
    entrances: [
      { id: "jefferson-north", label: "North Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 560, y: 185 } },
      { id: "jefferson-south", label: "South Entrance", side: "south", accessible: true, automaticDoor: true, point: { x: 560, y: 235 } }
    ],
    rooms: [{ id: "jefferson-115", number: "130", name: "ENGL 1030 Classroom", floor: 1 }],
    departments: [{ id: "dept-english", name: "English & Humanities Courses", floor: 1, hoursNote: "Classroom building — no front desk" }],
    amenities: [
      { id: "jefferson-elevator", type: "elevator", label: "Elevator near the south entrance", floor: 1 },
      { id: "jefferson-restroom", type: "restroom", label: "1st floor, main hallway", floor: 1 },
      { id: "jefferson-arestroom", type: "accessible-restroom", label: "1st floor, main hallway", floor: 1 }
    ],
    hours: { opens: "07:00", closes: "21:00" },
    nearbyParkingIds: ["lot-d"],
    landmarkNote: "On the North Academic Quad, next to the Brooks Center",
    photoTone: "brick",
    photo: photo(danielHallPhoto, "CU_Daniel_Hall_Aug2010.jpg"),
    provenance: verified(
      "clemsonwiki.com/wiki/Daniel_Hall — classroom building (English, foreign language, math, chemistry, speech, history), completed 1968"
    )
  },
  {
    id: "student-union",
    name: "Hendrix Student Center",
    abbreviation: "HSC",
    aliases: ["hendrix", "hendrix student center", "student center", "the union", "hsc", "career center", "food court"],
    category: "student-life",
    description: "The social hub of East Campus — the Michelin Career Center, East Side Food Court, 55 Exchange ice cream shop, and Tiger Tech Shop.",
    address: "Hendrix Student Center, Clemson, SC 29634",
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
      { id: "dept-career-services", name: "Michelin Career Center", floor: 1 },
      { id: "dept-veterans", name: "Veteran & Military Engagement", floor: 1 }
    ],
    amenities: [
      { id: "union-coffee", type: "coffee", label: "55 Exchange ice cream & coffee, 1st floor", floor: 1 },
      { id: "union-dining", type: "dining", label: "East Side Food Court, 1st floor", floor: 1 },
      { id: "union-study", type: "study-space", label: "2nd floor lounge", floor: 2 },
      { id: "union-elevator", type: "elevator", label: "Elevator near the east entrance", floor: 1 },
      { id: "union-restroom", type: "restroom", label: "1st floor, near the food court", floor: 1 },
      { id: "union-arestroom", type: "accessible-restroom", label: "1st floor, near the east entrance", floor: 1 }
    ],
    hours: { opens: "06:00", closes: "23:59", note: "Open until midnight most nights" },
    nearbyParkingIds: ["lot-e", "lot-a"],
    landmarkNote: "East side of campus, the building with the big glass atrium",
    photoTone: "glass",
    photo: photo(hendrixPhoto, "CU_Hendrix_Student_Center_Aug2010.jpg"),
    provenance: verified(
      "clemson.edu/studentaffairs/services/cre/venues/hsc.html — East side of campus; Michelin Career Center, East Side Food Court, 55 Exchange, Tiger Tech Shop",
      "Building, location, and named venues inside are real and cited. Hours, room numbers, and exact entrance layout are illustrative. Veteran & Military Engagement's placement here is a reasonable but unverified placement — Clemson's real Military & Veteran Engagement office location was not confirmed this session."
    )
  },
  {
    id: "library",
    name: "R.M. Cooper Library",
    abbreviation: "CL",
    aliases: ["cooper library", "cooper", "library", "r.m. cooper library", "cl", "testing center", "it help desk"],
    category: "library",
    description: "Clemson's main library — quiet study floors, group study rooms, research help, and the IT Help Desk. Sits beside the campus's well-known Reflection Pond.",
    address: "116 Sigma Drive, Clemson, SC 29634",
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
    landmarkNote: "The tall building overlooking Reflection Pond, just west of Bowman Field",
    photoTone: "stone",
    photo: photo(cooperLibraryPhoto, "CU_Cooper_Library_Aug2010.jpg"),
    provenance: verified("libraries.clemson.edu — R.M. Cooper Library, 116 Sigma Drive, Clemson, SC 29634")
  },
  {
    id: "founders",
    name: "Sikes Hall",
    abbreviation: "SH",
    aliases: [
      "sikes hall",
      "sikes",
      "administration building",
      "sh",
      "financial aid",
      "registrar",
      "advising",
      "admissions",
      "welcome center",
      "admissions office"
    ],
    category: "administration",
    description: "Clemson's primary administration building — the offices of the President and Provost, Undergraduate Admissions, Financial Aid, and the Registrar.",
    address: "105 Sikes Hall, Clemson, SC 29634",
    point: { x: 490, y: 545 },
    floors: 2,
    primaryEntranceId: "founders-south",
    accessibleEntranceId: "founders-south",
    entrances: [
      { id: "founders-north", label: "North Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 490, y: 520 } },
      { id: "founders-south", label: "South Entrance", side: "south", accessible: true, automaticDoor: true, point: { x: 490, y: 570 }, notes: "Ramp and elevator lobby" }
    ],
    rooms: [
      { id: "founders-105", number: "105", name: "Undergraduate Admissions", floor: 1 },
      { id: "founders-220", number: "220", name: "Financial Aid Office", floor: 2 },
      { id: "founders-110", number: "110", name: "Registrar", floor: 1 },
      { id: "founders-215", number: "215", name: "Academic Advising", floor: 2 }
    ],
    departments: [
      { id: "dept-admissions", name: "Undergraduate Admissions", floor: 1, roomId: "founders-105", hoursNote: "Open until 5:00 PM" },
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
    landmarkNote: "The stone building south of Bowman Field, past Hendrix Student Center. ADA shuttles stage here on football gamedays.",
    photoTone: "stone",
    photo: photo(sikesHallPhoto, "CU_Sikes_Hall_Aug2010_01.jpg"),
    provenance: verified(
      "Sikes Hall houses the President, Provost, Financial Aid, and Undergraduate Admissions (address: 105 Sikes Hall); ADA gameday shuttle stop per Post and Courier reporting on Memorial Stadium history"
    )
  },
  {
    id: "admissions",
    name: "Old Main",
    abbreviation: "OM",
    aliases: ["old main", "tillman hall", "tillman", "main building", "om", "clock tower", "campus tours"],
    category: "administration",
    description:
      "Clemson's original main academic building and clock tower on Bowman Field — known for decades as Tillman Hall before the university restored its original name, Main Building ('Old Main'), in 2020. Today it's a historic, ceremonial landmark and a favorite stop on campus tours.",
    address: "Old Main, Bowman Field, Clemson, SC 29634",
    point: { x: 330, y: 605 },
    floors: 1,
    primaryEntranceId: "admissions-east",
    accessibleEntranceId: "admissions-east",
    entrances: [
      { id: "admissions-east", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 355, y: 605 } },
      { id: "admissions-west", label: "West Entrance", side: "west", accessible: false, automaticDoor: false, point: { x: 305, y: 605 } }
    ],
    rooms: [],
    departments: [],
    amenities: [
      { id: "admissions-restroom", type: "restroom", label: "1st floor lobby", floor: 1 },
      { id: "admissions-arestroom", type: "accessible-restroom", label: "1st floor lobby", floor: 1 }
    ],
    hours: { opens: "08:30", closes: "17:00" },
    nearbyParkingIds: ["lot-a"],
    landmarkNote: "The clock-tower building near the south campus entrance, next to Visitor Lot A",
    photoTone: "stone",
    photo: photo(oldMainPhoto, "CU_Tillman_Hall_Aug2010_01.jpg"),
    provenance: verified(
      "Clemson News + Wikipedia — Tillman Hall was restored to its original name, Main Building ('Old Main'), by Clemson's Board of Trustees in 2020",
      "Building, history, and 2020 renaming are real and cited. This building is a historic landmark, not a functioning admissions office — search for Admissions to find Sikes Hall, where that office actually is. Interior layout and hours are illustrative."
    )
  },
  {
    id: "veterans",
    name: "Martin Hall",
    abbreviation: "MTH",
    aliases: ["martin hall", "martin", "math 1060", "mathematics", "statistics", "mth"],
    category: "academic",
    description: "Home to Clemson's School of Mathematical and Statistical Sciences — classrooms, computer labs, and faculty offices across Buildings M, O, and E.",
    address: "Martin Hall, Clemson, SC 29634",
    point: { x: 610, y: 440 },
    floors: 1,
    primaryEntranceId: "veterans-main",
    accessibleEntranceId: "veterans-main",
    entrances: [{ id: "veterans-main", label: "Main Entrance", side: "north", accessible: true, automaticDoor: true, point: { x: 610, y: 415 } }],
    rooms: [{ id: "veterans-m102", number: "M-102", name: "MATH 1060 Classroom", floor: 1 }],
    departments: [{ id: "dept-math", name: "Mathematical & Statistical Sciences", floor: 1 }],
    amenities: [
      { id: "veterans-study", type: "study-space", label: "Computer lab, Building M", floor: 1 },
      { id: "veterans-restroom", type: "restroom", label: "1st floor", floor: 1 }
    ],
    hours: { opens: "08:00", closes: "18:00" },
    nearbyParkingIds: ["lot-e"],
    landmarkNote: "Along Union Walk, near Hendrix Student Center",
    photoTone: "brick",
    photo: photo(martinHallPhoto, "CU_Martin_Hall_Aug2010.jpg"),
    provenance: verified(
      "clemsonwiki.com/wiki/Martin_Hall — home of the School of Mathematical and Statistical Sciences, comprised of Buildings M, O, and E"
    )
  },
  {
    id: "health-center",
    name: "Redfern Health Center",
    abbreviation: "RHC",
    aliases: ["redfern", "redfern health center", "health center", "campus health", "clinic", "rhc", "counseling", "caps"],
    category: "health-safety",
    description: "Student Health Services and Counseling and Psychological Services (CAPS) — medical care, urgent care, pharmacy, and confidential counseling.",
    address: "735 McMillan Road, Clemson, SC 29634",
    point: { x: 760, y: 395 },
    floors: 1,
    primaryEntranceId: "health-main",
    accessibleEntranceId: "health-main",
    entrances: [{ id: "health-main", label: "Main Entrance", side: "north", accessible: true, automaticDoor: true, point: { x: 760, y: 370 } }],
    rooms: [],
    departments: [
      { id: "dept-health", name: "Student Health Services", floor: 1, hoursNote: "Urgent care until 8 PM weekdays", phone: "864-656-2233" },
      { id: "dept-counseling", name: "Counseling and Psychological Services (CAPS)", floor: 1, appointmentRequired: true }
    ],
    amenities: [
      { id: "health-restroom", type: "restroom", label: "1st floor", floor: 1 },
      { id: "health-arestroom", type: "accessible-restroom", label: "1st floor", floor: 1 }
    ],
    hours: { opens: "08:00", closes: "18:00", note: "Urgent care until 8 PM weekdays" },
    nearbyParkingIds: ["lot-e"],
    landmarkNote: "East side of campus, past Martin Hall",
    photoTone: "glass",
    photo: photo(redfernPhoto, "CU_Redfern_Health_Center_Aug2010.jpg"),
    provenance: verified("clemson.edu/studentaffairs/find-support/shs/ — Redfern Health Center, 735 McMillan Road, Clemson, SC 29634, 864-656-2233")
  },
  {
    id: "public-safety",
    name: "Clemson University Public Safety",
    abbreviation: "PS",
    aliases: ["campus police", "public safety", "police", "cupd", "security", "emergency", "blue light phone"],
    category: "health-safety",
    description: "Clemson University Police, Fire & EMS, and Emergency Management. Not a replacement for 911 — for emergencies, always call 911 or use a campus Blue Light emergency phone.",
    address: "Clemson, SC 29634",
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
    photoTone: "stone",
    safetyGuidance:
      "Beacon has no verified building-specific evacuation routes or assembly points for Clemson — this is general safety guidance, not an official procedure. Always follow Clemson's official emergency alerts, posted evacuation signage, and instructions from staff or first responders on site. During a fire alarm, use stairs, not elevators. If you can't use stairs, go to the nearest stairwell landing or other marked rescue-assistance area, stay put, and call 911 to report your location. For any immediate emergency, call 911 or use a campus Blue Light phone.",
    provenance: fixture(
      "Clemson University Public Safety (Police, Fire & EMS, Emergency Management) and campus Blue Light emergency phones are real — clemson.edu/cusafety. This record's specific building, address, and hours-of-day layout were not confirmed against an official source and are illustrative."
    )
  },
  {
    id: "oak",
    name: "Mickel Hall",
    abbreviation: "MH",
    aliases: ["mickel hall", "mickel", "mh", "housing", "residence life"],
    category: "residence",
    description: "A Clemson residence hall on the west side of campus, near the dining hall.",
    address: "Mickel Hall, Clemson, SC 29634",
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
    photoTone: "brick",
    provenance: verified("housing.clemson.edu — Mickel Hall is a real Clemson residence hall")
  },
  {
    id: "pine",
    name: "Lightsey Bridge I",
    abbreviation: "LB1",
    aliases: ["lightsey bridge", "lightsey bridge i", "lb1", "apartments"],
    category: "residence",
    description: "An apartment-style residential community on the west side of campus.",
    address: "Lightsey Bridge I, Clemson, SC 29634",
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
    photoTone: "brick",
    provenance: verified("housing.clemson.edu — Lightsey Bridge I is a real Clemson apartment-style residential community")
  },
  {
    id: "dining-commons",
    name: "Fresh Food Company",
    abbreviation: "FFC",
    aliases: ["fresh food company", "ffc", "dining hall", "dining commons", "cafeteria", "food court", "dining"],
    category: "dining",
    description: "Clemson's main all-you-care-to-eat dining hall, open for breakfast, lunch, and dinner.",
    address: "Fresh Food Company, Clemson, SC 29634",
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
    photoTone: "glass",
    provenance: verified("housing.clemson.edu — Fresh Food Company is Clemson's main dining hall")
  },
  {
    id: "athletics-center",
    name: "Littlejohn Coliseum",
    abbreviation: "LJC",
    aliases: ["littlejohn", "littlejohn coliseum", "basketball arena", "ljc", "gymnastics"],
    category: "athletics",
    description: "A 9,000-seat multi-purpose arena, home to Clemson men's and women's basketball and women's gymnastics.",
    address: "Littlejohn Coliseum, Clemson, SC 29634",
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
    photoTone: "glass",
    photo: photo(littlejohnPhoto, "CU_Littlejohn_Coliseum_Aug2010_01.jpg"),
    provenance: verified("en.wikipedia.org/wiki/Littlejohn_Coliseum — 9,000-seat arena opened 1968, named for James C. Littlejohn, Class of 1908")
  },
  {
    id: "stadium",
    name: "Memorial Stadium",
    abbreviation: "STAD",
    aliases: ["memorial stadium", "death valley", "stadium", "football stadium", "frank howard field"],
    category: "athletics",
    description: "Frank Howard Field at Memorial Stadium — known worldwide as \"Death Valley,\" home of Clemson football and Commencement.",
    address: "Memorial Stadium, Clemson, SC 29634",
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
    photoTone: "stone",
    photo: photo(memorialStadiumPhoto, "CU_Memorial_Stadium_Aug2010.jpg"),
    provenance: verified(
      "en.wikipedia.org/wiki/Memorial_Stadium_(Clemson) — opened 1942; \"Death Valley\" nickname traced to a 1948 quote from Presbyterian College coach Lonnie McMillian"
    )
  },
  {
    id: "fine-arts",
    name: "Brooks Center for the Performing Arts",
    abbreviation: "BC",
    aliases: ["brooks center", "brooks", "performing arts", "theatre", "bc"],
    category: "arts",
    description: "Clemson's performing arts venue — theatre, concerts, and recitals.",
    address: "Brooks Center for the Performing Arts, Clemson, SC 29634",
    point: { x: 700, y: 190 },
    floors: 3,
    primaryEntranceId: "fine-arts-main",
    accessibleEntranceId: "fine-arts-accessible",
    entrances: [
      { id: "fine-arts-main", label: "Main Entrance", side: "north", accessible: false, automaticDoor: false, point: { x: 700, y: 165 } },
      { id: "fine-arts-accessible", label: "East Entrance", side: "east", accessible: true, automaticDoor: true, point: { x: 725, y: 190 } }
    ],
    rooms: [],
    departments: [{ id: "dept-fine-arts", name: "Performing Arts Box Office", floor: 1 }],
    amenities: [
      { id: "fine-arts-elevator", type: "elevator", label: "Elevator, main lobby", floor: 1 },
      { id: "fine-arts-restroom", type: "restroom", label: "1st floor lobby", floor: 1 },
      { id: "fine-arts-arestroom", type: "accessible-restroom", label: "1st floor lobby", floor: 1 }
    ],
    hours: { opens: "08:00", closes: "22:00" },
    nearbyParkingIds: ["lot-d"],
    landmarkNote: "North Academic Quad, next to Daniel Hall",
    photoTone: "stone",
    provenance: verified("clemson.edu/centers-institutes/brooks/ — Brooks Center for the Performing Arts")
  }
];

// ---------------------------------------------------------------------------
// Parking
// ---------------------------------------------------------------------------
// Clemson's real permit categories are Student, Employee, Visitor, EV,
// Carpool, Football, Event/Departmental, Vendor, Metered, and Snow Complex
// (clemson.edu/campus-life/parking/). No specific lot names/letters were
// published on that overview page, so the lot names and rules below remain
// illustrative placeholders modeled loosely on those real categories.

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
    walkTimeMinutesTo: { admissions: 4, founders: 6, "student-union": 8 },
    provenance: fixture("Illustrative visitor lot. Clemson's real permit categories (Visitor, Student, Employee, Event, etc.) are documented at clemson.edu/campus-life/parking/; this specific lot name and rules are not.")
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
    closureReason: "Closed today for event setup",
    provenance: fixture()
  },
  {
    id: "lot-c",
    name: "Student Lot C",
    point: { x: 100, y: 300 },
    eligibility: ["student"],
    permitRequired: true,
    accessibleSpaces: 5,
    notes: "Requires a valid Clemson student parking permit.",
    walkTimeMinutesTo: { oak: 2, pine: 3, "dining-commons": 2, richardson: 6 },
    provenance: fixture()
  },
  {
    id: "lot-d",
    name: "Faculty & Staff Lot D",
    point: { x: 600, y: 600 },
    eligibility: ["faculty", "visitor"],
    permitRequired: true,
    accessibleSpaces: 6,
    notes: "Employee permit required Monday–Friday, 7 AM–6 PM. Open to all after 6 PM and on weekends.",
    walkTimeMinutesTo: { founders: 3, richardson: 5, jefferson: 6, "fine-arts": 5, "athletics-center": 6 },
    provenance: fixture()
  },
  {
    id: "lot-e",
    name: "Visitor & Event Lot E",
    point: { x: 650, y: 480 },
    eligibility: ["visitor", "student"],
    permitRequired: false,
    freeMinutes: 60,
    accessibleSpaces: 5,
    notes: "Best option near Hendrix Student Center, Cooper Library, and Martin Hall.",
    walkTimeMinutesTo: { "student-union": 3, library: 4, veterans: 2, "health-center": 4 },
    provenance: fixture()
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

// elevationChange (1 flat – 5 steep) and surface are illustrative estimates based
// on Clemson's real, well-documented topology (Tillman Hall/Old Main and Sikes
// Hall sit on a hill above Bowman Field; Memorial Stadium is a literal valley —
// "Death Valley") rather than a survey. See campus.dataDisclosure and the
// exertion note surfaced alongside route scores for that caveat.
const pathEdges: WalkingPathEdge[] = [
  { from: "green", to: "library-plaza", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 3, surface: "paved" },
  { from: "green", to: "union-plaza", minutes: 2, accessible: true, outdoor: true, crowdLevel: 4, noiseLevel: 4, elevationChange: 1, surface: "paved" },
  { from: "green", to: "garden-walk", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true, elevationChange: 1, surface: "paved" },
  { from: "garden-walk", to: "union-plaza", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true, elevationChange: 1, surface: "paved" },
  { from: "green", to: "north-quad", minutes: 3, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 2, elevationChange: 2, surface: "paved" },
  { from: "green", to: "admin-walk", minutes: 4, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 4, surface: "paved" },
  { from: "green", to: "dorm-row", minutes: 4, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 2, surface: "paved" },
  { from: "library-plaza", to: "richardson", minutes: 5, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 1, elevationChange: 2, surface: "paved" },
  { from: "library-plaza", to: "library", minutes: 1, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true, elevationChange: 1, surface: "paved" },
  { from: "library-plaza", to: "north-quad", minutes: 2, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 1, surface: "paved" },
  { from: "north-quad", to: "jefferson", minutes: 2, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3, elevationChange: 1, surface: "paved" },
  { from: "north-quad", to: "fine-arts", minutes: 4, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 2, surface: "paved" },
  { from: "north-quad", to: "fine-arts", minutes: 2, accessible: false, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 4, surface: "unpaved" },
  { from: "union-plaza", to: "student-union", minutes: 1, accessible: true, outdoor: true, crowdLevel: 4, noiseLevel: 4, elevationChange: 1, surface: "paved" },
  { from: "union-plaza", to: "veterans", minutes: 2, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 2, surface: "paved" },
  { from: "union-plaza", to: "east-walk", minutes: 3, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3, elevationChange: 2, surface: "paved" },
  { from: "union-plaza", to: "lot-e", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 2, surface: "paved" },
  { from: "east-walk", to: "health-center", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 1, surface: "paved" },
  { from: "east-walk", to: "public-safety", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 1, surface: "paved" },
  { from: "east-walk", to: "athletics-walk", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 2, surface: "paved" },
  { from: "admin-walk", to: "founders", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true, elevationChange: 2, surface: "paved" },
  { from: "admin-walk", to: "south-gate", minutes: 3, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, lowStimulation: true, elevationChange: 3, surface: "paved" },
  { from: "admin-walk", to: "lot-d", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 2, surface: "paved" },
  { from: "south-gate", to: "admissions", minutes: 3, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 2, surface: "paved" },
  { from: "south-gate", to: "lot-a", minutes: 1, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 1, surface: "paved" },
  { from: "dorm-row", to: "oak", minutes: 1, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 1, surface: "paved" },
  { from: "dorm-row", to: "pine", minutes: 2, accessible: true, outdoor: true, crowdLevel: 2, noiseLevel: 2, elevationChange: 1, surface: "paved" },
  { from: "dorm-row", to: "dining-commons", minutes: 2, accessible: true, outdoor: true, crowdLevel: 4, noiseLevel: 3, elevationChange: 1, surface: "paved" },
  { from: "dorm-row", to: "lot-c", minutes: 1, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 1, surface: "paved" },
  { from: "athletics-walk", to: "athletics-center", minutes: 1, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3, elevationChange: 2, surface: "paved" },
  { from: "athletics-walk", to: "stadium", minutes: 3, accessible: true, outdoor: true, crowdLevel: 3, noiseLevel: 3, elevationChange: 3, surface: "paved" },
  { from: "athletics-walk", to: "lot-b", minutes: 2, accessible: true, outdoor: true, crowdLevel: 1, noiseLevel: 1, elevationChange: 1, surface: "paved" }
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
  },
  {
    id: "alert-first-year-parking-policy",
    severity: "info",
    title: "First-Year Parking Policy",
    message:
      "Beginning Fall 2026, first-year Clemson and Bridge students who live on campus may not park a personal vehicle on campus during the Fall and Spring semesters of their first year. See clemson.edu/campus-life/parking/ for details.",
    affectedBuildingIds: [],
    startsAt: "2026-08-01T00:00:00-04:00",
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
    venueBuildingId: "founders",
    description: "A guided walking tour of academic buildings, residence halls, dining, and athletics facilities, starting at Sikes Hall.",
    recommendedParkingId: "lot-a",
    recommendedEntranceId: "founders-south",
    arrivalRecommendation: "Check in at Sikes Hall 10 minutes before tour start. Old Main, right on Bowman Field, is the tour's first stop."
  },
  {
    id: "evt-basketball-homecoming",
    name: "Homecoming Basketball Game",
    date: "2026-08-15",
    startTime: "19:00",
    venueBuildingId: "athletics-center",
    description: "Clemson Basketball hosts its Homecoming game in Littlejohn Coliseum.",
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
    description: "University-wide Commencement ceremony for graduating students and their families at Memorial Stadium.",
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
    description: "A weekend of campus activities, athletics, and dining for families visiting Clemson.",
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
    venueBuildingId: "founders",
    description: "Information sessions, financial aid guidance, and campus tours for prospective students and families, based out of Sikes Hall.",
    recommendedParkingId: "lot-a",
    recommendedEntranceId: "founders-south",
    arrivalRecommendation: "Check in at Sikes Hall — financial aid and admissions drop-in sessions run all morning."
  },
  {
    id: "evt-theatre",
    name: "Fall Theatre Performance",
    date: "2026-11-20",
    startTime: "19:30",
    venueBuildingId: "fine-arts",
    description: "A mainstage production at the Brooks Center for the Performing Arts.",
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
  { id: "svc-admissions", name: "Undergraduate Admissions", category: "admissions", buildingId: "founders", departmentId: "dept-admissions", description: "Undergraduate admissions counseling and application support, in Sikes Hall." },
  { id: "svc-financial-aid", name: "Financial Aid", category: "financial-aid", buildingId: "founders", departmentId: "dept-financial-aid", description: "Grants, loans, scholarships, and financial aid appeals." },
  { id: "svc-registrar", name: "Registrar", category: "registrar", buildingId: "founders", departmentId: "dept-registrar", description: "Transcripts, enrollment verification, and registration holds." },
  { id: "svc-advising", name: "Academic Advising", category: "advising", buildingId: "founders", departmentId: "dept-advising", description: "Course planning and degree progress advising.", appointmentRequired: true },
  { id: "svc-career-services", name: "Michelin Career Center", category: "career-services", buildingId: "student-union", departmentId: "dept-career-services", description: "Resume help, interview prep, and employer connections." },
  { id: "svc-veterans", name: "Veteran & Military Engagement", category: "veterans", buildingId: "student-union", departmentId: "dept-veterans", description: "Benefits guidance and community space for veteran and military-connected students." },
  { id: "svc-student-affairs", name: "Student Affairs", category: "student-affairs", buildingId: "student-union", departmentId: "dept-student-affairs", description: "Student organizations, conduct, and campus life support." },
  { id: "svc-counseling", name: "Counseling and Psychological Services (CAPS)", category: "counseling", buildingId: "health-center", departmentId: "dept-counseling", description: "Confidential mental health counseling for students.", appointmentRequired: true },
  { id: "svc-health", name: "Student Health Services", category: "health", buildingId: "health-center", departmentId: "dept-health", description: "Primary care, urgent care, and immunizations." },
  { id: "svc-police", name: "Campus Police", category: "police", buildingId: "public-safety", departmentId: "dept-safety", description: "Campus safety, escorts, and emergency response. For emergencies, call 911." },
  { id: "svc-accessibility", name: "Accessibility Services", category: "accessibility", buildingId: "founders", description: "Accommodations, adaptive technology, and accessible routing support." },
  { id: "svc-it-help-desk", name: "IT Help Desk", category: "it-help-desk", buildingId: "library", description: "Tech support, laptop loaners, and Wi-Fi troubleshooting." },
  { id: "svc-bookstore", name: "Clemson University Barnes & Noble Bookstore", category: "bookstore", buildingId: "student-union", description: "Textbooks, course materials, and Clemson gear. (Real store is at the Douthit Hills Hub, 110 Cherry Road — placed here for this prototype's simplified map.)" },
  { id: "svc-dining", name: "Dining Services", category: "dining", buildingId: "dining-commons", description: "Meal plans, dining hours, and menus." },
  { id: "svc-housing", name: "Housing & Residence Life", category: "housing", buildingId: "oak", departmentId: "dept-housing", description: "Room assignments, move-in, and residence hall support." },
  { id: "svc-testing-center", name: "Testing Center", category: "testing-center", buildingId: "library", description: "Proctored exams and testing accommodations." },
  { id: "svc-library", name: "Library Services", category: "library", buildingId: "library", departmentId: "dept-library-reference", description: "Research help, course reserves, and study space reservations." },
  { id: "svc-tutoring", name: "Science Tutoring Center", category: "tutoring", buildingId: "richardson", description: "Free drop-in tutoring for BIO, CHEM, and PHYS courses." }
];

const jordanSchedule: ClassScheduleEntry[] = [
  { id: "class-english", time: "09:00", course: "ENGL 1030", courseName: "English Composition", buildingId: "jefferson", roomNumber: "130" },
  { id: "class-math", time: "10:30", course: "MATH 1060", courseName: "College Algebra", buildingId: "veterans", roomNumber: "M-102" },
  { id: "class-bio", time: "13:00", course: "BIO 101", courseName: "Introduction to Biology", buildingId: "richardson", roomNumber: "204" }
];

const tourStops: TourStop[] = [
  { id: "tour-old-main", order: 1, buildingId: "admissions", point: { x: 330, y: 605 }, title: "Old Main", description: "Your tour starts here — Clemson's original main building and clock tower, restored to its historic name in 2020." },
  { id: "tour-green", order: 2, point: { x: 500, y: 360 }, title: "Bowman Field", description: "The historic heart of campus. Most academic buildings and Hendrix Student Center open onto the field." },
  { id: "tour-library", order: 3, buildingId: "library", point: { x: 415, y: 305 }, title: "R.M. Cooper Library", description: "Four floors of study space, research help, and a view of the campus's well-known Reflection Pond." },
  { id: "tour-union", order: 4, buildingId: "student-union", point: { x: 500, y: 445 }, title: "Hendrix Student Center", description: "Dining, the career center, and the heart of student life on East Campus." },
  { id: "tour-oak", order: 5, buildingId: "oak", point: { x: 190, y: 240 }, title: "Mickel Hall", description: "A sample residence hall — tour a model room if one is available." },
  { id: "tour-dining", order: 6, buildingId: "dining-commons", point: { x: 270, y: 310 }, title: "Fresh Food Company", description: "Clemson's main dining hall, with options for every diet and schedule." },
  { id: "tour-richardson", order: 7, buildingId: "richardson", point: { x: 430, y: 260 }, title: "Long Hall", description: "Home to Biological Sciences — labs, lecture halls, and the Science Tutoring Center." },
  { id: "tour-athletics", order: 8, buildingId: "athletics-center", point: { x: 760, y: 590 }, title: "Littlejohn Coliseum", description: "The 9,000-seat basketball arena — end your tour here with a look at Clemson Athletics." }
];

const orientationItems: OrientationItem[] = [
  { id: "orient-session", order: 1, icon: "schedule", title: "Your First Orientation Session", time: "09:00", buildingId: "student-union", description: "Welcome to Clemson. Your first orientation session begins at 9:00 AM in Hendrix Student Center." },
  { id: "orient-parking", order: 2, icon: "parking", title: "Where to Park", description: "Visitor parking is available in Lot A. From Lot A, Hendrix Student Center is about an 8 minute walk." },
  { id: "orient-checkin", order: 3, icon: "check-in", title: "Check-In", buildingId: "student-union", description: "Check-in is through the east entrance of Hendrix Student Center — look for the Orientation table just inside." },
  { id: "orient-id", order: 4, icon: "id", title: "Student ID", buildingId: "student-union", description: "Get your Clemson TigerOne ID card at the Student Affairs desk, 1st floor." },
  { id: "orient-financial-aid", order: 5, icon: "financial-aid", title: "Financial Aid", buildingId: "founders", description: "Sikes Hall, 2nd floor, Room 220. Bring a photo ID." },
  { id: "orient-residence", order: 6, icon: "residence", title: "Your Residence Hall", buildingId: "oak", description: "Move into Mickel Hall any time after 9:00 AM. Volunteers at the main entrance can help you carry belongings." },
  { id: "orient-dining", order: 7, icon: "dining", title: "Dining", buildingId: "dining-commons", description: "Fresh Food Company is open for breakfast, lunch, and dinner. Your TigerOne ID doubles as your meal card." },
  { id: "orient-sessions", order: 8, icon: "sessions", title: "Afternoon Advising Sessions", time: "13:30", buildingId: "jefferson", description: "Academic advising sessions continue at 1:30 PM in Daniel Hall." }
];

const quickQuestions: QuickQuestion[] = [
  { id: "qq-next-class", question: "Where is my next class?", answer: "Your next class is MATH 1060 at 10:30 AM in Martin Hall, Room M-102 — about a 5 minute walk from here." },
  { id: "qq-parking", question: "Where can I park?", answer: "Visitor parking is available in Lot A near Sikes Hall, with no permit required for the first 2 hours." },
  { id: "qq-restroom", question: "Where is the nearest restroom?", answer: "Open any building page to see restroom and accessible-restroom locations by floor — most buildings have one near the main entrance." },
  { id: "qq-food", question: "Where can I eat?", answer: "Fresh Food Company is open now, and Hendrix Student Center has the East Side Food Court and 55 Exchange." },
  { id: "qq-open-now", question: "What is open now?", answer: "Most academic buildings are open until 10 PM. Check a building's detail page for its exact hours." },
  { id: "qq-admissions", question: "How do I get to Admissions?", answer: "Undergraduate Admissions is in Sikes Hall, about a 6 minute walk from Visitor Lot A. Use the south entrance." },
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
  "engl 1030": "room:jefferson-115",
  "english composition": "room:jefferson-115",
  "math 1060": "room:veterans-m102",
  "college algebra": "room:veterans-m102",
  "financial aid": "service:svc-financial-aid",
  "visitor parking": "parking:lot-a",
  "basketball arena": "building:athletics-center",
  "death valley": "building:stadium",
  "veterans office": "service:svc-veterans",
  "campus police": "service:svc-police",
  "graduation": "event:evt-graduation",
  "commencement": "event:evt-graduation",
  "coffee": "amenity:coffee",
  "closest bathroom": "amenity:restroom",
  "nearest bathroom": "amenity:restroom"
};

export const BEACON_UNIVERSITY: Campus = {
  id: "clemson-university",
  universityName: "Clemson University",
  shortName: "Clemson",
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
  aliasMap,
  dataDisclosure: {
    summary:
      "Building names in this preview are real Clemson University buildings and landmarks, checked against clemson.edu and other public sources during development (see sources below). Room numbers, hours, exact entrance sides, map coordinates, parking lot names, and simulated alerts are illustrative placeholders for this prototype — not official Clemson facilities, accessibility, or parking data. Nothing in Beacon Campus should be used for real-world navigation, safety, or official campus information; for that, use Clemson's own resources at clemson.edu/campus-map/.",
    sources: [
      { label: "Clemson University — Campus Map", url: "https://www.clemson.edu/campus-map/" },
      { label: "R.M. Cooper Library", url: "https://libraries.clemson.edu/" },
      { label: "Student Health Services — Redfern Health Center", url: "https://www.clemson.edu/studentaffairs/find-support/shs/" },
      { label: "Clemson Housing — Fresh Food Company, Mickel Hall, Lightsey Bridge I", url: "https://housing.clemson.edu/" },
      { label: "Clemson University Bookstore", url: "https://www.clemson.edu/campus-life/campus-services/book-store/" },
      { label: "Parking and Transportation", url: "https://www.clemson.edu/campus-life/parking/" },
      { label: "Clemson University Public Safety", url: "https://www.clemson.edu/cusafety/" },
      { label: "Hendrix Student Center", url: "https://www.clemson.edu/studentaffairs/services/cre/venues/hsc.html" },
      {
        label: "Old Main (formerly Tillman Hall) restored to original name, 2020",
        url: "https://news.clemson.edu/clemson-trustees-approve-honors-college-name-change-request-authority-to-restore-original-name-of-tillman-hall/"
      },
      { label: "Sikes Hall — Locations Hub", url: "https://rs.locationshub.com/location_detail.aspx?id=027-10008866" },
      { label: "Littlejohn Coliseum — Wikipedia", url: "https://en.wikipedia.org/wiki/Littlejohn_Coliseum" },
      { label: "Memorial Stadium (\"Death Valley\") — Wikipedia", url: "https://en.wikipedia.org/wiki/Memorial_Stadium_(Clemson)" },
      { label: "Fort Hill — Wikipedia", url: "https://en.wikipedia.org/wiki/Fort_Hill_(Clemson_University,_South_Carolina)" },
      { label: "Martin Hall — ClemsonWiki", url: "https://clemsonwiki.com/wiki/Martin_Hall" },
      { label: "Daniel Hall — ClemsonWiki", url: "https://clemsonwiki.com/wiki/Daniel_Hall" },
      { label: "Brooks Center for the Performing Arts", url: "https://www.clemson.edu/centers-institutes/brooks/" },
      { label: "Biological Sciences — Long Hall / Jordan Hall", url: "https://www.clemson.edu/science/academics/departments/biosci/about/" }
    ]
  }
};

export const JORDAN_SCHEDULE = jordanSchedule;

export const DEMO_PERSONA = {
  name: "Jordan",
  status: "Freshman",
  schedule: jordanSchedule
};

export const START_POINT_OPTIONS: { id: string; label: string }[] = [
  { id: "green", label: "Bowman Field (default)" },
  { id: "oak", label: "Mickel Hall" },
  { id: "pine", label: "Lightsey Bridge I" },
  { id: "student-union", label: "Hendrix Student Center" },
  { id: "lot-a", label: "Visitor Lot A" },
  { id: "lot-b", label: "Visitor Lot B" }
];

export const DEFAULT_START_NODE_ID = "green";
