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
        rules: {
            Text: {
                required: true
            },
            lastName: {
                required: true
            }
        },
        messages: {
            Text: {
                required: "The Text is a required / mandatory field"
            },
            lastName: {
                required: "The Last Name is a required / mandatory field"
            }
        }
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
    if ($form.valid()) {
      connection.trigger("nextStep");
    } else {
      connection.trigger('ready');
    }
  }
}

function onClickedBack() {
    if ($form.valid()) {
      connection.trigger("prevStep");
    } else {
      connection.trigger("ready");   
    }
}

function onGotoStep(step) {
  if ($form.valid()) {
    showStep(step);
  }
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
    //console.log(endpoints);
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
            },
            {
                "emailAddress": "{{InteractionDefaults.Email}}"
            },
            {
                "EventEmailAddress:": "{{Event.APIEvent-245eb19a-17c8-4114-d43a-c52ef3fa3306.Data.EmailAddress}}"
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
