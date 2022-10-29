
// Service for Comfort Companion
const mysql = require('mysql2');

exports.handler = async(context, event, callback) => {


  const {CurrentTask} = event;
  // Calls functions based on current event/task
  switch(CurrentTask){
    case 'greeting':
      await handleGreeting(context, event, callback);
      break;

    case 'goodbye':
      await handleGoodbye(context, event, callback);
      break;

    case 'fallback':
      await handleFallback(context, event, callback);
      break;

    case 'collect_fallback':
      await handleCollectFallback(context, event, callback);
      break;

    case 'startDiagnosesOther':
      await handleStartDiagnosesOther(context, event, callback);
      break;

    case 'startDiagnosesPRE':
      await handleSelfPreDiagnoses(context, event, callback);
      break;

    case 'start_crisis_diagnoses':
      await handleCrisisDiagnoses(context, event, callback);
      break;

    case 'continue_diagnoses':
      await handleContinueDiagnoses(context, event, callback);
      break;

    case 'get_pre_resource':
      await handlePreGetResource(context, event, callback);
      break;

    case 'grounding_exercise':
      await handleGroundingExercise(context, event, callback);
      break;

    case 'grounding_exercise_neg':
      await handleGetResource(context, event, callback);
      break;

    case 'get_resource':
      await handleGetResource(context, event, callback);
      break;

    case 'get_resource_other':
      await handleGetResourceOther(context, event, callback);
      break;

    case 'start_over':
      await handleGetStartOver(context, event, callback);
      break;

    case 'get_preresource_other':
      await handlegetpreOtherResource(context, event, callback);
      break;

    default :
      await handleFallback(context, event, callback);
      break;
  }
};

//greeting handler
const handleGreeting = async(context, event, callback) => {

    let responseObject = {
		"actions": []
    };
    responseObject.actions.push({'say': 'Hey! Welcome to Comfort Companion. I am here to give you the support that you   deserve.'});
	responseObject.actions.push({'say': 'Keep in mind that I am only a robot and in trial testing. If you need urgent human support, please contact the National Suicide Prevention line (1-800-273-8255), or text HELP to 741741. If you require medical help, please contact 911'});
    responseObject.actions.push({'say': 'For full disclaimer, please click here: http://comfortcompanion.ngrok.io/ '});
	responseObject.actions.push({'say':'Are you looking for resources for yourself or to help someone else?'});
    responseObject.actions.push({'listen': true }
    );

    callback(null, responseObject);
};

//Start "diagnosis" for another person (User selected "resources for someone else")
const handleStartDiagnosesOther = async(context, event, callback) => {
     const Say = `You are a very caring person in looking out for them.`,
          Listen = false,
          Remember = false,
          Tasks = false,
          Collect = {
              'on_complete': {
                  'redirect': 'task://get_preresource_other'
              },
                  'name':`others_diagnoses`,
                  'questions': [
                      {
                          'question':`What is their relationship to you? (Are they your child, student, friend, etc.)`,
                          'name': `Person`,
                          'type': 'Person'
                      },
                      {
                          'question': `What issue are they struggling with the most?`,
                          'name': 'Crisis',
                          'type':'crisis'
                      }

                  ]


          };
          speechOut(Say, Listen, Remember, Collect, Tasks, callback);
};

//Begin diagnosis for self (user selected "resources for myself")
const handleSelfPreDiagnoses = async(context, event, callback) => {
    const Say = `Thank you for reaching out. What issue are you struggling with the most right now?`,
          Listen = true,
          Remember = false,
          Collect = false,
          Tasks = false;

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);
};


//Fires if the crisis identified is high risk (Suicice, abuse, SA)
const handleIntervention = async(context, event, callback) => {
    const Say = `I admire your bravery in sharing this with me. You deserve the best support, and unfortunuately due to me only being a robot, I am unable to uphold the standards of service that you deserve. Please consider reaching out to any of the following hotlines to get connecting with professionals who can get you the help you deserve.

    National Suicide Hotline: 800-273-8255 ||
    Crisis Text Line: Text "HELP" to 741741 ||
    National Sexual Assault Hotline: 1-800-656-4673 ||
    National Domestic Abuse Hotline: 1-800-799-7233 OR text "START" to 88788`,
        Listen = false,
        Remember = false,
        Collect = false,
        Tasks = false;

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);
};

