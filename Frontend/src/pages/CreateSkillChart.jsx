import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/createSkillChart.css';
export default function CreateSkillChart(){

  const user = JSON.parse(localStorage.getItem("user"));
  const nav = useNavigate();

  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    axios.post("http://localhost:5000/api/user/get-profile",
      { email: user.email }
    ).then(res => {

      const profile = res.data;
      let skillNames = [];

      if (Array.isArray(profile.skills)) {
        skillNames = profile.skills.map(s => s.name);
      }
      else if (typeof profile.skills === "string") {
        skillNames = profile.skills.split(",").map(s => s.trim());
      }

      setSkills(skillNames);

      setRatings(
        skillNames.map(s => ({
          skillName: s,
          level: 5
        }))
      );
    });
  }, []);

  const save = async()=>{
    await axios.post(
      "http://localhost:5000/api/user/save-skill-chart",
      { email:user.email, ratings }
    );

    alert("Skill Chart Created 🎉");
    nav("/skill-chart");
  };

  if(skills.length === 0) return <h2>No Skills Found 😔</h2>;

  return(
    <div className="skill-page">

      <div className="skill-box">

        <h1 className="title">Rate Your Skills</h1>
        <p className="subtitle">Select how confident you feel in each skill</p>

        <div className="skills-list">

          {ratings.map((s,i)=>(
            <div className="skill-card" key={i}>
              
              <div className="skill-title">{s.skillName}</div>

              <div className="level-row">
                {[1,2,3,4,5,6,7,8,9].map(n=>(
                  <span
                    key={n}
                    className={`dot ${n<=s.level ? "active" : ""}`}
                    onClick={()=>{
                      const temp=[...ratings];
                      temp[i].level=n;
                      setRatings(temp);
                    }}
                  ></span>
                ))}
              </div>

              <div className="level-text">
                {s.level <=3 && "Beginner"}
                {s.level >3 && s.level <=6 && "Intermediate"}
                {s.level >6 && "Expert"}
              </div>

            </div>
          ))}

        </div>

        <button className="save-btn" onClick={save}>Save & Generate Chart</button>

      </div>
    </div>
  );
}
