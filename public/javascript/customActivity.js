'use strict';

var steps = [
    // initialize to the same value as what's set in config.json for consistency
    { key: "step1", label: "step1" },
    { key: "step2", label: "step2" },
    { key: "step3", label: "step3" }
  ];
var currentStep = steps[0].key;

const validateForm = function(cb) {
    console.log('kn6');
    $form = $('.js-settings-form');
console.log('kn7');
    $form.validate({
        submitHandler: function(form) { },
        errorPlacement: function () { },
    });
console.log('kn8');
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
      $("#step1").show();
      $("#step1 input").focus();
      break;
    case "step2":
      $("#step2").show();
      $("#step2 input").focus();
      break;
    case "step3":
      $("#step3").show();
      $("#step3 input").focus();
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

    // validation
    validateForm(function($form) {

    });

}

/**
 * Initialization
 * @param data
 */
function initialize(data) {
    if (data) {
        payload = data;
    }
    const hasInArguments = Boolean(
        payload['arguments'] &&
        payload['arguments'].execute &&
        payload['arguments'].execute.inArguments &&
        payload['arguments'].execute.inArguments.length > 0
    );

    const inArguments = hasInArguments
        ? payload['arguments'].execute.inArguments
        : {};

    $.each(inArguments, function (index, inArgument) {
        $.each(inArgument, function (key, value) {
            const $el = $('#' + key);
            if($el.attr('type') === 'checkbox') {
                $el.prop('checked', value === 'true');
            } else {
                $el.val(value);
            }
        });
    });
    
    validateForm(function($form) {
    });

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
console.log('kn0');
    if($form.valid()) {
console.log('kn0a');
        payload['metaData'].isConfigured = true;

        payload['arguments'].execute.inArguments = [
            {
                "contactKey": "{{Contact.Key}}"
            }
        ];
console.log('kn1');
        $('.js-activity-setting').each(function () {
            const $el = $(this);
            const setting = {
                id: $(this).attr('id'),
                value: $(this).val()
            };
console.log('kn2:'+setting);
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
console.log('kn3');
        connection.trigger('updateActivity', payload);
    }
}
