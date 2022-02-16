function clearData() {
  if (confirm("Are you sure you want to clear the entire sheet?")) {
    //Reset skill proficiency buttons
    document
      .querySelectorAll("div.skillprofbox div")
      .forEach((skillprof) => (skillprof.className = "state0"));

    document.getElementById("charsheet").reset(); //reset rest of sheet

    console.log("Cleared the character sheet!");
  }
}

function updateStats(statNum) {
  const stat = document.getElementsByClassName("stat").item(statNum);
  const statMod = document.getElementsByClassName("statmod").item(statNum);
  const statName = statNames[statNum];
  const typicalMaxExists = options.stat.typicalMax !== null;

  const statValue = parseInt(stat.value);
  const isStatValid = options.stat.min <= statValue && statValue <= options.stat.max;

  //Check for valid input
  if (Number.isInteger(statValue) && isStatValid) {
    //Calculate modifier
    /** @type {number} */
    const calcMod = statModFunction(statValue);

    //Assign modifier
    statMod.value = numberToModifier(calcMod);

    //Check/warn user about going above typical values
    if (typicalMaxExists) {
      if (statValue > options.stat.typicalMax) {
        alert(
          `Note that any stat can NOT go above ${options.stat.typicalMax} unless EXPLICITLY told you can do so. Be sure you have something that allows that!`
        );
      }
    }
  } else {
    //Invalid input
    statMod.value = "";

    //If stat value is not empty, send invalid input alert
    if (!!stat.value) {
      if (!typicalMaxExists) {
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

      save.value = numberToModifier(saveValue);
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
      skills[i].value = numberToModifier(skill);

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
  /** @type {string} */
  const classlevelStr = document.getElementsByClassName("classlevel").item(0).value;

  console.log(`Reading class level(s) from string: ${classlevelStr}`);

  //verify string is NOT empty. if is empty, do nothing
  if (!!classlevelStr) {
    const profbonus = document.getElementsByClassName("profbonus").item(0);

    let invalidSyntax = false; //assume valid syntax until proven otherwise
    let invalidIndex = NaN; //index that threw invalidSyntax flag
    let n = 1; //nth class parsed through
    let isReadingDigits = false; //currently parsing through level number(s)
    let currentLevelStr = "";

    /**
     * @typedef {{name: string; level: number; startIndex: number}} ClassInfo
     * @type {ClassInfo[]}
     */
    const classes = [{ name: "", level: NaN, startIndex: 0 }]; //array of objects of class information
    let totalLevel = 0; //total character level

    //iterate through each character of classlevelStr, checking for key characters
    for (let i = 0; i < classlevelStr.length; i++) {
      //i is current char of classlevelStr
      const char = classlevelStr[i];
      //console.log(i, "th character: ", char);

      if (isReadingDigits) {
        //if currrently reading digits

        if (char == " ") {
          //check for invalid syntax
          console.log("\tSpace before slash!");
          invalidSyntax = true;
          invalidIndex = i;
          break;
        } else if (char == "/" || i == classlevelStr.length - 1) {
          //check for end cases

          //if last character, verify and read
          if (i == classlevelStr.length - 1) {
            if ("0" <= char && char <= "9") {
              currentLevelStr = currentLevelStr.concat(char);
            } else {
              console.log("\tNonnumeric character after space at end!");
              invalidSyntax = true;
              invalidIndex = i;
              break;
            }
          }

          //verify class level and add to total if valid
          if (isValidLevel(parseInt(currentLevelStr), "class level", n)) {
            classes[n - 1].level = parseInt(currentLevelStr);
            totalLevel = totalLevel + classes[n - 1].level;
          } else {
            profbonus.value = "";

            updateSaves("all");
            updateSkills();
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
          currentLevelStr = "";

          //if NOT last character, add next classes index
          if (i != classlevelStr.length - 1) {
            classes.push({ name: "", level: "", startIndex: i + 1 });
          }
        } else {
          //no end cases or invalid syntax, verify and read digit character
          if ("0" <= char && char <= "9") {
            currentLevelStr = currentLevelStr.concat(char);
          } else {
            console.log("Nonnumeric character after space and before slash!");
            invalidSyntax = true;
            invalidIndex = i;
            break;
          }
        }
      } else {
        //not reading digits
        if (char == "/") {
          //check for invalid syntax
          console.log("Slash NOT after number!");
          invalidSyntax = true;
          invalidIndex = i;
          break;
        } else if (char == " ") {
          //check for flag to start reading digits
          isReadingDigits = true;
        } else {
          //no end cases or invalid syntax, enter character into nth class name
          classes[n - 1].name = classes[n - 1].name.concat(char);
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
      profbonus.value = "";

      updateSaves("all");
      updateSkills();
      return;
    }

    if (isValidLevel(totalLevel, "total character level")) {
      console.log(`\tTotal character level: ${totalLevel}`);
      // Proficiency bonus progression
      for (let i = 0; i < options.proficiencyProgression.length; i++) {
        const profProg = options.proficiencyProgression[i];

        if (profProg.levelRange[0] <= totalLevel && totalLevel <= profProg.levelRange[1]) {
          profbonus.value = numberToModifier(profProg.bonus);

          updateSaves("all");
          updateSkills();
          return;
        }
      }
      profbonus.value = "invalid";

      updateSaves("all");
      updateSkills();
    } else {
      profbonus.value = "invalid";

      updateSaves("all");
      updateSkills();
      return;
    }
  }

  /** Validate class/character level
   * @param {number} level
   * @param {string} levelDescriptorStr
   * @param {number} classNum omit if validating total character level
   * @returns {boolean}
   */
  function isValidLevel(level, levelDescriptorStr, classNum = 0) {
    //Ensure correct ordinal suffix
    if (classNum > 0 && Number.isInteger(classNum)) {
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

function mirrorCharName(num) {
  const charNameTop = document.getElementsByClassName("charnametop").item(0);
  const charNameBot = document.getElementsByClassName("charnamebot").item(0);

  switch (num) {
    case 0: {
      charNameBot.value = charNameTop.value;
      break;
    }
    case 1: {
      charNameTop.value = charNameBot.value;
      break;
    }
    default:
      break;
  }
}

function deathSaves() {
  //Map checkbox data from DOM to boolean arrays
  /** @type {boolean[]} */
  const deathSuccesses = Array.from(document.getElementsByClassName("deathsuccess")).map(
    (e) => e.checked
  );
  /** @type {boolean[]} */
  const deathFailures = Array.from(document.getElementsByClassName("deathfailure")).map(
    (e) => e.checked
  );

  //Sort arrays (trues then falses) then update DOM to match
  deathSuccesses
    .sort()
    .reverse()
    .forEach((e, i) => {
      document.getElementsByClassName("deathsuccess").item(i).checked = e;
    });
  deathFailures
    .sort()
    .reverse()
    .forEach((e, i) => {
      document.getElementsByClassName("deathfailure").item(i).checked = e;
    });

  //Check if all death successes have occurred
  if (deathSuccesses.every((e) => e === true)) {
    alert("You survived! :)");
    resetDeathSaves();
  }
  //Check if all death failures have occurred
  if (deathFailures.every((e) => e === true)) {
    alert("You died! :(");
    resetDeathSaves();
  }

  /** Reset DOM death save checkboxes */
  function resetDeathSaves() {
    deathSuccesses.forEach((e, i) => {
      document.getElementsByClassName("deathsuccess").item(i).checked = false;
    });

    deathFailures.forEach((e, i) => {
      document.getElementsByClassName("deathfailure").item(i).checked = false;
    });
  }
}
