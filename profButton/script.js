let states = Array(18).fill(0); //18 total skills

function updateProfBox(i) {
  let prof = document.querySelectorAll("div.skillprofbox div");

  states[i] = (states[i] + 1) % 4;
  prof[i].className = "state" + states[i];

  updateSkills();
}
