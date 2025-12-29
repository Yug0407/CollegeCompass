import "../styles/profile.css";
import axios from "axios";
import { useState, useEffect , useRef } from "react";
import { useNavigate } from "react-router-dom";

// Placeholder for a user icon if none is available
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="user-icon-svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// const masterSkills = [
//   "C Programming", "C++ Programming", "C# Programming", "CSS", "Cloud Computing",
//   "Cybersecurity", "Data Science", "Dart", "Docker", "Django", "Express.js",
//   "Firebase", "Flutter", "Go Language", "Google Cloud Platform", "HTML5",
//   "Java", "JavaScript", "Kotlin", "Machine Learning", "MongoDB", "MySQL",
//   "Node.js", "Next.js", "Python", "PHP", "React.js", "React Native",
//   "Rust", "SQL", "Swift", "TensorFlow", "TypeScript", "UI/UX Design",
//   "Web Development", "Web Design", "Web Scraping"
// ];
const skillTaxonomy = {
  "Web Development": ["React.js", "Node.js", "HTML5", "CSS3", "JavaScript", "TypeScript"],
  "Programming": ["Java", "Python", "C++", "C Programming", "Go Language"],
  "Data & AI": ["Machine Learning", "Data Science", "SQL", "MongoDB", "TensorFlow"],
  "App Dev": ["Flutter", "React Native", "Kotlin", "Swift"]
};

 const branchOptions = [
  "B.Tech Computer Science and Engineering",
  "B.Tech Information Technology",
  "B.Tech Electronics and Communication Engineering",
  "B.Tech Electrical Engineering",
  "B.Tech Mechanical Engineering",
  "B.Tech Civil Engineering",
  "B.Tech Artificial Intelligence and Machine Learning",
  "B.Tech Data Science",
  "B.Tech Chemical Engineering",
  "B.Tech Biotechnology",
  "M.Tech Software Engineering",
  "BCA (Bachelor of Computer Applications)",
  "MCA (Master of Computer Applications)"
];

