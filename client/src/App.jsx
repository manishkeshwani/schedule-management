import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // for selectable
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from "@mui/material";
import axios from "axios";

const phaseSubjects = {
  phase1: [
    ["Anatomy", "anatomy"],
    ["Physiology", "physiology"],
    ["Biochemistry", "biochemistry"],
    ["Community-Medicine", "communitymedicine"],
    ["Foundation-Course", "foundationcourse"],
    ["ECA", "ecaI"],
  ],
  phase2: [
    ["Community Medicine", "communitymedicine2"],
    ["Pathology", "pathology"],
    ["Microbiology", "microbiology"],
    ["Pharmacology", "pharmacology"],
    ["Forensic Med & TC", "forensicmedandtc1"],
    ["Medicine", "medicine1"],
    ["Surgery", "surgery1"],
    ["Obs & Gyn", "obsandgyn1"],
    ["ECA", "eca2"],
  ],
  phase3_p1: [
    ["Community Medicine", "communitymedicine3"],
    ["Medicine", "medicine2"],
    ["Surgery", "surgery2"],
    ["Paediatrics", "paediatrics"],
    ["Forensic Med & TC", "forensicmedandtc2"],
    ["Orthopaedics", "orthopaedics"],
    ["Ophthalmology", "ophthalmology"],
    ["ENT", "ent"],
    ["Obs & Gyn", "obsandgyn2"],
    ["ECA", "ecaIII"],
  ],
  phase3_p2: [
    ["Psychiatry", "psychiatry"],
    ["Medicine", "medicine3"],
    ["Surgery", "surgery3"],
    ["Dermatology", "dermatology"],
    ["Radiology", "radiology"],
    ["Orthopaedics", "orthopaedics2"],
    ["Paediatrics", "paediatrics2"],
    ["ENT", "ent2"],
    ["Anaesthesiology", "anaesthsiology"],
    ["Ophthalmology", "ophthalmology2"],
    ["Obs & Gyn", "obsandgyn3"],
  ],
};

const App = () => {
  const [selectedPhase, setSelectedPhase] = useState("phase1");
  const [events, setEvents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    teacher: "",
    startTime: "",
    duration: 1,
    repeatWeeks: 1,
  });
  const [modalData, setModalData] = useState({ isOpen: false, start: "" });

  // Fetch teachers from the backend
  useEffect(() => {
    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/teachers/");
            console.log("Teachers API Response:", response.data); 
            if (Array.isArray(response.data)) {
                setTeachers(response.data); // Set array if valid
            } else {
                setTeachers([]); // Fallback to empty array
                console.error("Invalid teachers API response:", response.data);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
            setTeachers([]); // Fallback to empty array
        }
    };
    fetchTeachers();
}, []);



useEffect(() => {
  const fetchSchedules = async () => {
      try {
          const response = await axios.get("http://127.0.0.1:8000/api/schedules/");
          console.log("Schedules API Response:", response.data); // In fetchSchedules
          if (Array.isArray(response.data)) {
              const fetchedEvents = response.data.map((schedule) => ({
                  title: `${schedule.subject} (${schedule.teacher__name})`,
                  start: new Date(schedule.start_time),
                  end: new Date(schedule.end_time),
              }));
              setEvents(fetchedEvents);
          } else {
              setEvents([]); // Fallback to empty array
              console.error("Invalid schedules API response:", response.data);
          }
      } catch (error) {
          console.error("Error fetching schedules:", error);
          setEvents([]); // Fallback to empty array
      }
  };
  fetchSchedules();
}, []);