//Initial Crisis recognition. Main use of this function is to intervene in case of high risk and to provide validation to the user
const handleCrisisDiagnoses = (context, event, callback) => {
    var user_crisis = event.Field_Crisis_Value.toLowerCase();

    if (typeof(user_crisis) === 'undefined') {
        handleFallback(context, event, callback);
    };

    //Checks to see if a "person" type was included by the user
    if (typeof(event.Field_Person_Value) !== 'undefined') {
        global.userPerson = event.Field_Person_Value
    } else {
        global.userPerson = 'person';
    };

    if (user_crisis === 'suicide' || user_crisis === 'abuse' || user_crisis === 'sexual assault') {
        handleIntervention(context, event, callback);
    };


    const Say = `I really appreciate you sharing with me. I hear you are struggling with ${user_crisis}, that sounds very difficult to go through. Can I ask you a few more questions so I can give you better suited support?`,
          Listen = true,
          Remember = {
              "userCrisis": user_crisis
          },
          Collect = false,
          Tasks =
           [
            'continue_diagnoses',
            'goodbye'
           ];
    speechOut(Say, Listen, Remember, Collect, Tasks, callback);
};

//Continue Diagnosis
const handleContinueDiagnoses= (context, event, callback) => {
    var memory = JSON.parse(event.Memory);
    var userCrisis = memory.userCrisis;
    //"Base" questions that get asked for all crisis cases
    var questions = [
        {
            'question':'What is your age?',
            'name': `${userCrisis}_age`,
            'type': 'Twilio.NUMBER'
        },
        {
            'question':'Would you prefer to read an online resource, or to connect and talk with other people? (Read or Talk)',
            'name': `${userCrisis}_pref`,
            'type':'userPref'

        }
    ];

    //Asks different questions based on certain crisis
    switch (userCrisis) {
        case 'anxiety':
            questions.unshift(
                {
                    'question': 'Do you often struggle with panic attacks?',
                    'name':`${userCrisis}_PA`,
                    'type': `Twilio.Yes_No`
                }
            );
            break;
        case 'conflicts':
            questions.unshift(
                {
                    'question': `Do you feel the relationship between you and your ${userPerson} is abusive in any way?`,
                    'name': `${userCrisis}_abuse`,
                    'type':'Twilio.Yes_No'
                }
            );
            break;
        case 'break up':
            questions.unshift(
                {
                    'question': `Do you feel the relationship was abusive in any way?`,
                    'name': `${userCrisis}_abuse`,
                    'type':'Twilio.Yes_No'
                }
            );
            break;
        case 'divorce':
            questions.unshift(
                {
                    'question': `Do you feel the relationship was abusive in any way?`,
                    'name': `${userCrisis}_abuse`,
                    'type':'Twilio.Yes_No'

                }
            );
            break;
        case 'panic attack':
            questions.unshift(
                {
                    'question': 'Do you often struggle with panic attacks?',
                    'name':`${userCrisis}_PA`,
                    'type': `Twilio.Yes_No`
                }
            );
            break;

    };

    const Say = false,
          Listen = false,
          Remember = false,
          Tasks = false,
          Collect = {
              'on_complete': {
                  'redirect': 'task://get_pre_resource'
              },
                  'name':`${userCrisis}`,
                  'questions': questions


          };
          speechOut(Say, Listen, Remember, Collect, Tasks, callback);
};

//Saves information from responses to the questions and asks additional questions if needed
const handlePreGetResource = (context, event, callback) => {

    let Memory = JSON.parse(event.Memory);
    var userCrisis = Memory.userCrisis;
    var userAge = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_age`].answer;
    var userPref =  Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_pref`].answer;

    switch (userCrisis) {
        case 'panic attack' :
                const Say = 'Are you interested in going through a short grounding exercise with me to help calm you down?',
                    Listen = true,
                    Remember = false,
                    Collect = false,
                    Tasks = [
                         'grounding_exercise',
                         'grounding_exercise_neg'
                         ];
                speechOut(Say, Listen, Remember, Collect, Tasks, callback);

            break;
        case 'anxiety':
            var questions = [
        {
            'question':'Is there any thing specific in your life that is causing you to feel anxious, and if so, what is it? EX: A big test, school grades, etc.',
            'name': `${userCrisis}_extrainfo`,
            'type': 'reason'
        }
    ]

          var collect = {
              'on_complete': {
                  'redirect': 'task://get_resource'
              },
                  'name':`${userCrisis}_extrainfo`,
                  'questions': questions


          };
          speechOut(false, false, false, collect, false, callback);
          break;
        case 'motivation':
            var questions = [
        {
            'question':'Is your lack of motivation impacting your academic ability in school?',
            'name': `${userCrisis}_extrainfo`,
            'type': 'Twilio.Yes_No'
        }
    ]

          var collect = {
              'on_complete': {
                  'redirect': 'task://get_resource'
              },
                  'name':`${userCrisis}_extrainfo`,
                  'questions': questions


          };
          speechOut(false, false, false, collect, false, callback);
          break;
    };

     const Say = `Just to clarify that I understand correctly, you are ${userAge} years old and you want resources to ${userPref} for ${userCrisis}. Is that correct?` ,
          Listen = true,
          Remember = false,
          Collect = false,
          Tasks = [
              'get_resource',
              'start_over'
          ];

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);
};

