/** @jsxImportSource https://esm.sh/react */
import React, { useEffect, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

// Interfaces
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string[];
}

interface Education {
  degree: string;
  institution: string;
  period: string;
  description?: string;
}

interface Skill {
  name: string;
  icon: string;
  proficiency: number;
  description: string;
}

interface Certification {
  title: string;
  organization: string;
  icon: string;
}

interface Language {
  name: string;
  level: string;
  proficiency: number;
}

interface ResumeUploadProps {
  onUploadSuccess: () => void;
}

// Components

function ProfilePhotoUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setUploading(true);
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string;
        const response = await fetch("/upload-photo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo: base64Data }),
        });

        if (response.ok) {
          onUploadSuccess();
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload photo");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="upload-button">
      <input
        type="file"
        id="photo-upload"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ display: "none" }}
      />
      <label htmlFor="photo-upload" className={`upload-label ${uploading ? "uploading" : ""}`}>
        {uploading ? "Uploading..." : "Upload Profile Photo"}
      </label>
    </div>
  );
}

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) setIsVisible(true);
      else setIsVisible(false);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return isVisible
    ? (
      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        ⬆️
      </button>
    )
    : null;
}

function Navigation({
  activeSection,
  isMenuOpen,
  setIsMenuOpen,
}: {
  activeSection: string;
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}) {
  return (
    <nav className={isMenuOpen ? "menu-open" : ""}>
      {[
        "about",
        "experience",
        "skills",
        "education",
        "certifications",
        "languages",
        "projects",
        "extra-curricular",
        "hobbies",
        "contact",
      ].map((section) => (
        <a
          key={section}
          href={`#${section}`}
          className={activeSection === section ? "active" : ""}
          onClick={() => setIsMenuOpen(false)}
        >
          {section.charAt(0).toUpperCase() + section.slice(1)}
        </a>
      ))}
    </nav>
  );
}

function ContactForm({
  loading,
  handleSubmit,
  formData,
  setFormData,
}: {
  loading: boolean;
  handleSubmit: (e: React.FormEvent, deviceInfo: any) => Promise<void>;
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
}) {
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    const collectDeviceInfo = async () => {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        browserName: getBrowserName(),
      };

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          info.latitude = position.coords.latitude;
          info.longitude = position.coords.longitude;
        } catch (error) {
          console.log("Geolocation permission denied");
        }
      }

      if ("getBattery" in navigator) {
        const battery: any = await (navigator as any).getBattery();
        info.batteryLevel = `${Math.round(battery.level * 100)}%`;
      }

      if ("connection" in navigator) {
        const connection: any = (navigator as any).connection;
        info.networkType = connection.effectiveType;
      }

      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      info.ip = ipData.ip;

      setDeviceInfo(info);
    };

    collectDeviceInfo();
  }, []);

  function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e, deviceInfo);
  };

  return (
    <form onSubmit={onSubmit} className="contact-form">
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={e => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Message"} 📨
      </button>
    </form>
  );
}

