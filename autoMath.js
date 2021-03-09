function clearData() {
  if (confirm("Are you sure you want to clear the entire sheet?") == true) {
    document.getElementById("charsheet").reset();
  }
}

function updateStats() {
  let stats = document.getElementsByClassName("stat");
  let statmods = document.getElementsByClassName("statmod");
  for (let i = 0; i < 6; i++) {
    let stat = parseInt(stats[i].value);
    if (Number.isInteger(stat) && 0 < stat && stat < 21) {
      //Valid input
      let calcMod = Math.floor((stat - 10) / 2);
      if (0 <= calcMod) {
        statmods[i].value = "+" + calcMod.toString();
      } else {
        statmods[i].value = calcMod.toString();
      }
      if (i == 1) {
        let initiative = document.getElementsByClassName("initiativevalue");
        initiative[0].value = statmods[1].value;
      }
    } else {
      //Invalid input
      statmods[i].value = "";
      if (i == 1) {
        let initiative = document.getElementsByClassName("initiativevalue");
        initiative[0].value = "";
      }
    }
  }
  updateSaves();
  updateSkills();
}

function updateSaves() {
  let statmods = document.getElementsByClassName("statmod");
  let profbonus = document.getElementsByClassName("profbonus");
  let saves = document.getElementsByClassName("save");
  let saveprofs = document.getElementsByClassName("saveprof");
  for (let i = 0; i < 6; i++) {
    let statmod = parseInt(statmods[i].value);
    let saveprof = saveprofs[i].checked;

    if ((!statmod && 0 !== statmod) || !profbonus[0].value) {
      saves[i].value = "";
    } else {
      let save;
      if (saveprof) {
        save = parseInt(profbonus[0].value) + statmod;
      } else {
        save = statmod;
      }

      if (!save && save !== 0) {
        saves[i].value = "";
      } else if (0 <= save) {
        saves[i].value = "+" + save.toString();
      } else {
        saves[i].value = save.toString();
      }
    }
  }
}

function updateSkills() {
  let statmods = document.getElementsByClassName("statmod");
  let profbonus = document.getElementsByClassName("profbonus");
  let skills = document.getElementsByClassName("skill");
  let skillprofs = document.getElementsByClassName("skillprof");
  let passiveperception = document.getElementsByClassName("passiveperception");
  for (let i = 0; i < 18; i++) {
    let skillprof = skillprofs[i].checked;
    if (!profbonus[0].value) {
      //Invalid proficiency bonus
      skills[i].value = "";
    } else {
      let bonus;
      let skill;
      let statmod;
      if (skillprof) {
        bonus = parseInt(profbonus[0].value);
      } else {
        bonus = 0;
      }
      switch (i) {
        case 3: //str
          statmod = parseInt(statmods[0].value);
          if (!statmod && 0 !== statmod) {
            //Invalid stat modifier
            skill = "";
          } else {
            skill = bonus + statmod;
          }
          break;
        case 0: //dex
        case 15:
        case 16:
          statmod = parseInt(statmods[1].value);
          if (!statmod && 0 !== statmod) {
            //Invalid stat modifier
            skill = "";
          } else {
            skill = bonus + statmod;
          }
          break;
        case 1: //wis
        case 6:
        case 9:
        case 11:
        case 17:
          statmod = parseInt(statmods[3].value);
          if (!statmod && 0 !== statmod) {
            //Invalid stat modifier
            skill = "";
          } else {
            skill = bonus + statmod;
          }
          break;
        case 2: //int
        case 5:
        case 8:
        case 10:
        case 14:
          statmod = parseInt(statmods[4].value);
          if (!statmod && 0 !== statmod) {
            //Invalid stat modifier
            skill = "";
          } else {
            skill = bonus + statmod;
          }
          break;
        case 4: //cha
        case 7:
        case 12:
        case 13:
          statmod = parseInt(statmods[5].value);
          if (!statmod && 0 !== statmod) {
            //Invalid stat modifier
            skill = "";
          } else {
            skill = bonus + statmod;
          }
          break;
      }
      if (!skill && skill !== 0) {
        skills[i].value = "";
      } else if (0 <= skill) {
        skills[i].value = "+" + skill.toString();
      } else {
        skills[i].value = skill.toString();
      }

      //Passive Perception
      if (i == 11) {
        if (!statmod && 0 !== statmod) {
          passiveperception[0].value = "";
        } else {
          let passiveperceptionInt = 10 + skill;
          passiveperception[0].value = passiveperceptionInt.toString();
        }
      }
    }
  }
}

function level2ProfBonus() {
  let invalid = false;
  let profbonus = document.getElementsByClassName("profbonus");
  let classlevel = document.getElementsByClassName("classlevel");
  let classlevelStr = classlevel[0].value;
  let level;
  if (!!classlevelStr && classlevelStr.includes(" ")) {
    level = classlevelStr.substring(
      classlevelStr.indexOf(" ") + 1,
      classlevelStr.length
    );
  } else {
    invalid = true;
  }

  if (!level) {
    invalid = true;
  }

  if (invalid) {
    //something is null
    profbonus[0].value = "";
  }

  if (1 <= level && level <= 4) {
    profbonus[0].value = "+2";
  } else if (5 <= level && level <= 8) {
    profbonus[0].value = "+3";
  } else if (9 <= level && level <= 12) {
    profbonus[0].value = "+4";
  } else if (13 <= level && level <= 16) {
    profbonus[0].value = "+5";
  } else if (level <= 20) {
    profbonus[0].value = "+6";
  } else if (20 <= level || level <= 0) {
    profbonus[0].value = "";
  }

  updateSaves();
  updateSkills();
}

function deathsaves() {
  let deathsuccesses = document.getElementsByClassName("deathsuccess");
  if (!deathsuccesses[0].checked) {
    if (deathsuccesses[1].checked) {
      deathsuccesses[0].checked = true;
      deathsuccesses[1].checked = false;
    } else if (deathsuccesses[2].checked) {
      deathsuccesses[0].checked = true;
      deathsuccesses[2].checked = false;
    }
  } else if (!deathsuccesses[1].checked && deathsuccesses[2].checked) {
    deathsuccesses[1].checked = true;
    deathsuccesses[2].checked = false;
  }

  let deathfails = document.getElementsByClassName("deathfail");
  if (!deathfails[0].checked) {
    if (deathfails[1].checked) {
      deathfails[0].checked = true;
      deathfails[1].checked = false;
    } else if (deathfails[2].checked) {
      deathfails[0].checked = true;
      deathfails[2].checked = false;
    }
  } else if (!deathfails[1].checked && deathfails[2].checked) {
    deathfails[1].checked = true;
    deathfails[2].checked = false;
  }

  if (deathfails[0].checked && deathfails[1].checked && deathfails[2].checked) {
    alert("You died! :(");
  }
}
