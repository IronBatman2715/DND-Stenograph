//18 total skills
//state 0: no proficiency; state 1: proficiency; state 2: half proficiency; state 3: expertise (double proficiency)

const states = Array(18).fill(0); //default state 0

function updateSkillProfBox(i) {
  states[i] = (states[i] + 1) % 4; //cycle to next state

  const skillprof = document.querySelectorAll("div.skillprofbox div").item(i);
  skillprof.className = "state" + states[i];

  updateSkills();
}