function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setUploading(true);
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string;
        const response = await fetch("/upload-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resume: base64Data }),
        });

        if (response.ok) {
          onUploadSuccess();
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload resume");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="upload-button">
      <input
        type="file"
        id="resume-upload"
        accept="application/pdf"
        onChange={handleUpload}
        disabled={uploading}
        style={{ display: "none" }}
      />
      <label htmlFor="resume-upload" className={`upload-label ${uploading ? "uploading" : ""}`}>
        {uploading ? "Uploading..." : "Upload Resume"}
      </label>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [showResumeUpload, setShowResumeUpload] = useState(true);

  // Data

  useEffect(() => {
    // Fetch profile photo on load
    fetch("/get-photo")
      .then(res => res.json())
      .then(data => {
        if (data.photo) {
          setProfilePhoto(data.photo);
          setShowUpload(false);
        }
      })
      .catch(console.error);
  }, []);

  const handleUploadSuccess = async () => {
    const response = await fetch("/get-photo");
    const data = await response.json();
    if (data.photo) {
      setProfilePhoto(data.photo);
      setShowUpload(false);
    }
  };

  useEffect(() => {
    // Fetch resume on load
    fetch("/get-resume")
      .then(res => res.json())
      .then(data => {
        if (data.resumeUrl) {
          setResumeUrl(data.resumeUrl);
          setShowResumeUpload(false);
        }
      })
      .catch(console.error);
  }, []);

  const handleResumeUploadSuccess = async () => {
    const response = await fetch("/get-resume");
    const data = await response.json();
    if (data.resumeUrl) {
      setResumeUrl(data.resumeUrl);
      setShowResumeUpload(false);
    }
  };

  const experiences: Experience[] = [
    {
      title: "Student Intern - Cybersecurity",
      company: "Corizo Virtual",
      period: "02/2023 - 04/2023",
      description: [
        "Conducted security assessments and vulnerability scanning",
        "Participated in threat detection and analysis",
        "Learned about cybersecurity best practices and tools",
        "Worked on real-world security scenarios",
      ],
    },
    {
      title: "Python (AI/ML) Intern",
      company: "MSR EDUSOFT",
      period: "11/2022 - 03/2023",
      description: [
        "Developed machine learning models using Python",
        "Worked on AI-based security solutions",
        "Implemented data analysis and visualization",
        "Collaborated on team projects",
      ],
    },
  ];

  const skills: Skill[] = [
    { name: "Python", icon: "🐍", proficiency: 90, description: "Advanced scripting, automation, security tools" },
    { name: "Ethical Hacking", icon: "🔒", proficiency: 85, description: "Penetration testing, security auditing" },
    { name: "Oracle SQL", icon: "💾", proficiency: 80, description: "Database management & security" },
    { name: "HTML", icon: "🌐", proficiency: 95, description: "Modern web development" },
    { name: "CSS", icon: "🎨", proficiency: 90, description: "Responsive design, animations" },
    { name: "JavaScript", icon: "⚡", proficiency: 75, description: "Frontend development" },
    { name: "Cybersecurity", icon: "🛡️", proficiency: 88, description: "Network security, threat analysis" },
    { name: "Java", icon: "☕", proficiency: 80, description: "Object-oriented programming" },
    { name: "C", icon: "🖥️", proficiency: 75, description: "Low-level programming" },
    { name: "MySQL", icon: "🗄️", proficiency: 85, description: "Database management" },
    { name: "Oracle", icon: "🏛️", proficiency: 80, description: "Enterprise database solutions" },
    { name: "Linux", icon: "🐧", proficiency: 85, description: "Operating system and server management" },
    { name: "Windows", icon: "🪟", proficiency: 90, description: "Desktop and server environments" },
    { name: "Macintosh", icon: "🍎", proficiency: 75, description: "Apple ecosystem and development" },
    { name: "Web Development", icon: "🌐", proficiency: 85, description: "Full-stack web development" },
  ];

  const education: Education[] = [
    {
      degree: "Master of Computer Applications",
      institution: "Dayananda Sagar Acedemy of Technology and Management",
      period: "2023 - 2025",
      description:
        "Specialized in computer applications and done many projects, learned many skills, earned Certifications ",
    },
    {
      degree: "B.Com (Computer Applications)",
      institution: "LRG Naidu Jr College",
      period: "2020 - 2023",
      description: "Specialized in computer applications and business studies and passed out with 66.89%",
    },
    {
      degree: "Intermediate",
      institution: "LRG Naidu Jr College",
      period: "2018 - 2020",
      description: "Specialized in Civics, Economics and Commerce with CGPA of 7.40",
    },
    {
      degree: "SSC",
      institution: "Mother EM High School",
      period: "2017 - 2018",
      description: "Compleated my 10th standerd with CGPA OF 8.5.",
    },
  ];

  const certifications: Certification[] = [
    { title: "CompTIA Security+", organization: "Cybrary", icon: "🛡️" },
    { title: "Cybersecurity Analyst", organization: "IBM", icon: "🔐" },
    { title: "Full Stack Java", organization: "Capgemini (TNSIF)", icon: "☕" },
    { title: "Microsoft Technology Associate", organization: "Microsoft", icon: "🏆" },
    { title: "Ethical Hacking Essentials", organization: "CodeRed", icon: "🔐" },
    { title: "Python (AI/ML)", organization: "MSR EDUSOFT PVT.LTD", icon: "🐍" },
    { title: "CyberSecurity Essentials", organization: "Cisco", icon: "🛡️" },
    { title: "CyberSecurity Internship", organization: "PaloAlto", icon: "🔒" },
    { title: "Introduction to SQL", organization: "Simplilearn", icon: "💾" },
    { title: "Oracle", organization: "Success Software Academy", icon: "📊" },
  ];

  const languages: Language[] = [
    { name: "Telugu", level: "Native", proficiency: 100 },
    { name: "Kannada", level: "Native", proficiency: 100 },
    { name: "English", level: "Proficient", proficiency: 90 },
    { name: "Hindi", level: "Advanced", proficiency: 85 },
  ];

  const handleSubmit = async (e: React.FormEvent, deviceInfo: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, deviceInfo }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Failed to send message"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <ScrollToTop />

      <button
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? "✕" : "☰"}
      </button>

      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "🌞" : "🌙"}
      </button>

      <header className={isMenuOpen ? "menu-open" : ""}>
        <div className="container">
          <div className="header-content">
            <h1 className="centered-name">K S Sreehari Sharma</h1>
          </div>
          <Navigation
            activeSection={activeSection}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      </header>

      <main>
        <section id="about">
          <div className="container">
            <div className="profile-section">
              <div className="profile-container">
                <img
                  src={profilePhoto || "https://via.placeholder.com/200"}
                  alt="K S Sreehari Sharma"
                  className="profile-photo"
                  loading="lazy"
                  width="200"
                  height="200"
                />
                {showUpload && <ProfilePhotoUpload onUploadSuccess={handleUploadSuccess} />}
              </div>
              <div className="about-content">
                <h2>About Me</h2>
                <p>
                  Hello! I am K S Sreehari Sharma, a passionate cybersecurity analyst and certified ethical hacker. I
                  have a strong background in computer applications and a keen interest in ethical hacking and
                  cybersecurity. I am always eager to learn new technologies and take on challenging projects.
                </p>
                <div className="quick-info">
                  <div>📍 Bangalore, India</div>
                  <div>💼 Open to Work</div>
                  <div>🎓 Master of Computer Applications</div>
                  <div>🌐 Multilingual Professional</div>
                  <div>📧 sreeharisharma087@gmail.com</div>
                  <div>📱 6361619336</div>
                </div>
                {showResumeUpload && <ResumeUpload onUploadSuccess={handleResumeUploadSuccess} />}
                {resumeUrl && (
                  <a href={resumeUrl} className="resume-download-btn" download>
                    Download Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="experience">
          <div className="container">
            <h2>Professional Experience</h2>
            <div className="timeline">
              {experiences.map((exp, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-date">{exp.period}</div>
                  <div className="timeline-content">
                    <h3>{exp.title}</h3>
                    <h4>{exp.company}</h4>
                    <ul>
                      {exp.description.map((desc, i) => <li key={i}>{desc}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="skills">
          <div className="container">
            <h2>Skills & Expertise</h2>
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <div key={index} className="skill-card">
                  <span className="skill-icon">{skill.icon}</span>
                  <h3>{skill.name}</h3>
                  <p>{skill.description}</p>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${skill.proficiency}%` }}
                    >
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="education">
          <div className="container">
            <h2>Education</h2>
            <div className="education-grid">
              {education.map((edu, index) => (
                <div key={index} className="education-card">
                  <h3>{edu.degree}</h3>
                  <h4>{edu.institution}</h4>
                  <p className="period">{edu.period}</p>
                  {edu.description && <p>{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="certifications">
          <div className="container">
            <h2>Certifications</h2>
            <div className="certifications-grid">
              {certifications.map((cert, index) => (
                <div key={index} className="certification-card">
                  <span className="cert-icon">{cert.icon}</span>
                  <h3>{cert.title}</h3>
                  <p>{cert.organization}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="languages">
          <div className="container">
            <h2>Languages</h2>
            <div className="languages-grid">
              {languages.map((language, index) => (
                <div key={index} className="language-card">
                  <h3>{language.name}</h3>
                  <p>{language.level}</p>
                  <div className="language-progress">
                    <div
                      className="language-bar"
                      style={{ width: `${language.proficiency}%` }}
                    >
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects">
          <div className="container">
            <h2>Projects</h2>
            <div className="projects-grid">
              <div className="project-card">
                <h3>PersonalVault</h3>
                <p>A secure application used to store personal and sensitive information.</p>
              </div>
              <div className="project-card">
                <h3>MAYA AI Assistant</h3>
                <p>An AI assistant developed using Python to help with mini tasks and research.</p>
              </div>
              <div className="project-card">
                <h3>Portfolio Website</h3>
                <p>
                  A personal portfolio website created using HTML, CSS, and JS, integrated with a Telegram bot for data
                  collection.
                </p>
              </div>
              <div className="project-card">
                <h3>AiCyberScan Tool</h3>
                <p>An innovative cybersecurity tool that won 1st place in the RMDT (Research) competition.</p>
              </div>
              <div className="project-card">
                <h3>Telegram Chatbot</h3>
                <p>A chatbot developed to explain tasks and provide information using the Gemini API.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="extra-curricular">
          <div className="container">
            <h2>Extra-Curricular Activities</h2>
            <ul className="activities-list">
              <li>Main Coordinator of Inter-College Technical Fest, DSATM.</li>
              <li>Worked as a freelancer in Web development.</li>
              <li>
                Founder of SkillSculptor, an online course platform.
                <a
                  href="https://sreeharisharma.wixsite.com/skillsculptor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-button"
                >
                  Visit
                </a>
              </li>
            </ul>
          </div>
        </section>

        <section id="hobbies">
          <div className="container">
            <h2>Hobbies</h2>
            <ul className="hobbies-list">
              <li>Staying up to date with AI tech</li>
              <li>Traveling</li>
              <li>Reading Books</li>
              <li>Learning Vedas</li>
            </ul>
          </div>
        </section>

        <section id="contact">
          <div className="container">
            <h2>Contact Me</h2>
            <p className="contact-intro">Feel free to reach out for collaborations or just a friendly chat!</p>
            <ContactForm
              loading={loading}
              handleSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <p>K S Sreehari Sharma © {new Date().getFullYear()}</p>
              <div className="social-links">
                <a
                  href="https://linkedin.com/in/k-s-sree-hari-sharma-08a766213"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://github.com/Sharma12321" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://t.me/yourusername" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-telegram"></i>
                </a>
                <a href="https://twitter.com/yourprofile" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="mailto:sreeharisharma087@gmail.com">
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function client() {
  createRoot(document.getElementById("root")).render(<App />);
}
if (typeof document !== "undefined") { client(); }

export default async function server(req: Request): Promise<Response> {
  const { sqlite } = await import("https://esm.town/v/stevekrouse/sqlite");
  const KEY = new URL(import.meta.url).pathname.split("/").at(-1);
  const SCHEMA_VERSION = 1;

  // Create photos table if it doesn't exist
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_photos_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photo TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_resume_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  if (req.method === "POST" && new URL(req.url).pathname === "/upload-photo") {
    try {
      const { photo } = await req.json();

      // Store the photo
      await sqlite.execute(
        `INSERT INTO ${KEY}_photos_${SCHEMA_VERSION} (photo) VALUES (?)`,
        [photo],
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Upload error:", error);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "GET" && new URL(req.url).pathname === "/get-photo") {
    try {
      const result = await sqlite.execute(
        `SELECT photo FROM ${KEY}_photos_${SCHEMA_VERSION} ORDER BY created_at DESC LIMIT 1`,
      );

      return new Response(
        JSON.stringify({ photo: result.rows[0]?.photo || null }),
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Fetch photo error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch photo" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST" && new URL(req.url).pathname === "/upload-resume") {
    try {
      const { resume } = await req.json();

      // Store the resume
      await sqlite.execute(
        `INSERT INTO ${KEY}_resume_${SCHEMA_VERSION} (resume) VALUES (?)`,
        [resume],
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "GET" && new URL(req.url).pathname === "/get-resume") {
    try {
      const result = await sqlite.execute(
        `SELECT resume FROM ${KEY}_resume_${SCHEMA_VERSION} ORDER BY created_at DESC LIMIT 1`,
      );

      const resumeData = result.rows[0]?.resume;
      if (resumeData) {
        const resumeUrl = `data:application/pdf;base64,${resumeData.split(",")[1]}`;
        return new Response(JSON.stringify({ resumeUrl }), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ resumeUrl: null }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("Fetch resume error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch resume" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // export default async function server(req: Request): Promise<Response> {
  // Basic headers that should be included in all responses
  const baseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "text/html; charset=utf-8",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: baseHeaders,
    });
  }

  // Handle form submissions
  if (req.method === "POST" && new URL(req.url).pathname === "/submit") {
    try {
      const data = await req.json();

      // Validate form data
      if (!data.name || !data.email || !data.phone || !data.message || !data.deviceInfo) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: {
              ...baseHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Get location information based on IP
      let locationInfo;
      try {
        const locationResponse = await fetch(`http://ip-api.com/json/${data.deviceInfo.ip}`);
        locationInfo = await locationResponse.json();
      } catch (error) {
        console.error("Error fetching location info:", error);
        locationInfo = {};
      }

      // Get security information (simplified version)
      const securityInfo = await getSecurityInfo(data.deviceInfo.ip);

      // Format timestamp with timezone
      const timestamp = new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: locationInfo.timezone || "UTC",
      }).format(new Date());

      // Format message for Telegram
      const message = `
🚨 <b>New Contact Form Submission</b>

👤 <b>Contact Information</b>
• Name: ${escapeHtml(data.name)}
• Email: ${escapeHtml(data.email)}
• Phone: ${escapeHtml(data.phone)}

💬 <b>Message Content</b>
${escapeHtml(data.message)}

📱 <b>Device Details</b>
• Browser: ${escapeHtml(data.deviceInfo.browserName || "Unknown")}
• Platform: ${escapeHtml(data.deviceInfo.platform)}
• Screen Resolution: ${escapeHtml(data.deviceInfo.screenResolution || "N/A")}
• Language: ${escapeHtml(data.deviceInfo.language)}
• Battery Level: ${escapeHtml(data.deviceInfo.batteryLevel || "N/A")}
• Network Type: ${escapeHtml(data.deviceInfo.networkType || "N/A")}

📍 <b>Location Information</b>
• City: ${escapeHtml(locationInfo.city || "Unknown")}
• Region: ${escapeHtml(locationInfo.regionName || "Unknown")}
• Country: ${escapeHtml(locationInfo.country || "Unknown")}
• ISP: ${escapeHtml(locationInfo.isp || "Unknown")}
• Organization: ${escapeHtml(locationInfo.org || "Unknown")}

🔒 <b>Security Information</b>
• IP Address: ${escapeHtml(data.deviceInfo.ip)}
• VPN/Proxy Detection: ${securityInfo.vpn ? "⚠️ Detected" : "✅ Not Detected"}
• Threat Score: ${securityInfo.threatScore}/100
• Country: ${escapeHtml(securityInfo.country)}
• Region: ${escapeHtml(securityInfo.region)}
• City: ${escapeHtml(securityInfo.city)}
• ISP: ${escapeHtml(securityInfo.isp)}

📍 <b>Coordinates</b>
• Latitude: ${escapeHtml(String(data.deviceInfo.latitude || "Not provided"))}
• Longitude: ${escapeHtml(String(data.deviceInfo.longitude || "Not provided"))}

⏰ <b>Submission Details</b>
• Timestamp: ${escapeHtml(timestamp)}
• Timezone: ${escapeHtml(locationInfo.timezone || "UTC")}
`;

      function escapeHtml(text: string | undefined | null): string {
        if (text === undefined || text === null) {
          return "";
        }
        const htmlEntities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#39;",
        };
        return text.toString().replace(/[&<>"']/g, char => htmlEntities[char]);
      }

      // Send to Telegram
      let telegramResponse;
      try {
        telegramResponse = await fetch(
          `https://api.telegram.org/botTELEGRAM_BOT_TOKEN/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: "5269480673",
              text: message,
              parse_mode: "HTML",
            }),
          },
        );

        if (!telegramResponse.ok) {
          const errorData = await telegramResponse.json();
          console.error("Telegram API error:", errorData);
          throw new Error(`Telegram API error: ${errorData.description || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error sending Telegram message:", error);
        throw new Error("Failed to send Telegram message");
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            ...baseHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Form submission error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error", details: error.message }),
        {
          status: 500,
          headers: {
            ...baseHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
  }

  // Add this function to get security information (you may need to implement or use a service for this)
  async function getSecurityInfo(ip: string) {
    try {
      // Get IP info from ipapi.co
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      // Check if the IP is from a known VPN or hosting provider
      const isVpnOrProxy = data.org?.toLowerCase().includes("vpn")
        || data.org?.toLowerCase().includes("proxy")
        || data.hosting === true;

      return {
        vpn: isVpnOrProxy,
        proxy: isVpnOrProxy,
        threatScore: isVpnOrProxy ? 50 : 0, // Assign a higher threat score if VPN/proxy is detected
        country: data.country_name,
        region: data.region,
        city: data.city,
        isp: data.org,
      };
    } catch (error) {
      console.error("Error fetching security info:", error);
      return {
        vpn: false,
        proxy: false,
        threatScore: 0,
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        isp: "Unknown",
      };
    }
  }

  // Serve the main HTML page
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>K S Sreehari Sharma - Portfolio</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="description" content="Portfolio of K S Sreehari Sharma - Cybersecurity Analyst & Ethical Hacker">
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔒</text></svg>">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
          <style>
          ${css}
          .upload-button {
            margin-top: 1rem;
            text-align: center;
          }
          
          .upload-label {
            background: var(--primary-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
            display: inline-block;
          }
          
          .upload-label:hover {
            background: #43a047;
          }
          
          .upload-label.uploading {
            background: #666;
            cursor: not-allowed;
          }
          
          .profile-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
        </style>
        </head>
        <body>
          <div id="root"></div>
          <script src="https://esm.town/v/std/catch"></script>
          <script type="module" src="${import.meta.url}"></script>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        ...baseHeaders,
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Content-Type": "text/html",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: baseHeaders,
    });
  }
}

const css = `
/* CSS Variables */
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2196F3;
  --accent-color: #FFC107;
  --success-color: #4CAF50;
  --error-color: #f44336;
  --background-light: #ffffff;
  --background-dark: #1a1a1a;
  --text-light: #333333;
  --text-dark: #ffffff;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--text-light);
  background: var(--background-light);
  transition: background-color var(--transition-speed), color var(--transition-speed);
}

.dark-mode {
  background: var(--background-dark);
  color: var(--text-dark);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Typography */
h1, h2, h3, h4 {
  line-height: 1.2;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
}

h2 {
  font-size: 2rem;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 2rem;
}

h3 {
  font-size: 1.5rem;
}

/* Header & Navigation */
header {
  background: #333;
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
}

.centered-name {
  text-align: center;
  margin: 0;
  font-size: 2rem;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

nav {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color var(--transition-speed);
}

nav a:hover {
  background: rgba(255,255,255,0.1);
}

nav a.active {
  background: var(--primary-color);
}

/* Buttons */
button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform var(--transition-speed), background-color var(--transition-speed);
}

button:hover {
  transform: translateY(-2px);
}

.resume-download-btn {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s, transform 0.3s;
  }

  .resume-download-btn:hover {
    background-color: #43a047;
    transform: translateY(-2px);
  }

  .dark-mode .resume-download-btn {
    background-color: #43a047;
  }

.dark-mode-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--primary-color);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  opacity: 0.8;
  transition: opacity var(--transition-speed), transform var(--transition-speed);
  z-index: 1000;
}

.scroll-to-top:hover {
  opacity: 1;
  transform: translateY(-3px);
}

/* Profile Section */
.profile-section {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin: 2rem 0;
  animation: fadeIn 1s ease-out;
}

.profile-photo {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-color);
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  background-color: #f5f5f5; /* Fallback color while loading */
}

.profile-photo:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.dark-mode .profile-photo {
  border-color: var(--primary-color);
  background-color: #333; /* Dark mode fallback color */
}

.quick-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

/* Skills Section */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.skill-card {
  background: var(--background-light);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-speed);
  animation: fadeIn 0.6s ease-out;
}

.dark-mode .skill-card {
  background: #333;
}

.skill-card:hover {
  transform: translateY(-5px);
}

.skill-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}

.progress-bar {
  background: #ddd;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress {
  height: 100%;
  background: var(--primary-color);
  transition: width 1s ease-out;
}

/* Experience Timeline */
.timeline {
  position: relative;
  max-width: 800px;
  margin: 2rem auto;
  padding: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: var(--primary-color);
}

.timeline-item {
  margin-bottom: 40px;
  position: relative;
  width: 50%;
  padding: 20px;
  animation: slideIn 0.6s ease-out;
}

.timeline-item:nth-child(odd) {
  left: 0;
  padding-right: 40px;
}

.timeline-item:nth-child(even) {
  left: 50%;
  padding-left: 40px;
}

.timeline-content {
  background: var(--background-light);
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

.dark-mode .timeline-content {
  background: #333;
}

/* Education & Certification Cards */
.education-grid,
.certifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.education-card,
.certification-card {
  background: var(--background-light);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-speed);
  animation: fadeIn 0.6s ease-out;
}

.dark-mode .education-card,
.dark-mode .certification-card {
  background: #333;
}

.education-card:hover,
.certification-card:hover {
  transform: translateY(-5px);
}

/* Projects Section */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.project-card {
  background: var(--background-light);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-speed);
  animation: fadeIn 0.6s ease-out;
}

.dark-mode .project-card {
  background: #333;
}

.project-card:hover {
  transform: translateY(-5px);
}

/* Extra-Curricular Activities */
.activities-list {
  list-style-type: none;
  padding: 0;
}

.activities-list li {
  background: var(--background-light);
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-speed);
}

.dark-mode .activities-list li {
  background: #333;
}

.activities-list li:hover {
  transform: translateY(-3px);
}

/* Hobbies Section */
.hobbies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  list-style-type: none;
  padding: 0;
}

.hobbies-list li {
  background: var(--background-light);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-speed);
}

.dark-mode .hobbies-list li {
  background: #333;
}

.hobbies-list li:hover {
  transform: translateY(-3px);
}

.visit-button {
  display: inline-block;
  margin-left: 10px;
  padding: 2px 8px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.8em;
  transition: background-color 0.3s, transform 0.3s;
}

.visit-button:hover {
  background-color: #43a047;
  transform: translateY(-2px);
}

.dark-mode .visit-button {
  background-color: #43a047;
  color: white;
}

/* Contact Form */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 2rem auto;
  animation: fadeIn 0.6s ease-out;
}

input,
textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
}

.dark-mode input,
.dark-mode textarea {
  background: #333;
  color: white;
  border-color: #444;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

textarea {
  min-height: 150px;
  resize: vertical;
}

/* Footer */
footer {
  background: #333;
  color: white;
  padding: 2rem 0;
  margin-top: 4rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color var(--transition-speed);
}

.social-links a:hover {
  background: rgba(255,255,255,0.1);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Loading Animation */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Accessibility */
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1em;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
}

.skip-to-content:focus {
  left: 50%;
  transform: translateX(-50%);
}

/* Mobile Menu */
.menu-toggle {
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .header-content {
    padding: 0.5rem 0;
  }

  .centered-name {
    font-size: 1.5rem;
  }

  header nav {
    display: none;
  }

  header.menu-open nav {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    top: 60px;
    right: 0;
    background: var(--background-light);
    padding: 60px 20px 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .dark-mode header.menu-open nav {
    background: var(--background-dark);
  }

  header.menu-open nav a {
    color: var(--text-light);
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }

  .dark-mode header.menu-open nav a {
    color: var(--text-dark);
    border-bottom-color: #444;
  }

  .profile-section {
    flex-direction: column;
    text-align: center;
  }

  .timeline::before {
    left: 0;
  }

  .timeline-item {
    width: 100%;
    padding-left: 30px;
  }

  .timeline-item:nth-child(odd),
  .timeline-item:nth-child(even) {
    left: 0;
    padding: 0 0 0 30px;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }
}

/* Print Styles */
@media print {
  .menu-toggle,
  .dark-mode-toggle,
  .scroll-to-top,
  .contact-form,
  footer {
    display: none !important;
  }

  body {
    color: black !important;
    background: white !important;
  }

  section {
    page-break-inside: avoid;
  }

  .container {
    width: 100% !important;
    max-width: none !important;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #43a047;
}

.dark-mode ::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.social-links {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.social-links a {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, background-color 0.3s;
}

.social-links a:hover {
  transform: translateY(-3px);
  background: rgba(255,255,255,0.1);
}

.social-links .fa-linkedin:hover {
  color: #0077b5;
}

.social-links .fa-github:hover {
  color: #333;
}

.social-links .fa-telegram:hover {
  color: #0088cc;
}

.social-links .fa-twitter:hover {
  color: #1da1f2;
}

.social-links .fa-instagram:hover {
  color: #e4405f;
}

.social-links .fa-envelope:hover {
  color: #ea4335;
} "Content-Type": "text/html; charset=utf-8",
`;
