'use strict';

var steps = [
    // initialize to the same value as what's set in config.json for consistency
    { key: "step1", label: "step1" },
    { key: "step2", label: "step2" },
    { key: "step3", label: "step3" }
  ];
var currentStep = steps[0].key;

const validateForm = function(cb) {
    $form = $('.js-settings-form');

    $form.validate({
        submitHandler: function(form) { },
        errorPlacement: function () { },
    });

    cb($form);
};

const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
let $form;
$(window).ready(onRender);

connection.on('initActivity', initialize);
connection.on('requestedTokens', onGetTokens);
connection.on('requestedEndpoints', onGetEndpoints);

//connection.on('clickedNext', save);
connection.on('clickedNext', onClickedNext);
connection.on("clickedBack", onClickedBack);
connection.on("gotoStep", onGotoStep);


function showStep(step, stepIndex) {
  if (stepIndex && !step) {
    step = steps[stepIndex - 1];
  }

  currentStep = step;
  $(".step").hide();

  switch (currentStep.key) {
    case "step1":
//      $("#step1").show();
      break;
    case "step2":
//      $("#step2").show();
      break;
    case "step3":
//      $("#step3").show();
      break;
  }
}

function onClickedNext() {
  if (currentStep.key === "step3") {
    save();
  } else {
    connection.trigger("nextStep");
  }
}

function onClickedBack() {
  connection.trigger("prevStep");
}

function onGotoStep(step) {
  showStep(step);
  connection.trigger("ready");
}

function onRender() {
    connection.trigger('ready');
    connection.trigger('requestTokens');
    connection.trigger('requestEndpoints');

}

/**
 * Initialization
 * @param data
 */
function initialize(data) {

}

/**
 *
 *
 * @param {*} tokens
 */
function onGetTokens(tokens) {
    authTokens = tokens;
}

/**
 *
 *
 * @param {*} endpoints
 */
function onGetEndpoints(endpoints) {
    console.log(endpoints);
}

/**
 * Save settings
 */
function save() {
    if($form.valid()) {
        payload['metaData'].isConfigured = true;

        payload['arguments'].execute.inArguments = [
            {
                "contactKey": "{{Contact.Key}}"
            }
        ];

        $('.js-activity-setting').each(function () {
            const $el = $(this);
            const setting = {
                id: $(this).attr('id'),
                value: $(this).val()
            };

            $.each(payload['arguments'].execute.inArguments, function(index, value) {
                if($el.attr('type') === 'checkbox') {
                    if($el.is(":checked")) {
                        value[setting.id] = setting.value;
                    } else {
                        value[setting.id] = 'false';
                    }
                } else {
                    value[setting.id] = setting.value;
                }
            })
        });

        connection.trigger('updateActivity', payload);
    }
}
