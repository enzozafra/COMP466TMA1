$(document).ready(function() {
  $('select').material_select();
});

var requiredinfo = {};
var tabclicked = "";
var args = {};

function loadrequired(tab) {
  requiredinfo = {};
  args = {};
  $($('form').prop('elements')).each(function(){
    var name = this["name"];
    if (name != '') {
      requiredinfo[this["name"]] = false;
    }
  });
  if (tab == "tdee") {
    listenTDEE();
  }
  else if (tab == "mortgage") {
    listenMort();
  }
  else if (tab == "unitconverter") {
    listenUnit();
  }
}

function verifyInput() {
  if (tabclicked == "unitconverter") {
    // TODO:
  }
  else if (tabclicked == "mortgage") {
    args['purchase'] = parseInt(args['purchase']);
    args['down'] = parseInt(args['down']);
    args['rate'] = parseFloat(args['rate']);
    args['amortization'] = parseInt(args['amortization']);
    if (isNaN(args['purchase']) || isNaN(args['down']) || isNaN(args['rate']) || isNaN(args['amortization']) || !args['freq']) {
      return false;
    }
    return true;
  }
  else if (tabclicked == "tdee") {
    args['age'] = parseInt(args['age']);
    args['weight'] = parseInt(args['weight']);

    if (isNaN(args['age']) || isNaN(args['weight']) || !args['gender'] || !args['height'] || !args['activity']) {
      return false;
    }
    return true;
  }
}

function convertHeight(height) {
  // var pattern = /(.*)ft(.*)in/;
  var pattern = new RegExp('(.*)ft(.*)in');
  var match = pattern.exec(height);
  var ft = parseInt(match[0]);
  var inch = parseInt(match[1]);

  return (ft * 30.48) + (inch * 2.54);
}

function convertWeight(weight) {
  return (weight * 0.453592);
}

function calculate() {
  console.log("calculating " + tabclicked);
  if (tabclicked == "unitconverter") {
    // TODO:
  }
  else if (tabclicked == "mortgage") {
    calculateMortgage();
  }
  else if (tabclicked == "tdee") {
    calculateTDEE();
  }
}

function calculateTDEE() {
  var gender = args['gender'];
  var age = args['age'];
  var weight = args['weight'];
  var height = args['height'];
  var activity = args['activity'];

  var weight = convertWeight(weight);
  var height = convertHeight(height);

  if (gender == "f") {
    var bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
  }
  else if (gender == "m") {
    var bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
  }

  var tdee;
  if (activity == "s") {
    tdee = bmr * 1.2;
  }
  else if (activity == "le") {
    tdee = bmr * 1.375;
  }
  else if (activity == "me") {
    tdee = bmr * 1.55;
  }
  else if (activity == "he") {
    tdee = bmr * 1.725;
  }
  else if (activity == "a") {
    tdee = bmr * 1.9;
  }
  var resultday = document.getElementById("resultday");
  var resultweek = document.getElementById("resultweek");

  resultday.innerHTML = Math.round(tdee).toString() + " per day";
  resultweek.innerHTML = Math.round(tdee * 7).toString() + " per week";
}

function calculateMortgage() {
  var purchaseprice = args['purchase'];
  var down =  args['down'];
  var rate = args['rate'];
  var amortization = args['amortization'];
  var freq = args['freq'];

  var total = purchaseprice - down;

  amortization = amortization * 12;
  var c = (rate / 100) / 12;
  var payment = total * (c * Math.pow((1 + c), amortization));
  payment = payment / (Math.pow((1 + c), amortization) - 1);

  var converted;
  var output;
  if (freq == 'm') {
    converted = payment;
    output = "per month";
  }
  else if (freq == 'bw') {
    converted = payment * 12 / 26;
    output = "bi-weekly";

  }
  else if (freq == 'w') {
    converted = payment * 12 / 52;
    output = "per week";
  }

  converted = converted.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  output = converted.toString() + " " + output;
  var result = document.getElementById("result");
  result.innerHTML = output;
}

function checkCalc(name) {
  var element = document.getElementsByName(name);
  if (element && element[0].value ){
    requiredinfo[name] = true;
    args[name] = element[0].value;
  } else {
    requiredinfo[name] = false;
    args[name] = "";
  }
  checkAllFilled();
}

function checkAllFilled() {
  var keys = Object.keys(requiredinfo);
  for (var i = 0; i < keys.length; i++) {
    if (!requiredinfo[keys[i]]) {
      return;
    }
  }
  if(!verifyInput()) {
    return;
  }
  calculate();
}

$('ul.tabs').on('click', 'a', function(e) {
  var xmlhttp
  try {
    xmlhttp = new window.XMLHttpRequest();
  } catch (e) {
    xmlhttp = false;
  }
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        $('#toolbody').html(xmlhttp.responseText);
        $('select').material_select();
        loadrequired(tabclicked);
      } else {
        document.ajax.dyn="Error code " + xmlhttp.status;
      }
    }
  };
  tabclicked = $(this).attr('href');
  xmlhttp.open("GET", "html/" + tabclicked + ".html", true);
  xmlhttp.send(null);
});

// Set event listeners
function listenTDEE() {
  args['height'] = $("#height").val();
  $("#height").on('change', function() {
    args['height'] = $(this).val();
    checkAllFilled();
  });

  args['activity'] = $("#activity").val();
  $("#activity").on('change', function() {
    args['activity'] = $(this).val();
    checkAllFilled();
  });

  $('.gender label').click(function() {
    var name = $(this).prev().attr('name');
    requiredinfo[name] = true;
    args[name] = $(this).attr('for');
    checkAllFilled();
  });
}

function listenMort() {
  args['freq'] = $("#freq").val();
  $("#freq").on('change', function() {
    args['freq'] = $(this).val();
    checkAllFilled();
  });
}

function listenUnit() {
  args['measuretype'] = $("#measuretype").val();
  $("#measuretype").on('change', function() {
    args['measuretype'] = $(this).val();
    checkAllFilled();
  });

  args['convunit'] = $("#convunit").val();
  $("#convunit").on('change', function() {
    args['convunit'] = $(this).val();
    checkAllFilled();
  });

  args['origunit'] = $("#origunit").val();
  $("#origunit").on('change', function() {
    args['origunit'] = $(this).val();
    checkAllFilled();
  });
}

function clearTDEE() {
  var inputForms = ["age", "weight"];
  for (var i = 0; i < inputForms.length; i++) {
    var elem = document.getElementsByName(inputForms[i]);
    elem[0].value = "";
    requiredinfo[inputForms[i]] = false;
  }
  var resultday = document.getElementById("resultday");
  var resultweek = document.getElementById("resultweek");

  resultday.innerHTML = "";
  resultweek.innerHTML = "";
}

function clearMortgage() {
  var inputForms = ["purchase", "down", "rate", "amortization"];
  for (var i = 0; i < inputForms.length; i++) {
    var elem = document.getElementsByName(inputForms[i]);
    elem[0].value = "";
    requiredinfo[inputForms[i]] = false;
  }

  var result = document.getElementById("result");

  result.innerHTML = "";
}

function clearUnit() {
  var inputForms = ["original"]
  for (var i = 0; i < inputForms.length; i++) {
    var elem = document.getElementsByName(inputForms[i]);
    elem[0].value = "";
    requiredinfo[inputForms[i]] = false;
  }

  var result = document.getElementById("result");

  result.innerHTML = "";
}
