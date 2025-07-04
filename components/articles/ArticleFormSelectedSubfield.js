import { useState } from "react";

// Liste des disciplines interne au composant
const disciplines = [
  "Accounting",
  "Acoustics and Ultrasonics",
  "Aerospace Engineering",
  "Aging",
  "Agronomy and Crop Science",
  "Algebra and Number Theory",
  "Analytical Chemistry",
  "Anatomy",
  "Anesthesiology and Pain Medicine",
  "Animal Science and Zoology",
  "Anthropology",
  "Applied Mathematics",
  "Applied Microbiology and Biotechnology",
  "Applied Psychology",
  "Aquatic Science",
  "Archeology",
  "Architecture",
  "Artificial Intelligence",
  "Astronomy and Astrophysics",
  "Atmospheric Science",
  "Atomic and Molecular Physics, and Optics",
  "Automotive Engineering",
  "Behavioral Neuroscience",
  "Biochemistry",
  "Bioengineering",
  "Biological Psychiatry",
  "Biomaterials",
  "Biomedical Engineering",
  "Biophysics",
  "Biotechnology",
  "Building and Construction",
  "Business and International Management",
  "Cancer Research",
  "Cardiology and Cardiovascular Medicine",
  "Catalysis",
  "Cell Biology",
  "Cellular and Molecular Neuroscience",
  "Ceramics and Composites",
  "Chemical Health and Safety",
  "Civil and Structural Engineering",
  "Classics",
  "Clinical Biochemistry",
  "Clinical Psychology",
  "Cognitive Neuroscience",
  "Communication",
  "Complementary and alternative medicine",
  "Complementary and Manual Therapy",
  "Computational Mathematics",
  "Computational Mechanics",
  "Computational Theory and Mathematics",
  "Computer Graphics and Computer-Aided Design",
  "Computer Networks and Communications",
  "Computer Science Applications",
  "Computer Vision and Pattern Recognition",
  "Condensed Matter Physics",
  "Conservation",
  "Control and Systems Engineering",
  "Critical Care and Intensive Care Medicine",
  "Cultural Studies",
  "Demography",
  "Dermatology",
  "Development",
  "Developmental and Educational Psychology",
  "Developmental Biology",
  "Developmental Neuroscience",
  "Discrete Mathematics and Combinatorics",
  "Drug Discovery",
  "Earth-Surface Processes",
  "Ecological Modeling",
  "Ecology",
  "Ecology, Evolution, Behavior and Systematics",
  "Economics and Econometrics",
  "Education",
  "Electrical and Electronic Engineering",
  "Electrochemistry",
  "Electronic, Optical and Magnetic Materials",
  "Emergency Medical Services",
  "Emergency Medicine",
  "Endocrine and Autonomic Systems",
  "Endocrinology",
  "Endocrinology, Diabetes and Metabolism",
  "Energy Engineering and Power Technology",
  "Environmental Chemistry",
  "Environmental Engineering",
  "Epidemiology",
  "Equine",
  "Experimental and Cognitive Psychology",
  "Family Practice",
  "Filtration and Separation",
  "Finance",
  "Fluid Flow and Transfer Processes",
  "Food Science",
  "Forestry",
  "Fuel Technology",
  "Gastroenterology",
  "Gender Studies",
  "General Agricultural and Biological Sciences",
  "General Arts and Humanities",
  "General Decision Sciences",
  "General Dentistry",
  "General Economics, Econometrics and Finance",
  "General Energy",
  "General Engineering",
  "General Health Professions",
  "General Materials Science",
  "General Psychology",
  "General Social Sciences",
  "Genetics",
  "Geochemistry and Petrology",
  "Geography, Planning and Development",
  "Geology",
  "Geometry and Topology",
  "Geophysics",
  "Geriatrics and Gerontology",
  "Global and Planetary Change",
  "Hardware and Architecture",
  "Health",
  "Health Informatics",
  "Health Information Management",
  "Health, Toxicology and Mutagenesis",
  "Hematology",
  "Hepatology",
  "History",
  "History and Philosophy of Science",
  "Horticulture",
  "Human Factors and Ergonomics",
  "Human-Computer Interaction",
  "Immunology",
  "Immunology and Allergy",
  "Industrial and Manufacturing Engineering",
  "Industrial relations",
  "Infectious Diseases",
  "Information Systems",
  "Information Systems and Management",
  "Inorganic Chemistry",
  "Insect Science",
  "Instrumentation",
  "Internal Medicine",
  "Issues, ethics and legal aspects",
  "Language and Linguistics",
  "Law",
  "Leadership and Management",
  "Library and Information Sciences",
  "Life-span and Life-course Studies",
  "Linguistics and Language",
  "Literature and Literary Theory",
  "Management Information Systems",
  "Management of Technology and Innovation",
  "Management Science and Operations Research",
  "Management, Monitoring, Policy and Law",
  "Marketing",
  "Materials Chemistry",
  "Mathematical Physics",
  "Mechanical Engineering",
  "Mechanics of Materials",
  "Media Technology",
  "Medical Laboratory Technology",
  "Medical Terminology",
  "Metals and Alloys",
  "Microbiology",
  "Modeling and Simulation",
  "Molecular Biology",
  "Molecular Medicine",
  "Museology",
  "Music",
  "Nature and Landscape Conservation",
  "Nephrology",
  "Neurology",
  "Neuropsychology and Physiological Psychology",
  "Nuclear and High Energy Physics",
  "Nuclear Energy and Engineering",
  "Numerical Analysis",
  "Nutrition and Dietetics",
  "Obstetrics and Gynecology",
  "Occupational Therapy",
  "Ocean Engineering",
  "Oceanography",
  "Oncology",
  "Ophthalmology",
  "Oral Surgery",
  "Organic Chemistry",
  "Organizational Behavior and Human Resource Management",
  "Orthodontics",
  "Orthopedics and Sports Medicine",
  "Otorhinolaryngology",
  "Paleontology",
  "Parasitology",
  "Pathology and Forensic Medicine",
  "Pediatrics, Perinatology and Child Health",
  "Periodontics",
  "Pharmaceutical Science",
  "Pharmacology",
  "Pharmacy",
  "Philosophy",
  "Physical and Theoretical Chemistry",
  "Physical Therapy, Sports Therapy and Rehabilitation",
  "Physiology",
  "Plant Science",
  "Political Science and International Relations",
  "Pollution",
  "Polymers and Plastics",
  "Process Chemistry and Technology",
  "Psychiatry and Mental health",
  "Public Administration",
  "Public Health, Environmental and Occupational Health",
  "Pulmonary and Respiratory Medicine",
  "Radiation",
  "Radiological and Ultrasound Technology",
  "Radiology, Nuclear Medicine and Imaging",
  "Rehabilitation",
  "Religious studies",
  "Renewable Energy, Sustainability and the Environment",
  "Reproductive Medicine",
  "Research and Theory",
  "Rheumatology",
  "Safety Research",
  "Safety, Risk, Reliability and Quality",
  "Sensory Systems",
  "Signal Processing",
  "Small Animals",
  "Social Psychology",
  "Sociology and Political Science",
  "Software",
  "Soil Science",
  "Space and Planetary Science",
  "Spectroscopy",
  "Speech and Hearing",
  "Statistical and Nonlinear Physics",
  "Statistics and Probability",
  "Statistics, Probability and Uncertainty",
  "Strategy and Management",
  "Structural Biology",
  "Surfaces, Coatings and Films",
  "Surgery",
  "Theoretical Computer Science",
  "Tourism, Leisure and Hospitality Management",
  "Toxicology",
  "Transplantation",
  "Transportation",
  "Urban Studies",
  "Urology",
  "Virology",
  "Visual Arts and Performing Arts",
  "Waste Management and Disposal",
  "Water Science and Technology",
];

/**
 * Champ de saisie semi-automatique avec filtering et datalist
 */
export default function FilteredDatalist({ id, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");

  const filtered = disciplines.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <input
        type="text"
        list={id}
        className="border rounded p-2 w-full"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
      />
      <datalist id={id}>
        {filtered.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
}
