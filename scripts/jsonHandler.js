//Import options.json and parse values to global variables used in autoMath.js
/**
 * @typedef {{min: number, max: number}} CharacterLevel
 * @typedef {{bonus: string, levelRange: number[]}} ProficiencyProgression
 * @typedef {{argument: string, body: string}} ModFunction
 * @typedef {{min: number, typicalMax: number, max: number, modFunction: ModFunction}} Stat
 * @typedef {{stenographVersion: string, version: string, characterLevel: CharacterLevel, proficiencyProgression: ProficiencyProgression[], stat: Stat}} Options
 * @type {Options}
 */
let options;
const defaultOptionsLocation = "./resources/data/options.json";
/** Function to convert from stat to stat modifier
 * @type {Function}
 * @param {number} stat
 * @returns {number}
 */
let statModFunction;

/** Load data from json options file
 * @param {String} optionsLocation
 */
async function loadOptions(optionsLocation = defaultOptionsLocation) {
  try {
    const response = await fetch(optionsLocation);
    options = await response.json();

    optionsParser(optionsLocation);
  } catch (error) {
    console.error(error);
  }
}

/** Parse options data into html
 * @param {String} optionsLocation
 */
function optionsParser(optionsLocation) {
  /** Versions **/
  console.log(`Stenograph Version: ${stenographVersion}\n`); //currently running version of Stenograph
  console.log(
    `Loading ${
      optionsLocation == defaultOptionsLocation ? "DEFAULT " : ""
    }Options file: ${optionsLocation}`
  ); //currently loaded options file
  console.log(`\tOptions Stenograph Version: ${options.stenographVersion}`); //version of Stenograph this options file was designed on
  console.log(`\tOptions Version: ${options.version}`); //version of options file

  /** Data **/
  //characterLevel
  console.log(
    `\tCharacter Level:\n\t\tmin: ${options.characterLevel.min}\n\t\tmax: ${options.characterLevel.max}`
  );

  //proficicncyProgression
  console.log("\tProficiency progression:");
  for (let i = 0; i < options.proficiencyProgression.length; i++) {
    console.log(
      `\t\tbonus: ${options.proficiencyProgression[i].bonus}\n\t\tlevelRange: ${options.proficiencyProgression[i].levelRange[0]} to ${options.proficiencyProgression[i].levelRange[1]}\n`
    );
  }

  /* stat */
  //stat.min, stat.typicalMax, stat.max
  console.log(
    `\tStat Limits:\n\t\tmin: ${options.stat.min}\n\t\ttypicalMax: ${options.stat.typicalMax}\n\t\tmax: ${options.stat.max}`
  );
  //modFunction: Assume all values MUST be integers
  statModFunction = new Function(options.stat.modFunction.argument, options.stat.modFunction.body);
  console.log(`\tStat Modifer Function:\n\t\t${options.stat.modFunction.body}`);

  /** Verify **/
  verifyOptions(optionsLocation);
}

/** Verify that options file has valid values
 * @param {String} optionsLocation
 */
function verifyOptions(optionsLocation) {
  let invalid = false;

  //Version
  if (options.stenographVersion !== stenographVersion) {
    alert(
      `Different version warning!\n\nThe options data used was made on an different version of Stenograph (Current: ${stenographVersion}; Your version: ${options.stenographVersion}). Some automatic math calculations might work incorrectly!`
    );
  }

  //characterLevel: ensure consecutive order
  if (options.characterLevel.min >= options.characterLevel.max) {
    invalidOptions("characterLevel");
  }

  //proficiencyProgression
  for (let i = 0; i < options.proficiencyProgression.length; i++) {
    //ensure consecutive order in levelRange
    if (
      options.proficiencyProgression[i].levelRange[0] >
      options.proficiencyProgression[i].levelRange[1]
    ) {
      invalidOptions("proficiencyProgression.levelRange");
    } else if (i != 0) {
      //ensure consecutive order in bonus
      if (
        parseInt(options.proficiencyProgression[i - 1].bonus[1]) >=
        parseInt(options.proficiencyProgression[i].bonus[1])
      ) {
        invalidOptions("proficiencyProgression.bonus");
      }

      //ensure consecutive order in levelRange between entries
      if (
        options.proficiencyProgression[i - 1].levelRange[1] + 1 !=
        options.proficiencyProgression[i].levelRange[0]
      ) {
        invalidOptions("proficiencyProgression.levelRange");
      }
    }
  }

  /* stat */
  //stat.min, stat.typicalMax, stat.max: ensure consecutive order & typicalMax is null if not below max
  if (options.stat.typicalMax == null) {
    if (options.stat.min >= options.stat.max) {
      invalidOptions("stat");
    }
  } else {
    if (
      options.stat.min >= options.stat.typicalMax ||
      options.stat.typicalMax >= options.stat.max
    ) {
      invalidOptions("stat");
    }
  }

  //stat.modFunction: assume all returned values must be integers
  for (let stat = options.stat.min; stat <= options.stat.max; stat++) {
    if (!Number.isInteger(statModFunction(stat))) {
      invalidOptions("stat.modFunction(must yield integers for all values in stat range)");
      break;
    }
  }

  if (!invalid) {
    console.log(`Options file(${optionsLocation}) is valid!`);
  } else {
    console.log(`Options file(${optionsLocation}) is invalid! Refer to alert(s) that popped up.`);
  }

  /* Invalid data alert helper function */
  function invalidOptions(str) {
    alert(`Invalid options file! Check your values!\n\nInvalid ${str} value(s)`);
    invalid = true;
  }
}