const handleDateClick = (arg) => {
  try {
      const formattedDate = new Date(arg.dateStr).toISOString().slice(0, 16); // Get "YYYY-MM-DDTHH:mm"
      setModalData({ isOpen: true, start: formattedDate });
      setFormData({ ...formData, startTime: formattedDate });
  } catch (error) {
      console.error("Error formatting date:", error);
  }
};


 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endTime = new Date(new Date(formData.startTime).getTime() + formData.duration * 3600000);

    try {
        const response = await axios.post("http://127.0.0.1:8000/api/schedules/add/", {
            subject: formData.subject,
            teacher: formData.teacher, // Send teacher name
            start_time: formData.startTime,
            end_time: endTime.toISOString(),
            phase: selectedPhase,
        });
        alert(response.data.message);
        setEvents([
            ...events,
            {
                title: `${formData.subject} (${formData.teacher})`,
                start: formData.startTime,
                end: endTime.toISOString(),
            },
        ]);
    } catch (error) {
        console.error("Error saving schedule:", error);
    }

    setFormData({ subject: "", teacher: "", startTime: "", duration: 1, repeatWeeks: 1 });
};



  return (
    <Box p={4} style={{height:"90vh",width:"90vw"}}>
      <Typography variant="h4" mb={2}>
        Phase-Wise Scheduler
      </Typography>

      {/* Phase Selection */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="phase-select-label">Select Phase</InputLabel>
        <Select
          labelId="phase-select-label"
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
        >
          <MenuItem value="phase1">Phase 1</MenuItem>
          <MenuItem value="phase2">Phase 2</MenuItem>
          <MenuItem value="phase3_p1">Phase 3 - Part 1</MenuItem>
          <MenuItem value="phase3_p2">Phase 3 - Part 2</MenuItem>
        </Select>
      </FormControl>

      {/* Calendar */}
      <Box mt={4}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          events={events}
          dateClick={handleDateClick}
          eventColor="#378006"
        />
      </Box>

      {/* Event Modal */}
      {modalData.isOpen && (
        <Box mt={4} p={4} border={1} borderRadius={2} borderColor="grey.300">
          <Typography variant="h5" mb={2}>
            Schedule Event
          </Typography>
          <form onSubmit={handleSubmit}>
            {/* Subject */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="subject-select-label">Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <MenuItem value="">Select Subject</MenuItem>
                {phaseSubjects[selectedPhase].map(([label, value]) => (
                  <MenuItem key={value} value={label}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Teacher */}
            <FormControl fullWidth margin="normal">
            <InputLabel id="teacher-select-label">Teacher</InputLabel>
            <Select
                labelId="teacher-select-label"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
            >
                <MenuItem value="">Select Teacher</MenuItem>
                {Array.isArray(teachers) &&
                    teachers.map((teacher, index) => (
                        <MenuItem key={index} value={teacher}>
                            {teacher}
                        </MenuItem>
                    ))}
            </Select>
        </FormControl>




            {/* Start Time */}
            <TextField
              fullWidth
              margin="normal"
              type="datetime-local"
              label="Start Time"
              InputLabelProps={{ shrink: true }}
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />

            {/* Duration */}
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Duration (hours)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              inputProps={{ min: 1 }}
            />

            {/* Repeat Weeks */}
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Repeat Weeks"
              value={formData.repeatWeeks}
              onChange={(e) => setFormData({ ...formData, repeatWeeks: parseInt(e.target.value) })}
              inputProps={{ min: 1 }}
            />

            <Button variant="contained" color="primary" type="submit" fullWidth>
              Save
            </Button>
          </form>
        </Box>
      )}
    </Box>
  );
};

export default App;






// import React, { useState, useEffect } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction"; // for selectable
// import {
//   Box,
//   Button,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
//   InputLabel,
//   FormControl,
// } from "@mui/material";
// import axios from "axios";

// const App = () => {
//   const [selectedPhase, setSelectedPhase] = useState("phase1");
//   const [events, setEvents] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [formData, setFormData] = useState({
//     subject: "",
//     teacher: "",
//     startTime: "",
//     duration: 1,
//     repeatWeeks: 1,
//   });
//   const [modalData, setModalData] = useState({ isOpen: false, start: "" });

//   // Fetch teachers
//   useEffect(() => {
//     const fetchTeachers = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/api/teachers/");
//         setTeachers(response.data || []);
//       } catch (error) {
//         console.error("Error fetching teachers:", error);
//         setTeachers([]);
//       }
//     };
//     fetchTeachers();
//   }, []);

//   // Fetch schedules
//   useEffect(() => {
//     const fetchSchedules = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/api/schedules/");
//         const fetchedEvents = response.data.map((schedule) => ({
//           title: `${schedule.subject} (${schedule.teacher})`,
//           start: new Date(schedule.start_time),
//           end: new Date(schedule.end_time),
//         }));
//         setEvents(fetchedEvents);
//       } catch (error) {
//         console.error("Error fetching schedules:", error);
//         setEvents([]);
//       }
//     };
//     fetchSchedules();
//   }, []);

//   const handleDateClick = (arg) => {
//     const formattedDate = new Date(arg.dateStr).toISOString().slice(0, 16);
//     setModalData({ isOpen: true, start: formattedDate });
//     setFormData({ ...formData, startTime: formattedDate });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const endTime = new Date(
//       new Date(formData.startTime).getTime() + formData.duration * 3600000
//     );

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/api/schedules/add/", {
//         subject: formData.subject,
//         teacher: formData.teacher,
//         start_time: formData.startTime,
//         end_time: endTime.toISOString(),
//         phase: selectedPhase,
//       });
//       alert(response.data.message);
//       setEvents([
//         ...events,
//         {
//           title: `${formData.subject} (${formData.teacher})`,
//           start: formData.startTime,
//           end: endTime.toISOString(),
//         },
//       ]);
//     } catch (error) {
//       console.error("Error saving schedule:", error);
//     }

//     setFormData({ subject: "", teacher: "", startTime: "", duration: 1, repeatWeeks: 1 });
//   };

//   const styles = {
//     container: {
//       padding: "24px",
//       fontFamily: "Arial, sans-serif",
//       backgroundColor: "#f5f5f5",
//       minHeight: "100vh",
//       minWidth:"90vw"
//     },
//     header: {
//       textAlign: "center",
//       marginBottom: "24px",
//     },
//     formContainer: {
//       backgroundColor: "#ffffff",
//       borderRadius: "8px",
//       padding: "16px",
//       boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//       marginTop: "16px",
//     },
//     button: {
//       marginTop: "16px",
//       padding: "12px",
//       backgroundColor: "#007BFF",
//       color: "#fff",
//       fontWeight: "bold",
//     },
//     calendar: {
//       marginTop: "24px",
//     },
//     formField: {
//       marginBottom: "16px",
//     },
//   };

//   return (
//     <Box style={styles.container}>
//       <Typography variant="h4" style={styles.header}>
//         Phase-Wise Scheduler
//       </Typography>

//       {/* Phase Selection */}
//       <FormControl fullWidth margin="normal">
//         <InputLabel id="phase-select-label">Select Phase</InputLabel>
//         <Select
//           labelId="phase-select-label"
//           value={selectedPhase}
//           onChange={(e) => setSelectedPhase(e.target.value)}
//         >
//           <MenuItem value="phase1">Phase 1</MenuItem>
//           <MenuItem value="phase2">Phase 2</MenuItem>
//           <MenuItem value="phase3_p1">Phase 3 - Part 1</MenuItem>
//           <MenuItem value="phase3_p2">Phase 3 - Part 2</MenuItem>
//         </Select>
//       </FormControl>

//       {/* Calendar */}
//       <Box style={styles.calendar}>
//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           initialView="timeGridWeek"
//           selectable
//           events={events}
//           dateClick={handleDateClick}
//           eventColor="#378006"
//         />
//       </Box>

//       {/* Event Modal */}
//       {modalData.isOpen && (
//         <Box style={styles.formContainer}>
//           <Typography variant="h5" mb={2}>
//             Schedule Event
//           </Typography>
//           <form onSubmit={handleSubmit}>
//             {/* Subject */}
//             <FormControl fullWidth margin="normal" style={styles.formField}>
//               <InputLabel id="subject-select-label">Subject</InputLabel>
//               <Select
//                 labelId="subject-select-label"
//                 value={formData.subject}
//                 onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
//               >
//                 <MenuItem value="">Select Subject</MenuItem>
//                 {phaseSubjects[selectedPhase].map(([label]) => (
//                   <MenuItem key={label} value={label}>
//                     {label}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             {/* Teacher */}
//             <FormControl fullWidth margin="normal" style={styles.formField}>
//               <InputLabel id="teacher-select-label">Teacher</InputLabel>
//               <Select
//                 labelId="teacher-select-label"
//                 value={formData.teacher}
//                 onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
//               >
//                 <MenuItem value="">Select Teacher</MenuItem>
//                 {teachers.map((teacher, index) => (
//                   <MenuItem key={index} value={teacher}>
//                     {teacher}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             {/* Start Time */}
//             <TextField
//               fullWidth
//               margin="normal"
//               type="datetime-local"
//               label="Start Time"
//               InputLabelProps={{ shrink: true }}
//               value={formData.startTime}
//               onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
//               style={styles.formField}
//             />

//             {/* Duration */}
//             <TextField
//               fullWidth
//               margin="normal"
//               type="number"
//               label="Duration (hours)"
//               value={formData.duration}
//               onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
//               inputProps={{ min: 1 }}
//               style={styles.formField}
//             />

//             {/* Repeat Weeks */}
//             <TextField
//               fullWidth
//               margin="normal"
//               type="number"
//               label="Repeat Weeks"
//               value={formData.repeatWeeks}
//               onChange={(e) => setFormData({ ...formData, repeatWeeks: parseInt(e.target.value) })}
//               inputProps={{ min: 1 }}
//               style={styles.formField}
//             />

//             <Button
//               variant="contained"
//               type="submit"
//               fullWidth
//               style={styles.button}
//             >
//               Save
//             </Button>
//           </form>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default App;
