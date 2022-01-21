//18 total skills
//state 0: no proficiency; state 1: proficiency; state 2: half proficiency; state 3: expertise (double proficiency)

let states = Array(18).fill(0); //default state 0

function updateSkillProfBox(i) {
  let skillprofs = document.querySelectorAll("div.skillprofbox div");

  states[i] = (states[i] + 1) % 4; //cycle to next state
  skillprofs[i].className = "state" + states[i];

  updateSkills();
}
