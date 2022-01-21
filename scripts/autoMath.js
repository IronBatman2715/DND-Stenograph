function clearData() {
  if (confirm("Are you sure you want to clear the entire sheet?")) {
    //Reset skill proficiency buttons
    let skillprofs = document.querySelectorAll("div.skillprofbox div");
    for (let i = 0; i < skillprofs.length; i++) {
      skillprofs[i].className = "state0";
    }

    document.getElementById("charsheet").reset(); //reset rest of sheet
  }
}

function updateStats(statNum) {
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
  let isAboveTypMax = false;
  let typMaxEqualsMax = options.stat.typMax == null;

  let stat = parseInt(stats[statNum].value);
  let isStatValid = options.stat.min <= stat && stat <= options.stat.max;

  //Check for valid input
  if (Number.isInteger(stat) && isStatValid) {
    //Check if above usual values
    if (stat > options.stat.typMax) {
      isAboveTypMax = true;
    }

    //Calculate modifier
    let calcMod = statModFunction(stat);

    //Add prefix to modifier
    if (0 <= calcMod) {
      //Positive modifier
      statmods[statNum].value = "+" + calcMod.toString();
    } else {
      //Negative modifier
      statmods[statNum].value = calcMod.toString();
    }
  } else {
    //Invalid input
    statmods[statNum].value = "";

    //If stat value is not empty, send invalid input alert
    if (!!stats[statNum].value) {
      if (typMaxEqualsMax) {
        alert(
          `Invalid ${statNames[statNum]} value: ${stats[statNum].value}\n\nAll stat values must be integers from ${options.stat.min} to ${options.stat.max}.`
        );
      } else {
        alert(
          `Invalid ${statNames[statNum]} value: ${stats[statNum].value}\n\nAll stat values must be integers from ${options.stat.min} to ${options.stat.max}. Note that you can only go above ${options.stat.typMax} when explicitly told you can do so!`
        );
      }
    }
  }
  //Warn user about going above usual values
  if (isAboveTypMax && !typMaxEqualsMax) {
    alert(
      `Note that any stat can NOT go above ${options.stat.typMax} unless EXPLICITLY told you can do so. Be sure you have something that allows that!`
    );
  }

  updateSaves(statNum);
  updateSkills();
}

