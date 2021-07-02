function clearData() {
  if (confirm("Are you sure you want to clear the entire sheet?") == true) {
    //Reset skill proficiency buttons
    let skillprofs = document.querySelectorAll("div.skillprofbox div");
    for (let i = 0; i < skillprofs.length; i++) {
      skillprofs[i].className = "state0";
    }

    document.getElementById("charsheet").reset(); //reset rest of sheet
  }
}

function updateStats() {
  let stats = document.getElementsByClassName("stat");
  let statmods = document.getElementsByClassName("statmod");
  let statNames = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Wisdom",
    "Intelligence",
    "Charisma",
  ];
  let isAboveTypStatMax = false;

  //Iterate through all 6 stats/statmods
  for (let i = 0; i < 6; i++) {
    let stat = parseInt(stats[i].value);
    let isStatValid = statLimits.min <= stat && stat <= statLimits.absmax;

    //Check for valid input
    if (Number.isInteger(stat) && isStatValid) {
      //Check if above usual values
      if (stat > statLimits.typmax) {
        isAboveTypStatMax = true;
      }

      //Calculate modifier
      let calcMod = Math.floor((stat - 10) / 2);
      if (0 <= calcMod) {
        //Positive modifier
        statmods[i].value = "+" + calcMod.toString();
      } else {
        //Negative modifier
        statmods[i].value = calcMod.toString();
      }
    } else {
      //Invalid input
      statmods[i].value = "";

      //If stat value is not empty, send invalid input alert
      if (!!stats[i].value) {
        alert(
          `Invalid ${statNames[i]} value: ${stats[i].value}\n\nAll stat values must be integers from ${statLimits.min} to ${statLimits.absmax}. Note that you can only go above ${statLimits.typmax} when explicitly told you can do so!`
        );
      }
    }
  }
  //Warn user about going above usual values
  if (isAboveTypStatMax) {
    alert(
      `Note that any stat can NOT go above ${statLimits.typmax} unless EXPLICITLY told you can do so. Be sure you have something that allows that!`
    );
  }

  updateSaves();
  updateSkills();
}

