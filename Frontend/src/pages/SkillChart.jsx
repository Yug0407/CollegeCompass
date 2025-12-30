import { useEffect, useState } from "react";
import '../styles/skillChart.css';
import axios from "axios";
import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);


export default function SkillChart() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [skills, setSkills] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);


  // Load chart
  useEffect(() => {
    axios
      .post("http://localhost:5000/api/user/get-skill-chart", {
        email: user.email
      })
      .then(res => setSkills(res.data));
  }, []);

  if (skills.length === 0) return <h2>No chart data found 😔</h2>;

    // Plugin for external labels
const externalLabels = {
  id: "externalLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const centerX = chart.scales.r.xCenter;
    const centerY = chart.scales.r.yCenter;

    meta.data.forEach((arc, i) => {
      const angle = (arc.startAngle + arc.endAngle) / 2;
      const radius = arc.outerRadius;

      const labelX = centerX + (radius + 35) * Math.cos(angle);
      const labelY = centerY + (radius + 35) * Math.sin(angle);

      ctx.save();
      ctx.font = "14px Poppins";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(chart.data.labels[i], labelX, labelY);
      ctx.restore();
    });
  }
};


  // COLOR assignment
const getColor = (level) => {
  if(level <= 3) return "#F6E05E";     // Yellow
  if(level <= 6) return "#34D399";     // Green
  return "#111827";                    // Black
};

// Chart Data
const data = {
  labels: skills.map(s => s.skillName),
  datasets: [
    {
      data: skills.map(s => s.level),
      backgroundColor: skills.map(s => getColor(s.level)),
      borderWidth: 2,
      borderColor: "white",
      hoverOffset: 15
    }
  ]
};
const options = {
  layout: {
    padding: 40
  },
  animation: {
    duration: 1200,
    easing: "easeOutElastic"
  },
  scales: {
    r: {
      ticks: { display: false },
      grid: { color: "#ddd" },
      angleLines: { color: "#ddd" },
      suggestedMax: 9
    }
  },
  plugins: {
    legend: { display: false },
  }
};




  // Save Updated Chart
  const save = async () => {
    await axios.post(
      "http://localhost:5000/api/user/save-skill-chart",
      { email: user.email, ratings: skills }
    );
    alert("Skill Chart Updated 🎉");
  };



  

  return (
    <div className="chart-page">
      <div className="chart-box">
        <h1>Technical Skill Chart</h1>
        <p>Click skill to edit</p>

      <PolarArea 
        data={data} 
        options={options} 
        plugins={[externalLabels]} 
        redraw
        />


        {/* ===== Skill Editable List ===== */}
        <div className="skill-edit-list">
          {skills.map((s, i) => (
            <div
              key={i}
              className="skill-item"
              onClick={() => {
                setCurrentSkill({ ...s, index: i });
                setShowEditor(true);
              }}
            >
              <span className="skill-name">{s.skillName}</span>
              <span className="skill-level">{s.level}/9</span>
            </div>
          ))}
        </div>

        <button className="save-chart-btn" onClick={save}>
          Save Updated Chart
        </button>
      </div>

      {/* ===== EDITOR POPUP ===== */}
      {showEditor && (
        <div className="edit-popup">
          <div className="popup-box">
            <h2>Edit Level</h2>
            <h3>{currentSkill.skillName}</h3>

            <input
              type="range"
              min="1"
              max="9"
              value={currentSkill.level}
              onChange={e =>
                setCurrentSkill({ ...currentSkill, level: Number(e.target.value) })
              }
            />

            <p className="edit-value">{currentSkill.level} / 9</p>

            <div className="popup-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </button>

              <button
                className="update-btn"
                onClick={() => {
                  const copy = [...skills];
                  copy[currentSkill.index].level = currentSkill.level;
                  setSkills(copy);
                  setShowEditor(false);
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