function updateSaves(statNum) {
  let statmods = document.getElementsByClassName("statmod");
  let profbonus = document.getElementsByClassName("profbonus");
  let saves = document.getElementsByClassName("save");
  let saveprofs = document.getElementsByClassName("saveprof");

  if (statNum == "all") {
    for (let i = 0; i < 6; i++) {
      updateSaves(i);
    }
  } else {
    let statmod = parseInt(statmods[statNum].value);
    let saveprof = saveprofs[statNum].checked;

    if ((!statmod && 0 !== statmod) || !profbonus[0].value) {
      saves[statNum].value = "";
    } else {
      let save;
      if (saveprof) {
        save = parseInt(profbonus[0].value) + statmod;
      } else {
        save = statmod;
      }

      if (!save && save !== 0) {
        saves[statNum].value = "";
      } else if (0 <= save) {
        saves[statNum].value = "+" + save.toString();
      } else {
        saves[statNum].value = save.toString();
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
  console.log(`Reading class level(s) from string: ${classlevelStr}`);

  //verify string is NOT empty. if is empty, do nothing
  if (!!classlevelStr) {
    let invalidSyntax = false; //assume valid syntax until proven otherwise
    let invalidIndex = null; //index that threw invalidSyntax flag
    let profbonus = document.getElementsByClassName("profbonus");
    let totalLevel = 0; //total character level
    let isReadingDigits = false; //currently parsing through level number(s)
    let n = 1; //nth class parsed through
    let classes = Array(1).fill({ name: "", level: "", startIndex: 0 }); //array of objects of class information

    //iterate through each character of classlevelStr, checking for key characters
    for (let i = 0; i < classlevelStr.length; i++) {
      //i is current character of classlevelStr

      if (isReadingDigits) {
        //if currrently reading digits

        if (classlevelStr[i] == " ") {
          //check for invalid syntax
          console.log("\tSpace before slash!");
          invalidSyntax = true;
          invalidIndex = i;
          break;
        } else if (classlevelStr[i] == "/" || i == classlevelStr.length - 1) {
          //check for end cases

          //if last character, verify and read
          if (i == classlevelStr.length - 1) {
            if ("0" <= classlevelStr[i] && classlevelStr[i] <= "9") {
              classes[n - 1].level = classes[n - 1].level.concat(
                classlevelStr[i]
              );
            } else {
              console.log("\tNonnumeric character after space at end!");
              invalidSyntax = true;
              invalidIndex = i;
              break;
            }
          }

          //verify class level and add to total if valid
          classes[n - 1].level = parseInt(classes[n - 1].level);
          if (isValidLevel(classes[n - 1].level, "class level", n)) {
            totalLevel = totalLevel + classes[n - 1].level;
          } else {
            profbonus[0].value = "";
            return;
          }

          console.log(
            `\tClass ${n}\n\t\tname: ${classes[n - 1].name}\n\t\tlevel: ${
              classes[n - 1].level
            }\n\t\tstartIndex: ${classes[n - 1].startIndex}`
          );

          //reset for next class
          n = n + 1;
          isReadingDigits = false;

          //if NOT last character, add next classes index
          if (i != classlevelStr.length - 1) {
            classes.push({ name: "", level: "", startIndex: i + 1 });
          }
        } else {
          //no end cases or invalid syntax, verify and read digit character
          if ("0" <= classlevelStr[i] && classlevelStr[i] <= "9") {
            classes[n - 1].level = classes[n - 1].level.concat(
              classlevelStr[i]
            );
          } else {
            console.log("Nonnumeric character after space and before slash!");
            invalidSyntax = true;
            invalidIndex = i;
            break;
          }
        }
      } else {
        //not reading digits
        if (classlevelStr[i] == "/") {
          //check for invalid syntax
          console.log("Slash NOT after number!");
          invalidSyntax = true;
          invalidIndex = i;
          break;
        } else if (classlevelStr[i] == " ") {
          //check for flag to start reading digits
          isReadingDigits = true;
        } else {
          //no end cases or invalid syntax, enter character into nth class name
          classes[n - 1].name = classes[n - 1].name.concat(classlevelStr[i]);
        }
      }
    }

    //console.log(classes);

    if (invalidSyntax) {
      alert(
        `Invalid Class & Level syntax (flagged at character ${
          invalidIndex + 1
        })! Explicitly format as follows with NO spaces or slashes unless specified. Replace parentheses and their contents with values:\n\n(class name 1)(space)(class 1's level)(slash)(repeat format, ending last WITHOUT a slash)`
      );
      profbonus[0].value = "";
      return;
    }

    if (isValidLevel(totalLevel, "total character level", 0)) {
      console.log(`\tTotal character level: ${totalLevel}`);
      // Proficiency bonus progression
      for (let i = 0; i < options.proficiencyProgression.length; i++) {
        if (
          options.proficiencyProgression[i].levelRange[0] <= totalLevel &&
          totalLevel <= options.proficiencyProgression[i].levelRange[1]
        ) {
          profbonus[0].value = options.proficiencyProgression[i].bonus;

          updateSaves("all");
          updateSkills();
          return;
        }
      }
      profbonus[0].value = "invalid";
    } else {
      profbonus[0].value = "invalid";
      return;
    }
  }

  //Check validity of input level helper function
  function isValidLevel(level, levelDescriptorStr, classNum) {
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
      levelDescriptorStr = num.concat(levelDescriptorStr);
    }

    //Validity tests
    if (level > options.characterLevel.max) {
      //level is above maximum, alert user and mark as invalid
      alert(
        `Invalid ${levelDescriptorStr}!\n\nMust be no more than ${options.characterLevel.max} (Current: ${level})!`
      );
      return false;
    } else if (level < options.characterLevel.min) {
      //level is below minimum, alert user and mark as invalid
      alert(
        `Invalid ${levelDescriptorStr}!\n\nMust be at least ${options.characterLevel.min} (Current: ${level})!`
      );
      return false;
    } else {
      return true; //valid level, proceed
    }
  }
}

function charName(num) {
  let charnametop = document.getElementsByClassName("charnametop");
  let charnamebot = document.getElementsByClassName("charnamebot");

  switch (num) {
    case 0:
      charnamebot[0].value = charnametop[0].value;
      break;
    case 1:
      charnametop[0].value = charnamebot[0].value;
      break;
    default:
      break;
  }
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