//In case we misinterpret any information, user can start over
const handleGetStartOver = async(context, event, callback) => {
     const Say = `I'm sorry about that, thank you for being so patient. Would you like to start over?`,
          Listen = true,
          Remember = false,
          Collect = false,
          Tasks = [
              'startDiagnosesPRE',
              'goodbye'
          ];

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);

};

//Grounding exercises in case the user requests for one (for the panic attack or anxiety crisis)
const handleGroundingExercise = async(context, event, callback) => {
     const Say = 'Here is a short breathing exercise you can follow to help calm yourself down:  bit.ly/breath_ref. Take as much time as you need, you got this! Simply type "done" when you are ready to move on.',
          Listen = true,
          Remember = false,
          Collect = false,
          Tasks = [
              'get_resource'
          ];

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);

};

//Gets all the variables needed to query MYSQL database for resources
const handleGetResource = async(context, event, callback) => {
    let Memory = JSON.parse(event.Memory);
    var userCrisis = Memory.userCrisis;
    var userAge = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_age`].answer;
    var userPref =  Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_pref`].answer.toLowerCase();

    switch (userCrisis) {
        case 'panic attack':
            var userPA = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_PA`].answer.toLowerCase();
            break;
        case 'anxiety' :
            var userPA = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_PA`].answer.toLowerCase();
            var extraInfo = Memory.twilio.collected_data[`${userCrisis}_extrainfo`].answers[`${userCrisis}_extrainfo`].answer.toLowerCase();
            break;
        case 'self-harm':
            var userIntent = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_intent`].answer;
            break;
        case 'conflicts':
            var userAbuse = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_abuse`].answer;
            break;
        case 'break up':
            var userAbuse = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_abuse`].answer;
            break;
        case 'divorce':
            var userAbuse = Memory.twilio.collected_data[`${userCrisis}`].answers[`${userCrisis}_abuse`].answer;
            break;
        case 'motivation':
            var response = Memory.twilio.collected_data[`${userCrisis}_extrainfo`].answers[`${userCrisis}_extrainfo`].answer.toLowerCase();
            if (response === 'yes') {
                var extraInfo = 'school';
            }
    };



   if (userAge >= 20) {
	    var userAge = 'adult';
	} else if (userAge < 20) {
	    var userAge = 'teen';
	}

    switch (userCrisis) {
        case 'panic attack':
            queryResource(context, event, callback, false, userAge, userPref, null, userPA, null);
            break;
        case 'anxiety':
            queryResource(context, event, callback, false, userAge, userPref, null, userPA, extraInfo);
            break;
        case 'conflicts':
            queryResource(context, event, callback, false, userAge, userPref, userAbuse, null, null);
            break;
        case 'break up':
            queryResource(context, event, callback, false, userAge, userPref, userAbuse, null, null);
            break;
        case 'divorce':
            queryResource(context, event, callback, false, null, userPref, userAbuse, null, null);
            break;
        case 'depression':
            queryResource(context, event, callback, false, userAge, userPref, null, null, null);
            break;
        case 'motivation':
            queryResource(context, event, callback, false, userAge, userPref, null, null, extraInfo);
            break;
        default:
            var response = 'Sorry, there was an error in getting your resources. I may not have an appropriate resource in my database at this time. Please try again later, I apologize for the inconvience.'
              speechOut(response, true, false, false, false, callback);
    }

};

//Connects to MSQL database and get resource
const queryResource = async(context, event, callback, fail, userAge, userPref, userAbuse, userPA, extraInfo) => {
    let Memory = JSON.parse(event.Memory);
    var userCrisis = Memory.userCrisis;
    var con = mysql.createConnection({
    host: context.host,
    port: context.port,
    user: context.user,
    password: context.password,
    database: 'mentalres'//Name of database
    });

    con.connect((err)=> {
     if(err)
        {
         return console.error('error:' + err.message);
         }
         console.log("Connected");

    });
    if (fail === false) {
    switch (userCrisis) {
        case 'panic attack':
           var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM anxiety WHERE Age = '${userAge}' AND Pref = '${userPref}'  AND PanicAttack = '${userPA}'`;
            break;
        case 'anxiety':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM anxiety WHERE Age = '${userAge}' AND Pref = '${userPref}' AND PanicAttack = '${userPA}' AND ExtraInfo = '${extraInfo}'`;
            break;
        case 'conflicts':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM conflicts WHERE Age = '${userAge}' AND Pref = '${userPref}'  AND abuse = '${userAbuse}'`;
            break;
        case 'break up':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM breakup WHERE Age = 'adult' AND pref = '${userPref}' AND abuse = '${userAbuse}'`;
            break;
        case 'divorce':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM divorce WHERE Age = 'adult' AND pref = '${userPref}' AND abuse = '${userAbuse}'`;
            break;
        case 'depression':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM depression WHERE Age = '${userAge}' AND pref = '${userPref}'`
            break;
        case 'motivation':
             var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM motivation WHERE Age = '${userAge}' AND pref = '${userPref}' AND extraInfo = '${extraInfo}'`
             break;


    };
}

