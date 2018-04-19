// initialize the experiment
exp.init = function() {
    
    // allocate storage room for global and trial data
    this.global_data = {};
    this.trial_data = [];
    
    // record current date and time
    this.global_data.startDate = Date();
    this.global_data.userAgent;
    this.global_data.startTime = Date.now();
    
    // specify view order
    this.views = [introView, 
                  instructionsView,
                  practiceView,
                  beginExpView,
                  mainTrialView,
                  postTestView,
                  thanksView]
    // initialize counter structure (normally you do not change this)
    this.initializeProcedure();
    
    // prepare information about trials (procedure)
    this.trial_info = prepareData();
};

// create and return an object ('data') where the experiment's info is stored
// include a placeholder exp.out in which to store participants' responses
var prepareData = function() {

    // this should ideally be read in from a separate file
    var trials_raw = [
        {question: "How are you today?", option1: "fine", option2: "great", picture: "images/question_mark_01.png"},
        {question: "What is the weather like?", option1: "shiny", option2: "rainbow", picture: "images/question_mark_02.png"}
    ];

    // this should ideally be read in from a separate file
    var practice_trials = [
        {question: "Where is your head?", option1: "here", option2: "there", picture: "images/question_mark_03.jpg"},
        {question: "What's on the bread?", option1: "jam", option2: "ham", picture: "images/question_mark_04.png"},
    ];

    var data = {
        'trials': _.shuffle(trials_raw),  // items in data.trials are shuffled randomly upon initialization 
        'practice_trials': practice_trials, // practice trials occur in the same order for all participants 
        'out': [] // mandatory field to store results in during experimental trials
    };
    
    return data;
};

// submits the data
exp.submit = function() {
    // construct data object for output
    var data = {
        'author': config_deploy.author,
        'experiment_id': config_deploy.experiment_id,
        'description': config_deploy.description,
        'trials': exp.trial_data
    };

    // add more fields depending on the deploy method
    if (config_deploy.is_MTurk) {
        var HITData = getHITData();

        // MTurk expects a key 'assignmentId' for the submission to work, that is why is it not consistent with the snake case that the other keys have
        data['assignmentId'] = HITData['assignmentId'];
        data['workerId'] = HITData['workerId'];
        data['HITId'] = HITData['HITId'];
    } else if (config_deploy.deployMethod === 'Prolific') {
        console.log();
    } else if (config_deploy.deployMethod === 'directLink'){
        console.log();
    } else if (config_deploy.deployMethod === 'debug') {
        console.log();
    } else {
        console.log('no such config_deploy.deployMethod');
    }

    // merge in global data accummulated so far
    // this could be unsafe if 'exp.global_data' contains keys used in 'data'!!
    data = _.merge(exp.global_data, data);

    // parses the url to get thr assignmentId and workerId
    var getHITData = function() {
        var url = window.location.href;
        var qArray = url.split('?');
        qArray = qArray[1].split('&');
        var HITData = {};

        for (var i=0; i<qArray.length; i++) {
            HITData[qArray[i].split('=')[0]] = qArray[i].split('=')[1];
        }

        return HITData;
    };

    // if the experiment is set to live (see config.js liveExperiment)
    // the results are sent to the server
    // if it is set to false
    // the results are displayed on the thanks slide
    if (config_deploy.liveExperiment) {
        console.log('submits');
        submitResults(config_deploy.contact_email, data);
    } else {
        // hides the 'Please do not close the tab.. ' message in debug mode
        $('.warning-message').addClass('nodisplay');
        jQuery('<h3/>', {
            text: 'Debug Mode'
        }).appendTo($('.view'));
        jQuery('<p/>', {
            class: 'debug-results',
            text: JSON.stringify(data)
        }).appendTo($('.view'));
    }
};
