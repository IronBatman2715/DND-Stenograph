const statNames = ["Strength", "Dexterity", "Constitution", "Wisdom", "Intelligence", "Charisma"];

function clearData() {
  if (confirm("Are you sure you want to clear the entire sheet?")) {
    //Reset skill proficiency buttons
    document
      .querySelectorAll("div.skillprofbox div")
      .forEach((skillprof) => (skillprof.className = "state0"));

    document.getElementById("charsheet").reset(); //reset rest of sheet
  }
}

function updateStats(statNum) {
  const stat = document.getElementsByClassName("stat").item(statNum);
  const statMod = document.getElementsByClassName("statmod").item(statNum);
  const statName = statNames[statNum];
  const typicalMaxEqualsMax = options.stat.typicalMax == null;

  const statValue = parseInt(stat.value);
  const isStatValid = options.stat.min <= statValue && statValue <= options.stat.max;

  //Check for valid input
  if (Number.isInteger(statValue) && isStatValid) {
    //Calculate modifier
    const calcMod = statModFunction(statValue);

    //Add prefix to modifier
    if (0 <= calcMod) {
      //Positive modifier
      statMod.value = "+" + calcMod.toString();
    } else {
      //Negative modifier
      statMod.value = calcMod.toString();
    }

    //Check/warn user about going above typical values
    if (statValue > options.stat.typicalMax) {
      alert(
        `Note that any stat can NOT go above ${options.stat.typicalMax} unless EXPLICITLY told you can do so. Be sure you have something that allows that!`
      );
    }
  } else {
    //Invalid input
    statMod.value = "";

    //If stat value is not empty, send invalid input alert
    if (!!stat.value) {
      if (typicalMaxEqualsMax) {
        alert(
          `Invalid ${statName} value: ${stat.value}\n\nAll stat values must be integers from ${options.stat.min} to ${options.stat.max}.`
        );
      } else {
        alert(
          `Invalid ${statName} value: ${stat.value}\n\nAll stat values must be integers from ${options.stat.min} to ${options.stat.max}. Note that you can only go above ${options.stat.typicalMax} when explicitly told you can do so!`
        );
      }
    }
  }

  updateSaves(statNum);
  updateSkills();
}

function updateSaves(statNum) {
  if (statNum == "all") {
    //Recursively update all saves
    for (let i = 0; i < statNames.length; i++) {
      updateSaves(i);
    }
  } else {
    const statMod = parseInt(document.getElementsByClassName("statmod").item(statNum).value);
    const profbonus = document.getElementsByClassName("profbonus").item(0).value;
    const save = document.getElementsByClassName("save").item(statNum);

    /** @type {boolean} */
    const saveprof = document.getElementsByClassName("saveprof").item(statNum).checked;

    if ((!statMod && 0 !== statMod) || !profbonus) {
      save.value = "";
    } else {
      //Add proficiency bonus if applicable
      const saveValue = saveprof ? parseInt(profbonus) + statMod : statMod;

      if (!saveValue && saveValue !== 0) {
        save.value = "";
      } else if (0 <= saveValue) {
        save.value = "+" + saveValue.toString();
      } else {
        save.value = saveValue.toString();
      }
    }
  }
}

function updateSkills() {
  const skills = document.getElementsByClassName("skill");
  const skillprofs = document.querySelectorAll("div.skillprofbox div");

  if (skillprofs.length !== skills.length) {
    console.error(
      "Number of skill proficiencies does NOT match number of skills! Skipping update of skills."
    );
    return;
  }

  const profbonus = document.getElementsByClassName("profbonus").item(0).value;

  //Iterate through all skills (18 is standard)
  for (let i = 0; i < skills.length; i++) {
    if (!profbonus) {
      //Invalid proficiency bonus
      skills[i].value = "";
    } else {
      /** @type {number} */
      let bonus;
      /** @type {number} */
      let skill;
      /** @type {number} */
      let statmod;

      //Determine proficiency type and save bonus
      const skillprof = parseInt(skillprofs[i].className.substring(5)); //pick out state number
      switch (skillprof) {
        case 1: {
          //proficiency
          bonus = parseInt(profbonus);
          break;
        }
        case 2: {
          //half proficiency
          bonus = Math.floor(parseInt(profbonus) / 2);
          break;
        }
        case 3: {
          //expertise (double proficiency)
          bonus = parseInt(profbonus) * 2;
          break;
        }
        case 0: //no proficiency
        default: {
          bonus = 0;
          break;
        }
      }

      function getNewSkillValue(statNum) {
        statmod = parseInt(document.getElementsByClassName("statmod").item(statNum).value);
        if (!statmod && 0 !== statmod) {
          //Invalid stat modifier
          skill = NaN;
        } else {
          skill = bonus + statmod;
        }
      }

      //Switch through all skills; fall-through allows all skills of same stat to have the same functionality
      switch (i) {
        case 3: {
          //Strength
          getNewSkillValue(0);
          break;
        }
        case 0: //Dexterity
        case 15:
        case 16: {
          getNewSkillValue(1);
          break;
        }
        case 1: //Wisdom
        case 6:
        case 9:
        case 11:
        case 17: {
          getNewSkillValue(3);
          break;
        }
        case 2: //Intelligence
        case 5:
        case 8:
        case 10:
        case 14: {
          getNewSkillValue(4);
          break;
        }
        case 4: //Charisma
        case 7:
        case 12:
        case 13: {
          getNewSkillValue(5);
          break;
        }
      }

      //Save new skill value
      if ((!skill && skill !== 0) || skill === NaN) {
        skills[i].value = "";
      } else if (0 <= skill) {
        skills[i].value = "+" + skill.toString();
      } else {
        skills[i].value = skill.toString();
      }

      //Passive Perception
      if (i == 11) {
        const passiveperception = document.getElementsByClassName("passiveperception").item(0);
        if (!statmod && 0 !== statmod) {
          passiveperception.value = "";
        } else {
          passiveperception.value = (10 + skill).toString();
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
              classes[n - 1].level = classes[n - 1].level.concat(classlevelStr[i]);
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
            classes[n - 1].level = classes[n - 1].level.concat(classlevelStr[i]);
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
  const charnametop = document.getElementsByClassName("charnametop").item(0);
  const charnamebot = document.getElementsByClassName("charnamebot").item(0);

  switch (num) {
    case 0: {
      charnamebot.value = charnametop.value;
      break;
    }
    case 1: {
      charnametop.value = charnamebot.value;
      break;
    }
    default:
      break;
  }
}

function deathsaves() {
  const deathsuccesses = document.getElementsByClassName("deathsuccess");

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

  const deathfails = document.getElementsByClassName("deathfail");
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