else if (fail === true) {
    switch (userCrisis) {
        case 'panic attack':
           var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM anxiety WHERE Age = '${userAge}' AND Pref = '${userPref}'  AND PanicAttack = '${userPA}'`;
            break;
        case 'anxiety':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM anxiety WHERE Age = '${userAge}' AND Pref = '${userPref}' AND PanicAttack = '${userPA}'`;
            break;
        case 'conflicts':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM conflicts WHERE Age = '${userAge}' AND Pref = '${userPref}'  AND abuse = '${userAbuse}'`;
            break;
        case 'break up':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM breakup WHERE Age = 'adult' AND pref = '${userPref}' AND abuse = '${userAbuse}'`;
            break;
        case 'divorce':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM divorce WHERE Age = 'adult' AND pref = '${userPref}' AND abuse = '${userAbuse}'`;
            break;
        case 'depression':
            var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM depression WHERE Age = '${userAge}' AND pref = '${userPref}'`
            break;
        case 'motivation':
             var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM motivation WHERE Age = '${userAge}' AND pref = '${userPref}'`
             break;
    };
}

    con.connect((err) => {
        if (err) throw err;
        con.query(queryStatement, (err, result, fields) => {
         if (err) throw err;
         if (!result.length && fail === false) {
             queryResource(context, event, callback, true, userAge, userPref, userAbuse, userPA, extraInfo);
         } else if (!result.length && fail === true) {
             var response = `Sorry, but I currently don't have any resources available for you. Please check back again at another time.`
             speechOut(response, true, false, false, false, callback);
         } else if (result.length) {
             var resource = JSON.parse(JSON.stringify(result[0]));
             var response = `Here are your resources! ${resource.r1d}: ${resource.Resource} || ${resource.r2d}: ${resource.Resource2}`
             response = response.replace('|| null: null','');
             speechOut(response, true, false, false, false, callback);
         };
     });

    });

};

//Gets all the variables needed to query MYSQL database for resources (resources for other)
const handlegetpreOtherResource = async(context, event, callback) => {
    let Memory = JSON.parse(event.Memory);
    var userCrisis = Memory.twilio.collected_data.others_diagnoses.answers.Crisis.answer.toLowerCase();
    var userRelationship =  Memory.twilio.collected_data.others_diagnoses.answers.Person.answer.toLowerCase();
    var questions = [];


    switch (userCrisis) {
        case 'addiction':
            questions.unshift(
                {
                    'question': 'What type of addiction are they struggling with? (Alcohol, drugs, etc.)',
                    'name':`info`
                }
            );

         break;
    }
    if (questions.length === 0) {
        queryOtherRes(context, event, callback, userRelationship, userCrisis, false);
    }
    else if (questions.length > 0) {
      const Say = false,
          Listen = false,
          Remember = false,
          Tasks = false,
          Collect = {
              'on_complete': {
                  'redirect': 'task://get_resource_other'
              },
                  'name':`otherAddInfo`,
                  'questions': questions


          };
       speechOut(Say, Listen, Remember, Collect, Tasks, callback);

    }

};

const handleGetResourceOther = async(context, event, callback) => {
    let Memory = JSON.parse(event.Memory);
    var userRelationship =  Memory.twilio.collected_data.others_diagnoses.answers.Person.answer.toLowerCase();
    var userCrisis = Memory.twilio.collected_data.others_diagnoses.answers.Crisis.answer.toLowerCase();
    queryOtherRes(context, event, callback, userRelationship, userCrisis, false);


};

