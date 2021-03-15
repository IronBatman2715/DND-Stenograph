// Saving data
function saveData() {
  let charsheet = document.getElementById("charsheet");
  let elementValueObj = new Object();
  for (let i = 0; i < charsheet.length; i++) {
    let desValue;
    if (charsheet[i].type == "text" || charsheet[i].type == "textarea") {
      desValue = charsheet[i].value;
    } else if (charsheet[i].type == "checkbox") {
      desValue = charsheet[i].checked;
    }

    elementValueObj[charsheet[i].name] = desValue;
  }

  jsonText = JSON.stringify(elementValueObj);

  let a = document.createElement("a");
  a.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(jsonText)
  );
  if (!charsheet[0].value) {
    a.setAttribute("download", "stenograph_character.json");
  } else {
    a.setAttribute("download", `stenograph_${charsheet[0].value}.json`);
  }
  a.click();
}

//Prompt use to upload file
function getLoadedData() {
  let loadDataButton = document.getElementsByClassName("loaddata");
  loadDataButton[0].click();
}

//Once file has been uploaded, run loadData
$(document).ready(function () {
  $(".loaddata").change(function () {
    loadData();
  });
});

// Loading data
function loadData() {
  let loadDataButton = document.getElementsByClassName("loaddata");
  let files = loadDataButton[0].files;
  if (files.length !== 1) {
    alert("Submit exactly one .json or .txt!");
    return false;
  } else {
    let fr = new FileReader();

    fr.onload = function (e) {
      let result = JSON.parse(e.target.result);
      let jsonText = JSON.stringify(result, null, 2);

      let dataObj = JSON.parse(jsonText);

      let charsheet = document.getElementById("charsheet");
      for (let i = 0; i < charsheet.length; i++) {
        if (!dataObj[charsheet[i].name] && dataObj[charsheet[i].name] !== 0) {
          //value DNE, do nothing
        } else if (
          charsheet[i].type == "text" ||
          charsheet[i].type == "textarea"
        ) {
          charsheet[i].value = dataObj[charsheet[i].name];
        } else if (charsheet[i].type == "checkbox") {
          charsheet[i].checked = dataObj[charsheet[i].name];
        }
      }
    };

    fr.readAsText(files.item(0));
  }
}
