//Import options.json and parse values to global variables used in autoMath.js
let options;
const defaultOptionsLocation = "../resources/data/defaultOptions.json";
/** Global options variables used throughout JS code (mostly autoMath.js)
 * options.stenographVersion;
 * options.version;
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
function loadOptions(optionsLocation) {
  getOptionsJSON(function (response) {
    options = JSON.parse(response); //load data from json

    /** Print data to console **/

    /* Versions */
    console.log(`Stenograph Version: ${stenographVersion}\n`); //currently running version of Stenograph
    console.log(`Loading Options file: ${optionsLocation}`); //currently loaded options file
    console.log(`\tOptions Stenograph Version: ${options.stenographVersion}`); //version of Stenograph this options file was designed on
    console.log(`\tOptions Version: ${options.version}`); //version of options file

    /* Data */

    //Stats
    for (let i = 0; i < options.stat.list.length; i++) {
      //Convert given stat name to camel-case
      let statCamelize = options.stat.list[i].name.camelize();

      //Stat box
      let statDiv = document.createElement("div");
      document.getElementById("stats").appendChild(statDiv);
      statDiv.id = `${statCamelize}Div`;
      statDiv.className = "columns";

      //Score and modifier box
      let scoreDiv = document.createElement("div");
      document.getElementById(`${statCamelize}Div`).appendChild(scoreDiv);
      scoreDiv.id = `${statCamelize}ScoreDiv`;
      scoreDiv.className = "score";

      //Score
      let score = document.createElement("input");
      document.getElementById(`${statCamelize}ScoreDiv`).appendChild(score);
      score.type = "text";
      score.name = `${options.stat.list[i].name.camelize()}Score`;
      score.readOnly = true;

      //Modifier
      let modifier = document.createElement("input");
      document.getElementById(`${statCamelize}ScoreDiv`).appendChild(modifier);
      modifier.type = "text";
      modifier.name = `${options.stat.list[i].name.camelize()}Modifier`;
      modifier.readOnly = true;

      //Label, Saves and Skills box
      let labelSavesSkillsDiv = document.createElement("div");
      document
        .getElementById(`${statCamelize}Div`)
        .appendChild(labelSavesSkillsDiv);
      labelSavesSkillsDiv.id = `${statCamelize}LabelSavesSkillsDiv`;
      labelSavesSkillsDiv.className = "rows";

      //Stat label
      let statLabel = document.createElement("h3");
      document
        .getElementById(`${statCamelize}LabelSavesSkillsDiv`)
        .appendChild(statLabel);
      statLabel.innerHTML = options.stat.list[i].name.toUpperCase();
      statLabel.className = "center";

      //Save box
      let saveDiv = document.createElement("div");
      document
        .getElementById(`${statCamelize}LabelSavesSkillsDiv`)
        .appendChild(saveDiv);
      saveDiv.id = `${statCamelize}SaveDiv`;
      saveDiv.className = "skillOrSave save";

      //Save checkbox
      let saveCheckbox = document.createElement("input");
      document
        .getElementById(`${statCamelize}SaveDiv`)
        .appendChild(saveCheckbox);
      saveCheckbox.type = "checkbox";
      saveCheckbox.name = `${statCamelize}SaveProficiency`;

      //Save modifier
      let saveModifier = document.createElement("input");
      document
        .getElementById(`${statCamelize}SaveDiv`)
        .appendChild(saveModifier);
      saveModifier.type = "text";
      saveModifier.name = `${statCamelize}SaveModifier`;
      saveModifier.id = `${statCamelize}SaveModifier`;
      saveModifier.readOnly = true;

      //Save label
      let saveLabel = document.createElement("label");
      document.getElementById(`${statCamelize}SaveDiv`).appendChild(saveLabel);
      saveLabel.htmlFor = `${statCamelize}SaveModifier`;
      saveLabel.innerHTML = "SAVING THROW";

      //If skills are present, proceed to generate them
      if (options.stat.list[i].skills.length != 0) {
        for (let j = 0; j < options.stat.list[i].skills.length; j++) {
          //Convert given skill name to camel-case
          let skillCamelize = options.stat.list[i].skills[j].name.camelize();

          //Skill box
          let skillDiv = document.createElement("div");
          document
            .getElementById(`${statCamelize}LabelSavesSkillsDiv`)
            .appendChild(skillDiv);
          skillDiv.id = `${skillCamelize}SkillDiv`;
          skillDiv.className = "skillOrSave skill";

          //Skill proficiency box
          let skillProfDiv = document.createElement("div");
          document
            .getElementById(`${skillCamelize}SkillDiv`)
            .appendChild(skillProfDiv);
          skillProfDiv.id = `${skillCamelize}SkillProfDiv`;
          skillProfDiv.className = "skillprofbox";

          //Skill proficiency SUB-box
          let skillProfSubDiv = document.createElement("div");
          document
            .getElementById(`${skillCamelize}SkillProfDiv`)
            .appendChild(skillProfSubDiv);
          skillProfSubDiv.id = `${skillCamelize}SkillProfSubDiv`;
          skillProfSubDiv.name = `${skillCamelize}Proficiency`;
          skillProfSubDiv.className = "state0";

          //Skill proficiency expertise letter
          let skillProfExpertise = document.createElement("p");
          document
            .getElementById(`${skillCamelize}SkillProfSubDiv`)
            .appendChild(skillProfExpertise);
          skillProfExpertise.innerHTML = "E";

          //Skill modifier
          let skillModifier = document.createElement("input");
          document
            .getElementById(`${skillCamelize}SkillDiv`)
            .appendChild(skillModifier);
          skillModifier.id = `${skillCamelize}SkillModifier`;
          skillModifier.type = "text";
          skillModifier.name = `${skillCamelize}SkillModifier`;
          skillModifier.readOnly = true;

          //Skill label
          let skillLabel = document.createElement("label");
          document
            .getElementById(`${skillCamelize}SkillDiv`)
            .appendChild(skillLabel);
          skillLabel.htmlFor = `${skillCamelize}SkillModifier`;
          skillLabel.innerHTML =
            options.stat.list[i].skills[j].name.toUpperCase();
        }
      } else {
        //No skills for stat: options.stat.list[i].name
      }
    }

    //Damage types (Immunities, Resistances, & Vulnerabilities table)
    for (let i = 0; i < options.damageTypes.length; i++) {
      let IRVName;
      if (typeof options.damageTypes[i].abvName !== "undefined") {
        IRVName = options.damageTypes[i].abvName;
      } else {
        IRVName = options.damageTypes[i].name;
      }

      //Table row
      let tr = document.createElement("tr");
      document.getElementById("IRVTableBody").appendChild(tr);
      tr.id = `${IRVName}Tr`;
      tr.className = "columns";

      //Table row entries
      for (let j = 0; j < 4; j++) {
        let td = document.createElement("td");
        document.getElementById(`${IRVName}Tr`).appendChild(td);
        td.id = `${IRVName}Td${j + 1}`;
      }

      //Checkboxes (I, R, V)
      let IRVVector = ["I", "R", "V"];
      for (let k = 0; k < IRVVector.length; k++) {
        let IRVCheckbox = document.createElement("input");
        document
          .getElementById(`${IRVName}Td${k + 1}`)
          .appendChild(IRVCheckbox);
        IRVCheckbox.id = `${IRVName}_${IRVVector[k]}`;
        IRVCheckbox.name = `${IRVName}_${IRVVector[k]}`;
        IRVCheckbox.type = "checkbox";
      }

      //Name
      let IRVNameElement = document.createElement("p");
      document.getElementById(`${IRVName}Td4`).appendChild(IRVNameElement);
      IRVNameElement.innerHTML = `${IRVName.toUpperCase()}`;
    }

    verifyOptionsValidity(optionsLocation);
  }, optionsLocation);
}

//Verify that options file has valid values
function verifyOptionsValidity(optionsLocation) {
  let invalid = false;

  //Version
  if (options.stenographVersion !== stenographVersion) {
    alert(
      `Different version warning!\n\nThe options data used was made on an different version of Stenograph (Current: ${stenographVersion}; Your version: ${options.stenographVersion}). Some automatic math calculations might work incorrectly!`
    );
  }

  if (!invalid) {
    console.log(`Options file(${optionsLocation}) is valid!`);
  } else {
    console.log(
      `Options file(${optionsLocation}) is invalid! Refer to alert(s) that popped up.`
    );
  }

  /* Invalid data alert helper function */
  function invalidOptions(str) {
    alert(
      `Invalid options file! Check your values!\n\nInvalid ${str} value(s)`
    );
    invalid = true;
  }
}