const queryOtherRes = async(context, event, callback, userRelationship, userCrisis, fail) => {

    let Memory = JSON.parse(event.Memory);

    var con = mysql.createConnection({
    host: context.host,
    port: context.port,
    user: context.user,
    password: context.password,
    database: 'mentalres'
    });

    con.connect((err)=> {
     if(err)
        {
         return console.error('error:' + err.message);
         }
         console.log("Connected");

    });

    var extraInfo = 'none';
    switch (userCrisis) {
        case 'addiction':
           var extraInfo = Memory.twilio.collected_data.otherAddInfo.answers.info.answer.toLowerCase();
        break;

    }

    if (fail === 'true1') {
        var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM otherres WHERE relationship = 'any' AND issue = '${userCrisis}' AND extrainfo = '${extraInfo}'`;
    }
    else if (fail === 'true2') {
        `SELECT Resource, Resource2, r1d, r2d FROM otherres WHERE relationship = '${userRelationship}' AND issue = '${userCrisis}'`;
    }
     else if (fail === true) {
        var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM otherres WHERE relationship = 'any' AND issue = '${userCrisis}'`;
    }
     else if (fail === false) {
        var queryStatement = `SELECT Resource, Resource2, r1d, r2d FROM otherres WHERE relationship = '${userRelationship}' AND issue = '${userCrisis}' AND extrainfo = '${extraInfo}'`;
    }


   con.connect((err) => {
        if (err) throw err;
        con.query(queryStatement, (err, result, fields) => {
         if (err) throw err;
         if (!result.length && fail === true) {
              var response = 'Sorry, there was an error in getting your resources. I may not have an appropriate resource in my database at this time. Please try again later, I apologize for the inconvience.'
              speechOut(response, true, false, false, false, callback);

         } else if (!result.length && fail === false) {
             queryOtherRes(context, event, callback, userRelationship, userCrisis,'true1');
         } else if (!result.length && fail === 'true1') {
             queryOtherRes(context, event, callback, userRelationship, userCrisis, 'true2');
         } else if (!result.length && fail === 'true2') {
             queryOtherRes(context, event, callback, userRelationship, userCrisis, true);
         } else if (result.length) {
             var resource = JSON.parse(JSON.stringify(result[0]));
             var response = `Here are your resources! ${resource.r1d}: ${resource.Resource} || ${resource.r2d}: ${resource.Resource2}`
             response = response.replace('|| null: null','');
             speechOut(response, true, false, false, false, callback);
         };
     });

    });
};

//Goodbye handler
const handleGoodbye = async(context, event, callback) => {


    const Say = 'Thank you for reaching out. We are here for you 24/7. Take care.',
          Listen = false,
          Remember = false,
          Collect = false,
          Tasks = false;

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);

};


//Fallback handler
const handleFallback = async(context, event, callback) => {
    var Memory = JSON.parse(event.Memory);
    const Say = `I'm sorry, I didn't quite get that. Please say that again.`,
          Listen = true,
          Remember = false,
          Collect = false,
          Tasks = false;

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);

};

//collect fallback handler
const handleCollectFallback = async(context, event, callback) => {
    const Say = `Looks like you are having some trouble. Apologies for that. Let's start again, how can I help you      today?`,
          Listen = true,
          Remember = false,
          Collect = false,
          Tasks = false;

    speechOut(Say, Listen, Remember, Collect, Tasks, callback);

};
  /**
 * speech-out function
 * @Say {string}             // message to speak out
 * @Listen {boolean}         // keep session true or false
 * @Remember {object}        // save data in remember object
 * @Collect {object}
 * @callback {function}      // return twilio function response
 * */
const speechOut = (Say, Listen, Remember, Collect, Tasks, callback) => {

    let responseObject = {
		"actions": []
    };

    if(Say)
        responseObject.actions.push(
            {
				"say": Say

			}
        );

    if(Listen)
    {
        if(Tasks)
            responseObject.actions.push(
                {
                    "listen": {
                        "tasks" : Tasks
                    }
                }
            );
        else
            responseObject.actions.push(
                {
                    "listen": true
                }
            );
    }

    if(Remember)
        responseObject.actions.push(
            {
                "remember" : Remember
            }
        )

    if(Collect)
        responseObject.actions.push(
            {
                "collect" : Collect
            }
        );

    // return twilio function response
    callback(null, responseObject);
};