function updateSaves() {
  let statmods = document.getElementsByClassName("statmod");
  let profbonus = document.getElementsByClassName("profbonus");
  let saves = document.getElementsByClassName("save");
  let saveprofs = document.getElementsByClassName("saveprof");

  //Iterate through all 6 stats/saves
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
  let skillprofs = document.querySelectorAll("div.skillprofbox div");
  let passiveperception = document.getElementsByClassName("passiveperception");

  //Iterate through 18 total skills
  for (let i = 0; i < skillprofs.length; i++) {
    let skillprofstate = skillprofs[i].className;
    let skillprof = parseInt(skillprofstate.substring(5)); //pick out state number

    if (!profbonus[0].value) {
      //Invalid proficiency bonus
      skills[i].value = "";
    } else {
      let bonus;
      let skill;
      let statmod;

      //Determine proficiency type and save bonus
      switch (skillprof) {
        case 0: //no proficiency
          bonus = 0;
          break;
        case 1: //proficiency
          bonus = parseInt(profbonus[0].value);
          break;
        case 2: //half proficiency
          bonus = Math.floor(parseInt(profbonus[0].value) / 2);
          break;
        case 3: //expertise (double proficiency)
          bonus = parseInt(profbonus[0].value) * 2;
          break;
        default:
          bonus = 0;
          break;
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
  let classlevel = document.getElementsByClassName("classlevel");
  let classlevelStr = classlevel[0].value;
  console.log(classlevelStr);

  //verify string is NOT empty
  if (!!classlevelStr) {
    let invalidSyntax = false;
    let profbonus = document.getElementsByClassName("profbonus");
    let totalLevel = 0;
    let isReadingDigits = false;
    let n = 1;
    let nthClassLevel = "";

    //iterate through each character of classlevelStr, checking for key characters
    for (let i = 0; i < classlevelStr.length; i++) {
      if (isReadingDigits) {
        //if currrently reading digits
        if (classlevelStr[i] == " ") {
          //check for invalid syntax
          console.log("Space before slash!");
          invalidSyntax = true;
          break;
        } else if (classlevelStr[i] == "/" || i == classlevelStr.length - 1) {
          //check for end cases

          //if last character, verify and read
          if (i == classlevelStr.length - 1) {
            if ("0" <= classlevelStr[i] && classlevelStr[i] <= "9") {
              nthClassLevel = nthClassLevel.concat(classlevelStr[i]);
            } else {
              console.log("Nonnumeric character after space at end!");
              invalidSyntax = true;
              break;
            }
          }

          //verify class level and add to total if valid
          nthClassLevel = parseInt(nthClassLevel);
          console.log(`Class ${n}'s level: ${nthClassLevel}`);
          if (isValidLevel(nthClassLevel, "class level", n)) {
            totalLevel = totalLevel + nthClassLevel;
          } else {
            profbonus[0].value = "";
            return;
          }

          //reset for next class
          n = n + 1;
          nthClassLevel = "";
          isReadingDigits = false;
        } else {
          //no end cases or invalid syntax, verify and read digit character
          if ("0" <= classlevelStr[i] && classlevelStr[i] <= "9") {
            nthClassLevel = nthClassLevel.concat(classlevelStr[i]);
          } else {
            console.log("Nonnumeric character after space and before slash!");
            invalidSyntax = true;
            break;
          }
        }
      } else {
        //not reading digits
        if (classlevelStr[i] == "/") {
          //check for invalid syntax
          console.log("Slash NOT after number!");
          invalidSyntax = true;
          break;
        } else if (classlevelStr[i] == " ") {
          //check for flag to start reading digits
          console.log(`Start reading digits at index ${i}`);
          isReadingDigits = true;
        } else {
          //no end cases or invalid syntax, go to next character
        }
      }
    }

    if (invalidSyntax) {
      alert(
        "Invalid Class & Level syntax! Explicitly format as follows with NO spaces or slashes unless specified. Replace parentheses and their contents with values:\n\n(class name 1)(space)(class 1's level)(slash)(repeat format, ending last WITHOUT a slash)"
      );
      profbonus[0].value = "";
      return;
    }

    if (isValidLevel(totalLevel, "total character level", 0)) {
      console.log(`Total character level: ${totalLevel}`);
      /* Hard coded proficiency bonus progression according to official rules */
      if (1 <= totalLevel && totalLevel <= 4) {
        profbonus[0].value = "+2";
      } else if (5 <= totalLevel && totalLevel <= 8) {
        profbonus[0].value = "+3";
      } else if (9 <= totalLevel && totalLevel <= 12) {
        profbonus[0].value = "+4";
      } else if (13 <= totalLevel && totalLevel <= 16) {
        profbonus[0].value = "+5";
      } else if (totalLevel <= 20) {
        profbonus[0].value = "+6";
      } else {
        profbonus[0].value = "invalid";
      }
    } else {
      profbonus[0].value = "";
      return;
    }

    updateSaves();
    updateSkills();
  }

  //Check validity of input level helper function
  function isValidLevel(level, str, classNum) {
    //Ensure correct ordinal suffix
    if (classNum > 0) {
      let num;
      switch (classNum) {
        case 1:
          num = "1st ";
          break;
        case 2:
          num = "2nd ";
          break;
        case 3:
          num = "3rd ";
          break;
        default:
          num = `${classNum}th `;
          break;
      }
      str = num.concat(str);
    }

    if (level > levelLimits.max) {
      //level is above maximum
      alert(
        `Invalid ${str}!\n\nMust be no more than ${levelLimits.max} (Current: ${level})!`
      );
      return false;
    } else if (level < levelLimits.min) {
      //level is below minimum
      alert(
        `Invalid ${str}!\n\nMust be at least ${levelLimits.min} (Current: ${level})!`
      );
      return false;
    } else {
      return true;
    }
  }
}

function charNameTop() {
  let charnametop = document.getElementsByClassName("charnametop");
  let charnamebot = document.getElementsByClassName("charnamebot");

  charnamebot[0].value = charnametop[0].value;
}

function charNameBot() {
  let charnametop = document.getElementsByClassName("charnametop");
  let charnamebot = document.getElementsByClassName("charnamebot");

  charnametop[0].value = charnamebot[0].value;
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
