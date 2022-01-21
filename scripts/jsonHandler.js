//Import options.json and parse values to global variables used in autoMath.js
let options;
let defaultOptionsLocation = "./resources/data/options.json";
/** Global options variables used throughout JS code (mostly autoMath.js)
 * options.stenographVersion;
 * options.version;
 * options.stat;
 * options.characterLevel;
 * options.proficiencyProgression
 **/
let statModFunction; //function to convert from stat to stat modifier

function getOptionsJSON(callback, optionsLocation) {
  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", optionsLocation, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

//Load data from json options file
function loadOptions(optionsLocation = defaultOptionsLocation) {
  getOptionsJSON(function (response) {
    options = JSON.parse(response); //load data from json

    /** Versions **/
    console.log(`Stenograph Version: ${stenographVersion}\n`); //currently running version of Stenograph
    console.log(`Loading Options file: ${optionsLocation}`); //currently loaded options file
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
    //stat.min, stat.typMax, stat.max
    console.log(
      `\tStat Limits:\n\t\tmin: ${options.stat.min}\n\t\ttypMax: ${options.stat.typMax}\n\t\tmax: ${options.stat.max}`
    );
    //modFunction: Assume all values MUST be integers
    statModFunction = new Function(
      options.stat.modFunction.argument,
      options.stat.modFunction.body
    );
    console.log(`\tStat Modifer Function:\n\t\t${options.stat.modFunction.body}`);

    /** Verify **/
    verifyOptions(optionsLocation);
  }, optionsLocation);
}

//Verify that options file has valid values
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
  //stat.min, stat.typMax, stat.max: ensure consecutive order & typMax is null if not below max
  if (options.stat.typMax == null) {
    if (options.stat.min >= options.stat.max) {
      invalidOptions("stat");
    }
  } else {
    if (options.stat.min >= options.stat.typMax || options.stat.typMax >= options.stat.max) {
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
  let elementValueObj = new Object();
  //Save Stenogrpah version number
  elementValueObj["stenographVersion"] = stenographVersion;

  //Save skill proficiencies
  let skillprof = document.querySelectorAll("div.skillprofbox div");
  for (let i = 0; i < skillprof.length; i++) {
    //console.log(skillprof[i].getAttribute("class"));
    elementValueObj[skillprof[i].getAttribute("name")] = skillprof[i].getAttribute("class");
  }

  //Save rest of inputs
  let charsheet = document.getElementById("charsheet");
  for (let i = 0; i < charsheet.length; i++) {
    let desValue;
    if (charsheet[i].type == "text" || charsheet[i].type == "textarea") {
      desValue = charsheet[i].value;
    } else if (charsheet[i].type == "checkbox") {
      desValue = charsheet[i].checked;
    }

    elementValueObj[charsheet[i].name] = desValue;
  }

  jsonText = JSON.stringify(elementValueObj, null, "\t"); //translate object to JSON

  //Prompt user with download
  let a = document.createElement("a");
  a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(jsonText));
  if (!charsheet[0].value) {
    a.setAttribute("download", "stenograph_character.json");
  } else {
    a.setAttribute("download", `stenograph_${charsheet[0].value}.json`);
  }
  a.click();
}

//Once file has been uploaded, run loadData
$(document).ready(function () {
  $(".loaddata").change(function () {
    loadData();
  });
});

//Loading character data
function loadData() {
  let loadDataButton = document.getElementsByClassName("loaddata");
  let files = loadDataButton[0].files;

  if (files.length !== 1) {
    //Invalid upload
    alert("Submit exactly one .json or .txt!");
    return false;
  } else {
    let fr = new FileReader();

    fr.onload = function (e) {
      let result = JSON.parse(e.target.result);
      let jsonText = JSON.stringify(result, null, 2);
      let dataObj = JSON.parse(jsonText);

      //Check stenograph version of loaded data
      if (dataObj["stenographVersion"] !== stenographVersion) {
        alert(
          `This character sheet was made on an different version of Stenograph!\n\nCurrent Stenograph version: ${stenographVersion}\nYour character sheet's Stenograph version: ${dataObj["stenographVersion"]}\n\nSome data may transfer incorrectly! Typically, this will happen between feature updates: when the second number in the verison number changes. Ex: 1.4.0 -> 1.5.0.`
        );
      }

      //Load skill proficiencies
      let skillprof = document.querySelectorAll("div.skillprofbox div");
      for (let i = 0; i < skillprof.length; i++) {
        skillprof[i].className = dataObj[skillprof[i].getAttribute("name")];
      }

      //Load rest of inputs
      let charsheet = document.getElementById("charsheet");
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