//Saving character data
function saveData() {
  const elementValueObj = {};
  //Save Stenogrpah version number
  elementValueObj.stenographVersion = stenographVersion;

  //Save skill proficiencies
  document.querySelectorAll("div.skillprofbox div").forEach((skillprof) => {
    //console.log(skillprof.getAttribute("class"));
    elementValueObj[skillprof.getAttribute("name")] = skillprof.getAttribute("class");
  });

  //Save rest of inputs
  const charsheet = document.getElementById("charsheet");
  for (let i = 0; i < charsheet.length; i++) {
    const { checked, name, type, value } = charsheet[i];

    let relevantValue;
    if (type === "text" || type === "textarea") {
      relevantValue = value;
    } else if (type === "checkbox") {
      relevantValue = checked;
    }

    elementValueObj[name] = relevantValue;
  }

  const jsonText = JSON.stringify(elementValueObj, null, "\t"); //translate object to JSON

  //Prompt user with download
  let a = document.createElement("a");
  a.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(jsonText)}`);
  if (elementValueObj.charname.length === 0) {
    a.setAttribute("download", "stenograph_character.json");
  } else {
    a.setAttribute("download", `stenograph_${elementValueObj.charname.split(" ").join("_")}.json`);
  }
  a.click();
  a.remove();
}

//Loading character data
function loadData() {
  const { files } = document.getElementsByClassName("loaddata").item(0);

  if (files.length !== 1) {
    //Invalid upload
    alert("Submit exactly one .json!");
    return false;
  } else {
    const fr = new FileReader();

    fr.onload = (event) => {
      let result = JSON.parse(event.target.result);
      let jsonText = JSON.stringify(result, null, 2);
      let dataObj = JSON.parse(jsonText);

      //Check stenograph version of loaded data
      if (dataObj["stenographVersion"] !== stenographVersion) {
        alert(
          `This character sheet was made on an different version of Stenograph!\n\nCurrent Stenograph version: ${stenographVersion}\nYour character sheet's Stenograph version: ${dataObj["stenographVersion"]}\n\nSome data may transfer incorrectly! Typically, this will happen between feature updates: when the second number in the verison number changes. Ex: 1.4.0 -> 1.5.0.`
        );
      }

      //Load skill proficiencies
      document.querySelectorAll("div.skillprofbox div").forEach((skillprof) => {
        skillprof.className = dataObj[skillprof.getAttribute("name")];
      });

      //Load rest of inputs
      const charsheet = document.getElementById("charsheet");
      for (let i = 0; i < charsheet.length; i++) {
        let value = dataObj[charsheet[i].name];
        if (charsheet[i].type == "text" || charsheet[i].type == "textarea") {
          if (!value && value !== 0) {
            //value DNE
            value = "";
          }
          charsheet[i].value = value;
        } else if (charsheet[i].type == "checkbox") {
          if (!value && value !== 0) {
            //value DNE
            value = false;
          }
          charsheet[i].checked = value;
        }
      }
    };

    fr.readAsText(files.item(0));
  }
}