export default function Profile() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const collegeInputRef = useRef(null);


 

  useEffect(() => {
    if (!user) {
      alert("Login first");
      nav("/");
    }
  }, [user, nav]);

  // Load Google Places Autocomplete
  useEffect(() => {
    // Check if Google Maps is loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      
      // Initialize the modern Autocomplete on the college input
      const autocomplete = new window.google.maps.places.Autocomplete(collegeInputRef.current, {
        componentRestrictions: { country: "IN" }, // Optional: Restrict to India
        fields: ["name", "formatted_address"],
        types: ["university", "school"]
      });

      // When user selects a college
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.name) {
          setData(prev => ({ ...prev, college: place.name }));
        }
      });
    }
  }, []);

  const [data, setData] = useState({
    email: user?.email,
    college: "",
    branch: "",
    cgpa: "",
    skills: []  ,
    interests: "",
    achievements: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [branchSuggestions, setBranchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

//For Branch Autocomplete

  const handleBranchChange = (e) => {
    const value = e.target.value;
    setData({ ...data, branch: value });

    if (value.length > 0) {
      const filtered = branchOptions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); // Show top 5 matches
      setBranchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectBranch = (branch) => {
    setData((prev)=>({ ...prev, branch: branch }));
    setBranchSuggestions([]);
    setShowSuggestions(false);
  };

//**** Start -----  Suggestions For Skills  */

const [skillInput, setSkillInput] = useState("");
const [skillSuggestions, setSkillSuggestions] = useState([]);
const [selectedSkills, setSelectedSkills] = useState([]);

// SYNC: Keep the 'data.skills' state in sync with the tags for the backend
useEffect(() => {
  setData(prev => ({ ...prev, skills: selectedSkills }));
}, [selectedSkills]);

const searchableSkills = Object.entries(skillTaxonomy).flatMap(([category, skills]) =>
  skills.map(skill => ({ name: skill, category: category }))
);

const handleSkillSearch = (e) => {
  const val = e.target.value;
  setSkillInput(val);
  
  if (val.trim() !== "") {
    const filtered = searchableSkills.filter(item => 
      item.name.toLowerCase().includes(val.toLowerCase()) && 
      // Important: compare names because 's' is now an object
      !selectedSkills.some(s => s.name === item.name) 
    ).slice(0, 5);
    setSkillSuggestions(filtered);
  } else {
    setSkillSuggestions([]);
  }
};

const addSkill = (skillObj) => {
  setSelectedSkills([...selectedSkills, skillObj]);
  setSkillInput("");
  setSkillSuggestions([]);
};

const removeSkill = (indexToRemove) => {
  setSelectedSkills(selectedSkills.filter((_, index) => index !== indexToRemove));
};


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/user/get-profile", {
          email: user.email
        });
        if (res.data) {
          setData({
            email: user.email,
            college: res.data.college || "",
            branch: res.data.branch || "",
            cgpa: res.data.cgpa || "",
            skills: res.data.skills || [],
            interests: res.data.interests || "",
            achievements: res.data.achievements || ""
          });
          setSelectedSkills(res.data.skills || []);
        }
      } catch (e) {
        console.log("No profile found yet");
      }
    };
    if(user?.email) fetchProfile();
  }, [user?.email]);

  const save = async () => {
    setMessage("");
    if (!data.college || !data.branch) {
      setMessage("⚠️ College & Branch are required!");
      return;
    if(!branchOptions.includes(data.branch)){
      console.log("Custom Branch detected");
    }
    
    }
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/user/save-profile", data);
      setMessage("Success! Profile updated. 🎉");
      setTimeout(() => nav("/dashboard"), 1500);
    } catch (err) {
      setMessage("❌ Server Error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {/* Left Sidebar - Inspired by the reference */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="avatar-circle-small">
              {user?.email?.charAt(0).toUpperCase() || <UserIcon />}
            </div>
            <div>
              <p className="user-name">{user?.name || user?.email?.split("@")[0]}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active"><a href="/dashboard">Dashboard</a></li>
            <li><a href="/users">Users</a></li>
            <li><a href="/pages">Pages</a></li>
            <li><a href="/media">Media Files</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-tabs">
            <button className="tab active">Users</button>
            <button className="tab">Settings</button>
          </div>
          <button className="add-new-btn">+ Add New User</button>
        </header>

        <div className="content-body">
          {/* Left Card: Profile Picture & Password */}
          <div className="card profile-card-left">
            <div className="profile-image-container">
              <div className="profile-image-placeholder">
                <UserIcon />
              </div>
              <button className="upload-photo-btn">Upload Photo</button>
            </div>
            <div className="password-section">
              <div className="input-group">
                <label>Old Password</label>
                <input type="password" placeholder="........" />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input type="password" placeholder="........" />
              </div>
              <button className="change-password-btn">Change Password</button>
            </div>
          </div>

          {/* Right Card: Profile Information Form */}
          <div className="card profile-card-right">
            <h2 className="section-title">Profile Information</h2>
            {message && (
              <div className={`status-banner ${message.includes("⚠️") ? "warn" : "success"}`}>
                {message}
              </div>
            )}
            <div className="form-grid">
              {/* 1. College (Now Full Width) */}
              <div className="input-group full-width">
                <label>College Name</label>
                <input 
                  ref={collegeInputRef} // Attach the ref here
                  type="text"
                  placeholder="Start typing your college name..."
                  value={data.college}
                  onChange={e => setData({ ...data, college: e.target.value })}
                />
              </div>

              {/* 2. Branch (Now Full Width) */}
              <div className="input-group full-width branch-container">
              <label>Branch / Major</label>
              <input 
                type="text"
                placeholder="e.g. B.Tech Computer Science"
                value={data.branch}
                onChange={handleBranchChange}
                // We keep onBlur to hide the menu when clicking outside, 
                // but the 200ms delay is key
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
              />
              
              {showSuggestions && branchSuggestions.length > 0 && (
                <ul className="custom-autocomplete-dropdown">
                  {branchSuggestions.map((item, index) => ( 
                    <li 
                      key={index} 
                      // FIX: Use onMouseDown so it fires BEFORE the input's onBlur
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents focus loss
                        selectBranch(item);
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 1. CGPA on its own line */}
              <div className="input-group full-width">
                <label>Current CGPA</label>
                <input 
                  type="number" 
                  placeholder="e.g. 8.5"
                  value={data.cgpa}
                  onChange={e => setData({...data, cgpa: e.target.value})}
                />
              </div>

              {/* 2. Skills Tag System on its own line */}
              <div className="input-group full-width skill-tag-container">
                <label>Skills</label>
                <div className="tag-input-wrapper">
                  {selectedSkills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {/* FIX: Use skill.name instead of just skill */}
                      {skill.name} 
                      <button type="button" onClick={() => removeSkill(index)}>&times;</button>
                    </span>
                  ))}
                  <input 
                    type="text"
                    placeholder={selectedSkills.length === 0 ? "Search skills (e.g. Web, C++)" : ""}
                    value={skillInput}
                    onChange={handleSkillSearch}
                    onBlur={() => setTimeout(() => setSkillSuggestions([]), 200)}
                  />
                </div>

                {/* Suggestions Dropdown */}
                <ul className="suggestions-list">
                  {skillSuggestions.map((item, index) => (
                    <li 
                      key={index} 
                      onMouseDown={() => addSkill(item)} // 'item' is the full {name, category} object
                      className="suggestion-item"
                    >
                      {item.name} {/* ONLY show the skill name here */}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ... Interests and Achievements (full-width) ... */}

              <div className="input-group full-width">
                <label>Areas of Interest</label>
                <input 
                  type="text"
                  placeholder="Machine Learning, UI/UX, Cloud Computing..."
                  value={data.interests}
                  onChange={e => setData({ ...data, interests: e.target.value })}
                />
              </div>

              <div className="input-group full-width">
                <label>Achievements & Bio</label>
                <textarea
                  placeholder="Share your hackathons, certifications, or major projects here..."
                  value={data.achievements}
                  onChange={e => setData({ ...data, achievements: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button className={`save-profile-btn ${loading ? "loading" : ""}`} onClick={save} disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}